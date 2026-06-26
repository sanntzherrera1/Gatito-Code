import { MAX, ARROW, GYM, getLabel } from './state.js';
import { showJumpPickerForEl, initJumpPicker } from './jump-picker.js';

let slotsEl;
let slotsFunc1El;
let slotsForEl;
let ifConditionSelect;
let ifActionSelect;
let ifConditionSelect2;
let ifActionSelect2;
let forCountSelect;
let dirsPanel;
let runBtn;
let clearBtn;
let clearFunc1Btn;
let clearForBtn;
let trashZoneEl;
let activeTarget = 'main';
const uiSfx = (key) => window.__playUiSfx?.(key);

// Panel de logica combinado: Funcion / For / Si comparten un solo panel con
// pestañas (como el switch del panel Movement). `logicaDisponible` indica que
// pestañas existen en el nivel actual; `logicaActiva` cual se muestra.
let logicaPanelEl;
let logicaTituloEl;
let logicaSwitchEl;
let ifTabSwitchEl;
let ifRuleEl;
const logicaDisponible = { main: true, func1: true, for: false, if: true };
let logicaActiva = 'main';
let ifActiva = 'if-1';
const LOGICA_ORDEN = ['main', 'func1', 'for', 'if'];
const LOGICA_TITULOS = { main: 'Programa', func1: 'Funcion', for: 'For', if: 'Si' };
const LOGICA_IDS = { main: 'queue', func1: 'queue-func1', for: 'queue-for', if: 'queue-if-rule' };

// A partir del nombre de tab (main/func1/for/if) devuelve el id del panel ple-
// gable correspondiente.
function tabToPanelId(tab) {
  if (tab === 'main') return 'queue';
  if (tab === 'func1') return 'queue-func1';
  if (tab === 'for')   return 'queue-for';
  if (tab === 'if')    return 'queue-if-rule';
  return null;
}

