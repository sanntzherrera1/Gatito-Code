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

// ── Constantes de Autotile (portadas desde TileRegistry.js) ──────────────────
// Soporta 33+ tipos de terreno compatibles con el sistema de autotile 4-vecinos.

const TERRAINS = [
  { name: 'grass', tiles: { 0: 13, 1: 24, 2: 12, 3: 23, 4: 2, 5: 13, 6: 1, 7: 12, 8: 14, 9: 25, 10: 13, 11: 24, 12: 3, 13: 14, 14: 2, 15: 13 } },
  { name: 'dirt', tiles: { 0: 212, 1: 223, 2: 211, 3: 222, 4: 201, 5: 212, 6: 200, 7: 211, 8: 213, 9: 224, 10: 212, 11: 223, 12: 202, 13: 213, 14: 201, 15: 212 } },
  { name: 'hills', tiles: { 0: 312, 1: 323, 2: 311, 3: 322, 4: 301, 5: 312, 6: 300, 7: 311, 8: 313, 9: 324, 10: 312, 11: 323, 12: 302, 13: 313, 14: 301, 15: 312 } },
  { name: 'water', tiles: Object.fromEntries(Array.from({ length: 16 }, (_, i) => [i, 400])) },
  { name: 'fences', tiles: { 6: 100, 14: 101, 12: 102, 7: 104, 15: 105, 13: 106, 3: 108, 11: 109, 9: 110, 0: 105, 1: 109, 2: 104, 4: 101, 5: 105, 8: 106, 10: 105 } },

  // ── Grass variants ──
  { name: 'grass_v2', tiles: { 0: 2012, 1: 2023, 2: 2011, 3: 2022, 4: 2001, 5: 2012, 6: 2000, 7: 2011, 8: 2013, 9: 2024, 10: 2012, 11: 2023, 12: 2002, 13: 2013, 14: 2001, 15: 2012 } },
  { name: 'grass_hills', tiles: { 0: 1712, 1: 1723, 2: 1711, 3: 1722, 4: 1701, 5: 1712, 6: 1700, 7: 1711, 8: 1713, 9: 1724, 10: 1712, 11: 1723, 12: 1702, 13: 1713, 14: 1701, 15: 1712 } },
  { name: 'grass_layers', tiles: { 0: 1812, 1: 1823, 2: 1811, 3: 1822, 4: 1801, 5: 1812, 6: 1800, 7: 1811, 8: 1813, 9: 1824, 10: 1812, 11: 1823, 12: 1802, 13: 1813, 14: 1801, 15: 1812 } },
  { name: 'grass_layers2', tiles: { 0: 1912, 1: 1923, 2: 1911, 3: 1922, 4: 1901, 5: 1912, 6: 1900, 7: 1911, 8: 1913, 9: 1924, 10: 1912, 11: 1923, 12: 1902, 13: 1913, 14: 1901, 15: 1912 } },
  { name: 'grass_simple', tiles: { 0: 3507, 1: 3513, 2: 3506, 3: 3512, 4: 3501, 5: 3507, 6: 3500, 7: 3506, 8: 3508, 9: 3514, 10: 3507, 11: 3513, 12: 3502, 13: 3508, 14: 3501, 15: 3507 } },
  { name: 'dgrass_hills', tiles: { 0: 1012, 1: 1023, 2: 1011, 3: 1022, 4: 1001, 5: 1012, 6: 1000, 7: 1011, 8: 1013, 9: 1024, 10: 1012, 11: 1023, 12: 1002, 13: 1013, 14: 1001, 15: 1012 } },
  { name: 'dgrass_layers', tiles: { 0: 1112, 1: 1123, 2: 1111, 3: 1122, 4: 1101, 5: 1112, 6: 1100, 7: 1111, 8: 1113, 9: 1124, 10: 1112, 11: 1123, 12: 1102, 13: 1113, 14: 1101, 15: 1112 } },
  { name: 'dgrass_layers2', tiles: { 0: 1212, 1: 1223, 2: 1211, 3: 1222, 4: 1201, 5: 1212, 6: 1200, 7: 1211, 8: 1213, 9: 1224, 10: 1212, 11: 1223, 12: 1202, 13: 1213, 14: 1201, 15: 1212 } },
  { name: 'dgrass_tiles', tiles: { 0: 1312, 1: 1323, 2: 1311, 3: 1322, 4: 1301, 5: 1312, 6: 1300, 7: 1311, 8: 1313, 9: 1324, 10: 1312, 11: 1323, 12: 1302, 13: 1313, 14: 1301, 15: 1312 } },
  { name: 'bush', tiles: { 0: 812, 1: 823, 2: 811, 3: 822, 4: 801, 5: 812, 6: 800, 7: 811, 8: 813, 9: 824, 10: 812, 11: 823, 12: 802, 13: 813, 14: 801, 15: 812 } },

  // ── Soil variants ──
  { name: 'dirt_v2', tiles: { 0: 512, 1: 523, 2: 511, 3: 522, 4: 501, 5: 512, 6: 500, 7: 511, 8: 513, 9: 524, 10: 512, 11: 523, 12: 502, 13: 513, 14: 501, 15: 512 } },
  { name: 'dirt_wide', tiles: { 0: 612, 1: 623, 2: 611, 3: 622, 4: 601, 5: 612, 6: 600, 7: 611, 8: 613, 9: 624, 10: 612, 11: 623, 12: 602, 13: 613, 14: 601, 15: 612 } },
  { name: 'dirt_wide_v2', tiles: { 0: 712, 1: 723, 2: 711, 3: 722, 4: 701, 5: 712, 6: 700, 7: 711, 8: 713, 9: 724, 10: 712, 11: 723, 12: 702, 13: 713, 14: 701, 15: 712 } },
  { name: 'soil_hills', tiles: { 0: 2212, 1: 2223, 2: 2211, 3: 2222, 4: 2201, 5: 2212, 6: 2200, 7: 2211, 8: 2213, 9: 2224, 10: 2212, 11: 2223, 12: 2202, 13: 2213, 14: 2201, 15: 2212 } },
  { name: 'soil_tiles', tiles: { 0: 2312, 1: 2323, 2: 2311, 3: 2322, 4: 2301, 5: 2312, 6: 2300, 7: 2311, 8: 2313, 9: 2324, 10: 2312, 11: 2323, 12: 2302, 13: 2313, 14: 2301, 15: 2312 } },
  { name: 'dsoil_hills', tiles: { 0: 1412, 1: 1423, 2: 1411, 3: 1422, 4: 1401, 5: 1412, 6: 1400, 7: 1411, 8: 1413, 9: 1424, 10: 1412, 11: 1423, 12: 1402, 13: 1413, 14: 1401, 15: 1412 } },
  { name: 'dsoil_tiles', tiles: { 0: 1512, 1: 1523, 2: 1511, 3: 1522, 4: 1501, 5: 1512, 6: 1500, 7: 1511, 8: 1513, 9: 1524, 10: 1512, 11: 1523, 12: 1502, 13: 1513, 14: 1501, 15: 1512 } },
  { name: 'stone_hills', tiles: { 0: 2412, 1: 2423, 2: 2411, 3: 2422, 4: 2401, 5: 2412, 6: 2400, 7: 2411, 8: 2413, 9: 2424, 10: 2412, 11: 2423, 12: 2402, 13: 2413, 14: 2401, 15: 2412 } },
  { name: 'stone_tiles', tiles: { 0: 2512, 1: 2523, 2: 2511, 3: 2522, 4: 2501, 5: 2512, 6: 2500, 7: 2511, 8: 2513, 9: 2524, 10: 2512, 11: 2523, 12: 2502, 13: 2513, 14: 2501, 15: 2512 } },

  // ── Dungeon ground ──
  { name: 'dungeon_ground_orange', tiles: { 0: 4212, 1: 4223, 2: 4211, 3: 4222, 4: 4201, 5: 4212, 6: 4200, 7: 4211, 8: 4213, 9: 4224, 10: 4212, 11: 4223, 12: 4202, 13: 4213, 14: 4201, 15: 4212 } },
  { name: 'dungeon_ground_orange_dark', tiles: { 0: 4362, 1: 4373, 2: 4361, 3: 4372, 4: 4351, 5: 4362, 6: 4350, 7: 4361, 8: 4363, 9: 4374, 10: 4362, 11: 4373, 12: 4352, 13: 4363, 14: 4351, 15: 4362 } },

  // ── Winter ──
  { name: 'snow_tiles_1', tiles: { 0: 5112, 1: 5123, 2: 5111, 3: 5122, 4: 5101, 5: 5112, 6: 5100, 7: 5111, 8: 5113, 9: 5124, 10: 5112, 11: 5123, 12: 5102, 13: 5113, 14: 5101, 15: 5112 } },
  { name: 'snow_tiles_2', tiles: { 0: 5412, 1: 5423, 2: 5411, 3: 5422, 4: 5401, 5: 5412, 6: 5400, 7: 5411, 8: 5413, 9: 5424, 10: 5412, 11: 5423, 12: 5402, 13: 5413, 14: 5401, 15: 5412 } },

  // ── Extended / More ──
  { name: 'grass_layers_sorry_1', tiles: { 0: 5712, 1: 5723, 2: 5711, 3: 5722, 4: 5701, 5: 5712, 6: 5700, 7: 5711, 8: 5713, 9: 5724, 10: 5712, 11: 5723, 12: 5702, 13: 5713, 14: 5701, 15: 5712 } },
  { name: 'grass_layers_sorry_2', tiles: { 0: 6011, 1: 6021, 2: 6010, 3: 6020, 4: 6001, 5: 6011, 6: 6000, 7: 6010, 8: 6012, 9: 6022, 10: 6011, 11: 6021, 12: 6002, 13: 6012, 14: 6001, 15: 6011 } },
  { name: 'grass_layers_sorry_3', tiles: { 0: 6312, 1: 6323, 2: 6311, 3: 6322, 4: 6301, 5: 6312, 6: 6300, 7: 6311, 8: 6313, 9: 6324, 10: 6312, 11: 6323, 12: 6302, 13: 6313, 14: 6301, 15: 6312 } },
  { name: 'grass_layers_sorry_4', tiles: { 0: 6612, 1: 6623, 2: 6611, 3: 6622, 4: 6601, 5: 6612, 6: 6600, 7: 6611, 8: 6613, 9: 6624, 10: 6612, 11: 6623, 12: 6602, 13: 6613, 14: 6601, 15: 6612 } },
  { name: 'blue_grass_layers_1', tiles: { 0: 6912, 1: 6923, 2: 6911, 3: 6922, 4: 6901, 5: 6912, 6: 6900, 7: 6911, 8: 6913, 9: 6924, 10: 6912, 11: 6923, 12: 6902, 13: 6913, 14: 6901, 15: 6912 } },
  { name: 'blue_grass_layers_2', tiles: { 0: 7212, 1: 7223, 2: 7211, 3: 7222, 4: 7201, 5: 7212, 6: 7200, 7: 7211, 8: 7213, 9: 7224, 10: 7212, 11: 7223, 12: 7202, 13: 7213, 14: 7201, 15: 7212 } },
  { name: 'blue_grass_layers_3', tiles: { 0: 7512, 1: 7523, 2: 7511, 3: 7522, 4: 7501, 5: 7512, 6: 7500, 7: 7511, 8: 7513, 9: 7524, 10: 7512, 11: 7523, 12: 7502, 13: 7513, 14: 7501, 15: 7512 } },
  { name: 'blue_grass_layers_4', tiles: { 0: 7812, 1: 7823, 2: 7811, 3: 7822, 4: 7801, 5: 7812, 6: 7800, 7: 7811, 8: 7813, 9: 7824, 10: 7812, 11: 7823, 12: 7802, 13: 7813, 14: 7801, 15: 7812 } },
];

