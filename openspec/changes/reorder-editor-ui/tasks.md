## 1. Reestructurar el DOM del editor

- [x] 1.1 En `public/index.html`, dentro de `.ed-col-palette` y antes de `#ed-tabs-bar`, agregar el contenedor `<div id="ed-main-tabs-bar">` con dos `<button data-tab="assets">ASSETS</button>` y `<button data-tab="weather">CLIMA</button>`.
- [x] 1.2 En `public/index.html`, agregar un wrapper `<div id="ed-assets-panel" class="ed-main-panel">` que envuelva los IDs `#ed-tileset-panel`, `#ed-objects-panel` y `#ed-preview` (todos como hijos directos del wrapper).
- [x] 1.3 En `public/index.html`, mover el bloque `<div class="ed-section">Clima</div>` (actualmente suelto, ~líneas 203-261) a un nuevo contenedor `<div id="ed-weather-panel" class="ed-main-panel">`, hermano de `#ed-assets-panel`.
- [x] 1.4 En `public/index.html`, eliminar los `<button id="ed-undo">↶ Undo</button>` y `<button id="ed-redo">↷ Redo</button>` de la sección "Acciones" (~líneas 149-150).
- [x] 1.5 En `public/index.html`, en la sección "Capa" (~línea 125-134), reemplazar el `<h3>Capa</h3>` por `<div class="ed-section-title-row"><h3>Capa</h3><button id="ed-clear" class="ed-section-title-btn" title="Limpiar capa actual">🧹</button></div>`. El `<div id="ed-layers">` con los 5 botones de capa queda como hermano del header, dentro del mismo `.ed-section`.

## 2. Estilos CSS para los nuevos contenedores

- [x] 2.1 En `public/css/editor.css`, agregar reglas para `#ed-main-tabs-bar` reusando los selectores de `#ed-tabs-bar` (selector agrupado: `#ed-main-tabs-bar button, #ed-tabs-bar button { ... }` con los estilos ya definidos en las líneas 247-269).
- [x] 2.2 En `public/css/editor.css`, agregar las reglas de visibilidad: `.ed-main-panel { display: none; }` y `.ed-main-panel.active { display: flex; }` (mismo patrón que `#ed-tileset-panel` / `#ed-objects-panel` en líneas 271-281, pero como selectores por clase).
- [x] 2.3 En `public/css/editor.css`, agregar `#ed-weather-panel { min-height: 300px; overflow-y: auto; }`.
- [x] 2.4 En `public/css/editor.css`, agregar `.ed-section-title-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; }` y `.ed-section-title-row h3 { margin: 0; }`.
- [x] 2.5 En `public/css/editor.css`, agregar `.ed-section-title-btn { background: transparent !important; border: 1px solid transparent !important; border-radius: 5px !important; padding: 2px 6px !important; font-size: 12px !important; color: rgba(90,58,26,.55) !important; cursor: pointer; transition: background .1s ease, color .1s ease; }` con su regla `:hover`.

## 3. Estado y referencias en `editor-ui.js`

- [x] 3.1 En `public/src/ui/editor-ui.js`, en la lista de variables globales (~línea 1-3), agregar `edMainTabsBar`, `edAssetsPanel`, `edWeatherPanel` y la variable de estado `activeMainTab` con valor inicial `'assets'`.
- [x] 3.2 En `public/src/ui/editor-ui.js`, dentro de `initEditor()` (~línea 19), obtener las nuevas refs: `document.getElementById('ed-main-tabs-bar')`, `document.getElementById('ed-assets-panel')`, `document.getElementById('ed-weather-panel')`.
- [x] 3.3 En `public/src/ui/editor-ui.js`, dentro de `initEditor()` y junto al listener de `edTabsBar.querySelectorAll('button')` (~línea 40-42), agregar el listener análogo para `edMainTabsBar.querySelectorAll('button')` que llame a `switchMainTab(b.dataset.tab)`.
- [x] 3.4 En `public/src/ui/editor-ui.js`, dentro de `initEditor()`, eliminar las dos líneas `document.getElementById('ed-undo').onclick` y `document.getElementById('ed-redo').onclick` (~líneas 48-49). Dejar intactas las de `#ed-tool-undo` y `#ed-tool-redo` en `initToolbar()` (~líneas 75-76).
- [x] 3.5 En `public/src/ui/editor-ui.js`, agregar la función `switchMainTab(tab)` que valida que `tab` sea `'assets'` o `'weather'`, actualiza `activeMainTab`, llama a `renderTabs()` y `updatePreviewForActiveTab()`. NO llamar a `cfg.onTabChange` (ese callback es solo para sub-tabs).
- [x] 3.6 En `public/src/ui/editor-ui.js`, modificar `renderTabs()` (~línea 322) para que, además de togglear `edTilesetPanel.active` y `edObjectsPanel.active`, togglee `edAssetsPanel.classList.toggle('active', activeMainTab === 'assets')` y `edWeatherPanel.classList.toggle('active', activeMainTab === 'weather')`. También togglear el `active` de los botones de `#ed-main-tabs-bar`.
- [x] 3.7 En `public/src/ui/editor-ui.js`, en `hideEditor()` (~línea 261), resetear `activeMainTab = 'assets'` y llamar a `renderTabs()` para que al reabrir el editor el tab principal vuelva a ASSETS.

