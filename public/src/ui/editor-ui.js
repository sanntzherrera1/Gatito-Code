let edPanel, edTitle, edStatus, edTabs, edPalette, edLayersBar;
let edMainTabsBar, edAssetsPanel, edWeatherPanel;
let edTabsBar, edTilesetPanel, edObjectsPanel, edPreviewImage, edPreviewInfo;
let edToolbar, edSummary, edToast, edModal, edModalText, edModalConfirm, edModalCancel;
let edLayerPicker;
let edCfg = null;
let activeTilesetIdx = 0;
let activeTilesetCategory = 'grass';
let selectedGid = 0;
let activeTerrainName = null;
let activeObjCategory = 'objects';
let activeObjTabIdx = 0;
let activeObjType = 'deco';
let activeGroup = null;
let activeVariant = {};
let activeEditorTab = 'tileset';
let activeMainTab = 'assets';
let selectedObject = { key: null, frame: 0, type: 'deco' };
let isDirty = false;

export function initEditor() {
  edPanel = document.getElementById('editor-panel');
  edTitle = document.getElementById('ed-title');
  edStatus = document.getElementById('ed-status');
  edTabs = document.getElementById('ed-tabs');
  edPalette = document.getElementById('ed-palette');
  edLayersBar = document.getElementById('ed-layers');
  edMainTabsBar = document.getElementById('ed-main-tabs-bar');
  edAssetsPanel = document.getElementById('ed-assets-panel');
  edWeatherPanel = document.getElementById('ed-weather-panel');
  edTabsBar = document.getElementById('ed-tabs-bar');
  edTilesetPanel = document.getElementById('ed-tileset-panel');
  edObjectsPanel = document.getElementById('ed-objects-panel');
  edPreviewImage = document.getElementById('ed-preview-image');
  edPreviewInfo = document.getElementById('ed-preview-info');
  edToolbar = document.getElementById('ed-toolbar');
  edSummary = document.getElementById('ed-summary');
  edToast = document.getElementById('ed-toast');
  edModal = document.getElementById('ed-modal');
  edModalText = document.getElementById('ed-modal-text');
  edModalConfirm = document.getElementById('ed-modal-confirm');
  edModalCancel = document.getElementById('ed-modal-cancel');
  edLayerPicker = document.getElementById('ed-layer-picker');

  edMainTabsBar.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', () => switchMainTab(b.dataset.tab));
  });

  edTabsBar.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', () => switchEditorTab(b.dataset.tab));
  });

  document.getElementById('ed-save').onclick = () => edCfg?.onSave();
  document.getElementById('ed-play').onclick = () => edCfg?.onPlay();
  document.getElementById('ed-menu').onclick = () => edCfg?.onMenu();
  document.getElementById('ed-clear').onclick = () => confirmClearLayer();
  document.getElementById('ed-revert').onclick = () => confirmRevert();
  document.getElementById('ed-clear-objects').onclick = () => confirmClearObjects();
  document.getElementById('ed-intro-mode').onclick = () => edCfg?.onIntroMode();

  initToolbar();
  initModal();

  window.__setEditor = (cfg) => { if (!cfg) hideEditor(); else showEditor(cfg); };
  window.__setEditor_updateLayer = (name) => updateLayerHighlight(name);
  window.__setEditor_updateSelected = (gid) => { selectedGid = gid; activeTerrainName = null; highlightSelected(); highlightTerrain(); updateTilePreview(gid); };
  window.__setEditor_updateTerrain = (name) => { activeTerrainName = name; highlightTerrain(); };
  window.__setEditor_updateObjectSelected = (key, frame, type) => { selectedObject = { key, frame, type }; updateObjectPreview(key, frame, type); };
  window.__setEditor_updateMode = (mode) => {
    document.getElementById('ed-spawn').classList.toggle('active', mode === 'spawn');
    document.getElementById('ed-intro-mode').classList.toggle('active', mode === 'intro');
  };
  window.__setEditor_updateSummary = (data) => updateSummary(data);
  window.__setEditor_showToast = (msg, type) => showToast(msg, type);
  window.__setEditor_showLayerPicker = (tx, ty, layers) => renderLayerPicker(tx, ty, layers);
  window.__setEditor_hideLayerPicker = () => hideLayerPicker();
  window.__setEditor_markDirty = (dirty) => markDirty(dirty);
}

