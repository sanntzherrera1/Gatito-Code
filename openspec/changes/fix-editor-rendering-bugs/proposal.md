## Why

El editor tiene dos bugs que rompen la previsualización y colocación de elementos:

1. Al seleccionar cualquier tileset en el panel, los fantasmas de hover/drag registran `Texture "__MISSING" has no frame "12"` en consola porque `EditorScene.js` usa `tileset.name` (nombre Tiled) donde debería usar `tileset.key` (clave de textura Phaser).
2. Al seleccionar un frame del panel Objects y colocarlo en el mapa, aparece un cuadrado negro con barra diagonal (textura `__MISSING` de Phaser) porque `onObjectSelect` llama a `setSelectionFromPalette` con un argumento de menos, corriendo los valores un lugar: `this.selection.key` queda con el número de frame en vez de la clave OBJECTS, y `this.selection.frame` queda con el string del tipo en vez del índice de frame.

Ambos bugs son internos del editor y no rompen la persistencia (los `gid` y `obj.key` se guardan correctamente), pero hacen inutilizable la previsualización y la colocación visual. Hay que arreglarlos para que el editor sea usable.

## What Changes

- **`EditorScene.js:883`** (`_renderHoverGhost`): cambiar `tileset.name` por `tileset.key` en la llamada `this.add.sprite(...)` para el fantasma de tile.
- **`EditorScene.js:998`** (`startDrag`): mismo cambio en la creación de `this.dragGhost` para tile.
- **`EditorScene.js:116`** (`onObjectSelect`): añadir el slot `gid` (con `null`) a la llamada `setSelectionFromPalette('object', null, key, frame, type)` para que los argumentos caigan en los parámetros correctos y `this.selection` refleje el OBJECTS key, el índice de frame y el tipo.
- **`EditorScene.js:211-223`**: eliminar el `pointerupoutside` duplicado (queda solo el que setea `this.painting = null`).

## Capabilities

### New Capabilities
- `editor-palette`: comportamiento esperado del panel de tilesets y objetos en el editor — selección, preview/ghost y colocación en el mapa.

### Modified Capabilities
- (ninguno — no hay specs previos; el fix es contra bugs del comportamiento actual implícito)

## Impact

- Solo `public/src/engine/scenes/EditorScene.js` (4 líneas modificadas/eliminadas).
- No afecta runtime, ni persistencia, ni formatos de nivel.
- No introduce dependencias nuevas.
- Riesgo bajo: el cambio es localizado, no toca lógica de pintado, history ni save.
