## Why

El editor tiene tres fricciones que se acumulan y vuelven la barra lateral difícil de escanear:

1. **Duplicación visible.** El botón "Limpiar capa" (`#ed-clear`) vive en "Acciones" junto a Guardar/Probar/Revertir, pero su semántica es *per-layer* — el modal pregunta `¿Limpiar la capa "<X>"?` y dispara `clearActiveLayer()`. No es una acción a nivel de archivo, debería estar al lado del selector de capa.
2. **Undo/Redo duplicados.** `#ed-undo` y `#ed-redo` (en "Acciones") llaman a las mismas funciones que `#ed-tool-undo` y `#ed-tool-redo` (en "Historial"). El handler es idéntico (ver `editor-ui.js:48-49` vs `:75-76`). Tener los dos pares ocupa espacio sin sumar función — los atajos `Ctrl+Z` / `Ctrl+Y` ya cubren el caso rápido.
3. **Clima compite con la paleta.** La sección Clima es un `.ed-section` suelto debajo del preview en la columna derecha. Aunque sus controles son distintos (sliders vs tiles), comparte el eje vertical con la paleta activa, robándole altura y haciendo que el panel se sienta saturado. Como Clima tiene un propósito bien diferenciado (configuración del clima del nivel, no assets pintables), merece un primer nivel propio.

El cambio propone anidar los tabs actuales `Tileset | Objetos` bajo un primer nivel `ASSETS | CLIMA`, mover "Limpiar capa" como ícono inline al título del bloque Capa, y eliminar los duplicados de undo/redo. Todo puramente UI — sin tocar `EditorScene.js`, sin migrar datos, sin romper la API de `__setEditor_*`.

## What Changes

- **Anidar tabs bajo `ASSETS | CLIMA`.** Reemplazar la barra de tabs actual `#ed-tabs-bar` (Tileset/Objetos) como sub-tabs dentro de un nuevo contenedor padre `#ed-main-tabs-bar` con dos botones: `ASSETS` y `CLIMA`. El tab `ASSETS` muestra los sub-tabs y el contenido actual (Tileset/Objetos + preview). El tab `CLIMA` muestra la lista de efectos de clima con espacio vertical reservado.
- **Mover `#ed-clear` al header de "Capa".** Convertir el `<h3>Capa</h3>` actual en un flex row con un botón pequeño 🧹 alineado a la derecha, que dispara `confirmClearLayer()` (mismo handler, mismo modal). Sin cambios funcionales.
- **Eliminar `#ed-undo` y `#ed-redo` de "Acciones".** Quedan `#ed-tool-undo` y `#ed-tool-redo` en "Historial" + los atajos `Ctrl+Z` / `Ctrl+Y`. También se eliminan los handlers asociados en `editor-ui.js:48-49` (código muerto).
- **Preview solo visible en `ASSETS`.** El bloque `#ed-preview` (imagen + info del tile/objeto seleccionado) se oculta cuando `activeMainTab === 'weather'`. No hay nada que previsualizar en clima.
- **Espacio reservado en `CLIMA`.** El panel de clima recibe `min-height: 300px` y `overflow-y: auto` para que un rediseño futuro de los controles tenga lugar sin tocar la estructura.
- **Callback opcional `onMainTabChange`.** Se agrega un callback opcional al `cfg` del editor para que `EditorScene` pueda reaccionar al cambio de tab principal (por ejemplo, para resetear selección al entrar a CLIMA). Si no se provee, es no-op — sin breaking change.
- **Sin breaking changes en la API pública de `__setEditor_*`.** Todas las funciones globales (`__setEditor`, `__setEditor_updateSelected`, `__setEditor_updateObjectSelected`, etc.) mantienen su contrato.
- **Sin cambios en `EditorScene.js` más allá de, opcionalmente, pasar `onMainTabChange` en el `cfg`.** Los atajos de teclado existentes (`S`, `I`, `P`, `1-5`, `Ctrl+S/Z/Y`, `Ctrl+Shift+C`, `Esc`) siguen funcionando igual.

## Capabilities

### New Capabilities
- `editor-tab-hierarchy`: el panel del editor expone una jerarquía de tabs de dos niveles. El primer nivel (`ASSETS | CLIMA`) controla qué se muestra en la columna derecha; el segundo nivel (`Tileset | Objetos`) solo existe bajo `ASSETS`. El botón "Limpiar capa" se reubica como ícono inline al título del bloque "Capa". Los duplicados `#ed-undo`/`#ed-redo` se eliminan.

### Modified Capabilities
- (ninguna — no hay specs en `openspec/specs/` aún que requieran delta; la spec `editor-layout` archivada cubrió la reorganización anterior)

## Impact

- `public/index.html`: refactor de la estructura dentro de `#editor-panel` (nuevo `#ed-main-tabs-bar`, mover el bloque Clima a un panel hermano, mover `#ed-clear` al header de Capa, eliminar dos botones duplicados). ~30 líneas modificadas/agregadas, ~5 eliminadas.
- `public/css/editor.css`: estilos para `#ed-main-tabs-bar` (pueden reusar los de `#ed-tabs-bar` existente), `.ed-main-panel` con la regla `display: none` / `.active { display: flex }` (mismo patrón que ya existe en líneas 271-281), `min-height: 300px` y `overflow-y: auto` en `#ed-weather-panel`, y un flex row `.ed-section-title-row` para el header de Capa. ~40 líneas nuevas.
- `public/src/ui/editor-ui.js`: nuevo estado `activeMainTab`, nuevas refs a `edMainTabsBar`, `edAssetsPanel`, `edWeatherPanel`. Modificar `renderTabs()` y `switchEditorTab()` para operar solo dentro del panel ASSETS. Eliminar handlers de `#ed-undo`/`#ed-redo`. Ocultar `#ed-preview` cuando el main tab es `weather`. ~20 líneas modificadas.
- `public/src/engine/scenes/EditorScene.js`: opcional — pasar `onMainTabChange: (tab) => { ... }` en el `cfg` (línea ~100-115) si se quiere reaccionar al cambio. Si no se agrega, el comportamiento es idéntico al actual.
- **No afecta**: TileRegistry, GIDs, localStorage, formatos JSON, motor de tiles, `domain/`, `services/`, `main.js`, dominio de tests, build/runtime.
- **No introduce** nuevas dependencias.
- **No rompe** atajos de teclado ni interacciones existentes con tiles, objetos, capas, modos, weather, undo/redo, modales.
- **Riesgo bajo**: cambios puramente presentacionales con un handler idéntico reubicado. El cambio de visibilidad de Clima es la única adición funcional, y es trivial (mostrar/ocultar un panel).
