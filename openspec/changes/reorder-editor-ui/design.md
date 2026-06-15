## Context

El editor de niveles de Gatito-Code es un panel DOM overlay (`#editor-panel` en `public/index.html`) que coexiste con el canvas de Phaser. Toda la UI es DOM/CSS, no Phaser. El módulo `public/src/ui/editor-ui.js` es el "controller" que monta el panel, escucha clicks, renderiza paletas y mantiene el estado de selección activo.

**Estado actual.** Cambio anterior archivado (`editor-tabs-preview`, 2026-06-14) introdujo:
- Una columna derecha con tabs `Tileset | Objetos` (`#ed-tabs-bar`).
- Un preview estático del tile/objeto seleccionado debajo del contenido del tab.
- Una sección `<div class="ed-section">Clima</div>` como bloque suelto debajo del preview, siempre visible.

**Limitaciones detectadas.** Ver `proposal.md` para la lista completa. Resumido:
- `#ed-clear` (Limpiar capa) está en "Acciones" pero es semánticamente per-layer.
- `#ed-undo`/`#ed-redo` duplican a `#ed-tool-undo`/`#ed-tool-redo`.
- Clima comparte eje vertical con la paleta activa, sin primer nivel propio.

**Restricciones del proyecto** (de `AGENTS.md` y `CLAUDE.md`):
- `ui/` no importa Phaser; `engine/` importa `ui/` solo vía `window.__*`.
- Todo el código y copy en **español**.
- Sin bundler, sin build step, Phaser por CDN, ES Modules puros.
- TILE = 16, COLS = 16, ROWS = 12, STEP_MS = 240 (constantes en `config/game.js`).
- LocalStorage key `level:${levelKey}` para niveles custom.
- `__setEditor_*` mantiene contrato para no romper la integración con `EditorScene`.

**Stakeholders**: solo el autor del proyecto y el editor en sí. No hay consumidores externos del layout.

## Goals / Non-Goals

**Goals:**
- Anidar los tabs actuales bajo un primer nivel `ASSETS | CLIMA` con la misma estética visual.
- Reservar altura generosa al panel de Clima (≥300px) para rediseños futuros de los controles.
- Reubicar `#ed-clear` como botón pequeño inline al título del bloque "Capa".
- Eliminar los duplicados `#ed-undo`/`#ed-redo` sin tocar el toolbar de "Historial" ni los atajos de teclado.
- Ocultar el preview cuando el tab principal es `CLIMA`.
- Mantener intacta la API pública de `__setEditor_*` y los atajos existentes.
- No tocar `domain/`, `engine/levels/`, `TileRegistry`, `Storage`, `main.js`, `config/game.js`.
- Sin nuevas dependencias.

**Non-Goals:**
- Rediseño visual de los controles de clima (se reservará espacio, pero el estilo sigue igual).
- Atajos de teclado para alternar entre `ASSETS` y `CLIMA` (no se piden).
- Persistir el tab activo entre sesiones.
- Cambiar la lógica de undo/redo, atajos, modales, o cualquier handler existente.
- Reorganizar la columna izquierda (Nivel/Historial/Capa/Modos/Acciones).
- Tocar `#ed-clear-objects` (botón 🗑️ Vaciar en el header de Objects), que ya sigue el patrón inline que se aplicará a Capa.
- Modificar el copy del footer ("Click izq. copiar · click der. borrar · arrastrar · Esc limpiar/volver · G grilla"), aunque `Esc` ya limpia selección, no capa.
- Agregar `onMainTabChange` al `cfg` de `EditorScene` (es opcional; sin breaking change, lo dejamos fuera del scope para minimizar diff en el engine).

## Decisions

### 1. Anidamiento de tabs vía dos barras separadas, no via `<select>` ni acordeón

