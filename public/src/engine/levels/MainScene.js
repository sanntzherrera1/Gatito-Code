import { TileLevelScene } from '../scenes/TileLevelScene.js';

export class MainScene extends TileLevelScene {
  constructor() {
    super('Main');
    this.levelKey = 'main';
    this.missionText = 'Recolectá todos los plantines usando comandos de movimiento.';
    this.welcomeMessage = '¡Bienvenido al Nivel 2! 🌱\nAhora tenés que recolectar objetos en el camino.';
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

    this.events.once('shutdown', () => {
      window.__setIfPanel?.(true);
      window.__setForPanel?.(false);
      for (const el of els) {
        if (!el) continue;
        el.style.opacity = '';
        el.style.pointerEvents = '';
        el.style.filter = '';
      }
    });
  }
}
