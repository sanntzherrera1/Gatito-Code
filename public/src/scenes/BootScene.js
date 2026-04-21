import { preloadAssets, OBJECTS } from '../level/TileLevel.js';

const BASE = 'assets/SproutLands-Sprites';

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    // Character — 192x192 → 4x4 grid of 48x48 frames.
    this.load.spritesheet(
      'character_base',
      `${BASE}/Characters/Basic Charakter Spritesheet.png`,
      { frameWidth: 48, frameHeight: 48 }
    );
    // Plants — 96x32 → 6x2 grid of 16x16. Pickup frames used: 5 (corn), 11 (turnip).
    this.load.spritesheet(
      'plants',
      `${BASE}/Objects/Basic Plants.png`,
      { frameWidth: 16, frameHeight: 16 }
    );
    // Tilesets + level JSONs.
    preloadAssets(this);
    // Object spritesheets.
    for (const o of OBJECTS) {
      if (!this.textures.exists(o.key))
        this.load.spritesheet(o.key, o.url, { frameWidth: o.frameW, frameHeight: o.frameH });
    }
    // UI assets manifest.
    this.load.json('ui_manifest', 'assets/ui.json');
  }

  create() {
    const walk = (key, frames) => this.anims.create({
      key,
      frames: this.anims.generateFrameNumbers('character_base', { frames }),
      frameRate: 8, repeat: -1,
    });
    walk('walk_down',  [0, 1, 2, 3]);
    walk('walk_up',    [4, 5, 6, 7]);
    walk('walk_left',  [8, 9, 10, 11]);
    walk('walk_right', [12, 13, 14, 15]);

    const idle = (key, frame) => this.anims.create({
      key, frames: [{ key: 'character_base', frame }],
    });
    idle('idle_down', 0);
    idle('idle_up', 4);
    idle('idle_left', 8);
    idle('idle_right', 12);

    this._loadUIAssets();
  }

  _loadUIAssets() {
    const manifest = this.cache.json.get('ui_manifest');

    for (const t of manifest.textures) {
      if (this.textures.exists(t.key)) continue;
      if (t.type === 'spritesheet') this.load.spritesheet(t.key, t.url, t.frameConfig);
      else                          this.load.image(t.key, t.url);
    }

    this.load.once('complete', () => {
      for (const anim of manifest.animations) {
        if (this.anims.exists(anim.key)) continue;
        this.anims.create({
          key: anim.key,
          frames: this.anims.generateFrameNumbers(anim.spriteKey, { frames: anim.frames }),
          frameRate: anim.frameRate,
          repeat: anim.repeat ?? 0,
        });
      }
      this.scene.start('Menu');
    });

    // If nothing new to load, complete fires synchronously only if we start the loader.
    if (this.load.totalToLoad === 0) {
      this.scene.start('Menu');
    } else {
      this.load.start();
    }
  }
}
