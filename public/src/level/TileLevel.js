const BASE = 'assets/SproutLands-Sprites/Tilesets';

/**
 * Canonical tileset registry. GIDs are assigned once per tileset and never
 * change; adding a new tileset should claim a new unused firstgid block.
 * `key` is the Phaser texture key, `name` is what level JSONs reference.
 */
export const TILESETS = [
  { key: 'ts_grass',  name: 'grass',  url: `${BASE}/Grass.png`,       cols: 11, rows: 7, firstgid: 1   },
  { key: 'ts_fences', name: 'fences', url: `${BASE}/Fences.png`,      cols: 4,  rows: 4, firstgid: 100 },
  { key: 'ts_dirt',   name: 'dirt',   url: `${BASE}/Tilled_Dirt.png`, cols: 11, rows: 7, firstgid: 200 },
  { key: 'ts_hills',  name: 'hills',  url: `${BASE}/Hills.png`,       cols: 11, rows: 9, firstgid: 300 },
  { key: 'ts_water',  name: 'water',  url: `${BASE}/Water.png`,       cols: 4,  rows: 1, firstgid: 400 },
];

export const LEVELS = ['gym', 'main'];

export const OBJECTS = [
  { key: 'plants',      label: 'Plants',      url: 'assets/SproutLands-Sprites/Objects/Basic Plants.png',             cols: 6, rows: 2, frameW: 16, frameH: 16 },
  { key: 'grass_props', label: 'Grass Props', url: 'assets/SproutLands-Sprites/Objects/Basic Grass Biom things 1.png',cols: 9, rows: 5, frameW: 16, frameH: 16 },
  { key: 'furniture',   label: 'Furniture',   url: 'assets/SproutLands-Sprites/Objects/Basic Furniture.png',          cols: 9, rows: 6, frameW: 16, frameH: 16 },
  { key: 'tools',       label: 'Tools',       url: 'assets/SproutLands-Sprites/Objects/Basic tools and meterials.png',cols: 3, rows: 2, frameW: 16, frameH: 16 },
];

/**
 * 4-neighbour cardinal bitmask: N=1 E=2 S=4 W=8.
 * Each terrain maps bitmask (0-15) to the correct GID for that combination.
 * Standard 9 cases come from the 3×3 autotile block; the rest fall back to
 * the center tile so painted areas always look passable.
 *
 * How to read the mapping:
 *   6  = E+S      → top-left corner     (no N, no W)
 *   14 = E+S+W    → top edge            (no N)
 *   12 = S+W      → top-right corner    (no N, no E)
 *   7  = N+E+S    → left edge           (no W)
 *   15 = N+E+S+W  → center fill
 *   13 = N+S+W    → right edge          (no E)
 *   3  = N+E      → bottom-left corner  (no S, no W)
 *   11 = N+E+W    → bottom edge         (no S)
 *   9  = N+W      → bottom-right corner (no S, no E)
 */
export const TERRAINS = [
  {
    name: 'grass',
    label: 'Grass',
    tilesetName: 'grass',
    tiles: {
      6: 1, 14: 2, 12: 3,
      7: 12, 15: 13, 13: 14,
      3: 23, 11: 24, 9: 25,
      0: 13, 1: 24, 2: 12, 4: 2, 5: 13, 8: 14, 10: 13,
    },
  },
  {
    name: 'dirt',
    label: 'Dirt',
    tilesetName: 'dirt',
    tiles: {
      6: 200, 14: 201, 12: 202,
      7: 211, 15: 212, 13: 213,
      3: 222, 11: 223, 9: 224,
      0: 212, 1: 223, 2: 211, 4: 201, 5: 212, 8: 213, 10: 212,
    },
  },
  {
    name: 'hills',
    label: 'Hills (wall)',
    tilesetName: 'hills',
    tiles: {
      6: 300, 14: 301, 12: 302,
      7: 311, 15: 312, 13: 313,
      3: 322, 11: 323, 9: 324,
      0: 312, 1: 323, 2: 311, 4: 301, 5: 312, 8: 313, 10: 312,
    },
  },
  {
    name: 'fences',
    label: 'Fences',
    tilesetName: 'fences',
    tiles: {
      6: 100, 14: 101, 12: 102,
      7: 104, 15: 105, 13: 106,
      3: 108, 11: 109, 9: 110,
      0: 105, 1: 109, 2: 104, 4: 101, 5: 105, 8: 106, 10: 105,
    },
  },
  {
    // Water has no border tiles — all cells fill uniformly.
    name: 'water',
    label: 'Water',
    tilesetName: 'water',
    tiles: Object.fromEntries(
      Array.from({ length: 16 }, (_, i) => [i, 400])
    ),
  },
];