function initToolbar() {
  if (!edToolbar) return;
  document.getElementById('ed-tool-undo').onclick = () => edCfg?.onUndo();
  document.getElementById('ed-tool-redo').onclick = () => edCfg?.onRedo();
}

function initModal() {
  edModalCancel.onclick = hideModal;
  edModalConfirm.onclick = () => {
    const cb = edModal._onConfirm;
    hideModal();
    cb?.();
  };
  edModal.onclick = (e) => { if (e.target === edModal) hideModal(); };
}

function showModal(text, onConfirm) {
  edModalText.textContent = text;
  edModal._onConfirm = onConfirm;
  edModal.classList.add('visible');
}

function hideModal() {
  edModal.classList.remove('visible');
  edModal._onConfirm = null;
}

function confirmClearLayer() {
  showModal(`¿Limpiar la capa "${edCfg?.getLayer?.()}"?`, () => edCfg?.onClear?.());
}

function confirmClearObjects() {
  showModal('¿Eliminar todos los objetos del nivel?', () => edCfg?.onClearObjects?.());
}

function confirmRevert() {
  showModal('¿Descartar los cambios y volver al archivo original?', () => edCfg?.onRevert?.());
}

function showToast(msg, type = 'info') {
  if (!edToast) return;
  edToast.textContent = msg;
  edToast.className = `ed-toast ${type} visible`;
  clearTimeout(edToast._timer);
  edToast._timer = setTimeout(() => edToast.classList.remove('visible'), 2200);
}

function markDirty(dirty) {
  isDirty = dirty;
  updateStatusText();
}

function updateStatusText() {
  if (!edCfg) return;
  const layer = edCfg.getLayer?.() ?? '-';
  const dirtyTag = isDirty ? ' · sin guardar' : '';
  edStatus.textContent = `capa: ${layer}${dirtyTag}`;
}

function updateSummary(data) {
  const d = data ?? {};
  const pickups = document.getElementById('ed-sum-pickups');
  const objetos = document.getElementById('ed-sum-objetos');
  const spawn = document.getElementById('ed-sum-spawn');
  if (pickups) pickups.textContent = d.pickups ?? 0;
  if (objetos) objetos.textContent = d.objects ?? 0;
  if (spawn) {
    spawn.textContent = d.hasSpawn ? '✓' : '✗';
    spawn.classList.toggle('missing', !d.hasSpawn);
  }
}

