import { TILE } from '../../config/game.js';
import { OBJECTS } from '../level/TileRegistry.js';

export class WorldObjectView {
  constructor(scene, tx, ty, textureKey, frame = 0, depth = 35) {
    const cx = tx * TILE + TILE / 2;
    const cy = ty * TILE + TILE / 2;
    this.sprite = scene.add.sprite(cx, cy, textureKey, frame).setDepth(depth);

    const def = OBJECTS.find(o => o.key === textureKey);
    const groupSize = def?.animGroupSize;

    if (groupSize) {
      // Anima `groupSize` frames consecutivos a partir del frame seleccionado.
      const animKey = `${textureKey}_grp_${frame}`;
      if (!scene.anims.exists(animKey)) {
        const frames = Array.from({ length: groupSize }, (_, i) => frame + i);
        scene.anims.create({
          key: animKey,
          frames: scene.anims.generateFrameNumbers(textureKey, { frames }),
          frameRate: 8,
          repeat: -1,
        });
      }
      this.sprite.anims.play(animKey);
    } else {
      const idleKey = `${textureKey}_idle`;
      if (scene.anims.exists(idleKey)) {
        this.sprite.anims.play(idleKey);
      }
    }
  }
}
