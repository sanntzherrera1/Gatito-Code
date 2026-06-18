import { TILE, COLS } from '../../config/game.js';
import { OBJECTS, getFrameDimensions } from '../../engine/level/TileRegistry.js';
import { deriveAnimKey } from './WorldObjectView.js';

/**
 * Visual representation of a pickup item — floating sprite + collection effect.
 */
export class PickupView {
  constructor(scene, tx, ty, frame, textureKey = 'plants', animated = true) {
    this.scene = scene;
    this.tx = tx;
    this.ty = ty;
    const objDef = OBJECTS.find(o => o.key === textureKey);
    const { occupyW: occW } = getFrameDimensions(objDef, frame);
    const startTx = tx - Math.floor((occW - 1) / 2);
    const cx = startTx * TILE + (occW * TILE) / 2;
    const cy = ty * TILE + TILE;
    const depth = ty * COLS + tx + 2002;
    this.sprite = scene.add.sprite(cx, cy, textureKey, frame)
      .setOrigin(0.5, 1)
      .setDepth(depth);

    const animKey = deriveAnimKey(textureKey, frame);
    if (scene.anims.exists(animKey)) {
      this.sprite.anims.play(animKey);
    } else if (animated) {
      this.floatTween = scene.tweens.add({
        targets: this.sprite, y: cy - 2,
        duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    }
  }

  /**
   * Play the collection animation and self-destruct.
   */
  collect() {
    this.scene.sound.play('pickup_sound', { volume: 0.12 });
    this.scene.tweens.killTweensOf(this.sprite);
    const s = this.sprite;

    this.scene.tweens.add({
      targets: s, y: s.y - 14, scale: 1.8, alpha: 0,
      duration: 380, ease: 'Cubic.easeOut',
      onComplete: () => s.destroy(),
    });

    const ring = this.scene.add.circle(s.x, s.y, 4, 0xffffff, 0)
      .setStrokeStyle(2, 0xffee88).setDepth(60);
    this.scene.tweens.add({
      targets: ring, scale: 3, alpha: { from: 1, to: 0 },
      duration: 380, ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy(),
    });

    const txt = this.scene.add.text(s.x, s.y - 6, '+1', {
      fontFamily: 'monospace', fontSize: '9px', color: '#ffee88',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(61);
    this.scene.tweens.add({
      targets: txt, y: txt.y - 16, alpha: 0,
      duration: 500, ease: 'Cubic.easeOut',
      onComplete: () => txt.destroy(),
    });
  }
}
