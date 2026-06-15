import { WEATHER_TYPES, getWeatherLabel, getDefaultWeather } from '../engine/level/WeatherSystem.js';

const WEATHER_HEX = {
  rain:   '#ddeeff',
  snow:   '#ffffff',
  pollen: '#fff0aa',
  leaves: '#8b5a2b',
  night:  '#0a0a1a',
  fog:    '#cccccc',
  dust:   '#c2a374',
  wind:   '#ddeeff',
  storm:  '#556677',
};

const WX_SVG = {
  rain:   `<svg viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><g fill="currentColor"><rect x="5" y="0" width="1" height="3" transform="rotate(25 5.5 1.5)"/><rect x="2" y="1" width="1" height="3" transform="rotate(25 2.5 2.5)"/><rect x="6" y="4" width="1" height="3" transform="rotate(25 6.5 5.5)"/><rect x="3" y="5" width="1" height="3" transform="rotate(25 3.5 6.5)"/></g></svg>`,
  snow:   `<svg viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><g fill="currentColor"><rect x="3" y="0" width="2" height="2"/><rect x="3" y="6" width="2" height="2"/><rect x="0" y="3" width="2" height="2"/><rect x="6" y="3" width="2" height="2"/><rect x="1" y="1" width="1" height="1"/><rect x="6" y="1" width="1" height="1"/><rect x="1" y="6" width="1" height="1"/><rect x="6" y="6" width="1" height="1"/><rect x="3" y="3" width="2" height="2"/></g></svg>`,
  pollen: `<svg viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><g fill="currentColor"><rect x="2" y="0" width="1" height="1"/><rect x="5" y="1" width="1" height="1"/><rect x="1" y="3" width="1" height="1"/><rect x="6" y="4" width="1" height="1"/><rect x="3" y="6" width="1" height="1"/><rect x="0" y="7" width="1" height="1"/></g></svg>`,
  leaves: `<svg viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><g fill="currentColor"><path d="M4 0 L5 1 L6 0 L7 2 L6 3 L7 4 L6 6 L5 5 L4 7 L3 5 L2 6 L1 4 L2 3 L1 2 L2 0 L3 1 Z"/><rect x="3" y="5" width="2" height="3"/></g></svg>`,
  night:  `<svg viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><g fill="currentColor"><path d="M6 0 A5 5 0 1 0 6 8 A4 4 0 1 1 6 0 Z"/><rect x="1" y="2" width="1" height="1"/><rect x="2" y="6" width="1" height="1"/><rect x="7" y="3" width="1" height="1"/></g></svg>`,
  fog:    `<svg viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><g fill="currentColor" opacity="0.7"><rect x="0" y="1" width="6" height="1"/><rect x="2" y="3" width="6" height="1"/><rect x="0" y="5" width="7" height="1"/><rect x="1" y="7" width="5" height="1"/></g></svg>`,
  dust:   `<svg viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><g fill="currentColor"><rect x="0" y="1" width="1" height="1"/><rect x="3" y="0" width="1" height="1"/><rect x="6" y="2" width="1" height="1"/><rect x="1" y="4" width="1" height="1"/><rect x="5" y="5" width="1" height="1"/><rect x="2" y="7" width="1" height="1"/><rect x="7" y="7" width="1" height="1"/></g></svg>`,
  wind:   `<svg viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><g fill="currentColor"><rect x="0" y="2" width="6" height="1"/><rect x="1" y="5" width="5" height="1"/><rect x="2" y="3" width="1" height="1"/><rect x="5" y="6" width="1" height="1"/></g></svg>`,
  storm:  `<svg viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><g fill="currentColor"><path d="M4 0 L6 0 L5 3 L7 3 L3 8 L4 5 L2 5 Z"/><rect x="1" y="2" width="1" height="1"/><rect x="7" y="5" width="1" height="1"/></g></svg>`,
};