**Decisión:** dos `<div>` hermanos en `index.html`:
- `#ed-main-tabs-bar` con dos botones `ASSETS` y `CLIMA` (data-tab="assets" | "weather").
- `#ed-tab-content` ahora es un wrapper que contiene:
  - `#ed-assets-panel` con su propio `#ed-tabs-bar` interno (Tileset/Objetos) + el contenido actual + preview.
  - `#ed-weather-panel` con la lista de efectos de clima.

**Alternativas consideradas:**
- *Un solo `<select>` arriba*: rechazo — feo, menos escaneable que tabs.
- *Acordeón colapsable*: rechazo — clima nunca se "colapsaría" en uso normal, agregaría fricción sin beneficio.
- *Sub-tabs visibles siempre, con Clima como tercer tab plano (`Tileset | Objetos | Clima`)*: rechazo — el usuario pidió explícitamente dos niveles, y separa conceptualmente assets pintables (lo que entra al nivel) de configuración ambiental (lo que afecta cómo se ve).

**Rationale:** mantiene el modelo mental de "main category" + "sub category", escaneable, sin overhead cognitivo, reusa la estética de tabs ya existente.

### 2. Reuso de estilos de `#ed-tabs-bar` para `#ed-main-tabs-bar`

**Decisión:** en `editor.css`, el nuevo `#ed-main-tabs-bar` reusa exactamente los estilos de `#ed-tabs-bar` (líneas 239-269). Se puede hacer con una regla agrupada:
```css
#ed-main-tabs-bar button,
#ed-tabs-bar button { /* mismos estilos */ }
```
O refactorizar `#ed-tabs-bar button` → `.ed-tabs-bar button` y aplicar la clase a ambos.

**Rationale:** la propuesta "agrupar selectores" es menos invasiva (no requiere renombrar IDs ni tocar `editor-ui.js` que ya hace `edTabsBar.querySelectorAll('button')`). Solo se duplican los selectores en CSS.

**Alternativa considerada:** refactor a clase compartida. Descartado porque introduciría cambios en `index.html` y `editor-ui.js` que no aportan valor real.

### 3. Patrón de visibilidad con `.active` (mismo que ya existe)

**Decisión:** `.ed-main-panel { display: none; }` y `.ed-main-panel.active { display: flex; }` — el mismo patrón que `editor.css:271-281` usa para `#ed-tileset-panel` / `#ed-objects-panel`.

**Rationale:** consistencia con código existente, no introduce un nuevo mecanismo, y ya está probado.

### 4. Header de "Capa" con flex row + botón pequeño

**Decisión:** convertir el header de "Capa" de `<h3>Capa</h3>` a:
```html
<div class="ed-section-title-row">
  <h3>Capa</h3>
  <button id="ed-clear" class="ed-section-title-btn" title="Limpiar capa actual">🧹</button>
</div>
```
Con CSS:
```css
.ed-section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px; /* reemplaza el margin del h3 */
}
.ed-section-title-row h3 { margin: 0; }
.ed-section-title-btn {
  background: transparent !important;
  border: 1px solid transparent !important;
  border-radius: 5px !important;
  padding: 2px 6px !important;
  font-size: 12px !important;
  color: rgba(90,58,26,.55) !important;
  cursor: pointer;
  transition: background .1s ease, color .1s ease;
}
.ed-section-title-btn:hover {
  background: rgba(255,255,255,.25) !important;
  color: var(--sprout-dark) !important;
}
```

**Rationale:** botón inline es más compacto que un botón full-width debajo del grid, y comunica que es una acción del bloque actual, no una acción global. El ícono 🧹 es semánticamente claro. El mismo patrón ya existe en `.ed-obj-header` con `#ed-clear-objects` ("🗑️ Vaciar"), así que es familiar.

**Alternativa considerada:** un botón "🧹 Limpiar capa" full-width debajo del grid. Descartado: ocuparía más espacio vertical en una columna que ya es estrecha (`220px`), y desplazaría el resto del contenido.

### 5. `min-height: 300px` y `overflow-y: auto` en `#ed-weather-panel`

