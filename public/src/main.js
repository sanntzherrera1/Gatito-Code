import { BootScene } from './engine/scenes/BootScene.js';
import { MenuScene } from './engine/scenes/MenuScene.js';
import { Nivel0Scene } from './engine/levels/Nivel0Scene.js';
import { GymScene } from './engine/levels/GymScene.js';
import { MainScene } from './engine/levels/MainScene.js';
import { Nivel3Scene } from './engine/levels/Nivel3Scene.js';
import { EditorScene } from './engine/scenes/EditorScene.js';
import { CustomScene } from './engine/levels/CustomScene.js';
import { PruebaScene } from './engine/levels/PruebaScene.js';
import { DungeonScene } from './engine/levels/DungeonScene.js';
import { BosqueDePruebaScene } from './engine/levels/BosqueDePruebaScene.js';
import { BosqueFloralScene } from './engine/levels/BosqueFloralScene.js';
import { TILE, COLS, ROWS, MAX_ZOOM } from './config/game.js';
import { t, applyDomTranslations, onLanguageChange } from './services/i18n.js';

export { TILE, COLS, ROWS, MAX_ZOOM };

window.__t = t;
window.__applyDomTranslations = applyDomTranslations;
onLanguageChange(() => applyDomTranslations());
applyDomTranslations();

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game-frame',
  width: COLS * TILE,
  height: ROWS * TILE,
  zoom: MAX_ZOOM,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#12161d',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
  },
  physics: { default: 'arcade', arcade: { debug: false, gravity: { x: 0, y: 0 } } },
  scene: [BootScene, MenuScene, Nivel0Scene, GymScene, MainScene, Nivel3Scene, BosqueFloralScene, EditorScene, CustomScene],
});
window.__game = game;

/* ── Forzar recalculo del canvas ante cambios de layout (resize / media queries) ── */
let _resizeTimer = 0;
window.addEventListener('resize', () => {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(() => game.scale.refresh(), 120);
});
// Refresh inicial retardado: cubre F5 donde el layout CSS aún no se estabilizó
setTimeout(() => game.scale.refresh(), 300);
