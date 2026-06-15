## 1. Marcar la celda destino durante el drag

- [x] 1.1 En `public/src/engine/scenes/EditorScene.js`, modificar `updateDrag` (`EditorScene.js:999-1004`) para que, además de mover el `dragGhost`, posicione el `hoverRect` en la celda destino con el tamaño del footprint del elemento y el color según validez:
  - Si el destino coincide con el origen → ocultar el `hoverRect`.
  - Si el destino está fuera del mapa o (para objetos) cae sobre un muro/colisiona con otro objeto → `hoverRect` en rojo (`0xff0000`).
  - En cualquier otro caso → `hoverRect` en verde/amarillo (`0x66ff99` para objetos, `0xffee88` para tiles), tamaño = footprint del elemento.
  - Calcular el footprint: para tiles, 1×1 (`tx, ty`); para objetos, usar `getFrameDimensions(dragSource.objDef, dragSource.frame)` + `_getOccupancy(tx, ty, occW, occH)`. Cachear `objDef` y `occW`/`occH` en `dragSource` durante `startDrag` para no recalcular `OBJECTS.find` en cada `pointermove`.

## 2. Verificación manual

- [x] 2.1 Arrastrar un tile (fence de `walls`) a otra celda vacía: rect 16×16 en (8,5), color 0xffee88 (válido) ✅
- [x] 2.2 Arrastrar un objeto 1×1 (`signs` frame 4): rect 16×16 en (10,7), color 0x66ff99 (válido), occW=1, occH=1 ✅
- [x] 2.3 Arrastrar un objeto multi-tile (`cow` 2×2): rect 32×32 en destino, occW=2, occH=2 ✅ (tamaño del footprint correcto)
- [x] 2.4 Arrastrar fuera del mapa (game 20,20): rect en destino, color 0xff0000 (rojo) ✅
- [x] 2.5 Arrastrar objeto sobre muro (bottom border, walls=114): rect color 0xff0000 (rojo) ✅
- [x] 2.6 Arrastrar objeto sobre otro objeto (`chicken_blue` en 12,9): rect color 0xff0000 (rojo) ✅
- [x] 2.7 Arrastrar de vuelta a la celda origen: rect visible=false ✅
- [x] 2.8 Soltar fuera del mapa: rect visible=false, dragState=null, dragGhost=null ✅
