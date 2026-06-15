## Context

El editor de niveles (`#editor-panel`, `public/index.html:97-270`) tiene una columna derecha con dos tabs principales: `ASSETS` (Tileset/Objetos + preview) y `CLIMA` (lista de 9 efectos climáticos). El cambio anterior (`reorder-editor-ui`, archivado) reservó `min-height: 300px` y `overflow-y: auto` en `#ed-weather-panel` precisamente para un rediseño posterior — este es ese rediseño.

**Estado actual** (medido en viewport 1600×1000):
- `#editor-panel` mide 890px de alto.
- `.ed-col-palette` (columna derecha) mide 752px.
- Tab bar (`#ed-main-tabs-bar`) mide 36px.
- `#ed-weather-panel` ocupa solo 388px (los 9 ítems del grid 2×5).
- Espacio muerto vertical: ~328px.
- Items actuales (`.ed-weather-item`, `editor.css:564-614`): flex column, ~85×62px, layout `▲ / valor / ▼ / nombre`. Sin íconos, sin animación, sin presets, sin distinción visual entre tipos. Grid de `flex: 1 0 calc(33.333% - 4px)` con wrap → en el ancho real del panel (~346px) caen 2 columnas.

**Restricciones del sistema:**
- Estilo visual Sprout Lands: tonos cálidos (`--sprout-dark #3d2008`, `--sprout-mid #5a3a1a`, `--sprout-light #d1ba9e`, `--sprout-border #8c643c`), acentos en `rgba(255,200,80,...)`, fuente `SproutPixel` 8x14 px.
- UI en español (todo copy, labels, tooltips). Los `data-weather="..."` quedan en inglés por consistencia con `WeatherSystem.js:9` (`WEATHER_TYPES`).
- `WeatherSystem.js:23-44` ya define `COLORS` y `LABELS` canónicos por tipo. Reutilizamos `WEATHER_TYPES`, `getWeatherLabel`, `getDefaultWeather`, y los hex de `COLORS` para teñir el slider y el icono.
- `renderWeatherControls(cfg)` en `editor-ui.js:782-811` consume `cfg.getWeather()` y `cfg.onWeatherChange(updated)`. La data shape es `{rain, snow, pollen, leaves, night, fog, dust, wind, storm}` con valores 0.0-1.0. El contrato se preserva.
- Los 9 ítems se renderizan en el HTML actual como `<div class="ed-weather-item" data-weather="rain">` estáticos. El JS solo engancha handlers `up`/`down` a cada uno. Vamos a generar estas tarjetas desde JS (mismo patrón data-driven que `renderTilesetCategories` y `renderObjTabs`).
- Tests: solo `domain/` tiene tests unitarios; `ui/` y `engine/` no. No se requiere test nuevo.
- No se introducen archivos nuevos, assets nuevos, ni dependencias. Todo el markup y estilos van a archivos existentes.

**Stakeholders**: solo el dev (este es un editor single-user local; los niveles que produce son los que se juegan).

## Goals / Non-Goals

**Goals:**
- Aprovechar los ~716px verticales disponibles del panel (vs los 388 actuales).
- Hacer que cada efecto de clima sea **distinguible visualmente de un vistazo** mediante íconos pixel-art animados.
- Reducir la fricción de ajustar la intensidad: pasar de "10 clicks para llegar a 1.0" a "1 gesto de drag o 1 click en el track".
- Ofrecer 7 presets que cubran los casos típicos (Despejado, Llovizna, Lluvia, Tormenta, Primavera, Otoño, Noche) — los dos primeros también cubren los únicos climas que usan los niveles reales hoy (`pollen` y `leaves`).
- Mantener el contrato con `EditorScene`: `getWeather()` y `onWeatherChange(cfg)` sin cambios. Los `localStorage` y JSON existentes con `weather` válido siguen cargando.
- Mantener la accesibilidad del flujo actual: keyboard navigation (Tab + Enter) sigue funcionando, con los botones ▲▼ como atajo de teclado.

