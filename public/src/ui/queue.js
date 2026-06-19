import { MAX, ARROW, LABEL, GYM } from './state.js';
import { showJumpPickerForEl, initJumpPicker } from './jump-picker.js';

let slotsEl;
let slotsFunc1El;
let slotsForEl;
let ifConditionSelect;
let ifActionSelect;
let forCountSelect;
let dirsPanel;
let runBtn;
let clearBtn;
let clearFunc1Btn;
let clearForBtn;
let trashZoneEl;
let activeTarget = 'main';

export function initQueue() {
  slotsEl = document.getElementById('slots');
  slotsFunc1El = document.getElementById('slots-func1');
  slotsForEl = document.getElementById('slots-for');
  ifConditionSelect = document.getElementById('if-condition-select');
  ifActionSelect = document.getElementById('if-action-select');
  forCountSelect = document.getElementById('for-count-select');
  dirsPanel = document.getElementById('dirs');
  runBtn = document.getElementById('run');
  clearBtn = document.getElementById('clear');
  clearFunc1Btn = document.getElementById('clear-func1');
  clearForBtn = document.getElementById('clear-for');
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
        renderAllSlots();
      }
    } catch (err) {}
  });

  initTargetSwitch();
  initJumpPicker(renderAllSlots);
  initIfPanel();
  initForPanel();
  initPanelesPlegables();

  dirsPanel.querySelectorAll('button[data-dir]:not([data-dir="jump"])').forEach(btn => {
    btn.addEventListener('click', () => {
      if (GYM.running) return;
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
      e.dataTransfer.setData('text/plain', btn.dataset.dir);
      e.dataTransfer.effectAllowed = 'all';
    });
  });

  setupDropZone(slotsEl, GYM.queue, 'main');
  setupDropZone(slotsFunc1El, GYM.queueFunc1, 'func1');
  setupDropZone(slotsForEl, GYM.queueFor, 'for');

  clearBtn.addEventListener('click', () => {
    if (GYM.running) return;
    GYM.queue.length = 0;
    renderAllSlots();
  });

  clearFunc1Btn.addEventListener('click', () => {
    if (GYM.running) return;
    GYM.queueFunc1.length = 0;
    renderAllSlots();
  });

  clearForBtn?.addEventListener('click', () => {
    if (GYM.running) return;
    GYM.queueFor.length = 0;
    renderAllSlots();
  });

  runBtn.addEventListener('click', async () => {
    if (GYM.running) return;
    if (GYM.queue.length === 0) return;
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
    GYM.queue.length = 0;
    GYM.queueFunc1.length = 0;
    GYM.queueFor.length = 0;
    GYM.forCount = 2;
    GYM.ifCondition = '';
    GYM.ifAction = '';
    renderAllSlots();
    GYM.onRestart?.();
  });

  window.__setPanels = visible => {
    document.getElementById('panels').style.display = visible ? 'flex' : 'none';
    document.getElementById('right-panels').style.display = visible ? 'flex' : 'none';
    if (!visible) {
      const missionBox = document.getElementById('mission');
      if (missionBox) missionBox.style.display = 'none';
    }
  };

  window.__setIfPanel = visible => {
    const panel = document.getElementById('queue-if-rule');
    if (!panel) return;
    panel.style.display = visible ? '' : 'none';
    if (!visible) {
      GYM.ifCondition = '';
      GYM.ifAction = '';
      renderIfSeleccionado();
    }
  };

  window.__setForPanel = visible => {
    const panel = document.getElementById('queue-for');
    const opt = document.querySelector('.target-opt[data-target="for"]');
    const forBtn = dirsPanel?.querySelector('button[data-dir="for"]');
    if (panel) panel.style.display = visible ? 'flex' : 'none';
    if (opt) opt.style.display = visible ? 'flex' : 'none';
    if (forBtn) forBtn.style.display = visible ? 'flex' : 'none';
    if (!visible) {
      GYM.queueFor.length = 0;
      GYM.forCount = 2;
      if (activeTarget === 'for') activarTarget('main');
      renderForSeleccionado();
      renderAllSlots();
    }
  };

  renderAllSlots();
}

function initTargetSwitch() {
  const switchEl = document.getElementById('target-switch');
  switchEl.querySelectorAll('.target-opt').forEach(opt => {
    opt.addEventListener('click', () => activarTarget(opt.dataset.target));
  });
}

function activarTarget(target) {
  activeTarget = target;
  const switchEl = document.getElementById('target-switch');
  switchEl.querySelectorAll('.target-opt').forEach(o =>
    o.classList.toggle('active', o.dataset.target === target));
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
    el.innerHTML = value ? `<span class="dir-icon" ${iconStyle}>${ARROW[value]}</span><span class="dir-label" ${labelStyle}>${LABEL[value]}</span>${varText}` : '';
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
}

function renderIfSeleccionado() {
  if (ifConditionSelect) ifConditionSelect.value = GYM.ifCondition || '';
  if (ifActionSelect) ifActionSelect.value = GYM.ifAction || '';
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

function initPanelesPlegables() {
  document.querySelectorAll('[data-toggle-panel]').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = document.getElementById(btn.dataset.togglePanel);
      if (!panel) return;
      const plegado = panel.classList.toggle('plegado');
      btn.setAttribute('aria-expanded', String(!plegado));
    });
  });
}

function setRunning(on) {
  GYM.running = on;
  runBtn.classList.toggle('running', on);
  runBtn.querySelector('.queue-label').textContent = on ? 'ejecutando...' : 'ejecutar';
  runBtn.querySelector('.queue-icon').textContent = on ? '\u23f5' : '\u2713';
  dirsPanel.querySelectorAll('button:not(.target-opt)').forEach(b => b.disabled = on);
  if (ifConditionSelect) ifConditionSelect.disabled = on;
  if (ifActionSelect) ifActionSelect.disabled = on;
  if (forCountSelect) forCountSelect.disabled = on;
  runBtn.disabled = on;
  clearBtn.disabled = on;
  clearFunc1Btn.disabled = on;
  if (clearForBtn) clearForBtn.disabled = on;
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

      if (!dir || !esComandoPermitidoEnQueue(dir, queueId)) return;

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

      renderAllSlots();
    });

    slot.addEventListener('dragstart', e => {
      if (GYM.running || i >= queue.length) {
        e.preventDefault();
        return;
      }
      const dir = queue[i];
      const payload = { isMove: true, dir, queueId, index: i };
      e.dataTransfer.setData('text/plain', JSON.stringify(payload));
      e.dataTransfer.effectAllowed = 'all';
      setTimeout(() => {
        slot.classList.add('dragging');
        const rect = slot.getBoundingClientRect();
        trashZoneEl.style.top = `${rect.top - 5}px`;
        trashZoneEl.style.left = `${rect.right + 12}px`;
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
  return true;
}
