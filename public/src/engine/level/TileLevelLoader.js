import { readLevelJson } from '../../services/Storage.js';
import { TILESETS } from './TileRegistry.js';
import { expandLayer } from './TileRegistry.js';
import { migrateWeather } from './WeatherSystem.js';
import { Level } from '../../domain/Level.js';

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

  const spawn = lvl.spawn || { tx: Math.floor(cols / 2), ty: Math.floor(rows / 2) };
  const objects = lvl.objects ?? [];
  const weather = migrateWeather(lvl.weather);
  const level = new Level(cols, rows, solid, spawn, objects, weather);

  return {
    map, floorLayer, wallsLayer, level, cols, rows,
    flat: { floor, walls },
    objects,
    spawn,
    solid,
    raw: lvl,
    weather,
  };
}