**Decisión:** el panel de clima recibe `min-height: 300px` y `overflow-y: auto`. Sin `max-height` (no queremos capar el rediseño futuro).

**Rationale:** con 8 efectos actuales en grid de 3 columnas, el contenido ocupa ~180px. Los 120px de margen permiten que un rediseño futuro (sliders más grandes, iconos, agrupamiento por categoría, etc.) tenga aire sin tocar la estructura. `overflow-y: auto` evita que un rediseño con muchos más efectos rompa el layout — la columna derecha del editor es flexible (`flex: 1; min-height: 0;`), pero la altura del panel padre `#ed-tab-content` está acotada por la `max-height: 96vh` del `#editor-panel`. Si el contenido excede, scroll, no overflow visible.

**Alternativa considerada:** `height: 300px` fijo. Descartado: si el contenido es más chico, deja aire muerto innecesario; si es más grande, corta. `min-height` + `overflow-y: auto` se adapta a ambos extremos.

### 6. Eliminar handlers y los `<button>` HTML, no solo ocultarlos

**Decisión:** eliminar `document.getElementById('ed-undo').onclick` y `document.getElementById('ed-redo').onclick` en `editor-ui.js:48-49`, y eliminar los `<button id="ed-undo">↶ Undo</button>` y `<button id="ed-redo">↷ Redo</button>` de `index.html` (líneas 149-150).

