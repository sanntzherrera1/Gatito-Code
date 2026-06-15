## Context

El `fix-editor-rendering-bugs` cambió el origen de los sprites de fantasma de `tileset.name` (Tiled) a `tileset.key` (Phaser). Esto eliminó el error `__MISSING` en consola, pero la textura de cada tileset se carga con `load.image(t.key, t.url)` (ver `TileRegistry.js:preloadAssets`), que registra un único frame `__BASE` con la imagen completa. Los tiles individuales no existen como frames nombrados.

Al pasar `localIdx` (p. ej. `12`) a `add.sprite(key, 12)`, Phaser busca el frame `"12"` en la textura, no lo encuentra y cae a `__BASE` (toda la imagen). Por eso el ghost muestra la paleta entera del tileset en vez del GID seleccionado.

`BootScene.create()` ya resuelve un problema análogo para `OBJECTS` con `frames` propio (líneas 90-99): itera los frames de cada objeto y los registra como sub-frames con `tex.add(i, 0, f.x, f.y, f.w, f.h)`. La solución para tilesets es la misma idea, pero calculando coordenadas a partir de `cols`/`rows`/`TILE=16`.

## Goals / Non-Goals

**Goals:**
- Que `add.sprite(tileset.key, localIdx)` renderice el tile correcto (no la imagen completa).
- Mantener la consistencia con cómo se manejan los `OBJECTS` con `frames`.
- No tocar el tilemap del runtime (sigue usando `addTilesetImage` con sus propias coordenadas).

**Non-Goals:**
- No refactorizar el `BootScene` (mantener el patrón existente: `preloadAssets` carga, `create()` post-procesa).
- No cambiar la firma ni el orden de los campos de `TILESETS`.
- No agregar parámetros `tileWidth`/`tileHeight` por tileset: hoy todos son 16×16 (consistente con `TILE` en `config/game.js`).
- No modificar el código de fantasmas en `EditorScene.js` (ya pasa `localIdx` correctamente; con esta change, ese índice resuelve).

## Decisions

- **Registrar sub-frames en `create()`, no en `preload()`**: `create()` se ejecuta después de que el loader completa, garantizando que la textura ya existe. Es el mismo patrón que `OBJECTS` ya usa.
- **Función nueva en `TileRegistry.js` (`defineTileFrames`)**: análoga a `preloadAssets`, expone la lógica de indexación al lado de la definición de datos. El `BootScene` la llama por nombre, sin filtrar detalles de Phaser.
- **Calcular coordenadas a partir de `cols`/`rows`/`TILE`**: la grilla es uniforme. Constante `TILE = 16` importada de `config/game.js`. Si en el futuro hubiera tilesets de otro tamaño, se agregaría `tileWidth`/`tileHeight` por entrada.
- **Nombre de frame = índice 0-based como string**: `tex.add(String(idx), 0, col*TILE, row*TILE, TILE, TILE)`. Phaser hace `localIdx.toString()` para buscar frames por número, así que `"12"` casa con `add.sprite(key, 12)`.
- **Chequeo `if (!tex.has(String(idx)))`**: igual que el loop de OBJECTS, para no romper si una futura versión ya agregó los frames.
- **No usar `setCrop` en el editor**: sería un fix local en 2 sitios (`_renderHoverGhost` y `startDrag`) que duplica lógica. Sub-frames es la opción idiomática y queda como infraestructura reutilizable.

## Risks / Trade-offs

- **[Riesgo] Colisión de nombres con frames del tilemap runtime** → Mitigation: el tilemap de `TileLevelLoader.js` usa `getTileTextureCoordinates()` y su propio sistema de extracción; los nombres de frame que agregamos son metadata adicional, no se consultan. Verificado: `addTilesetImage` no inspecciona los nombres de frame de la textura.
- **[Riesgo] Aumento de memoria de texturas** → Acceptable: agregar ~80 frames por tileset (Grass tiene 11×7=77) son ~80 entradas de metadata, sin nuevos pixels. Sin impacto perceptible.
- **[Riesgo] Boot order: tilesets deben estar cargados antes de `defineTileFrames`** → Mitigation: `preload()` carga todo antes de que `create()` corra, por contrato de Phaser. Si una textura falta, `this.textures.get(t.key)` retorna `null` y el `if (!tex) continue` la saltea (mismo patrón que OBJECTS).
- **[Trade-off] Acoplamiento implícito con `TILE=16`** → Aceptable mientras todos los tilesets sean 16×16. Documentar en el comentario de la función.

## Open Questions

- (ninguna)