function renderLayerPicker(tx, ty, layers) {
  if (!edLayerPicker || !edCfg) return;
  edLayerPicker.innerHTML = '';
  if (!layers?.length) {
    hideLayerPicker();
    return;
  }

  for (const item of layers) {
    const row = document.createElement('div');
    row.className = 'ed-layer-picker-item';

    const layerBadge = document.createElement('span');
    layerBadge.className = 'ed-layer-picker-type';
    // Para objetos no hay "layer" propio, pero se renderizan sobre el top layer,
    // así que usamos "TOP" como badge (siempre uno de los 5 nombres válidos).
    const badgeLayer = item.type === 'object' ? 'top' : item.layer;
    layerBadge.textContent = badgeLayer.toUpperCase();
    const layerColors = {
      floor:   { bg: 'rgba(80, 200, 120, 0.25)',  fg: '#a0e8b0' },
      path:    { bg: 'rgba(180, 140, 80, 0.25)',  fg: '#e8c890' },
      walls:   { bg: 'rgba(160, 100, 60, 0.25)',  fg: '#e0a878' },
      overlay: { bg: 'rgba(80, 140, 200, 0.25)',  fg: '#a0c8e8' },
      top:     { bg: 'rgba(160, 100, 200, 0.25)', fg: '#d0b0e8' },
    };
    const c = layerColors[badgeLayer] || { bg: 'rgba(128, 128, 128, 0.25)', fg: '#cccccc' };
    layerBadge.style.background = c.bg;
    layerBadge.style.color = c.fg;
    layerBadge.style.padding = '1px 4px';
    layerBadge.style.borderRadius = '3px';
    layerBadge.style.fontSize = '8px';
    layerBadge.style.fontWeight = 'bold';
    layerBadge.style.letterSpacing = '0.5px';
    layerBadge.style.marginRight = '2px';
    row.appendChild(layerBadge);

    const thumb = document.createElement('div');
    thumb.className = 'ed-layer-picker-thumb';

    const label = document.createElement('span');
    label.className = 'ed-layer-picker-label';

    const value = document.createElement('span');
    value.className = 'ed-layer-picker-gid';

    if (item.type === 'object') {
      const { objDef, key, frame } = item;
      let f, imgW, imgH;
      if (objDef.frames) {
        f = objDef.frames[frame] || objDef.frames[0];
        imgW = Math.max(...objDef.frames.map(fr => fr.x + fr.w));
        imgH = Math.max(...objDef.frames.map(fr => fr.y + fr.h));
      } else {
        const cols = objDef.cols;
        const r = Math.floor(frame / cols);
        const c = frame % cols;
        f = { x: c * 16, y: r * 16, w: 16, h: 16 };
        imgW = cols * 16;
        imgH = objDef.rows * 16;
      }
      // Centrar el frame dentro del container .ed-layer-picker-thumb (20x20).
      // THUMB_SIZE debe coincidir con el width/height del CSS.
      const THUMB_SIZE = 20;
      const scale = Math.min(THUMB_SIZE / f.w, THUMB_SIZE / f.h);
      const frameW = f.w * scale;
      const frameH = f.h * scale;
      const offsetX = (THUMB_SIZE - frameW) / 2 - f.x * scale;
      const offsetY = (THUMB_SIZE - frameH) / 2 - f.y * scale;
      thumb.style.backgroundImage = `url("${objDef.url}")`;
      thumb.style.backgroundSize = `${imgW * scale}px ${imgH * scale}px`;
      thumb.style.backgroundPosition = `${offsetX}px ${offsetY}px`;
      label.textContent = key;
      value.textContent = `f${frame}`;
    } else {
      const { layer, gid, tileset } = item;
      if (tileset) {
        const localIdx = gid - tileset.firstgid;
        const r = Math.floor(localIdx / tileset.cols);
        const c = localIdx % tileset.cols;
        thumb.style.backgroundImage = `url("${tileset.url}")`;
        thumb.style.backgroundSize = `${tileset.cols * 20}px ${tileset.rows * 20}px`;
        thumb.style.backgroundPosition = `-${c * 20}px -${r * 20}px`;
      }
      label.textContent = tileset?.label || tileset?.name || layer;
      value.textContent = `GID ${gid}`;
    }

    row.appendChild(thumb);
    row.appendChild(label);
    row.appendChild(value);
    edLayerPicker.appendChild(row);
  }

  edLayerPicker.classList.add('visible');
  const canvas = document.querySelector('canvas');
  const rect = canvas?.getBoundingClientRect();
  if (rect) {
    const scaleX = canvas.width > 0 ? rect.width / canvas.width : 1;
    const scaleY = canvas.height > 0 ? rect.height / canvas.height : 1;
    const cellLeft = rect.left + (tx * 16) * scaleX;
    const py = rect.top + (ty * 16) * scaleY;
    // Preferir izquierda de la celda. Si no entra, caer a la derecha.
    const pickerWidth = edLayerPicker.offsetWidth || 160;
    const gap = 8 * scaleX;
    const leftPx = cellLeft - pickerWidth - gap;
    const rightPx = cellLeft + 16 * scaleX + gap;
    const px = leftPx >= 4 ? leftPx : rightPx;
    edLayerPicker.style.left = `${Math.min(Math.max(px, 4), window.innerWidth - pickerWidth - 4)}px`;
    edLayerPicker.style.top = `${Math.min(Math.max(py, 4), window.innerHeight - edLayerPicker.offsetHeight - 10)}px`;
  }
}

function hideLayerPicker() {
  edLayerPicker?.classList.remove('visible');
}