**Rationale:** código muerto es deuda. El usuario confirmó eliminar (decisión #3). El toolbar de "Historial" con `#ed-tool-undo`/`#ed-tool-redo` + los atajos `Ctrl+Z`/`Ctrl+Y` cubren el 100% de los casos.

**Alternativa considerada:** ocultarlos con `display: none` o deshabilitarlos. Descartado: el usuario quiere eliminarlos, no esconderlos.

### 7. Preview se oculta con `display: none` cuando el main tab es `weather`

**Decisión:** el bloque `#ed-preview` se mueve adentro de `#ed-assets-panel` (no de `#ed-tab-content`). Así, cuando `#ed-assets-panel` se oculta, el preview se oculta automáticamente. No requiere JS extra.

**Alternativa considerada:** dejarlo en `#ed-tab-content` y togglear visibilidad en `renderTabs()`. Descartado: más JS, más estado, más bug-surface. Mover el DOM es más declarativo.

### 8. Mantener `onTabChange` para los sub-tabs (Tileset/Objetos), no introducir `onMainTabChange`

**Decisión:** el callback `cfg.onTabChange` existente se sigue llamando cuando el usuario alterna entre Tileset y Objetos (sin cambios). No se introduce `onMainTabChange` para los main tabs (ASSETS/CLIMA) en este change. Si `EditorScene` necesita reaccionar, lo hará en un cambio futuro.

**Rationale:** el cambio es puramente presentacional. El comportamiento de Phaser no se ve afectado por qué tab DOM está activo. El handler de `__setEditor_updateSelected` sigue funcionando igual (solo actualiza la preview, que no se renderiza si el panel está oculto). Simplifica el diff y minimiza el riesgo.

**Alternativa considerada:** agregar `onMainTabChange` al `cfg` desde `EditorScene` para resetear selección al entrar a CLIMA. Descartado por YAGNI — la selección de tile/objeto no interfiere con nada al estar en CLIMA (solo no se ve el preview), y resetear podría ser destructivo para el flujo del usuario.

## Risks / Trade-offs

- **Riesgo: el header de "Capa" con flex row rompa el espaciado del resto de los headers de sección.** → *Mitigación:* la regla `.ed-section-title-row` aplica `margin-bottom: 8px` (mismo que tenía el `h3` solo). El resto de los headers de sección (`Nivel`, `Historial`, `Modos`, `Acciones`) siguen con `<h3>` simple y conservan su margin. Si visualmente queda raro, se puede generalizar `.ed-section-title-row` para todos y unificar.

- **Riesgo: usuarios que ya tienen el editor abierto con un nivel cargado (sin recargar) vean el panel roto.** → *Mitigación:* el editor se abre vía `window.__setEditor(cfg)` que siempre llama a `showEditor(cfg)`, que ya hace `edPanel.style.display = 'flex'` y resetea estado. Si el usuario sale del editor y vuelve, todo se reinicia. No hay estado persistente del DOM entre cargas.

- **Riesgo: el `min-height: 300px` de Clima haga que el panel se vea "vacío" en pantallas bajas.** → *Mitigación:* `#editor-panel` tiene `max-height: 96vh` y las dos columnas son flex con `min-height: 0`. En pantallas <600px, el responsive media query (líneas 771-783) ya apila las columnas, así que cada sección toma su altura natural. Los 300px ocupan la mayor parte de la altura visible, lo cual es coherente con que Clima es ahora un tab propio (debe sentirse "rellenable").

- **Riesgo: el ícono 🧹 no se vea bien en el botón inline si el font del editor no soporta emoji coloridos.** → *Mitigación:* el proyecto ya usa emojis como texto plano en otros botones (`📍 Spawn`, `🎬 Intro`, `💾 Guardar`, `▶ Probar`, `🧩 Auto-tiling`, `🗑️ Vaciar`). Es un patrón ya establecido. Si en el futuro se quiere uniformizar, se puede usar un SVG inline, pero está fuera de scope.

- **Trade-off: duplicar selectores CSS (`#ed-main-tabs-bar button, #ed-tabs-bar button`)** vs refactorizar a clase compartida. → Aceptado: el costo de duplicar 30 líneas de CSS es despreciable y evita tocar `editor-ui.js`. Si en el futuro se quiere unificar, es un cambio mecánico.

- **Trade-off: Clima no es responsivo a pantalla completa** (no aprovecha el ancho como la paleta). → Aceptado: la lista de clima se renderiza en `flex-wrap` con `flex: 1 0 calc(33.333% - 4px)`, así que en pantallas anchas mete 3 por fila, en estrechas 2 o 1. Es un trade-off aceptable para un panel de configuración que se lee y se ajusta, no se escanea.

## Migration Plan

No aplica — no hay datos que migrar, no hay formato que cambie, no hay versión bump. Es un cambio puramente visual que se deploya simplemente actualizando los archivos:

1. Editar `public/index.html` (estructura + eliminación de duplicados).
2. Editar `public/css/editor.css` (estilos nuevos).
3. Editar `public/src/ui/editor-ui.js` (refs, estado, handlers).
4. `EditorScene.js` no se toca (decisión #8).
5. `domain/`, `engine/levels/`, `services/`, `config/`, `main.js` no se tocan.
6. No hay tests de `engine/` o `ui/` que mantener (`tests/domain.test.js` sigue pasando sin cambios).

**Rollback:** revert del commit. No hay estado persistente, no hay migraciones de datos, no hay versionado de API.

## Open Questions

Ninguna bloqueante. Decisiones tomadas y validadas con el usuario durante la fase de exploración:

- ✅ ¿Preview visible solo en ASSETS? → Sí.
- ✅ `#ed-clear` como ícono inline al título de Capa? → Sí.
- ✅ ¿Eliminar `#ed-undo`/`#ed-redo`? → Sí.
- ✅ ¿CLIMA con espacio reservado para rediseño futuro? → Sí, ≥300px.

**Preguntas menores no resueltas** (no bloquean, se pueden iterar después):
- ¿Vale la pena agregar atajos de teclado para alternar entre `ASSETS` y `CLIMA` (p.ej. `Shift+Tab`)? Fuera de scope por ahora.
- ¿Persistir el tab activo entre sesiones en `localStorage`? No se pidió, no es un goal.
- ¿Vale la pena mover también `#ed-clear-objects` para que viva en un lugar más semántico (no en el header de Objects sino en su propia sección)? El usuario decidió que no — ya sigue el patrón inline.
