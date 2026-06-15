## 1. Extraer helpers de fingerprint y estilo

- [x] 1.1 En `public/src/ui/editor-ui.js`, agregar función `getFrameRectInImage(objDef, frame, sourceTileSize = 16)` que devuelve `{url, f, imgW, imgH}`. Cubre el caso `frames` array (calcula `imgW`/`imgH` como `max(x+w)`, `max(y+h)`) y el caso spritesheet (calcula `f` como `{col*16, row*16, 16, 16}`, `imgW`/`imgH` como `cols*16`, `rows*16`).
- [x] 1.2 En `public/src/ui/editor-ui.js`, agregar función `getTilesetFrameRect(tileset, gid)` que devuelve `{url, f, imgW, imgH}`. Calcula `localIdx = gid - tileset.firstgid`, luego `f = {col*16, row*16, 16, 16}` y `imgW`/`imgH` como `tileset.cols*16`, `tileset.rows*16`.
- [x] 1.3 En `public/src/ui/editor-ui.js`, agregar función `buildFrameThumbnailStyle({url, f, imgW, imgH}, targetSize)` que devuelve `{backgroundImage, backgroundSize, backgroundPosition, width, height}`. Fórmula: `scale = min(targetSize/f.w, targetSize/f.h)`, `width = f.w*scale`, `height = f.h*scale`, `backgroundSize = imgW*scale, imgH*scale`, `backgroundPosition = -f.x*scale, -f.y*scale`.

## 2. Refactorizar `renderObjPalette` para usar los helpers

- [x] 2.1 En `public/src/ui/editor-ui.js:renderObjPalette`, rama `o.frames` (líneas 784-814): reemplazar el cálculo inline de `f`, `imgW`, `imgH` por `getFrameRectInImage(o, i)`. Calcular `scale = min(24/f.w, 24/f.h)` igual que antes, usar `buildFrameThumbnailStyle(fingerprint, 24)` para setear el `inner.style.background*` (separadamente del `width`/`height` que ya se setean). Verificar que la paleta renderiza idéntico.
- [x] 2.2 En `renderObjPalette`, rama `else` (líneas 815-830, spritesheet objects): reemplazar el cálculo inline de `f`, `imgW`, `imgH` por `getFrameRectInImage(o, frame)`. Usar `buildFrameThumbnailStyle(fingerprint, 24)`. Verificar render idéntico.
- [x] 2.3 En `renderObjPalette`, agregar `d.dataset.frame = i` y `d.dataset.key = o.key` a los `.ed-tile` (en ambas ramas) para que el handler de hover pueda leer el frame y la key.
- [x] 2.4 En `renderPalette` (líneas 475-506, tilesets), el cálculo inline es trivial (`-c*24, -r*24` con `t.cols*24, t.rows*24`) y no se beneficia del helper — dejar como está. Solo verificar que el `data-gid` ya está presente (sí, línea 496).

## 3. Agregar DOM y CSS del hover preview

- [x] 3.1 En `public/index.html`, agregar `<div id="ed-tile-hover-preview" class="ed-tile-hover-preview"></div>` como hermano de `#ed-layer-picker` (línea 290).
- [x] 3.2 En `public/css/editor.css`, agregar las reglas para `.ed-tile-hover-preview`: `position: fixed; display: none; background-repeat: no-repeat; image-rendering: pixelated; border: 1px solid rgba(255,200,80,.35); border-radius: 6px; background-color: rgba(40,28,16,.92); z-index: 998; box-shadow: 0 4px 16px rgba(0,0,0,.4);` y `.ed-tile-hover-preview.visible { display: block; }`.

## 4. Implementar el comportamiento de hover

