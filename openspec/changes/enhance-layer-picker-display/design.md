## Context

El `#ed-layer-picker` es un panel DOM posicionado en `position: absolute`. Se llena desde `renderLayerPicker(tx, ty, layers)` en `editor-ui.js`. Tres problemas:

1. **Posicionamiento.** La fórmula original usaba `tx * 16` (píxeles de juego) en vez de píxeles del viewport, así que el picker aparecía en la esquina del canvas en vez de junto a la celda. Ya corregido en la primera iteración de esta change usando `scaleX = rect.width / canvas.width`, pero el usuario prefiere que aparezca a la **izquierda** de la celda, no a la derecha.

2. **Tipo del item.** Cada item del stack es `{ type: 'tile' | 'object', ... }` (definido en `EditorScene.getLayersAt`). El usuario quiere ver explícitamente el **layer** de cada elemento, no el tipo. Para tiles, el layer es `walls`/`floor`/`path`/`overlay`/`top`. Para objetos, no hay layer propio pero se renderizan sobre el `top` layer, así que se usa `"TOP"` como badge.

3. **Funcionalidad no deseada.** Los items del picker tenían handlers `row.onclick` que copiaban el tile/objeto al portapapeles de selección al hacer click. Esta interacción no fue pedida y debe removerse — el picker debe ser puramente informativo.

`tx` y `ty` son coordenadas de celda (0..15, 0..11). El cell size es 16 píxeles de juego = 64 píxeles de viewport (con zoom=4). El CSS existente (`editor.css`) define `.ed-layer-picker` con posición absoluta y `visible`/`hidden` via clase.

## Goals / Non-Goals

**Goals:**
- El picker aparece **a la izquierda** de la celda bajo el cursor, con un gap de ~8px.
- Si la celda está en el borde izquierdo del canvas y el picker no entra, caer a la derecha.
- Cada item muestra un **badge de layer** al inicio de la fila, siempre con uno de los 5 valores válidos (`FLOOR`, `WALLS`, `PATH`, `OVERLAY`, `TOP`).
- El picker es **puramente informativo** — sin handlers de click, sin selección, sin acciones.
- La posición se calcula usando la escala real del canvas (robusto al zoom y resize).

**Non-Goals:**
- No cambiar el estilo visual del picker más allá del badge y la posición.
- No agregar interactividad nueva (drag, keyboard nav, etc.).
- No cambiar el orden de los items en el stack (objetos primero, luego tiles top→floor).
- No cambiar el formato del valor de la derecha (`GID <n>` o `f<n>`).
- No mover el picker cuando el cursor se mueve dentro de la misma celda (ya se reposiciona en cada `pointermove`).
- No eliminar la función `hideLayerPicker` ni el callback `__setEditor_hideLayerPicker` — siguen usándose cuando el cursor sale de una celda con elementos.

## Decisions

- **Posición preferida: izquierda de la celda.**
  - `cellLeft = rect.left + (tx * 16) * scaleX` — borde izquierdo de la celda en píxeles del viewport.
  - `leftPx = cellLeft - pickerWidth - gap` — a la izquierda de la celda.
  - Si `leftPx >= 4` (hay al menos 4px de margen), usar `leftPx`.
  - Si no, caer a `rightPx = cellLeft + 16 * scaleX + gap` (a la derecha de la celda).
  - Esto da preferencia a la izquierda (la preferencia del usuario) pero no se sale del viewport en el borde izquierdo.

- **Clamping horizontal con `Math.min` + `Math.max`**:
  - `Math.max(px, 4)` — al menos 4px del borde izquierdo.
  - `Math.min(px, window.innerWidth - pickerWidth - 4)` — al menos 4px del borde derecho.
  - Esto reemplaza el `Math.min(px, window.innerWidth - 160)` anterior (que usaba un valor fijo de 160 en vez de `pickerWidth` real).

- **Badge de layer como `<span>` separado**: se agrega un nuevo `<span class="ed-layer-picker-type">` al inicio de cada fila, antes del thumb. Texto: el **nombre del layer en mayúsculas** (`WALLS`, `FLOOR`, `PATH`, `OVERLAY`, `TOP`). Para objetos, el badge es `"TOP"`. Estilo: fondo semitransparente, padding pequeño, border-radius. El color del badge es por layer (floor=verde, path=marrón, walls=marrón oscuro, overlay=azul, top=violeta).

- **Remover `row.onclick`**: tanto para tiles (`edCfg.onLayer + edCfg.onSelect`) como para objects (`edCfg.onObjectSelect`). El picker se vuelve puramente informativo. La función `hideLayerPicker` se sigue llamando desde otros lugares (cuando el cursor sale de la celda), así que se preserva.

- **No agregar clase CSS nueva por ahora**: el badge se estiliza inline (background, color, padding). Si en el futuro se quiere tematizar, se puede mover a `editor.css`. Mínimo cambio para esta change.

- **Posición vertical sin cambios**: el picker sigue alineado al top de la celda (`ty * 16 * scaleY`).

## Risks / Trade-offs

- **[Riesgo] `canvas.width` puede ser 0 si el canvas no está listo** → Mitigation: el picker solo se renderiza cuando hay `layers` y el editor está activo, momento en que el canvas ya existe. Pero defensivamente, si `canvas.width === 0`, usar `scaleX = 1` para evitar división por cero.
- **[Riesgo] Cambio de zoom futuro invalida el cálculo** → Mitigation: la fórmula usa el ratio real del canvas, no un valor hardcodeado. Si el zoom cambia, el cálculo se adapta automáticamente.
- **[Trade-off] Badge inline vs clase CSS**: más rápido de implementar inline, menos mantenible a largo plazo. Aceptable para esta change; refactor cuando se agregue un tercer estilo.
- **[Trade-off] Picker a la izquierda puede caer a la derecha en celdas del borde izquierdo** → Aceptable: es el comportamiento de fallback esperado. El usuario pidió "preferentemente a la izquierda", no "exclusivamente a la izquierda".
- **[Trade-off] Remover los handlers de click** → El picker pierde la capacidad de "copiar al hacer click". Esto no fue pedido por el usuario y no está documentado en ningún spec. No hay riesgo de regresión en funcionalidad esperada.

## Open Questions

- (ninguna)
