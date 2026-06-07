import { TileLevelScene } from '../scenes/TileLevelScene.js';
import { runNivel0Intro } from './intro.js';

export class Nivel0Scene extends TileLevelScene {
  constructor() {
    super('Nivel0');
    this.levelKey = 'nivel0';
    this.welcomeMessage = null;
    this.missionText = null; // lo muestra el intro al final
  }

  addPickup() {}

  showIdlePanel() {
    if (!this._introComplete) return;
    super.showIdlePanel();
  }

  create() {
    super.create();
    window.__setIfPanel?.(false);
    this.debugText?.setVisible(false);
    this.fpsVisible = false;
    this._disableFunc1();

    const signal = { cancelled: false, _cbs: [], _onCancel(cb) { this._cbs.push(cb); } };
    this.events.once('shutdown', () => {
      window.__setIfPanel?.(true);
      signal.cancelled = true;
      signal._cbs.forEach(cb => cb());
      signal._cbs = [];
      document.getElementById('intro-card')?.remove();
      document.getElementById('dirs')?.classList.remove('intro-highlight', 'intro-zoom');
      document.getElementById('queue')?.classList.remove('intro-highlight', 'intro-zoom');
    });

    runNivel0Intro(this, 'Ayuda a Gatito a llegar a su casa para descansar.', signal)
      .then(() => {
        if (signal.cancelled) return;
        this._introComplete = true;
        super.showIdlePanel();
      });
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
