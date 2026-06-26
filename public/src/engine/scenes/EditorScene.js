import { TILE, COLS, ROWS } from '../../config/game.js';
import {
  TILESETS, TILESET_CATEGORIES, TERRAINS, OBJECTS, OBJECT_CATEGORIES, VARIANT_DEFS,
  expandLayer, flatToRows, isSameTerrain, resolveTerrainGid, getFrameDimensions, getValidFrame,
} from '../../engine/level/TileRegistry.js';
import { loadLevel } from '../../engine/level/TileLevelLoader.js';
import {
  readLevelJson, writeLevelJson, clearLevelOverride,
  createNewLevel, getCustomLevels, addCustomLevel,
} from '../../services/Storage.js';
import { createWeather, destroyWeather } from '../../engine/level/WeatherSystem.js';
import { deriveAnimKey } from '../../engine/entities/WorldObjectView.js';
import { setBackHandler } from '../../ui/back-gesture.js';

const LAYERS = ['floor', 'path', 'walls', 'overlay', 'top'];
const UNDO_CAP = 50;

export class EditorScene extends Phaser.Scene {
  constructor() { super('Editor'); }

  init(data) {
    this.levelKey = data?.levelKey || 'gym';
    this.returnScreen = data?.returnScreen || 'main';
  }

