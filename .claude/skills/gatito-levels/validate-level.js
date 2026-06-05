#!/usr/bin/env node
/**
 * Validador de Niveles Gatito-Code  (CommonJS, sin dependencias)
 *
 * Replica la lógica del motor (TileLevelLoader + PathAnimator + TileLevelScene)
 * para verificar que un nivel sea REALMENTE jugable:
 *   - spawn dentro de límites,
 *   - corredor `path` conectado desde el spawn y con una meta (extremo lejano),
 *   - cada pickup sobre el corredor,
 *   - clima en rango 0..1,
 *   - FACTIBILIDAD por presupuesto de herramientas: ¿existe un programa de ≤5
 *     slots (con un bloque `func1` de ≤3 pasos reutilizable) que recorra el path?
 *
 * Uso:
 *   node validate-level.js <level.json> [--tools func,jump]
 *
 * Sale con código 0 si PASA, 1 si FALLA.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const MAX_MAIN = 5;   // slots del panel principal (ui/state.js)
const MAX_FUNC = 3;   // pasos máximos de la Función (queueFunc1)

// Keys cuyos sprites son multi-tile: un `frame` suelto se ve CORTADO como deco.
const MULTITILE_KEYS = new Set([
  'trees', 'trees_v2', 'tree_full', 'tree_apple', 'tree_orange', 'tree_peach', 'tree_pear',
  'wooden_house', 'wooden_roof', 'wooden_walls', 'christmas_tree', 'barn_structures',
  'chicken_houses', 'small_house', 'small_huts', 'grey_brick_houses', 'birch_biom',
  'cherry_biom', 'pine_biom',
]);

// ── expandLayer (espejo de TileRegistry.expandLayer) ──
function expandLayer(layer, cols, rows) {
  if (Array.isArray(layer)) {
    const arr = new Array(cols * rows).fill(0);
    const n = Math.min(layer.length, arr.length);
    for (let i = 0; i < n; i++) arr[i] = layer[i] || 0;
    return arr;
  }
  const out = new Array(cols * rows).fill((layer && layer.fill) || 0);
  for (const r of ((layer && layer.rects) || [])) {
    for (let y = r.y; y < r.y + r.h; y++)
      for (let x = r.x; x < r.x + r.w; x++)
        if (x >= 0 && y >= 0 && x < cols && y < rows) out[y * cols + x] = r.gid;
  }
  return out;
}

const DV = [
  { dx: 0, dy: -1, dir: 'up' }, { dx: 0, dy: 1, dir: 'down' },
  { dx: -1, dy: 0, dir: 'left' }, { dx: 1, dy: 0, dir: 'right' },
];

// Recorre el corredor desde el spawn (espejo de PathAnimator.pathDirections).
function pathWalk(pathFlat, cols, rows, spawn) {
  const isPath = (x, y) => x >= 0 && y >= 0 && x < cols && y < rows && pathFlat[y * cols + x] !== 0;
  let x = spawn.tx, y = spawn.ty;
  const visited = new Set([`${x},${y}`]);
  const dirs = [], tiles = [{ x, y }];
  while (true) {
    const n = DV.find(d => isPath(x + d.dx, y + d.dy) && !visited.has(`${x + d.dx},${y + d.dy}`));
    if (!n) break;
    x += n.dx; y += n.dy;
    visited.add(`${x},${y}`);
    dirs.push(n.dir);
    tiles.push({ x, y });
  }
  return { dirs, tiles };
}

// Extremo lejano del path desde el spawn (espejo de _pathGoal).
function pathGoal(pathFlat, cols, rows, spawn) {
  const isPath = (x, y) => x >= 0 && y >= 0 && x < cols && y < rows && pathFlat[y * cols + x] !== 0;
  const endpoints = [];
  for (let ty = 0; ty < rows; ty++)
    for (let tx = 0; tx < cols; tx++) {
      if (!isPath(tx, ty)) continue;
      const n = DV.filter(d => isPath(tx + d.dx, ty + d.dy)).length;
      if (n === 1) endpoints.push({ tx, ty });
    }
  if (!endpoints.length) return null;
  return endpoints.sort((a, b) =>
    (Math.abs(b.tx - spawn.tx) + Math.abs(b.ty - spawn.ty)) -
    (Math.abs(a.tx - spawn.tx) + Math.abs(a.ty - spawn.ty)))[0];
}

/**
 * ¿Se puede recorrer `dirs` con ≤5 slots? Cada slot = 1 paso, o el bloque `func1`
 * (mismo, de ≤3 pasos) si la Función está habilitada. Busca el mejor bloque F.
 */