const WX_PRESET_SVG = {
  clear:    `<svg viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><g fill="currentColor"><circle cx="4" cy="4" r="2"/><rect x="3" y="0" width="2" height="1"/><rect x="3" y="7" width="2" height="1"/><rect x="0" y="3" width="1" height="2"/><rect x="7" y="3" width="1" height="2"/><rect x="1" y="1" width="1" height="1"/><rect x="6" y="1" width="1" height="1"/><rect x="1" y="6" width="1" height="1"/><rect x="6" y="6" width="1" height="1"/></g></svg>`,
  drizzle:  WX_SVG.rain,
  rain:     `<svg viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><g fill="currentColor"><rect x="0" y="0" width="8" height="2"/><rect x="1" y="3" width="1" height="2"/><rect x="3" y="3" width="1" height="3"/><rect x="5" y="3" width="1" height="2"/><rect x="2" y="7" width="1" height="1"/><rect x="4" y="6" width="1" height="2"/></g><path d="M0 0 H2 V1 H1 V2 H0 Z M5 0 H7 V1 H6 V2 H5 Z" fill="currentColor"/></svg>`,
  storm:    WX_SVG.storm,
  spring:   WX_SVG.pollen,
  autumn:   WX_SVG.leaves,
  night:    WX_SVG.night,
};

const WEATHER_PRESETS = [
  { key: 'clear',   label: 'Despejado', svg: WX_PRESET_SVG.clear,   values: { rain: 0, snow: 0, pollen: 0, leaves: 0, night: 0, fog: 0, dust: 0, wind: 0, storm: 0 } },
  { key: 'drizzle', label: 'Llovizna',  svg: WX_PRESET_SVG.drizzle, values: { rain: 0.3, snow: 0, pollen: 0, leaves: 0, night: 0, fog: 0.2, dust: 0, wind: 0, storm: 0 } },
  { key: 'rain',    label: 'Lluvia',    svg: WX_PRESET_SVG.rain,    values: { rain: 0.6, snow: 0, pollen: 0, leaves: 0, night: 0, fog: 0, dust: 0, wind: 0.2, storm: 0 } },
  { key: 'storm',   label: 'Tormenta',  svg: WX_PRESET_SVG.storm,   values: { rain: 0.7, snow: 0, pollen: 0, leaves: 0, night: 0.2, fog: 0, dust: 0, wind: 0.4, storm: 0.5 } },
  { key: 'spring',  label: 'Primavera', svg: WX_PRESET_SVG.spring,  values: { rain: 0, snow: 0, pollen: 0.4, leaves: 0, night: 0, fog: 0, dust: 0, wind: 0.1, storm: 0 } },
  { key: 'autumn',  label: 'Otoño',     svg: WX_PRESET_SVG.autumn,  values: { rain: 0, snow: 0, pollen: 0, leaves: 0.5, night: 0, fog: 0, dust: 0, wind: 0.3, storm: 0 } },
  { key: 'night',   label: 'Noche',     svg: WX_PRESET_SVG.night,   values: { rain: 0, snow: 0, pollen: 0, leaves: 0, night: 0.5, fog: 0, dust: 0, wind: 0, storm: 0 } },
];