const DEFAULT_FLOOR_GID = 13; // grass center
const TILESETS = [
  'grass', 'fences', 'dirt', 'hills', 'water',
  'grass_v2', 'grass_hills', 'grass_layers', 'grass_layers2', 'grass_simple',
  'dgrass_hills', 'dgrass_layers', 'dgrass_layers2', 'dgrass_tiles', 'bush',
  'dirt_v2', 'dirt_wide', 'dirt_wide_v2', 'soil_hills', 'soil_tiles',
  'dsoil_hills', 'dsoil_tiles', 'stone_hills', 'stone_tiles',
  'dungeon_ground_orange', 'dungeon_ground_orange_dark',
  'snow_tiles_1', 'snow_tiles_2',
  'grass_layers_sorry_1', 'grass_layers_sorry_2', 'grass_layers_sorry_3', 'grass_layers_sorry_4',
  'blue_grass_layers_1', 'blue_grass_layers_2', 'blue_grass_layers_3', 'blue_grass_layers_4',
];

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

function validateSchema(schema) {
  const errors = [];
  const validTerrains = new Set(TERRAINS.map(t => t.name));

  if (schema.terrain && Array.isArray(schema.terrain)) {
    for (const entry of schema.terrain) {
      if (!validTerrains.has(entry.type)) {
        errors.push(`Terreno "${entry.type}" no esta soportado. Terrenos validos: ${[...validTerrains].join(', ')}`);
      }
    }
  }

  if (schema.walls && Array.isArray(schema.walls)) {
    for (const entry of schema.walls) {
      if (!validTerrains.has(entry.type)) {
        errors.push(`Muro "${entry.type}" no esta soportado. Tipos validos: ${[...validTerrains].join(', ')}`);
      }
    }
  }

  return errors;
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

  const schemaErrors = validateSchema(schema);
  if (schemaErrors.length > 0) {
    console.error('Error: El esquema semantico contiene terrenos no soportados:');
    for (const e of schemaErrors) console.error(`  - ${e}`);
    process.exit(1);
  }

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
    weather: schema.weather || { rain: 0, snow: 0, pollen: 0, leaves: 0, night: 0, fog: 0, dust: 0, wind: 0, storm: 0 },
  };

  const weatherTypes = ['rain', 'snow', 'pollen', 'leaves', 'night', 'fog', 'dust', 'wind', 'storm'];
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
