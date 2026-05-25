import { TILE, STEP_MS } from '../../src/config/game.js';
import { Level } from '../../src/domain/Level.js';
import { Player } from '../../src/domain/Player.js';
import { PlayerView } from '../../src/engine/entities/PlayerView.js';
import { PickupView } from '../../src/engine/entities/PickupView.js';
import { executeProgram } from '../../src/engine/program/ProgramExecutor.js';

let game = null;

class DemoScene extends Phaser.Scene {
  constructor() {
    super('Demo');
  }

  preload() {
    this.load.json('level_main', '../../levels/main.json');
    
    // Load needed tilesets
    const base = '../../assets/SproutLands-Sprites/Tilesets';
    this.load.image('grass', `${base}/Grass.png`);
    this.load.image('fences', `${base}/Fences.png`);
    this.load.image('dirt', `${base}/Tilled_Dirt.png`);
    this.load.image('hills', `${base}/Hills.png`);
    this.load.image('water', `${base}/Water.png`);

    // Load sprites
    this.load.spritesheet('character_base', '../../assets/SproutLands-Sprites/Characters/Basic Charakter Spritesheet.png', { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('plants', '../../assets/SproutLands-Sprites/Objects/Basic Plants.png', { frameWidth: 16, frameHeight: 16 });

    // Load sounds
    this.load.audio('squick', '../../assets/SproutLands-SorrySprites/Audio/squick_1.wav');
    this.load.audio('blup', '../../assets/SproutLands-SorrySprites/Audio/blup_2.wav');
  }

  create() {
    this.createAnimations();

    const lvlData = this.cache.json.get('level_main');
    const cols = lvlData.cols;
    const rows = lvlData.rows;

    // Create minimal tilemap manually to avoid dependencies on BootScene/TileRegistry
    const map = this.make.tilemap({ tileWidth: TILE, tileHeight: TILE, width: cols, height: rows });
    
    // According to main.json, tilesets are: "grass", "fences", "dirt", "hills", "water"
    // GID mappings from TileRegistry: 
    // grass: 1, fences: 100, dirt: 200, hills: 300, water: 400
    const tsGrass = map.addTilesetImage('grass', 'grass', 16, 16, 0, 0, 1);
    const tsFences = map.addTilesetImage('fences', 'fences', 16, 16, 0, 0, 100);
    const tsDirt = map.addTilesetImage('dirt', 'dirt', 16, 16, 0, 0, 200);
    const tsHills = map.addTilesetImage('hills', 'hills', 16, 16, 0, 0, 300);
    const tsWater = map.addTilesetImage('water', 'water', 16, 16, 0, 0, 400);

    const tilesets = [tsGrass, tsFences, tsDirt, tsHills, tsWater].filter(t => t != null);

    const floorLayer = map.createBlankLayer('floor', tilesets, 0, 0, cols, rows).setDepth(0);
    const wallsLayer = map.createBlankLayer('walls', tilesets, 0, 0, cols, rows).setDepth(20);

    const floorData = lvlData.layers.floor;
    const wallsData = lvlData.layers.walls;

    // The data might be compressed/RLE or flat. Assuming flat array as per LevelLoader format.
    // Actually, expandLayer handles RLE if used. Let's just use it directly assuming flat, or implement simple expansion.
    // Wait, the main.json has a flat array of 192 length for 16x12.
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const idx = y * cols + x;
        const f = floorData[idx];
        const w = wallsData[idx];
        if (f) floorLayer.putTileAt(f, x, y);
        if (w) wallsLayer.putTileAt(w, x, y);
      }
    }

    const solid = [];
    for (let y = 0; y < rows; y++) {
      const row = [];
      for (let x = 0; x < cols; x++) row.push(wallsData[y * cols + x] !== 0);
      solid.push(row);
    }

    const spawn = lvlData.spawn || { tx: 8, ty: 6 };
    
    // Domain model
    this.playerModel = new Player(cols, rows, solid, spawn.tx, spawn.ty);
    // Visual
    this.playerView = new PlayerView(this, this.playerModel);
    
    this.pickups = new Map();
    this.collected = 0;

    // Hardcode pickups for MainScene
    this.addPickup(2, 1, 5);
    this.addPickup(8, 1, 11);
    this.addPickup(13, 1, 5);
    this.addPickup(6, 5, 11);
    this.addPickup(2, 9, 11);
    this.addPickup(13, 9, 5);

    // Auto-start the program after 1 second
    this.time.delayedCall(1000, () => {
      this.runProgram([
        'up', 'up', 'up', 'up', 'left', 'left', 'left', 'left', 'left', 'left', 
        'right', 'right', 'right', 'right', 'right', 'right',
        'right', 'right', 'up', 'up', 'up', 'up', 'jump_right'
      ]);
    });
  }

