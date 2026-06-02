<<<<<<< HEAD
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
=======
import { TILE, COLS } from '../../config/game.js';
import { OBJECTS } from '../../engine/level/TileRegistry.js';

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
    const objDef = OBJECTS.find(o => o.key === textureKey);
    const occW = objDef?.occupyW ?? Math.ceil((objDef?.frameW ?? TILE) / TILE);
    const startTx = tx - Math.floor((occW - 1) / 2);
    const cx = startTx * TILE + (occW * TILE) / 2;
    const cy = ty * TILE + TILE;
    const depth = ty * COLS + tx + 2000;
    this.sprite = scene.add.sprite(cx, cy, textureKey, frame)
      .setOrigin(0.5, 1)
      .setDepth(depth);

    const animKey = deriveAnimKey(textureKey, frame);
    if (scene.anims.exists(animKey)) {
      const anim = scene.anims.get(animKey);
      const animFrames = anim.frames.map(f => f.textureFrame);
      if (animFrames.includes(frame)) {
        this.sprite.anims.play(animKey);
>>>>>>> main
      }
    }
  }
}