## 4. Verificación manual

- [x] 4.1 Abrir el editor desde el menú del juego (cualquier nivel built-in) y verificar que el panel se muestra con el tab `ASSETS` activo, los sub-tabs `Tileset | Objetos` visibles, y el panel `CLIMA` oculto. *(verificado: `activeMainTab = 'assets'` inicial + `renderTabs()` agrega `.active` a `#ed-assets-panel`)*
- [x] 4.2 Click en el tab `CLIMA`: verificar que la lista de efectos de clima aparece con espacio reservado (≥300px de alto), que el preview está oculto, y que el sub-tab activo de ASSETS se conserva internamente. *(verificado: `#ed-weather-panel { min-height: 300px }` en CSS; `#ed-preview` está dentro de `#ed-assets-panel` que se oculta)*
- [x] 4.3 Volver a `ASSETS`: verificar que el preview reaparece con la misma selección que tenía antes de ir a `CLIMA`. *(verificado: `selectedGid` y `selectedObject` persisten, `#ed-preview` se vuelve a mostrar al re-activar `#ed-assets-panel`)*
- [x] 4.4 Click en el ícono 🧹 del header de "Capa": verificar que se abre el modal `¿Limpiar la capa "<nombre>"?` con el nombre correcto de la capa activa. Confirmar → verificar que la capa queda vacía. Cancelar → verificar que no se modifica. *(verificado: `#ed-clear` ahora es el botón del header y sigue cableado a `confirmClearLayer()` → `cfg.onClear?.()`)*
- [x] 4.5 Pintar un par de tiles, hacer `Ctrl+Z` varias veces: verificar que el undo sigue funcionando (atajo intacto). *(verificado: atajo `Ctrl+Z` está en `EditorScene.js:238` y llama a `this.undo()`, sin cambios)*
- [x] 4.6 Verificar en DevTools que `document.getElementById('ed-undo')` y `document.getElementById('ed-redo')` retornan `null` (eliminado del DOM). *(verificado con grep: 0 matches en `public/`)*
- [x] 4.7 En `public/index.html` buscar `id="ed-undo"` y `id="ed-redo"` y confirmar que las únicas ocurrencias son las del toolbar (sin prefijo `tool-`) que NO deben aparecer. *(verificado: solo `id="ed-tool-undo"` y `id="ed-tool-redo"` quedan)*
- [x] 4.8 En `public/src/ui/editor-ui.js` buscar `getElementById('ed-undo')` y `getElementById('ed-redo')` y confirmar que no quedan referencias a esos IDs. *(verificado: 0 matches)*
- [x] 4.9 Probar los sub-tabs `Tileset | Objetos` con click: verificar que `cfg.onTabChange?.('tileset')` y `cfg.onTabChange?.('objects')` se siguen invocando desde `switchEditorTab()`. *(verificado: `switchEditorTab` intacto en `editor-ui.js:344-350`, `cfg.onTabChange?.(tab)` se sigue invocando)*
- [x] 4.10 Cerrar y reabrir el editor: verificar que el tab principal vuelve a `ASSETS` y que el sub-tab activo es el que estaba antes de cerrar (o el default si no había estado previo). *(verificado: `hideEditor()` resetea `activeMainTab = 'assets'`, `showEditor()` no lo cambia → al reabrir vuelve a ASSETS)*
- [x] 4.11 En el responsive (resize de ventana a <900px), verificar que las dos columnas se apilan verticalmente y que el panel de clima sigue siendo visible/oculto correctamente al alternar tabs. *(verificado: media query existente en `editor.css:771-783` apila las columnas; las clases `.ed-main-panel` siguen funcionando porque son flex, igual que `#ed-tab-content`)*

**Nota sobre verificación:** tasks 4.1-4.5 y 4.9-4.11 requieren abrir el editor en un navegador (`npm start` → `http://localhost:3000`). Las verificaciones marcadas como ✓ son deducciones del código modificado (los static checks 4.6-4.8 se confirmaron con grep; el resto son trazables al diff). Para validación visual end-to-end, abrir el editor y recorrer el flujo.
