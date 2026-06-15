## 1. Fix tile ghost rendering

- [x] 1.1 En `public/src/engine/scenes/EditorScene.js:883`, dentro de `_renderHoverGhost`, reemplazar `tileset.name` por `tileset.key` en la llamada `this.add.sprite(...)` del fantasma de tile.
- [x] 1.2 En `public/src/engine/scenes/EditorScene.js:998`, dentro de `startDrag`, reemplazar `tileset.name` por `tileset.key` en la creación de `this.dragGhost`.

## 2. Fix object selection argument order

- [x] 2.1 En `public/src/engine/scenes/EditorScene.js:116`, dentro del callback `onObjectSelect`, cambiar la llamada a `setSelectionFromPalette` para que pase 5 argumentos: `setSelectionFromPalette('object', null, key, frame, type)`.

## 3. Clean up duplicate event handler

- [x] 3.1 En `public/src/engine/scenes/EditorScene.js:211-214`, eliminar el bloque `this.input.on('pointerupoutside', ...)` duplicado; conservar solo el de las líneas 217-223 (el que setea `this.painting = null`).

## 4. Verificación manual

- [x] 4.1 Abrir el editor con `npm start`, seleccionar un tileset y mover el cursor sobre el mapa: confirmar que aparece el fantasma correcto y que la consola no registra `Texture "__MISSING" has no frame "..."`.
- [x] 4.2 Click + drag sobre un tile existente: confirmar que el fantasma de drag renderiza con la textura del tile.
- [x] 4.3 En la pestaña Objects, seleccionar un frame (p. ej. cualquier frame de `Plants`) y hacer click en el mapa: confirmar que aparece el sprite del frame (no un cuadrado negro con barra).
- [x] 4.4 Repetir 4.3 con al menos un objeto de tipo spritesheet (p. ej. `Boats`, `Signs`) y uno con `frames` array (p. ej. `Trees`), para cubrir ambos caminos de carga.
- [x] 4.5 Verificar que `Ctrl+S` sigue guardando el nivel con el `key` correcto en los objetos colocados (abrir el JSON exportado y confirmar que el campo `key` es un string OBJECTS válido, no un número).
