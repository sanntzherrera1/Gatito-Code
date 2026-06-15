## Why

El panel `#ed-weather-panel` quedó con `min-height: 300px` reservado por `reorder-editor-ui` precisamente para "rediseño futuro de los controles", pero esa altura disponible (~716px en la columna derecha del editor) está desaprovechada: los 9 efectos de clima se renderizan hoy como una grilla de 2 columnas de cajitas anónimas (▲ + valor + ▼ + nombre), todas visualmente idénticas, que no comunican qué clima representan y que obligan a hacer hasta 10 clicks para llegar de 0.0 a 1.0. Además, no hay presets: el 100% de los niveles con clima activo usan solo `pollen` (a veces con `leaves`) con valores bajos (0.1–0.4), porque ajustar rain/snow/storm desde la UI actual es tedioso.

Este cambio aprovecha los ~328px verticales muertos del panel para introducir iconografía pixel-art única por efecto (sin emojis del sistema, sin assets nuevos, todo SVG/CSS), sliders horizontales arrastrables, 7 presets de un click que cubren los casos reales y atmosféricos del juego, y un botón "Limpiar" en el header. El resultado es un panel que ocupa toda la altura disponible, distingue cada efecto visualmente, y permite configurar climas compuestos en 1-2 gestos.

## What Changes

- **Reescribir el bloque `#ed-weather-panel`** en `public/index.html` (líneas 203-262) con tres zonas: header (`CLIMA` + botón limpiar), fila de 7 presets, y lista de 9 tarjetas rediseñadas. Las 9 tarjetas dejan de ser declaradas a mano y se generan dinámicamente desde `WEATHER_TYPES` (mismo enfoque que ya se usa para tiles/objetos).
- **Rediseñar cada tarjeta de efecto** a layout horizontal: ícono pixel-art animado (40×40, izquierda) + nombre + slider horizontal arrastrable (~150px, centro) + valor numérico + botón de acción rápida `0/0.5/1` (derecha). Los íconos se dibujan como SVG inline en el HTML (sin assets nuevos, sin emojis). Cuando `intensidad == 0`, el ícono aparece estático y dimmed; cuando `intensidad > 0`, se anima.
- **Reemplazar los botones ▲▼ por sliders horizontales arrastrables** custom (no `<input type="range">` nativo) con track, fill coloreado por tipo, y thumb arrastrable. Mantener ▲▼ pequeños junto al valor numérico como alternativa accesible (Tab + Enter). El slider acepta click en cualquier punto del track, drag del thumb, click derecho → reset a 0, doble click en el thumb → 1.0, Shift+click → snap a 0.5.
- **Agregar 7 presets** en una fila sobre la lista de efectos: `Despejado`, `Llovizna`, `Lluvia`, `Tormenta`, `Primavera`, `Otoño`, `Noche`. Cada preset es un chip con ícono pixel-art representativo (24×24) y label en SproutPixel. Al click, aplica un set de valores a las 9 tarjetas y dispara `cfg.onWeatherChange?.(updated)` una sola vez.
- **Refactorizar `renderWeatherControls()`** en `public/src/ui/editor-ui.js` para que sea data-driven desde `WEATHER_TYPES` (mismo patrón que `renderTilesetCategories`/`renderObjTabs`), y centralice los handlers de slider/preset/limpiar. El contrato `cfg.getWeather()` / `cfg.onWeatherChange(cfg)` se preserva.
- **Agregar CSS nuevo** en `public/css/editor.css` (~180 líneas) para los presets, los sliders custom, y las animaciones pixel-art de los 9 íconos. No se eliminan ni modifican las clases CSS existentes de `.ed-section` o `.ed-tabs`.
- **Preservar el contrato con el motor**: `EditorScene` no se toca. `getWeather()` y `onWeatherChange()` siguen recibiendo/devolviendo el mismo shape `{rain: 0.3, snow: 0, ...}`. Los `localStorage` con `weather` válido siguen cargando sin cambios. Los atajos de teclado existentes no se ven afectados.
- **Sin breaking changes en la API pública de `__setEditor_*`**: todas las globals mantienen su firma y semántica.

## Capabilities

### New Capabilities
- `weather-panel-ui`: el panel `#ed-weather-panel` del editor expone una UI rediseñada de clima con header (título + botón limpiar), fila de 7 presets de un click, y 9 tarjetas horizontales (ícono pixel-art animado + nombre + slider arrastrable + valor + acción rápida). Los sliders van de 0.0 a 1.0 en pasos de 0.1, son arrastrables con mouse, clickables en cualquier punto del track, y aceptan shortcuts (click derecho = reset, doble click = 1.0, Shift+click = 0.5). Los íconos se animan solo cuando la intensidad es > 0.

### Modified Capabilities
- (ninguna — no hay specs en `openspec/specs/` aún; los specs existentes viven solo como deltas en `openspec/changes/*/specs/`)

## Impact

- `public/index.html`: el bloque `#ed-weather-panel` (~60 líneas actuales) se reemplaza por un header + 7 chips de preset + 9 tarjetas generadas (declaradas en el HTML con `<template>` o un contenedor vacío que se llena desde JS). ~30 líneas en HTML estático + ~140 líneas de markup equivalente generadas desde JS.
- `public/css/editor.css`: ~180 líneas nuevas para `.ed-weather-presets`, `.ed-preset-chip`, rediseño de `.ed-weather-item` (layout horizontal flex), `.ed-wx-slider` (track, fill, thumb, marks), y 9 `@keyframes` (uno por tipo de clima) para las animaciones de los íconos pixel-art. No se eliminan estilos existentes.
- `public/src/ui/editor-ui.js`: refactor de `renderWeatherControls()` para que sea data-driven desde `WEATHER_TYPES` (importado de `WeatherSystem.js`), agregue los handlers del slider custom (pointerdown/move/up, click en track, contextmenu, dblclick), handlers de los chips de preset, y handler del botón limpiar. Se elimina la declaración HTML estática de los 9 `.ed-weather-item` (ahora se generan). ~150 líneas modificadas.
- `public/src/engine/level/WeatherSystem.js`: sin cambios. Se reutilizan `WEATHER_TYPES` y los colores canónicos de `COLORS` exportados.
- `public/src/engine/scenes/EditorScene.js`: sin cambios. El contrato `getWeather`/`onWeatherChange` se mantiene.
- **No afecta**: TileRegistry, GIDs, localStorage, formatos JSON, motor de tiles, `domain/`, `services/`, `main.js`, tests de dominio, build/runtime.
- **No introduce** nuevas dependencias, assets, ni archivos.
- **No rompe** atajos de teclado, interacciones con tiles/objetos/capas/modos/undo/modal, ni el ciclo de guardado/carga de niveles.
- **Riesgo bajo-medio**: el slider custom requiere testear pointer events (especialmente en touch). Las animaciones CSS de los 9 íconos son de bajo costo. Los presets aplican valores a las 9 tarjetas en una sola llamada a `onWeatherChange` (no en 9 calls separadas) para no spammear el motor con 9 re-renders.
