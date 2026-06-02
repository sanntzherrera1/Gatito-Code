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
export function animatePath(scene, { delay = 300, duration = 700, color = 0xffe600, alpha = 0.7 } = {}) {
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
        onComplete: () => rect.destroy(),
      });
    });
  });
}
