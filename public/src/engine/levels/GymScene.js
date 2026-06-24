import { TileLevelScene } from '../scenes/TileLevelScene.js';
import { t } from '../../services/i18n.js';

export class GymScene extends TileLevelScene {
  constructor() {
    super('Gym');
    this.levelKey = 'gym';
  }

  init(data) {
    super.init(data);
    this.welcomeMessage = t('gym.welcome');
    this.missionText = t('gym.mission');
  }

  addPickup() {}

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
      if (el) el.style.display = 'none';
    }
    this.events.once('shutdown', () => {
      window.__setIfPanel?.(true);
      window.__setForPanel?.(false);
      for (const el of els) {
        if (el) el.style.display = '';
      }
    });
  }
}