function hideEditor() {
  edPanel.style.display = 'none';
  edTabs.innerHTML = '';
  edPalette.innerHTML = '';
  document.getElementById('ed-tileset-categories').innerHTML = '';
  document.getElementById('ed-obj-tabs').innerHTML = '';
  document.getElementById('ed-obj-palette').innerHTML = '';
  document.getElementById('ed-variant-switches').innerHTML = '';
  activeEditorTab = 'tileset';
  activeMainTab = 'assets';
  selectedObject = { key: null, frame: 0, type: 'deco' };
  isDirty = false;
  hideLayerPicker();
  renderTabs();
  edCfg = null;
}

function showEditor(cfg) {
  edCfg = cfg;
  edPanel.style.display = 'flex';
  edTitle.textContent = `Editor — ${cfg.levelKey}`;
  updateStatusText();

  activeTerrainName = null;
  selectedGid = 0;
  selectedObject = { key: null, frame: 0, type: 'deco' };
  isDirty = false;

  activeTilesetCategory = 'grass';
  activeTilesetIdx = cfg.tilesets.findIndex(t => t.category === 'grass');
  renderTilesetCategories(cfg);
  renderTilesetTabs(cfg);

  renderTabs();
  clearPreview();

  edLayersBar.querySelectorAll('button').forEach(b => {
    b.onclick = () => cfg.onLayer(b.dataset.layer);
  });
  updateLayerHighlight(cfg.getLayer());

  activeObjType = 'deco';
  activeObjTabIdx = 0;
  activeGroup = null;
  activeVariant = {};
  document.getElementById('ed-obj-type').querySelectorAll('button').forEach(b => {
    b.classList.toggle('active', b.dataset.objtype === activeObjType);
    b.onclick = () => {
      activeObjType = b.dataset.objtype;
      highlightObjType();
      edCfg?.onObjectTypeChange?.(activeObjType);
    };
  });
  renderObjCategories(cfg);
  renderObjTabs(cfg);

  document.getElementById('ed-spawn').onclick = () => cfg.onSpawnMode();

  renderWeatherControls(cfg);
  updateSummary(cfg.getSummary?.());
}

function renderTabs() {
  if (!edTabsBar) return;
  edMainTabsBar?.querySelectorAll('button').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === activeMainTab);
  });
  edTabsBar.querySelectorAll('button').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === activeEditorTab);
  });
  edTilesetPanel?.classList.toggle('active', activeEditorTab === 'tileset');
  edObjectsPanel?.classList.toggle('active', activeEditorTab === 'objects');
  edAssetsPanel?.classList.toggle('active', activeMainTab === 'assets');
  edWeatherPanel?.classList.toggle('active', activeMainTab === 'weather');
}

function switchEditorTab(tab) {
  if (!['tileset', 'objects'].includes(tab)) return;
  activeEditorTab = tab;
  renderTabs();
  updatePreviewForActiveTab();
  edCfg?.onTabChange?.(tab);
}

function switchMainTab(tab) {
  if (!['assets', 'weather'].includes(tab)) return;
  if (activeMainTab === tab) return;
  activeMainTab = tab;
  renderTabs();
  updatePreviewForActiveTab();
}

function updatePreviewForActiveTab() {
  if (activeEditorTab === 'tileset') {
    if (selectedGid) updateTilePreview(selectedGid);
    else clearPreview();
  } else {
    if (selectedObject.key) updateObjectPreview(selectedObject.key, selectedObject.frame, selectedObject.type);
    else clearPreview();
  }
}

function clearPreview() {
  if (!edPreviewImage || !edPreviewInfo) return;
  edPreviewImage.style.backgroundImage = '';
  edPreviewImage.style.width = '';
  edPreviewImage.style.height = '';
  edPreviewInfo.innerHTML = '<div class="ed-preview-placeholder">Seleccioná un tile u objeto para previsualizarlo</div>';
}

