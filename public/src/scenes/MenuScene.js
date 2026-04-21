import { TILE, COLS, ROWS } from '../main.js';

export class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    window.__setPanels?.(false);
    window.__setEditor?.(null);
    this.buttons = [];

    const W = COLS * TILE, H = ROWS * TILE;

    // Background: soft radial-ish gradient via stacked rectangles.
    this.add.rectangle(0, 0, W, H, 0x12161d).setOrigin(0);
    for (let i = 0; i < 6; i++) {
      this.add.rectangle(W / 2, H / 2, W - i * 40, H - i * 24, 0x1a2130, 0.12).setOrigin(0.5);
    }

    // Title -----------------------------------------------------------------
    this.add.text(W / 2, 18, 'GATITO', {
      fontFamily: 'monospace', fontSize: '18px', color: '#ffee88',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);
    this.add.text(W / 2, 34, 'main menu', {
      fontFamily: 'monospace', fontSize: '7px', color: '#8ef',
    }).setOrigin(0.5);

    // Mini mascot in corner
    const cat = this.add.sprite(16, H - 16, 'character_base', 0);
    cat.anims.play('walk_down');

    // Buttons — compact layout fits in 192px tall canvas.
    const bx = W / 2, startY = 56, step = 22;
    this.makeButton(bx, startY + step * 0, 'Gym',        () => this.scene.start('Gym'));
    this.makeButton(bx, startY + step * 1, 'Main Level', () => this.scene.start('Main'));
    this.makeButton(bx, startY + step * 2, 'Edit Gym',   () => this.scene.start('Editor', { levelKey: 'gym' }));
    this.makeButton(bx, startY + step * 3, 'Edit Main',  () => this.scene.start('Editor', { levelKey: 'main' }));

    this.add.text(W / 2, H - 6, '↑/↓ + Enter · or click', {
      fontFamily: 'monospace', fontSize: '6px', color: '#556',
    }).setOrigin(0.5);

    // Keyboard navigation --------------------------------------------------
    this.selected = 0;
    this.input.keyboard.on('keydown-UP',   () => this.select(-1));
    this.input.keyboard.on('keydown-DOWN', () => this.select( 1));
    this.input.keyboard.on('keydown-ENTER',() => this.buttons[this.selected].action());
    this.input.keyboard.on('keydown-SPACE',() => this.buttons[this.selected].action());
    this.refresh();
  }

  makeButton(x, y, label, action) {
    const bg = this.add.rectangle(x, y, 120, 18, 0x1b2230).setStrokeStyle(1, 0x2e3a55);
    const tx = this.add.text(x, y, label, {
      fontFamily: 'monospace', fontSize: '10px', color: '#8ef',
    }).setOrigin(0.5);
    bg.setInteractive({ useHandCursor: true });
    const idx = this.buttons.length;
    bg.on('pointerover', () => { this.selected = idx; this.refresh(); });
    bg.on('pointerdown', () => action());
    this.buttons.push({ bg, tx, action });
  }

  select(delta) {
    this.selected = (this.selected + delta + this.buttons.length) % this.buttons.length;
    this.refresh();
  }

  refresh() {
    this.buttons.forEach((b, i) => {
      const on = i === this.selected;
      b.bg.setFillStyle(on ? 0x3b5488 : 0x1b2230);
      b.tx.setColor(on ? '#ffffff' : '#8ef');
    });
  }
}