- [x] 4.1 En `public/src/ui/editor-ui.js`, agregar `const edHoverPreview = document.getElementById('ed-tile-hover-preview');` en `initEditor()` (después de los otros refs DOM, ~línea 43).
- [x] 4.2 Agregar función `showTileHoverPreview(paletteId, tileEl)` que: (a) extrae fingerprint según `paletteId` ('ed-palette' usa `getTilesetFrameRect` con `tileEl.dataset.gid`; 'ed-obj-palette' usa `getFrameRectInImage` con `tileEl.dataset.key` y `tileEl.dataset.frame`); (b) lee la escala de display del canvas (`canvas.getBoundingClientRect()` y `canvas.width/height`); (c) calcula `targetSize = min(max(f.w*scaleX, f.h*scaleY), 128)`; (d) aplica `buildFrameThumbnailStyle(fingerprint, targetSize)` a `edHoverPreview.style`; (e) llama a `positionHoverPreview(tileEl, dispW, dispH)`; (f) agrega clase `visible`.
- [x] 4.3 Agregar función `hideTileHoverPreview()` que remueve clase `visible` de `edHoverPreview`.
- [x] 4.4 Agregar función `positionHoverPreview(tileEl, dispW, dispH)` que computa left/top según Modelo A: ancla a la derecha del tile, centrado verticalmente; flipea a la izquierda si overflow horizontal; clampa vertical al viewport; fallback de centrado horizontal si ambos lados overflowean.
- [x] 4.5 Agregar función `initHoverPreview()` que registra `mouseover`, `mouseout`, y `mouseleave` sobre `#ed-palette` y `#ed-obj-palette` (event delegation; salta `.ed-tile.eraser`). Llamarla desde `initEditor()`.
- [x] 4.6 En `hideEditor()` (línea 268), agregar `hideTileHoverPreview()` al cleanup.

## 5. Eliminar el bloque `#ed-preview` y código asociado

- [x] 5.1 En `public/index.html`, eliminar el bloque `<div id="ed-preview">...</div>` completo (líneas 202-207).
- [x] 5.2 En `public/css/editor.css`, eliminar las reglas `#ed-preview`, `#ed-preview-image`, `#ed-preview-info`, `.ed-preview-title`, `.ed-preview-placeholder` (líneas 557-597, ~40 líneas).
- [x] 5.3 En `public/src/ui/editor-ui.js`, eliminar los refs `edPreviewImage` y `edPreviewInfo` (líneas 3, 34-35).
- [x] 5.4 Eliminar las funciones `clearPreview` (líneas 370-376), `updateTilePreview` (líneas 378-398), `updateObjectPreview` (líneas 400-437), `updatePreviewForActiveTab` (líneas 360-368).
- [x] 5.5 Eliminar las llamadas a `updatePreviewForActiveTab()` en `switchEditorTab` (línea 348) y `switchMainTab` (línea 357).
- [x] 5.6 En `initEditor()` (líneas 66-68), modificar `window.__setEditor_updateSelected` y `__setEditor_updateObjectSelected` para que NO llamen a `updateTilePreview` / `updateObjectPreview`. Mantener la actualización de `selectedGid` / `selectedObject`.
- [x] 5.7 En `showEditor()` (línea 302), eliminar la llamada a `clearPreview()` (la función ya no existe).

## 6. Verificación manual

- [x] 6.1 Abrir editor con `npm start`, ir a tab `ASSETS` → `Tileset`. Hover sobre distintos tiles en la paleta: el preview flotante debe aparecer a la derecha del tile, mostrando ese tile al tamaño real del mapa (típicamente 64×64 para tiles 16×16 con zoom 4x). Sin frame negro, sin tile pegado a un lado.
- [x] 6.2 Hover sobre frames irregulares en `Objects` (e.g. trees 32×32, mushrooms 64×48, furniture 16×32): el preview debe mostrar el frame centrado, al tamaño proporcional real del mapa, capeado a 128px si excede.
- [x] 6.3 Mover el cursor entre tiles adyacentes: el preview debe actualizarse sin glitches visibles.
- [x] 6.4 Mover el cursor fuera de la paleta (e.g. al canvas): el preview debe desaparecer.
- [x] 6.5 Hover sobre un tile cerca del borde derecho del editor: el preview debe flipear a la izquierda del tile.
- [x] 6.6 Hover sobre el eraser: no debe aparecer preview.
- [x] 6.7 Verificar que el bloque `#ed-preview` ya no existe en el DOM (`document.getElementById('ed-preview')` retorna `null`).
- [x] 6.8 Verificar que el `title` tooltip del navegador sigue mostrando metadata al hacer hover (GID, key, frame, dimensions) — funciona como antes.
- [x] 6.9 Cambiar a tab `CLIMA` y volver a `ASSETS`: confirmar que no quedan restos del preview (no leak entre tabs).
- [x] 6.10 Abrir DevTools, monitorear que no haya errores en consola ni memory leaks por listeners duplicados al cambiar de tab/level.
- [x] 6.11 Cerrar el editor con el cursor sobre un tile y reabrir: el preview debe estar oculto al inicio (no leak de estado entre sesiones).
- [x] 6.12 Con la ventana del browser en un tamaño tal que el canvas se vea a otra escala (e.g. window pequeño con scale 6x, o grande con scale 2x), confirmar que el preview ajusta su tamaño real a esa escala.
