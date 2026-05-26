#!/usr/bin/env node
/**
 * Validador de Niveles Gatito-Code
 *
 * Audita un archivo JSON de nivel generado para Phaser 3 y verifica:
 *   - Estructura del JSON
 *   - GIDs dentro de rangos validos
 *   - Spawn transitable
 *   - Pathfinding BFS: conectividad de pickups respecto al spawn
 *     con saltos maximos de 7 pasos entre nodos.
 *   - Intensidades climaticas validas
 *
 * Uso:
 *   node validate-level.js <level.json>
 *
 * Ejemplo:
 *   node validate-level.js public/levels/bosque_encantado.json
 */

import fs from 'fs';
import path from 'path';

// ── Constantes ───────────────────────────────────────────────────────────────

const GID_RANGES = [
  { name: 'grass', min: 1, max: 99 },
  { name: 'fences', min: 100, max: 199 },
  { name: 'dirt', min: 200, max: 299 },
  { name: 'hills', min: 300, max: 399 },
  { name: 'water', min: 400, max: 499 },
];

const MAX_STEPS = 7;
const WEATHER_TYPES = ['rain', 'snow', 'pollen', 'leaves', 'night'];

// ── Helpers ──────────────────────────────────────────────────────────────────

function isValidGid(gid) {
  if (gid === 0) return true;
  return GID_RANGES.some(r => gid >= r.min && gid <= r.max);
}

function gidRangeName(gid) {
  if (gid === 0) return 'empty';
  const r = GID_RANGES.find(r => gid >= r.min && gid <= r.max);
  return r ? r.name : 'INVALID';
}

function flatIndex(tx, ty, cols) {
  return ty * cols + tx;
}

function inBounds(tx, ty, cols, rows) {
  return tx >= 0 && ty >= 0 && tx < cols && ty < rows;
}

/**
 * BFS en la grid de tiles transitables.
 * Devuelve la distancia minima en pasos desde (sx,sy) hasta (tx,ty).
 * Si no es alcanzable, devuelve Infinity.
 */
function bfsDistance(floor, walls, cols, rows, sx, sy, tx, ty) {
  if (sx === tx && sy === ty) return 0;
  if (!inBounds(sx, sy, cols, rows) || !inBounds(tx, ty, cols, rows)) return Infinity;

  const solid = (x, y) => {
    if (!inBounds(x, y, cols, rows)) return true;
    const idx = flatIndex(x, y, cols);
    return walls[idx] !== 0;
  };

  if (solid(sx, sy) || solid(tx, ty)) return Infinity;

  const queue = [[sx, sy, 0]];
  const visited = new Set([`${sx},${sy}`]);
  const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];

  while (queue.length > 0) {
    const [cx, cy, dist] = queue.shift();
    for (const [dx, dy] of dirs) {
      const nx = cx + dx;
      const ny = cy + dy;
      const key = `${nx},${ny}`;
      if (!inBounds(nx, ny, cols, rows)) continue;
      if (visited.has(key)) continue;
      if (solid(nx, ny)) continue;
      if (nx === tx && ny === ty) return dist + 1;
      visited.add(key);
      queue.push([nx, ny, dist + 1]);
    }
  }

  return Infinity;
}

// ── Validadores ──────────────────────────────────────────────────────────────

function validateStructure(level) {
  const errors = [];
  if (level.version !== 1) errors.push('version debe ser 1');
  if (!Number.isInteger(level.cols) || level.cols < 1) errors.push('cols debe ser un entero positivo');
  if (!Number.isInteger(level.rows) || level.rows < 1) errors.push('rows debe ser un entero positivo');
  if (level.tile !== 16) errors.push('tile debe ser 16');
  if (!Array.isArray(level.tilesets)) errors.push('tilesets debe ser un array');
  if (!level.layers || typeof level.layers !== 'object') errors.push('layers debe ser un objeto');
  if (!Array.isArray(level.layers.floor)) errors.push('layers.floor debe ser un array');
  if (!Array.isArray(level.layers.walls)) errors.push('layers.walls debe ser un array');
  if (!level.spawn || typeof level.spawn !== 'object') errors.push('spawn debe ser un objeto {tx, ty}');

  const expectedSize = level.cols * level.rows;
  if (level.layers.floor.length !== expectedSize) {
    errors.push(`layers.floor tiene ${level.layers.floor.length} elementos, se esperaban ${expectedSize}`);
  }
  if (level.layers.walls.length !== expectedSize) {
    errors.push(`layers.walls tiene ${level.layers.walls.length} elementos, se esperaban ${expectedSize}`);
  }

  return errors;
}

function validateGids(level) {
  const errors = [];
  const { cols, rows, layers } = level;
  const size = cols * rows;

  for (let i = 0; i < size; i++) {
    const fg = layers.floor[i];
    const wg = layers.walls[i];
    if (!isValidGid(fg)) {
      errors.push(`GID invalido en floor[${i}] = ${fg}`);
    }
    if (!isValidGid(wg)) {
      errors.push(`GID invalido en walls[${i}] = ${wg}`);
    }
  }

  return errors;
}

