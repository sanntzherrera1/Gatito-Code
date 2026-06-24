import { TileLevelScene } from '../scenes/TileLevelScene.js';
import { runNivel0Intro } from './intro.js';
import { t } from '../../services/i18n.js';

export class MainScene extends TileLevelScene {
  constructor() {
    super('Main');
    this.levelKey = 'main';
    this.welcomeMessage = null;
    this.missionText = null;
  }

  showIdlePanel() {
    if (!this._introComplete) return;
    super.showIdlePanel();
  }

  create() {
    super.create();
    window.__setIfPanel?.(false);
    window.__setForPanel?.(false);
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
    this._addRepeatPathButton();

    const signal = { cancelled: false, _cbs: [], _onCancel(cb) { this._cbs.push(cb); } };
    this.events.once('shutdown', () => {
      window.__setIfPanel?.(true);
      window.__setForPanel?.(false);
      signal.cancelled = true;
      signal._cbs.forEach(cb => cb());
      signal._cbs = [];
      document.getElementById('intro-card')?.remove();
      for (const el of els) {
        if (!el) continue;
        el.style.opacity = '';
        el.style.pointerEvents = '';
        el.style.filter = '';
      }
    });

    runNivel0Intro(this, t('main.mission'), signal, {
      msgs: [t('main.msg0'), t('main.msg1')],
      showGarden: false,
      showPanelTutorial: false,
    }).then(() => {
      if (signal.cancelled) return;
      this._introComplete = true;
      super.showIdlePanel();
    });
  }
}
