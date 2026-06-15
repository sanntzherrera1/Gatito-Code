## Why

El thumbnail (`#ed-layer-picker-thumb`) del layer picker no centra los frames con aspect ratio ≠ 1:1. El código en `editor-ui.js:205-208` calcula `backgroundSize` y `backgroundPosition` en función de la escala del frame (`scale = min(20/f.w, 20/f.h)`), pero el `backgroundPosition` se calcula como `-f.x*scale, -f.y*scale` — que posiciona el frame en la esquina superior-izquierda del container, no centrado.

Para frames 16×16 (la mayoría), el frame llena el container 20×20 y se ve bien. Pero para frames con otra proporción (16×32, 32×32, 48×48, etc.), el frame aparece pegado a un lado y/o se corta:
- **Furniture** (frames 6, 7, 8, 17, 18, 19): 16×32 → scale=0.625, frame 10×20, queda en la mitad izquierda, no centrado
- **Trees** (varios variants): 16×32, 32×32, 48×48 → mismo problema
- **Mushrooms** (frame 7): 64×48 → scale=0.3125, frame 20×15, queda en la parte superior
- **Wood bridge** (frame 0, 1): 16×48 → scale=0.417, frame 6.67×20, queda a la izquierda
- **Well/Workstation** (frame 0): 32×32 → scale=0.625, frame 20×20, queda OK pero descentrado
- **Premium char / NPC animado**: 16×32, 32×32, 48×48 → mismo problema
- **Farming** (varios): 16×32 → mismo problema
- **Water objs** (frame 4): 32×16 → scale=0.625, frame 20×10, queda arriba

El fix correcto: centrar el frame dentro del container 20×20, calculando el offset para que el centro del frame coincida con el centro del container.

## What Changes

- **`editor-ui.js:205-208`** (rendering del thumbnail de objetos con `frames`): cambiar la fórmula de `backgroundPosition` para centrar el frame dentro del container 20×20:
  - Calcular `frameW = f.w * scale` y `frameH = f.h * scale` (tamaño del frame escalado).
  - Calcular `offsetX = (THUMB_SIZE - frameW) / 2 - f.x * scale` y `offsetY = (THUMB_SIZE - frameH) / 2 - f.y * scale` donde `THUMB_SIZE = 20` (valor del CSS `.ed-layer-picker-thumb`).
  - Aplicar `backgroundPosition: ${offsetX}px ${offsetY}px`.
  - `backgroundSize` se mantiene: `${imgW * scale}px ${imgH * scale}px` (toda la imagen escalada).
- Esto aplica a **todos** los objetos con `frames` array, no solo a `furniture`. Beneficia a trees, mushrooms, farming, wood_bridge, well, workstation, premium_char, y todos los objetos con frames de tamaño variable.
- La rama `else` (spritesheets con `cols`/`rows`) no se ve afectada — esos siempre son 16×16 y se ven bien.

## Capabilities

### New Capabilities
- `layer-picker-thumbnail-centering`: el thumbnail del layer picker centra correctamente frames de cualquier aspect ratio dentro del container 20×20, mostrando el frame completo y centrado.

### Modified Capabilities
- (ninguna — la spec `layer-picker-position-and-labels` de la change anterior se beneficia automáticamente de este fix, pero no cambia su comportamiento esperado)

## Impact

- Solo `public/src/ui/editor-ui.js` (~5 líneas modificadas en `renderLayerPicker`).
- No afecta runtime, persistencia, ni formatos JSON.
- No introduce nuevas dependencias.
- Sin cambios en la API del callback ni en la estructura del DOM.
- El CSS existente (`.ed-layer-picker-thumb` con `width: 20px; height: 20px`) no se modifica — el fix es enteramente en el cálculo de `backgroundPosition`.
