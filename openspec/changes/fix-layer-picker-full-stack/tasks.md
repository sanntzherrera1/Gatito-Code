## 1. Mostrar el picker para cualquier celda no vacía

- [x] 1.1 En `public/src/engine/scenes/EditorScene.js`, dentro de `_showSourceHighlight` (línea ~858), cambiar la condición `if (layers.length > 1)` por `if (layers.length > 0)` para que el picker se muestre con 1 o más elementos (y se oculte solo si la celda está vacía).

## 2. Incluir objetos en el stack

- [x] 2.1 En `public/src/engine/scenes/EditorScene.js`, reescribir `getLayersAt` (`EditorScene.js:1107-1118`) para que:
  - Itere primero `this.objects` y, usando `OBJECTS.find` + `getFrameDimensions` + `this._getOccupancy`, agregue al array un item `{ type: 'object', key, frame, objType, objDef }` por cada objeto cuya huella cubra `(tx, ty)`.
  - Luego itere las 5 capas de tiles (`top`, `overlay`, `walls`, `path`, `floor`) y agregue `{ type: 'tile', layer, gid, tileset: this.getTilesetForGid(gid) }` para los `gid !== 0`.
  - Verificar que `OBJECTS` y `getFrameDimensions` estén importados en el archivo (ya lo están).

## 3. Renderizar objetos en el picker

- [x] 3.1 En `public/src/ui/editor-ui.js`, dentro de `renderLayerPicker` (líneas 145-194), agregar una rama para `item.type === 'object'`:
  - El thumbnail se construye con `objDef.url` y el rect del frame: si `objDef.frames` es array, usar `objDef.frames[frame]` para `f` y `imgW/imgH` = máx de los frames; si no, calcular desde `objDef.cols/rows/frameW/frameH` (mismo cálculo que `updateObjectPreview` en líneas 326-338).
  - El label muestra el `objDef.key` y el valor muestra `f<frame>` (en vez de `GID <gid>`).
  - El `onclick` llama `edCfg.onObjectSelect(item.key, item.frame, item.objType)` y luego `hideLayerPicker()`.

## 4. Verificación manual

- [x] 4.1 Abrir el editor, hover sobre una celda con un único tile en `floor` (sin objeto encima): el picker debe aparecer listando ese tile.
- [x] 4.2 Hover sobre una celda con tiles en varias capas (`floor` + `walls` + `top`): el picker debe listar las 3 capas en orden `top → walls → floor`.
- [x] 4.3 Colocar un objeto (p. ej. un `tree`) en una celda con un `floor` tile debajo. Hover sobre esa celda: el picker debe listar primero el objeto y debajo el tile de `floor`.
- [x] 4.4 Hover sobre una celda vacía (sin tile ni objeto): el picker NO debe aparecer.
- [x] 4.5 Hover sobre un objeto multi-tile (p. ej. `well` de 2×1) en cada una de las 2 celdas que cubre: el picker debe listar el objeto en ambas celdas.
- [x] 4.6 Click sobre un item tile en el picker: el editor debe seleccionar ese tile (HUD muestra "pegar tile GID X") y ocultarse el picker.
- [x] 4.7 Click sobre un item objeto en el picker: el editor debe seleccionar ese objeto (HUD muestra "pegar <key> f<frame>") y el panel Objects debe resaltar el frame correspondiente.
