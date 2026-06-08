import { TILE, COLS, ROWS } from '../../config/game.js';
import { getCustomLevels, addCustomLevel, createNewLevel, getAllLevels, getCompletedLevels, BUILTIN_LEVELS } from '../../services/Storage.js';

export class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    window.__setPanels?.(false);
    window.__setEditor?.(null);

    const W = COLS * TILE, H = ROWS * TILE;

    this.add.rectangle(0, 0, W, H, 0x12161d).setOrigin(0);
    for (let i = 0; i < 6; i++) {
      this.add.rectangle(W / 2, H / 2, W - i * 40, H - i * 24, 0x1a2130, 0.12).setOrigin(0.5);
    }

    this.add.text(W / 2, 18, 'GATITO CODE', {
      fontFamily: 'monospace', fontSize: '18px', color: '#ffee88',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    const cat = this.add.sprite(16, H - 16, 'character_base', 0);
    cat.anims.play('walk_down');

    this.add.text(W / 2, H - 6, 'Use mouse to select · Esc to back', {
      fontFamily: 'monospace', fontSize: '6px', color: '#556',
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
    this.dynamicGroup.clear(true, true);
    this.buttons = [];
    this.selected = 0;

    const W = COLS * TILE, H = ROWS * TILE;
    const bx = W / 2;
    const STEP = 20;

    if (screen === 'main') {
      this.addLabel('main menu');
      let y = 60;
      this.makeButton(bx, y, 'Levels', () => this.showScreen('levels')); y += STEP + 2;
      this.makeButton(bx, y, 'Level Editor', () => this.showScreen('editor')); y += STEP + 2;
      this.makeButton(bx, y, 'Credits', () => this.showScreen('credits'));
    } else if (screen === 'levels') {
      this.addLabel('level selection');
      const allLevels = getAllLevels();
      const completed = getCompletedLevels();

      const GRID_COLS = 4;
      const SPACING = 42;
      const START_X = (W - (GRID_COLS - 1) * SPACING) / 2;
      const START_Y = 60;

      allLevels.forEach((level, i) => {
        const row = Math.floor(i / GRID_COLS);
        const col = i % GRID_COLS;
        const x = START_X + col * SPACING;
        const y = START_Y + row * SPACING;

        const isUnlocked = (i === 0) || completed.includes(allLevels[i - 1].key);
        const isCompleted = completed.includes(level.key);

        this._createLevelSquare(x, y, i, level, isUnlocked, isCompleted);
      });

      this.makeButton(bx, H - 30, '← Back', () => this.showScreen('main'));
    } else if (screen === 'editor') {
      this.addLabel('level editor');
      this.makeButton(bx, 46, '+ New level', () => this.promptNewLevel(), 'accent');

      const sep = this.add.text(bx, 62, '— edit existing —', {
        fontFamily: 'monospace', fontSize: '6px', color: '#446',
      }).setOrigin(0.5);
      this.dynamicGroup.add(sep);

      const allToEdit = [
        { key: 'nivel0', name: 'Nivel 0' },
        { key: 'gym',    name: 'Gym' },
        { key: 'main',   name: 'Main' },
        { key: 'nivel3', name: 'Nivel 3' },
        { key: 'if',     name: 'IF' },
        { key: 'si_1',   name: 'SI 1' },
        { key: 'si_2',   name: 'SI 2' },
        { key: 'si_3',   name: 'SI 3' },
        ...getCustomLevels()
      ];

      const GRID_COLS = 4;
      const SPACING = 42;
      const START_X = (W - (GRID_COLS - 1) * SPACING) / 2;
      const START_Y = 82;

      allToEdit.forEach((lv, i) => {
        const row = Math.floor(i / GRID_COLS);
        const col = i % GRID_COLS;
        const x = START_X + col * SPACING;
        const y = START_Y + row * SPACING;
        this._createEditorSquare(x, y, i, lv);
      });

      this.makeButton(bx, H - 30, '← Back', () => this.showScreen('main'));
    } else if (screen === 'credits') {
      this.addLabel('credits');
      const tx = this.add.text(bx, 84, 'Coming Soon', {
        fontFamily: 'monospace', fontSize: '10px', color: '#ffee88',
      }).setOrigin(0.5);
      this.dynamicGroup.add(tx);
      this.makeButton(bx, 120, '← Back', () => this.showScreen('main'));
    }
  }

  _createLevelSquare(x, y, num, level, isUnlocked, isCompleted) {
    const container = this.add.container(x, y);
    const size = 30;

    const bg = this.add.rectangle(0, 0, size, size, isUnlocked ? 0x3b5488 : 0x444455)
      .setStrokeStyle(2, isCompleted ? 0x66ff99 : 0x222233);

    const txtNum = this.add.text(0, 0, num.toString(), {
      fontFamily: 'monospace', fontSize: '14px', color: '#ffffff', fontWeight: 'bold'
    }).setOrigin(0.5);

    const txtName = this.add.text(0, size / 2 + 6, level.name, {
      fontFamily: 'monospace', fontSize: '6px', color: isUnlocked ? '#8ef' : '#666',
    }).setOrigin(0.5);

    container.add([bg, txtNum, txtName]);
    this.dynamicGroup.add(container);

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
        fontFamily: 'monospace', fontSize: '8px', color: '#66ff99', fontWeight: 'bold'
      }).setOrigin(0.5);
      container.add(check);
    }
  }

  _createEditorSquare(x, y, num, level) {
    const container = this.add.container(x, y);
    const size = 30;

    const bg = this.add.rectangle(0, 0, size, size, 0x2d2010)
      .setStrokeStyle(2, 0x886622);

    const txtLabel = this.add.text(0, 0, num.toString(), {
      fontFamily: 'monospace', fontSize: '14px', color: '#ffcc66', fontWeight: 'bold',
    }).setOrigin(0.5);

    const txtEdit = this.add.text(0, size / 2 + 6, level.name, {
      fontFamily: 'monospace', fontSize: '6px', color: '#aa8844',
    }).setOrigin(0.5);

    container.add([bg, txtLabel, txtEdit]);
    this.dynamicGroup.add(container);

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
      fontFamily: 'monospace', fontSize: '7px', color: '#8ef',
    }).setOrigin(0.5);
    this.dynamicGroup.add(tx);
  }

  makeButton(x, y, label, action, type = 'normal') {
    const fillBase = type === 'accent' ? 0x1a3318 : 0x1b2230;
    const strokeBase = type === 'accent' ? 0x2e6032 : 0x2e3a55;
    const textColor = type === 'accent' ? '#8fdf8f' : '#8ef';

    const bg = this.add.rectangle(x, y, 120, 16, fillBase).setStrokeStyle(1, strokeBase);
    const tx = this.add.text(x, y, label, {
      fontFamily: 'monospace', fontSize: '9px', color: textColor,
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