  create() {
    // Render the level using the shared loader so the map matches runtime.
    const level = loadLevel(this, this.levelKey);
    this.map = level.map;
    this.floorLayer = level.floorLayer;
    this.pathLayer = level.pathLayer;
    this.wallsLayer = level.wallsLayer;
    this.overlayLayer = level.overlayLayer;
    this.topLayer = level.topLayer;
    this.flat = level.flat;           // { floor:[], path:[], walls:[], overlay:[], top:[] }
    this.cols = level.cols;
    this.rows = level.rows;
    this.spawn = level.spawn;
    this.raw = level.raw;
    this.weather = level.weather ?? { rain: 0, snow: 0, pollen: 0, leaves: 0, night: 0 };
    if (Object.values(this.weather).some(v => v > 0)) {
      createWeather(this, this.weather);
    }

    this.activeLayer = 'walls';
    this.selectedGid = 0;
    this.activeTerrain = null;
    this.painting = null;
    this.history = [];
    this.future = [];

    this.dirty = false;
    this.saveTimer = null;
    this.dragState = null;
    this.dragGhost = null;
    this.hoverGhost = null;
    this.selectionGhost = null;
    this.activeEditorTab = 'tileset';
    this.escTimer = null;

    // Selection unificada: null = modo copiar; con valor = modo pegar/colocar
    // { type: 'tile', gid } o { type: 'object', key, frame, objType }
    this.selection = null;

    // Object mode state
    this.edMode = 'tile';             // 'tile' | 'object' | 'spawn' | 'intro'
    this.objects = (level.objects ?? []).slice();
    this.objectSprites = new Map();   // "tx,ty" → Phaser sprite
    this.selectedObject = { key: 'plants', frame: 0, type: 'deco', solid: false };
    this._renderAllObjects();

    this.introPoints = (level.raw.introPoints || []).map(p => ({ ...p }));
    this.introMarkerSprites = [];
    this._renderIntroMarkers();

    this.spawnMarker = this.add.rectangle(
      this.spawn.tx * TILE, this.spawn.ty * TILE, TILE, TILE
    ).setStrokeStyle(1, 0x66ff99, 0.9).setOrigin(0).setDepth(90).setScrollFactor(0);
    this.spawnLabel = this.add.text(this.spawn.tx * TILE + 2, this.spawn.ty * TILE + 2, 'S', {
      fontFamily: 'monospace', fontSize: '8px', color: '#66ff99',
    }).setDepth(91).setScrollFactor(0);

    // Hover + grid overlays
    this.grid = this.add.graphics().setDepth(100).setScrollFactor(0);
    this.drawGrid();
    this.gridVisible = true;
    this.hoverRect = this.add.rectangle(0, 0, TILE, TILE)
      .setStrokeStyle(1, 0xffee88, 1).setOrigin(0).setDepth(101).setVisible(false).setScrollFactor(0);
    this.activeLayerRect = this.add.rectangle(0, 0, TILE, TILE, 0xffee88, 0.18)
      .setOrigin(0).setDepth(99).setVisible(false).setScrollFactor(0);

    // DOM palette -----------------------------------------------------------
    window.__setEditor?.({
      levelKey: this.levelKey,
      tilesets: TILESETS,
      tilesetCategories: TILESET_CATEGORIES,
      terrains: TERRAINS,
      objects:  OBJECTS,
      variantDefs: VARIANT_DEFS,
      categories: OBJECT_CATEGORIES,
      onSelect:       (gid)     => { this.activeTerrain = null; this.selectedGid = gid; this.setSelectionFromPalette('tile', gid); this.setEditorTab('tileset'); this.setMode('tile'); this.notifyHover(); window.__setEditor_updateSelected?.(gid); },
      onTerrain:      (terrain) => { this.activeTerrain = terrain; this.setEditorTab('tileset'); this.setMode('tile'); this.notifyHover(); window.__setEditor_updateTerrain?.(terrain?.name ?? null); },
      onLayer:        (layer)   => this.setLayer(layer),
      onSave:         () => this.save(),
      onPlay:         () => this.playTest(),
      onMenu:         () => this.exitToMenu(),
      onClear:        () => this.clearActiveLayer(),
      onClearObjects: () => this.clearAllObjects(),
      onUndo:         () => this.undo(),
      onRedo:         () => this.redo(),
      onRevert:       () => this.revertToDisk(),
      getLayer:       () => this.activeLayer,
      onObjectSelect: (key, frame, type, solid = false) => { this.selectedObject = { key, frame, type, solid }; this.setSelectionFromPalette('object', null, key, frame, type, solid); this.setEditorTab('objects'); this.setMode('object'); this.notifyHover(); window.__setEditor_updateObjectSelected?.(key, frame, type, solid); },
      onObjectTypeChange: (type) => { this.selectedObject.type = type; if (this.selection?.type === 'object') this.selection.objType = type; this.notifyHover(); },
      onObjectSolidChange: (solid) => { this.selectedObject.solid = solid; if (this.selection?.type === 'object') this.selection.objSolid = solid; this.notifyHover(); },
      onSpawnMode:    () => this.setMode('spawn'),
      onIntroMode:    () => this.setMode(this.edMode === 'intro' ? 'tile' : 'intro'),
      getMode:        () => this.edMode,
      getWeather:     () => this.weather,
      onWeatherChange:(cfg) => this.setWeather(cfg),
      getSummary:     ()      => this.getSummary(),
      getTilesetForGid: (gid) => this.getTilesetForGid(gid),
      getActiveTab:   ()      => this.activeEditorTab,
      onTabChange:    (tab)   => this.setEditorTab(tab),
      getSelection:   ()      => this.selection,
    });

    // Pointer input ---------------------------------------------------------
    const inBounds = (tx, ty) => tx >= 0 && ty >= 0 && tx < this.cols && ty < this.rows;
    const tileAt = (p) => ({ tx: Math.floor(p.worldX / TILE), ty: Math.floor(p.worldY / TILE) });

    this.input.mouse?.disableContextMenu?.();

    this.input.on('pointermove', (p) => {
      const { tx, ty } = tileAt(p);
      this.updateHover(tx, ty, p);

      if (this.dragState?.active) {
        this.updateDrag(tx, ty, p);
      } else if (this.dragState && !this.dragState.dragDisabled) {
        const dx = p.worldX - this.dragState.startX;
        const dy = p.worldY - this.dragState.startY;
        const dt = Date.now() - this.dragState.startTime;
        if (Math.hypot(dx, dy) > 10 || dt > 220) {
          this.startDrag();
        }
      }

      this.notifyHover(tx, ty);
    });

    this.input.on('pointerdown', (p) => {
      const { tx, ty } = tileAt(p);
      if (!inBounds(tx, ty)) return;

      if (this.edMode === 'intro') {
        this._toggleIntroPoint(tx, ty);
        this.saveDeferred();
        return;
      }

      if (this.edMode === 'spawn') {
        this.spawn = { tx, ty };
        this.spawnMarker.setPosition(tx * TILE, ty * TILE);
        this.spawnLabel.setPosition(tx * TILE + 2, ty * TILE + 2);
        this.setMode('tile');
        this.saveDeferred();
        return;
      }

      if (p.rightButtonDown()) {
        this._deleteAt(tx, ty);
        return;
      }

      if (this.selection) {
        // Modo pegar: colocar el elemento seleccionado
        this._tryPaste(tx, ty);
        return;
      }

      // Modo copiar: preparar posible arrastre desde elemento de la capa activa
      const source = this._getSourceAtActiveLayer(tx, ty);
      if (source) {
        this.pushHistory();
        this.dragState = {
          startTx: tx, startTy: ty,
          startX: p.worldX, startY: p.worldY,
          startTime: Date.now(),
          active: false,
          layer: this.activeLayer,
          source,
        };
      }
    });

    this.input.on('pointerup', (p) => {
      const { tx, ty } = tileAt(p);
      if (this.dragState?.active) {
        this.endDrag(tx, ty);
      } else if (this.dragState && this.dragState.source) {
        // Click corto sobre elemento: copiar a selection
        this._copyFromSource(this.dragState.source);
        window.__setEditor_showToast?.('Elemento copiado. Esc para limpiar seleccion.', 'success');
      }
      this.dragState = null;
    });

    this.input.on('pointerupoutside', () => {
      if (this.dragState?.active) {
        this.cancelDrag();
      }
      this.dragState = null;
      this.painting = null;
    });

    this.input.on('gameout', () => {
      this.hoverRect.setVisible(false);
      this._destroyHoverGhost();
      window.__setEditor_hideLayerPicker?.();
    });

    // Keyboard --------------------------------------------------------------
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = this.input.keyboard.addKeys({
      ONE: K.ONE, TWO: K.TWO, THREE: K.THREE, FOUR: K.FOUR, FIVE: K.FIVE, G: K.G,
      S: K.S, Z: K.Z, Y: K.Y, P: K.P, ESC: K.ESC,
      C: K.C, I: K.I,
    });
    this.keys.ONE.on('down', () => this.setLayer('floor'));
    this.keys.TWO.on('down', () => this.setLayer('walls'));
    this.keys.THREE.on('down', () => this.setLayer('path'));
    this.keys.FOUR.on('down', () => this.setLayer('overlay'));
    this.keys.FIVE.on('down', () => this.setLayer('top'));
    this.keys.G.on('down',   () => { this.gridVisible = !this.gridVisible; this.grid.setVisible(this.gridVisible); });
    this.keys.P.on('down',   () => this.playTest());
    this.keys.ESC.on('down', () => this._handleEsc());

    setBackHandler(this, () => this._handleEsc());
    this.keys.S.on('down',   (ev) => { if (!ev.ctrlKey) this.setMode(this.edMode === 'spawn' ? 'tile' : 'spawn'); });
    this.keys.I.on('down',   () => this.setMode(this.edMode === 'intro' ? 'tile' : 'intro'));
    this.input.keyboard.on('keydown', (ev) => {
      if (ev.ctrlKey && !ev.shiftKey && ev.code === 'KeyS') { ev.preventDefault(); this.save(); }
      if (ev.ctrlKey && !ev.shiftKey && ev.code === 'KeyZ') { ev.preventDefault(); this.undo(); }
      if (ev.ctrlKey && !ev.shiftKey && ev.code === 'KeyY') { ev.preventDefault(); this.redo(); }
      if (ev.ctrlKey && ev.shiftKey && ev.code === 'KeyC') { ev.preventDefault(); this.clearActiveLayer(); }
    });

    // Lifecycle -------------------------------------------------------------
    this.events.once('shutdown', () => {
      destroyWeather(this);
      window.__setEditor?.(null);
      this.painting = null;
      if (this.saveTimer) { clearTimeout(this.saveTimer); this.saveTimer = null; }
      if (this.escTimer) { clearTimeout(this.escTimer); this.escTimer = null; }
      this._destroyHoverGhost();
      this._destroySelectionGhost();
    });

    this.setLayer(this.activeLayer);
    this.notifyHover();
  }

