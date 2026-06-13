let panel, portraitEl, messageEl, actionsEl;

export function initResult() {
  panel = document.getElementById('result-panel');
  portraitEl = document.getElementById('result-portrait');
  messageEl = document.getElementById('result-message');
  actionsEl = document.getElementById('result-actions');

  /**
   * @param {Object} opts
   * @param {'idle'|'win'|'lose'} opts.state
   * @param {string} opts.message
   * @param {boolean} [opts.hasNext]
   * @param {Function} [opts.onRestart]
   * @param {Function} [opts.onMenu]
   * @param {Function} [opts.onNext]
   */
  window.__showResult = ({ state = 'idle', message, hasNext, onRestart, onMenu, onNext }) => {
    portraitEl.className = `result-portrait ${state}`;
    messageEl.className = `result-message ${state}`;
    messageEl.textContent = message ?? '';

    actionsEl.innerHTML = '';
    if (state === 'win') {
      addAction(hasNext ? 'Siguiente' : 'Terminar', () => onNext?.());
    } else if (state === 'lose') {
      addAction('Reintentar', () => onRestart?.());
      addAction('Menu',       () => onMenu?.());
    } else if (state === 'idle') {
      // En niveles tutorial un intento fallido no es "perder": igual ofrecemos reintentar.
      if (onRestart) addAction('Reintentar', () => onRestart?.());
      if (onMenu)    addAction('Menu',       () => onMenu?.());
    }

    requestAnimationFrame(() => panel.classList.add('visible'));
  };

  window.__hideResult = hideResult;
}

function addAction(label, handler) {
  const b = document.createElement('button');
  b.textContent = label;
  b.addEventListener('click', handler);
  actionsEl.appendChild(b);
}

function hideResult() {
  panel?.classList.remove('visible');
}
