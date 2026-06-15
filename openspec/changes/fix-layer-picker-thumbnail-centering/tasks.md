## 1. Centrar thumbnails en el layer picker

- [x] 1.1 En `public/src/ui/editor-ui.js`, dentro de `renderLayerPicker` (rama `if (item.type === 'object')`, líneas 190-210), reemplazar el cálculo de `backgroundPosition` para centrar el frame dentro del container 20×20:
  - Calcular `frameW = f.w * scale` y `frameH = f.h * scale` (tamaño del frame escalado).
  - Calcular `offsetX = (THUMB_SIZE - frameW) / 2 - f.x * scale` y `offsetY = (THUMB_SIZE - frameH) / 2 - f.y * scale` donde `THUMB_SIZE = 20`.
  - `backgroundPosition = ${offsetX}px ${offsetY}px`.
  - `backgroundSize` se mantiene: `${imgW * scale}px ${imgH * scale}px`.
  - Agregar comentario que documente que `THUMB_SIZE` debe coincidir con `.ed-layer-picker-thumb { width: 20px; height: 20px; }` en `editor.css`.