export function initQueue() {
  slotsEl = document.getElementById('slots');
  slotsFunc1El = document.getElementById('slots-func1');
  slotsForEl = document.getElementById('slots-for');
  ifConditionSelect = document.getElementById('if-condition-select');
  ifActionSelect = document.getElementById('if-action-select');
  ifConditionSelect2 = document.getElementById('if-condition-select-2');
  ifActionSelect2 = document.getElementById('if-action-select-2');
  forCountSelect = document.getElementById('for-count-select');
  dirsPanel = document.getElementById('dirs');
  runBtn = document.getElementById('run');
  clearBtn = document.getElementById('clear');
  trashZoneEl = document.getElementById('slot-trash-zone');

  trashZoneEl.addEventListener('dragover', e => {
    e.preventDefault();
    trashZoneEl.classList.add('drag-over');
  });
  trashZoneEl.addEventListener('dragleave', () => trashZoneEl.classList.remove('drag-over'));
  trashZoneEl.addEventListener('drop', e => {
    e.preventDefault();
    trashZoneEl.classList.remove('drag-over');
    trashZoneEl.classList.remove('visible');

    if (GYM.running) return;
    const dataStr = e.dataTransfer.getData('text/plain');
    try {
      const payload = JSON.parse(dataStr);
      if (payload.isMove && payload.queueId) {
        const queue = obtenerQueuePorId(payload.queueId);
        if (!queue) return;
        queue.splice(payload.index, 1);
        uiSfx('ui_erase');
        renderAllSlots();
      }
    } catch (err) {}
  });

  initJumpPicker(renderAllSlots);
  initTargetSwitch();
  initIfPanel();
  initForPanel();
  initLogicaTabs();
  initIfTabSwitch();
  initPanelToggles();

  dirsPanel.querySelectorAll('button[data-dir]:not([data-dir="jump"])').forEach(btn => {
    btn.addEventListener('click', () => {
      if (GYM.running) return;
      uiSfx();
      const queue = obtenerQueuePorTarget(activeTarget);
      const max = obtenerMaximoQueue(queue);
      const dir = btn.dataset.dir;
      if (!queue || !esComandoPermitidoEnQueue(dir, activeTarget)) return;
      if (queue.length >= max) return;
      queue.push(dir);
      renderAllSlots();
    });
  });

  const jumpBtn = document.getElementById('jump-btn');
  if (jumpBtn) {
    jumpBtn.addEventListener('click', e => {
      if (GYM.running) return;
      uiSfx();
      e.stopPropagation();
      const queue = obtenerQueuePorTarget(activeTarget);
      const max = obtenerMaximoQueue(queue);
      if (!queue || queue.length >= max) return;
      showJumpPickerForEl(jumpBtn, activeTarget, queue, max);
    });
  }

  dirsPanel.querySelectorAll('button[data-dir]:not([data-dir="jump"])').forEach(btn => {
    btn.setAttribute('draggable', 'true');
    btn.addEventListener('dragstart', e => {
      if (btn.disabled) { e.preventDefault(); return; }
      uiSfx('drag_pick');
      e.dataTransfer.setData('text/plain', btn.dataset.dir);
      e.dataTransfer.effectAllowed = 'all';
    });
  });

  setupDropZone(slotsEl, GYM.queue, 'main');
  setupDropZone(slotsFunc1El, GYM.queueFunc1, 'func1');
  setupDropZone(slotsForEl, GYM.queueFor, 'for');

  clearBtn.addEventListener('click', () => {
    if (GYM.running) return;
    const targetQueue = obtenerQueuePorTarget(activeTarget);
    if (targetQueue && targetQueue.length) {
      uiSfx('ui_erase');
      targetQueue.length = 0;
      renderAllSlots();
    }
  });

  runBtn.addEventListener('click', async () => {
    if (GYM.running) return;
    if (GYM.queue.length === 0) return;
    uiSfx('ui_execute');
    if (typeof GYM.onRun !== 'function') return;
    setRunning(true);
    try {
      await GYM.onRun(GYM.queue.slice());
    } finally {
      GYM.queue.length = 0;
      renderAllSlots();
      setRunning(false);
    }
  });

  document.getElementById('restart').addEventListener('click', () => {
    if (GYM.running) return;
    uiSfx();
    window.__clearProgram();
    GYM.onRestart?.();
  });

  // Bloquea/desbloquea agregar movimientos y ejecutar (tras ganar/perder).
  window.__lockInput = (on) => {
    GYM.locked = !!on;
    setRunning(GYM.running);   // re-aplica el estado disabled de los controles
  };

  // Limpia todas las colas del programa (principal, funcion, for, condiciones).
  // Se llama al cambiar de nivel para no arrastrar movimientos al siguiente.
  window.__clearProgram = () => {
    GYM.queue.length = 0;
    GYM.queueFunc1.length = 0;
    GYM.queueFor.length = 0;
    GYM.forCount = 2;
    GYM.ifCondition = '';
    GYM.ifAction = '';
    GYM.ifCondition2 = '';
    GYM.ifAction2 = '';
    _recursionWarned.clear();
    renderAllSlots();
  };

window.__setPanels = visible => {
    // Se usa clase (no display inline) para que el CSS pueda controlar la
    // visibilidad de los paneles sin pisar reglas especificas de cada nivel.
    for (const id of ['panels', 'right-panels']) {
      document.getElementById(id)?.classList.toggle('panels-visible', visible);
    }
    if (!visible) {
      const missionBox = document.getElementById('mission');
      if (missionBox) missionBox.style.display = 'none';
      limpiarTooltipRecursion();
    }
    setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
  };

  window.__abrirPanelLogica = abrirPanelLogica;

  // Muestra/oculta la pestaña FUNCION dentro del panel de logica.
  window.__setFunc1Panel = visible => {
    logicaDisponible.func1 = !!visible;
    actualizarLogica();
  };

  window.__setIfPanel = visible => {
    logicaDisponible.if = !!visible;
    if (!visible) {
      GYM.ifCondition = '';
      GYM.ifAction = '';
      GYM.ifCondition2 = '';
      GYM.ifAction2 = '';
      renderIfSeleccionado();
    }
    actualizarLogica();
  };

  window.__setForPanel = visible => {
    logicaDisponible.for = !!visible;
    const opt = document.querySelector('.target-opt[data-target="for"]');
    const forBtn = dirsPanel?.querySelector('button[data-dir="for"]');
    if (opt) opt.style.display = visible ? 'flex' : 'none';
    if (forBtn) forBtn.style.display = visible ? 'flex' : 'none';
    if (!visible) {
      GYM.queueFor.length = 0;
      GYM.forCount = 2;
      if (activeTarget === 'for') activarTarget('main');
      renderForSeleccionado();
      renderAllSlots();
    }
    actualizarLogica();
  };

  renderAllSlots();
}

