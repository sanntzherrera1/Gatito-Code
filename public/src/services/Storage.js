import { TILESETS } from '../engine/level/TileRegistry.js';

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
        // Validate GIDs: if any GID is > 10000, the saved data uses old firstgid (100100)
        // and must be discarded since the tileset now has firstgid 8080.
        const maxGid = Math.max(
          ...(parsed.layers?.floor || []),
          ...(parsed.layers?.walls || []),
          ...(parsed.layers?.path || []),
          ...(parsed.layers?.overlay || []),
          ...(parsed.layers?.top || []),
          0
        );
        if (maxGid > 10000) {
          console.warn(`Level "${levelKey}" override has invalid GIDs (${maxGid}), discarding.`);
          localStorage.removeItem(`level:${levelKey}`);
        } else {
          return parsed;
        }
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

// ── Custom level registry ────────────────────────────────────────────────────

export const CUSTOM_LEVELS_KEY = 'gatito_custom_levels';
export const PROGRESS_KEY = 'gatito_progress';

export const BUILTIN_LEVELS = [
  { key: 'nivel0', name: 'Casa',     scene: 'Nivel0' },
  { key: 'gym',    name: 'Jardin',   scene: 'Gym' },
  { key: 'main',   name: 'Huerta',   scene: 'Main' },
  { key: 'nivel3', name: 'Funcion',  scene: 'Nivel3',       tutorial: true },
  { key: 'bosque_floral', name: 'Bosque', scene: 'BosqueFloral' },
  { key: 'remanso_otonal', name: 'Otoño', scene: 'Custom' },
  { key: 'if',     name: 'Rocas',    scene: 'Custom',       tutorial: true },
  { key: 'si_2',   name: 'Puente',   scene: 'Custom',       tutorial: true },
  { key: 'jardin_tutorial', name: 'Pradera', scene: 'Custom', tutorial: true },
  { key: 'for',    name: 'Repetir',  scene: 'Custom',       tutorial: true },
  { key: 'si_1',   name: 'Sendero',  scene: 'Custom',       tutorial: true },
  { key: 'si_3',   name: 'Troncos',  scene: 'Custom',       tutorial: true },
];

export function getCustomLevels() {
  try { return JSON.parse(localStorage.getItem(CUSTOM_LEVELS_KEY) || '[]'); }
  catch { return []; }
}

export function getAllLevels() {
  return [
    ...BUILTIN_LEVELS,
    ...getCustomLevels().map(l => ({ ...l, scene: 'Custom' }))
  ];
}

export function getCompletedLevels() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]'); }
  catch { return []; }
}

export function markLevelCompleted(key) {
  const completed = getCompletedLevels();
  if (!completed.includes(key)) {
    completed.push(key);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(completed));
  }
}

export function addCustomLevel(key, name) {
  const levels = getCustomLevels();
  if (!levels.find(l => l.key === key)) {
    levels.push({ key, name });
    localStorage.setItem(CUSTOM_LEVELS_KEY, JSON.stringify(levels));
  }
}

export function createNewLevel(key) {
  const cols = 16, rows = 12;
  const data = {
    version: 1, cols, rows, tile: 16,
    tilesets: TILESETS.map(t => t.name),
    layers: {
      floor: new Array(cols * rows).fill(13),
      path: new Array(cols * rows).fill(0),
      walls: new Array(cols * rows).fill(0),
      overlay: new Array(cols * rows).fill(0),
      top: new Array(cols * rows).fill(0),
    },
    spawn: { tx: 8, ty: 6 },
    objects: [],
    weather: { rain: 0, snow: 0, pollen: 0, leaves: 0, night: 0, fog: 0, dust: 0, wind: 0, storm: 0 },
  };
  writeLevelJson(key, data);
  return data;
}
