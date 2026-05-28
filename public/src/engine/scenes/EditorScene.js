import { TILE, COLS, ROWS } from '../../config/game.js';
import {
  TILESETS, TILESET_CATEGORIES, TERRAINS, OBJECTS, OBJECT_CATEGORIES, VARIANT_DEFS,
  expandLayer, flatToRows, isSameTerrain, resolveTerrainGid,
} from '../../engine/level/TileRegistry.js';
import { loadLevel } from '../../engine/level/TileLevelLoader.js';
import {
  readLevelJson, writeLevelJson, clearLevelOverride,
  createNewLevel, getCustomLevels, addCustomLevel,
} from '../../services/Storage.js';
import { createWeather, destroyWeather } from '../../engine/level/WeatherSystem.js';
import { deriveAnimKey } from '../../engine/entities/WorldObjectView.js';

const LAYERS = ['floor', 'walls'];
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
    this.wallsLayer = level.wallsLayer;
    this.flat = level.flat;           // { floor:[], walls:[] }
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

    // Object mode state
    this.edMode = 'tile';             // 'tile' | 'object' | 'spawn'
    this.objects = (level.objects ?? []).slice();
    this.objectSprites = new Map();   // "tx,ty" → Phaser sprite
    this.selectedObject = { key: 'plants', frame: 0, type: 'deco' };
    this._renderAllObjects();

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

    this.hudText = this.add.text(4, 4, '', {
      fontFamily: 'monospace', fontSize: '8px', color: '#ffee88', backgroundColor: '#000a',
    }).setDepth(102).setPadding(2, 1, 2, 1).setScrollFactor(0);

    // DOM palette -----------------------------------------------------------
    window.__setEditor?.({
      levelKey: this.levelKey,
      tilesets: TILESETS,
      tilesetCategories: TILESET_CATEGORIES,
      terrains: TERRAINS,
      objects:  OBJECTS,
      variantDefs: VARIANT_DEFS,
      categories: OBJECT_CATEGORIES,
      onSelect:       (gid)     => { this.activeTerrain = null; this.selectedGid = gid; this.setMode('tile'); this.updateHud(); },
      onTerrain:      (terrain) => { this.activeTerrain = terrain; this.setMode('tile'); this.updateHud(); window.__setEditor_updateTerrain?.(terrain?.name ?? null); },
      onLayer:        (layer)   => this.setLayer(layer),
      onSave:         () => this.save(),
      onPlay:         () => this.playTest(),
      onMenu:         () => this.scene.start('Menu', { screen: this.returnScreen }),
      onMenu:         () => this.scene.start('Menu', { screen: this.returnScreen }),
      onClear:        () => this.clearActiveLayer(),
      onUndo:         () => this.undo(),
      onRedo:         () => this.redo(),
      onRevert:       () => this.revertToDisk(),
      getLayer:       () => this.activeLayer,
      onObjectSelect: (key, frame, type) => { this.selectedObject = { key, frame, type }; this.setMode('object'); },
      onObjectTypeChange: (type) => { this.selectedObject.type = type; this.updateHud(); },
      onSpawnMode:    () => this.setMode('spawn'),
      getMode:        () => this.edMode,
      getWeather:     () => this.weather,
      onWeatherChange:(cfg) => this.setWeather(cfg),
    });

    // Pointer input ---------------------------------------------------------
    const inBounds = (tx, ty) => tx >= 0 && ty >= 0 && tx < this.cols && ty < this.rows;
    const tileAt = (p) => ({ tx: Math.floor(p.worldX / TILE), ty: Math.floor(p.worldY / TILE) });

    this.input.mouse?.disableContextMenu?.();

    this.input.on('pointermove', (p) => {
      const { tx, ty } = tileAt(p);
      if (inBounds(tx, ty)) {
        if (this.edMode === 'object') {
          const objDef = OBJECTS.find(o => o.key === this.selectedObject.key);
          const occW = objDef.occupyW ?? Math.ceil(objDef.frameW / TILE);
          const occH = objDef.occupyH ?? Math.ceil(objDef.frameH / TILE);
          const { startTx, startTy, endTx, endTy } = this._getOccupancy(tx, ty, occW, occH);

          let valid = true;
          for (let y = startTy; y <= endTy; y++) {
            for (let x = startTx; x <= endTx; x++) {
              if (!inBounds(x, y)) { valid = false; break; }
              if (this.flat.walls[y * this.cols + x] !== 0) { valid = false; break; }
            }
            if (!valid) break;
          }
          if (valid && this._hasObjectCollision(startTx, startTy, endTx, endTy)) valid = false;

          const width = (endTx - startTx + 1) * TILE;
          const height = (endTy - startTy + 1) * TILE;
          this.hoverRect.setPosition(startTx * TILE, startTy * TILE).setSize(width, height);
          this.hoverRect.setStrokeStyle(1, valid ? 0x00ff00 : 0xff0000, 1);
          this.hoverRect.setVisible(true);
        } else {
          this.hoverRect.setPosition(tx * TILE, ty * TILE).setSize(TILE, TILE);
          this.hoverRect.setStrokeStyle(1, 0xffee88, 1);
          this.hoverRect.setVisible(true);
          if (this.painting && this.edMode === 'tile') this.paintAt(tx, ty, this.painting);
        }
      } else {
        this.hoverRect.setVisible(false);
      }
      this.updateHud(tx, ty);
    });

    this.input.on('pointerdown', (p) => {
      const { tx, ty } = tileAt(p);
      if (!inBounds(tx, ty)) return;

      if (this.edMode === 'spawn') {
        this.spawn = { tx, ty };
        this.spawnMarker.setPosition(tx * TILE, ty * TILE);
        this.spawnLabel.setPosition(tx * TILE + 2, ty * TILE + 2);
        this.setMode('tile');
        writeLevelJson(this.levelKey, this.serialize());
        return;
      }

      if (this.edMode === 'object') {
        if (p.rightButtonDown()) {
          this._removeObject(tx, ty);
        } else {
          this._placeObject(tx, ty);
        }
        writeLevelJson(this.levelKey, this.serialize());
        return;
      }

      const mode = p.rightButtonDown() ? 'erase' : 'paint';
      this.pushHistory();
      this.painting = mode;
      this.paintAt(tx, ty, mode);
    });

    this.input.on('pointerup', () => { this.painting = null; });
    this.input.on('pointerupoutside', () => { this.painting = null; });

    // Keyboard --------------------------------------------------------------
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = this.input.keyboard.addKeys({
      ONE: K.ONE, TWO: K.TWO, E: K.E, G: K.G,
      S: K.S, Z: K.Z, Y: K.Y, P: K.P, ESC: K.ESC,
      C: K.C, O: K.O,
    });
    this.keys.ONE.on('down', () => this.setLayer('floor'));
    this.keys.TWO.on('down', () => this.setLayer('walls'));
    this.keys.G.on('down',   () => { this.gridVisible = !this.gridVisible; this.grid.setVisible(this.gridVisible); });
    this.keys.E.on('down',   () => this.eyedrop());
    this.keys.P.on('down',   () => this.playTest());
    this.keys.ESC.on('down', () => this.scene.start('Menu', { screen: this.returnScreen }));
    this.keys.S.on('down',   (ev) => { if (!ev.ctrlKey) this.setMode(this.edMode === 'spawn' ? 'tile' : 'spawn'); });
    this.keys.O.on('down',   () => this.setMode(this.edMode === 'object' ? 'tile' : 'object'));
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
    });

    this.setLayer(this.activeLayer);
    this.updateHud();
  }

  drawGrid() {
    this.grid.clear();
    this.grid.lineStyle(1, 0xffee88, 0.12);
    for (let x = 0; x <= this.cols; x++) this.grid.lineBetween(x * TILE, 0, x * TILE, this.rows * TILE);
    for (let y = 0; y <= this.rows; y++) this.grid.lineBetween(0, y * TILE, this.cols * TILE, y * TILE);
  }

  // --- Painting ----------------------------------------------------------

  layerOf(name) { return name === 'floor' ? this.floorLayer : this.wallsLayer; }

  paintAt(tx, ty, mode) {
    if (this.activeTerrain && mode === 'paint') {
      this._terrainPaint(tx, ty);
    } else if (this.activeTerrain && mode === 'erase') {
      this._terrainErase(tx, ty);
    } else {
      const gid = mode === 'erase' ? 0 : this.selectedGid;
      this._setGid(tx, ty, gid);
    }
    writeLevelJson(this.levelKey, this.serialize());
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

  eyedrop() {
    if (!this.hoverRect.visible) return;
    const tx = this.hoverRect.x / TILE | 0;
    const ty = this.hoverRect.y / TILE | 0;
    const gid = this.flat[this.activeLayer][ty * this.cols + tx];
    if (gid) { this.selectedGid = gid; this.updateHud(); window.__setEditor_updateSelected?.(gid); }
  }

  setLayer(name) {
    if (!LAYERS.includes(name)) return;
    this.activeLayer = name;
    // Highlight the active layer visually: non-active layer stays visible but dim.
    this.floorLayer.setAlpha(name === 'floor' ? 1 : 0.55);
    this.wallsLayer.setAlpha(name === 'walls' ? 1 : 0.7);
    window.__setEditor_updateLayer?.(name);
    this.updateHud();
  }

  // --- Undo / redo -------------------------------------------------------

  pushHistory() {
    this.history.push({ floor: this.flat.floor.slice(), walls: this.flat.walls.slice() });
    if (this.history.length > UNDO_CAP) this.history.shift();
    this.future.length = 0;
  }

  undo() {
    if (!this.history.length) return;
    this.future.push({ floor: this.flat.floor.slice(), walls: this.flat.walls.slice() });
    const s = this.history.pop();
    this.applySnapshot(s);
  }

  redo() {
    if (!this.future.length) return;
    this.history.push({ floor: this.flat.floor.slice(), walls: this.flat.walls.slice() });
    const s = this.future.pop();
    this.applySnapshot(s);
  }

  applySnapshot(s) {
    this.flat.floor = s.floor.slice();
    this.flat.walls = s.walls.slice();
    this.redrawLayer('floor');
    this.redrawLayer('walls');
    writeLevelJson(this.levelKey, this.serialize());
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
    if (!confirm(`Clear "${this.activeLayer}" layer?`)) return;
    this.pushHistory();
    this.flat[this.activeLayer].fill(0);
    this.redrawLayer(this.activeLayer);
    writeLevelJson(this.levelKey, this.serialize());
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
        walls: this.flat.walls.slice(),
      },
      spawn: this.spawn,
      objects: this.objects.slice(),
      weather: this.weather,
    };
  }

  save() {
    const data = this.serialize();
    writeLevelJson(this.levelKey, data);

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.levelKey}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  playTest() {
    writeLevelJson(this.levelKey, this.serialize());
    const targetScene = this.levelKey === 'gym' ? 'Gym' 
                      : this.levelKey === 'main' ? 'Main'
                      : 'Custom';
    this.scene.start(targetScene, { levelKey: this.levelKey, returnScreen: this.returnScreen });
  }

  // --- Mode switching ----------------------------------------------------

  setMode(mode) {
    this.edMode = mode;
    window.__setEditor_updateMode?.(mode);
    this.updateHud();
  }

  setWeather(cfg) {
    this.weather = { ...cfg };
    destroyWeather(this);
    if (Object.values(this.weather).some(v => v > 0)) {
      createWeather(this, this.weather);
    }
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
      const occW = objDef.occupyW ?? Math.ceil(objDef.frameW / TILE);
      const occH = objDef.occupyH ?? Math.ceil(objDef.frameH / TILE);
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
      const occW = objDef.occupyW ?? Math.ceil(objDef.frameW / TILE);
      const occH = objDef.occupyH ?? Math.ceil(objDef.frameH / TILE);
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
    const occW = objDef?.occupyW ?? Math.ceil((objDef?.frameW ?? TILE) / TILE);
    const startTx = obj.tx - Math.floor((occW - 1) / 2);
    const cx = startTx * TILE + (occW * TILE) / 2;
    const cy = obj.ty * TILE + TILE;
    const depth = obj.ty * this.cols + obj.tx + 2000;
    const s = this.add.sprite(cx, cy, obj.key, obj.frame)
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

  _placeObject(tx, ty) {
    const objDef = OBJECTS.find(o => o.key === this.selectedObject.key);
    const occW = objDef.occupyW ?? Math.ceil(objDef.frameW / TILE);
    const occH = objDef.occupyH ?? Math.ceil(objDef.frameH / TILE);
    const { startTx, startTy, endTx, endTy } = this._getOccupancy(tx, ty, occW, occH);

    for (let y = startTy; y <= endTy; y++) {
      for (let x = startTx; x <= endTx; x++) {
        if (!this._inBounds(x, y)) return;
        if (this.flat.walls[y * this.cols + x] !== 0) return;
      }
    }
    if (this._hasObjectCollision(startTx, startTy, endTx, endTy)) return;

    this._removeObjectsInFootprint(startTx, startTy, endTx, endTy);
    const obj = { tx, ty, key: this.selectedObject.key, frame: this.selectedObject.frame, type: this.selectedObject.type };
    this.objects.push(obj);
    this._renderObject(obj);
  }

  _removeObject(tx, ty) {
    const targetObj = this.objects.find(obj => {
      const objDef = OBJECTS.find(o => o.key === obj.key);
      const occW = objDef.occupyW ?? Math.ceil(objDef.frameW / TILE);
      const occH = objDef.occupyH ?? Math.ceil(objDef.frameH / TILE);
      const { startTx, startTy, endTx, endTy } = this._getOccupancy(obj.tx, obj.ty, occW, occH);
      return tx >= startTx && tx <= endTx && ty >= startTy && ty <= endTy;
    });

    if (!targetObj) return;
    const key = `${targetObj.tx},${targetObj.ty}`;
    const s = this.objectSprites.get(key);
    if (s) { this.tweens.killTweensOf(s); s.destroy(); this.objectSprites.delete(key); }
    this.objects = this.objects.filter(o => !(o.tx === targetObj.tx && o.ty === targetObj.ty));
  }

  // --- HUD ---------------------------------------------------------------

  updateHud(tx, ty) {
    const modeHint = this.edMode === 'spawn'
      ? 'CLICK TILE TO SET SPAWN'
      : this.edMode === 'object'
        ? `obj: ${this.selectedObject.key} f${this.selectedObject.frame} (${this.selectedObject.type})`
        : (this.activeTerrain ? `terrain: ${this.activeTerrain.label}` : `gid ${this.selectedGid}`);
    const parts = [
      `editing ${this.levelKey}`,
      `layer ${this.activeLayer}`,
      modeHint,
    ];
    if (tx !== undefined && ty !== undefined) parts.push(`tile ${tx},${ty}`);
    parts.push('[1/2] layer  [E] eyedrop  [S] spawn  [O] objects  [G] grid  [Ctrl+S] save  [P] play  [Esc] menu');
    this.hudText.setText(parts.join('  ·  '));
  }
}