function initTargetSwitch() {
  const switchEl = document.getElementById('target-switch');
  if (!switchEl) return;
  switchEl.querySelectorAll('.target-opt').forEach(opt => {
    opt.addEventListener('click', () => { 
      uiSfx(); 
      // Al hacer clic en el switch de desktop, cambiamos el target
      // y forzamos que se despliegue el acordeón en desktop.
      activarTarget(opt.dataset.target); 
      abrirPanelLogica(opt.dataset.target);
    });
  });
}

function activarTarget(target) {
  if (target === 'if') return;
  activeTarget = target;
  
  const switchEl = document.getElementById('target-switch');
  if (switchEl) {
    switchEl.querySelectorAll('.target-opt').forEach(o =>
      o.classList.toggle('active', o.dataset.target === target)
    );
  }

  const func1Btn = dirsPanel.querySelector('[data-dir="func1"]');
  if (func1Btn) func1Btn.disabled = (target === 'func1');
  const forBtn = dirsPanel.querySelector('[data-dir="for"]');
  if (forBtn) forBtn.disabled = (target === 'for');
}

function renderQueue(queue, container) {
  if (!container) return;
  [...container.children].forEach((el, i) => {
    const value = queue[i];
    const varText = value ? `<span class="var-label">${i === 0 ? 'i' : 'i+' + i}</span>` : '';
    const isFunc = value === 'func1';
    const isFor = value === 'for';
    const iconStyle = isFunc
      ? 'style="color:#1a4a7a; font-style: italic; font-weight: 900; font-family: serif; text-shadow: 0.5px 0 0 #1a4a7a, -0.5px 0 0 #1a4a7a;"'
      : isFor
        ? 'style="color:#7a4a12; font-size:10px; font-weight:900;"'
        : '';
    const labelStyle = isFunc ? 'style="color:#1a4a7a"' : isFor ? 'style="color:#7a4a12"' : '';
    el.innerHTML = value ? `<span class="dir-icon" ${iconStyle}>${ARROW[value]}</span><span class="dir-label" ${labelStyle}>${getLabel(value)}</span>${varText}` : '';
    el.classList.toggle('filled', !!value);
    el.draggable = !!value;
  });
}

export function renderAllSlots() {
  renderQueue(GYM.queue, slotsEl);
  renderQueue(GYM.queueFunc1, slotsFunc1El);
  renderQueue(GYM.queueFor, slotsForEl);
  renderIfSeleccionado();
  renderForSeleccionado();
}

function initIfPanel() {
  ifConditionSelect?.addEventListener('change', () => {
    if (GYM.running) return;
    GYM.ifCondition = ifConditionSelect.value;
  });
  ifActionSelect?.addEventListener('change', () => {
    if (GYM.running) return;
    GYM.ifAction = ifActionSelect.value;
  });
  ifConditionSelect2?.addEventListener('change', () => {
    if (GYM.running) return;
    GYM.ifCondition2 = ifConditionSelect2.value;
  });
  ifActionSelect2?.addEventListener('change', () => {
    if (GYM.running) return;
    GYM.ifAction2 = ifActionSelect2.value;
  });
}

function renderIfSeleccionado() {
  if (ifConditionSelect) ifConditionSelect.value = GYM.ifCondition || '';
  if (ifActionSelect) ifActionSelect.value = GYM.ifAction || '';
  if (ifConditionSelect2) ifConditionSelect2.value = GYM.ifCondition2 || '';
  if (ifActionSelect2) ifActionSelect2.value = GYM.ifAction2 || '';
}

function initForPanel() {
  forCountSelect?.addEventListener('change', () => {
    if (GYM.running) return;
    GYM.forCount = Number.parseInt(forCountSelect.value, 10) || 2;
  });
}

function renderForSeleccionado() {
  if (forCountSelect) forCountSelect.value = String(GYM.forCount || 2);
}

