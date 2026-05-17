import { TILE } from '../main.js';
import { loadLevel } from '../level/TileLevel.js';
import { Player } from '../character/Player.js';
import { executeProgram, DIRS } from '../program/ProgramExecutor.js';

export const STEP_MS = 160;

/**
 * Gameplay scene driven by the program-queue d-pad.
 * Subclasses must set `this.levelKey` in their constructor, and may override
 * `decorate()` to drop pickups/props on top of the tilemap. All tile rendering
 * and collision data come from the level JSON via `loadLevel`.
 */
export class TileLevelScene extends Phaser.Scene {
  init(data) {
    if (data?.levelKey) this.levelKey = data.levelKey;
    this.returnScreen = data?.returnScreen || 'main';
  }

  create() {
    const level = loadLevel(this, this.levelKey);
    this.cols = level.cols;
    this.rows = level.rows;
    this.solid = level.solid;
    this.levelMap = level.map;

    // Domain model for player state & collision logic
    this.playerModel = new Player(level.cols, level.rows, level.solid, level.spawn.tx, level.spawn.ty);

    this.pickups = new Map();
    this.collected = 0;

    this.loadObjects(level.objects);
    this.decorate();

    this.player = this.add.sprite(...this.tileCenter(this.playerModel.tx, this.playerModel.ty), 'character_base', 0).setDepth(40);
    this.player.anims.play(`idle_${this.playerModel.facing}`);

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

    this.grid = this.add.graphics().setDepth(100);
    this.drawGrid();
    this.gridVisible = true;
    this.debugText = this.add.text(4, 4, '', {
      fontFamily: 'monospace', fontSize: '8px', color: '#8ef', backgroundColor: '#000a',
    }).setDepth(101).setPadding(2, 1, 2, 1);
    this.fpsVisible = true;
    this.crosshair = this.add.rectangle(0, 0, TILE, TILE).setStrokeStyle(1, 0xffcc33, 0.8).setOrigin(0).setDepth(99);

    this.keys.G.on('down', () => { this.gridVisible = !this.gridVisible; this.grid.setVisible(this.gridVisible); });
    this.keys.F.on('down', () => { this.fpsVisible = !this.fpsVisible; this.debugText.setVisible(this.fpsVisible); });
  }

  /** Subclass hook — pickups, props, non-tilemap decor. */
  decorate() { }

  resetPlayer() {
    this.playerModel.reset();
    const [x, y] = this.tileCenter(this.playerModel.tx, this.playerModel.ty);
    this.player.setPosition(x, y);
    this.player.anims.play(`idle_${this.playerModel.facing}`, true);
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
    if (!force && this.solid[ty]?.[tx]) return;
    const [cx, cy] = this.tileCenter(tx, ty);
    const s = this.add.sprite(cx, cy, textureKey, frame).setDepth(50);
    this.tweens.add({ targets: s, y: cy - 2, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.pickups.set(`${tx},${ty}`, s);
  }

  tileCenter(tx, ty) { return [tx * TILE + TILE / 2, ty * TILE + TILE / 2]; }

  step(dir) {
    return new Promise(resolve => {
      const moveResult = this.playerModel.tryMove(dir);

      if (!moveResult.success) {
        this.player.anims.play(`idle_${moveResult.facing}`, true);
        this.time.delayedCall(STEP_MS, resolve);
        return;
      }

      const [x, y] = this.tileCenter(moveResult.tx, moveResult.ty);
      this.player.anims.play(`walk_${moveResult.facing}`, true);
      this.tweens.add({
        targets: this.player, x, y,
        duration: STEP_MS, ease: 'Linear',
        onComplete: () => { this.checkPickup(moveResult.tx, moveResult.ty); resolve(); },
      });
    });
  }

  _baseFrameForDir(dir) {
    return Player.getBaseFrameForDir(dir);
  }

  _idleFrameForDir(dir) {
    return Player.getIdleFrameForDir(dir);
  }

  _jumpFramesForDir(dir) {
    return Player.getJumpFramesForDir(dir);
  }

  jumpInPlace() {
    return this._jumpTween(this.playerModel.facing, this.playerModel.tx, this.playerModel.ty, this.playerModel.tx, this.playerModel.ty);
  }

  jumpDir(dir) {
    const jumpResult = this.playerModel.tryJump(dir);
    const opts = jumpResult.success ? { pickupTx: jumpResult.toTx, pickupTy: jumpResult.toTy } : null;
    return this._jumpTween(
      jumpResult.facing,
      jumpResult.fromTx,
      jumpResult.fromTy,
      jumpResult.toTx,
      jumpResult.toTy,
      opts
    );
  }

  _jumpTween(dir, fromTx, fromTy, toTx, toTy, opts = null) {
    return new Promise(resolve => {
      const [startX, startY] = this.tileCenter(fromTx, fromTy);
      const [endX, endY] = this.tileCenter(toTx, toTy);
      this.player.anims.stop();
      const [f1, f2] = this._jumpFramesForDir(dir);
      this.player.setFrame(f1);
      this.time.delayedCall(Math.floor(STEP_MS / 2), () => {
        if (!this.player) return;
        this.player.setFrame(f2);
      });

      const jumpHeight = 10;
      const state = { t: 0 };
      this.tweens.add({
        targets: state,
        t: 1,
        duration: STEP_MS,
        ease: 'Linear',
        onUpdate: () => {
          const t = state.t;
          this.player.x = startX + (endX - startX) * t;
          this.player.y = startY + (endY - startY) * t - Math.sin(Math.PI * t) * jumpHeight;
        },
        onComplete: () => {
          this.player.x = endX;
          this.player.y = endY;
          if (opts?.pickupTx !== undefined) this.checkPickup(opts.pickupTx, opts.pickupTy);
          this.player.anims.stop();
          this.player.setFrame(this._idleFrameForDir(dir));
          resolve();
        },
      });
    });
  }

  async runProgram(moves) {
    const context = {
      step: (dir) => this.step(dir),
      jumpInPlace: () => this.jumpInPlace(),
      jumpDir: (dir) => this.jumpDir(dir),
      onComplete: () => {
        this.player.anims.play(`idle_${this.playerModel.facing}`, true);
      }
    };

    await executeProgram(moves, context, window.__GYM);
  }

  checkPickup(tx, ty) {
    const key = `${tx},${ty}`;
    const s = this.pickups.get(key);
    if (!s) return;
    this.pickups.delete(key);
    this.tweens.killTweensOf(s);

    this.tweens.add({
      targets: s, y: s.y - 14, scale: 1.8, alpha: 0,
      duration: 380, ease: 'Cubic.easeOut',
      onComplete: () => s.destroy(),
    });
    const ring = this.add.circle(s.x, s.y, 4, 0xffffff, 0).setStrokeStyle(2, 0xffee88).setDepth(60);
    this.tweens.add({
      targets: ring, scale: 3, alpha: { from: 1, to: 0 },
      duration: 380, ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy(),
    });
    const txt = this.add.text(s.x, s.y - 6, '+1', {
      fontFamily: 'monospace', fontSize: '9px', color: '#ffee88', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(61);
    this.tweens.add({
      targets: txt, y: txt.y - 16, alpha: 0,
      duration: 500, ease: 'Cubic.easeOut',
      onComplete: () => txt.destroy(),
    });

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