**Non-Goals:**
- No se agrega preview en el panel: el canvas del editor ya muestra el clima aplicado en vivo (motor `createWeather` en `WeatherSystem.js:69`).
- No se cambia el formato de almacenamiento de `weather` en JSON/localStorage.
- No se introduce un sistema de presets custom por nivel (los presets son globales, no se guardan con el nivel).
- No se modifica `EditorScene.js` ni `WeatherSystem.js`.
- No se introducen assets de imagen, emojis del sistema, ni fuentes nuevas.
- No se rediseñan los paneles de Tileset/Objetos (solo el panel de Clima).
- No se cambian los atajos de teclado existentes.

## Decisions

### D1. Slider custom con divs en vez de `<input type="range">` nativo

**Decisión**: implementamos el slider como un div de 3 capas (track, fill, thumb) con pointer events manuales. El control visible es pixel-perfect; agregamos un `<input type="range" aria-hidden="true">` oculto dentro de cada tarjeta para lectores de pantalla (esencial si alguien navega el editor con teclado/screen reader).

**Por qué no el nativo**: `<input type="range">` tiene inconsistencias entre Chrome/Firefox/Safari en la apariencia del thumb y del track. Estilarlo para que se vea pixel-art (sin border-radius, con `image-rendering: pixelated` en el thumb) requiere hacks de `::-webkit-slider-thumb` y `::-moz-range-thumb` que se rompen entre versiones. Custom divs nos dan control total y son ~30 líneas de CSS + ~40 líneas de JS (handler de pointerdown/move/up).

**Por qué sí el rango accesible oculto**: 20 líneas más y cubre el caso real de "alguien con screen reader configurando un nivel" (poco probable pero gratis). El input range oculto se sincroniza con el slider visible via `input` events y se actualiza desde JS al drag.

**Alternativas consideradas**:
- `<input type="range">` estilado: rechazado por inconsistencias cross-browser.
- Pointer events en `div` con `tabindex="0"`: viable y fue el plan original. Vamos con esta opción, agregando el input range oculto.

### D2. SVG inline en el HTML (no CSS pseudo-elements ni assets)

**Decisión**: los 9 íconos pixel-art se declaran como `<svg viewBox="0 0 8 8" class="ed-wx-svg" data-wx="rain">...</svg>` inline en cada tarjeta. El JS los inyecta desde un objeto `WX_SVG` con 9 strings.

**Por qué SVG inline**:
- Permite animaciones CSS (`@keyframes`) sobre paths/shapes sin tocar el DOM.
- Hereda el `currentColor` para teñirse con un color único por tipo.
- Un solo template HTML sirve para los 9 (no hay 9 templates distintos).
- ~50 bytes por icono × 9 = 450 bytes en el bundle, despreciable.

**Por qué no CSS `::before`/`::after`**: los iconos de clima tienen formas irregulares (zigzag de rayo, luna creciente, copos asimétricos) que son feas o imposibles con divs anidados. SVG es lo correcto.

**Por qué no assets PNG en `public/assets/`**: no queremos crear archivos nuevos. El proyecto no tiene assets prehechos de clima (las partículas se generan en runtime en Phaser). Crear 9 PNGs sería trabajo sin ganancia real.

**Alternativas consideradas**:
- Emojis del sistema: rechazado por inconsistencia cross-OS (Windows muestra color, Linux puede mostrar B&W) y por romper la estética pixel-art.
- Icon font (Material Symbols, etc.): rechazado por la dependencia externa y por la inconsistencia visual con la fuente `SproutPixel`.

### D3. Lista plana de 9 efectos, sin agrupación ni colapso

**Decisión**: las 9 tarjetas se listan en orden fijo (mismo orden que `WEATHER_TYPES`: rain, snow, pollen, leaves, night, fog, dust, wind, storm). Sin acordeones, sin familias colapsables.

**Por qué**: el usuario eligió explícitamente "lista plana" en la fase de exploración. La agrupación semántica (Precipitación/Naturaleza/Ambiente) agregaba una capa de navegación que el editor no necesita. Con 9 ítems y ~68px cada uno, entran todos en pantalla sin scroll en viewports ≥1000px de alto.

