import { TileLevelScene } from '../scenes/TileLevelScene.js';
import { runNivel0Intro, unlockPanels } from './intro.js';
import { t } from '../../services/i18n.js';

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
    window.__setForPanel?.(false);
    this._hideFunc1();

    const signal = { cancelled: false, _cbs: [], _onCancel(cb) { this._cbs.push(cb); } };
    this.events.once('shutdown', () => {
      window.__setIfPanel?.(true);
      window.__setForPanel?.(false);
      signal.cancelled = true;
      signal._cbs.forEach(cb => cb());
      signal._cbs = [];
      unlockPanels();
      document.getElementById('intro-card')?.remove();
      document.getElementById('dirs')?.classList.remove('intro-highlight', 'intro-zoom');
      document.getElementById('queue')?.classList.remove('intro-highlight', 'intro-zoom');
    });

    runNivel0Intro(this, t('nivel0.mission'), signal)
      .then(() => {
        if (signal.cancelled) return;
        this._introComplete = true;
        super.showIdlePanel();
      });
  }

  // Nivel0 (tutorial): la Funcion no existe todavia. Ocultamos por completo el
  // boton ƒ del panel de movimientos, su panel F1 y el switch Program/F1/FOR
  // (queda solo el programa principal). Se restauran al salir del nivel.
  _hideFunc1() {
    const els = [
      document.querySelector('[data-dir="func1"]'),
      document.getElementById('queue-func1'),
      document.getElementById('target-switch'),
    ];
    for (const el of els) {
      if (!el) continue;
      el.style.display = 'none';
    }
    this.events.once('shutdown', () => {
      for (const el of els) {
        if (!el) continue;
        el.style.display = '';
      }
    });
  }
}
