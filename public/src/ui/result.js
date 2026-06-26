let panel, portraitEl, messageEl, actionsEl, minimizeEl;

export function initResult() {
  panel = document.getElementById('result-panel');
  portraitEl = document.getElementById('result-portrait');
  messageEl = document.getElementById('result-message');
  actionsEl = document.getElementById('result-actions');
  minimizeEl = document.getElementById('result-minimize');

  minimizeEl?.addEventListener('click', () => {
    window.__playUiSfx?.();
    const isMinimized = panel.classList.toggle('minimized');
    minimizeEl.textContent = isMinimized ? '+' : '−';
    minimizeEl.title = isMinimized ? 'Expandir' : 'Minimizar';
  });

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
    const _t = (k, fb) => { const tr = window.__t?.(k); return (tr && tr !== k) ? tr : fb; };
    if (state === 'win') {
      addAction(hasNext ? _t('result.next', 'Siguiente') : _t('result.finish', 'Terminar'), () => onNext?.());
    } else if (state === 'lose') {
      addAction(_t('result.retry', 'Reintentar'), () => onRestart?.());
      addAction(_t('result.menu', 'Menu'),        () => onMenu?.());
    } else if (state === 'idle') {
      if (onRestart) addAction(_t('result.retry', 'Reintentar'), () => onRestart?.());
      if (onMenu)    addAction(_t('result.menu', 'Menu'),        () => onMenu?.());
    }

    // Tras ganar/perder se bloquea mover/agregar movimientos hasta reintentar.
    // En idle (juego activo) el input vuelve a estar disponible.
    window.__lockInput?.(state === 'win' || state === 'lose');

    panel.classList.remove('minimized');
    if (minimizeEl) {
      minimizeEl.textContent = '−';
      minimizeEl.title = 'Minimizar';
    }

    requestAnimationFrame(() => panel.classList.add('visible'));
  };

  window.__hideResult = hideResult;
}

function addAction(label, handler) {
  const b = document.createElement('button');
  b.textContent = label;
  b.addEventListener('click', () => { window.__playUiSfx?.(); handler(); });
  actionsEl.appendChild(b);
}

function hideResult() {
  panel?.classList.remove('visible');
}
