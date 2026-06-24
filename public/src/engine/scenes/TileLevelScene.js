import { DIRS, TILE, STEP_MS } from '../../config/game.js';
import { loadLevel } from '../../engine/level/TileLevelLoader.js';
import { esGidDeRoca, OBJECTS } from '../../engine/level/TileRegistry.js';
import { createWeather, destroyWeather } from '../../engine/level/WeatherSystem.js';
import { Player } from '../../domain/Player.js';
import { executeProgram } from '../../engine/program/ProgramExecutor.js';
import { PlayerView } from '../../engine/entities/PlayerView.js';
import { PickupView } from '../../engine/entities/PickupView.js';
import { WorldObjectView } from '../../engine/entities/WorldObjectView.js';
import { getAllLevels, markLevelCompleted } from '../../services/Storage.js';
import { animatePath } from '../../engine/level/PathAnimator.js';
import { injectStyles } from '../levels/intro.js';
import { playMusic, playSfx } from '../audio.js';

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

    // Total de pickups del nivel (tras cargar objetos y decorar). Define la
    // condicion de victoria: con pickups se gana al juntarlos todos; sin pickups
    // (ej. nivel0 "llegar a casa") se gana al llegar a la meta del path.
    this.totalPickups = this.pickups.size;

    if (this.level.weather && Object.values(this.level.weather).some(v => v > 0)) {
      createWeather(this, this.level.weather);
    }

    // Background music — bgm2 for levels 0–5, bgm3 for the rest
    const allLevels = getAllLevels();
    const levelIdx = allLevels.findIndex(l => l.key === this.levelKey);
    const bgmKey = (levelIdx >= 0 && levelIdx < 6) ? 'bgm2' : 'bgm3';
    this.sound.stopAll();
    this.bgm = playMusic(this, bgmKey);

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
      this.sound.stopAll();
      destroyWeather(this);
      window.__setPanels?.(false);
      window.__setMission?.(null);
      // El #result-panel es independiente de #panels: hay que ocultarlo a mano al
      // dejar el nivel, si no el mensaje de "¡ganaste!" persiste en el siguiente.
      window.__hideResult?.();
      window.__lockInput?.(false);   // el bloqueo de win/lose no debe cruzar de nivel
      window.__clearProgram?.();     // no arrastrar movimientos (incl. funcion/for) al siguiente nivel
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
    this.crosshair = this.add.rectangle(0, 0, TILE, TILE).setStrokeStyle(1, 0xffcc33, 0.8).setOrigin(0).setDepth(99).setScrollFactor(0);

    this.keys.G.on('down', () => { this.gridVisible = !this.gridVisible; this.grid.setVisible(this.gridVisible); });

    this._createPickupCounter();
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
      message: this.missionText || '¡A jugar! Arma tu programa y presiona Ejecutar.',
    });
  }

  _runPathAnimation() {
    animatePath(this, { onComplete: this.onPathAnimationComplete });
  }

  _addRepeatPathButton() {
    const wrap = document.createElement('div');
    wrap.id = 'path-buttons';
    Object.assign(wrap.style, {
      position: 'absolute', bottom: '28px', right: '16px',
      display: 'flex', gap: '6px', alignItems: 'center',
    });

    const baseStyle = {
      border: '2px solid #c8a800', color: '#3d2008',
      fontFamily: "'SproutPixel', monospace", fontSize: '11px', fontWeight: 'bold',
      padding: '4px 12px', borderRadius: '5px', cursor: 'pointer',
      boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
    };

    // "ayuda": muestra/oculta el camino guia amarillo (marcadores del path).
    const ayuda = document.createElement('button');
    ayuda.id = 'help-path-btn';
    ayuda.textContent = 'ayuda';
    Object.assign(ayuda.style, baseStyle);
    const syncAyuda = () => {
      const on = !!this.pathMarkers?.visible;
      ayuda.style.background = on ? '#ffe600' : '#cdbb6a';
      ayuda.style.filter = on ? 'none' : 'grayscale(0.5)';
      ayuda.style.opacity = on ? '1' : '0.85';
      ayuda.title = on ? 'Ocultar camino guia' : 'Mostrar camino guia';
    };
    ayuda.addEventListener('click', () => {
      if (this.pathMarkers) this.pathMarkers.setVisible(!this.pathMarkers.visible);
      syncAyuda();
    });
    syncAyuda();

    // "mostrar camino": repite la animacion del camino (sin disparar tutoriales).
    const btn = document.createElement('button');
    btn.id = 'repeat-path-btn';
    btn.textContent = 'mostrar camino';
    Object.assign(btn.style, { ...baseStyle, background: '#ffe600' });
    btn.addEventListener('mouseenter', () => btn.style.background = '#ffd000');
    btn.addEventListener('mouseleave', () => btn.style.background = '#ffe600');
    btn.addEventListener('click', () => animatePath(this));

    wrap.append(ayuda, btn);
    document.getElementById('result-panel')?.appendChild(wrap);
    this.events.once('shutdown', () => wrap.remove());
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
    // Referencia para el boton "ayuda" (mostrar/ocultar el camino guia amarillo).
    this.pathMarkers = g;
  }

  /** Subclass hook — pickups, props, non-tilemap decor. */
  decorate() { }

  resetLevel() {
    this.sound.stopAll();
    if (this.bgm) this.bgm.play();

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

    // Restaurar árboles talados/sacudidos: destruir las vistas actuales y
    // reconstruirlas desde el JSON, devolviendo solidez y grilla de árboles.
    if (this.treeViews) {
      for (const view of this.treeViews.values()) {
        if (view.sprite) { this.tweens.killTweensOf(view.sprite); view.sprite.destroy(); }
        const i = this.fadeObjects.indexOf(view);
        if (i >= 0) this.fadeObjects.splice(i, 1);
      }
      this.treeViews.clear();
      for (const obj of this.level.objects) {
        const def = OBJECTS.find(o => o.key === obj.key);
        if (!def?.isTree) continue;
        const view = new WorldObjectView(this, obj.tx, obj.ty, obj.key, obj.frame);
        if (view.sprite && view.sprite.height > TILE) this.fadeObjects.push(view);
        this.treeViews.set(`${obj.tx},${obj.ty}`, view);
        if (this.level.trees[obj.ty]) this.level.trees[obj.ty][obj.tx] = true;
        if (obj.solid === true && this.level.solid[obj.ty]) this.level.solid[obj.ty][obj.tx] = true;
      }
    }
  }

  loadObjects(objects) {
    // Objetos "altos" (mas de 1 tile de alto) que pueden tapar al jugador: se
    // vuelven semitransparentes cuando el personaje pasa por detras (ver update()).
    this.fadeObjects = [];
    // Árboles talables (frutales): referencia por casilla del tronco para poder
    // reproducir la animación de caída cuando se cortan (regla "árbol adelante → cortar").
    this.treeViews = new Map();
    for (const obj of objects) {
      if (obj.type === 'pickup' || obj.type === 'pickup_with_animation') {
        const animated = obj.type === 'pickup_with_animation';
        this.addPickup(obj.tx, obj.ty, obj.frame, obj.key, true, animated);
      } else {
        const objDef = OBJECTS.find(o => o.key === obj.key);
        const isBridge = objDef?.group === 'bridge';
        const depthOverride = isBridge ? 30 : (obj.type === 'top' ? 45 : null);
        const view = new WorldObjectView(this, obj.tx, obj.ty, obj.key, obj.frame, depthOverride);
        if (view.sprite && view.sprite.height > TILE) this.fadeObjects.push(view);
        if (objDef?.isTree) this.treeViews.set(`${obj.tx},${obj.ty}`, view);
      }
    }
  }

  // Baja el alpha de los objetos altos cuando el jugador queda detras y los solapa,
  // para que no lo tapen (arboles, casas, etc.). Lo llama update() cada frame.
  _updateObjectFade() {
    const list = this.fadeObjects;
    if (!list || !list.length) return;
    const p = this.playerView?.sprite;
    if (!p) return;
    const pBounds = p.getBounds();
    const pDepth = p.depth;
    for (const v of list) {
      const s = v.sprite;
      if (!s || !s.active) continue;
      const behind = s.depth > pDepth;   // el objeto se dibuja por encima del jugador
      const overlap = behind && Phaser.Geom.Intersects.RectangleToRectangle(pBounds, s.getBounds());
      const target = overlap ? 0.5 : 1;
      if (s._fadeTarget !== target) {
        s._fadeTarget = target;
        this.tweens.add({ targets: s, alpha: target, duration: 150, ease: 'Sine.easeOut' });
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

  // Tala el árbol que está en la casilla de adelante.
  //  - Árbol frutal con fruta: la primera tala lo SACUDE (cae la fruta) y lo deja
  //    como árbol normal pelado; el gato NO avanza (hace falta otra tala).
  //  - Árbol normal (o ya sacudido): golpe → cae → tronquito que se desvanece →
  //    la casilla queda caminable y el gato avanza.
  async cutDir(dir) {
    this.playerModel.facing = dir;
    const { tx, ty } = this.casillaEnDireccion(dir);
    const key = `${tx},${ty}`;
    const view = this.treeViews.get(key);

    // 1) Golpe de hacha del jugador (one-shot).
    await this.playerView.playAxe(dir);

    // 2a) Frutal con fruta: solo se sacude, cae la fruta y queda pelado. No avanza.
    if (view && view.hasFruit) {
      await view.shake();
      return;
    }

    // 2b) Árbol normal: cae y deja un tronquito que se desvanece.
    if (view) {
      this.treeViews.delete(key);
      const idx = this.fadeObjects.indexOf(view);
      if (idx >= 0) this.fadeObjects.splice(idx, 1);
      await view.fall(dir);
    }

    // 3) Liberar la casilla (solid compartido con el Player) y avanzar a ella.
    if (this.level.solid[ty]) this.level.solid[ty][tx] = false;
    if (this.level.trees[ty]) this.level.trees[ty][tx] = false;
    await this.step(dir);
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

  hayArbolEn(tx, ty) {
    return this.level.isTree(tx, ty);
  }

  hayArbolAdelante(dir = this.playerModel.facing) {
    const siguiente = this.casillaEnDireccion(dir);
    return this.hayArbolEn(siguiente.tx, siguiente.ty);
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
      hayArbolAdelante: (dir) => this.hayArbolAdelante(dir),
      cutDir: (dir) => this.cutDir(dir),
      onComplete: () => {
        // Con pickups: ganar al recolectarlos todos (no hace falta pisar un tile final).
        // Sin pickups: ganar al llegar a la meta del path (niveles tipo "llegar a X").
        const atGoal = !goal || (this.playerModel.tx === goal.tx && this.playerModel.ty === goal.ty);
        const isWin = this.totalPickups > 0 ? this.pickups.size === 0 : atGoal;
        // Auto-demo del tutorial: el jugador todavia no jugo. La demo siempre
        // muestra la solucion correcta, asi que el gatito festeja, pero NO marcamos
        // el nivel como completado ni mostramos el overlay de resultado (el panel
        // de abajo queda normal hasta que juega el jugador).
        if (this._demoRunning) {
          this.playerView.playCelebrate();
          return;
        }
        if (isWin) {
          markLevelCompleted(this.levelKey);
          this.playerView.playCelebrate();
          if (this.bgm) this.bgm.stop();
          playSfx(this, 'win_sound', 0.15);
          this.showResultOverlay(true);
        } else {
          this.playerView.playSad();
          if (this.bgm) this.bgm.stop();
          playSfx(this, 'lose_sound', 0.15);
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
        ? 'Usa mas movimientos para llegar a todos los objetos.'
        : 'Revisa tu programa.';

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

  // ── Contador de pickups restantes (HUD estilo panel) ────────────────────────
  // Reemplaza al viejo texto de debug. Solo aparece desde el nivel 2 (main) en
  // adelante y cuando el nivel tiene pickups. Usa el sprite del propio
  // coleccionable como icono y la paleta de los paneles (#c8a87a).
  _createPickupCounter() {
    const allLevels = getAllLevels();
    const idx = allLevels.findIndex(l => l.key === this.levelKey);
    if (idx < 2 || this.totalPickups <= 0) return;

    const firstPickup = this.level.objects.find(
      o => o.type === 'pickup' || o.type === 'pickup_with_animation'
    );

    const cont = this.add.container(6, 6).setScrollFactor(0).setDepth(5000);

    const bg = this.add.graphics();
    cont.add(bg);

    let textX = 8;
    if (firstPickup?.key) {
      const icon = this.add.image(7, 9, firstPickup.key, firstPickup.frame ?? 0)
        .setOrigin(0, 0.5);
      icon.setDisplaySize(12, 12);
      cont.add(icon);
      textX = 22;
    }

    const label = this.add.text(textX, 9, '', {
      fontFamily: 'SproutPixel, monospace', fontSize: '11px', color: '#3d2008',
    }).setOrigin(0, 0.5);
    cont.add(label);

    this.pickupCounter = cont;
    this.pickupCounterBg = bg;
    this.pickupCounterText = label;
    this.pickupCounterTextX = textX;
    this._lastPickupLeft = -1;
  }

  // Dibuja el fondo del badge ajustado al ancho del texto, con la paleta de los
  // paneles (#c8a87a + banda clara + borde marron).
  _drawPickupCounterBg() {
    const H = 18, R = 5, padR = 9;
    const W = this.pickupCounterTextX + Math.ceil(this.pickupCounterText.width) + padR;
    const g = this.pickupCounterBg;
    g.clear();
    g.fillStyle(0xc8a87a, 1);
    g.fillRoundedRect(0, 0, W, H, R);
    g.fillStyle(0xdfc99e, 0.5);
    g.fillRoundedRect(2, 2, W - 4, (H - 4) / 2, 3);
    g.lineStyle(1.5, 0x5a3a1a, 0.4);
    g.strokeRoundedRect(0.75, 0.75, W - 1.5, H - 1.5, R);
  }

  _updatePickupCounter() {
    if (!this.pickupCounter) return;
    // Se oculta mientras la camara tiene zoom (intros / tutoriales cinematicos).
    const zoomed = Math.abs(this.cameras.main.zoom - 1) > 0.02;
    const left = this.pickups.size;
    const show = left > 0 && !zoomed;
    this.pickupCounter.setVisible(show);
    if (!show) return;
    if (left !== this._lastPickupLeft) {
      this._lastPickupLeft = left;
      const palabra = left === 1 ? 'Falta 1 fruta' : `Faltan ${left} frutas`;
      this.pickupCounterText.setText(palabra);
      this._drawPickupCounterBg();
    }
  }

  update() {
    this.crosshair.setPosition(this.playerModel.tx * TILE, this.playerModel.ty * TILE);
    this._updateObjectFade();
    this._updatePickupCounter();
  }
}