function updateTilePreview(gid) {
  if (!edCfg || !edPreviewImage || !edPreviewInfo) return;
  if (!gid) { clearPreview(); return; }

  const t = edCfg.tilesets[activeTilesetIdx];
  if (!t) { clearPreview(); return; }

  const localIdx = gid - t.firstgid;
  const row = Math.floor(localIdx / t.cols);
  const col = localIdx % t.cols;

  edPreviewImage.style.backgroundImage = `url("${t.url}")`;
  edPreviewImage.style.backgroundSize = `${t.cols * 24}px ${t.rows * 24}px`;
  edPreviewImage.style.backgroundPosition = `-${col * 24}px -${row * 24}px`;

  edPreviewInfo.innerHTML = `
    <div class="ed-preview-title">${t.label}</div>
    <div>GID ${gid}</div>
    <div>${t.name} #${localIdx} (${col}, ${row})</div>
  `;
}

function updateObjectPreview(key, frame, type) {
  if (!edCfg || !edPreviewImage || !edPreviewInfo) return;
  if (!key) { clearPreview(); return; }

  const objDef = edCfg.objects.find(obj => obj.key === key);
  if (!objDef) { clearPreview(); return; }

  let f, imgW, imgH;
  if (objDef.frames) {
    f = objDef.frames[frame] || objDef.frames[0];
    imgW = Math.max(...objDef.frames.map(fr => fr.x + fr.w));
    imgH = Math.max(...objDef.frames.map(fr => fr.y + fr.h));
  } else {
    const cols = objDef.cols;
    const row = Math.floor(frame / cols);
    const col = frame % cols;
    f = { x: col * 16, y: row * 16, w: 16, h: 16 };
    imgW = cols * 16;
    imgH = objDef.rows * 16;
  }

  const scale = Math.min(80 / f.w, 80 / f.h);
  const dispW = f.w * scale;
  const dispH = f.h * scale;

  edPreviewImage.style.backgroundImage = `url("${objDef.url}")`;
  edPreviewImage.style.backgroundSize = `${imgW * scale}px ${imgH * scale}px`;
  edPreviewImage.style.backgroundPosition = `-${f.x * scale}px -${f.y * scale}px`;
  edPreviewImage.style.width = `${dispW}px`;
  edPreviewImage.style.height = `${dispH}px`;

  edPreviewInfo.innerHTML = `
    <div class="ed-preview-title">${objDef.label}</div>
    <div>key: ${objDef.key}</div>
    <div>frame ${frame}</div>
    <div>tipo: ${type}</div>
  `;
}

function updateAutotileButton(cfg) {
  const row = document.getElementById('ed-autotile-row');
  const btn = document.getElementById('ed-autotile-btn');
  if (!row || !btn) return;

  const tileset = cfg.tilesets[activeTilesetIdx];
  const terrain = cfg.terrains.find(t => t.tilesetName === tileset?.name);
  if (!terrain) {
    row.style.display = 'none';
    btn.classList.remove('active');
    btn.dataset.terrain = '';
    btn.onclick = null;
    return;
  }

  row.style.display = 'flex';
  btn.dataset.terrain = terrain.name;
  btn.onclick = () => {
    if (activeTerrainName === terrain.name) {
      activeTerrainName = null;
      cfg.onTerrain(null);
    } else {
      activeTerrainName = terrain.name;
      cfg.onTerrain(terrain);
    }
    highlightTerrain();
  };
  highlightTerrain();
}

function highlightTerrain() {
  const btn = document.getElementById('ed-autotile-btn');
  if (!btn) return;
  btn.classList.toggle('active', btn.dataset.terrain === (activeTerrainName ?? ''));
}

function renderPalette() {
  if (!edCfg) return;
  edPalette.innerHTML = '';
  edTabs.querySelectorAll('button').forEach(b =>
    b.classList.toggle('active', +b.dataset.idx === activeTilesetIdx));

  const t = edCfg.tilesets[activeTilesetIdx];
  edPalette.style.setProperty('--cols', t.cols);

  const eraser = document.createElement('div');
  eraser.className = 'ed-tile eraser';
  eraser.textContent = '✕';
  eraser.title = 'Borrar (GID 0)';
  eraser.addEventListener('click', () => setSelected(0));
  edPalette.appendChild(eraser);

    for (let r = 0; r < t.rows; r++) {
      for (let c = 0; c < t.cols; c++) {
        const gid = t.firstgid + r * t.cols + c;
        const d = document.createElement('div');
        d.className = 'ed-tile';
        d.dataset.gid = gid;
        d.style.backgroundImage = `url("${t.url}")`;
        d.style.backgroundSize = `${t.cols * 24}px ${t.rows * 24}px`;
        d.style.backgroundPosition = `-${c * 24}px -${r * 24}px`;
      d.title = `${t.name} #${r * t.cols + c} (gid ${gid})`;
      d.addEventListener('click', () => setSelected(gid));
      edPalette.appendChild(d);
    }
  }
  highlightSelected();
}

