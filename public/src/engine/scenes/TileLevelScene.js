import { TILE, STEP_MS } from '../../config/game.js';
import { loadLevel } from '../../engine/level/TileLevelLoader.js';
import { createWeather, destroyWeather } from '../../engine/level/WeatherSystem.js';
import { Player } from '../../domain/Player.js';
import { executeProgram } from '../../engine/program/ProgramExecutor.js';
import { PlayerView } from '../../engine/entities/PlayerView.js';
import { PickupView } from '../../engine/entities/PickupView.js';

/**
 * Gameplay scene driven by the program-queue d-pad.
 * Subclasses must set `this.levelKey` in their constructor, and may override
 * `decorate()` to drop pickups/props on top of the tilemap.
 */
export class TileLevelScene extends Phaser.Scene {
  init(data) {
    if (data?.levelKey) this.levelKey = data.levelKey;
    this.returnScreen = data?.returnScreen || 'main';
  }

  create() {
    const levelData = loadLevel(this, this.levelKey);
    this.level = levelData.level;
    this.cols = this.level.cols;
    this.rows = this.level.rows;
    this.levelMap = levelData.map;

    // Domain model for player state & collision logic
    this.playerModel = new Player(
      this.level.cols, this.level.rows, this.level.solid,
      this.level.spawn.tx, this.level.spawn.ty
    );

    // Visual player
    this.playerView = new PlayerView(this, this.playerModel);

    this.pickups = new Map();
    this.collected = 0;

    this.loadObjects(this.level.objects);
    this.decorate();

    if (this.level.weather && Object.values(this.level.weather).some(v => v > 0)) {
      createWeather(this, this.level.weather);
    }

    const bus = window.__GYM;
    if (bus) {
      bus.onRun = (moves) => this.runProgram(moves);
      bus.onRestart = () => this.resetPlayer();
    }
    window.__setPanels?.(true);
    if (this.missionText) {
      window.__setMission?.(this.missionText);
    } else {
      window.__setMission?.(null);
    }

    this.events.once('shutdown', () => {
      destroyWeather(this);
      window.__setPanels?.(false);
      window.__setMission?.(null);
      window.__setMission?.(null);
      if (window.__GYM) { window.__GYM.onRun = null; window.__GYM.onRestart = null; }
    });

    if (this.welcomeMessage) {
      window.__showDialog?.({ message: this.welcomeMessage });
    }

    this.keys = this.input.keyboard.addKeys({
      G: Phaser.Input.Keyboard.KeyCodes.G,
      F: Phaser.Input.Keyboard.KeyCodes.F,
      ESC: Phaser.Input.Keyboard.KeyCodes.ESC,
    });
    this.keys.ESC.on('down', () => this.scene.start('Menu', { screen: this.returnScreen }));

    this.grid = this.add.graphics().setDepth(100).setScrollFactor(0);
    this.drawGrid();
    this.gridVisible = true;
    this.debugText = this.add.text(4, 4, '', {
      fontFamily: 'monospace', fontSize: '8px', color: '#8ef', backgroundColor: '#000a',
    }).setDepth(101).setPadding(2, 1, 2, 1).setScrollFactor(0);
    this.fpsVisible = true;
    this.crosshair = this.add.rectangle(0, 0, TILE, TILE).setStrokeStyle(1, 0xffcc33, 0.8).setOrigin(0).setDepth(99).setScrollFactor(0);

    this.keys.G.on('down', () => { this.gridVisible = !this.gridVisible; this.grid.setVisible(this.gridVisible); });
    this.keys.F.on('down', () => { this.fpsVisible = !this.fpsVisible; this.debugText.setVisible(this.fpsVisible); });
  }

  /** Subclass hook — pickups, props, non-tilemap decor. */
  decorate() { }

  resetPlayer() {
    this.playerModel.reset();
    this.playerView.setPosition(this.playerModel.tx, this.playerModel.ty);
    this.playerView.playIdle(this.playerModel.facing);
  }

  loadObjects(objects) {
    for (const obj of objects) {
      if (obj.type === 'pickup') {
        this.addPickup(obj.tx, obj.ty, obj.frame, obj.key, true);
      } else {
        const [cx, cy] = this.tileCenter(obj.tx, obj.ty);
        this.add.sprite(cx, cy, obj.key, obj.frame).setDepth(10);
      }
    }
  }

  addPickup(tx, ty, frame, textureKey = 'plants', force = false) {
    if (!force && this.level.isSolid(tx, ty)) return;
    const pickup = new PickupView(this, tx, ty, frame, textureKey);
    this.pickups.set(`${tx},${ty}`, pickup);
  }

  tileCenter(tx, ty) { return [tx * TILE + TILE / 2, ty * TILE + TILE / 2]; }

  async step(dir) {
    const moveResult = this.playerModel.tryMove(dir);

    if (!moveResult.success) {
      this.playerView.playIdle(moveResult.facing);
      await new Promise(resolve => this.time.delayedCall(STEP_MS, resolve));
      return;
    }

    await this.playerView.moveTo(moveResult.tx, moveResult.ty);
    this.checkPickup(moveResult.tx, moveResult.ty);
  }

  async jumpInPlace() {
    await this.playerView.jumpTo(
      this.playerModel.tx, this.playerModel.ty,
      this.playerModel.tx, this.playerModel.ty
    );
  }

  async jumpDir(dir) {
    const jumpResult = this.playerModel.tryJump(dir);
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

    await executeProgram(moves, context, window.__GYM);
  }

  checkPickup(tx, ty) {
    const key = `${tx},${ty}`;
    const pickup = this.pickups.get(key);
    if (!pickup) return;
    this.pickups.delete(key);
    pickup.collect();
    this.collected++;
  }

  drawGrid() {
    this.grid.clear();
    this.grid.lineStyle(1, 0x000000, 0.18);
    for (let x = 0; x <= this.cols; x++) this.grid.lineBetween(x * TILE, 0, x * TILE, this.rows * TILE);
    for (let y = 0; y <= this.rows; y++) this.grid.lineBetween(0, y * TILE, this.cols * TILE, y * TILE);
  }

  update() {
    this.crosshair.setPosition(this.playerModel.tx * TILE, this.playerModel.ty * TILE);
    if (this.fpsVisible) {
      const fps = this.game.loop.actualFps.toFixed(0);
      this.debugText.setText(
        `fps ${fps}  tile ${this.playerModel.tx},${this.playerModel.ty}  face ${this.playerModel.facing}  picked ${this.collected}/${this.collected + this.pickups.size}`
      );
    }
  }
}