let edPanel, edTitle, edStatus, edTabs, edPalette, edLayersBar;
let edMainTabsBar, edAssetsPanel, edWeatherPanel;
let edTabsBar, edTilesetPanel, edObjectsPanel;
let edToolbar, edSummary, edToast, edModal, edModalText, edModalConfirm, edModalCancel;
let edLayerPicker;
let edHoverPreview;
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
  edToolbar = document.getElementById('ed-toolbar');
  edSummary = document.getElementById('ed-summary');
  edToast = document.getElementById('ed-toast');
  edModal = document.getElementById('ed-modal');
  edModalText = document.getElementById('ed-modal-text');
  edModalConfirm = document.getElementById('ed-modal-confirm');
  edModalCancel = document.getElementById('ed-modal-cancel');
  edLayerPicker = document.getElementById('ed-layer-picker');
  edHoverPreview = document.getElementById('ed-tile-hover-preview');

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
  initHoverPreview();

  window.__setEditor = (cfg) => { if (!cfg) hideEditor(); else showEditor(cfg); };
  window.__setEditor_updateLayer = (name) => updateLayerHighlight(name);
  window.__setEditor_updateSelected = (gid) => { selectedGid = gid; activeTerrainName = null; highlightSelected(); highlightTerrain(); };
  window.__setEditor_updateTerrain = (name) => { activeTerrainName = name; highlightTerrain(); };
  window.__setEditor_updateObjectSelected = (key, frame, type) => { selectedObject = { key, frame, type }; };
  window.__setEditor_syncObjectFromCanvas = (objDef, frame, objType) => {
    if (!edCfg || !objDef) return;
    activeEditorTab = 'objects';
    selectedObject = { key: objDef.key, frame, type: objType };
    activeObjType = objType;
    activeObjCategory = objDef.category;
    activeObjTabIdx = findEntryIndexForObject(objDef);
    activeGroup = objDef.group ?? null;
    activeVariant = objDef.group ? { ...(objDef.variant ?? {}) } : {};
    renderTabs();
    renderObjCategories(edCfg);
    renderObjTabs(edCfg);
    highlightObjType();
  };
  window.__setEditor_syncTileFromCanvas = (gid) => {
    if (!edCfg) return;
    const tileset = edCfg.getTilesetForGid?.(gid);
    if (!tileset) return;
    activeEditorTab = 'tileset';
    activeTilesetCategory = tileset.category;
    activeTilesetIdx = edCfg.tilesets.findIndex(t => t === tileset);
    selectedGid = gid;
    activeTerrainName = null;
    renderTabs();
    renderTilesetCategories(edCfg);
    renderTilesetTabs(edCfg);
    highlightSelected();
    highlightTerrain();
  };
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

    // THUMB_SIZE (20) debe coincidir con .ed-layer-picker-thumb { width/height } en editor.css.
    const THUMB_SIZE = 20;
    let fingerprint = null;
    if (item.type === 'object') {
      const { objDef, key, frame } = item;
      fingerprint = getFrameRectInImage(objDef, frame);
      label.textContent = key;
      value.textContent = `f${frame}`;
    } else {
      const { layer, gid, tileset } = item;
      if (tileset) fingerprint = getTilesetFrameRect(tileset, gid);
      label.textContent = tileset?.label || tileset?.name || layer;
      value.textContent = `GID ${gid}`;
    }

    if (fingerprint) {
      const innerStyle = buildFrameThumbnailStyle(fingerprint, THUMB_SIZE);
      const inner = document.createElement('div');
      inner.style.width = innerStyle.width;
      inner.style.height = innerStyle.height;
      inner.style.backgroundImage = innerStyle.backgroundImage;
      inner.style.backgroundSize = innerStyle.backgroundSize;
      inner.style.backgroundPosition = innerStyle.backgroundPosition;
      inner.style.backgroundRepeat = 'no-repeat';
      inner.style.imageRendering = 'pixelated';
      inner.style.pointerEvents = 'none';
      thumb.appendChild(inner);
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
  hideTileHoverPreview();
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
  edCfg?.onTabChange?.(tab);
}

