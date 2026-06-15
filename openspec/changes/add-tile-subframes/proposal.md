## Why

El fix anterior (`fix-editor-rendering-bugs`) eliminó el error `Texture "__MISSING" has no frame "<n>"` al cambiar `tileset.name` por `tileset.key` en los fantasmas del editor. Pero como las texturas de tilesets se cargan con `scene.load.image(t.key, t.url)` (una sola imagen que contiene `cols * rows` tiles de 16×16), la textura solo tiene un frame `__BASE` que representa **toda la imagen**.

Cuando el editor hace `this.add.sprite(cx, cy, tileset.key, localIdx)`, Phaser busca el frame con nombre `String(localIdx)` (p. ej. `"12"`). Como ese frame no existe en la textura, Phaser hace fallback a `__BASE` y muestra la paleta entera del tileset en vez del tile seleccionado.

Resultado: el ghost de hover, el ghost de drag, el ghost de click-copiar y la selección de celda muestran la imagen completa del tileset (p. ej. toda la grilla de `Grass -> Verde`) en lugar del GID puntual que el usuario eligió.

El fix correcto es **registrar sub-frames en cada textura de tileset** (uno por tile, con coordenadas calculadas a partir de `cols`, `rows` y `TILE=16`), de la misma forma que `BootScene.create()` ya lo hace para los `OBJECTS` con `frames` propio. Así, `add.sprite(tileset.key, localIdx)` resuelve al sub-frame correcto y el ghost muestra el tile puntual.

## What Changes

- **Nueva función `defineTileFrames(scene)` en `public/src/engine/level/TileRegistry.js`**: itera `TILESETS`, obtiene cada textura con `scene.textures.get(t.key)` y agrega sub-frames nombrados `"0"`, `"1"`, ..., `"cols*rows-1"` con sus coordenadas `(col*16, row*16, 16, 16)`. Es análoga al loop existente para `OBJECTS` con `frames` (BootScene.js:90-99).
- **Llamada a `defineTileFrames(this)` en `public/src/engine/scenes/BootScene.js` `create()`**, justo después del loop de OBJECTS (línea 99) y antes de `createObjectAnimations(this)`.

## Capabilities

### New Capabilities
- `tile-texture-frames`: las texturas de tilesets (cargadas con `load.image`) exponen un sub-frame por celda del grid, indexable por posición 0-based dentro del tileset. Esto permite que el editor (y cualquier consumidor) renderice un tile puntual con `scene.add.sprite(key, localIdx)`.

### Modified Capabilities
- (ninguna — la spec `editor-palette` vive en otra change aún no archivada; el comportamiento que falla está cubierto por la spec de `editor-palette` pero el fix correcto es de infraestructura, no de uso en el editor)

## Impact

- Solo `public/src/engine/level/TileRegistry.js` (nueva función exportada) y `public/src/engine/scenes/BootScene.js` (1 línea de llamada en `create()`).
- El runtime de niveles no se ve afectado: `TileLevelLoader.js:29` ya usa `map.addTilesetImage(t.name, t.key, 16, 16, 0, 0, t.firstgid)`, que extrae tiles por coordenadas propias, no por nombre de frame. Agregar sub-frames a la textura es metadata adicional, no cambia el render del tilemap.
- Sin nuevas dependencias. Sin cambios en el formato JSON de niveles.
- El editor de `fix-editor-rendering-bugs` (líneas `EditorScene.js:877` y `EditorScene.js:992`) ya pasa `localIdx` como frame; con esta change, ese índice ahora resuelve al tile correcto.
