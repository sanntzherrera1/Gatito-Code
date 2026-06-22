import { TILE, COLS, ROWS } from '../../config/game.js';
import { getCustomLevels, addCustomLevel, createNewLevel, getAllLevels, getCompletedLevels, BUILTIN_LEVELS } from '../../services/Storage.js';
import { playMusic } from '../audio.js';
import * as Settings from '../../services/Settings.js';

export class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    document.body.classList.remove('app-loading');
    document.getElementById('boot-splash')?.remove();
    window.__setPanels?.(false);
    window.__setEditor?.(null);

    if (!this.sound.get('bgm1')?.isPlaying) {
      this.sound.stopAll();
      this.menuMusic = playMusic(this, 'bgm1');
    }
    // Cursor "pointing" sobre botones de Phaser (dibujados en canvas): al pasar
    // por cualquier objeto interactivo de la escena, marcamos body.cursor-point
    // y el CSS cambia la patita. Ver css/base.css.
    this.input.on('gameobjectover', () => document.body.classList.add('cursor-point'));
    this.input.on('gameobjectout',  () => document.body.classList.remove('cursor-point'));

    this.events.once('shutdown', () => {
      this.sound.stopAll();
      document.body.classList.remove('cursor-point');
    });

    const W = COLS * TILE, H = ROWS * TILE;

    this.add.rectangle(0, 0, W, H, 0x12161d).setOrigin(0);
    for (let i = 0; i < 6; i++) {
      this.add.rectangle(W / 2, H / 2, W - i * 40, H - i * 24, 0x1a2130, 0.12).setOrigin(0.5);
    }

    this.add.text(W / 2, 18, 'GATITO CODE', {
      fontFamily: "'Press Start 2P', monospace", fontSize: '18px', color: '#ffee88',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    const cat = this.add.sprite(16, H - 16, 'character_base', 0);
    cat.anims.play('walk_down');

    this.add.text(W / 2, H - 6, 'Usa el mouse para elegir · Esc para volver', {
      fontFamily: "'Press Start 2P', monospace", fontSize: '6px', color: '#556',
    }).setOrigin(0.5);

    this.dynamicGroup = this.add.group();
    this.buttons = [];
    this.selected = 0;

    this.input.keyboard.on('keydown-ESC',      () => this.showScreen('main'));
    this.input.keyboard.on('keydown-BACKSPACE',() => this.showScreen('main'));

    const initScreen = this.scene.settings.data?.screen ?? 'main';
    this.showScreen(initScreen);
  }

  showScreen(screen) {
    // Al reconstruir la pantalla se destruyen los botones; si el puntero estaba
    // sobre uno, el 'gameobjectout' no dispara → limpiamos la marca a mano.
    document.body.classList.remove('cursor-point');
    if (this._scrollHandler) {
      this.game.canvas.removeEventListener('wheel', this._scrollHandler);
      this._scrollHandler = null;
    }
    this.dynamicGroup.clear(true, true);
    this.buttons = [];
    this.selected = 0;

    const W = COLS * TILE, H = ROWS * TILE;
    const bx = W / 2;
    const STEP = 20;

    if (screen === 'main') {
      this.addLabel('Menu Principal');
      let y = 60;
      this.makeButton(bx, y, 'Niveles', () => this.showScreen('levels')); y += STEP + 6;
      this.makeButton(bx, y, 'Editor de Niveles', () => this.showScreen('editor')); y += STEP + 6;
      this.makeButton(bx, y, 'Configuracion', () => this.showScreen('settings')); y += STEP + 6;
      this.makeButton(bx, y, 'Creditos', () => this.showScreen('credits'));
    } else if (screen === 'levels') {
      this.addLabel('selección de niveles');
      const allLevels = getAllLevels();
      const completed = getCompletedLevels();

      const GRID_COLS = 3;
      const SPACING = 42;
      const START_X = (W - (GRID_COLS - 1) * SPACING) / 2;
      const SCROLL_TOP = 60;
      const SCROLL_BOTTOM = H - 40;
      const SCROLL_H = SCROLL_BOTTOM - SCROLL_TOP;
      const totalRows = Math.ceil(allLevels.length / GRID_COLS);
      const CONTENT_H = totalRows * SPACING + 10;

      const scrollContainer = this.add.container(0, SCROLL_TOP);
      this.dynamicGroup.add(scrollContainer);

      allLevels.forEach((level, i) => {
        const row = Math.floor(i / GRID_COLS);
        const col = i % GRID_COLS;
        const x = START_X + col * SPACING;
        const y = row * SPACING + 16;

        const isUnlocked = (i === 0) || completed.includes(allLevels[i - 1].key);
        const isCompleted = completed.includes(level.key);

        this._createLevelSquare(x, y, i, level, isUnlocked, isCompleted, scrollContainer);
      });

      const maskShape = this.make.graphics({ add: false });
      maskShape.fillRect(0, SCROLL_TOP, W, SCROLL_H);
      scrollContainer.setMask(new Phaser.Display.Masks.GeometryMask(this, maskShape));

      const maxScroll = Math.max(0, CONTENT_H - SCROLL_H);
      let scrollY = 0;

      if (maxScroll > 0) {
        this._scrollHandler = (e) => {
          scrollY = Phaser.Math.Clamp(scrollY + (e.deltaY > 0 ? 15 : -15), 0, maxScroll);
          scrollContainer.y = SCROLL_TOP - scrollY;
        };
        this.game.canvas.addEventListener('wheel', this._scrollHandler);
      }

      this.makeButton(bx, H - 18, 'Volver', () => this.showScreen('main'));
    } else if (screen === 'editor') {
      this.addLabel('editor de niveles');
      this.makeButton(bx, 52, '+ Nuevo nivel', () => this.promptNewLevel(), 'accent');

      const sep = this.add.text(bx, 70, '— niveles existentes —', {
        fontFamily: "'Press Start 2P', monospace", fontSize: '5px', color: '#446',
      }).setOrigin(0.5);
      this.dynamicGroup.add(sep);

      const allToEdit = [
        ...BUILTIN_LEVELS,
        ...getCustomLevels()
      ];

      const GRID_COLS = 3;
      const SPACING = 42;
      const START_X = (W - (GRID_COLS - 1) * SPACING) / 2;

      const SCROLL_TOP = 78;
      const SCROLL_BOTTOM = H - 28;
      const SCROLL_H = SCROLL_BOTTOM - SCROLL_TOP;

      const totalRows = Math.ceil(allToEdit.length / GRID_COLS);
      const CONTENT_H = totalRows * SPACING + 10;

      const scrollContainer = this.add.container(0, SCROLL_TOP);
      this.dynamicGroup.add(scrollContainer);

      allToEdit.forEach((lv, i) => {
        const row = Math.floor(i / GRID_COLS);
        const col = i % GRID_COLS;
        const x = START_X + col * SPACING;
        const y = row * SPACING + 16;
        this._createEditorSquare(x, y, i, lv, scrollContainer);
      });

      const maskShape = this.make.graphics({ add: false });
      maskShape.fillRect(0, SCROLL_TOP, W, SCROLL_H);
      scrollContainer.setMask(new Phaser.Display.Masks.GeometryMask(this, maskShape));

      const maxScroll = Math.max(0, CONTENT_H - SCROLL_H);
      let scrollY = 0;

      if (maxScroll > 0) {
        this._scrollHandler = (e) => {
          scrollY = Phaser.Math.Clamp(scrollY + (e.deltaY > 0 ? 15 : -15), 0, maxScroll);
          scrollContainer.y = SCROLL_TOP - scrollY;
        };
        this.game.canvas.addEventListener('wheel', this._scrollHandler);
      }

      this.makeButton(bx, H - 18, '← Volver', () => this.showScreen('main'));
    } else if (screen === 'credits') {
      this.addLabel('Creditos');

      const PX = "'Press Start 2P', monospace";
      const team = [
        { name: 'Luis Herrera',    role: 'Disenador Principal' },
        { name: 'Brian Herrera',   role: 'Desarrollador Principal' },
        { name: 'Lisett Castillo', role: 'Scrum Master' },
        { name: 'Iara Baya',       role: 'Desarrolladora' },
        { name: 'Jose Martinez',   role: 'Desarrollador' },
      ];

      const subtitle = this.add.text(bx, 46, 'Equipo de Desarrollo', {
        fontFamily: PX, fontSize: '6px', color: '#ffee88',
      }).setOrigin(0.5);
      this.dynamicGroup.add(subtitle);

      const divider = this.add.graphics();
      divider.lineStyle(1, 0x2e3a55, 1);
      divider.lineBetween(bx - 90, 53, bx + 90, 53);
      this.dynamicGroup.add(divider);

      const SCROLL_TOP = 56;
      const SCROLL_BOTTOM = H - 26;
      const SCROLL_H = SCROLL_BOTTOM - SCROLL_TOP;
      const ENTRY_H = 30;
      const CONTENT_H = team.length * ENTRY_H;

      const scrollContainer = this.add.container(0, SCROLL_TOP);
      this.dynamicGroup.add(scrollContainer);

      team.forEach(({ name, role }, i) => {
        const y = i * ENTRY_H + 6;
        const nameT = this.add.text(bx, y, name, {
          fontFamily: PX, fontSize: '7px', color: '#eeeeee',
        }).setOrigin(0.5);
        const roleT = this.add.text(bx, y + 11, role, {
          fontFamily: PX, fontSize: '6px', color: '#7bc8f0',
        }).setOrigin(0.5);
        scrollContainer.add([nameT, roleT]);
      });

      const maskShape = this.make.graphics({ add: false });
      maskShape.fillRect(0, SCROLL_TOP, W, SCROLL_H);
      scrollContainer.setMask(new Phaser.Display.Masks.GeometryMask(this, maskShape));

      const maxScroll = Math.max(0, CONTENT_H - SCROLL_H);
      let scrollY = 0;

      if (maxScroll > 0) {
        this._scrollHandler = (e) => {
          scrollY = Phaser.Math.Clamp(scrollY + (e.deltaY > 0 ? 10 : -10), 0, maxScroll);
          scrollContainer.y = SCROLL_TOP - scrollY;
        };
        this.game.canvas.addEventListener('wheel', this._scrollHandler);
      }

      this.makeButton(bx, H - 18, '← Volver', () => this.showScreen('main'));
    } else if (screen === 'settings') {
      this.addLabel('configuración');

      const panelW = 210, panelH = 100, panelY = 96;
      const panel = this.add.nineslice(bx, panelY, 'settings_panel', undefined, panelW, panelH, 12, 12, 12, 12);
      this.dynamicGroup.add(panel);

      const left = bx - panelW / 2;
      const right = bx + panelW / 2;
      const sliderX = left + 30;
      const sliderW = panelW - 30 - 16;

      const addAudioRow = (cy, label, getV, setV) => {
        const spk = this.add.image(left + 15, cy, 'settings_speaker');
        const lbl = this.add.text(left + 28, cy - 13, label, {
          fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: '#4a2810',
        }).setOrigin(0, 0.5);
        const pct = this.add.text(right - 14, cy - 13, `${Math.round(getV() * 100)}%`, {
          fontFamily: "'Press Start 2P', monospace", fontSize: '6px', color: '#6b3f1c',
        }).setOrigin(1, 0.5);
        this.dynamicGroup.add(spk);
        this.dynamicGroup.add(lbl);
        this.dynamicGroup.add(pct);
        this.makeSlider(sliderX, cy + 5, sliderW, getV, (v) => {
          setV(v);
          pct.setText(`${Math.round(v * 100)}%`);
        });
      };

      addAudioRow(panelY - 22, 'Musica',  () => Settings.getMusicVolume(), (v) => Settings.setMusicVolume(v));
      addAudioRow(panelY + 22, 'Efectos', () => Settings.getSfxVolume(),   (v) => Settings.setSfxVolume(v));

      this.makeButton(bx, H - 18, '← Volver', () => this.showScreen('main'));
    }
  }

  // Slider de volumen arrastrable (track marron + relleno verde + knob crema).
  makeSlider(x, y, w, getVal, setVal) {
    const h = 7;
    const track = this.add.rectangle(x, y, w, h, 0x7a5a36).setOrigin(0, 0.5).setStrokeStyle(2, 0x4a2810);
    const fill  = this.add.rectangle(x, y, w, h, 0x8fce4f).setOrigin(0, 0.5);
    const knob  = this.add.circle(x, y, 7, 0xf3deb6).setStrokeStyle(2, 0x4a2810);

    const applyV = (v) => {
      v = Phaser.Math.Clamp(v, 0, 1);
      fill.scaleX = v;
      knob.x = x + w * v;
      setVal(v);
    };
    const v0 = Phaser.Math.Clamp(getVal(), 0, 1);
    fill.scaleX = v0;
    knob.x = x + w * v0;

    knob.setInteractive({ draggable: true, useHandCursor: true });
    this.input.setDraggable(knob);
    knob.on('drag', (_pointer, dragX) => applyV((dragX - x) / w));

    // Click directo sobre la barra: salta a esa posicion (localX = desde el borde izq).
    // Solo el track es interactivo (el fill se escala y daria hit-areas inconsistentes).
    track.setInteractive({ useHandCursor: true });
    track.on('pointerdown', (_p, localX) => applyV(localX / w));

    for (const o of [track, fill, knob]) { o.setDepth(5); this.dynamicGroup.add(o); }
  }

  _createLevelSquare(x, y, num, level, isUnlocked, isCompleted, parentContainer) {
    const container = this.add.container(x, y);
    const size = 26;

    const bg = this.add.rectangle(0, 0, size, size, isUnlocked ? 0x3b5488 : 0x444455)
      .setStrokeStyle(2, isCompleted ? 0x66ff99 : 0x222233);

    const txtNum = this.add.text(0, 0, num.toString(), {
      fontFamily: "'Press Start 2P', monospace", fontSize: '10px', color: '#ffffff', fontWeight: 'bold'
    }).setOrigin(0.5);

    const txtName = this.add.text(0, size / 2 + 6, level.name, {
      fontFamily: "'Press Start 2P', monospace", fontSize: '5px', color: isUnlocked ? '#8ef' : '#666',
    }).setOrigin(0.5);

    container.add([bg, txtNum, txtName]);
    if (parentContainer) {
      parentContainer.add(container);
    } else {
      this.dynamicGroup.add(container);
    }

    if (isUnlocked) {
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerover', () => { bg.setFillStyle(0x4b64a8); bg.setScale(1.1); });
      bg.on('pointerout', () => { bg.setFillStyle(0x3b5488); bg.setScale(1); });
      bg.on('pointerdown', () => {
        bg.setScale(0.95);
        this.scene.start(level.scene, { levelKey: level.key });
      });
    } else {
      bg.setAlpha(0.6);
      txtNum.setAlpha(0.5);
    }

    if (isCompleted) {
      const check = this.add.text(size / 2 - 4, -size / 2 + 4, '✓', {
        fontFamily: "'Press Start 2P', monospace", fontSize: '8px', color: '#66ff99', fontWeight: 'bold'
      }).setOrigin(0.5);
      container.add(check);
    }
  }

  _createEditorSquare(x, y, num, level, parentContainer) {
    const container = this.add.container(x, y);
    const size = 26;

    const bg = this.add.rectangle(0, 0, size, size, 0x2d2010)
      .setStrokeStyle(2, 0x886622);

    const txtLabel = this.add.text(0, 0, num.toString(), {
      fontFamily: "'Press Start 2P', monospace", fontSize: '10px', color: '#ffcc66',
    }).setOrigin(0.5);

    const txtEdit = this.add.text(0, size / 2 + 5, level.name, {
      fontFamily: "'Press Start 2P', monospace", fontSize: '5px', color: '#aa8844',
    }).setOrigin(0.5);

    container.add([bg, txtLabel, txtEdit]);

    if (parentContainer) {
      parentContainer.add(container);
    } else {
      this.dynamicGroup.add(container);
    }

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => { bg.setFillStyle(0x4a3318); bg.setScale(1.1); });
    bg.on('pointerout',  () => { bg.setFillStyle(0x2d2010); bg.setScale(1); });
    bg.on('pointerdown', () => {
      bg.setScale(0.95);
      this.scene.start('Editor', { levelKey: level.key, returnScreen: 'editor' });
    });
  }

  promptNewLevel() {
    window.__showNameDialog?.((name) => {
      const key = name.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .slice(0, 20) || 'nivel';
      createNewLevel(key);
      addCustomLevel(key, name);
      this.scene.start('Editor', { levelKey: key, returnScreen: 'editor' });
    });
  }

  addLabel(text) {
    const tx = this.add.text(COLS * TILE / 2, 34, text, {
      fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: '#8ef',
    }).setOrigin(0.5);
    this.dynamicGroup.add(tx);
  }

  makeButton(x, y, label, action, type = 'normal') {
    const fillBase = type === 'accent' ? 0x1a3318 : 0x1b2230;
    const strokeBase = type === 'accent' ? 0x2e6032 : 0x2e3a55;
    const textColor = type === 'accent' ? '#8fdf8f' : '#8ef';

    const bg = this.add.rectangle(x, y, 160, 18, fillBase).setStrokeStyle(2, strokeBase);
    const tx = this.add.text(x, y, label, {
      fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: textColor,
    }).setOrigin(0.5);
    bg.setInteractive({ useHandCursor: true });
    const idx = this.buttons.length;
    bg.on('pointerover', () => { this.selected = idx; this.refresh(); });
    bg.on('pointerdown', () => action());
    this.buttons.push({ bg, tx, action, type, textColor });
    this.dynamicGroup.add(bg);
    this.dynamicGroup.add(tx);
  }

  select(delta) {
    this.selected = (this.selected + delta + this.buttons.length) % this.buttons.length;
    this.refresh();
  }

  refresh() {
    this.buttons.forEach((b, i) => {
      const on = i === this.selected;
      b.bg.setFillStyle(on ? 0x3b5488 : (b.type === 'accent' ? 0x1a3318 : 0x1b2230));
      b.tx.setColor(on ? '#ffffff' : b.textColor);
    });
  }
}
