import { TILE } from '../../config/game.js';

/**
 * Wrapper visual para objetos decorativos del mundo.
 * Si existe una animacion 'idle' registrada para el textureKey,
 * la reproduce automaticamente; de lo contrario muestra el frame estatico.
 */
export class WorldObjectView {
  constructor(scene, tx, ty, textureKey, frame = 0) {
    const cx = tx * TILE + TILE / 2;
    const cy = ty * TILE + TILE / 2;
    this.sprite = scene.add.sprite(cx, cy, textureKey, frame).setDepth(10);

    const idleKey = `${textureKey}_idle`;
    if (scene.anims.exists(idleKey)) {
      this.sprite.anims.play(idleKey);
    }
  }
}
