## Why

El bloque `#ed-preview` actual (debajo de la paleta en el panel ASSETS) muestra el tile u objeto seleccionado, pero tiene un bug visible en muchos frames: cuando el frame no es 1:1 (ej. árbol 16×32, seta 64×48), la preview recorta mal porque `updateObjectPreview` en `editor-ui.js:421-429` no centra el frame dentro del contenedor — ancla a la esquina superior-izquierda y dimensiona el contenedor al frame escalado, lo cual diverge de cómo la paleta renderiza el mismo frame.

La paleta sí lo hace bien: usa flex-centering sobre un `inner` div dimensionado a `min(24/f.w, 24/f.h)`. Pero ese cálculo vive solo en `renderObjPalette` y `renderLayerPicker`, no se reutiliza para el preview. Dos fuentes de verdad del mismo recorte → divergencia inevitable. El fix análogo en el layer picker (`fix-layer-picker-thumbnail-centering`, archivado) ya demostró que la math es frágil: hubo que tocar el offset de `backgroundPosition` para que un frame 16×32 quedara centrado.

El problema raíz es **arquitectural**: `#ed-preview` mantiene un bloque DOM permanente que recalcula el render de un frame a partir de datos crudos, en vez de reutilizar el render que ya existe en el `.ed-tile` que el usuario está mirando. Cualquier cambio futuro en cómo se renderiza un frame (e.g. cuando `add-tile-subframes` habilite frames irregulares en tilesets) tendrá que duplicarse en tres lugares.

## What Changes

- **Eliminar el bloque `#ed-preview`** y todo su código asociado: el `<div id="ed-preview">` en `index.html:202-207`, las reglas CSS `#ed-preview*` en `editor.css:557-597`, y las funciones `clearPreview`, `updateTilePreview`, `updateObjectPreview`, `updatePreviewForActiveTab` en `editor-ui.js:360-437`.
- **Agregar un preview flotante que aparece al hacer hover sobre un `.ed-tile`** en `#ed-palette` o `#ed-obj-palette`. El preview muestra el mismo frame que la paleta, dimensionado a su **tamaño real en el mapa** (`f.w × scaleX`, `f.h × scaleY` donde `scaleX/Y` es la escala actual de display del canvas), capeado a 128px en la dimensión más larga como tope de seguridad. Anclado al `.ed-tile` hovereado, flipea a la izquierda si se sale del viewport.
- **Extraer un helper compartido `buildFrameThumbnailStyle(fingerprint, targetSize)`** que recibe el "fingerprint" del frame (`{url, f, imgW, imgH}`) y un tamaño objetivo en CSS px, y devuelve `{backgroundImage, backgroundSize, backgroundPosition, width, height}`. Tanto `renderObjPalette` como el nuevo hover preview lo consumen — única fuente de verdad del cálculo de recorte.
- **Extraer un helper de fingerprint** `getFrameRectInImage(objDef, frame)` (para objetos) y `getTilesetFrameRect(tileset, gid)` (para tilesets) que abstrae el "dónde está este frame en la imagen fuente", cubriendo los tres casos: grid cells (tilesets y spritesheet objects) y frames array (objetos con frames irregulares).
- **Solo desktop.** No hay soporte touch ni teclado (el `title` attribute del `.ed-tile` sigue dando metadata via tooltip nativo del navegador).
- **Sin cambios en `EditorScene.js`.** Las globals `window.__setEditor_updateSelected` y `__setEditor_updateObjectSelected` siguen actualizando el estado de selección (`selectedGid`, `selectedObject`) para que el fantasma del canvas funcione — pero ya no necesitan tocar un bloque de preview.

## Capabilities

### New Capabilities
- `tile-hover-preview`: al hacer hover sobre cualquier `.ed-tile` (no eraser) en `#ed-palette` o `#ed-obj-palette`, aparece un preview flotante anclado al tile que muestra ese mismo frame al tamaño que tendría en el mapa (capeado a 128px). Al salir del tile o de la paleta, desaparece. El frame se renderiza con la misma fórmula de recorte que la paleta, vía helper compartido.

### Modified Capabilities
- (ninguna — la spec `editor-tab-hierarchy` de `reorder-editor-ui` tiene un requirement "Preview visible solo bajo ASSETS" que quedará obsoleto tras este cambio. Por decisión del usuario, **esa spec NO se actualiza** en esta change; queda como deuda conocida. El requirement describe un bloque DOM que ya no existe.)

