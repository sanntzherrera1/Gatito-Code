## Why

El "layer picker" (la ventana flotante que aparece junto al cursor al hacer hover sobre una celda en modo "copiar") está incompleto:

1. **No aparece con un solo elemento.** `_showSourceHighlight` exige `layers.length > 1` para mostrarlo (`EditorScene.js:858`). Si la celda tiene únicamente un tile en `floor` (o cualquier otro elemento único), el picker se oculta y el usuario no ve qué hay ahí.
2. **No incluye objetos.** `getLayersAt` (`EditorScene.js:1107-1118`) solo recorre las 5 capas de tiles (`top`, `overlay`, `walls`, `path`, `floor`) y devuelve únicamente `{ layer, gid, tileset }`. Los `OBJECTS` que ocupan esa celda nunca entran al stack, así que el picker muestra solo los tiles — incluso si la celda tiene un árbol o un cofre encima.

`renderLayerPicker` (`editor-ui.js:145-194`) tampoco sabe manejar objetos: usa `tileset.url` para el thumbnail y dispara `onLayer(layer) + onSelect(gid)` en el click. Si le pasara un objeto, no sabría cómo renderizarlo ni qué acción ejecutar.

El usuario espera que el picker refleje **toda la pila de elementos** de la celda, sin importar la cantidad ni el tipo.

## What Changes

- **`EditorScene.js:858`** (`_showSourceHighlight`): bajar el umbral de `layers.length > 1` a `layers.length > 0`. Si la celda tiene cualquier elemento, mostrar el picker.
- **`EditorScene.js:1107-1118`** (`getLayersAt`): además de las 5 capas de tiles, iterar `this.objects` y agregar al stack las entradas que ocupen la celda (respetando `occupyW`/`occupyH` por frame). Cada item tendrá un campo `type`: `'tile'` o `'object'`. Los objetos se listan al inicio del array (encima visualmente); los tiles mantienen el orden actual (`top → floor`).
- **`editor-ui.js:145-194`** (`renderLayerPicker`): agregar rama para items `type === 'object'`. El thumbnail se construye desde `objDef.url` y el frame correspondiente (mismo cálculo que `updateObjectPreview` en `editor-ui.js:319-356`); el label es el `objDef.key` y el valor es `f<frame>`. En el click, llamar `edCfg.onObjectSelect(key, frame, objType)` (mismo callback que el panel de Objects) en vez de `onLayer + onSelect`.

## Capabilities

### New Capabilities
- `layer-picker-stack`: el panel flotante del editor debe listar todos los elementos presentes en una celda — tiles (de cualquier capa) y objetos — para que el usuario pueda ver e inspeccionar el contenido de la celda aunque haya un solo elemento.

### Modified Capabilities
- (ninguna)

## Impact

- 2 archivos: `public/src/engine/scenes/EditorScene.js` (umbral + `getLayersAt`) y `public/src/ui/editor-ui.js` (render del picker).
- No afecta runtime, persistencia, ni formatos JSON.
- No introduce nuevas dependencias.
- El contrato `getLayersAt(...) → Array<{type, ...}>` cambia de forma: los items tiles ahora incluyen `type: 'tile'` explícito (antes no tenían ese campo). El único consumidor es `renderLayerPicker` (mismo cambio), así que el cambio es autocontenido.