function renderTilesetCategories(cfg) {
  const catEl = document.getElementById('ed-tileset-categories');
  if (!catEl) return;
  catEl.innerHTML = '';
  for (const [key, info] of Object.entries(cfg.tilesetCategories)) {
    const b = document.createElement('button');
    b.textContent = info.label;
    b.dataset.category = key;
    b.addEventListener('click', () => {
      activeTilesetCategory = key;
      activeTilesetIdx = cfg.tilesets.findIndex(t => t.category === key);
      renderTilesetCategories(cfg);
      renderTilesetTabs(cfg);
    });
    catEl.appendChild(b);
  }
  catEl.querySelectorAll('button').forEach(b => {
    b.classList.toggle('active', b.dataset.category === activeTilesetCategory);
  });
}

function renderTilesetTabs(cfg) {
  edTabs.innerHTML = '';
  cfg.tilesets.forEach((t, i) => {
    if (t.category !== activeTilesetCategory) return;
    const b = document.createElement('button');
    b.textContent = t.label;
    b.dataset.idx = i;
    b.addEventListener('click', () => {
      activeTilesetIdx = i;
      renderPalette();
      if (activeTerrainName) {
        activeTerrainName = null;
        edCfg?.onTerrain(null);
      }
      updateAutotileButton(cfg);
    });
    edTabs.appendChild(b);
  });
  renderPalette();

  if (activeTerrainName) {
    activeTerrainName = null;
    edCfg?.onTerrain(null);
  }
  updateAutotileButton(cfg);
}

function setSelected(gid) {
  selectedGid = gid;
  activeTerrainName = null;
  highlightSelected();
  highlightTerrain();
  edCfg?.onSelect(gid);
}

function highlightSelected() {
  edPalette.querySelectorAll('.ed-tile').forEach(el => {
    const g = el.dataset.gid ? +el.dataset.gid : 0;
    el.classList.toggle('selected', g === selectedGid);
  });
}

function updateLayerHighlight(name) {
  edLayersBar.querySelectorAll('button').forEach(b =>
    b.classList.toggle('active', b.dataset.layer === name));
  updateStatusText();
}

function highlightObjType() {
  document.getElementById('ed-obj-type').querySelectorAll('button').forEach(b => {
    b.classList.toggle('active', b.dataset.objtype === activeObjType);
  });
}

function renderObjCategories(cfg) {
  const catEl = document.getElementById('ed-obj-categories');
  if (!catEl) return;
  catEl.innerHTML = '';
  for (const [key, info] of Object.entries(cfg.categories)) {
    const b = document.createElement('button');
    b.textContent = info.label;
    b.dataset.category = key;
    b.addEventListener('click', () => {
      activeObjCategory = key;
      activeObjTabIdx = 0;
      activeGroup = null;
      activeVariant = {};
      renderObjCategories(cfg);
      renderObjTabs(cfg);
    });
    catEl.appendChild(b);
  }
  catEl.querySelectorAll('button').forEach(b => {
    b.classList.toggle('active', b.dataset.category === activeObjCategory);
  });
}

function getCategoryObjects() {
  if (!edCfg) return [];
  return edCfg.objects.filter(o => o.category === activeObjCategory);
}

function getGroupEntries() {
  const objs = getCategoryObjects();
  const groups = new Map();
  const singles = [];
  for (const o of objs) {
    if (o.group && edCfg.variantDefs[o.group]) {
      if (!groups.has(o.group)) groups.set(o.group, []);
      groups.get(o.group).push(o);
    } else {
      singles.push(o);
    }
  }
  const entries = [];
  for (const [groupKey, groupObjs] of groups) {
    entries.push({ type: 'group', key: groupKey, def: edCfg.variantDefs[groupKey], objects: groupObjs });
  }
  for (const o of singles) {
    entries.push({ type: 'single', object: o });
  }
  return entries;
}