function switchMainTab(tab) {
  if (!['assets', 'weather'].includes(tab)) return;
  if (activeMainTab === tab) return;
  activeMainTab = tab;
  renderTabs();
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

function findEntryIndexForObject(objDef) {
  const entries = getGroupEntries();
  if (objDef.group && edCfg.variantDefs[objDef.group]) {
    return entries.findIndex(e => e.type === 'group' && e.key === objDef.group);
  }
  return entries.findIndex(e => e.type === 'single' && e.object.key === objDef.key);
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
      const fingerprint = getFrameRectInImage(o, i);
      const style = buildFrameThumbnailStyle(fingerprint, 24);

      const d = document.createElement('div');
      d.className = 'ed-tile';
      d.dataset.key = o.key;
      d.dataset.frame = i;
      d.style.display = 'flex';
      d.style.justifyContent = 'center';
      d.style.alignItems = 'center';
      d.title = `${o.label} frame ${i} (${fingerprint.f.w}×${fingerprint.f.h})`;

      const inner = document.createElement('div');
      inner.style.width = style.width;
      inner.style.height = style.height;
      inner.style.backgroundImage = style.backgroundImage;
      inner.style.backgroundSize = style.backgroundSize;
      inner.style.backgroundPosition = style.backgroundPosition;
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
        const fingerprint = getFrameRectInImage(o, frame);
        const style = buildFrameThumbnailStyle(fingerprint, 24);

        const d = document.createElement('div');
        d.className = 'ed-tile';
        d.dataset.key = o.key;
        d.dataset.frame = frame;
        d.style.backgroundImage = style.backgroundImage;
        d.style.backgroundSize = style.backgroundSize;
        d.style.backgroundPosition = style.backgroundPosition;
        d.title = `${o.label} frame ${frame}`;
        d.addEventListener('click', () => edCfg.onObjectSelect(o.key, frame, activeObjType));
        objPalette.appendChild(d);
      }
    }
  }
}

function _clampWeather(v) {
  return Math.min(1, Math.max(0, Math.round((v ?? 0) * 10) / 10));
}

function _normalizeWeather(raw) {
  const base = getDefaultWeather();
  for (const t of WEATHER_TYPES) base[t] = _clampWeather(raw?.[t] ?? 0);
  return base;
}

function _setSliderVisual(sliderEl, v) {
  const pct = Math.max(0, Math.min(1, v)) * 100;
  const fill = sliderEl.querySelector('.ed-wx-fill');
  const thumb = sliderEl.querySelector('.ed-wx-thumb');
  if (fill) fill.style.width = `${pct}%`;
  if (thumb) thumb.style.left = `${pct}%`;
  const range = sliderEl.querySelector('input[type="range"]');
  if (range) range.value = v;
}

function _setCardActive(item, v) {
  item.classList.toggle('active', v > 0);
  const icon = item.querySelector('.ed-wx-icon');
  if (icon) {
    icon.classList.toggle('ed-wx-icon--on', true);
    icon.classList.toggle('ed-wx-icon--off', v <= 0);
  }
  const valEl = item.querySelector('.ed-wx-val');
  if (valEl) valEl.textContent = v.toFixed(1);
}

function _commitWeatherValue(cfg, item, type, v) {
  const clamped = _clampWeather(v);
  const updated = { ...(cfg.getWeather?.() ?? getDefaultWeather()) };
  updated[type] = clamped;
  if (item) _setCardActive(item, clamped);
  const slider = item?.querySelector('.ed-wx-slider');
  if (slider) _setSliderVisual(slider, clamped);
  cfg.onWeatherChange?.(updated);
}

function _commitAllWeather(cfg, values) {
  const updated = { ...(cfg.getWeather?.() ?? getDefaultWeather()), ...values };
  for (const t of WEATHER_TYPES) updated[t] = _clampWeather(updated[t] ?? 0);
  const listEl = document.getElementById('ed-weather-list');
  listEl?.querySelectorAll('.ed-weather-item').forEach(item => {
    const type = item.dataset.weather;
    const v = updated[type] ?? 0;
    _setCardActive(item, v);
    const slider = item.querySelector('.ed-wx-slider');
    if (slider) _setSliderVisual(slider, v);
  });
  cfg.onWeatherChange?.(updated);
}

