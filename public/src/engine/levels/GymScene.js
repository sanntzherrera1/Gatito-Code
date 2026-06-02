import { TileLevelScene } from '../scenes/TileLevelScene.js';
import { injectStyles } from './intro.js';
import { animatePath } from '../level/PathAnimator.js';

export class GymScene extends TileLevelScene {
  constructor() {
    super('Gym');
    this.levelKey = 'gym';
    this.welcomeMessage = '¡Bienvenido al Nivel 1! 🌱\nUsa los botones para mover al personaje.';
    this.missionText = 'Intenta usar combinación de movimientos para llegar a la casilla final.';
    this.onWelcomeClose = () => {
      document.getElementById('level-dialog-box')?.classList.remove('intro-highlight');
      const panel = document.getElementById('result-panel');
      if (panel) {
        panel.classList.add('intro-highlight');
        setTimeout(() => panel.classList.remove('intro-highlight'), 3000);
      }
      this._animatePath();
    };
  }

  addPickup() {}

  _animatePath() {
    animatePath(this);
  }

  create() {
    injectStyles();
    super.create();
    document.getElementById('level-dialog-box')?.classList.add('intro-highlight');

    const els = [
      document.querySelector('[data-dir="func1"]'),
      document.getElementById('queue-func1'),
      document.getElementById('target-switch'),
    ];
    for (const el of els) {
      if (el) el.style.display = 'none';
    }

    const btn = document.createElement('button');
    btn.textContent = 'repetir camino';
    btn.id = 'repeat-path-btn';
    Object.assign(btn.style, {
      position: 'absolute', bottom: '10px', right: '16px',
      background: '#ffe600', border: '2px solid #c8a800',
      color: '#3d2008', fontFamily: "'SproutPixel', monospace", fontSize: '11px',
      fontWeight: 'bold', padding: '4px 12px', borderRadius: '5px', cursor: 'pointer',
      boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
    });
    btn.addEventListener('mouseenter', () => btn.style.background = '#ffd000');
    btn.addEventListener('mouseleave', () => btn.style.background = '#ffe600');
    btn.addEventListener('click', () => this._animatePath());
    document.getElementById('result-panel')?.appendChild(btn);

    this.events.once('shutdown', () => {
      btn.remove();
      for (const el of els) {
        if (el) el.style.display = '';
      }
    });
  }
}
