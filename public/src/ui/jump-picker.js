import { GYM } from './state.js';

let jumpDpad;
let jumpBtn;
let jumpTarget = 'main';
let jumpQueue = null;
let jumpMax = 0;
let renderAllSlotsFn = null;

export function initJumpPicker(renderAllSlots) {
  renderAllSlotsFn = renderAllSlots;
  jumpDpad = document.getElementById('jump-dpad');
  jumpBtn = document.getElementById('jump-btn');

  // El boton/picker de salto puede no estar en el DOM (retirado del panel
  // mientras se reimplementa via IF/saltar). Sin elementos no hay nada que inicializar.
  if (!jumpDpad || !jumpBtn) return;

  jumpDpad.querySelectorAll('button[data-jdir]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (GYM.running || !jumpQueue) return;
      window.__playUiSfx?.();
      const d = btn.dataset.jdir;
      if (jumpQueue.length >= jumpMax) return;
      jumpQueue.push(d === 'none' ? 'jump' : `jump_${d}`);
      renderAllSlotsFn();
      hideJumpDpad();
    });
  });

  document.addEventListener('click', (e) => {
    if (!jumpDpad.classList.contains('visible')) return;
    if (!jumpDpad.contains(e.target) && e.target !== jumpBtn) {
      hideJumpDpad();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && jumpDpad.classList.contains('visible')) hideJumpDpad();
  });
}

export function showJumpPickerForEl(el, target, queue, max) {
  jumpTarget = target;
  jumpQueue = queue;
  jumpMax = max;
  jumpBtn.style.display = 'none';
  jumpDpad.classList.add('visible');
}

export function hideJumpPicker() {
  hideJumpDpad();
}

function hideJumpDpad() {
  jumpDpad.classList.remove('visible');
  jumpBtn.style.display = '';
  jumpQueue = null;
  jumpMax = 0;
  jumpTarget = 'main';
}