function feasibility(dirs, hasFunc) {
  const n = dirs.length;
  if (n === 0) return { ok: true, slots: 0, note: 'sin pasos' };
  if (!hasFunc) {
    return n <= MAX_MAIN
      ? { ok: true, slots: n, note: `${n} movimientos directos` }
      : { ok: false, slots: n, note: `${n} pasos > ${MAX_MAIN} slots y sin Función` };
  }
  // Con Función: probar cada bloque F (subcadena de largo 2..MAX_FUNC) y tokenizar.
  let best = null;
  const tryF = (F) => {
    const L = F.length;
    const dp = new Array(n + 1).fill(Infinity);
    dp[0] = 0;
    for (let i = 1; i <= n; i++) {
      dp[i] = dp[i - 1] + 1; // un paso suelto
      if (L > 0 && i >= L) {
        let match = true;
        for (let k = 0; k < L; k++) if (dirs[i - L + k] !== F[k]) { match = false; break; }
        if (match) dp[i] = Math.min(dp[i], dp[i - L] + 1);
      }
    }
    return dp[n];
  };
  for (let L = MAX_FUNC; L >= 2; L--) {
    for (let i = 0; i + L <= n; i++) {
      const F = dirs.slice(i, i + L);
      const slots = tryF(F);
      if (best == null || slots < best.slots) best = { slots, F };
    }
  }
  const plain = n; // sin función = n slots
  if (best == null || plain < best.slots) best = { slots: plain, F: null };
  const ok = best.slots <= MAX_MAIN;
  const note = best.F
    ? `${best.slots} slots usando ƒ=[${best.F.join(',')}]`
    : `${best.slots} movimientos directos`;
  return { ok, slots: best.slots, note };
}

