## Context

El editor de niveles (`public/src/engine/scenes/EditorScene.js`) tiene dos bugs activos que impiden usar el panel de tilesets y el panel de objects. Ambos producen errores de textura `__MISSING` en consola o en pantalla. Los `gid` y `obj.key` se siguen persistiendo correctamente (la lógica de pintado, history y save no está rota), pero la **previsualización visual** y la **colocación de objetos** no funcionan.

**Bug 1 — `tileset.name` vs `tileset.key`:** el registro `TILESETS` en `TileRegistry.js` define dos campos por tileset:
- `key`: clave de textura Phaser (p. ej. `'ts_grass'`). Es la que se usa en `BootScene.js:preloadAssets` con `scene.load.image(t.key, t.url)` y en `TileLevelLoader.js:29` con `map.addTilesetImage(t.name, t.key, ...)`.
- `name`: nombre Tiled legible (p. ej. `'grass'`). Se usa para serialización a JSON (`EditorScene.js:472`, `Storage.js:99`) y como label de tileset en el `Tilemap`.

El editor usa `tileset.name` (Tiled) en dos `this.add.sprite(...)` dentro de `_renderHoverGhost` (`EditorScene.js:883`) y `startDrag` (`EditorScene.js:998`). Phaser no encuentra la textura `'grass'`, cae al placeholder `__MISSING`, intenta acceder al frame `localIdx + 1` (p. ej. `'12'`) y falla con `Texture "__MISSING" has no frame "12"`.

**Bug 2 — argumentos rotados en `setSelectionFromPalette`:** la firma es `setSelectionFromPalette(type, gid, key, frame, objType)`. La llamada en `onObjectSelect` (`EditorScene.js:116`) pasa 4 args: `setSelectionFromPalette('object', key, frame, type)`. Resultado: en el slot `gid` cae el OBJECTS key (ignorado en la rama `object`), en `key` cae el frame, en `frame` cae el type, y `objType` queda `undefined`. `this.selection` queda con valores rotados:
- `selection.key` = número de frame (p. ej. `0`) en vez de OBJECTS key
- `selection.frame` = string del type (p. ej. `'deco'`) en vez de índice
- `selection.objType` = `undefined`

`_tryPaste` consume `this.selection` (no `this.selectedObject`) y arma el objeto con `key: 0` y `frame: 'deco'`. `_renderObject` busca `OBJECTS.find(o => o.key === 0)` → `undefined`. `add.sprite(cx, cy, 0, 0)` no encuentra la textura → `__MISSING` (cuadrado negro con barra diagonal).

Hay además un **handler duplicado** `pointerupoutside` registrado en `EditorScene.js:211-214` y `EditorScene.js:217-223`. El segundo sobrescribe al primero en cuanto a `this.painting = null`. No causa bug visible, pero es código muerto que conviene limpiar.

## Goals / Non-Goals

**Goals:**
- Que el fantasma de hover de tileset renderice con la textura correcta.
- Que el fantasma de drag de tile renderice con la textura correcta.
- Que al colocar un objeto desde el panel Objects, el sprite renderizado sea el frame seleccionado (no un placeholder).
- Que `this.selection` (en modo objeto) tenga `key` = OBJECTS key, `frame` = índice numérico, `objType` = tipo string.
- Limpiar el handler duplicado.

**Non-Goals:**
- No refactorizar `setSelectionFromPalette` (la firma es funcional, el problema es el call site).
- No agregar nuevas validaciones al placement ni al ghost.
- No tocar runtime, persistencia, formatos JSON ni `TileRegistry`.
- No agregar tests automatizados (el proyecto no tiene infraestructura para testear el editor; la verificación es manual vía HUD y consola del navegador).

## Decisions

- **Fix mínimo, no refactor:** cambiar 4 líneas en `EditorScene.js`. No mover la lógica de `setSelectionFromPalette` ni introducir un wrapper.
- **Para el bug 1, usar `tileset.key`:** es la clave Phaser correcta. `tileset.name` se sigue usando en `addTilesetImage` (que recibe ambos) y en serialización.
- **Para el bug 2, pasar `null` en el slot `gid`:** mínima perturbación de la firma. Alternativa considerada: reordenar los parámetros de `setSelectionFromPalette` para que la rama `object` empiece en la posición 2. Descartada porque rompe el call site del tile (`setSelectionFromPalette('tile', gid)`) y exige un cambio de orden sin beneficio real.
- **Eliminar el segundo `pointerupoutside`:** el primero (líneas 211-214) queda obsoleto al existir el segundo (217-223) que además setea `this.painting = null`. Conservamos el segundo.

## Risks / Trade-offs

- **[Riesgo] Regresión visual en fantasmas** → Mitigation: la sustitución `tileset.name` → `tileset.key` es 1:1 (ambos campos existen en cada tileset). Si por algún motivo futuro un tileset se registra sin `key`, el error será inmediato y detectable.
- **[Riesgo] Cambio de comportamiento al pasar `null` en el slot `gid`** → Mitigation: la rama `type === 'object'` del switch nunca lee `gid`. Confirmado por lectura: solo se usa en la rama `'tile'`. Pasar `null` no tiene efecto colateral.
- **[Trade-off] No se agrega test automatizado** → Acceptable: el proyecto no testea `engine/`. La verificación es manual (abrir editor, seleccionar tileset y objeto, colocar).
- **[Riesgo] Quedan referencias a `this.selection.key` o `.frame` en otros lugares que asuman los valores rotados** → Mitigation: grep tras el fix. Hoy `_tryPaste` y `_updateSelectionUI` son los únicos lectores. Verificado en el análisis previo.

## Open Questions

- (ninguna)
