// Tutorial cinematico del FOR (repetir) para el nivel "for" (nivel 9).
// Reutiliza el toolkit de intro.js (carteles, iconos, lock/unlock, camara).
//
// Guion: acercar la camara a la bajada larga → mostrar que repetir el mismo
// paso a mano llena el programa → revelar y explicar el panel FOR (que
// movimiento repetir + cuantas veces) → auto-demostrar la repeticion como
// recompensa → reiniciar dejando el bloque FOR en blanco para que lo arme el
// jugador.

import { showCard, injectStyles, ico, lockPanels, unlockPanels, panTo } from './intro.js';

const FULL = { x: 128, y: 96 };    // centro del mapa (COLS*TILE/2, ROWS*TILE/2)
const COLUMNA = { x: 56, y: 96 };  // vista de la bajada (columna x=3, spawn arriba)
const REGALO = { x: 56, y: 136 };  // primer pickup/regalo en (3,8), al final de la bajada
const PASOS_REGALO = 5;            // pasos hacia abajo desde el spawn (3,3) hasta el regalo (3,8)

function delay(scene, ms) {
  return new Promise(resolve => scene.time.delayedCall(ms, resolve));
}

// Pone el valor en un <select> y dispara 'change' para que el listener de
// queue.js actualice GYM.forCount.
function setSelect(el, value) {
  if (!el) return;
  el.value = value;
  el.dispatchEvent(new Event('change'));
}

// Click programatico sobre un boton de la UI. Funciona aunque el panel este
// bloqueado con pointer-events:none (igual que la auto-demo de Nivel3).
function click(selector) {
  document.querySelector(selector)?.click();
}

export async function runForTutorial(scene, signal) {
  injectStyles();
  lockPanels();
  document.getElementById('level-dialog-box')?.classList.remove('intro-highlight');

  // 1. Acercar la camara a la bajada larga
  await panTo(scene, COLUMNA, 2.0, 900);
  if (signal?.cancelled) return;
  await showCard(`${ico('gato')} Gatito tiene que bajar un <b>largo tramo</b>… siempre el <b>mismo paso</b>: abajo.`, signal);
  if (signal?.cancelled) return;

  // 1b. Mostrar el primer regalo, que lo espera al final de esa bajada
  await panTo(scene, REGALO, 2.5, 800);
  if (signal?.cancelled) return;
  await showCard(`${ico('manzana')} …para llegar hasta <b>su primer regalo</b>, que lo espera justo al final de la bajada.`, signal);
  if (signal?.cancelled) return;

  // 2. Demostrar lo tedioso de repetir a mano
  await panTo(scene, COLUMNA, 2.0, 700);
  if (signal?.cancelled) return;
  for (let i = 0; i < 3; i++) {
    await scene.step('down');
    if (signal?.cancelled) return;
  }
  await showCard(`${ico('pregunta')} Repetir el mismo movimiento a mano <b>llena todo el programa</b>. ¿Hay una forma más corta?`, signal);
  if (signal?.cancelled) return;

  // 3. Revelar el panel FOR (climax)
  await panTo(scene, FULL, 1, 700);
  if (signal?.cancelled) return;
  scene.resetLevel();

  const backdrop = document.createElement('div');
  backdrop.id = 'panel-backdrop';
  document.body.appendChild(backdrop);

  window.__setForPanel?.(true);
  const forPanel = document.getElementById('queue-for');
  if (forPanel) {
    forPanel.style.position = 'relative';
    forPanel.style.zIndex = '9002';
  }
  // Iluminamos a la vez el panel FOR (derecha) y el boton FOR del panel de
  // movimientos. Para que el glow del boton se vea sobre el backdrop hay que
  // elevar el panel #dirs por encima de el (igual que Nivel3).
  const dirsPanel = document.getElementById('dirs');
  const forBtn = document.querySelector('[data-dir="for"]');
  if (dirsPanel) {
    dirsPanel.style.position = 'relative';
    dirsPanel.style.zIndex = '9002';
  }
  forPanel?.classList.add('unlock-glow', 'unlock-layer');
  forBtn?.classList.add('unlock-glow', 'unlock-layer');
  await showCard(
    `${ico('estrella')} ¡Desbloqueaste el <b>FOR</b> (repetir)!<br><br>En vez de repetir a mano, le decís <b>qué</b> movimiento y <b>cuántas veces</b>.`,
    signal,
  );
  forPanel?.classList.remove('unlock-glow', 'unlock-layer');
  forBtn?.classList.remove('unlock-glow', 'unlock-layer');
  if (dirsPanel) {
    dirsPanel.style.position = '';
    dirsPanel.style.zIndex = '';
  }
  if (signal?.cancelled) return;

  // 3a. Cuantas veces
  const countSel = document.getElementById('for-count-select');
  countSel?.classList.add('intro-highlight');
  await showCard(`${ico('pregunta')} <b>Repetir:</b> elegimos <b>5 veces</b>, los pasos que hay hasta el regalo.`, signal);
  setSelect(countSel, String(PASOS_REGALO));
  countSel?.classList.remove('intro-highlight');
  if (signal?.cancelled) return;

  // 3b. Que movimiento repetir (lo cargamos en el bloque FOR via el switch)
  click('[data-target="for"]');
  const slotsFor = document.getElementById('slots-for');
  slotsFor?.classList.add('intro-highlight');
  await showCard(`${ico('check')} <b>Qué repetir:</b> ponemos <b>abajo</b> en el bloque.`, signal);
  click('[data-dir="down"]');
  await delay(scene, 450);
  slotsFor?.classList.remove('intro-highlight');
  click('[data-target="main"]');
  if (signal?.cancelled) return;

  // 4. Payoff: con el FOR, baja 3 veces solo
  backdrop.classList.add('out');
  setTimeout(() => backdrop.remove(), 320);
  if (forPanel) {
    forPanel.style.position = '';
    forPanel.style.zIndex = '';
  }
  await panTo(scene, COLUMNA, 2.0, 600);
  if (signal?.cancelled) return;
  await showCard(`${ico('estrella')} ¡Mira! Con <b>FOR</b> baja las <b>5 veces</b> solo y llega justo a su regalo.`, signal);
  if (signal?.cancelled) return;
  for (let i = 0; i < PASOS_REGALO; i++) {
    await scene.step('down');
    if (signal?.cancelled) return;
  }
  await delay(scene, 400);

  // 5. Reset para el jugador: bloque FOR en blanco
  await panTo(scene, FULL, 1, 600);
  if (signal?.cancelled) return;
  window.__clearProgram?.();
  scene.resetLevel();
  window.__setForPanel?.(true);
  window.__setIfPanel?.(true);
  unlockPanels();
  await showCard(
    `${ico('control')} ¡Ahora vos! Usa <b>FOR</b> para repetir los pasos y combinalo con movimientos para llegar.`,
    signal,
  );
}
