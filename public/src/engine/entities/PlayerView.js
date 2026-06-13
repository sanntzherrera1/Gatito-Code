import { TILE, STEP_MS, COLS } from '../../config/game.js';

/**
 * Visual representation of the player — sprite, tweens and animations.
 * Knows nothing about collision; the scene tells it where to go.
 */
export class PlayerView {
  constructor(scene, playerModel) {
    this.scene = scene;
    this.playerModel = playerModel;

    const [x, y] = this._tileCenter(playerModel.tx, playerModel.ty);
    const depth = playerModel.ty * COLS + playerModel.tx + 2001;
    this.sprite = scene.add.sprite(x, y, 'character_base', 0).setDepth(depth);
    this.playIdle(playerModel.facing);
  }

  _tileCenter(tx, ty) {
    return [tx * TILE + TILE / 2, ty * TILE + TILE / 2];
  }

  static getBaseFrameForDir(dir) {
    if (dir === 'up') return 8;
    if (dir === 'right') return 16;
    if (dir === 'left') return 24;
    return 0; // down
  }

  static getIdleFrameForDir(dir) {
    return PlayerView.getBaseFrameForDir(dir);
  }

  static getJumpFramesForDir(dir) {
    const base = PlayerView.getBaseFrameForDir(dir);
    return [base + 1, base + 2];
  }

  playIdle(dir) {
    this.sprite.anims.play(`idle_${dir}`, true);
  }

  playWalk(dir) {
    this.sprite.anims.play(`walk_${dir}`, true);
  }

  playCelebrate() {
    this.sprite.anims.stop();
    this.sprite.setFrame(PlayerView.getIdleFrameForDir('down'));
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.sprite.y - 12,
      duration: 250,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  playSad() {
    this.sprite.anims.stop();
    this.sprite.setFrame(PlayerView.getIdleFrameForDir('down'));
    this.sprite.setTint(0x7777ff);
    this.scene.tweens.add({
      targets: this.sprite,
      scaleY: 0.8,
      duration: 500,
      ease: 'Bounce.easeOut'
    });
  }

  stopAnimations() {
    this.scene.tweens.killTweensOf(this.sprite);
    this.sprite.setTint(0xffffff);
    this.sprite.setScale(1);
  }

  setPosition(tx, ty) {
    const [x, y] = this._tileCenter(tx, ty);
    this.sprite.setPosition(x, y);
    this.sprite.setDepth(ty * COLS + tx + 2001);
  }

  /**
   * Tween the sprite to a new tile position.
   */
  moveTo(tx, ty) {
    return new Promise(resolve => {
      const [x, y] = this._tileCenter(tx, ty);
      this.playWalk(this.playerModel.facing);
      this.scene.tweens.add({
        targets: this.sprite, x, y,
        duration: STEP_MS, ease: 'Linear',
        onComplete: () => {
          this.sprite.setDepth(ty * COLS + tx + 2001);
          resolve();
        },
      });
    });
  }

  /**
   * Tween a jump arc between two tile positions.
   */
  jumpTo(fromTx, fromTy, toTx, toTy) {
    return new Promise(resolve => {
      const [startX, startY] = this._tileCenter(fromTx, fromTy);
      const [endX, endY] = this._tileCenter(toTx, toTy);
      const dir = this.playerModel.facing;

      this.sprite.anims.stop();
      const [f1, f2] = PlayerView.getJumpFramesForDir(dir);
      this.sprite.setFrame(f1);
      this.scene.time.delayedCall(Math.floor(STEP_MS), () => {
        if (!this.sprite) return;
        this.sprite.setFrame(f2);
      });

      const jumpHeight = 10;
      const state = { t: 0 };
      this.scene.tweens.add({
        targets: state,
        t: 1,
        duration: STEP_MS * 2,
        ease: 'Linear',
        onUpdate: () => {
          const t = state.t;
          this.sprite.x = startX + (endX - startX) * t;
          this.sprite.y = startY + (endY - startY) * t - Math.sin(Math.PI * t) * jumpHeight;
        },
        onComplete: () => {
          this.sprite.x = endX;
          this.sprite.y = endY;
          this.sprite.setDepth(toTy * COLS + toTx + 2001);
          this.sprite.anims.stop();
          this.sprite.setFrame(PlayerView.getIdleFrameForDir(dir));
          resolve();
        },
      });
    });
  }
}
