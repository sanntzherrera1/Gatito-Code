import { TILE, COLS, ROWS } from '../main.js';
import {
  TILESETS, TERRAINS, OBJECTS, readLevelJson, writeLevelJson, clearLevelOverride,
  expandLayer, flatToRows, loadLevel, isSameTerrain, resolveTerrainGid,
} from '../level/TileLevel.js';

const LAYERS = ['floor', 'walls'];
const UNDO_CAP = 50;

export class EditorScene extends Phaser.Scene {
  constructor() { super('Editor'); }

  init(data) {
    this.levelKey     = data?.levelKey     ?? 'gym';
    this.returnScreen = data?.returnScreen ?? 'main';
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

    this.activeLayer = 'walls';
    this.selectedGid = 105;
    this.activeTerrain = null;
    this.painting = null;
    this.history = [];
    this.future = [];

    // Object mode state
    this.edMode = 'tile';             // 'tile' | 'object' | 'spawn'
    this.objects = (level.objects ?? []).slice();
    this.objectSprites = new Map();   // "tx,ty" → Phaser sprite
    this.selectedObject = { key: 'plants', frame: 0, type: 'pickup' };
    this._renderAllObjects();

    this.spawnMarker = this.add.rectangle(
      this.spawn.tx * TILE, this.spawn.ty * TILE, TILE, TILE
    ).setStrokeStyle(1, 0x66ff99, 0.9).setOrigin(0).setDepth(90);
    this.spawnLabel = this.add.text(this.spawn.tx * TILE + 2, this.spawn.ty * TILE + 2, 'S', {
      fontFamily: 'monospace', fontSize: '8px', color: '#66ff99',
    }).setDepth(91);

    // Hover + grid overlays
    this.grid = this.add.graphics().setDepth(100);
    this.drawGrid();
    this.gridVisible = true;
    this.hoverRect = this.add.rectangle(0, 0, TILE, TILE)
      .setStrokeStyle(1, 0xffee88, 1).setOrigin(0).setDepth(101).setVisible(false);
    this.activeLayerRect = this.add.rectangle(0, 0, TILE, TILE, 0xffee88, 0.18)
      .setOrigin(0).setDepth(99).setVisible(false);

    this.hudText = this.add.text(4, 4, '', {
      fontFamily: 'monospace', fontSize: '8px', color: '#ffee88', backgroundColor: '#000a',
    }).setDepth(102).setPadding(2, 1, 2, 1);

    // DOM palette -----------------------------------------------------------
    window.__setEditor?.({
      levelKey: this.levelKey,
      tilesets: TILESETS,
      terrains: TERRAINS,
      objects:  OBJECTS,
      onSelect:       (gid)     => { this.activeTerrain = null; this.selectedGid = gid; this.updateHud(); },
      onTerrain:      (terrain) => { this.activeTerrain = terrain; this.updateHud(); window.__setEditor_updateTerrain?.(terrain?.name ?? null); },
      onLayer:        (layer)   => this.setLayer(layer),
      onSave:         () => this.save(),
      onPlay:         () => this.playTest(),
      onMenu:         () => this.scene.start('Menu', { screen: this.returnScreen }),
      onClear:        () => this.clearActiveLayer(),
      onUndo:         () => this.undo(),
      onRedo:         () => this.redo(),
      onRevert:       () => this.revertToDisk(),
      getLayer:       () => this.activeLayer,
      onObjectSelect: (key, frame, type) => { this.selectedObject = { key, frame, type }; this.setMode('object'); },
      onSpawnMode:    () => this.setMode('spawn'),
      getMode:        () => this.edMode,
    });

    // Pointer input ---------------------------------------------------------
    const inBounds = (tx, ty) => tx >= 0 && ty >= 0 && tx < this.cols && ty < this.rows;
    const tileAt = (p) => ({ tx: Math.floor(p.worldX / TILE), ty: Math.floor(p.worldY / TILE) });

    this.input.mouse?.disableContextMenu?.();

    this.input.on('pointermove', (p) => {
      const { tx, ty } = tileAt(p);
      if (inBounds(tx, ty)) {
        this.hoverRect.setPosition(tx * TILE, ty * TILE).setVisible(true);
        if (this.painting && this.edMode === 'tile') this.paintAt(tx, ty, this.painting);
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
    const flat = this.flat[this.activeLayer];
    // Mark this cell as terrain (use center as placeholder to trigger neighbor refresh).
    flat[ty * this.cols + tx] = terrain.tiles[15];
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
    const builtIn = { gym: 'Gym', main: 'Main' };
    const target = builtIn[this.levelKey] ?? 'Custom';
    this.scene.start(target, { levelKey: this.levelKey });
  }

  // --- Mode switching ----------------------------------------------------

  setMode(mode) {
    this.edMode = mode;
    window.__setEditor_updateMode?.(mode);
    this.updateHud();
  }

  // --- Object placement --------------------------------------------------

  _renderAllObjects() {
    for (const [, s] of this.objectSprites) s.destroy();
    this.objectSprites.clear();
    for (const obj of this.objects) this._renderObject(obj);
  }

  _renderObject(obj) {
    const [cx, cy] = [obj.tx * TILE + TILE / 2, obj.ty * TILE + TILE / 2];
    const s = this.add.sprite(cx, cy, obj.key, obj.frame).setDepth(50);
    if (obj.type === 'pickup') {
      this.tweens.add({ targets: s, y: cy - 2, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    this.objectSprites.set(`${obj.tx},${obj.ty}`, s);
  }

  _placeObject(tx, ty) {
    this._removeObject(tx, ty);
    const obj = { tx, ty, key: this.selectedObject.key, frame: this.selectedObject.frame, type: this.selectedObject.type };
    this.objects.push(obj);
    this._renderObject(obj);
  }

  _removeObject(tx, ty) {
    const key = `${tx},${ty}`;
    const s = this.objectSprites.get(key);
    if (s) { this.tweens.killTweensOf(s); s.destroy(); this.objectSprites.delete(key); }
    this.objects = this.objects.filter(o => !(o.tx === tx && o.ty === ty));
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
