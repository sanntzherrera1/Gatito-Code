## Context

El editor de Gatito-Code tiene dos modos de interacción con el cursor: "copiar" (sin selección) y "pegar" (con selección). Ambos ya muestran un `hoverRect` sobre la celda destino:

- `_showSourceHighlight` (modo copiar, `EditorScene.js:840-857`): rectángulo en la celda del elemento bajo el cursor, color según tipo.
- `_showPlacementPreview` (modo pegar, `EditorScene.js:806-837`): rectángulo en la celda destino de la selección activa, verde si es válido, rojo si no.

El "drag-to-move" (click izquierdo sostenido + mover) entra cuando el usuario agarra un elemento existente y lo arrastra. `startDrag` (`EditorScene.js:977-1003`) crea un `dragGhost` que sigue al cursor y guarda `this.dragSource` con el origen. `updateDrag` (`EditorScene.js:1005-1010`) solo reposiciona el `dragGhost` y le aplica tinte rojo si está fuera del mapa. **No toca el `hoverRect`**.

Resultado: durante el drag, el `hoverRect` queda oculto (el branch `if (this.dragState?.active)` en `updateHover` llama `_destroyHoverGhost` y no hace nada con el `hoverRect` directamente — pero el `hoverRect` se había ocultado antes al iniciar el drag porque el último frame de `updateHover` previo a `startDrag` ya no se ejecuta en la rama de drag). El usuario ve el ghost seguir al cursor pero no sabe dónde va a aterrizar.

## Goals / Non-Goals

**Goals:**
- Mostrar el `hoverRect` en la celda destino durante el drag, con tamaño = footprint del elemento (1×1 para tiles, multi-tile para objetos) y color = verde/rojo según validez.
- Reusar el `hoverRect` existente (no crear un nuevo elemento gráfico).
- Mantener la animación fluida del `dragGhost` (no tocarla).
- Mantener el tinte rojo del `dragGhost` cuando el cursor está fuera del mapa.

**Non-Goals:**
- No marcar visualmente la celda origen (el elemento sigue ahí hasta `endDrag`, así que ya es visible).
- No agregar lógica nueva de validación — se reusa la de `endDrag` (`_hasObjectCollision` para objetos, bounds check) y `_placeObject` (`this.flat.walls[...]` check).
- No cambiar el comportamiento del `dragGhost` (animación, tinte, sprite).
- No ocultar el `hoverRect` al final del drag (ya se hace en `endDrag` y `cancelDrag` indirectamente al pasar a modo no-drag).

## Decisions

- **Calcular footprint una sola vez por drag, no en cada `updateDrag`**: para objetos, `getFrameDimensions` y `_getOccupancy` se llaman en cada `pointermove`. `getFrameDimensions` hace un `OBJECTS.find` que es O(N) — el array `OBJECTS` tiene ~50 entradas, así que es despreciable. Pero por limpieza, el footprint se puede cachear en `this.dragSource` cuando se crea en `startDrag` (ahí ya se conoce el `key` y `frame`).
- **Reutilizar el `hoverRect`**: ya existe (`EditorScene.js:88-89`). En `updateDrag`, después de mover el `dragGhost`, se calcula el rect destino y se actualiza su `setPosition`, `setSize`, `setStrokeStyle`, `setVisible`.
- **Color verde = mismo tono que modo copiar**: `0x66ff99` para objetos (igual que `_showSourceHighlight`), `0xffee88` para tiles. Rojo `0xff0000` para inválido. Coherente con la convención existente.
- **Ocultar el rect si el destino coincide con el origen**: el drag en el mismo lugar no es un movimiento (el `endDrag` ya hace `if (tx === src.tx && ty === src.ty) { this.cancelDrag(); return; }`). El `hoverRect` se oculta para no confundir.
- **Para tiles, footprint siempre 1×1**: aunque hay tilesets con `properties.isRock`, los tiles siguen siendo 16×16 dentro del juego. No hay concepto de tile multi-celda en el editor.
- **Validación = mismas reglas que `endDrag`**:
  - Bounds: `tx/ty` dentro de `[0, cols/rows)`.
  - Para objetos: cada celda del footprint dentro de bounds, no hay muro en `flat.walls[...]`, no hay colisión con otro objeto (`_hasObjectCollision`).
  - Si alguna falla → rojo. Si todas pasan → verde (excepto si destino == origen → oculto).

## Risks / Trade-offs

- **[Riesgo] `updateDrag` se llama en cada `pointermove`** → Mitigation: el cálculo extra (footprint + checks) es O(1) por celda + O(N) por check de objetos. Para N objetos < 100, es imperceptible.
- **[Trade-off] Doble rect durante el drag**: el `dragGhost` ya marca visualmente la posición del cursor. Agregar el `hoverRect` puede sentirse redundante. → Acceptable: el ghost es "lo que llevás en la mano", el rect es "dónde lo vas a soltar". Visualmente complementarios.
- **[Riesgo] Color del `hoverRect` para tiles usa `0xffee88` (amarillo)** → El usuario puede confundirlo con el `hoverRect` de modo copiar. → Aceptable: durante el drag no se está en modo copiar (el `dragState` está activo), así que no hay ambigüedad contextual.
- **[Trade-off] El ghost se mantiene visible cuando se arrastra al mismo lugar** → El ghost sigue al cursor y tinte normal; el `hoverRect` se oculta. El usuario ve el ghost pero ningún destino. → Acceptable: el cursor está sobre la celda origen, visualmente claro.

## Open Questions

- (ninguna)
