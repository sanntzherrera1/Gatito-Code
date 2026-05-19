#!/usr/bin/env node
/**
 * Compilador de Niveles Gatito-Code
 *
 * Toma un esquema semantico (JSON) con zonas rectangulares de terrenos, paredes,
 * objetos y clima, y genera el archivo final de nivel para Phaser 3 con los GIDs
 * correctos calculados mediante autotile (bitmask de 4 vecinos).
 *
 * Uso:
 *   node build-level.js <input-schema.json> <output-directory/>
 *
 * Ejemplo:
 *   node build-level.js bosque.json public/levels/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ── Constantes de Autotile (copiadas de TileLevel.js) ──────────────────────

const TERRAINS = [
  {
    name: 'grass',
    tiles: {
      6: 1, 14: 2, 12: 3,
      7: 12, 15: 13, 13: 14,
      3: 23, 11: 24, 9: 25,
      0: 13, 1: 24, 2: 12, 4: 2, 5: 13, 8: 14, 10: 13,
    },
  },
  {
    name: 'dirt',
    tiles: {
      6: 200, 14: 201, 12: 202,
      7: 211, 15: 212, 13: 213,
      3: 222, 11: 223, 9: 224,
      0: 212, 1: 223, 2: 211, 4: 201, 5: 212, 8: 213, 10: 212,
    },
  },
  {
    name: 'hills',
    tiles: {
      6: 300, 14: 301, 12: 302,
      7: 311, 15: 312, 13: 313,
      3: 322, 11: 323, 9: 324,
      0: 312, 1: 323, 2: 311, 4: 301, 5: 312, 8: 313, 10: 312,
    },
  },
  {
    name: 'fences',
    tiles: {
      6: 100, 14: 101, 12: 102,
      7: 104, 15: 105, 13: 106,
      3: 108, 11: 109, 9: 110,
      0: 105, 1: 109, 2: 104, 4: 101, 5: 105, 8: 106, 10: 105,
    },
  },
  {
    name: 'water',
    tiles: Object.fromEntries(
      Array.from({ length: 16 }, (_, i) => [i, 400])
    ),
  },
];

const DEFAULT_FLOOR_GID = 13; // grass center
const TILESETS = ['grass', 'fences', 'dirt', 'hills', 'water'];

// ── Helpers ──────────────────────────────────────────────────────────────────

function findTerrain(name) {
  return TERRAINS.find(t => t.name === name);
}

function resolveTerrainGid(terrain, bitmask) {
  return terrain.tiles[bitmask] ?? terrain.tiles[15] ?? 0;
}

function computeBitmask(grid, terrainName, tx, ty, cols, rows) {
  const check = (x, y) => {
    if (x < 0 || y < 0 || x >= cols || y >= rows) return false;
    return grid[y][x] === terrainName;
  };
  let mask = 0;
  if (check(tx, ty - 1)) mask |= 1;  // N
  if (check(tx + 1, ty)) mask |= 2;  // E
  if (check(tx, ty + 1)) mask |= 4;  // S
  if (check(tx - 1, ty)) mask |= 8;  // W
  return mask;
}

function applyAutotile(grid, cols, rows) {
  const result = new Array(rows).fill(0).map(() => new Array(cols).fill(0));

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const terrainName = grid[y][x];
      if (!terrainName) continue;
      const terrain = findTerrain(terrainName);
      if (!terrain) continue;
      const mask = computeBitmask(grid, terrainName, x, y, cols, rows);
      result[y][x] = resolveTerrainGid(terrain, mask);
    }
  }

  return result;
}

function rectCells(rect) {
  const [x, y, w, h] = rect;
  const cells = [];
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) {
      cells.push({ x: xx, y: yy });
    }
  }
  return cells;
}

function borderCells(rect) {
  const [x, y, w, h] = rect;
  const cells = [];
  for (let xx = x; xx < x + w; xx++) {
    cells.push({ x: xx, y });           // top
    cells.push({ x: xx, y: y + h - 1 }); // bottom
  }
  for (let yy = y + 1; yy < y + h - 1; yy++) {
    cells.push({ x, y: yy });           // left
    cells.push({ x: x + w - 1, y: yy }); // right
  }
  return cells;
}

function flatten(grid, cols, rows) {
  const out = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      out.push(grid[y][x]);
    }
  }
  return out;
}

// ── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Uso: node build-level.js <input-schema.json> <output-directory/>');
    process.exit(1);
  }

  const inputPath = path.resolve(args[0]);
  const outputDir = path.resolve(args[1]);

  if (!fs.existsSync(inputPath)) {
    console.error(`Error: No se encontro el archivo de entrada: ${inputPath}`);
    process.exit(1);
  }

  const schema = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  const cols = schema.cols || 16;
  const rows = schema.rows || 12;
  const name = schema.name || 'nivel';

  // ── Procesar terrenos (capa floor) ────────────────────────────────────────
  const floorGrid = new Array(rows).fill(0).map(() => new Array(cols).fill(null));

  if (schema.terrain && Array.isArray(schema.terrain)) {
    for (const entry of schema.terrain) {
      const terrainName = entry.type;
      const cells = rectCells(entry.rect);
      for (const c of cells) {
        if (c.x >= 0 && c.y >= 0 && c.x < cols && c.y < rows) {
          floorGrid[c.y][c.x] = terrainName;
        }
      }
    }
  }

  let floorGids = applyAutotile(floorGrid, cols, rows);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (floorGids[y][x] === 0) {
        floorGids[y][x] = DEFAULT_FLOOR_GID;
      }
    }
  }

  // ── Procesar muros (capa walls) ──────────────────────────────────────────
  const wallGrid = new Array(rows).fill(0).map(() => new Array(cols).fill(null));

  if (schema.walls && Array.isArray(schema.walls)) {
    for (const entry of schema.walls) {
      const wallType = entry.type;
      const cells = entry.border === true ? borderCells(entry.rect) : rectCells(entry.rect);
      for (const c of cells) {
        if (c.x >= 0 && c.y >= 0 && c.x < cols && c.y < rows) {
          wallGrid[c.y][c.x] = wallType;
        }
      }
    }
  }

  const wallGids = applyAutotile(wallGrid, cols, rows);

  // ── Ensamblar JSON final ─────────────────────────────────────────────────
  const output = {
    version: 1,
    cols,
    rows,
    tile: 16,
    tilesets: TILESETS,
    layers: {
      floor: flatten(floorGids, cols, rows),
      walls: flatten(wallGids, cols, rows),
    },
    spawn: schema.spawn || { tx: Math.floor(cols / 2), ty: Math.floor(rows / 2) },
    objects: schema.objects || [],
    weather: schema.weather || { rain: 0, snow: 0, pollen: 0, leaves: 0, night: 0 },
  };

  const weatherTypes = ['rain', 'snow', 'pollen', 'leaves', 'night'];
  for (const t of weatherTypes) {
    if (output.weather[t] === undefined) output.weather[t] = 0;
  }

  const outputPath = path.join(outputDir, `${name}.json`);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`Nivel compilado exitosamente: ${outputPath}`);
  console.log(`Dimensiones: ${cols}x${rows}`);
  console.log(`Clima:`, output.weather);
  console.log(`Objetos: ${output.objects.length}`);
}

main();