function _attachSliderHandlers(cfg, item, type) {
  const slider = item.querySelector('.ed-wx-slider');
  const thumb = item.querySelector('.ed-wx-thumb');
  const range = item.querySelector('input[type="range"]');
  if (!slider || !thumb) return;

  const computeValue = (clientX) => {
    const r = slider.getBoundingClientRect();
    const rel = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    return _clampWeather(rel);
  };

  let dragging = false;
  let pointerId = null;

  slider.addEventListener('pointerdown', (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    const v = computeValue(e.clientX);
    if (e.shiftKey) {
      _commitWeatherValue(cfg, item, type, 0.5);
    } else {
      _setCardActive(item, v);
      _setSliderVisual(slider, v);
      dragging = true;
      pointerId = e.pointerId;
      try { slider.setPointerCapture(e.pointerId); } catch (_) {}
    }
    e.preventDefault();
  });

  slider.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const v = computeValue(e.clientX);
    _setCardActive(item, v);
    _setSliderVisual(slider, v);
  });

  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    if (pointerId !== null) {
      try { slider.releasePointerCapture(pointerId); } catch (_) {}
      pointerId = null;
    }
    const v = computeValue(e.clientX);
    _commitWeatherValue(cfg, item, type, v);
  };
  slider.addEventListener('pointerup', endDrag);
  slider.addEventListener('pointercancel', endDrag);

  item.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    _commitWeatherValue(cfg, item, type, 0);
  });

  thumb.addEventListener('dblclick', (e) => {
    e.preventDefault();
    e.stopPropagation();
    _commitWeatherValue(cfg, item, type, 1);
  });

  if (range) {
    range.addEventListener('input', () => {
      const v = _clampWeather(parseFloat(range.value));
      _setCardActive(item, v);
      _setSliderVisual(slider, v);
      _commitWeatherValue(cfg, item, type, v);
    });
  }
}

function _buildWeatherCard(cfg, type, v) {
  const item = document.createElement('div');
  item.className = 'ed-weather-item';
  item.dataset.weather = type;

  const iconWrap = document.createElement('div');
  iconWrap.className = 'ed-wx-icon-wrap';
  const icon = document.createElement('div');
  icon.className = `ed-wx-icon ed-wx-icon--on`;
  icon.style.color = WEATHER_HEX[type] || 'var(--sprout-mid)';
  icon.innerHTML = WX_SVG[type] || '';
  iconWrap.appendChild(icon);
  item.appendChild(iconWrap);

  const body = document.createElement('div');
  body.className = 'ed-wx-body';

  const name = document.createElement('div');
  name.className = 'ed-wx-name';
  name.textContent = getWeatherLabel(type);
  body.appendChild(name);

  const slider = document.createElement('div');
  slider.className = 'ed-wx-slider';
  slider.style.color = WEATHER_HEX[type] || 'var(--sprout-mid)';
  slider.tabIndex = 0;

  const track = document.createElement('div');
  track.className = 'ed-wx-track';
  const fill = document.createElement('div');
  fill.className = 'ed-wx-fill';
  const thumb = document.createElement('div');
  thumb.className = 'ed-wx-thumb';
  track.appendChild(fill);
  slider.appendChild(track);
  slider.appendChild(thumb);

  const range = document.createElement('input');
  range.type = 'range';
  range.min = '0';
  range.max = '1';
  range.step = '0.1';
  range.value = String(v);
  range.tabIndex = 0;
  range.className = 'ed-wx-sr';
  range.setAttribute('aria-label', `${getWeatherLabel(type)} intensidad`);
  slider.appendChild(range);

  body.appendChild(slider);
  item.appendChild(body);

  const actions = document.createElement('div');
  actions.className = 'ed-wx-actions';

  const upBtn = document.createElement('button');
  upBtn.className = 'ed-wx-up';
  upBtn.textContent = '\u25B2';
  upBtn.setAttribute('aria-label', 'Subir');
  upBtn.onclick = () => {
    const range = item.querySelector('input[type="range"]');
    const cur = range ? parseFloat(range.value) : v;
    _commitWeatherValue(cfg, item, type, _clampWeather(cur + 0.1));
  };
  actions.appendChild(upBtn);

  const valSpan = document.createElement('span');
  valSpan.className = 'ed-wx-val';
  valSpan.textContent = v.toFixed(1);
  actions.appendChild(valSpan);

  const downBtn = document.createElement('button');
  downBtn.className = 'ed-wx-down';
  downBtn.textContent = '\u25BC';
  downBtn.setAttribute('aria-label', 'Bajar');
  downBtn.onclick = () => {
    const range = item.querySelector('input[type="range"]');
    const cur = range ? parseFloat(range.value) : v;
    _commitWeatherValue(cfg, item, type, _clampWeather(cur - 0.1));
  };
  actions.appendChild(downBtn);

  item.appendChild(actions);

  _setCardActive(item, v);
  _setSliderVisual(slider, v);
  _attachSliderHandlers(cfg, item, type);

  return item;
}

