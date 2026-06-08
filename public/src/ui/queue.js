import { MAX, ARROW, LABEL, GYM } from './state.js';
import { showJumpPickerForEl, initJumpPicker } from './jump-picker.js';

let slotsEl, slotsFunc1El, dirsPanel, runBtn, clearBtn, clearFunc1Btn, trashZoneEl;
let activeTarget = 'main';

export function initQueue() {
  slotsEl = document.getElementById('slots');
  slotsFunc1El = document.getElementById('slots-func1');
  dirsPanel = document.getElementById('dirs');
  runBtn = document.getElementById('run');
  clearBtn = document.getElementById('clear');
  clearFunc1Btn = document.getElementById('clear-func1');
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
        const q = payload.queueId === 'func1' ? GYM.queueFunc1 : GYM.queue;
        q.splice(payload.index, 1);
        renderAllSlots();
      }
    } catch(err) {}
  });

  initTargetSwitch();
  initJumpPicker(renderAllSlots);

  dirsPanel.querySelectorAll('button:not(.target-opt):not([data-dir="jump"]):not(.jump-dir-btn)').forEach(btn => {
    btn.addEventListener('click', () => {
      if (GYM.running) return;
      const queue = activeTarget === 'func1' ? GYM.queueFunc1 : GYM.queue;
      const max = activeTarget === 'func1' ? 3 : MAX;
      if (queue.length < max) {
        queue.push(btn.dataset.dir);
        renderAllSlots();
      }
    });
  });

  const jumpBtn = document.getElementById('jump-btn');
  if (jumpBtn) {
    jumpBtn.addEventListener('click', (e) => {
      if (GYM.running) return;
      e.stopPropagation();
      const queue = activeTarget === 'func1' ? GYM.queueFunc1 : GYM.queue;
      const max = activeTarget === 'func1' ? 3 : MAX;
      if (queue.length >= max) return;
      showJumpPickerForEl(jumpBtn, activeTarget, queue, max);
    });
  }

  dirsPanel.querySelectorAll('button:not(.target-opt):not(.jump-dir-btn)').forEach(btn => {
    btn.setAttribute('draggable', 'true');
    btn.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', btn.dataset.dir);
      e.dataTransfer.effectAllowed = 'all';
    });
  });

  setupDropZone(slotsEl, GYM.queue, 'main');
  setupDropZone(slotsFunc1El, GYM.queueFunc1, 'func1');

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

  runBtn.addEventListener('click', async () => {
    if (GYM.running) return;
    if (GYM.queue.length === 0) return;
    if (typeof GYM.onRun !== 'function') return;
    setRunning(true);
    try { await GYM.onRun(GYM.queue.slice()); }
    finally { GYM.queue.length = 0; renderAllSlots(); setRunning(false); }
  });

  document.getElementById('restart').addEventListener('click', () => {
    if (GYM.running) return;
    GYM.queue.length = 0;
    GYM.queueFunc1.length = 0;
    renderAllSlots();
    GYM.onRestart?.();
  });

  window.__setPanels = (visible) => {
    document.getElementById('panels').style.display = visible ? 'flex' : 'none';
    document.getElementById('right-panels').style.display = visible ? 'flex' : 'none';
    if (!visible) {
      const missionBox = document.getElementById('mission');
      if (missionBox) missionBox.style.display = 'none';
    }
  };

  renderAllSlots();
}

function initTargetSwitch() {
  const switchEl = document.getElementById('target-switch');
  switchEl.querySelectorAll('.target-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      activeTarget = opt.dataset.target;
      switchEl.querySelectorAll('.target-opt').forEach(o =>
        o.classList.toggle('active', o === opt));
    });
  });
}

function renderQueue(queue, container) {
  if (!container) return;
  [...container.children].forEach((el, i) => {
    const v = queue[i];
    const varText = v ? `<span class="var-label">${i === 0 ? 'i' : 'i+' + i}</span>` : '';
    const iconStyle = v === 'func1' ? 'style="color:#1a4a7a; font-style: italic; font-weight: 900; font-family: serif; text-shadow: 0.5px 0 0 #1a4a7a, -0.5px 0 0 #1a4a7a;"' : '';
    const labelStyle = v === 'func1' ? 'style="color:#1a4a7a"' : '';
    el.innerHTML = v ? `<span class="dir-icon" ${iconStyle}>${ARROW[v]}</span><span class="dir-label" ${labelStyle}>${LABEL[v]}</span>${varText}` : '';
    el.classList.toggle('filled', !!v);
    el.draggable = !!v;
  });
}

export function renderAllSlots() {
  renderQueue(GYM.queue, slotsEl);
  renderQueue(GYM.queueFunc1, slotsFunc1El);
}

function setRunning(on) {
  GYM.running = on;
  runBtn.classList.toggle('running', on);
  runBtn.querySelector('.queue-label').textContent = on ? 'ejecutando…' : 'ejecutar';
  runBtn.querySelector('.queue-icon').textContent = on ? '⏵' : '✓';
  dirsPanel.querySelectorAll('button:not(.target-opt)').forEach(b => b.disabled = on);
  runBtn.disabled = on;
  clearBtn.disabled = on;
  clearFunc1Btn.disabled = on;
}

function setupDropZone(container, queue, queueId) {
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

      let dir, sourceQueueId, sourceIndex;
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
      } catch(err) {
        dir = dataStr;
      }

      if (!dir) return;

      const maxAllowed = queue === GYM.queueFunc1 ? 3 : MAX;

      if (sourceQueueId) {
        // Move operation (reordering or moving between queues)
        const srcQueue = sourceQueueId === 'func1' ? GYM.queueFunc1 : GYM.queue;
        if (srcQueue === queue) {
          if (sourceIndex === i) return; // Dropped on itself
          srcQueue.splice(sourceIndex, 1);
          queue.splice(Math.min(i, queue.length), 0, dir);
        } else {
          if (queue.length >= maxAllowed) return;
          srcQueue.splice(sourceIndex, 1);
          queue.splice(Math.min(i, queue.length), 0, dir);
        }
      } else {
        // Copy operation from palette
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