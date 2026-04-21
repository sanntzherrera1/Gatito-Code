import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GymScene } from './scenes/GymScene.js';
import { MainScene } from './scenes/MainScene.js';
import { EditorScene } from './scenes/EditorScene.js';

export const TILE = 16;
export const COLS = 16;
export const ROWS = 12;

new Phaser.Game({
  type: Phaser.AUTO,
  parent: document.body,
  width: COLS * TILE,
  height: ROWS * TILE,
  zoom: 4,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#12161d',
  physics: { default: 'arcade', arcade: { debug: false, gravity: { x: 0, y: 0 } } },
  scene: [BootScene, MenuScene, GymScene, MainScene, EditorScene],
});