  exitToMenu() {
    this.doSave();
    window.__setEditor?.(null);
    window.__setPanels?.(false);
    this.scene.start('Menu', { screen: this.returnScreen });
  }

  drawGrid() {
    this.grid.clear();
    this.grid.lineStyle(1, 0xffee88, 0.12);
    for (let x = 0; x <= this.cols; x++) this.grid.lineBetween(x * TILE, 0, x * TILE, this.rows * TILE);
    for (let y = 0; y <= this.rows; y++) this.grid.lineBetween(0, y * TILE, this.cols * TILE, y * TILE);
  }

  // --- Painting ----------------------------------------------------------

  layerOf(name) {
    if (name === 'floor') return this.floorLayer;
    if (name === 'path') return this.pathLayer;
    if (name === 'overlay') return this.overlayLayer;
    if (name === 'top') return this.topLayer;
    return this.wallsLayer;
  }

  paintAt(tx, ty, mode) {
    if (this.activeTerrain && mode === 'paint') {
      this._terrainPaint(tx, ty);
    } else if (this.activeTerrain && mode === 'erase') {
      this._terrainErase(tx, ty);
    } else {
      const gid = mode === 'erase' ? 0 : this.selectedGid;
      this._setGid(tx, ty, gid);
    }
    this.saveDeferred();
  }

  _setGid(tx, ty, gid) {
    const layer = this.layerOf(this.activeLayer);
    const flat = this.flat[this.activeLayer];
    const i = ty * this.cols + tx;
    if (flat[i] === gid) return false;
    flat[i] = gid;
    if (gid === 0) layer.removeTileAt(tx, ty, false);
    else layer.putTileAt(gid, tx, ty);
    return true;
  }

  _terrainPaint(tx, ty) {
    const terrain = this.activeTerrain;
    // Paint the center tile first so the visual layer updates, then refresh neighbours.
    this._setGid(tx, ty, terrain.tiles[15]);
    this._refreshTerrainBlock(tx, ty, terrain);
  }