  createAnimations() {
    const walk = (key, frames) => this.anims.create({
      key,
      frames: this.anims.generateFrameNumbers('character_base', { frames }),
      frameRate: 8, repeat: -1,
    });
    walk('walk_down',  [0, 1, 2, 3]);
    walk('walk_up',    [4, 5, 6, 7]);
    walk('walk_left',  [8, 9, 10, 11]);
    walk('walk_right', [12, 13, 14, 15]);

    const idle = (key, frame) => this.anims.create({
      key, frames: [{ key: 'character_base', frame }],
    });
    idle('idle_down', 0);
    idle('idle_up', 4);
    idle('idle_left', 8);
    idle('idle_right', 12);
    
    // Plants animation
    this.anims.create({
      key: 'anim_pickup',
      frames: this.anims.generateFrameNumbers('plants', { frames: [5] }), // Using frame 5 as base
      frameRate: 4, repeat: -1
    });
  }

  addPickup(tx, ty, frame) {
    const pickup = new PickupView(this, tx, ty, frame, 'plants', true);
    this.pickups.set(`${tx},${ty}`, pickup);
  }

  async step(dir) {
    const moveResult = this.playerModel.tryMove(dir);
    if (!moveResult.success) {
      this.playerView.playIdle(moveResult.facing);
      await new Promise(resolve => this.time.delayedCall(STEP_MS, resolve));
      return;
    }
    this.sound.play('squick', { volume: 0.3 });
    await this.playerView.moveTo(moveResult.tx, moveResult.ty);
    this.checkPickup(moveResult.tx, moveResult.ty);
  }

  async jumpInPlace() {
    this.sound.play('squick', { volume: 0.3 });
    await this.playerView.jumpTo(
      this.playerModel.tx, this.playerModel.ty,
      this.playerModel.tx, this.playerModel.ty
    );
  }

  async jumpDir(dir) {
    const jumpResult = this.playerModel.tryJump(dir);
    this.sound.play('squick', { volume: 0.3 });
    await this.playerView.jumpTo(
      jumpResult.fromTx, jumpResult.fromTy,
      jumpResult.toTx, jumpResult.toTy
    );
    if (jumpResult.success) {
      this.checkPickup(jumpResult.toTx, jumpResult.toTy);
    }
  }

  async runProgram(moves) {
    const context = {
      step: (dir) => this.step(dir),
      jumpInPlace: () => this.jumpInPlace(),
      jumpDir: (dir) => this.jumpDir(dir),
      onComplete: () => {
        this.playerView.playIdle(this.playerModel.facing);
      }
    };
    await executeProgram(moves, context, {});
  }

  checkPickup(tx, ty) {
    const key = `${tx},${ty}`;
    const pickup = this.pickups.get(key);
    if (!pickup) return;
    this.pickups.delete(key);
    pickup.collect();
    this.sound.play('blup', { volume: 0.4 });
    this.collected++;
  }
}

export function startDemo(containerId) {
  if (game) {
    game.destroy(true);
  }
  
  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: containerId,
    width: 256,
    height: 192,
    zoom: 3,
    pixelArt: true,
    roundPixels: true,
    backgroundColor: '#12161d',
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: [DemoScene]
  });
}

export function stopDemo() {
  if (game) {
    game.destroy(true);
    game = null;
  }
}