function initLogicaTabs() {
  logicaPanelEl = document.getElementById('queue-logica');
  logicaTituloEl = document.getElementById('logica-titulo');
  logicaSwitchEl = document.getElementById('logica-switch');
  logicaSwitchEl?.querySelectorAll('.logica-tab').forEach(tab => {
    tab.addEventListener('click', () => activarLogica(tab.dataset.logicaTab));
  });
  actualizarLogica();

  // Interceptar drops recursivos sobre cualquier parte del panel de logica.
  if (logicaPanelEl) {
    logicaPanelEl.addEventListener('dragover', e => e.preventDefault());
    logicaPanelEl.addEventListener('drop', e => {
      const dataStr = e.dataTransfer.getData('text/plain');
      let dir = dataStr;
      try { const p = JSON.parse(dataStr); if (p.dir) dir = p.dir; } catch {}
      if (dir && !esComandoPermitidoEnQueue(dir, logicaActiva)) {
        e.preventDefault();
        e.stopPropagation();
        mostrarTooltipRecursion(dir, logicaActiva);
      }
    });
  }
}

// Cambia la pestaña visible del panel de logica. Ignora pestañas no disponibles.
export function activarLogica(which) {
  if (!logicaDisponible[which]) return;
  logicaActiva = which;
  activarTarget(which);
  actualizarLogica();
}

// Sincroniza el panel de logica con `logicaDisponible`/`logicaActiva`:
// marca el panel activo y la disponibilidad de cada uno. En mobile/tablet el
// CSS muestra solo el panel con `data-activo-mobile="true"`; en desktop los 3
// paneles quedan siempre visibles y el colapso lo maneja `.plegado`.
function actualizarLogica() {
  if (!logicaPanelEl) return;
  // Si la pestaña activa ya no esta disponible, saltar a la primera disponible.
  if (!logicaDisponible[logicaActiva]) {
    logicaActiva = LOGICA_ORDEN.find(k => logicaDisponible[k]) || logicaActiva;
  }
  const disponibles = LOGICA_ORDEN.filter(k => logicaDisponible[k]);
  // Sin pestañas disponibles → se oculta todo el panel.
  logicaPanelEl.style.display = disponibles.length ? 'flex' : 'none';
  logicaPanelEl.dataset.activa = logicaActiva;

  // Marcar el panel activo (mobile/tablet) y la disponibilidad de cada uno.
  LOGICA_ORDEN.forEach(k => {
    const el = document.getElementById(LOGICA_IDS[k]);
    if (!el) return;
    el.dataset.disponible = String(logicaDisponible[k]);
    el.dataset.activoMobile = String(k === logicaActiva && logicaDisponible[k]);
  });

  // El switch solo tiene sentido si hay mas de una pestaña.
  if (logicaSwitchEl) {
    logicaSwitchEl.style.display = disponibles.length > 1 ? 'flex' : 'none';
    logicaSwitchEl.querySelectorAll('.logica-tab').forEach(tab => {
      const k = tab.dataset.logicaTab;
      tab.style.display = logicaDisponible[k] ? '' : 'none';
      tab.classList.toggle('active', k === logicaActiva);
    });
  }

  if (logicaTituloEl) logicaTituloEl.textContent = LOGICA_TITULOS[logicaActiva] || '';
}

// Sub-switch IF-1 / IF-2 dentro del panel SI. En mobile/tablet solo se ve uno
// a la vez; en desktop (>=1100px) el CSS oculta el switch y muestra ambos ifs.
function initIfTabSwitch() {
  ifTabSwitchEl = document.getElementById('if-tab-switch');
  // El padre comun del if-tab-switch y los if-block es #queue-if-content
  // (el .panel-cuerpo del panel SI), no #queue-if-rule.
  ifRuleEl = ifTabSwitchEl?.closest('.panel-cuerpo') || document.getElementById('queue-if-content');
  ifTabSwitchEl?.querySelectorAll('.if-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const k = tab.dataset.ifTab;
      if (!k) return;
      ifActiva = k;
      actualizarIfActiva();
    });
  });
  actualizarIfActiva();
}

function actualizarIfActiva() {
  if (!ifRuleEl) return;
  ifRuleEl.dataset.activaIf = ifActiva;
  ifTabSwitchEl?.querySelectorAll('.if-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.ifTab === ifActiva);
  });
  ifRuleEl.querySelectorAll('.if-block').forEach(block => {
    block.classList.toggle('if-block-active', block.dataset.ifBlock === ifActiva);
  });
}