function renderObjTabs(cfg) {
  const objTabsEl = document.getElementById('ed-obj-tabs');
  objTabsEl.innerHTML = '';
  const entries = getGroupEntries();

  const currentEntry = entries[activeObjTabIdx];
  if (currentEntry?.type === 'group' && !activeGroup) {
    activeGroup = currentEntry.key;
    activeVariant = { ...currentEntry.objects[0].variant };
  } else if (currentEntry?.type === 'single') {
    activeGroup = null;
    activeVariant = {};
  }

  entries.forEach((entry, i) => {
    const b = document.createElement('button');
    b.textContent = entry.type === 'group' ? entry.def.label : entry.object.label;
    b.addEventListener('click', () => {
      activeObjTabIdx = i;
      if (entry.type === 'group') {
        activeGroup = entry.key;
        const firstObj = entry.objects[0];
        activeVariant = { ...firstObj.variant };
      } else {
        activeGroup = null;
        activeVariant = {};
      }
      renderObjTabs(cfg);
      renderVariantSwitches();
      renderObjPalette();
    });
    objTabsEl.appendChild(b);
  });
  renderVariantSwitches();
  renderObjPalette();
}

function renderVariantSwitches() {
  const container = document.getElementById('ed-variant-switches');
  container.innerHTML = '';
  if (!activeGroup || !edCfg?.variantDefs[activeGroup]) return;

  const def = edCfg.variantDefs[activeGroup];
  const groupObjs = edCfg.objects.filter(o => o.category === activeObjCategory && o.group === activeGroup);

  for (const dim of def.dimensions) {
    const dimEl = document.createElement('div');
    dimEl.className = 'ed-variant-dimension';

    const label = document.createElement('span');
    label.className = 'ed-variant-label';
    label.textContent = dim.label;
    dimEl.appendChild(label);

    const optionsEl = document.createElement('div');
    optionsEl.className = 'ed-variant-options';

    for (const opt of dim.options) {
      const btn = document.createElement('button');
      btn.className = 'ed-variant-btn';
      btn.textContent = opt.label;

      const testVariant = { ...activeVariant, [dim.key]: opt.value };
      const exists = groupObjs.some(o => {
        for (const [k, v] of Object.entries(testVariant)) {
          if (o.variant[k] !== v) return false;
        }
        return true;
      });

      const isActive = activeVariant[dim.key] === opt.value;
      btn.classList.toggle('active', isActive);
      btn.disabled = !exists;

      btn.addEventListener('click', () => {
        if (!exists) return;
        activeVariant[dim.key] = opt.value;
        for (const otherDim of def.dimensions) {
          if (otherDim.key === dim.key) continue;
          const testVar = { ...activeVariant };
          const valid = groupObjs.some(o => {
            for (const [k, v] of Object.entries(testVar)) {
              if (o.variant[k] !== v) return false;
            }
            return true;
          });
          if (!valid) {
            for (const otherOpt of otherDim.options) {
              const testVar2 = { ...activeVariant, [otherDim.key]: otherOpt.value };
              const valid2 = groupObjs.some(o => {
                for (const [k, v] of Object.entries(testVar2)) {
                  if (o.variant[k] !== v) return false;
                }
                return true;
              });
              if (valid2) {
                activeVariant[otherDim.key] = otherOpt.value;
                break;
              }
            }
          }
        }
        renderVariantSwitches();
        renderObjPalette();
      });

      optionsEl.appendChild(btn);
    }

    dimEl.appendChild(optionsEl);
    container.appendChild(dimEl);
  }
}

function findVariantObject() {
  if (!activeGroup) return null;
  return edCfg.objects.find(o =>
    o.category === activeObjCategory &&
    o.group === activeGroup &&
    Object.entries(activeVariant).every(([k, v]) => o.variant[k] === v)
  ) || null;
}

