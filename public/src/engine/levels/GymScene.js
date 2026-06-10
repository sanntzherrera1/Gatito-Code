import { TileLevelScene } from '../scenes/TileLevelScene.js';

export class GymScene extends TileLevelScene {
  constructor() {
    super('Gym');
    this.levelKey = 'gym';
    this.welcomeMessage = '¡Bienvenido al Nivel 1! 🌱\nUsa los botones para mover al personaje.';
    this.missionText = 'Intenta usar combinación de movimientos para llegar a la casilla final.';
  }

  addPickup() {}

  create() {
    super.create();
    window.__setIfPanel?.(false);
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
      for (const el of els) {
        if (el) el.style.display = '';
      }
    });
  }
}
