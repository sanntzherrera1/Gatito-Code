import { TILE, STEP_MS } from '../../config/game.js';
import { loadLevel } from '../../engine/level/TileLevelLoader.js';
import { createWeather, destroyWeather } from '../../engine/level/WeatherSystem.js';
import { Player } from '../../domain/Player.js';
import { executeProgram } from '../../engine/program/ProgramExecutor.js';
import { PlayerView } from '../../engine/entities/PlayerView.js';
import { PickupView } from '../../engine/entities/PickupView.js';
import { WorldObjectView } from '../../engine/entities/WorldObjectView.js';
import { getAllLevels, markLevelCompleted } from '../../services/Storage.js';

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
      bus.onRestart = () => this.resetLevel();
    }
    window.__setPanels?.(true);
    if (this.missionText) {
      window.__setMission?.(this.missionText);
    } else {
      window.__setMission?.(null);
    }

    const onDocEsc = (e) => {
      if (e.key !== 'Escape' && e.key !== 'Esc') return;
      const tag = (e.target?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) return;
      this.exitToMenu();
    };
    document.addEventListener('keydown', onDocEsc);

    this.events.once('shutdown', () => {
      destroyWeather(this);
      window.__setPanels?.(false);
      window.__setMission?.(null);
      document.removeEventListener('keydown', onDocEsc);
      if (window.__GYM) { window.__GYM.onRun = null; window.__GYM.onRestart = null; }
      this._exiting = false;
    });

    if (this.welcomeMessage) {
      window.__showDialog?.({ message: this.welcomeMessage });
    }

    this.keys = this.input.keyboard.addKeys({
      G: Phaser.Input.Keyboard.KeyCodes.G,
      F: Phaser.Input.Keyboard.KeyCodes.F,
      ESC: Phaser.Input.Keyboard.KeyCodes.ESC,
    });
    this.keys.ESC.on('down', () => this.exitToMenu());

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

  exitToMenu(screen) {
    if (this._exiting) return;
    this._exiting = true;
    const target = screen ?? this.returnScreen;
    window.__setPanels?.(false);
    window.__setMission?.(null);
    document.getElementById('level-dialog')?.classList.remove('visible');
    if (window.__GYM) { window.__GYM.running = false; window.__GYM.onRun = null; window.__GYM.onRestart = null; }
    this.scene.start('Menu', { screen: target });
  }

  /** Subclass hook — pickups, props, non-tilemap decor. */
  decorate() { }

  resetLevel() {
    this.playerModel.reset();
    this.playerView.stopAnimations();
    this.playerView.setPosition(this.playerModel.tx, this.playerModel.ty);
    this.playerView.playIdle(this.playerModel.facing);
    
    if (this.resultGroup) {
      this.resultGroup.destroy(true);
      this.resultGroup = null;
    }

    for (const pickup of this.pickups.values()) {
      if (pickup.sprite) {
        this.tweens.killTweensOf(pickup.sprite);
        pickup.sprite.destroy();
      }
    }
    this.pickups.clear();
    this.collected = 0;

    for (const obj of this.level.objects) {
      if (obj.type === 'pickup' || obj.type === 'pickup_with_animation') {
        const animated = obj.type === 'pickup_with_animation';
        this.addPickup(obj.tx, obj.ty, obj.frame, obj.key, true, animated);
      }
    }
  }

  loadObjects(objects) {
    for (const obj of objects) {
      if (obj.type === 'pickup' || obj.type === 'pickup_with_animation') {
        const animated = obj.type === 'pickup_with_animation';
        this.addPickup(obj.tx, obj.ty, obj.frame, obj.key, true, animated);
      } else {
        new WorldObjectView(this, obj.tx, obj.ty, obj.key, obj.frame);
      }
    }
  }

  addPickup(tx, ty, frame, textureKey = 'plants', force = false, animated = true) {
    if (!force && this.level.isSolid(tx, ty)) return;
    const pickup = new PickupView(this, tx, ty, frame, textureKey, animated);
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
        const isWin = this.pickups.size === 0;
        if (isWin) {
          markLevelCompleted(this.levelKey);
          this.playerView.playCelebrate();
          this.showResultOverlay(true);
        } else {
          this.playerView.playSad();
          this.showResultOverlay(false);
        }
      }
    };

    await executeProgram(moves, context, window.__GYM);
  }

  showResultOverlay(isWin) {
    if (this.resultGroup) this.resultGroup.destroy(true);

    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;
    
    this.resultGroup = this.add.container(cx, cy).setDepth(200);

    const color = isWin ? '#ffcc00' : '#ff4444';
    const message = isWin ? 'VICTORY!' : 'DEFEAT';

    const text = this.add.text(0, -30, message, {
      fontFamily: 'Arial Black',
      fontSize: '18px',
      color: color,
      align: 'center',
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5);
    
    this.resultGroup.add(text);

    if (isWin) {
      const allLevels = getAllLevels();
      const currentIdx = allLevels.findIndex(l => l.key === this.levelKey);
      const nextLevel = allLevels[currentIdx + 1];

      const btnLabel = nextLevel ? `Next Level ▶` : 'Done! 🏠';
      const nextBtn = this.createButton(0, 10, btnLabel, () => {
        if (nextLevel) {
          window.__setPanels?.(false);
          window.__setMission?.(null);
          this.scene.start(nextLevel.scene, { levelKey: nextLevel.key, returnScreen: this.returnScreen });
        } else {
          this.exitToMenu('main');
        }
      });
      this.resultGroup.add(nextBtn);
    } else {
      const restartBtn = this.createButton(0, 0, '↺ Restart', () => {
        const domRestart = document.getElementById('restart');
        if (domRestart) domRestart.click();
        else this.resetLevel();
      });
      const menuBtn = this.createButton(0, 30, '🏠 Menu', () => this.exitToMenu());
      this.resultGroup.add([restartBtn, menuBtn]);
    }

    this.resultGroup.setScale(0);

    this.tweens.add({
      targets: this.resultGroup,
      scale: 1,
      duration: 600,
      ease: 'Back.easeOut',
    });
  }

  createButton(x, y, textStr, onClick) {
    const btn = this.add.container(x, y);
    const bg = this.add.graphics();
    
    const w = 100;
    const h = 24;
    const drawBg = (color) => {
      bg.clear();
      bg.fillStyle(color, 1);
      bg.lineStyle(2, 0xffffff, 1);
      bg.fillRoundedRect(-w/2, -h/2, w, h, 6);
      bg.strokeRoundedRect(-w/2, -h/2, w, h, 6);
    };
    drawBg(0x333333);

    const txt = this.add.text(0, 0, textStr, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#ffffff'
    }).setOrigin(0.5);

    btn.add([bg, txt]);
    
    const zone = this.add.zone(0, 0, w, h).setInteractive({ useHandCursor: true });
    btn.add(zone);

    zone.on('pointerover', () => drawBg(0x555555));
    zone.on('pointerout', () => drawBg(0x333333));
    zone.on('pointerdown', () => { drawBg(0x222222); btn.y = y + 2; });
    zone.on('pointerup', () => { drawBg(0x555555); btn.y = y; onClick(); });
    zone.on('pointerupoutside', () => { drawBg(0x333333); btn.y = y; });

    return btn;
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