function renderObjPalette() {
  if (!edCfg) return;
  const objPalette = document.getElementById('ed-obj-palette');
  const objTabsEl = document.getElementById('ed-obj-tabs');
  objPalette.innerHTML = '';
  objTabsEl.querySelectorAll('button').forEach((b, i) =>
    b.classList.toggle('active', i === activeObjTabIdx));

  let o;
  if (activeGroup) {
    o = findVariantObject();
  } else {
    const entries = getGroupEntries();
    const entry = entries[activeObjTabIdx];
    if (!entry) return;
    o = entry.type === 'single' ? entry.object : null;
  }

  if (!o) {
    const placeholder = document.createElement('div');
    placeholder.textContent = 'Variante no disponible';
    placeholder.style.color = 'rgba(90,58,26,.6)';
    placeholder.style.fontSize = '10px';
    placeholder.style.padding = '8px';
    objPalette.appendChild(placeholder);
    return;
  }

  if (o.frames) {
    const imgW = Math.max(...o.frames.map(f => f.x + f.w));
    const imgH = Math.max(...o.frames.map(f => f.y + f.h));
    objPalette.style.setProperty('--cols', Math.max(1, Math.floor(imgW / 16)));

    for (let i = 0; i < o.frames.length; i++) {
      const f = o.frames[i];
      const scale = Math.min(24 / f.w, 24 / f.h);
      const dispW = f.w * scale;
      const dispH = f.h * scale;

      const d = document.createElement('div');
      d.className = 'ed-tile';
      d.style.display = 'flex';
      d.style.justifyContent = 'center';
      d.style.alignItems = 'center';
      d.title = `${o.label} frame ${i} (${f.w}×${f.h})`;

      const inner = document.createElement('div');
      inner.style.width = `${dispW}px`;
      inner.style.height = `${dispH}px`;
      inner.style.backgroundImage = `url("${o.url}")`;
      inner.style.backgroundSize = `${imgW * scale}px ${imgH * scale}px`;
      inner.style.backgroundPosition = `-${f.x * scale}px -${f.y * scale}px`;
      inner.style.backgroundRepeat = 'no-repeat';
      inner.style.imageRendering = 'pixelated';

      d.appendChild(inner);
      d.addEventListener('click', () => edCfg.onObjectSelect(o.key, i, activeObjType));
      objPalette.appendChild(d);
    }
  } else {
    objPalette.style.setProperty('--cols', o.cols);
    for (let r = 0; r < (o.editorRows ?? o.rows); r++) {
      for (let c = 0; c < o.cols; c++) {
        const frame = r * o.cols + c;
        const d = document.createElement('div');
        d.className = 'ed-tile';
        d.style.backgroundImage = `url("${o.url}")`;
        d.style.backgroundSize = `${o.cols * 24}px ${o.rows * 24}px`;
        d.style.backgroundPosition = `-${c * 24}px -${r * 24}px`;
        d.title = `${o.label} frame ${frame}`;
        d.addEventListener('click', () => edCfg.onObjectSelect(o.key, frame, activeObjType));
        objPalette.appendChild(d);
      }
    }
  }
}

function renderWeatherControls(cfg) {
  const listEl = document.getElementById('ed-weather-list');
  if (!listEl) return;

  const weather = cfg.getWeather?.() ?? { rain: 0, snow: 0, pollen: 0, leaves: 0, night: 0 };

  listEl.querySelectorAll('.ed-weather-item').forEach(item => {
    const type = item.dataset.weather;
    const upBtn = item.querySelector('.ed-weather-up');
    const downBtn = item.querySelector('.ed-weather-down');
    const valSpan = item.querySelector('.ed-weather-val');
    if (!upBtn || !downBtn || !valSpan) return;

    let v = Math.min(1, Math.max(0, weather[type] ?? 0));
    valSpan.textContent = v.toFixed(1);
    item.classList.toggle('active', v > 0);

    const update = (delta) => {
      v = Math.min(1, Math.max(0, Math.round((v + delta) * 10) / 10));
      valSpan.textContent = v.toFixed(1);
      item.classList.toggle('active', v > 0);
      const updated = { ...cfg.getWeather?.() };
      updated[type] = v;
      cfg.onWeatherChange?.(updated);
    };

    upBtn.onclick = () => update(0.1);
    downBtn.onclick = () => update(-0.1);
  });
}
