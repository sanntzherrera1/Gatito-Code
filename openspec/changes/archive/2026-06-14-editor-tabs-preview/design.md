## Context

El editor de niveles se renderiza como un panel DOM flotante a la derecha del canvas (`#editor-panel`, actualmente 420px de ancho fijo). Su HTML apila verticalmente todas las herramientas: título, layer selector, tilesets, spawn, objects, intro, weather y acciones. La lógica de UI vive en `public/src/ui/editor-ui.js`, los estilos en `public/css/editor.css`, y la escena de Phaser en `public/src/engine/scenes/EditorScene.js`.

El canvas del juego tiene un tamaño intrínseco de `16×12` tiles de `16px`, es decir `256×192px`. El layout actual usa Flexbox en `body` para centrar el canvas y dejar el panel a la derecha (`order: 4`).

## Goals / Non-Goals

**Goals:**
- Reorganizar `#editor-panel` en una columna vertical coherente: header, layer selector, tabs, contenido activo, preview, spawn/intro, weather, actions.
- Proveer tabs "Tileset" y "Objects" que alternen la palette visible sin reducir el espacio del canvas.
- Mostrar una preview estática del tile u objeto/frame seleccionado, con datos útiles.
- Hacer el panel responsivo: ancho mínimo 320px, máximo 520px, canvas siempre centrado y a tamaño original.

**Non-Goals:**
- No se implementan animaciones en la preview.
- No se agregan atajos de teclado para cambiar de tab.
- No se modifica la lógica de pintado, undo/redo, guardado o carga de niveles.
- No se agregan nuevos assets ni se cambian GIDs.

## Decisions

### 1. Tabs implementados con DOM puro
Se usarán botones dentro de `#editor-panel` para alternar entre vistas. La lógica vive en `editor-ui.js` con un estado `activeEditorTab` (`'tileset' | 'objects'`).

**Alternativas consideradas:**
- Usar `<details>`/`<summary>` nativo: descartado porque no permite resaltar el tab activo con la misma flexibilidad visual.
- Usar un componente de terceros: descartado porque el proyecto no usa frameworks de UI y se prefiere mantener cero dependencias.

### 2. Preview renderizada con `background-image` de CSS
La preview mostrará el frame seleccionado usando la misma técnica de spritesheet que la palette (`background-image`, `background-size`, `background-position`). Esto evita instanciar un segundo canvas de Phaser o sincronizar animaciones.

**Alternativas consideradas:**
- Canvas de Phaser interno en el panel: descartado por complejidad y riesgo de leaks de memoria.
- `<img>` con sprite individual: descartado porque los assets son spritesheets y no hay imágenes por frame.

### 3. Panel responsivo con `clamp()` y media queries
El ancho del panel pasará a ser `clamp(320px, 28vw, 520px)`. El panel mismo recibe `flex-shrink: 0` para que nunca se comprima por debajo de su ancho mínimo. El canvas conserva sus dimensiones intrínsecas (256×192) mediante `flex-shrink: 0`. La preview escala de 80×80px a 112×112px en pantallas grandes.

**Nota sobre el zoom de Phaser:** Phaser renderiza el canvas con `zoom: 4`, lo que hace que el cuadro de layout sea 1024×768px. En viewports pequeños esto puede generar scroll horizontal, pero el canvas y el panel no se encogen por debajo de sus tamaños mínimos.

**Alternativas consideradas:**
- Ancho fijo de 420px: descartado porque no aprovecha pantallas grandes.
- Panel redimensionable por el usuario: descartado para mantener el alcance acotado.

### 4. Contenido compartido fuera de los tabs
El layer selector, spawn, intro, weather y actions permanecen fuera del contenedor de tabs para que estén siempre accesibles, independientemente del tab activo.

**Alternativas consideradas:**
- Poner layer selector dentro del tab "Tileset": descartado porque las acciones de colocación de objetos también dependen de la capa activa.
- Tercer tab "Level" con controles compartidos: descartado porque ocultaría acciones esenciales como Save/Play.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| El panel más ancho en pantallas grandes deja menos margen lateral. | Usar `max-width: 520px` y centrar el canvas; en viewports muy estrechos se usa `min-width: 320px`. |
| La preview puede quedar oculta si el panel es pequeño y hay muchos controles. | Usar `flex-shrink: 0` en la preview y permitir scroll vertical en el panel (`overflow-y: auto`). |
| Cambiar de tab sin atajo de teclado puede ralentizar flujos frecuentes. | Documentado como mejora futura; los atajos existentes (`O` para modo objecto) siguen funcionando. |
| Reordenar el HTML puede romper selectores CSS existentes. | Actualizar `editor.css` en paralelo y verificar con `npm start` + inspección visual. |

## Migration Plan

No requiere migración de datos ni cambios en niveles guardados. El cambio es puramente de UI.

Pasos de despliegue local:
1. Aplicar los cambios en HTML, CSS y JS.
2. Ejecutar `npm start` y abrir el editor en un nivel existente.
3. Verificar visualmente: tabs, preview, responsividad, scroll, guardado y play-test.

Rollback: revertir los archivos modificados a su estado anterior.

## Open Questions

- ¿El ancho máximo de 520px es suficiente para monitores ultrawide, o se prefiere un límite mayor?
- ¿La preview debería mostrar el tile/object con un fondo de cuadrícula (checkerboard) para tiles transparentes?
