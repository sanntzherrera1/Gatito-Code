import { TILE, COLS, ROWS } from '../main.js';
import { getCustomLevels, addCustomLevel, createNewLevel } from '../level/TileLevel.js';

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

    this.add.text(W / 2, 18, 'GATITO', {
      fontFamily: 'monospace', fontSize: '18px', color: '#ffee88',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    const cat = this.add.sprite(16, H - 16, 'character_base', 0);
    cat.anims.play('walk_down');

    this.add.text(W / 2, H - 6, '↑/↓ + Enter · or click', {
      fontFamily: 'monospace', fontSize: '6px', color: '#556',
    }).setOrigin(0.5);

    this.dynamicGroup = this.add.group();
    this.buttons = [];
    this.selected = 0;

    this.input.keyboard.on('keydown-UP',       () => this.select(-1));
    this.input.keyboard.on('keydown-DOWN',     () => this.select(1));
    this.input.keyboard.on('keydown-ENTER',    () => this.buttons[this.selected]?.action());
    this.input.keyboard.on('keydown-SPACE',    () => this.buttons[this.selected]?.action());
    this.input.keyboard.on('keydown-ESC',      () => this.showScreen('main'));
    this.input.keyboard.on('keydown-BACKSPACE',() => this.showScreen('main'));

    const initScreen = this.scene.settings.data?.screen ?? 'main';
    this.showScreen(initScreen);
  }

  showScreen(screen) {
    this.dynamicGroup.clear(true, true);
    this.buttons = [];
    this.selected = 0;

    const W = COLS * TILE;
    const bx = W / 2;
    const STEP = 20;

    if (screen === 'main') {
      this.addLabel('main menu');
      let y = 60;
      this.makeButton(bx, y, 'Levels', () => this.showScreen('levels')); y += STEP + 2;
      this.makeButton(bx, y, 'Level Editor', () => this.showScreen('editor')); y += STEP + 2;
      this.makeButton(bx, y, 'Credits', () => this.showScreen('credits'));
    } else if (screen === 'levels') {
      this.addLabel('levels');
      let y = 54;
      this.makeButton(bx, y, 'Main Level', () => this.scene.start('Main')); y += STEP;
      this.makeButton(bx, y, 'Gym', () => this.scene.start('Gym')); y += STEP;
      for (const lv of getCustomLevels()) {
        const key = lv.key;
        this.makeButton(bx, y, lv.name, () => this.scene.start('Custom', { levelKey: key }));
        y += STEP;
      }
      y += 4;
      this.makeButton(bx, y, '← Back', () => this.showScreen('main'));
    } else if (screen === 'editor') {
      this.addLabel('level editor');
      let y = 50;
      this.makeButton(bx, y, '+ Nuevo nivel', () => this.promptNewLevel(), 'accent');
      y += STEP + 2;

      const sep = this.add.text(bx, y - 5, '— editar existente —', {
        fontFamily: 'monospace', fontSize: '6px', color: '#446',
      }).setOrigin(0.5);
      this.dynamicGroup.add(sep);

      for (const lv of [{ key: 'gym', name: 'Gym' }, { key: 'main', name: 'Main' }, ...getCustomLevels()]) {
        const key = lv.key;
        this.makeButton(bx, y, `Edit ${lv.name}`, () => this.scene.start('Editor', { levelKey: key, returnScreen: 'editor' }));
        y += STEP;
      }
      y += 4;
      this.makeButton(bx, y, '← Back', () => this.showScreen('main'));
    } else if (screen === 'credits') {
      this.addLabel('credits');
      const tx = this.add.text(bx, 84, 'Coming Soon', {
        fontFamily: 'monospace', fontSize: '10px', color: '#ffee88',
      }).setOrigin(0.5);
      this.dynamicGroup.add(tx);
      this.makeButton(bx, 120, '← Back', () => this.showScreen('main'));
    }

    this.refresh();
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
