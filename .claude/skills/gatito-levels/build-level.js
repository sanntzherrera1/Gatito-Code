#!/usr/bin/env node
/**
 * Compilador de Niveles Gatito-Code  (CommonJS, sin dependencias ni package.json)
 *
 * Toma un esquema semantico simple (terrenos, muros, un corredor `path`, objetos
 * y clima) y genera el archivo final del nivel para Phaser 3 con GIDs correctos
 * (autotile de 4 vecinos: N=1, E=2, S=4, W=8). A diferencia del compilador viejo,
 * este SÍ genera la capa `path` (mecanismo de jugabilidad) y usa los GIDs reales
 * del motor.
 *
 * Modos:
 *   node build-level.js build      <spec.json> <output-dir/>   → escribe <name>.json
 *   node build-level.js candidates <cand-spec.json>            → imprime caminos candidatos (ASCII)
 *
 * Los GIDs estan espejados de public/src/engine/level/TileRegistry.js. Sus rangos
 * son INMUTABLES (ver CLAUDE.md), por lo que no deberian cambiar.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ─────────────────────────────────────────────────────────────────────────────
// Datos del registry (espejados — GIDs inmutables)
// ─────────────────────────────────────────────────────────────────────────────

const COLS = 16, ROWS = 12, TILE = 16;

// Autotile: bitmask(0-15) → GID, por terreno. Copiado de TERRAINS (TileRegistry.js).
const TERRAINS = {
  grass:        { 0:13,1:24,2:12,3:23,4:2,5:13,6:1,7:12,8:14,9:25,10:13,11:24,12:3,13:14,14:2,15:13 },
  dirt:         { 0:212,1:223,2:211,3:222,4:201,5:212,6:200,7:211,8:213,9:224,10:212,11:223,12:202,13:213,14:201,15:212 },
  dirt_v2:      { 0:512,1:523,2:511,3:522,4:501,5:512,6:500,7:511,8:513,9:524,10:512,11:523,12:502,13:513,14:501,15:512 },
  hills:        { 0:312,1:323,2:311,3:322,4:301,5:312,6:300,7:311,8:313,9:324,10:312,11:323,12:302,13:313,14:301,15:312 },
  grass_hills:  { 0:1712,1:1723,2:1711,3:1722,4:1701,5:1712,6:1700,7:1711,8:1713,9:1724,10:1712,11:1723,12:1702,13:1713,14:1701,15:1712 },
  dgrass_tiles: { 0:1312,1:1323,2:1311,3:1322,4:1301,5:1312,6:1300,7:1311,8:1313,9:1324,10:1312,11:1323,12:1302,13:1313,14:1301,15:1312 },
  bush:         { 0:812,1:823,2:811,3:822,4:801,5:812,6:800,7:811,8:813,9:824,10:812,11:823,12:802,13:813,14:801,15:812 },
  // fences: tileset de 4 columnas (firstgid 100). Solo para muros decorativos.
  fences:       { 0:105,1:109,2:104,3:108,4:101,5:105,6:100,7:104,8:106,9:110,10:105,11:109,12:102,13:106,14:101,15:105 },
  // water: relleno uniforme (sin bordes).
  water:        Object.fromEntries(Array.from({ length: 16 }, (_, i) => [i, 400])),
  // snow_tiles_1: firstgid 5100, layout 11×25 (autotile en primeras filas, mismo patrón 11×7).
  snow_tiles_1: { 0:5112,1:5123,2:5111,3:5122,4:5101,5:5112,6:5100,7:5111,8:5113,9:5124,10:5112,11:5123,12:5102,13:5113,14:5101,15:5112 },
};

const FLOOR_TERRAINS = ['grass', 'dirt', 'dirt_v2', 'grass_hills', 'dgrass_tiles', 'bush', 'water', 'snow_tiles_1'];
const WALL_TERRAINS  = ['hills', 'fences'];

const DEFAULT_FLOOR_GID = TERRAINS.grass[15];  // 13 — pasto centro
const DEFAULT_PATH_GID  = TERRAINS.dirt[15];   // 212 — sendero de tierra (cualquier GID ≠ 0 sirve)

// Lista de nombres de tilesets (informativa; el loader usa su propio TILESETS).
const TILESET_NAMES = [
  'grass','grass_v2','grass_hills','grass_hill_slopes','grass_layers','grass_layers2','grass_simple',
  'dgrass_hills','dgrass_hill_slopes','dgrass_layers','dgrass_layers2','dgrass_tiles','bush',
  'ground_hill_slopes','hills','dirt','dirt_v2','dirt_wide','dirt_wide_v2','soil_hills','soil_tiles',
  'dsoil_hills','dsoil_tiles','stone_hills','stone_tiles','water','fences','fences_v2','doors',
  'wooden_house','wooden_roof','wooden_walls','stone_path','dungeon_walls','dungeon_walls_decor',
  'dungeon_ground_orange','dungeon_ground_orange_dark','dungeon_ground_orange_hole',
  'dungeon_ground_orange_darker_hole','dungeon_items','dungeon_carts','dungeon_rails','dungeon_rocks',
  'dungeon_switch','ice_tiles','snow_tiles_1','snow_tiles_2','grass_layers_sorry_1','grass_layers_sorry_2',
  'grass_layers_sorry_3','grass_layers_sorry_4','blue_grass_layers_1','blue_grass_layers_2',
  'blue_grass_layers_3','blue_grass_layers_4',
];

const WEATHER_KEYS = ['rain','snow','pollen','leaves','night','fog','dust','wind','storm'];

// ─────────────────────────────────────────────────────────────────────────────
// Autotile
// ─────────────────────────────────────────────────────────────────────────────

function resolveTerrainGid(name, mask) {
  const t = TERRAINS[name];
  if (!t) return 0;
  return t[mask] != null ? t[mask] : t[15];
}

/** grid: matriz [rows][cols] de nombre-de-terreno o null. → matriz de GIDs. */
function autotile(grid, cols, rows) {
  const out = Array.from({ length: rows }, () => new Array(cols).fill(0));
  const same = (x, y, name) =>
    x >= 0 && y >= 0 && x < cols && y < rows && grid[y][x] === name;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const name = grid[y][x];
      if (!name || !TERRAINS[name]) continue;
      let mask = 0;
      if (same(x, y - 1, name)) mask |= 1; // N
      if (same(x + 1, y, name)) mask |= 2; // E
      if (same(x, y + 1, name)) mask |= 4; // S
      if (same(x - 1, y, name)) mask |= 8; // W
      out[y][x] = resolveTerrainGid(name, mask);
    }
  }
  return out;
}

