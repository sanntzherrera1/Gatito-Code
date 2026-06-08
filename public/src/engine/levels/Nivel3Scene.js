import { TileLevelScene } from '../scenes/TileLevelScene.js';
import { showCard, injectStyles } from './intro.js';

export class Nivel3Scene extends TileLevelScene {
  constructor() {
    super('Nivel3');
    this.levelKey = 'nivel3';
    this.missionText = 'Recolectá todos los objetos del camino para avanzar.';
    this.welcomeMessage = '¡Bienvenido al Nivel 3! 🌿\nRecolectá objetos y llegá a la casilla final.';
  }

  create() {
    super.create();
    window.__setIfPanel?.(false);
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

    this.onPathAnimationComplete = () => this._unlockFunc1(els);

    this.events.once('shutdown', () => {
      window.__setIfPanel?.(true);
      document.getElementById('intro-card')?.remove();
      const d = document.getElementById('dirs');
      if (d) {
        d.classList.remove('intro-highlight');
        d.style.transform = '';
        d.style.transition = '';
        d.style.transformOrigin = '';
        d.style.position = '';
        d.style.zIndex = '';
      }
      for (const el of els) {
        if (!el) continue;
        el.style.opacity = '';
        el.style.pointerEvents = '';
        el.style.filter = '';
        el.style.transition = '';
        el.classList.remove('intro-highlight', 'intro-zoom');
      }
    });
  }

  async _unlockFunc1(els) {
    injectStyles();
    const dirsPanel = document.getElementById('dirs');

    // Paso 1: resaltar panel Movement completo
    if (dirsPanel) {
      dirsPanel.classList.add('intro-highlight');
      dirsPanel.style.transition = 'transform 0.4s cubic-bezier(.22,1,.36,1)';
      dirsPanel.style.transform = 'scale(1.18)';
      dirsPanel.style.transformOrigin = 'center';
      dirsPanel.style.position = 'relative';
      dirsPanel.style.zIndex = '9001';
    }

    // Paso 2: card explicativo sobre la función
    await showCard(
      'Seguro te preguntás… <b>¿qué es la función?</b><br><br>¡Te da la posibilidad de reutilizar bloques de movimientos!',
      null
    );

    // Paso 3: quitar highlight y zoom del panel Movement
    if (dirsPanel) {
      dirsPanel.classList.remove('intro-highlight');
      dirsPanel.style.transform = '';
      dirsPanel.style.transition = '';
      dirsPanel.style.transformOrigin = '';
      dirsPanel.style.position = '';
      dirsPanel.style.zIndex = '';
    }

    // Paso 4: glow en func1 mientras aún están en gris
    for (const el of els) {
      if (!el) continue;
      el.classList.add('intro-highlight', 'intro-zoom');
    }

    // Paso 5: 1200ms con glow, luego transición suave a color completo
    setTimeout(() => {
      for (const el of els) {
        if (!el) continue;
        el.style.transition = 'opacity 2s ease, filter 2s ease';
        el.style.opacity = '';
        el.style.filter = '';
        el.style.pointerEvents = 'auto';
      }
      // Paso 6: glow se apaga 2.5s después de estar en color
      setTimeout(() => {
        for (const el of els) {
          if (!el) continue;
          el.classList.remove('intro-highlight', 'intro-zoom');
          el.style.transition = '';
        }
      }, 2500);
    }, 1200);
  }
}
