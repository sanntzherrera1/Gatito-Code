## 1. Fix position del picker a la izquierda de la celda

- [x] 1.1 En `public/src/ui/editor-ui.js`, dentro de `renderLayerPicker`:
  - Calcular `scaleX = rect.width / canvas.width` y `scaleY = rect.height / canvas.height`.
  - Calcular `cellLeft = rect.left + (tx * 16) * scaleX`.
  - Posicionar el picker **a la izquierda** de la celda: `leftPx = cellLeft - pickerWidth - gap` con `gap = 8 * scaleX` y `pickerWidth = edLayerPicker.offsetWidth || 160`.
  - Si `leftPx < 4`, caer a la derecha: `rightPx = cellLeft + 16 * scaleX + gap`.
  - Clamping final: `Math.max(px, 4)` y `Math.min(px, window.innerWidth - pickerWidth - 4)`.
  - `py` alineado al top de la celda: `py = rect.top + (ty * 16) * scaleY`.

## 2. Agregar badge de LAYER a cada item

- [x] 2.1 Badge de layer implementado en `editor-ui.js:157-175`:
  - Tiles: `item.layer.toUpperCase()` ("WALLS", "FLOOR", "PATH", "OVERLAY", "TOP") con color por layer (floor=verde, path=marrón, walls=marrón oscuro, overlay=azul, top=violeta)
  - Objetos: "TOP" (mismo color que tiles de top layer) porque se renderizan sobre el top layer
  - Estilo: padding, border-radius, font-weight bold, margin-right
- [x] 2.2 Para tiles, `label.textContent` muestra `tileset?.label || tileset?.name || layer` — el nombre del tileset, no del layer, para evitar duplicar info con el badge.
- [x] 2.3 Para objetos, `label.textContent` sigue siendo la key OBJECTS — sin cambios.

## 3. Remover handlers de click (picker puramente informativo)

- [x] 3.1 En `public/src/ui/editor-ui.js`, eliminar el bloque `row.onclick = () => { edCfg.onObjectSelect(key, frame, item.objType); hideLayerPicker(); };` en la rama de objetos.
- [x] 3.2 Eliminar el bloque `row.onclick = () => { edCfg.onLayer(layer); edCfg.onSelect(gid); hideLayerPicker(); };` en la rama de tiles.
- [x] 3.3 Verificar que `hideLayerPicker` y el callback `__setEditor_hideLayerPicker` sigan usándose desde otros lugares (se siguen llamando cuando el cursor sale de la celda, o cuando se selecciona un item del panel).