function flatten(grid, cols, rows) {
  const out = [];
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) out.push(grid[y][x]);
  return out;
}

function rectCells(rect) {
  const [x, y, w, h] = rect;
  const cells = [];
  for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) cells.push({ x: xx, y: yy });
  return cells;
}

function borderCells(rect) {
  const [x, y, w, h] = rect;
  const cells = [];
  for (let xx = x; xx < x + w; xx++) { cells.push({ x: xx, y }); cells.push({ x: xx, y: y + h - 1 }); }
  for (let yy = y + 1; yy < y + h - 1; yy++) { cells.push({ x, y: yy }); cells.push({ x: x + w - 1, y: yy }); }
  return cells;
}

// ─────────────────────────────────────────────────────────────────────────────
// Corredor (capa path)
// ─────────────────────────────────────────────────────────────────────────────

/** Conecta waypoints ortogonalmente (primero X, luego Y) → lista ordenada de tiles. */
function corridorFromWaypoints(waypoints) {
  const tiles = [];
  const pushUnique = (x, y) => {
    const last = tiles[tiles.length - 1];
    if (!last || last.x !== x || last.y !== y) tiles.push({ x, y });
  };
  if (!waypoints.length) return tiles;
  pushUnique(waypoints[0].tx, waypoints[0].ty);
  for (let i = 1; i < waypoints.length; i++) {
    let { x, y } = tiles[tiles.length - 1];
    const tx = waypoints[i].tx, ty = waypoints[i].ty;
    while (x !== tx) { x += Math.sign(tx - x); pushUnique(x, y); }
    while (y !== ty) { y += Math.sign(ty - y); pushUnique(x, y); }
  }
  return tiles;
}

