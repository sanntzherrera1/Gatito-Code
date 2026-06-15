## Why

El editor de niveles actual apila verticalmente en un único panel lateral todas las herramientas: tilesets, objetos, spawn, intro, clima y acciones. Esto hace que la palette de objetos compita por espacio vertical con la de tiles, obligando a scroll constante y dificultando la navegación. Además, no existe una vista previa del tile u objeto seleccionado, lo que fuerza al usuario a memorizar qué frame está activo.

Reorganizar el panel en tabs (Tileset / Objects) y agregar una pantalla de preview estática hará el editor más escaneable, aprovechará mejor el espacio disponible y mantendrá el canvas del juego intacto.

## What Changes

- Reorganizar el panel derecho del editor (`#editor-panel`) en una columna con layout fijo: header, layer selector, tabs, contenido activo, preview, spawn/intro, weather y actions.
- Agregar tabs **Tileset** y **Objects** para alternar entre las dos paletas sin que compartan altura.
- Agregar un área de **preview** fija al final del contenido del tab, que muestre el tile o el objeto/frame seleccionado junto con sus datos (nombre, GID/key, dimensiones, tipo).
- Hacer el panel responsivo: ancho adaptable entre `320px` y `520px` mediante `clamp()`, manteniendo el canvas centrado y sin encogerse.
- Dejar fuera del alcance inicial: animaciones en la preview y atajos de teclado para cambiar de tab (se tratarán en cambios posteriores).

## Capabilities

### New Capabilities

- `editor-layout`: Reorganización del panel del editor con tabs y preview estática del elemento seleccionado.

### Modified Capabilities

- (ninguno)

## Impact

- `public/index.html`: reordenar elementos dentro de `#editor-panel`.
- `public/css/editor.css`: nuevos estilos de tabs, preview y layout responsivo.
- `public/src/ui/editor-ui.js`: lógica de tabs, renderizado condicional de secciones y actualización de preview.
- `public/src/engine/scenes/EditorScene.js`: posibles ajustes menores para sincronizar la preview con la selección actual.