  _terrainErase(tx, ty) {
    // Erase and re-evaluate any terrain neighbours.
    const flat = this.flat[this.activeLayer];
    const oldGid = flat[ty * this.cols + tx];
    this._setGid(tx, ty, 0);
    // Find which terrain this cell belonged to (if any) and refresh its neighbours.
    const terrain = TERRAINS.find(t => isSameTerrain(oldGid, t));
    if (terrain) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = tx + dx, ny = ty + dy;
          if (nx >= 0 && ny >= 0 && nx < this.cols && ny < this.rows) {
            const nGid = flat[ny * this.cols + nx];
            if (isSameTerrain(nGid, terrain)) this._refreshTerrainCell(nx, ny, terrain);
          }
        }
      }
    }
  }

  _computeBitmask(tx, ty, terrain) {
    const flat = this.flat[this.activeLayer];
    const check = (x, y) => {
      if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) return false;
      return isSameTerrain(flat[y * this.cols + x], terrain);
    };
    let mask = 0;
    if (check(tx, ty - 1)) mask |= 1;  // N
    if (check(tx + 1, ty)) mask |= 2;  // E
    if (check(tx, ty + 1)) mask |= 4;  // S
    if (check(tx - 1, ty)) mask |= 8;  // W
    return mask;
  }

  _refreshTerrainCell(tx, ty, terrain) {
    const gid = resolveTerrainGid(terrain, this._computeBitmask(tx, ty, terrain));
    this._setGid(tx, ty, gid);
  }

  _refreshTerrainBlock(tx, ty, terrain) {
    // Update the painted cell and its 4 cardinal neighbours.
    const cells = [
      [tx, ty],
      [tx, ty - 1], [tx + 1, ty], [tx, ty + 1], [tx - 1, ty],
    ];
    for (const [x, y] of cells) {
      if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) continue;
      const gid = this.flat[this.activeLayer][y * this.cols + x];
      if (isSameTerrain(gid, terrain) || (x === tx && y === ty)) {
        this._refreshTerrainCell(x, y, terrain);
      }
    }
  }

  setLayer(name) {
    if (!LAYERS.includes(name)) return;
    this.activeLayer = name;
    // Highlight the active layer visually: non-active layer stays visible but dim.
    this.floorLayer.setAlpha(name === 'floor' ? 1 : 0.55);
    this.pathLayer.setAlpha(name === 'path' ? 1 : 0.6);
    this.wallsLayer.setAlpha(name === 'walls' ? 1 : 0.7);
    this.overlayLayer.setAlpha(name === 'overlay' ? 1 : 0.6);
    this.topLayer.setAlpha(name === 'top' ? 1 : 0.6);
    window.__setEditor_updateLayer?.(name);
    this.notifyHover();
  }

  // --- Undo / redo -------------------------------------------------------

  pushHistory() {
    this.history.push({
      floor: this.flat.floor.slice(),
      path: this.flat.path.slice(),
      walls: this.flat.walls.slice(),
      overlay: this.flat.overlay.slice(),
      top: this.flat.top.slice(),
    });
    if (this.history.length > UNDO_CAP) this.history.shift();
    this.future.length = 0;
  }

  undo() {
    if (!this.history.length) return;
    this.future.push({
      floor: this.flat.floor.slice(),
      path: this.flat.path.slice(),
      walls: this.flat.walls.slice(),
      overlay: this.flat.overlay.slice(),
      top: this.flat.top.slice(),
    });
    const s = this.history.pop();
    this.applySnapshot(s);
  }

  redo() {
    if (!this.future.length) return;
    this.history.push({
      floor: this.flat.floor.slice(),
      path: this.flat.path.slice(),
      walls: this.flat.walls.slice(),
      overlay: this.flat.overlay.slice(),
      top: this.flat.top.slice(),
    });
    const s = this.future.pop();
    this.applySnapshot(s);
  }

  applySnapshot(s) {
    this.flat.floor = s.floor.slice();
    this.flat.path = s.path.slice();
    this.flat.walls = s.walls.slice();
    this.flat.overlay = s.overlay.slice();
    this.flat.top = s.top.slice();
    this.redrawLayer('floor');
    this.redrawLayer('path');
    this.redrawLayer('walls');
    this.redrawLayer('overlay');
    this.redrawLayer('top');
    this.saveDeferred();
  }

  redrawLayer(name) {
    const layer = this.layerOf(name);
    const flat = this.flat[name];
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const gid = flat[y * this.cols + x];
        if (gid) layer.putTileAt(gid, x, y);
        else layer.removeTileAt(x, y, false);
      }
    }
  }

  clearActiveLayer() {
    this.pushHistory();
    this.flat[this.activeLayer].fill(0);
    this.redrawLayer(this.activeLayer);
    this.saveDeferred();
    window.__setEditor_showToast?.(`Capa "${this.activeLayer}" limpiada`, 'success');
  }

  revertToDisk() {
    if (!confirm('Discard unsaved edits and reload from disk?')) return;
    clearLevelOverride(this.levelKey);
    this.scene.restart();
  }

  // --- Save / play-test --------------------------------------------------

  serialize() {
    return {
      version: 1,
      cols: this.cols, rows: this.rows, tile: 16,
      tilesets: TILESETS.map(t => t.name),
      layers: {
        floor: this.flat.floor.slice(),
        path: this.flat.path.slice(),
        walls: this.flat.walls.slice(),
        overlay: this.flat.overlay.slice(),
        top: this.flat.top.slice(),
      },
      spawn: this.spawn,
      objects: this.objects.slice(),
      weather: this.weather,
      introPoints: this.introPoints.slice(),
    };
  }

  save() {
    const data = this.serialize();
    writeLevelJson(this.levelKey, data);
    this.markDirty(false);
    window.__setEditor_updateSummary?.(this.getSummary());

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.levelKey}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    window.__setEditor_showToast?.('Nivel guardado', 'success');
  }

  playTest() {
    this.doSave();
    const targetScene = this.levelKey === 'nivel0' ? 'Nivel0'
                      : this.levelKey === 'gym' ? 'Gym'
                      : this.levelKey === 'main' ? 'Main'
                      : 'Custom';
    this.scene.start(targetScene, { levelKey: this.levelKey, returnScreen: this.returnScreen });
  }

  // --- Mode switching ----------------------------------------------------

  setMode(mode) {
    this.edMode = mode;
    window.__setEditor_updateMode?.(mode);
    this.notifyHover();
  }

  setWeather(cfg) {
    this.weather = { ...cfg };
    destroyWeather(this);
    if (Object.values(this.weather).some(v => v > 0)) {
      createWeather(this, this.weather);
    }
    this.saveDeferred();
  }

  _inBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.cols && y < this.rows;
  }

  _getOccupancy(tx, ty, occupyW, occupyH) {
    const startTx = tx - Math.floor((occupyW - 1) / 2);
    const endTx = startTx + occupyW - 1;
    const startTy = ty - (occupyH - 1);
    const endTy = ty;
    return { startTx, startTy, endTx, endTy };
  }

  _removeObjectsInFootprint(startTx, startTy, endTx, endTy) {
    const toRemove = [];
    for (const obj of this.objects) {
      const objDef = OBJECTS.find(o => o.key === obj.key);
      const { occupyW: occW, occupyH: occH } = getFrameDimensions(objDef, obj.frame);
      const occ = this._getOccupancy(obj.tx, obj.ty, occW, occH);
      if (occ.startTx <= endTx && occ.endTx >= startTx && occ.startTy <= endTy && occ.endTy >= startTy) {
        toRemove.push(obj);
      }
    }
    for (const obj of toRemove) {
      const key = `${obj.tx},${obj.ty}`;
      const s = this.objectSprites.get(key);
      if (s) { this.tweens.killTweensOf(s); s.destroy(); this.objectSprites.delete(key); }
      this.objects = this.objects.filter(o => !(o.tx === obj.tx && o.ty === obj.ty));
    }
  }

  _hasObjectCollision(startTx, startTy, endTx, endTy) {
    for (const obj of this.objects) {
      const objDef = OBJECTS.find(o => o.key === obj.key);
      const { occupyW: occW, occupyH: occH } = getFrameDimensions(objDef, obj.frame);
      const occ = this._getOccupancy(obj.tx, obj.ty, occW, occH);
      if (occ.startTx <= endTx && occ.endTx >= startTx && occ.startTy <= endTy && occ.endTy >= startTy) {
        return true;
      }
    }
    return false;
  }

  // --- Object placement --------------------------------------------------

  _renderAllObjects() {
    for (const [, s] of this.objectSprites) s.destroy();
    this.objectSprites.clear();
    for (const obj of this.objects) this._renderObject(obj);
  }

  _renderObject(obj) {
    const objDef = OBJECTS.find(o => o.key === obj.key);
    const safeFrame = getValidFrame(objDef, obj.frame);
    const { occupyW: occW } = getFrameDimensions(objDef, safeFrame);
    const startTx = obj.tx - Math.floor((occW - 1) / 2);
    const cx = startTx * TILE + (occW * TILE) / 2;
    const cy = obj.ty * TILE + TILE;
    const depth = obj.ty * this.cols + obj.tx + 2000;
    const s = this.add.sprite(cx, cy, obj.key, safeFrame)
      .setOrigin(0.5, 1)
      .setDepth(depth);

    const animKey = deriveAnimKey(obj.key, obj.frame);
    if (this.anims.exists(animKey)) {
      s.anims.play(animKey);
    } else if (obj.type === 'pickup_with_animation') {
      this.tweens.add({ targets: s, y: cy - 2, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    this.objectSprites.set(`${obj.tx},${obj.ty}`, s);
  }

  _placeObject(tx, ty, key = null, frame = null, objType = null, objSolid = null) {
    const k = key ?? this.selectedObject.key;
    const f = frame ?? this.selectedObject.frame;
    const t = objType ?? this.selectedObject.type;
    const solid = objSolid ?? this.selectedObject.solid ?? false;
    const objDef = OBJECTS.find(o => o.key === k);
    const { occupyW: occW, occupyH: occH } = getFrameDimensions(objDef, f);
    const { startTx, startTy, endTx, endTy } = this._getOccupancy(tx, ty, occW, occH);

    for (let y = startTy; y <= endTy; y++) {
      for (let x = startTx; x <= endTx; x++) {
        if (!this._inBounds(x, y)) {
          window.__setEditor_showToast?.('Fuera del mapa', 'error');
          return;
        }
        if (this.flat.walls[y * this.cols + x] !== 0) {
          window.__setEditor_showToast?.('Hay una pared ahi', 'error');
          return;
        }
      }
    }
    if (this._hasObjectCollision(startTx, startTy, endTx, endTy)) {
      window.__setEditor_showToast?.('Ya hay un objeto ahi', 'error');
      return;
    }

    this._removeObjectsInFootprint(startTx, startTy, endTx, endTy);
    const obj = { tx, ty, key: k, frame: f, type: t };
    if (solid) obj.solid = true;
    this.objects.push(obj);
    this._renderObject(obj);
    this.saveDeferred();
  }

  _objectUnderCursor(tx, ty) {
    return this.objects.find(obj => {
      const objDef = OBJECTS.find(o => o.key === obj.key);
      const { occupyW: occW, occupyH: occH } = getFrameDimensions(objDef, obj.frame);
      const { startTx, startTy, endTx, endTy } = this._getOccupancy(obj.tx, obj.ty, occW, occH);
      return tx >= startTx && tx <= endTx && ty >= startTy && ty <= endTy;
    });
  }

  _removeObject(tx, ty) {
    const targetObj = this._objectUnderCursor(tx, ty);
    if (!targetObj) return;
    const key = `${targetObj.tx},${targetObj.ty}`;
    const s = this.objectSprites.get(key);
    if (s) { this.tweens.killTweensOf(s); s.destroy(); this.objectSprites.delete(key); }
    this.objects = this.objects.filter(o => !(o.tx === targetObj.tx && o.ty === targetObj.ty));
    this.saveDeferred();
  }

  clearAllObjects() {
    if (!this.objects.length) return;
    for (const [, s] of this.objectSprites) { this.tweens.killTweensOf(s); s.destroy(); }
    this.objectSprites.clear();
    this.objects = [];
    this.saveDeferred();
    window.__setEditor_showToast?.('Objetos eliminados', 'success');
  }

  // --- HUD ---------------------------------------------------------------

  _toggleIntroPoint(tx, ty) {
    const idx = this.introPoints.findIndex(p => p.tx === tx && p.ty === ty);
    if (idx >= 0) this.introPoints.splice(idx, 1);
    else this.introPoints.push({ tx, ty });
    this._renderIntroMarkers();
    this.saveDeferred();
  }

  _renderIntroMarkers() {
    for (const s of this.introMarkerSprites) s.destroy();
    this.introMarkerSprites = [];
    for (let i = 0; i < this.introPoints.length; i++) {
      const { tx, ty } = this.introPoints[i];
      const t = this.add.text(tx * TILE + 1, ty * TILE + 1, `${i + 1}`, {
        fontFamily: 'monospace', fontSize: '8px', color: '#ffffff',
        backgroundColor: '#ee6600',
      }).setDepth(95).setScrollFactor(0).setPadding(1, 0, 1, 0);
      this.introMarkerSprites.push(t);
    }
  }

  notifyHover(tx, ty) {
    window.__setEditor_updateHover?.(
      (tx !== undefined && ty !== undefined) ? { tx, ty } : null
    );
  }

  // --- Sistema de seleccion unificada --------------------------------------

  setEditorTab(tab) {
    this.activeEditorTab = tab;
    this.notifyHover();
  }

  setSelection(sel) {
    this.selection = sel;
    this.notifyHover();
    this._updateSelectionUI();
  }

  clearSelection() {
    this.selection = null;
    this._destroySelectionGhost();
    this._updateSelectionUI();
    this.notifyHover();
  }

  setSelectionFromPalette(type, gid, key, frame, objType, objSolid = false) {
    if (type === 'tile') {
      this.setSelection({ type: 'tile', gid, layer: this.activeLayer });
    } else {
      this.setSelection({ type: 'object', key, frame, objType, objSolid });
    }
  }

  _updateSelectionUI() {
    if (!this.selection) {
      window.__setEditor_updateSelected?.(0);
      window.__setEditor_updateObjectSelected?.(null, 0, 'deco');
      this._destroySelectionGhost();
      return;
    }
    if (this.selection.type === 'tile') {
      this.setLayer(this.selection.layer);
      this.selectedGid = this.selection.gid;
      this.activeTerrain = null;
      window.__setEditor_updateSelected?.(this.selection.gid);
    } else {
      this.selectedObject = {
        key: this.selection.key,
        frame: this.selection.frame,
        type: this.selection.objType,
        solid: this.selection.objSolid ?? false,
      };
      window.__setEditor_updateObjectSelected?.(this.selection.key, this.selection.frame, this.selection.objType, this.selection.objSolid ?? false);
    }
  }

  // --- Esc handling (doble Esc vuelve al menu) ---------------------------

  _handleEsc() {
    if (this.selection || this.edMode !== 'tile') {
      // Primer Esc: limpia seleccion/modo
      this.clearSelection();
      if (this.edMode !== 'tile') this.setMode('tile');
      this.escTimer = setTimeout(() => { this.escTimer = null; }, 1500);
    } else if (this.escTimer) {
      // Segundo Esc dentro de 1.5s: vuelve al menu
      clearTimeout(this.escTimer);
      this.escTimer = null;
      this.exitToMenu();
    } else {
      // Sin seleccion y sin timer: iniciar timer para el doble Esc
      this.escTimer = setTimeout(() => { this.escTimer = null; }, 1500);
    }
  }

  // --- Hover ------------------------------------------------------------

  updateHover(tx, ty, p) {
    const inBounds = (x, y) => x >= 0 && y >= 0 && x < this.cols && y < this.rows;
    if (this.dragState?.active) {
      this.hoverRect.setVisible(false);
      this._destroyHoverGhost();
      window.__setEditor_hideLayerPicker?.();
      return;
    }
    if (this.edMode === 'spawn' || this.edMode === 'intro') {
      this.hoverRect.setPosition(tx * TILE, ty * TILE).setSize(TILE, TILE);
      this.hoverRect.setStrokeStyle(1, 0xffee88, 1);
      this.hoverRect.setVisible(true);
      this._destroyHoverGhost();
      window.__setEditor_hideLayerPicker?.();
      return;
    }
    if (!inBounds(tx, ty)) {
      this.hoverRect.setVisible(false);
      this._destroyHoverGhost();
      window.__setEditor_hideLayerPicker?.();
      return;
    }

    if (this.selection) {
      this._showPlacementPreview(tx, ty);
    } else {
      this._showSourceHighlight(tx, ty);
    }
  }

  // Con seleccion: muestra preview de colocacion + fantasma del elemento
  _showPlacementPreview(tx, ty) {
    const inBounds = (x, y) => x >= 0 && y >= 0 && x < this.cols && y < this.rows;
    const sel = this.selection;
    let valid = true;
    let startTx, startTy, endTx, endTy;

    if (sel.type === 'object') {
      const objDef = OBJECTS.find(o => o.key === sel.key);
      const { occupyW: occW, occupyH: occH } = getFrameDimensions(objDef, sel.frame);
      ({ startTx, startTy, endTx, endTy } = this._getOccupancy(tx, ty, occW, occH));
      for (let y = startTy; y <= endTy; y++) {
        for (let x = startTx; x <= endTx; x++) {
          if (!inBounds(x, y)) { valid = false; break; }
          if (this.flat.walls[y * this.cols + x] !== 0) { valid = false; break; }
        }
        if (!valid) break;
      }
      if (valid && this._hasObjectCollision(startTx, startTy, endTx, endTy)) valid = false;
    } else {
      startTx = endTx = tx;
      startTy = endTy = ty;
      if (this.flat[this.activeLayer][ty * this.cols + tx] !== 0) valid = true; // tiles pueden sobrescribir
    }

    const width = (endTx - startTx + 1) * TILE;
    const height = (endTy - startTy + 1) * TILE;
    this.hoverRect.setPosition(startTx * TILE, startTy * TILE).setSize(width, height);
    this.hoverRect.setStrokeStyle(1, valid ? 0x00ff00 : 0xff0000, 1);
    this.hoverRect.setVisible(true);
    this._renderHoverGhost(sel, startTx, startTy, endTx, endTy, valid);
    window.__setEditor_hideLayerPicker?.();
  }

  // Sin seleccion: resalta el elemento de la capa activa bajo el cursor
  _showSourceHighlight(tx, ty) {
    const inBounds = (x, y) => x >= 0 && y >= 0 && x < this.cols && y < this.rows;
    const source = this._getSourceAtActiveLayer(tx, ty);
    if (source) {
      const { startTx, startTy, endTx, endTy } = source.bounds;
      const width = (endTx - startTx + 1) * TILE;
      const height = (endTy - startTy + 1) * TILE;
      this.hoverRect.setPosition(startTx * TILE, startTy * TILE).setSize(width, height);
      this.hoverRect.setStrokeStyle(1, source.type === 'object' ? 0x66ff99 : 0xffee88, 1);
      this.hoverRect.setVisible(true);
      this._renderHoverGhost(source, startTx, startTy, endTx, endTy, true);
    } else {
      this.hoverRect.setPosition(tx * TILE, ty * TILE).setSize(TILE, TILE);
      this.hoverRect.setStrokeStyle(1, 0xffee88, 1);
      this.hoverRect.setVisible(true);
      this._destroyHoverGhost();
    }
    const layers = this.getLayersAt(tx, ty);
    if (layers.length > 0) {
      window.__setEditor_showLayerPicker?.(tx, ty, layers);
    } else {
      window.__setEditor_hideLayerPicker?.();
    }
  }

  _renderHoverGhost(sel, startTx, startTy, endTx, endTy, valid) {
    this._destroyHoverGhost();
    const cx = ((startTx + endTx + 1) / 2) * TILE;
    const cy = (endTy + 1) * TILE;
    const w = (endTx - startTx + 1) * TILE;
    const h = (endTy - startTy + 1) * TILE;

    let sprite = null;
    if (sel.type === 'object' || (sel.type === undefined && sel.key)) {
      const key = sel.key;
      const objDef = OBJECTS.find(o => o.key === key);
      const frame = getValidFrame(objDef, sel.frame ?? 0);
      sprite = this.add.sprite(cx, cy, key, frame).setOrigin(0.5, 1).setDepth(99);
    } else {
      const gid = sel.gid;
      const tileset = this.getTilesetForGid(gid);
      if (tileset) {
        const localIdx = getValidFrame({ cols: tileset.cols, rows: tileset.rows }, gid - tileset.firstgid);
        sprite = this.add.sprite(cx, cy - h / 2, tileset.key, localIdx)
          .setOrigin(0.5).setDepth(99);
      }
    }
    if (sprite) {
      sprite.setAlpha(0.45);
      sprite.setSize(w, h);
      if (!valid) sprite.setTint(0xff8888);
      this.hoverGhost = sprite;
    }
  }

  _destroyHoverGhost() {
    if (this.hoverGhost) { this.hoverGhost.destroy(); this.hoverGhost = null; }
  }

  _destroySelectionGhost() {
    if (this.selectionGhost) { this.selectionGhost.destroy(); this.selectionGhost = null; }
  }

  // --- Source / Copy / Paste / Delete -----------------------------------

  _getSourceAtActiveLayer(tx, ty) {
    const inBounds = (x, y) => x >= 0 && y >= 0 && x < this.cols && y < this.rows;
    if (!inBounds(tx, ty)) return null;

    // Buscar objeto bajo el cursor
    const obj = this._objectUnderCursor(tx, ty);
    if (obj) {
      const objDef = OBJECTS.find(o => o.key === obj.key);
      const { occupyW: occW, occupyH: occH } = getFrameDimensions(objDef, obj.frame);
      const bounds = this._getOccupancy(obj.tx, obj.ty, occW, occH);
      return { type: 'object', key: obj.key, frame: obj.frame, objType: obj.type, objSolid: !!obj.solid, bounds };
    }

    // Buscar tile en la capa activa
    const gid = this.flat[this.activeLayer][ty * this.cols + tx];
    if (gid !== 0) {
      return { type: 'tile', gid, layer: this.activeLayer, bounds: { startTx: tx, startTy: ty, endTx: tx, endTy: ty } };
    }
    return null;
  }

  _copyFromSource(source) {
    if (source.type === 'object') {
      const objDef = OBJECTS.find(o => o.key === source.key);
      this.setSelection({ type: 'object', key: source.key, frame: source.frame, objType: source.objType, objSolid: source.objSolid });
      this.setEditorTab('objects');
      this.setMode('object');
      window.__setEditor_syncObjectFromCanvas?.(objDef, source.frame, source.objType, source.objSolid);
    } else {
      this.setSelection({ type: 'tile', gid: source.gid, layer: source.layer });
      this.setEditorTab('tileset');
      this.setMode('tile');
      this.setLayer(source.layer);
      window.__setEditor_syncTileFromCanvas?.(source.gid);
    }
  }

  _tryPaste(tx, ty) {
    const inBounds = (x, y) => x >= 0 && y >= 0 && x < this.cols && y < this.rows;
    const sel = this.selection;
    if (sel.type === 'object') {
      this._placeObject(tx, ty, sel.key, sel.frame, sel.objType, sel.objSolid);
    } else {
      // Tile: coloca el GID en la capa activa
      if (!inBounds(tx, ty)) {
        window.__setEditor_showToast?.('Fuera del mapa', 'error');
        return;
      }
      this.pushHistory();
      this._setGid(tx, ty, sel.gid);
      const terrain = TERRAINS.find(t => isSameTerrain(sel.gid, t));
      if (terrain) this._refreshTerrainBlock(tx, ty, terrain);
      this.saveDeferred();
      window.__setEditor_showToast?.('Tile pegado', 'success');
    }
  }

  _deleteAt(tx, ty) {
    const inBounds = (x, y) => x >= 0 && y >= 0 && x < this.cols && y < this.rows;
    if (!inBounds(tx, ty)) return;
    if (this._objectUnderCursor(tx, ty)) {
      this._removeObject(tx, ty);
      return;
    }
    // Borrar tile de la capa activa
    const i = ty * this.cols + tx;
    if (this.flat[this.activeLayer][i] !== 0) {
      this.pushHistory();
      this._setGid(tx, ty, 0);
      this.saveDeferred();
    }
  }

  // --- Drag (mover) -----------------------------------------------------

  startDrag() {
    if (!this.dragState || this.dragState.active || this.dragState.dragDisabled) return;
    const { source } = this.dragState;
    if (!source) { this.dragState.dragDisabled = true; return; }

    this.dragState.active = true;
    this.painting = null;

    if (source.type === 'object') {
      const objDef = OBJECTS.find(o => o.key === source.key);
      const safeFrame = getValidFrame(objDef, source.frame);
      const { occupyW: occW, occupyH: occH } = getFrameDimensions(objDef, source.frame);
      this.dragGhost = this.add.sprite(
        source.bounds.startTx * TILE + ((source.bounds.endTx - source.bounds.startTx + 1) * TILE) / 2,
        (source.bounds.endTy + 1) * TILE,
        source.key, safeFrame
      ).setOrigin(0.5, 1).setDepth(200).setAlpha(0.85);
      this.dragSource = { type: 'object', key: source.key, frame: source.frame, objType: source.objType, objDef, occW, occH, tx: source.bounds.startTx + Math.floor((source.bounds.endTx - source.bounds.startTx) / 2), ty: source.bounds.endTy };
    } else {
      const tileset = this.getTilesetForGid(source.gid);
      if (tileset) {
        const localIdx = getValidFrame({ cols: tileset.cols, rows: tileset.rows }, source.gid - tileset.firstgid);
        this.dragGhost = this.add.sprite(source.bounds.startTx * TILE + TILE / 2, source.bounds.startTy * TILE + TILE / 2, tileset.key, localIdx)
          .setOrigin(0.5).setDepth(200).setAlpha(0.85);
      }
      this.dragSource = { type: 'tile', layer: source.layer, gid: source.gid, tx: source.bounds.startTx, ty: source.bounds.startTy };
    }
  }

  updateDrag(tx, ty, p) {
    if (!this.dragGhost) return;
    this.dragGhost.setPosition(p.worldX, p.worldY);
    const inBounds = (x, y) => x >= 0 && y >= 0 && x < this.cols && y < this.rows;
    this.dragGhost.setTint(inBounds(tx, ty) ? 0xffffff : 0xff8888);

    const src = this.dragSource;
    if (!src) return;

    // Ocultar el rect si el destino coincide con el origen (no es un movimiento).
    if (tx === src.tx && ty === src.ty) {
      this.hoverRect.setVisible(false);
      return;
    }

    let startTx, startTy, endTx, endTy;
    if (src.type === 'object') {
      const occ = this._getOccupancy(tx, ty, src.occW, src.occH);
      startTx = occ.startTx; startTy = occ.startTy; endTx = occ.endTx; endTy = occ.endTy;
    } else {
      startTx = endTx = tx;
      startTy = endTy = ty;
    }

    let valid = inBounds(tx, ty);
    if (valid && src.type === 'object') {
      for (let y = startTy; y <= endTy && valid; y++) {
        for (let x = startTx; x <= endTx && valid; x++) {
          if (!this._inBounds(x, y) || this.flat.walls[y * this.cols + x] !== 0) valid = false;
        }
      }
      if (valid && this._hasObjectCollision(startTx, startTy, endTx, endTy)) valid = false;
    }

    const width = (endTx - startTx + 1) * TILE;
    const height = (endTy - startTy + 1) * TILE;
    this.hoverRect.setPosition(startTx * TILE, startTy * TILE).setSize(width, height);
    this.hoverRect.setStrokeStyle(1, valid ? (src.type === 'object' ? 0x66ff99 : 0xffee88) : 0xff0000, 1);
    this.hoverRect.setVisible(true);
  }

  endDrag(tx, ty) {
    if (!this.dragState?.active || !this.dragSource) {
      this.cancelDrag();
      return;
    }
    const inBounds = (x, y) => x >= 0 && y >= 0 && x < this.cols && y < this.rows;
    const src = this.dragSource;
    if (!inBounds(tx, ty) || (tx === src.tx && ty === src.ty)) {
      this.cancelDrag();
      return;
    }
    this.pushHistory();

    if (src.type === 'object') {
      // Buscar y remover el objeto origen
      const objIdx = this.objects.findIndex(o => o.key === src.key && o.frame === src.frame && o.tx === src.tx && o.ty === src.ty);
      if (objIdx >= 0) {
        const removed = this.objects.splice(objIdx, 1)[0];
        const s = this.objectSprites.get(`${src.tx},${src.ty}`);
        if (s) { this.tweens.killTweensOf(s); s.destroy(); this.objectSprites.delete(`${src.tx},${src.ty}`); }
        // Colocar en destino
        const objDef = OBJECTS.find(o => o.key === removed.key);
        const { occupyW: occW, occupyH: occH } = getFrameDimensions(objDef, removed.frame);
        const { startTx, startTy, endTx, endTy } = this._getOccupancy(tx, ty, occW, occH);
        let valid = true;
        for (let y = startTy; y <= endTy; y++) {
          for (let x = startTx; x <= endTx; x++) {
            if (!inBounds(x, y)) { valid = false; break; }
            if (this.flat.walls[y * this.cols + x] !== 0) { valid = false; break; }
          }
          if (!valid) break;
        }
        if (!valid || this._hasObjectCollision(startTx, startTy, endTx, endTy)) {
          // Cancelar: restaurar origen
          this.objects.splice(objIdx, 0, removed);
          this._renderObject(removed);
          this.cancelDrag();
          window.__setEditor_showToast?.('No se puede mover ahi', 'error');
          return;
        }
        this._removeObjectsInFootprint(startTx, startTy, endTx, endTy);
        const newObj = { tx, ty, key: removed.key, frame: removed.frame, type: removed.type };
        if (removed.solid) newObj.solid = true;
        this.objects.push(newObj);
        this._renderObject(newObj);
        window.__setEditor_showToast?.('Objeto movido', 'success');
      }
    } else {
      // Tile
      const terrain = TERRAINS.find(t => isSameTerrain(src.gid, t));
      this._setGid(src.tx, src.ty, 0);
      if (terrain) this._refreshTerrainBlock(src.tx, src.ty, terrain);
      this._setGid(tx, ty, src.gid);
      if (terrain) this._refreshTerrainBlock(tx, ty, terrain);
      window.__setEditor_showToast?.('Tile movido', 'success');
    }
    this.saveDeferred();
    this.cancelDrag();
  }

  cancelDrag() {
    if (this.dragGhost) { this.dragGhost.destroy(); this.dragGhost = null; }
    this.dragSource = null;
    this.hoverRect.setVisible(false);
  }

  // --- Save / dirty -----------------------------------------------------

  markDirty(dirty) {
    this.dirty = dirty;
    window.__setEditor_markDirty?.(dirty);
  }

  saveDeferred() {
    this.markDirty(true);
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.doSave(), 600);
  }

  doSave() {
    if (!this.dirty) return;
    if (this.saveTimer) { clearTimeout(this.saveTimer); this.saveTimer = null; }
    writeLevelJson(this.levelKey, this.serialize());
    this.markDirty(false);
    window.__setEditor_updateSummary?.(this.getSummary());
  }

  // --- Misc -------------------------------------------------------------

  getSummary() {
    const pickups = this.objects.filter(o => o.type === 'pickup' || o.type === 'pickup_with_animation').length;
    return {
      pickups,
      objects: this.objects.length - pickups,
      hasSpawn: this.spawn && this.spawn.tx >= 0 && this.spawn.ty >= 0,
    };
  }

  getTilesetForGid(gid) {
    if (!gid) return null;
    return TILESETS.find(t => gid >= t.firstgid && gid < t.firstgid + t.cols * t.rows) || null;
  }

  getLayersAt(tx, ty) {
    const i = ty * this.cols + tx;
    const stack = [];
    for (const obj of this.objects) {
      const objDef = OBJECTS.find(o => o.key === obj.key);
      if (!objDef) continue;
      const { occupyW: occW, occupyH: occH } = getFrameDimensions(objDef, obj.frame);
      const occ = this._getOccupancy(obj.tx, obj.ty, occW, occH);
      if (tx >= occ.startTx && tx <= occ.endTx && ty >= occ.startTy && ty <= occ.endTy) {
        stack.push({ type: 'object', key: obj.key, frame: obj.frame, objType: obj.type, objDef });
      }
    }
    const order = ['top', 'overlay', 'walls', 'path', 'floor'];
    for (const layer of order) {
      const gid = this.flat[layer][i];
      if (gid !== 0) {
        stack.push({ type: 'tile', layer, gid, tileset: this.getTilesetForGid(gid) });
      }
    }
    return stack;
  }
}