function tilesToDirs(tiles) {
  const dirs = [];
  for (let i = 1; i < tiles.length; i++) {
    const dx = tiles[i].x - tiles[i - 1].x, dy = tiles[i].y - tiles[i - 1].y;
    if (dx === 1) dirs.push('right'); else if (dx === -1) dirs.push('left');
    else if (dy === 1) dirs.push('down'); else if (dy === -1) dirs.push('up');
  }
  return dirs;
}

// ─────────────────────────────────────────────────────────────────────────────
// Caminos candidatos
// ─────────────────────────────────────────────────────────────────────────────

function asciiPreview(tiles, spawn, pickups, goal, cols, rows) {
  const g = Array.from({ length: rows }, () => new Array(cols).fill('.'));
  for (const t of tiles) if (g[t.y]) g[t.y][t.x] = '·'; // ·
  for (const p of pickups) if (g[p.ty]) g[p.ty][p.tx] = '*';
  if (g[goal.y]) g[goal.y][goal.x] = 'G';
  if (g[spawn.ty]) g[spawn.ty][spawn.tx] = 'S';
  return g.map(r => r.join('')).join('\n');
}

/** Distribuye `count` pickups sobre el corredor (sin contar spawn ni la meta). */
function placePickups(tiles, count) {
  const inner = tiles.slice(1, tiles.length - 1);
  if (count <= 0 || inner.length === 0) return [];
  const out = [];
  for (let i = 1; i <= count; i++) {
    const idx = Math.min(inner.length - 1, Math.round((i * inner.length) / (count + 1)));
    out.push({ tx: inner[idx].x, ty: inner[idx].y });
  }
  // de-duplicar
  return out.filter((p, i) => out.findIndex(q => q.tx === p.tx && q.ty === p.ty) === i);
}

function clampInBounds(tiles, cols, rows) {
  return tiles.every(t => t.x >= 0 && t.y >= 0 && t.x < cols && t.y < rows);
}

/**
 * Genera N corredores candidatos desde `spawn` con ~`steps` pasos.
 * Patrones: recto, en L, escalera (zig-zag) y motivo-repetido (ideal p/ Función).
 * Si se pasa `basePath` (lista de {x,y}), genera variaciones sobre ese corredor.
 */
