## Why

Al arrastrar un tile u objeto en el editor (click izquierdo sostenido y mover el mouse) para moverlo de celda, el `dragGhost` sigue al cursor de forma fluida y se tinta de rojo si está fuera del mapa, pero **no se marca visualmente la celda destino**. El usuario no ve con claridad dónde va a aterrizar el elemento, sobre todo cuando:

- El elemento tiene un footprint multi-tile (p. ej. un `well` de 2×1) y el destino debe marcarse como un rectángulo de 2 tiles.
- El destino es inválido (fuera del mapa, sobre un muro, sobre otro objeto): el ghost se pone rojo pero no queda claro en qué celda(s) caería.

En el modo "copiar" (hover sin selección), el `hoverRect` sí se posiciona sobre la celda y cambia de color según validez — eso es lo que el usuario quiere ver también durante el drag.

## What Changes

- **`EditorScene.js:999-1004`** (`updateDrag`): además de mover el `dragGhost`, calcular el footprint del elemento arrastrado (`_getOccupancy` para objetos, 1×1 para tiles) y posicionar el `hoverRect` en el destino con tamaño y color adecuados:
  - Verde (`0x66ff99` para objetos, `0xffee88` para tiles) si la celda destino es válida y el destino es distinto del origen.
  - Rojo (`0xff0000`) si está fuera del mapa, sobre un muro (en el caso de objetos), o colisiona con otro objeto.
  - Rect oculto si el destino coincide con el origen (no es un movimiento).
- La animación fluida del `dragGhost` no se toca — solo se agrega el indicador de celda destino.

## Capabilities

### New Capabilities
- `drag-move-preview`: durante el drag de un elemento en el editor, la celda destino se marca con un borde (rectángulo) cuyo tamaño respeta el footprint del elemento y cuyo color indica validez.

### Modified Capabilities
- (ninguna)

## Impact

- Solo `public/src/engine/scenes/EditorScene.js` — `updateDrag` (~10 líneas adicionales).
- No afecta runtime, persistencia, ni formatos JSON.
- El comportamiento del `dragGhost` (animación fluida, tinte rojo al salir del mapa) se preserva.
- El `hoverRect` ya existe y se reusa; no se crean elementos gráficos nuevos.
