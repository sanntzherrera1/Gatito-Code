import { TILE, COLS } from '../../config/game.js';
import { OBJECTS, getFrameDimensions, getValidFrame } from '../../engine/level/TileRegistry.js';

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
  constructor(scene, tx, ty, textureKey, frame = 0, depthOverride = null) {
    const objDef = OBJECTS.find(o => o.key === textureKey);
    const safeFrame = getValidFrame(objDef, frame);
    const { occupyW: occW } = getFrameDimensions(objDef, safeFrame);
    const startTx = tx - Math.floor((occW - 1) / 2);
    const cx = startTx * TILE + (occW * TILE) / 2;
    const cy = ty * TILE + TILE;
    const depth = depthOverride ?? (ty * COLS + tx + 2000);
    this.scene = scene;
    this.cx = cx;
    this.cy = cy;
    this.textureKey = textureKey;
    // Árbol frutal: arranca con fruta; al talarlo, la primera tala la sacude (cae
    // la fruta) y lo deja como árbol normal pelado; la segunda lo tala.
    this.isFruitTree = !!(objDef?.variant?.fruit && objDef.variant.fruit !== 'none');
    this.hasFruit = this.isFruitTree;
    this.sprite = scene.add.sprite(cx, cy, textureKey, safeFrame)
      .setOrigin(0.5, 1)
      .setDepth(depth);

    const animKey = deriveAnimKey(textureKey, frame);
    if (scene.anims.exists(animKey)) {
      const anim = scene.anims.get(animKey);
      const animFrames = anim.frames.map(f => f.textureFrame);
      if (animFrames.includes(frame)) {
        this.sprite.anims.play(animKey);
      }
    }
  }

  /**
   * Sacude el árbol frutal: reproduce la animación de caída de fruta (frames 11-22)
   * y lo deja pelado (frame 22) como árbol normal. Resuelve al terminar.
   */
  shake() {
    return new Promise(resolve => {
      const animKey = `${this.textureKey}_shake`;
      const BARE_FRAME = 22;
      if (!this.scene.anims.exists(animKey)) {
        // Sin animación: cae a un estado pelado directo.
        this.sprite.setFrame(BARE_FRAME);
        this.hasFruit = false;
        resolve();
        return;
      }
      this.sprite.play(animKey);
      this.sprite.once('animationcomplete', anim => {
        if (anim.key !== animKey) return;
        this.sprite.anims.stop();
        this.sprite.setFrame(BARE_FRAME);
        this.hasFruit = false;
        resolve();
      });
    });
  }

  /**
   * Reproduce la animación de tala (árbol cae) sobre la misma base del objeto.
   * La copa cae hacia la izquierda por defecto; si se corta desde la izquierda
   * (dir 'right'), se espeja para que caiga del lado contrario al gato.
   * Al terminar deja el tronquito un instante y lo desvanece. Devuelve una Promise
   * que resuelve cuando todo terminó (y el sprite original quedó destruido).
   */
  fall(dir = 'left') {
    return new Promise(resolve => {
      const scene = this.scene;
      this.scene.tweens.killTweensOf(this.sprite);
      this.sprite.setVisible(false);

      // La hoja de caída es de 64px (vs 48px del árbol) y su tronco está fijo 8px a
      // la derecha del centro del frame. Se compensa para que el árbol al caer y el
      // tocón final queden sobre el tile original. Si se corta desde la izquierda,
      // se espeja (cae a la derecha) y el offset del tronco se invierte.
      const flip = dir === 'right';
      const x = this.cx + (flip ? 7 : -8);
      const faller = scene.add.sprite(x, this.cy, 'tree_fall', 0)
        .setOrigin(0.5, 1)
        .setFlipX(flip)
        .setDepth(this.sprite.depth);
      faller.play('tree_fall');
      faller.once('animationcomplete', () => {
        // Tronquito: se mantiene un instante y luego se desvanece.
        scene.time.delayedCall(300, () => {
          scene.tweens.add({
            targets: faller, alpha: 0,
            duration: 300, ease: 'Sine.easeIn',
            onComplete: () => {
              faller.destroy();
              if (this.sprite) this.sprite.destroy();
              resolve();
            },
          });
        });
      });
    });
  }
}
