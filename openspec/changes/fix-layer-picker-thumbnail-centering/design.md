## Context

El `#ed-layer-picker-thumb` es un container DOM de 20×20px (definido en `editor.css:739-748`). En `renderLayerPicker` (editor-ui.js:190-210), para objetos con `frames` array, se renderiza el frame como background-image con:

```js
const scale = Math.min(20 / f.w, 20 / f.h);
thumb.style.backgroundSize = `${imgW * scale}px ${imgH * scale}px`;
thumb.style.backgroundPosition = `-${f.x * scale}px -${f.y * scale}px`;
```

`imgW` y `imgH` son el bounding box de todos los frames (`max(x+w)`, `max(y+h)`). `scale` se calcula para que el frame quepa en 20×20. `backgroundPosition` posiciona el frame en la esquina superior-izquierda del container.

El problema: para frames 16×16, el frame escalado es 20×20 (scale=1.25), llena el container, se ve bien. Pero para frames con otra proporción (16×32, 32×32, 48×48, etc.), el frame escalado es más pequeño que 20×20 y queda **pegado a un lado** del container en vez de centrado.

**Ejemplos concretos (todos en `TileRegistry.js`):**

| Objeto | Frames afectados | Tamaño | Scale | Posición del frame en container |
|---|---|---|---|---|
| `furniture` (line 160) | 6, 7, 8, 17, 18, 19 | 16×32 | 0.625 | Frame 10×20 en (0,0) a (10,20) — mitad izquierda |
| `grass_props` (line 121) | 1, 2, 6, 7, 8, 17, 18, 19 | 32×32, 16×32 | 0.625 | Frame 20×20 o 10×20, descentrado |
| `trees` (line 200) | 0, 6, 7, 8, 9, 10, 11, 17, 18, 19 | 16×32, 32×32, 48×48 | 0.625/0.417 | Descentrado |
| `mushrooms` (line 410) | 7 | 64×48 | 0.3125 | Frame 20×15, arriba |
| `wood_bridge` (line 566) | 0, 1 | 16×48 | 0.417 | Frame 6.67×20, izquierda |
| `farming` (line 457) | varios | 16×32 | 0.625 | Descentrado |
| `water_objs` (line 515) | 4 | 32×16 | 0.625 | Frame 20×10, arriba |
| `well` (line 578) | 0 | 32×32 | 0.625 | Frame 20×20, OK pero descentrado |
| `workstation` (line 585) | 0 | 32×32 | 0.625 | Frame 20×20, OK pero descentrado |
| `premium_char` (line 641) | varios | 16×32, 32×32, 48×48 | 0.625/0.417 | Descentrado |

## Goals / Non-Goals

**Goals:**
- El frame se muestra **centrado** dentro del container 20×20, sin importar su aspect ratio.
- El fix aplica a **todos** los objetos con `frames` array, no solo a los que el usuario reportó.
- No se cambia el tamaño del container (sigue siendo 20×20).
- No se cambia la lógica de selección de frames ni el `backgroundSize`.

**Non-Goals:**
- No cambiar el CSS de `.ed-layer-picker-thumb` (sigue siendo 20×20 fijo).
- No adaptar el container al aspect ratio del frame (como hace `updateObjectPreview` para el panel de preview).
- No cambiar la fórmula de `imgW`/`imgH` (bounding box de frames).
- No afectar la rama de spritesheets (`else` con `cols`/`rows`) — esos siempre son 16×16.

## Decisions

- **Centrar con `backgroundPosition` ajustado**: la fórmula correcta para centrar un frame de tamaño `(frameW, frameH)` dentro de un container de tamaño `(THUMB_SIZE, THUMB_SIZE)`:
  ```
  offsetX = (THUMB_SIZE - frameW) / 2 - f.x * scale
  offsetY = (THUMB_SIZE - frameH) / 2 - f.y * scale
  backgroundPosition = `${offsetX}px ${offsetY}px`
  ```
  Donde `THUMB_SIZE = 20` (constante que coincide con el CSS). El `scale` y `backgroundSize` se mantienen iguales que antes.

- **Constante `THUMB_SIZE` en lugar de leer del CSS**: leer `getComputedStyle(thumb).width` sería más "correcto" pero más complejo y propenso a race conditions (el CSS puede no estar aplicado aún). Hardcodear `20` es simple y robusto — si el CSS cambia, hay que actualizar ambos. Documentar en el código.

- **No usar `object-fit: contain` ni `object-position`**: esas son propiedades de `<img>` y `<video>`, no aplican a `background-image`. La alternativa CSS `background-size: contain` con `background-position: center` haría lo mismo pero no permitiría mostrar un frame específico (mostraría toda la imagen centrada). El approach de JS es necesario para recortar el frame correcto.

- **Verificación manual de los frames específicos del usuario**: el usuario mencionó furniture frames 6, 7, 8, 17, 18, 19. El fix los cubre y también todos los demás frames no-cuadrados. No se requiere una lista exhaustiva en la spec.

## Risks / Trade-offs

- **[Riesgo] Cambio de CSS futuro** → Mitigation: si alguien cambia el tamaño del thumb en `editor.css` a algo distinto de 20px, el cálculo quedará desincronizado. Documentar la dependencia en un comentario. Alternativa: leer el tamaño con `getComputedStyle`, pero es más frágil (puede no estar listo en el momento del render).
- **[Trade-off] No adaptar container al frame** → El approach alternativo (como `updateObjectPreview`) sería hacer el container del tamaño del frame escalado. Pero eso haría que los items del picker tengan alturas variables, rompiendo la uniformidad visual. Aceptable mantener 20×20 fijo.
- **[Riesgo] Frames con `imgW`/`imgH` incorrectos** → Si el bounding box de frames no coincide con el tamaño real de la imagen, el background se muestra más pequeño. Esto es un problema preexistente y no se aborda en esta change. El `imgW`/`imgH` se calculan como `max(x+w)` y `max(y+h)`, que debería ser el tamaño real de la imagen si los frames están bien definidos.

## Open Questions

- (ninguna)