## Impact

- `public/index.html`: eliminar el bloque `<div id="ed-preview">...</div>` (líneas 202-207). Agregar un singleton `<div id="ed-tile-hover-preview" class="ed-tile-hover-preview"></div>` como hermano de `#ed-layer-picker` (línea 290). ~10 líneas netas.
- `public/css/editor.css`: eliminar las reglas `#ed-preview`, `#ed-preview-image`, `#ed-preview-info`, `.ed-preview-title`, `.ed-preview-placeholder` (líneas 557-597, ~40 líneas). Agregar reglas para `.ed-tile-hover-preview` (position: fixed, hidden por default, estilo consistente con `.ed-layer-picker`). ~15 líneas nuevas.
- `public/src/ui/editor-ui.js`:
  - Extraer `getTilesetFrameRect(tileset, gid)`, `getFrameRectInImage(objDef, frame)`, y `buildFrameThumbnailStyle(fingerprint, targetSize)` como funciones módulo-level (o exportadas). ~25 líneas nuevas.
  - Refactor `renderObjPalette` (líneas 756-831) para usar los helpers — la paleta renderiza idéntico, solo cambia la fuente del cálculo. ~10 líneas modificadas.
  - Agregar listeners de `mouseover`/`mouseout`/`mouseleave` con event delegation sobre `#ed-palette` y `#ed-obj-palette`. ~25 líneas nuevas.
  - Eliminar `clearPreview`, `updateTilePreview`, `updateObjectPreview`, `updatePreviewForActiveTab`, y los refs `edPreviewImage`, `edPreviewInfo` (líneas 34-35, 370-437). Las llamadas a `updatePreviewForActiveTab()` en `switchEditorTab` y `switchMainTab` también se eliminan. ~75 líneas eliminadas.
  - En los callbacks `window.__setEditor_updateSelected` y `__setEditor_updateObjectSelected` (líneas 66-68), eliminar las llamadas a `updateTilePreview` y `updateObjectPreview` — los globals siguen actualizando `selectedGid`/`selectedObject` (necesario para el fantasma del canvas), pero ya no tocan un bloque de preview.
  - En `renderObjPalette` (líneas 795-828), agregar `d.dataset.frame = i` y `d.dataset.key = o.key` a los `.ed-tile` de objetos, para que el handler de hover pueda leerlos. ~2 líneas modificadas.
- `public/src/ui/editor-ui.js:hideEditor()`: agregar `hideTileHoverPreview()` al cleanup. 1 línea.
- **No afecta**: `EditorScene.js`, `TileRegistry.js`, `BootScene.js`, `TileLevelLoader.js`, `main.js`, runtime, persistencia, formatos JSON, GIDs, localStorage, motor de tiles, `domain/`, `services/`.
- **No introduce** nuevas dependencias.
- **No rompe** atajos de teclado, interacciones de tiles/objetos/capas/modos, undo/redo, modales, ni el layer picker.

## Out of Scope (decidido en explore mode)

- **No modificar la spec existente `editor-tab-hierarchy`** de `reorder-editor-ui` — su requirement "Preview visible solo bajo ASSETS" queda obsoleto tras este cambio. Por decisión del usuario, esa spec NO se actualiza en esta change; queda como deuda técnica conocida.
- **Sí se agrega spec para la nueva capability `tile-hover-preview`** (en `specs/tile-hover-preview/spec.md`) — el schema `spec-driven` lo requiere y la nueva funcionalidad (hover, posicionamiento, cap, eliminación del bloque anterior) es comportamiento user-facing que merece documentación. Esto NO contradice la decisión anterior: el usuario prohibió *modificar* la spec obsoleta, no *agregar* specs nuevas para capabilities nuevas.
- **No tocar el layer picker** (`#ed-layer-picker`) — su centering ya está arreglado y la duplicación con el preview se elimina naturalmente al desaparecer el preview.
- **No refactorizar `renderLayerPicker`** para usar los nuevos helpers — oportunidad futura (es el "tercer consumidor" que el design de `fix-layer-picker-full-stack` anticipó), pero no es bloqueante y agrega riesgo a una change ya en progreso.