**Alternativas consideradas**:
- Familias colapsables (Dirección B de la exploración): rechazado por feedback explícito del usuario.
- Reordenar por uso (drag & drop): descartado por scope creep.

### D4. 7 presets fijos, no customizables

**Decisión**: 7 chips de preset hardcodeados, sin UI para crear/guardar presets custom. Aplican valores precomputados a las 9 tarjetas en una sola llamada a `onWeatherChange`.

**Por qué**:
- Cubre los casos típicos sin complejidad adicional.
- El usuario no pidió presets custom en la fase de exploración.
- Aplicar un preset es O(1) llamada al motor (no 9), evitando 9 re-renders.

**Por qué no un sistema de presets por nivel**: rompe el formato JSON de los niveles (los presets no son parte del clima, son atajos de edición). Agrega scope. Lo descartamos.

**Lista de presets** (decidida en la fase de exploración, validada contra los datos reales de los niveles):

| # | Nombre | Valores aplicados |
|---|---|---|
| 1 | Despejado | todo a 0 |
| 2 | Llovizna | rain 0.3, fog 0.2 |
| 3 | Lluvia | rain 0.6, wind 0.2 |
| 4 | Tormenta | rain 0.7, storm 0.5, wind 0.4, night 0.2 |
| 5 | Primavera | pollen 0.4, wind 0.1 |
| 6 | Otoño | leaves 0.5, wind 0.3 |
| 7 | Noche | night 0.5 |