function renderWeatherPresets(cfg) {
  const presetsEl = document.getElementById('ed-weather-presets');
  if (!presetsEl) return;
  presetsEl.innerHTML = '';
  for (const preset of WEATHER_PRESETS) {
    const chip = document.createElement('button');
    chip.className = 'ed-preset-chip';
    chip.dataset.preset = preset.key;
    chip.type = 'button';

    const icon = document.createElement('div');
    icon.className = 'ed-preset-chip-icon';
    icon.innerHTML = preset.svg;
    chip.appendChild(icon);

    const label = document.createElement('div');
    label.className = 'ed-preset-chip-label';
    label.textContent = preset.label;
    chip.appendChild(label);

    chip.addEventListener('click', () => {
      _commitAllWeather(cfg, preset.values);
    });
    presetsEl.appendChild(chip);
  }
}

function renderWeatherControls(cfg) {
  const listEl = document.getElementById('ed-weather-list');
  if (!listEl) return;

  const raw = cfg.getWeather?.() ?? getDefaultWeather();
  const weather = _normalizeWeather(raw);

  listEl.innerHTML = '';
  for (const type of WEATHER_TYPES) {
    const v = weather[type] ?? 0;
    const card = _buildWeatherCard(cfg, type, v);
    listEl.appendChild(card);
  }

  renderWeatherPresets(cfg);

  const clearBtn = document.getElementById('ed-weather-clear');
  if (clearBtn) {
    clearBtn.onclick = () => {
      _commitAllWeather(cfg, getDefaultWeather());
    };
  }
}

const HOVER_PREVIEW_MAX_PX = 128;

function getFrameRectInImage(objDef, frame, sourceTileSize = 16) {
  if (objDef.frames) {
    const f = objDef.frames[frame] || objDef.frames[0];
    const imgW = Math.max(...objDef.frames.map(fr => fr.x + fr.w));
    const imgH = Math.max(...objDef.frames.map(fr => fr.y + fr.h));
    return { url: objDef.url, f, imgW, imgH };
  }
  const cols = objDef.cols;
  const row = Math.floor(frame / cols);
  const col = frame % cols;
  return {
    url: objDef.url,
    f: { x: col * sourceTileSize, y: row * sourceTileSize, w: sourceTileSize, h: sourceTileSize },
    imgW: cols * sourceTileSize,
    imgH: objDef.rows * sourceTileSize,
  };
}

function getTilesetFrameRect(tileset, gid) {
  const localIdx = gid - tileset.firstgid;
  const row = Math.floor(localIdx / tileset.cols);
  const col = localIdx % tileset.cols;
  return {
    url: tileset.url,
    f: { x: col * 16, y: row * 16, w: 16, h: 16 },
    imgW: tileset.cols * 16,
    imgH: tileset.rows * 16,
  };
}

function buildFrameThumbnailStyle({ url, f, imgW, imgH }, targetSize) {
  const scale = Math.min(targetSize / f.w, targetSize / f.h);
  return {
    backgroundImage: `url("${url}")`,
    backgroundSize: `${imgW * scale}px ${imgH * scale}px`,
    backgroundPosition: `-${f.x * scale}px -${f.y * scale}px`,
    width: `${f.w * scale}px`,
    height: `${f.h * scale}px`,
  };
}

