import { TILE, COLS } from '../../config/game.js';

/**
 * Deriva la key de animacion idle a partir del textureKey y el frame inicial.
 * Permite que un mismo spritesheet albergue multiples estados animados.
 */
export function deriveAnimKey(textureKey, frame) {
  if (textureKey === 'boats') {
    if (frame <= 2) return 'boats_idle_moored';
    if (frame <= 5) return 'boats_idle_free';
  }
  return `${textureKey}_idle`;
}

/**
 * Wrapper visual para objetos decorativos del mundo.
 * Si existe una animacion idle derivada del textureKey+frame,
 * la reproduce automaticamente; de lo contrario muestra el frame estatico.
 */
export class WorldObjectView {
  constructor(scene, tx, ty, textureKey, frame = 0) {
    const cx = tx * TILE + TILE / 2;
    const cy = ty * TILE + TILE;
    const depth = ty * COLS + tx + 2000;
    this.sprite = scene.add.sprite(cx, cy, textureKey, frame)
      .setOrigin(0.5, 1)
      .setDepth(depth);

    const animKey = deriveAnimKey(textureKey, frame);
    if (scene.anims.exists(animKey)) {
      this.sprite.anims.play(animKey);
    }
  }
}