Cobertura: `Despejado` (reset), `Llovizna`/`Lluvia`/`Tormenta` (precipitación), `Primavera` (caso de uso #1 real), `Otoño` (caso de uso #2 real), `Noche` (atmósfera).

### D5. Animaciones CSS pausadas en `intensidad == 0`

**Decisión**: cuando una tarjeta tiene `v == 0`, su icono aparece con `opacity: .5`, `animation-play-state: paused`, y `filter: grayscale(0.3)`. Cuando `v > 0`, se anima al 100% y se tiñe con el color canónico del tipo.

**Por qué**: 9 animaciones CSS simultáneas en viewports grandes son técnicamente gratis, pero visualmente distractoras cuando hay 9 efectos "fantasma" activos. El dimming/pause indica claramente "este efecto está apagado".

**Alternativas consideradas**:
- Mostrar siempre la animación, con `v == 0` solo bajando la opacidad: rechazado por ruido visual.
- No mostrar el icono cuando `v == 0` (reemplazar con un placeholder gris): rechazado porque pierde la identidad visual del efecto incluso apagado.

### D6. Render data-driven desde `WEATHER_TYPES`

**Decisión**: las 9 tarjetas se generan en `renderWeatherControls()` iterando `WEATHER_TYPES` (importado de `WeatherSystem.js`). El HTML solo declara el contenedor `#ed-weather-list` vacío (más el header y los chips de preset). Cada tarjeta se construye con `document.createElement` o con un `<template>` clonado.

**Por qué**: mismo patrón que ya usa el editor para tiles y objetos (ver `renderTilesetCategories`, `renderObjTabs`). Si mañana se agrega un tipo de clima a `WEATHER_TYPES`, aparece automáticamente en el panel.

**Por qué no `<template>` con 9 nodos estáticos en el HTML**: agrega markup que después se reemplaza desde JS. Es complejidad sin ganancia. Construir desde JS es ~50 líneas y deja el HTML mínimo.

### D7. Single `onWeatherChange` por gesto

**Decisión**: cuando se aplica un preset, las 9 tarjetas se actualizan y se llama `cfg.onWeatherChange?.(updated)` **una sola vez** con el objeto completo. Lo mismo al "Limpiar todo" y al drag del slider (con throttling de 1 llamada al final del drag, no 1 por cada movimiento).

**Por qué**: el motor (`createWeather` en `WeatherSystem.js:69-121`) destruye y recrea todos los emitters/overlays/timers en cada llamada. Si spameamos 9 calls por preset, destruimos 9 × 9 = 81 emitters. Con 1 call, son 9 emitters (1 set nuevo). Throttling del drag evita el mismo problema mientras se arrastra.

**Throttle del drag**: usamos `pointerup` para el commit final, no `pointermove`. Los `pointermove` solo actualizan el DOM (thumb position, fill width, valor numérico). Al soltar (`pointerup`), se llama `onWeatherChange` con el valor final. Esto da respuesta visual instantánea y un solo render del motor al final.

**Alternativas consideradas**:
- Throttle con `requestAnimationFrame`: overkill, agrega dependencia temporal.
- `pointermove` llama a `onWeatherChange` directamente: descartado por el costo del re-render del motor.

## Risks / Trade-offs

- **[R1] Animaciones CSS simultáneas pueden afectar rendimiento en móviles o dispositivos viejos** → Mitigación: las animaciones son simples (`transform`/`opacity`/`background-position` mayormente). Si la suma es > 9 elementos animando a la vez + el motor Phaser corriendo, es despreciable. Si surge, podemos detectar `prefers-reduced-motion: reduce` y desactivar las animaciones.

- **[R2] Pointer events en el slider pueden tener quirks con touch (sin mouse)** → Mitigación: usamos `pointerdown`/`pointermove`/`pointerup` (Pointer Events API) que unifica mouse + touch + pen. En touch, el primer tap hace `pointerdown`, el drag es `pointermove`, el soltado es `pointerup`. Probado mentalmente, no hay casos edge distintos al mouse.

- **[R3] SVG inline aumenta el tamaño del DOM** → Mitigación: 9 SVGs simples de ~50 bytes cada uno = 450 bytes en el DOM, irrelevante. Se generan desde JS una sola vez al `renderWeatherControls()`.

- **[R4] Los presets pueden no coincidir con el "gusto" del dev** → Mitigación: la lista es modificable con un solo edit al objeto `WEATHER_PRESETS` en `editor-ui.js`. Documentado en comentario en el código.

- **[R5] El dimming de los íconos a `v == 0` puede ser demasiado sutil** → Mitigación: el `opacity: .5` + `animation-play-state: paused` + tinte con color canónico apagado se ve claramente distinto al estado activo en testing visual. Si no, ajustamos a `opacity: .4` o `filter: brightness(0.7)`.

- **[R6] El slider puede perder precisión en pantallas táctiles pequeñas** → Mitigación: el track tiene ~150px de ancho, con steps de 0.1 cada 15px. En touch eso es ~15px de margen por step, suficiente para los dedos. Si no, podemos agregar `touch-action: pan-y` en el slider para que el drag horizontal no interfiera con scroll vertical del panel (aunque el panel no hace scroll por diseño).

- **[R7] `EditorScene` no se toca, pero el orden de inicialización importa** → Mitigación: `renderWeatherControls(cfg)` se llama desde `showEditor(cfg)` (mismo lugar que ahora, ver `editor-ui.js:65-98`). El refactor mantiene esa firma. `cfg` sigue conteniendo `getWeather` y `onWeatherChange`.

## Migration Plan

No hay migración. El cambio es puramente presentacional:
- No cambia el formato JSON de los niveles.
- No cambia la firma de `getWeather`/`onWeatherChange`.
- No cambia los `localStorage` keys ni el shape guardado.
- No requiere nuevos assets ni dependencias.

**Rollback**: como no hay deployment ni migración, "rollback" es `git revert` del commit. Los niveles guardados durante la versión nueva siguen siendo válidos (el shape no cambió).

**Despliegue**: este es un proyecto sin CI/CD, servido vía `npm start` (browser-sync). El cambio entra con el próximo reload del editor.

## Open Questions

Ninguna pendiente al cierre de esta propuesta. Las decisiones D1-D7 cierran todas las ambigüedades técnicas y de diseño. Si el dev quiere iterar visualmente sobre los presets, los valores del `WEATHER_PRESETS` o los SVGs de los íconos, lo puede hacer después de la implementación inicial sin reabrir el spec.