function validateSpawn(level) {
  const errors = [];
  const { cols, rows, spawn, layers } = level;
  const { tx, ty } = spawn;

  if (!inBounds(tx, ty, cols, rows)) {
    errors.push(`Spawn (${tx},${ty}) esta fuera de los limites del mapa (${cols}x${rows})`);
    return errors;
  }

  const wallGid = layers.walls[flatIndex(tx, ty, cols)];
  if (wallGid !== 0) {
    errors.push(`Spawn (${tx},${ty}) esta sobre un muro (walls GID = ${wallGid}, rango: ${gidRangeName(wallGid)})`);
  }

  return errors;
}

function validatePickups(level) {
  const errors = [];
  const { cols, rows, spawn, layers, objects } = level;

  if (!objects || objects.length === 0) {
    console.warn('  [ADVERTENCIA] El nivel no tiene objetos (pickups).');
    return errors;
  }

  const pickups = objects.filter(o => o.type === 'pickup');
  if (pickups.length === 0) {
    console.warn('  [ADVERTENCIA] El nivel tiene objetos pero ninguno es de tipo "pickup".');
    return errors;
  }

  // Verificar que ningun pickup este dentro de un muro
  for (const p of pickups) {
    if (!inBounds(p.tx, p.ty, cols, rows)) {
      errors.push(`Pickup en (${p.tx},${p.ty}) esta fuera de los limites del mapa`);
      continue;
    }
    const wallGid = layers.walls[flatIndex(p.tx, p.ty, cols)];
    if (wallGid !== 0) {
      errors.push(`Pickup en (${p.tx},${p.ty}) esta dentro de un muro (GID ${wallGid})`);
    }
  }

  if (errors.length > 0) return errors;

  // ── Pathfinding: Conectividad con salto maximo de 7 pasos ────────────────

  const nodes = [
    { tx: spawn.tx, ty: spawn.ty, label: 'spawn' },
    ...pickups.map((p, i) => ({ tx: p.tx, ty: p.ty, label: `pickup_${i}` })),
  ];

  const distances = Array(nodes.length).fill(0).map(() => Array(nodes.length).fill(Infinity));

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dist = bfsDistance(
        layers.floor, layers.walls,
        cols, rows,
        nodes[i].tx, nodes[i].ty,
        nodes[j].tx, nodes[j].ty
      );
      distances[i][j] = dist;
      distances[j][i] = dist;
    }
  }

  const adj = Array(nodes.length).fill(0).map(() => []);
  for (let i = 0; i < nodes.length; i++) {
    for (let j = 0; j < nodes.length; j++) {
      if (i !== j && distances[i][j] <= MAX_STEPS) {
        adj[i].push(j);
      }
    }
  }

  const visited = new Set();
  const queue = [0];
  visited.add(0);

  while (queue.length > 0) {
    const u = queue.shift();
    for (const v of adj[u]) {
      if (!visited.has(v)) {
        visited.add(v);
        queue.push(v);
      }
    }
  }

  for (let i = 1; i < nodes.length; i++) {
    if (!visited.has(i)) {
      const p = nodes[i];
      const realDist = distances[0][i];
      errors.push(
        `Pickup en (${p.tx},${p.ty}) NO es alcanzable desde el spawn en segmentos de ${MAX_STEPS} pasos. ` +
        `Distancia minima real: ${realDist === Infinity ? 'INFINITA (bloqueado)' : realDist + ' pasos'}. ` +
        `Redisenar: acorta la distancia, elimina muros intermedios, o anade un pickup puente.`
      );
    }
  }

  return errors;
}

function validateWeather(level) {
  const errors = [];
  const w = level.weather || {};

  for (const type of WEATHER_TYPES) {
    const v = w[type];
    if (v === undefined) continue;
    if (typeof v !== 'number' || v < 0 || v > 1) {
      errors.push(`Clima "${type}" tiene intensidad invalida: ${v}. Debe estar entre 0.0 y 1.0`);
    }
  }

  return errors;
}

// ── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Uso: node validate-level.js <level.json>');
    process.exit(1);
  }

  const filePath = path.resolve(args[0]);
  if (!fs.existsSync(filePath)) {
    console.error(`Error: No se encontro el archivo: ${filePath}`);
    process.exit(1);
  }

  const level = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const name = path.basename(filePath);

  console.log(`\nValidando nivel: ${name}`);
  console.log(`Dimensiones: ${level.cols}x${level.rows}`);
  console.log('-'.repeat(50));

  const allErrors = [];

  const steps = [
    { label: 'Estructura del JSON', fn: validateStructure },
    { label: 'GIDs validos', fn: validateGids },
    { label: 'Spawn transitable', fn: validateSpawn },
    { label: 'Objetos y Pathfinding (<=7 pasos)', fn: validatePickups },
    { label: 'Clima', fn: validateWeather },
  ];

  for (const step of steps) {
    const errs = step.fn(level);
    if (errs.length === 0) {
      console.log(`  [OK] ${step.label}`);
    } else {
      console.log(`  [FALLO] ${step.label}:`);
      for (const e of errs) {
        console.log(`      - ${e}`);
        allErrors.push(e);
      }
    }
  }

  console.log('-'.repeat(50));
  if (allErrors.length === 0) {
    console.log('Resultado: NIVEL VALIDO ✅');
    process.exit(0);
  } else {
    console.log(`Resultado: NIVEL INVALIDO ❌ (${allErrors.length} error/es)`);
    console.log('\nAccion recomendada: Corregir el esquema semantico y recompilar con build-level.js');
    process.exit(1);
  }
}

main();