// Acordeon de paneles colapsables (solo util en desktop >=1100px; en mobile
// los botones estan ocultos via CSS). Al abrir uno se cierran los demas.
function initPanelToggles() {
  const toggles = document.querySelectorAll('.panel-toggle');
  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = document.getElementById(btn.dataset.togglePanel);
      if (!panel) return;
      const fuePlegado = panel.classList.contains('plegado');
      if (fuePlegado) {
        // Acordeon: al abrir uno, cerrar los demas que estuvieran expandidos.
        toggles.forEach(otro => {
          if (otro === btn) return;
          const otroPanel = document.getElementById(otro.dataset.togglePanel);
          if (!otroPanel || otroPanel.classList.contains('plegado')) return;
          otroPanel.classList.add('plegado');
          otro.setAttribute('aria-expanded', 'false');
        });
      }
      panel.classList.toggle('plegado');
      btn.setAttribute('aria-expanded', String(fuePlegado));
      if (fuePlegado && panel.dataset.logicaPanel) {
        activarTarget(panel.dataset.logicaPanel);
      }
    });
  });
}

// Helper para que los tutoriales puedan abrir un panel logico en ambos view-
// ports. En mobile/tablet dispara el tab del F1/FOR/SI switch; en desktop
// (donde el switch esta oculto) quita el .plegado del panel correspondiente.
export function abrirPanelLogica(tab) {
  if (!logicaDisponible[tab]) return;
  const tabBtn = logicaSwitchEl?.querySelector(`.logica-tab[data-logica-tab="${tab}"]`);
  // Si el boton del switch es visible (mobile/tablet), usarlo.
  if (tabBtn && tabBtn.offsetParent !== null) {
    tabBtn.click();
    return;
  }
  // Si no, estamos en desktop: abrir el panel correspondiente.
  const panelId = tabToPanelId(tab);
  const panel = panelId && document.getElementById(panelId);
  if (!panel) return;
  if (panel.classList.contains('plegado')) {
    panel.classList.remove('plegado');
    const btn = panel.querySelector('.panel-toggle');
    if (btn) btn.setAttribute('aria-expanded', 'true');
  }
  // Acordeon: cerrar los demas que estuvieran expandidos.
  document.querySelectorAll('#queue-logica .panel-plegable').forEach(otro => {
    if (otro === panel) return;
    if (!otro.classList.contains('plegado')) {
      otro.classList.add('plegado');
      const btn = otro.querySelector('.panel-toggle');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
  });
}

function setRunning(on) {
  GYM.running = on;
  // Bloqueado mientras ejecuta O mientras hay un resultado (ganar/perder) sin reintentar.
  const blocked = on || GYM.locked;
  runBtn.classList.toggle('running', on);
  runBtn.querySelector('.queue-label').textContent = on ? (window.__t?.('btn.running') ?? 'ejecutando...') : (window.__t?.('btn.run') ?? 'ejecutar');
  runBtn.querySelector('.queue-icon').textContent = on ? '\u23f5' : '\u2713';
  dirsPanel.querySelectorAll('button:not(.target-opt)').forEach(b => b.disabled = blocked);
  if (ifConditionSelect) ifConditionSelect.disabled = blocked;
  if (ifActionSelect) ifActionSelect.disabled = blocked;
  if (ifConditionSelect2) ifConditionSelect2.disabled = blocked;
  if (ifActionSelect2) ifActionSelect2.disabled = blocked;
  if (forCountSelect) forCountSelect.disabled = blocked;
  runBtn.disabled = blocked;
  clearBtn.disabled = blocked;
}

function setupDropZone(container, queue, queueId) {
  if (!container) return;
  [...container.children].forEach((slot, i) => {
    slot.addEventListener('dragover', e => {
      e.preventDefault();
      slot.classList.add('drag-over');
    });
    slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
    slot.addEventListener('drop', e => {
      e.preventDefault();
      slot.classList.remove('drag-over');
      if (GYM.running) return;

      let dir;
      let sourceQueueId;
      let sourceIndex;
      const dataStr = e.dataTransfer.getData('text/plain');

      try {
        const payload = JSON.parse(dataStr);
        if (payload.isMove) {
          dir = payload.dir;
          sourceQueueId = payload.queueId;
          sourceIndex = payload.index;
        } else {
          dir = dataStr;
        }
      } catch (err) {
        dir = dataStr;
      }

      if (!dir || !esComandoPermitidoEnQueue(dir, queueId)) {
        mostrarTooltipRecursion(dir, queueId);
        return;
      }

      const maxAllowed = obtenerMaximoQueue(queue);

      if (sourceQueueId) {
        const srcQueue = obtenerQueuePorId(sourceQueueId);
        if (!srcQueue) return;
        if (srcQueue === queue) {
          if (sourceIndex === i) return;
          srcQueue.splice(sourceIndex, 1);
          queue.splice(Math.min(i, queue.length), 0, dir);
        } else {
          if (queue.length >= maxAllowed) return;
          srcQueue.splice(sourceIndex, 1);
          queue.splice(Math.min(i, queue.length), 0, dir);
        }
      } else {
        if (queue.length >= maxAllowed) return;
        queue.splice(Math.min(i, queue.length), 0, dir);
        if (queue.length > maxAllowed) queue.length = maxAllowed;
      }

      uiSfx('drag_drop');
      renderAllSlots();
    });

    slot.addEventListener('dragstart', e => {
      if (GYM.running || i >= queue.length) {
        e.preventDefault();
        return;
      }
      uiSfx('drag_pick');
      const dir = queue[i];
      const payload = { isMove: true, dir, queueId, index: i };
      e.dataTransfer.setData('text/plain', JSON.stringify(payload));
      e.dataTransfer.effectAllowed = 'all';
      setTimeout(() => {
        slot.classList.add('dragging');
        const rect = slot.getBoundingClientRect();
        trashZoneEl.style.top = `${rect.top - 5}px`;
        let leftPos = rect.right + 12;
        if (leftPos + 50 > window.innerWidth) {
          leftPos = rect.left - 62;
        }
        trashZoneEl.style.left = `${leftPos}px`;
        trashZoneEl.classList.add('visible');
      }, 0);
    });

    slot.addEventListener('dragend', () => {
      slot.classList.remove('dragging');
      trashZoneEl.classList.remove('visible');
      trashZoneEl.classList.remove('drag-over');
    });
  });
}

function obtenerQueuePorTarget(target) {
  if (target === 'func1') return GYM.queueFunc1;
  if (target === 'for') return GYM.queueFor;
  return GYM.queue;
}

function obtenerQueuePorId(queueId) {
  if (queueId === 'func1') return GYM.queueFunc1;
  if (queueId === 'for') return GYM.queueFor;
  if (queueId === 'main') return GYM.queue;
  return null;
}

function obtenerMaximoQueue(queue) {
  if (queue === GYM.queueFunc1 || queue === GYM.queueFor) return 3;
  return MAX;
}

function esComandoPermitidoEnQueue(dir, queueId) {
  if (dir === 'if-rock-jump' || dir === 'if-navigate') return false;
  if (dir === 'for' && queueId === 'for') return false;
  if (dir === 'func1' && queueId === 'func1') return false;
  return true;
}

let _recursionWarned = new Set();
let _activeTooltip = null;
function limpiarTooltipRecursion() {
  if (_activeTooltip) { _activeTooltip.remove(); _activeTooltip = null; }
}
function mostrarTooltipRecursion(dir, queueId) {
  if (dir !== queueId) return;
  if (_recursionWarned.has(queueId)) return;
  const panel = document.getElementById('queue-logica');
  if (!panel || !panel.offsetParent) return;
  _recursionWarned.add(queueId);
  limpiarTooltipRecursion();
  const rect = panel.getBoundingClientRect();
  const key = `recursion.${queueId}`;
  const fallback = queueId === 'func1'
    ? 'No podes poner Funcion dentro de si misma, eso generaria un bucle infinito.'
    : 'No podes poner FOR dentro de si mismo, eso generaria un bucle infinito.';
  const tr = window.__t?.(key);
  const text = (tr && tr !== key) ? tr : fallback;
  const panelOnRight = rect.left > window.innerWidth / 2;
  const tip = document.createElement('div');
  tip.className = `recursion-tooltip ${panelOnRight ? 'tooltip-left' : 'tooltip-right'}`;
  tip.textContent = text;
  tip.style.top = `${rect.top + rect.height / 2}px`;
  tip.style.left = panelOnRight ? `${rect.left - 10}px` : `${rect.right + 10}px`;
  _activeTooltip = tip;
  document.body.appendChild(tip);
  setTimeout(() => { tip.classList.add('visible'); }, 10);
  setTimeout(() => {
    tip.classList.remove('visible');
    setTimeout(() => { if (_activeTooltip === tip) { tip.remove(); _activeTooltip = null; } }, 400);
  }, 5000);
}
