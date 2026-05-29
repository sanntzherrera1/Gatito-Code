import { TileLevelScene } from '../scenes/TileLevelScene.js';
import { runNivel0Intro } from './intro.js';
import { executeProgram } from '../program/ProgramExecutor.js';
import { markLevelCompleted } from '../../services/Storage.js';

export class Nivel0Scene extends TileLevelScene {
  constructor() {
    super('Nivel0');
    this.levelKey = 'nivel0';
    this.welcomeMessage = null;
    this.missionText = null; // lo muestra el intro al final
  }

  showIdlePanel() {
    if (!this._introComplete) return;
    super.showIdlePanel();
  }

  create() {
    super.create();
    this.debugText?.setVisible(false);
    this.fpsVisible = false;
    this._disableFunc1();
    runNivel0Intro(this, 'Ayuda a Gatito a llegar a su casa para descansar.')
      .then(() => {
        this._introComplete = true;
        super.showIdlePanel();
      });
  }

  async runProgram(moves) {
    const context = {
      step:        (dir) => this.step(dir),
      jumpInPlace: ()    => this.jumpInPlace(),
      jumpDir:     (dir) => this.jumpDir(dir),
      onComplete: () => {
        const isWin = this.playerModel.tx === 3 && this.playerModel.ty === 6;
        if (isWin) {
          markLevelCompleted(this.levelKey);
          this.playerView.playCelebrate();
          this.showResultOverlay(true);
        } else {
          this.playerView.playSad();
          this.showResultOverlay(false);
        }
      },
    };
    await executeProgram(moves, context, window.__GYM);
  }

  _disableFunc1() {
    const els = [
      document.querySelector('[data-dir="func1"]'),
      document.getElementById('queue-func1'),
      document.getElementById('target-switch'),
    ];
    for (const el of els) {
      if (!el) continue;
      el.style.opacity = '0.3';
      el.style.pointerEvents = 'none';
      el.style.filter = 'grayscale(1)';
    }
    this.events.once('shutdown', () => {
      for (const el of els) {
        if (!el) continue;
        el.style.opacity = '';
        el.style.pointerEvents = '';
        el.style.filter = '';
      }
    });
  }
}