function genCandidates(opts) {
  const cols = opts.cols || COLS, rows = opts.rows || ROWS;
  const spawn = opts.spawn || { tx: 1, ty: Math.floor(rows / 2) };
  const steps = Math.max(2, Math.min(opts.steps || 6, cols + rows - 4));
  const pickups = opts.pickups != null ? opts.pickups : 1;
  const cands = [];

  const make = (label, tiles) => {
    if (!tiles.length || !clampInBounds(tiles, cols, rows)) return;
    // recortar duplicados consecutivos
    const goalTile = tiles[tiles.length - 1];
    const goal = { x: goalTile.x, y: goalTile.y };
    const pk = placePickups(tiles, pickups);
    cands.push({
      label,
      tiles,
      dirs: tilesToDirs(tiles),
      goal,
      pickups: pk,
      ascii: asciiPreview(tiles, spawn, pk, goal, cols, rows),
    });
  };

  if (Array.isArray(opts.basePath) && opts.basePath.length) {
    const base = opts.basePath.map(t => ({ x: t.x, y: t.y }));
    make('original', base);
    // extender: continuar en la direccion final
    const d = base.length >= 2 ? tilesToDirs(base).slice(-1)[0] : 'right';
    const DV = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };
    const ext = base.slice();
    for (let i = 0; i < 2; i++) {
      const last = ext[ext.length - 1];
      ext.push({ x: last.x + DV[d][0], y: last.y + DV[d][1] });
    }
    make('extendido (+2)', ext);
    // acortar
    if (base.length > 3) make('acortado (-2)', base.slice(0, base.length - 2));
    // recodo: girar 90° a mitad de camino
    const half = Math.floor(base.length / 2);
    const bend = base.slice(0, half);
    let { x, y } = bend[bend.length - 1] || base[0];
    for (let i = 0; i < Math.max(2, base.length - half); i++) { y += 1; bend.push({ x, y }); }
    make('con recodo', bend);
    return cands.slice(0, 4);
  }

  // Recto horizontal
  {
    const t = [{ x: spawn.tx, y: spawn.ty }];
    for (let i = 0; i < steps; i++) t.push({ x: t[t.length - 1].x + 1, y: spawn.ty });
    make('recto', t);
  }
  // En L (mitad horizontal, mitad vertical)
  {
    const t = [{ x: spawn.tx, y: spawn.ty }];
    const h = Math.ceil(steps / 2), v = steps - h;
    for (let i = 0; i < h; i++) t.push({ x: t[t.length - 1].x + 1, y: t[t.length - 1].y });
    const dirY = spawn.ty > rows / 2 ? -1 : 1;
    for (let i = 0; i < v; i++) t.push({ x: t[t.length - 1].x, y: t[t.length - 1].y + dirY });
    make('en L', t);
  }
  // Escalera (zig-zag de a 1)
  {
    const t = [{ x: spawn.tx, y: spawn.ty }];
    const dirY = spawn.ty > rows / 2 ? -1 : 1;
    let goRight = true;
    for (let i = 0; i < steps; i++) {
      const last = t[t.length - 1];
      if (goRight) t.push({ x: last.x + 1, y: last.y });
      else t.push({ x: last.x, y: last.y + dirY });
      goRight = !goRight;
    }
    make('escalera', t);
  }
  // Motivo repetido (bloque de 2: derecha+abajo) — aprovecha la Función
  {
    const t = [{ x: spawn.tx, y: spawn.ty }];
    const dirY = spawn.ty > rows / 2 ? -1 : 1;
    for (let i = 0; i < steps; i++) {
      const last = t[t.length - 1];
      if (i % 2 === 0) t.push({ x: last.x + 1, y: last.y });
      else t.push({ x: last.x, y: last.y + dirY });
    }
    make('motivo repetido (ƒ)', t);
  }

  return cands.slice(0, 4);
}

// ─────────────────────────────────────────────────────────────────────────────
// Construccion del nivel final
// ─────────────────────────────────────────────────────────────────────────────

