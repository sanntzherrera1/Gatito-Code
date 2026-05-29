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
  const path = expandLayer(lvl.layers.path || [], cols, rows);
  const overlay = expandLayer(lvl.layers.overlay || [], cols, rows);
  const top = expandLayer(lvl.layers.top || [], cols, rows);

  const map = scene.make.tilemap({
    tileWidth: 16, tileHeight: 16, width: cols, height: rows,
  });

  const tilesetObjs = TILESETS.map(t =>
    map.addTilesetImage(t.name, t.key, 16, 16, 0, 0, t.firstgid)
  );

  const floorLayer = map.createBlankLayer('floor', tilesetObjs, 0, 0, cols, rows).setDepth(0);
  const pathLayer = map.createBlankLayer('path', tilesetObjs, 0, 0, cols, rows).setDepth(10);
  const wallsLayer = map.createBlankLayer('walls', tilesetObjs, 0, 0, cols, rows).setDepth(20);
  const overlayLayer = map.createBlankLayer('overlay', tilesetObjs, 0, 0, cols, rows).setDepth(30);
  const topLayer = map.createBlankLayer('top', tilesetObjs, 0, 0, cols, rows).setDepth(45);

  const hasPath = path.some(p => p !== 0);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const f = floor[y * cols + x];
      const p = path[y * cols + x];
      const w = walls[y * cols + x];
      const o = overlay[y * cols + x];
      const t = top[y * cols + x];
      if (f) floorLayer.putTileAt(f, x, y);
      if (p) pathLayer.putTileAt(p, x, y);
      if (w) wallsLayer.putTileAt(w, x, y);
      if (o) overlayLayer.putTileAt(o, x, y);
      if (t) topLayer.putTileAt(t, x, y);
    }
  }

  const solid = [];
  for (let y = 0; y < rows; y++) {
    const row = [];
    for (let x = 0; x < cols; x++) {
      const isWall = walls[y * cols + x] !== 0;
      const isPath = path[y * cols + x] !== 0;
      // Solid if it's a wall OR if a path exists but this tile is not part of it
      row.push(isWall || (hasPath && !isPath));
    }
    solid.push(row);
  }

  const spawn = lvl.spawn || { tx: Math.floor(cols / 2), ty: Math.floor(rows / 2) };
  const objects = lvl.objects ?? [];

  if (hasPath) {
    if (spawn && solid[spawn.ty]) solid[spawn.ty][spawn.tx] = false;
    for (const obj of objects) {
      if (obj.type === 'pickup' || obj.type === 'pickup_with_animation') {
        if (solid[obj.ty]) solid[obj.ty][obj.tx] = false;
      }
    }
  }
  const weather = migrateWeather(lvl.weather);
  const level = new Level(cols, rows, solid, spawn, objects, weather);

  return {
    map, floorLayer, pathLayer, wallsLayer, overlayLayer, topLayer, level, cols, rows,
    flat: { floor, path, walls, overlay, top },
    objects,
    spawn,
    solid,
    raw: lvl,
    weather,
    introPoints: lvl.introPoints || [],
  };
}
