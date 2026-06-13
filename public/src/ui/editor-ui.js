let edPanel, edTitle, edStatus, edTabs, edPalette, edLayersBar;
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

export function initEditor() {
  edPanel = document.getElementById('editor-panel');
  edTitle = document.getElementById('ed-title');
  edStatus = document.getElementById('ed-status');
  edTabs = document.getElementById('ed-tabs');
  edPalette = document.getElementById('ed-palette');
  edLayersBar = document.getElementById('ed-layers');

  document.getElementById('ed-save').onclick = () => edCfg?.onSave();
  document.getElementById('ed-play').onclick = () => edCfg?.onPlay();
  document.getElementById('ed-menu').onclick = () => edCfg?.onMenu();
  document.getElementById('ed-clear').onclick = () => edCfg?.onClear();
  document.getElementById('ed-undo').onclick = () => edCfg?.onUndo();
  document.getElementById('ed-redo').onclick = () => edCfg?.onRedo();
  document.getElementById('ed-revert').onclick = () => edCfg?.onRevert();
  document.getElementById('ed-clear-objects').onclick = () => edCfg?.onClearObjects();
  document.getElementById('ed-intro-mode').onclick = () => edCfg?.onIntroMode();

  window.__setEditor = (cfg) => { if (!cfg) hideEditor(); else showEditor(cfg); };
  window.__setEditor_updateLayer = (name) => updateLayerHighlight(name);
  window.__setEditor_updateSelected = (gid) => { selectedGid = gid; activeTerrainName = null; highlightSelected(); highlightTerrain(); };
  window.__setEditor_updateTerrain = (name) => { activeTerrainName = name; highlightTerrain(); };
  window.__setEditor_updateMode = (mode) => {
    document.getElementById('ed-spawn').classList.toggle('active', mode === 'spawn');
    document.getElementById('ed-intro-mode').classList.toggle('active', mode === 'intro');
  };
}

function hideEditor() {
  edPanel.style.display = 'none';
  edTabs.innerHTML = '';
  edPalette.innerHTML = '';
  document.getElementById('ed-tileset-categories').innerHTML = '';
  document.getElementById('ed-obj-tabs').innerHTML = '';
  document.getElementById('ed-obj-palette').innerHTML = '';
  document.getElementById('ed-variant-switches').innerHTML = '';
  edCfg = null;
}

function showEditor(cfg) {
  edCfg = cfg;
  edPanel.style.display = 'flex';
  edTitle.textContent = `Editor — ${cfg.levelKey}`;
  edStatus.textContent = `layer: ${cfg.getLayer()}`;

  activeTerrainName = null;
  selectedGid = 0;

  activeTilesetCategory = 'grass';
  activeTilesetIdx = cfg.tilesets.findIndex(t => t.category === 'grass');
  renderTilesetCategories(cfg);
  renderTilesetTabs(cfg);

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
  eraser.title = 'Erase (GID 0)';
  eraser.addEventListener('click', () => setSelected(0));
  edPalette.appendChild(eraser);

  for (let r = 0; r < t.rows; r++) {
    for (let c = 0; c < t.cols; c++) {
      const gid = t.firstgid + r * t.cols + c;
      const d = document.createElement('div');
      d.className = 'ed-tile';
      d.dataset.gid = gid;
      d.style.backgroundImage = `url("${t.url}")`;
      d.style.backgroundSize = `${t.cols * 32}px ${t.rows * 32}px`;
      d.style.backgroundPosition = `-${c * 32}px -${r * 32}px`;
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

  // Changing tileset disables terrain mode to avoid mismatch
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
  if (edCfg) edStatus.textContent = `layer: ${name}  ·  gid: ${selectedGid}`;
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

  // Initialize activeGroup/activeVariant if pointing to a group tab
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
        // Set default variant from first object in group
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

      // Check if this option is valid given other selected dimensions
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
        // Auto-correct other dimensions if their current selection is no longer valid
        for (const otherDim of def.dimensions) {
          if (otherDim.key === dim.key) continue;
          const currentVal = activeVariant[otherDim.key];
          const testVar = { ...activeVariant };
          const valid = groupObjs.some(o => {
            for (const [k, v] of Object.entries(testVar)) {
              if (o.variant[k] !== v) return false;
            }
            return true;
          });
          if (!valid) {
            // Find first valid option for this dimension
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
    placeholder.textContent = 'Variant not available';
    placeholder.style.color = '#556';
    placeholder.style.fontSize = '10px';
    placeholder.style.padding = '8px';
    objPalette.appendChild(placeholder);
    return;
  }

  objPalette.style.setProperty('--cols', o.cols);
  for (let r = 0; r < (o.editorRows ?? o.rows); r++) {
    for (let c = 0; c < o.cols; c++) {
      const frame = r * o.cols + c;
      const d = document.createElement('div');
      d.className = 'ed-tile';
      d.style.backgroundImage = `url("${o.url}")`;
      d.style.backgroundSize = `${o.cols * 32}px ${o.rows * 32}px`;
      d.style.backgroundPosition = `-${c * 32}px -${r * 32}px`;
      d.title = `${o.label} frame ${frame}`;
      d.addEventListener('click', () => {
        edCfg.onObjectSelect(o.key, frame, activeObjType);
      });
      objPalette.appendChild(d);
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
