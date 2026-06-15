import { DIRS, TILE, STEP_MS } from '../../config/game.js';
import { loadLevel } from '../../engine/level/TileLevelLoader.js';
import { esGidDeRoca } from '../../engine/level/TileRegistry.js';
import { createWeather, destroyWeather } from '../../engine/level/WeatherSystem.js';
import { Player } from '../../domain/Player.js';
import { executeProgram } from '../../engine/program/ProgramExecutor.js';
import { PlayerView } from '../../engine/entities/PlayerView.js';
import { PickupView } from '../../engine/entities/PickupView.js';
import { WorldObjectView } from '../../engine/entities/WorldObjectView.js';
import { getAllLevels, markLevelCompleted } from '../../services/Storage.js';
import { animatePath } from '../../engine/level/PathAnimator.js';
import { injectStyles } from '../levels/intro.js';

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
    this.introPoints = levelData.introPoints;
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

    this.pathFlat = levelData.flat?.path || [];
    this.wallsFlat = levelData.flat?.walls || [];
    this.drawPathMarkers(this.pathFlat);

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
    this.showIdlePanel();

    const onDocEsc = (e) => {
      if (!this.puedeSalirPorEscape()) return;
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
      injectStyles();
      document.getElementById('level-dialog-box')?.classList.add('intro-highlight');
      window.__showDialog?.({
        message: this.welcomeMessage,
        onClose: this.onWelcomeClose ?? (() => {
          document.getElementById('level-dialog-box')?.classList.remove('intro-highlight');
          const panel = document.getElementById('result-panel');
          if (panel) {
            panel.classList.add('intro-highlight');
            setTimeout(() => panel.classList.remove('intro-highlight'), 3000);
          }
          this._runPathAnimation();
        }),
      });
      this._addRepeatPathButton();
    }

    this.keys = this.input.keyboard.addKeys({
      G: Phaser.Input.Keyboard.KeyCodes.G,
      F: Phaser.Input.Keyboard.KeyCodes.F,
      ESC: Phaser.Input.Keyboard.KeyCodes.ESC,
    });
    this.keys.ESC.on('down', () => {
      if (!this.puedeSalirPorEscape()) return;
      this.exitToMenu();
    });

    this.grid = this.add.graphics().setDepth(100).setScrollFactor(0);
    this.drawGrid();
    this.gridVisible = false;
    this.grid.setVisible(false);
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
    window.__hideResult?.();
    document.getElementById('level-dialog')?.classList.remove('visible');
    if (window.__GYM) { window.__GYM.running = false; window.__GYM.onRun = null; window.__GYM.onRestart = null; }
    this.scene.start('Menu', { screen: target });
  }

  showIdlePanel() {
    window.__showResult?.({
      state: 'idle',
      message: this.missionText || '¡A jugar! Armá tu programa y presioná Ejecutar.',
    });
  }

  _runPathAnimation() {
    animatePath(this, { onComplete: this.onPathAnimationComplete });
  }

  _addRepeatPathButton() {
    const btn = document.createElement('button');
    btn.textContent = 'repetir camino';
    btn.id = 'repeat-path-btn';
    Object.assign(btn.style, {
      position: 'absolute', bottom: '10px', right: '16px',
      background: '#ffe600', border: '2px solid #c8a800',
      color: '#3d2008', fontFamily: "'SproutPixel', monospace", fontSize: '11px',
      fontWeight: 'bold', padding: '4px 12px', borderRadius: '5px', cursor: 'pointer',
      boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
    });
    btn.addEventListener('mouseenter', () => btn.style.background = '#ffd000');
    btn.addEventListener('mouseleave', () => btn.style.background = '#ffe600');
    // Solo repite la animación del camino, sin disparar tutoriales (onComplete)
    btn.addEventListener('click', () => animatePath(this));
    document.getElementById('result-panel')?.appendChild(btn);
    this.events.once('shutdown', () => btn.remove());
  }

  _pathGoal() {
    const path = this.pathFlat;
    if (!path?.some(v => v !== 0)) return null;
    const cols = this.cols, rows = this.rows;
    const dirs = [{dx:0,dy:-1},{dx:0,dy:1},{dx:-1,dy:0},{dx:1,dy:0}];
    const isPath = (tx, ty) => tx >= 0 && ty >= 0 && tx < cols && ty < rows && path[ty * cols + tx] !== 0;
    const endpoints = [];
    for (let ty = 0; ty < rows; ty++) {
      for (let tx = 0; tx < cols; tx++) {
        if (!isPath(tx, ty)) continue;
        const n = dirs.filter(({dx, dy}) => isPath(tx + dx, ty + dy)).length;
        if (n === 1) endpoints.push({ tx, ty });
      }
    }
    if (!endpoints.length) return null;
    const spawn = this.level.spawn;
    return endpoints.sort((a, b) =>
      (Math.abs(b.tx - spawn.tx) + Math.abs(b.ty - spawn.ty)) -
      (Math.abs(a.tx - spawn.tx) + Math.abs(a.ty - spawn.ty))
    )[0];
  }

  /** Highlight walkable tiles when the level uses the `path` layer. */
  drawPathMarkers(pathFlat) {
    if (!pathFlat || !pathFlat.some(v => v !== 0)) return;
    const g = this.add.graphics().setDepth(15);
    g.lineStyle(1, 0xffee88, 0.65);
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (pathFlat[y * this.cols + x] !== 0) {
          g.strokeRect(x * TILE + 0.5, y * TILE + 0.5, TILE - 1, TILE - 1);
        }
      }
    }
    this.tweens.add({
      targets: g, alpha: { from: 0.45, to: 1 },
      duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  /** Subclass hook — pickups, props, non-tilemap decor. */
  decorate() { }

  resetLevel() {
    this.playerModel.reset();
    this.playerView.stopAnimations();
    this.playerView.setPosition(this.playerModel.tx, this.playerModel.ty);
    this.playerView.playIdle(this.playerModel.facing);

    this.showIdlePanel();

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
      } else if (obj.type === 'top') {
        new WorldObjectView(this, obj.tx, obj.ty, obj.key, obj.frame, 45);
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

  puedeSalirPorEscape() {
    if (document.visibilityState !== 'visible') return false;
    if (typeof document.hasFocus === 'function' && !document.hasFocus()) return false;
    return true;
  }

  casillaEnDireccion(dir, distancia = 1) {
    const delta = DIRS[dir];
    if (!delta) return { tx: this.playerModel.tx, ty: this.playerModel.ty };
    return {
      tx: this.playerModel.tx + delta.dx * distancia,
      ty: this.playerModel.ty + delta.dy * distancia,
    };
  }

  hayRocaEn(tx, ty) {
    return this.level.isRock(tx, ty);
  }

  hayRocaAdelante(dir = this.playerModel.facing) {
    const siguiente = this.casillaEnDireccion(dir);
    return this.hayRocaEn(siguiente.tx, siguiente.ty);
  }

  estaBloqueado(dir = this.playerModel.facing) {
    const siguiente = this.casillaEnDireccion(dir);
    return !this.playerModel.canEnter(siguiente.tx, siguiente.ty);
  }

  async runProgram(moves) {
    const goal = this._pathGoal();
    const context = {
      step: (dir) => this.step(dir),
      jumpInPlace: () => this.jumpInPlace(),
      jumpDir: (dir) => this.jumpDir(dir),
      obtenerDireccion: () => this.playerModel.facing,
      hayRocaAdelante: (dir) => this.hayRocaAdelante(dir),
      estaBloqueado: (dir) => this.estaBloqueado(dir),
      onComplete: () => {
        const atGoal = !goal || (this.playerModel.tx === goal.tx && this.playerModel.ty === goal.ty);
        const isWin = atGoal && this.pickups.size === 0;
        // Auto-demo del tutorial: el jugador todavía no jugó, así que no marcamos
        // el nivel como completado ni mostramos el overlay de resultado.
        if (this._demoRunning) {
          this.playerView[isWin ? 'playCelebrate' : 'playSad']();
          return;
        }
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
    const allLevels = getAllLevels();
    const currentIdx = allLevels.findIndex(l => l.key === this.levelKey);
    const nextLevel = allLevels[currentIdx + 1];

    const pickupsLeft = this.pickups.size;
    const message = isWin
      ? '¡Lo lograste!'
      : pickupsLeft > 0
        ? 'Usá más movimientos para llegar a todos los objetos.'
        : 'Revisá tu programa.';

    window.__showResult?.({
      state: isWin ? 'win' : 'lose',
      hasNext: isWin && !!nextLevel,
      message,
      onRestart: () => {
        const domRestart = document.getElementById('restart');
        if (domRestart) domRestart.click();
        else this.resetLevel();
      },
      onMenu: () => this.exitToMenu(),
      onNext: () => {
        if (nextLevel) {
          window.__setPanels?.(false);
          window.__setMission?.(null);
          this.scene.start(nextLevel.scene, { levelKey: nextLevel.key, returnScreen: this.returnScreen });
        } else {
          this.exitToMenu('main');
        }
      },
    });
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