function buildLevel(spec) {
  const cols = spec.cols || COLS, rows = spec.rows || ROWS;

  // ── floor ──
  const floorGrid = Array.from({ length: rows }, () => new Array(cols).fill(null));
  const baseFloor = (spec.floor && spec.floor.base) || (typeof spec.floor === 'string' ? spec.floor : 'grass');
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) floorGrid[y][x] = baseFloor;
  if (spec.floor && Array.isArray(spec.floor.patches)) {
    for (const p of spec.floor.patches)
      for (const c of rectCells(p.rect))
        if (c.x >= 0 && c.y >= 0 && c.x < cols && c.y < rows) floorGrid[c.y][c.x] = p.type;
  }
  let floorFlat = flatten(autotile(floorGrid, cols, rows), cols, rows);
  for (let i = 0; i < floorFlat.length; i++) if (!floorFlat[i]) floorFlat[i] = DEFAULT_FLOOR_GID;

  // ── walls ──
  const wallGrid = Array.from({ length: rows }, () => new Array(cols).fill(null));
  for (const w of (spec.walls || [])) {
    const cells = w.border ? borderCells(w.rect) : rectCells(w.rect);
    for (const c of cells)
      if (c.x >= 0 && c.y >= 0 && c.x < cols && c.y < rows) wallGrid[c.y][c.x] = w.type;
  }
  const wallsFlat = flatten(autotile(wallGrid, cols, rows), cols, rows);

  // ── path (corredor) ──
  const pathFlat = new Array(cols * rows).fill(0);
  const pathGid = spec.pathGid || DEFAULT_PATH_GID;
  let tiles = [];
  if (spec.path && Array.isArray(spec.path.tiles)) tiles = spec.path.tiles.map(t => ({ x: t.x, y: t.y }));
  else if (spec.path && Array.isArray(spec.path.waypoints)) tiles = corridorFromWaypoints(spec.path.waypoints);
  for (const t of tiles)
    if (t.x >= 0 && t.y >= 0 && t.x < cols && t.y < rows) pathFlat[t.y * cols + t.x] = pathGid;

  // ── overlay / top (capas de terreno autotileadas ENCIMA del floor) ──
  // overlay = 2º piso sobre el floor; top = tiles sobre el overlay. Vacías si no se especifican.
  const terrainLayer = (rectsSpec) => {
    if (!Array.isArray(rectsSpec) || rectsSpec.length === 0) return new Array(cols * rows).fill(0);
    const grid = Array.from({ length: rows }, () => new Array(cols).fill(null));
    for (const r of rectsSpec)
      for (const c of rectCells(r.rect))
        if (c.x >= 0 && c.y >= 0 && c.x < cols && c.y < rows) grid[c.y][c.x] = r.type;
    return flatten(autotile(grid, cols, rows), cols, rows);
  };
  const overlayFlat = terrainLayer(spec.overlay);
  const topFlat = terrainLayer(spec.top);

  const out = {
    version: 1, cols, rows, tile: TILE,
    tilesets: TILESET_NAMES,
    layers: {
      floor: floorFlat,
      path: pathFlat,
      walls: wallsFlat,
      overlay: overlayFlat,
      top: topFlat,
    },
    spawn: spec.spawn || { tx: 1, ty: Math.floor(rows / 2) },
    objects: spec.objects || [],
    weather: normalizeWeather(spec.weather),
    introPoints: spec.introPoints || [],
  };
  return out;
}

function normalizeWeather(w) {
  const out = {};
  for (const k of WEATHER_KEYS) out[k] = (w && typeof w[k] === 'number') ? w[k] : 0;
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────────────────────────────────────

function readJson(p) { return JSON.parse(fs.readFileSync(path.resolve(p), 'utf-8')); }

function main() {
  const [mode, a1, a2] = process.argv.slice(2);

  if (mode === 'candidates') {
    if (!a1) { console.error('Uso: node build-level.js candidates <cand-spec.json>'); process.exit(1); }
    const cands = genCandidates(readJson(a1));
    for (const c of cands) {
      console.log(`\n### ${c.label}  (${c.dirs.length} pasos, ${c.pickups.length} pickups, meta ${c.goal.x},${c.goal.y})`);
      console.log(c.ascii);
    }
    console.log('\nJSON:\n' + JSON.stringify(cands, null, 2));
    return;
  }

  if (mode === 'build') {
    if (!a1 || !a2) { console.error('Uso: node build-level.js build <spec.json> <output-dir/>'); process.exit(1); }
    const spec = readJson(a1);
    const level = buildLevel(spec);
    const name = spec.name || 'nivel';
    const outDir = path.resolve(a2);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, `${name}.json`);
    fs.writeFileSync(outPath, JSON.stringify(level, null, 2) + '\n', 'utf-8');
    const pathTiles = level.layers.path.filter(v => v).length;
    console.log(`OK  ${outPath}`);
    console.log(`    ${level.cols}x${level.rows}  path:${pathTiles} tiles  objetos:${level.objects.length}`);
    console.log(`    Siguiente: node validate-level.js ${outPath} --tools ${(spec.tools || []).join(',') || 'none'}`);
    return;
  }

  console.error('Uso:\n  node build-level.js build <spec.json> <output-dir/>\n  node build-level.js candidates <cand-spec.json>');
  process.exit(1);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) main();

export { buildLevel, genCandidates, autotile, corridorFromWaypoints, tilesToDirs, TERRAINS };
