import { preloadAssets, OBJECTS, defineTileFrames } from '../../engine/level/TileRegistry.js';
import { createObjectAnimations } from '../../engine/level/ObjectAnimations.js';
import { bindUiSfx } from '../audio.js';

const BASE = 'assets/SproutLands-Sprites';

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    this._loadingAudio = new Audio('assets/audio/loading.mp3');
    this._loadingAudio.volume = 0.15;
    const tryPlay = () => this._loadingAudio?.play().catch(() => {});
    tryPlay();
    const resume = () => { tryPlay(); document.removeEventListener('pointerdown', resume); document.removeEventListener('keydown', resume); };
    document.addEventListener('pointerdown', resume, { once: true });
    document.addEventListener('keydown', resume, { once: true });

    const _t = (k) => window.__t?.(k) ?? k;
    this._setBootStatus(_t('boot.world'));
    this.load.on('progress', (value) => {
      this._setBootProgress(value, value < 1 ? _t('boot.resources') : _t('boot.tuning'));
    });
    this.load.on('complete', () => {
      this._setBootProgress(1, _t('boot.ready'));
    });
    // Character — Premium 384x1152 → 8x24 grid of 48x48 frames.
    // First 8 rows: idle_down, idle_up, idle_right, idle_left,
    //               walk_down, walk_up, walk_right, walk_left.
    this.load.spritesheet(
      'character_base',
      `${BASE}/Characters/Premium Charakter Spritesheet.png`,
      { frameWidth: 48, frameHeight: 48 }
    );
    // Animación de caída de árbol (talar): 832x48 → 13 frames de 64x48.
    this.load.spritesheet(
      'tree_fall',
      `${BASE}/Objects/Tree animations/tree_fall_animation_sprite_sheet.png`,
      { frameWidth: 64, frameHeight: 48 }
    );
    // Tilesets + level JSONs.
    preloadAssets(this);
    // Object spritesheets. Si el objeto define `frames` (atlas de rects propios dentro de una
    // hoja mixta), se carga como imagen y los frames se definen en create().
    for (const o of OBJECTS) {
      if (this.textures.exists(o.key)) continue;
      if (o.frames) this.load.image(o.key, o.url);
      else this.load.spritesheet(o.key, o.url, { frameWidth: o.frameW, frameHeight: o.frameH });
    }
    // UI assets manifest.
    this.load.json('ui_manifest', 'assets/ui.json');

    // Emote icons (happy/sad faces) for victory/defeat overlays.
    this.load.spritesheet(
      'emote_icons',
      'assets/SproutLands-UI/Sprite sheets/Icons/special icons/Small Happines-Sadness icons.png',
      { frameWidth: 16, frameHeight: 16 }
    );

    // UI de configuracion (panel + icono altavoz)
    this.load.image('settings_panel', 'assets/SproutLands-UI/Sprite sheets/settings-panel.png');
    this.load.image('settings_speaker', 'assets/SproutLands-UI/Sprite sheets/settings-speaker.png');

    // Audio
    this.load.audio('bgm1', 'assets/audio/background-music-1.mp3');
    this.load.audio('bgm2', 'assets/audio/background-music-2.wav');
    this.load.audio('bgm3', 'assets/audio/background-music-3.mp3');
    this.load.audio('win_sound', 'assets/audio/win-sound.wav');
    this.load.audio('lose_sound', 'assets/audio/lose-sound.mp3');
    this.load.audio('pickup_sound', 'assets/audio/collect_point.wav');
    this.load.audio('ui_click', 'assets/audio/bip_1.wav');
    this.load.audio('jump_sound', 'assets/audio/squick_1.wav');
    this.load.audio('ui_execute', 'assets/audio/bip_execute.mp3');
    this.load.audio('ui_focus', 'assets/audio/ui_focus.mp3');
    this.load.audio('ui_erase', 'assets/audio/erase.mp3');
    this.load.audio('drag_pick', 'assets/audio/rollover4.ogg');
    this.load.audio('drag_drop', 'assets/audio/rollover5.ogg');
    this.load.audio('chop_wood_0', 'assets/audio/impact/impactWood_medium_000.ogg');
    this.load.audio('chop_wood_1', 'assets/audio/impact/impactWood_medium_001.ogg');
    this.load.audio('chop_wood_2', 'assets/audio/impact/impactWood_medium_004.ogg');
    this.load.audio('cam_slide', 'assets/audio/slide_1.mp3');
    this.load.audio('path_bounce', 'assets/audio/bounce.wav');
    this.load.audio('step_grass_0', 'assets/audio/impact/footstep_grass_000.ogg');
    this.load.audio('step_grass_1', 'assets/audio/impact/footstep_grass_003.ogg');
    this.load.audio('step_grass_2', 'assets/audio/impact/footstep_grass_004.ogg');
    this.load.audio('step_wood_0', 'assets/audio/impact/impactPlank_medium_000.ogg');
    this.load.audio('step_wood_1', 'assets/audio/impact/impactPlank_medium_001.ogg');
    this.load.audio('step_wood_2', 'assets/audio/impact/impactPlank_medium_002.ogg');
  }

  create() {
    if (this._loadingAudio) { this._loadingAudio.pause(); this._loadingAudio = null; }
    bindUiSfx(this.sound);

    // Generar textura de pixel blanco 2×2 para particulas climaticas.
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 2;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 2, 2);
    this.textures.addCanvas('pixel', canvas);

    // Textura de linea horizontal para viento: 128×1 pixeles.
    const windCanvas = document.createElement('canvas');
    windCanvas.width = 128;
    windCanvas.height = 1;
    const wctx = windCanvas.getContext('2d');
    wctx.fillStyle = '#ffffff';
    wctx.fillRect(0, 0, 128, 1);
    this.textures.addCanvas('wind_streak', windCanvas);

    // Textura de bruma difusa para viento: 256×32 pixeles con gradiente horizontal.
    const hazeCanvas = document.createElement('canvas');
    hazeCanvas.width = 256;
    hazeCanvas.height = 32;
    const hctx = hazeCanvas.getContext('2d');
    const grad = hctx.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(0.5, 'rgba(255,255,255,1)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    hctx.fillStyle = grad;
    hctx.fillRect(0, 0, 256, 32);
    this.textures.addCanvas('wind_haze', hazeCanvas);

    const walk = (key, frames) => this.anims.create({
      key,
      frames: this.anims.generateFrameNumbers('character_base', { frames }),
      frameRate: 16, repeat: -1,
    });
    walk('walk_down',  [32, 33, 34, 35, 36, 37, 38, 39]);
    walk('walk_up',    [40, 41, 42, 43, 44, 45, 46, 47]);
    walk('walk_right', [48, 49, 50, 51, 52, 53, 54, 55]);
    walk('walk_left',  [56, 57, 58, 59, 60, 61, 62, 63]);

    const idle = (key, frames) => this.anims.create({
      key,
      frames: this.anims.generateFrameNumbers('character_base', { frames }),
      frameRate: 10, repeat: -1,
    });
    idle('idle_down',  [0, 1, 2, 3, 4, 5, 6, 7]);
    idle('idle_up',    [8, 9, 10, 11, 12, 13, 14, 15]);
    idle('idle_right', [16, 17, 18, 19, 20, 21, 22, 23]);
    idle('idle_left',  [24, 25, 26, 27, 28, 29, 30, 31]);

    // Hacha (talar árboles): filas 16-19 del Premium sheet → frames 128-159. One-shot.
    const axe = (key, frames) => this.anims.create({
      key,
      frames: this.anims.generateFrameNumbers('character_base', { frames }),
      frameRate: 12, repeat: 0,
    });
    axe('axe_down',  [128, 129, 130, 131, 132, 133, 134, 135]);
    axe('axe_up',    [136, 137, 138, 139, 140, 141, 142, 143]);
    axe('axe_right', [144, 145, 146, 147, 148, 149, 150, 151]);
    axe('axe_left',  [152, 153, 154, 155, 156, 157, 158, 159]);

    // Caída del árbol al ser talado (one-shot).
    this.anims.create({
      key: 'tree_fall',
      frames: this.anims.generateFrameNumbers('tree_fall', { start: 0, end: 12 }),
      frameRate: 12, repeat: 0,
    });

    // Definir sub-frames (atlas) para objetos con rects propios dentro de una hoja mixta.
    // Cada objeto grande/multi-tile se "saca" de su hoja sin re-cortar el PNG.
    for (const o of OBJECTS) {
      if (!o.frames) continue;
      const tex = this.textures.get(o.key);
      if (!tex) continue;
      o.frames.forEach((f, i) => {
        if (!tex.has(String(i))) tex.add(i, 0, f.x, f.y, f.w, f.h);
      });
    }

    // Definir sub-frames (uno por celda de la grilla) en cada textura de tileset.
    // Habilita que el editor (y cualquier consumidor) renderice un tile puntual
    // con `scene.add.sprite(tilesetKey, localIndex)`.
    defineTileFrames(this);

    createObjectAnimations(this);

    this._loadUIAssets();
  }

  _loadUIAssets() {
    const manifest = this.cache.json.get('ui_manifest');
    this._setBootStatus(window.__t?.('boot.ui') ?? 'Armando interfaz...');

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
      this._setBootProgress(1, window.__t?.('boot.menu') ?? 'Abriendo menu...');
      this.scene.start('Menu');
    });

    // If nothing new to load, complete fires synchronously only if we start the loader.
    if (this.load.totalToLoad === 0) {
      this._setBootProgress(1, window.__t?.('boot.menu') ?? 'Abriendo menu...');
      this.scene.start('Menu');
    } else {
      this.load.start();
    }
  }

  _setBootProgress(value, status) {
    const progress = Math.max(0, Math.min(1, value ?? 0));
    const bar = document.getElementById('boot-progress-bar');
    const label = document.getElementById('boot-progress-label');
    if (bar) bar.style.width = `${Math.round(progress * 100)}%`;
    if (label) label.textContent = `${Math.round(progress * 100)}%`;
    if (status) this._setBootStatus(status);
  }

  _setBootStatus(status) {
    const node = document.getElementById('boot-progress-status');
    if (node) node.textContent = status;
  }
}