function initHoverPreview() {
  const palettes = ['ed-palette', 'ed-obj-palette'];
  for (const id of palettes) {
    const palette = document.getElementById(id);
    if (!palette) continue;

    palette.addEventListener('mouseover', (e) => {
      const tile = e.target.closest('.ed-tile');
      if (!tile || tile.classList.contains('eraser')) return;
      showTileHoverPreview(id, tile);
    });

    palette.addEventListener('mouseout', (e) => {
      if (e.target.closest('.ed-tile')) hideTileHoverPreview();
    });

    palette.addEventListener('mouseleave', () => hideTileHoverPreview());
  }
}

function showTileHoverPreview(paletteId, tileEl) {
  if (!edHoverPreview || !edCfg) return;

  let fingerprint;
  if (paletteId === 'ed-palette') {
    const gid = parseInt(tileEl.dataset.gid, 10);
    if (!gid) return;
    const t = edCfg.tilesets[activeTilesetIdx];
    if (!t) return;
    fingerprint = getTilesetFrameRect(t, gid);
  } else {
    const key = tileEl.dataset.key;
    const frame = parseInt(tileEl.dataset.frame, 10);
    if (!key || isNaN(frame)) return;
    const objDef = edCfg.objects.find(o => o.key === key);
    if (!objDef) return;
    fingerprint = getFrameRectInImage(objDef, frame);
  }

  const canvas = document.querySelector('canvas');
  const rect = canvas?.getBoundingClientRect();
  const scaleX = canvas && canvas.width > 0 && rect ? rect.width / canvas.width : 4;
  const scaleY = canvas && canvas.height > 0 && rect ? rect.height / canvas.height : 4;

  const maxDim = Math.max(fingerprint.f.w * scaleX, fingerprint.f.h * scaleY);
  const targetSize = Math.min(maxDim, HOVER_PREVIEW_MAX_PX);

  const style = buildFrameThumbnailStyle(fingerprint, targetSize);
  const frameW = parseFloat(style.width);
  const frameH = parseFloat(style.height);
  const cellSize = Math.max(frameW, frameH);

  edHoverPreview.innerHTML = '';
  edHoverPreview.style.width = `${cellSize}px`;
  edHoverPreview.style.height = `${cellSize}px`;

  const inner = document.createElement('div');
  inner.style.width = style.width;
  inner.style.height = style.height;
  inner.style.backgroundImage = style.backgroundImage;
  inner.style.backgroundSize = style.backgroundSize;
  inner.style.backgroundPosition = style.backgroundPosition;
  inner.style.backgroundRepeat = 'no-repeat';
  inner.style.imageRendering = 'pixelated';

  edHoverPreview.appendChild(inner);

  positionHoverPreview(tileEl, cellSize, cellSize);
  edHoverPreview.classList.add('visible');
}

function hideTileHoverPreview() {
  edHoverPreview?.classList.remove('visible');
}

function positionHoverPreview(tileEl, cellW, cellH) {
  if (!edHoverPreview) return;
  const padding = 6;
  const border = 1;
  const gap = 8;
  const totalW = cellW + padding * 2 + border * 2;
  const totalH = cellH + padding * 2 + border * 2;
  const rect = tileEl.getBoundingClientRect();

  let left = rect.right + gap;
  if (left + totalW > window.innerWidth - 4) {
    left = rect.left - gap - totalW;
    if (left < 4) {
      left = Math.max(4, (window.innerWidth - totalW) / 2);
    }
  }

  let top = rect.top + rect.height / 2 - totalH / 2;
  top = Math.max(4, Math.min(window.innerHeight - totalH - 4, top));

  edHoverPreview.style.left = `${left}px`;
  edHoverPreview.style.top = `${top}px`;
}