function main() {
  const args = process.argv.slice(2);
  const file = args.find(a => !a.startsWith('--'));
  let toolsArg = '';
  const tIdx = args.indexOf('--tools');
  if (tIdx !== -1 && args[tIdx + 1]) toolsArg = args[tIdx + 1];
  const eqTool = args.find(a => a.startsWith('--tools='));
  if (eqTool) toolsArg = eqTool.split('=')[1];
  const tools = toolsArg.split(',').map(s => s.trim()).filter(Boolean);
  const hasFunc = tools.includes('func') || tools.includes('func1') || tools.includes('funcion');

  if (!file) { console.error('Uso: node validate-level.js <level.json> [--tools func,jump]'); process.exit(1); }

  const lvl = JSON.parse(fs.readFileSync(path.resolve(file), 'utf-8'));
  const cols = lvl.cols, rows = lvl.rows;
  const floor = expandLayer(lvl.layers.floor || [], cols, rows);
  const pathFlat = expandLayer(lvl.layers.path || [], cols, rows);
  const walls = expandLayer(lvl.layers.walls || [], cols, rows);
  const spawn = lvl.spawn || { tx: 0, ty: 0 };
  const objects = lvl.objects || [];
  const pickups = objects.filter(o => o.type === 'pickup' || o.type === 'pickup_with_animation');

  const errors = [], warns = [], info = [];
  const isPath = (x, y) => x >= 0 && y >= 0 && x < cols && y < rows && pathFlat[y * cols + x] !== 0;
  const hasPath = pathFlat.some(v => v !== 0);

  // 1. Dimensiones / spawn
  if (!(cols > 0 && rows > 0)) errors.push('cols/rows inválidos');
  if (spawn.tx < 0 || spawn.ty < 0 || spawn.tx >= cols || spawn.ty >= rows)
    errors.push(`spawn fuera de límites: ${spawn.tx},${spawn.ty}`);
  if (floor.every(v => v === 0)) warns.push('la capa floor está vacía (¿sin terreno?)');

  // 2. Clima 0..1
  for (const [k, v] of Object.entries(lvl.weather || {}))
    if (typeof v === 'number' && (v < 0 || v > 1)) errors.push(`weather.${k}=${v} fuera de 0..1`);

  // 3. Pickups
  if (pickups.length === 0) warns.push('el nivel no tiene pickups (se gana solo llegando a la meta)');

  // 3b. Decoración multi-tile (se vería cortada)
  for (const o of objects.filter(o => o.type === 'deco' || o.type === 'top')) {
    if (MULTITILE_KEYS.has(o.key))
      warns.push(`deco "${o.key}" (${o.tx},${o.ty}) suele ser multi-tile → un frame suelto se ve cortado`);
    else if (o.key === 'grass_props' && o.frame >= 0 && o.frame <= 8)
      warns.push(`grass_props frame ${o.frame} en (${o.tx},${o.ty}) está en la fila de árboles (multi-tile) → se ve cortado`);
  }

  if (hasPath) {
    // 4. Corredor conectado + meta
    const { dirs, tiles } = pathWalk(pathFlat, cols, rows, spawn);
    const totalPathTiles = pathFlat.filter(v => v !== 0).length;
    const visitedPathTiles = tiles.filter(t => isPath(t.x, t.y)).length;
    const goal = pathGoal(pathFlat, cols, rows, spawn);

    if (dirs.length === 0) errors.push('el spawn no toca el corredor (no hay primer paso de path)');
    if (visitedPathTiles < totalPathTiles)
      warns.push(`el corredor tiene ${totalPathTiles - visitedPathTiles} tile(s) no alcanzados desde el spawn (¿ramas o tiles sueltos?)`);
    if (goal) {
      const end = tiles[tiles.length - 1];
      if (end.x !== goal.tx || end.y !== goal.ty)
        warns.push(`el recorrido no termina en la meta calculada (${goal.tx},${goal.ty})`);
      info.push(`meta: ${goal.tx},${goal.ty}`);
    } else {
      errors.push('no se pudo determinar la meta (el path no tiene extremos)');
    }

    // 5. Pickups sobre el corredor
    for (const p of pickups)
      if (!isPath(p.tx, p.ty)) errors.push(`pickup en ${p.tx},${p.ty} NO está sobre el corredor`);

    // 6. Factibilidad por presupuesto
    const feas = feasibility(dirs, hasFunc);
    info.push(`recorrido: ${dirs.length} pasos → [${dirs.join(',')}]`);
    info.push(`herramientas: ${tools.length ? tools.join(', ') : '(solo movimiento)'}`);
    if (!feas.ok)
      errors.push(`NO factible con las herramientas dadas: ${feas.note} (máx ${MAX_MAIN} slots${hasFunc ? ` + ƒ≤${MAX_FUNC}` : ''})`);
    else
      info.push(`factible: ${feas.note}`);
  } else {
    warns.push('el nivel no tiene capa `path`: el jugador se mueve libre (mecánica sin corredor)');
    for (const p of pickups)
      if (walls[p.ty * cols + p.tx] !== 0) errors.push(`pickup en ${p.tx},${p.ty} cae sobre un muro`);
  }

  // 7. GIDs no negativos (chequeo laxo)
  for (const [name, arr] of [['floor', floor], ['path', pathFlat], ['walls', walls]])
    if (arr.some(v => v < 0 || !Number.isInteger(v))) errors.push(`la capa ${name} tiene GIDs inválidos`);

  // ── Reporte ──
  console.log(`\nValidando: ${file}`);
  for (const i of info) console.log('  · ' + i);
  for (const w of warns) console.log('  ⚠ ' + w);
  for (const e of errors) console.log('  ✗ ' + e);
  if (errors.length === 0) { console.log('\n✅ PASA — nivel jugable.\n'); process.exit(0); }
  console.log(`\n❌ FALLA — ${errors.length} error(es). Corregí y volvé a validar.\n`);
  process.exit(1);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) main();

export { expandLayer, pathWalk, pathGoal, feasibility };