export function isSameTerrain(gid, terrain) {
  return Object.values(terrain.tiles).includes(gid);
}

export function resolveTerrainGid(terrain, bitmask) {
  return terrain.tiles[bitmask] ?? terrain.tiles[15] ?? 0;
}

export function preloadAssets(scene) {
  for (const t of TILESETS) {
    scene.load.image(t.key, t.url);
  }
  for (const lv of LEVELS) {
    scene.load.json(`level_${lv}`, `levels/${lv}.json`);
  }
}

/** Expand compact { fill, rects } layer into a flat GID array of cols*rows. */
export function expandLayer(layer, cols, rows) {
  if (Array.isArray(layer)) return layer.slice();
  const out = new Array(cols * rows).fill(layer.fill ?? 0);
  for (const r of (layer.rects || [])) {
    for (let y = r.y; y < r.y + r.h; y++) {
      for (let x = r.x; x < r.x + r.w; x++) {
        if (x >= 0 && y >= 0 && x < cols && y < rows) out[y * cols + x] = r.gid;
      }
    }
  }
  return out;
}

export function flatToRows(flat, cols, rows) {
  const out = [];
  for (let y = 0; y < rows; y++) out.push(flat.slice(y * cols, (y + 1) * cols));
  return out;
}

/** localStorage overrides disk; editor writes here on save. */
export function readLevelJson(scene, levelKey) {
  const disk = scene.cache.json.get(`level_${levelKey}`);
  const override = localStorage.getItem(`level:${levelKey}`);
  if (override) {
    try {
      const parsed = JSON.parse(override);
      // Drop overrides whose grid no longer matches the current level (e.g.
      // after COLS/ROWS changed). Otherwise expandLayer produces garbage.
      if (disk && (parsed.cols !== disk.cols || parsed.rows !== disk.rows)) {
        localStorage.removeItem(`level:${levelKey}`);
      } else {
        return parsed;
      }
    } catch { localStorage.removeItem(`level:${levelKey}`); }
  }
  return disk;
}

export function writeLevelJson(levelKey, data) {
  localStorage.setItem(`level:${levelKey}`, JSON.stringify(data));
}

export function clearLevelOverride(levelKey) {
  localStorage.removeItem(`level:${levelKey}`);
}

/**
 * Build a Phaser tilemap for the level. Returns handles the caller needs.
 * Safe to call from scene.create() — Boot has already preloaded tileset
 * textures and level JSONs.
 */
export function loadLevel(scene, levelKey) {
  const lvl = readLevelJson(scene, levelKey);
  if (!lvl) throw new Error(`Level "${levelKey}" not loaded`);

  const cols = lvl.cols, rows = lvl.rows;
  const floor = expandLayer(lvl.layers.floor, cols, rows);
  const walls = expandLayer(lvl.layers.walls, cols, rows);

  const map = scene.make.tilemap({
    tileWidth: 16, tileHeight: 16, width: cols, height: rows,
  });

  const tilesetObjs = TILESETS.map(t =>
    map.addTilesetImage(t.name, t.key, 16, 16, 0, 0, t.firstgid)
  );

  const floorLayer = map.createBlankLayer('floor', tilesetObjs, 0, 0, cols, rows).setDepth(0);
  const wallsLayer = map.createBlankLayer('walls', tilesetObjs, 0, 0, cols, rows).setDepth(20);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const f = floor[y * cols + x];
      const w = walls[y * cols + x];
      if (f) floorLayer.putTileAt(f, x, y);
      if (w) wallsLayer.putTileAt(w, x, y);
    }
  }

  const solid = [];
  for (let y = 0; y < rows; y++) {
    const row = [];
    for (let x = 0; x < cols; x++) row.push(walls[y * cols + x] !== 0);
    solid.push(row);
  }

  return {
    map, floorLayer, wallsLayer, solid,
    spawn: lvl.spawn || { tx: Math.floor(cols / 2), ty: Math.floor(rows / 2) },
    cols, rows,
    flat: { floor, walls },
    objects: lvl.objects ?? [],
    raw: lvl,
  };
}
