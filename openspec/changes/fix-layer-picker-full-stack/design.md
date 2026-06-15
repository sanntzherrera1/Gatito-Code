## Context

El "layer picker" es un panel DOM (`#ed-layer-picker` en `index.html` o equivalente) que el editor muestra junto al cursor cuando el usuario hace hover sobre una celda en modo "copiar" (sin selección activa). Su propósito es listar visualmente las capas que se apilan en esa celda para que el usuario pueda hacer click y seleccionar/copiar cualquiera.

Hoy tiene dos limitaciones:

1. **Umbral `> 1`** en `EditorScene._showSourceHighlight` (`EditorScene.js:858`): el picker solo se muestra si la celda tiene **2 o más** capas de tiles con `gid !== 0`. Con un único tile, se invoca `__setEditor_hideLayerPicker`. La intención original era mostrarlo solo cuando había ambigüedad sobre qué capa editar; en la práctica, al usuario le sirve ver qué hay aunque sea un solo elemento.

2. **Solo cuenta tiles**: `getLayersAt` (`EditorScene.js:1107-1118`) itera `this.flat[layer]` para las 5 capas. `this.objects` no se consulta, así que un cofre/árbol/letrero en la celda es invisible al picker. Esto rompe la metáfora de "pila de elementos" — la celda puede tener visualmente 6 cosas y el picker muestra solo 1.

3. **Renderer sin rama para objetos**: `renderLayerPicker` (`editor-ui.js:145-194`) desestructura `{ layer, gid, tileset }` de cada item. El thumbnail se construye con `tileset.url` (URL del tileset, no del OBJECTS) y el `localIdx` calculado a partir de `gid - tileset.firstgid` (no aplica a objetos). El click llama a `edCfg.onLayer(layer) + edCfg.onSelect(gid)`, callbacks del flujo de tiles; para objetos hace falta `edCfg.onObjectSelect(key, frame, objType)`.

El cálculo de footprint multi-tile de un objeto (`_getOccupancy(tx, ty, occupyW, occupyH)`) ya existe en `EditorScene.js:534-540` y `getFrameDimensions` en `TileRegistry.js:5382-5396`, así que no hay que reinventar esa lógica.

## Goals / Non-Goals

**Goals:**
- El picker aparece para cualquier celda no vacía (>= 1 elemento).
- El stack incluye tiles (cualquier capa) y objetos, en el orden visual correcto (objetos arriba, tiles abajo en orden top→floor).
- Cada item es clickeable y la acción resultante es coherente con su tipo: tile → `onLayer + onSelect`; objeto → `onObjectSelect`.
- El thumbnail de un objeto se ve correctamente (recorte del frame dentro del PNG del OBJECTS, igual que `updateObjectPreview` en `editor-ui.js:319`).

**Non-Goals:**
- No agregar acciones nuevas en el click (p. ej. eliminar desde el picker). Hoy la única acción es "seleccionar para copiar"; los objetos se eliminan con click derecho en el mapa.
- No cambiar la posición/estilo del panel flotante; solo su contenido.
- No tocar el comportamiento del picker cuando hay una selección activa (`_showPlacementPreview` ya lo oculta).
- No internacionalizar labels (siguen las convenciones existentes en minúscula: `walls`, `f0`).

## Decisions

- **Items con `type` explícito**: cada item del stack lleva `type: 'tile' | 'object'`. `renderLayerPicker` discrimina con un `if (item.type === 'object')`. Mantiene el shape actual `{ layer, gid, tileset }` para tiles, solo le agrega el discriminador.
- **Objetos primero en el array**: el array que arma `getLayersAt` se renderiza en orden, así que los objetos van al inicio (encima visualmente). Los tiles siguen el orden actual `top → floor`. Esto coincide con la forma en que se pintan (depth 2000+ en `_renderObject`).
- **Reutilizar `getFrameDimensions` + `_getOccupancy`**: ya están implementados y testeados. La nueva `getLayersAt` los usa para saber si un objeto cubre la celda `(tx, ty)`. Sin código nuevo para huella multi-tile.
- **Umbral `> 0` (no `>= 0`)**: si la celda está completamente vacía, no tiene sentido mostrar el picker. El umbral baja de `> 1` a `> 0`.
- **Thumbnail de objeto = misma fórmula que `updateObjectPreview`**: `editor-ui.js:319-356` ya resuelve el cálculo de `f` (rect del frame) y de `imgW/imgH` para `frames` array y para spritesheets. Extraer una mini-función helper que ambos lugares usen evitaría duplicación, pero la lógica es ~10 líneas — aceptar la duplicación en pos de minimizar el cambio. Si crece a futuro, refactorizar.
- **Click en objeto = `onObjectSelect(key, frame, type)`**: ya existe y hace exactamente lo que el tile-hacer-clic hace para tiles: setea `selectedObject`/`selection`, cambia a modo objeto, actualiza el panel. No hace falta un callback nuevo.

## Risks / Trade-offs

- **[Riesgo] Cambio de shape en `getLayersAt`**: agregar `type: 'tile'` a items existentes no rompe nada hoy (solo `renderLayerPicker` lee el array, y se actualiza junto con `getLayersAt`). Pero si en el futuro otro consumidor asume que el item no tiene `type`, podría romperse. → Mitigation: agregar `type` a todos los items tiles y a todos los objetos, manteniendo un shape uniforme.
- **[Riesgo] Performance con muchos objetos**: `getLayersAt` se llama en cada mousemove. Hoy itera 5 capas; ahora itera 5 + N objetos. Para 100 objetos, son 105 lookups, no es problema. Para 10000+ sí lo sería. → Acceptable: los niveles del juego tienen típicamente <100 objetos. Documentar en comentario de la función.
- **[Trade-off] Duplicación con `updateObjectPreview`**: el cálculo de thumbnail para objetos se replica en `renderLayerPicker`. ~10 líneas. → Acceptable para esta change; refactor cuando aparezca un tercer consumidor.
- **[Riesgo] Objeto multi-tile aparece en N celdas**: el mismo objeto (p. ej. un well de 2×1) aparecerá como item separado en el picker de cada celda que cubre. Esto puede ser confuso. → Acceptable: es el mismo modelo que ya tienen los tiles (cada celda lista sus tiles independientemente). El label/key del objeto lo identifica claramente.

## Open Questions

- (ninguna — la acción de click sobre un objeto del picker es `onObjectSelect` por consistencia con el panel; si el usuario quiere otra acción, se agrega en un cambio futuro)
