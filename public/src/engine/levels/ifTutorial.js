// Tutorial cinematico del IF para el nivel "if" (nivel 6).
// Reutiliza el toolkit de intro.js (carteles, iconos, lock/unlock, camara).
//
// Guion: acercar la camara al gato y la primera roca → mostrar que avanzar de
// frente choca → revelar y explicar el panel IF (SI roca adelante → ENTONCES
// saltar) → auto-demostrar un salto como recompensa → reiniciar dejando la
// regla en blanco para que el jugador la active.

import { showCard, injectStyles, ico, lockPanels, unlockPanels, panTo } from './intro.js';
import { t } from '../../services/i18n.js';

const TILE = 16;
const FULL = { x: 128, y: 96 }; // centro del mapa (COLS*TILE/2, ROWS*TILE/2)

// Pone el valor en un <select> y dispara 'change' para que el listener de
// queue.js actualice GYM.ifCondition / GYM.ifAction.
function setSelect(el, value) {
  if (!el) return;
  el.value = value;
  el.dispatchEvent(new Event('change'));
}

// Pequeño "choque": empuja al gato hacia la roca y lo devuelve, como refuerzo
// visual de que no puede pasar.
function bump(scene, dir = 'right') {
  const s = scene.playerView?.sprite;
  if (!s) return Promise.resolve();
  const dx = dir === 'right' ? 4 : dir === 'left' ? -4 : 0;
  const dy = dir === 'down' ? 4 : dir === 'up' ? -4 : 0;
  const x0 = s.x, y0 = s.y;
  return new Promise(resolve => {
    scene.tweens.add({
      targets: s, x: x0 + dx, y: y0 + dy,
      duration: 90, yoyo: true, ease: 'Quad.easeOut',
      onComplete: () => { s.x = x0; s.y = y0; resolve(); },
    });
  });
}

export async function runIfTutorial(scene, signal) {
  injectStyles();
  lockPanels();
  document.getElementById('level-dialog-box')?.classList.remove('intro-highlight');

  // 1. Acercar la camara al gato y la primera roca
  await panTo(scene, { x: 40, y: 88 }, 2.3, 900);
  if (signal?.cancelled) return;
  await showCard(t('if_tut.rock_block'), signal);
  if (signal?.cancelled) return;

  // 2. Demostrar que avanzar de frente no funciona
  await scene.step('right'); // (1,5) → (2,5), mira a la derecha
  if (signal?.cancelled) return;
  await showCard(t('if_tut.crash'), signal);
  if (signal?.cancelled) return;
  await scene.step('right'); // bloqueado por la roca de (3,5): se queda en el lugar
  await bump(scene, 'right');
  if (signal?.cancelled) return;

  // 3. Revelar el panel IF (climax)
  await panTo(scene, FULL, 1, 700);
  if (signal?.cancelled) return;

  const backdrop = document.createElement('div');
  backdrop.id = 'panel-backdrop';
  document.body.appendChild(backdrop);

  window.__setIfPanel?.(true);
<<<<<<< Updated upstream
  ifPanel?.classList.add('unlock-glow', 'unlock-layer');
  await showCard(t('if_tut.unlock'), signal);
  ifPanel?.classList.remove('unlock-glow', 'unlock-layer');
=======
  // Activar la pestaña SI dentro del panel de logica combinado.
  document.querySelector('.logica-tab[data-logica-tab="if"]')?.click();
  const logicaPanel = document.getElementById('queue-logica');
  if (logicaPanel) {
    logicaPanel.style.position = 'relative';
    logicaPanel.style.zIndex = '9002';
  }
  logicaPanel?.classList.add('unlock-glow', 'unlock-layer');
  await showCard(
    `${ico('estrella')} ¡Desbloqueaste el <b>IF</b>!<br><br><b>SI</b> pasa algo, <b>ENTONCES</b> Gatito hace otra cosa.`,
    signal,
  );
  logicaPanel?.classList.remove('unlock-glow', 'unlock-layer');
>>>>>>> Stashed changes
  if (signal?.cancelled) return;

  // 3a. "SI pasa" → roca adelante
  const cond = document.getElementById('if-condition-select');
  cond?.classList.add('intro-highlight');
  await showCard(t('if_tut.condition'), signal);
  setSelect(cond, 'rock-ahead');
  cond?.classList.remove('intro-highlight');
  if (signal?.cancelled) return;

  // 3b. "Hacer esto" → saltar
  const act = document.getElementById('if-action-select');
  act?.classList.add('intro-highlight');
  await showCard(t('if_tut.action'), signal);
  setSelect(act, 'jump');
  act?.classList.remove('intro-highlight');
  if (signal?.cancelled) return;

  // 4. Payoff: con la regla activa, el gato salta la primera roca solo
  backdrop.classList.add('out');
  setTimeout(() => backdrop.remove(), 320);
  if (logicaPanel) {
    logicaPanel.style.position = '';
    logicaPanel.style.zIndex = '';
  }
  await panTo(scene, { x: 56, y: 88 }, 2.3, 600);
  if (signal?.cancelled) return;
  await showCard(t('if_tut.payoff'), signal);
  if (signal?.cancelled) return;
  await scene.jumpDir('right'); // (2,5) → (4,5), salta la roca de (3,5)
  await new Promise(resolve => scene.time.delayedCall(400, resolve));
  if (signal?.cancelled) return;

  // 5. Reset para el jugador: vuelve al spawn y deja la regla en blanco
  await panTo(scene, FULL, 1, 600);
  if (signal?.cancelled) return;
  scene.resetLevel();
  setSelect(cond, '');
  setSelect(act, '');
  window.__setIfPanel?.(true);
  unlockPanels();
  await showCard(t('if_tut.try_it'), signal);
}
