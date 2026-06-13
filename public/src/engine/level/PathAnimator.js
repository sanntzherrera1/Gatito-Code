import { TILE } from '../../config/game.js';

/**
 * Anima el path de un nivel iluminando cada casilla en orden (BFS desde spawn).
 * @param {Phaser.Scene} scene  - La escena activa (debe tener pathFlat, cols, rows, level.spawn)
 * @param {Object} opts
 * @param {number} [opts.delay=300]    - Ms entre cada tile
 * @param {number} [opts.duration=700] - Ms del fade-out de cada tile
 * @param {number} [opts.color=0xffe600]
 * @param {number} [opts.alpha=0.7]
 */
export function animatePath(scene, { delay = 300, duration = 700, color = 0xffe600, alpha = 0.7, onComplete } = {}) {
  const path = scene.pathFlat;
  if (!path?.some(v => v !== 0)) return;

  const cols = scene.cols, rows = scene.rows;
  const isPath = (tx, ty) => tx >= 0 && ty >= 0 && tx < cols && ty < rows && path[ty * cols + tx] !== 0;
  const dirs = [{dx:0,dy:-1},{dx:0,dy:1},{dx:-1,dy:0},{dx:1,dy:0}];

  const spawn = scene.level.spawn;
  const visited = new Set([`${spawn.tx},${spawn.ty}`]);
  const queue = [{ tx: spawn.tx, ty: spawn.ty }];
  const ordered = [];

  while (queue.length) {
    const { tx, ty } = queue.shift();
    ordered.push({ tx, ty });
    for (const { dx, dy } of dirs) {
      const nx = tx + dx, ny = ty + dy;
      const key = `${nx},${ny}`;
      if (!visited.has(key) && isPath(nx, ny)) {
        visited.add(key);
        queue.push({ tx: nx, ty: ny });
      }
    }
  }

  ordered.forEach(({ tx, ty }, i) => {
    scene.time.delayedCall(i * delay, () => {
      const rect = scene.add.rectangle(
        tx * TILE + TILE / 2, ty * TILE + TILE / 2,
        TILE, TILE, color
      ).setAlpha(alpha).setDepth(50);
      scene.tweens.add({
        targets: rect, alpha: 0, duration, ease: 'Sine.easeOut',
        onComplete: () => {
          rect.destroy();
          if (onComplete && i === ordered.length - 1) {
            scene.time.delayedCall(0, onComplete);
          }
        },
      });
    });
  });
}

/**
 * Recorre el corredor de la capa `path` desde el spawn hasta el extremo lejano y
 * devuelve la lista ordenada de direcciones ('up' | 'down' | 'left' | 'right').
 * Pensado para caminos lineales (cada tile tiene a lo sumo un vecino sin visitar),
 * que es como se diseñan en el editor de niveles.
 * @param {Phaser.Scene} scene - Debe tener pathFlat, cols, rows, level.spawn
 * @returns {string[]} Direcciones en orden de recorrido (vacío si no hay path)
 */
export function pathDirections(scene) {
  const path = scene.pathFlat;
  if (!path?.some(v => v !== 0)) return [];

  const cols = scene.cols, rows = scene.rows;
  const isPath = (tx, ty) => tx >= 0 && ty >= 0 && tx < cols && ty < rows && path[ty * cols + tx] !== 0;
  const DELTAS = [
    { dx: 0, dy: -1, dir: 'up' }, { dx: 0, dy: 1, dir: 'down' },
    { dx: -1, dy: 0, dir: 'left' }, { dx: 1, dy: 0, dir: 'right' },
  ];

  let { tx, ty } = scene.level.spawn;
  const visited = new Set([`${tx},${ty}`]);
  const dirs = [];
  while (true) {
    const next = DELTAS.find(({ dx, dy }) => isPath(tx + dx, ty + dy) && !visited.has(`${tx + dx},${ty + dy}`));
    if (!next) break;
    tx += next.dx; ty += next.dy;
    visited.add(`${tx},${ty}`);
    dirs.push(next.dir);
  }
  return dirs;
}
