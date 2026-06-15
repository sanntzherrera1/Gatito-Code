## Why

El layer picker (`#ed-layer-picker`) tiene tres problemas visibles:

1. **Posicionamiento incorrecto.** En `editor-ui.js:219-223` la fórmula usa `tx * 16` (píxeles de juego) en vez de píxeles del viewport. El canvas está escalado 4×, así que el picker aparece pegado a la esquina superior izquierda del canvas, lejos de la celda bajo el cursor. El usuario quiere que aparezca **junto a la celda** que está inspeccionando.

2. **No muestra de qué layer es cada elemento.** Para tiles, el label ya es el nombre del layer (`walls`, `floor`, etc.) — eso está bien, pero falta hacerlo **prominente** como un badge al inicio de la fila. Para objetos, el label es la key OBJECTS (`plants`, `cow`, etc.) sin ninguna indicación de la "capa" (los objetos no están en un layer específico, pero el usuario quiere ver **explícitamente** de qué tipo es cada elemento del stack para distinguirlos a simple vista).

3. **Funcionalidad no deseada.** Los items del picker son clickeables y al hacer click copian el elemento al portapapeles de selección. El usuario no pidió esa interacción — el picker debe ser **puramente informativo**, sin acciones de click. Además, prefiere que aparezca **a la izquierda** de la celda (no a la derecha).

## What Changes

- **`editor-ui.js:217-223`** (posicionamiento en `renderLayerPicker`): usar la escala real del canvas (`canvas.width` interno vs `rect.width` del viewport) en vez de asumir 1:1. Posicionar el picker **a la izquierda de la celda** con un offset pequeño (8px). Si la celda está en el borde izquierdo del canvas y el picker no entra, caer a la derecha.
- **`editor-ui.js:153-213`** (rendering de cada item): agregar un **badge de layer** al inicio de cada fila, siempre con uno de los 5 nombres válidos:
  - `tile` → badge con el **nombre del layer en mayúsculas** (`WALLS`, `FLOOR`, `PATH`, `OVERLAY`, `TOP`), con color que identifique el layer
  - `object` → badge `"TOP"` (los objetos se renderizan sobre el top layer, así que ese es su layer a efectos del picker)
  - Para tiles, el label pasa a ser el **nombre del tileset** (campo `tileset.label` o `tileset.name`, p. ej. `"Classic"`, `"Verde"`) en vez del layer, para no duplicar info con el badge.
  - Para objetos, el label sigue siendo la key OBJECTS (sin cambios).
- **Remover los `row.onclick` handlers** (tile y object) — el picker es solo informativo, no debe copiar nada al click.
- En el valor de la derecha, mantener el formato actual (`GID <n>` para tiles, `f<n>` para objetos).

## Capabilities

### New Capabilities
- `layer-picker-position-and-labels`: el layer picker se posiciona a la izquierda de la celda inspeccionada, cada item muestra un badge con el nombre del layer (uno de los 5 válidos) y es puramente informativo (sin handlers de click).

### Modified Capabilities
- (ninguna — la spec `layer-picker-stack` ya está en otra change; la del presente change es complementaria)

## Impact

- Solo `public/src/ui/editor-ui.js` (~20 líneas modificadas en `renderLayerPicker`).
- No afecta runtime, persistencia, ni formatos JSON.
- No introduce nuevas dependencias.
- Sin cambios en la API del callback (`__setEditor_showLayerPicker`); solo cambia el rendering interno.
- **Comportamiento removido**: el picker ya no copia el elemento al hacer click. Esto era una interacción no documentada y no probada — ningún cambio de regresión esperado.
