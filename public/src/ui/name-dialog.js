export function initNameDialog() {
  const dialog   = document.getElementById('name-dialog');
  const input    = document.getElementById('name-dialog-input');
  const confirmBtn = document.getElementById('name-dialog-confirm');
  const cancelBtn  = document.getElementById('name-dialog-cancel');
  let _cb = null;

  // Prevent keyboard/pointer events from bubbling past the dialog to window
  // where Phaser captures them (fixes: blocked keys like 'o' and click-through)
  const stopBubble = (e) => e.stopPropagation();
  const eventsToBlock = [
    'keydown', 'keyup', 'keypress',
    'mousedown', 'mouseup', 'mousemove', 'click', 'dblclick', 'wheel',
    'pointerdown', 'pointerup', 'pointermove',
    'touchstart', 'touchend', 'touchmove'
  ];
  eventsToBlock.forEach(evt => dialog.addEventListener(evt, stopBubble));

  // Trap focus inside the dialog while it's open so clicks don't focus
  // elements behind it
  document.addEventListener('focusin', (e) => {
    if (dialog.classList.contains('visible') && !dialog.contains(e.target)) {
      input.focus();
    }
  });

  function close() {
    dialog.classList.remove('visible');
    _cb = null;
  }

  function confirm() {
    const name = input.value.trim();
    if (!name) { input.focus(); return; }
    const cb = _cb;
    close();
    cb?.(name);
  }

  confirmBtn.addEventListener('click', () => { window.__playUiSfx?.(); confirm(); });
  cancelBtn.addEventListener('click', () => { window.__playUiSfx?.(); close(); });
  dialog.addEventListener('click', e => { if (e.target === dialog) close(); });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') confirm();
    if (e.key === 'Escape') close();
  });

  window.__showNameDialog = (onConfirm) => {
    _cb = onConfirm;
    input.value = '';
    dialog.classList.add('visible');
    setTimeout(() => input.focus(), 60);
  };
}
