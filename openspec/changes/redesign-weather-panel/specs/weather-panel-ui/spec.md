## ADDED Requirements

### Requirement: Header del panel de clima con botón "Limpiar todo"
El panel `#ed-weather-panel` SHALL contener un header con el título `Clima` y un botón "Limpiar" alineado a la derecha. El botón SHALL tener el ícono 🧹 (mismo glifo que ya usa `#ed-clear` en el header de Capa) y SHALL disparar una llamada a `cfg.onWeatherChange?.({rain: 0, snow: 0, pollen: 0, leaves: 0, night: 0, fog: 0, dust: 0, wind: 0, storm: 0})` (todas las intensidades a 0) al ser clickeado. La etiqueta visible SHALL ser la del `getWeatherLabel(type)` del tipo, en español.

#### Scenario: Header visible al activar el tab CLIMA
- **WHEN** el usuario hace click en el tab principal `CLIMA`
- **THEN** el header del panel `#ed-weather-panel` es visible
- **AND** muestra el texto `Clima`
- **AND** muestra el botón 🧹 alineado a la derecha del título

#### Scenario: Click en "Limpiar" resetea todas las intensidades
- **WHEN** el usuario hace click en el botón 🧹 del header de `#ed-weather-panel`
- **THEN** las 9 tarjetas muestran intensidad `0.0`
- **AND** el slider de cada tarjeta queda en la posición 0
- **AND** el ícono de cada tarjeta vuelve al estado dimmed/pausado
- **AND** `cfg.onWeatherChange` se invoca exactamente una vez con todas las intensidades en 0

#### Scenario: "Limpiar" cuando ya está todo en 0 es un no-op visible
- **WHEN** todas las intensidades ya están en 0 y el usuario hace click en 🧹
- **THEN** `cfg.onWeatherChange` se invoca una vez con todas las intensidades en 0 (el motor ya está limpio, pero la llamada es idempotente)
- **AND** no se muestra error ni toast

### Requirement: Fila de 7 presets de clima
El panel `#ed-weather-panel` SHALL contener una fila de exactamente 7 chips de preset, cada uno con un ícono pixel-art representativo (24×24 px) y un label corto (≤8 caracteres) en fuente `SproutPixel`. Los presets SHALL ser, en este orden: `Despejado`, `Llovizna`, `Lluvia`, `Tormenta`, `Primavera`, `Otoño`, `Noche`. Al hacer click en un chip, SHALL aplicarse el set de valores predefinido del preset a las 9 tarjetas y SHALL invocarse `cfg.onWeatherChange` exactamente una vez con el objeto completo resultante.

#### Scenario: Chips de preset visibles al activar CLIMA
- **WHEN** el usuario activa el tab principal `CLIMA`
- **THEN** los 7 chips de preset son visibles en una fila horizontal en la parte superior del panel, debajo del header
- **AND** cada chip muestra un ícono pixel-art representativo arriba y un label en `SproutPixel` debajo

#### Scenario: Click en "Despejado" resetea todo
- **WHEN** el usuario hace click en el chip `Despejado`
- **THEN** las 9 tarjetas muestran intensidad `0.0`
- **AND** `cfg.onWeatherChange` se invoca una vez con todas las intensidades en 0

#### Scenario: Click en "Llovizna" aplica rain 0.3 y fog 0.2
- **WHEN** el usuario hace click en el chip `Llovizna`
- **THEN** la tarjeta de `rain` muestra `0.3` y la de `fog` muestra `0.2`
- **AND** las otras 7 tarjetas muestran `0.0`
- **AND** `cfg.onWeatherChange` se invoca una vez con `{rain: 0.3, snow: 0, pollen: 0, leaves: 0, night: 0, fog: 0.2, dust: 0, wind: 0, storm: 0}`

#### Scenario: Click en "Lluvia" aplica rain 0.6 y wind 0.2
- **WHEN** el usuario hace click en el chip `Lluvia`
- **THEN** la tarjeta de `rain` muestra `0.6` y la de `wind` muestra `0.2`
- **AND** las otras 7 tarjetas muestran `0.0`

#### Scenario: Click en "Tormenta" aplica combinación de 4 efectos
- **WHEN** el usuario hace click en el chip `Tormenta`
- **THEN** la tarjeta de `rain` muestra `0.7`, `storm` muestra `0.5`, `wind` muestra `0.4`, `night` muestra `0.2`
- **AND** las otras 5 tarjetas muestran `0.0`
- **AND** `cfg.onWeatherChange` se invoca una vez con el objeto completo

#### Scenario: Click en "Primavera" aplica pollen 0.4 y wind 0.1
- **WHEN** el usuario hace click en el chip `Primavera`
- **THEN** la tarjeta de `pollen` muestra `0.4` y la de `wind` muestra `0.1`
- **AND** las otras 7 tarjetas muestran `0.0`

#### Scenario: Click en "Otoño" aplica leaves 0.5 y wind 0.3
- **WHEN** el usuario hace click en el chip `Otoño`
- **THEN** la tarjeta de `leaves` muestra `0.5` y la de `wind` muestra `0.3`
- **AND** las otras 7 tarjetas muestran `0.0`

#### Scenario: Click en "Noche" aplica night 0.5
- **WHEN** el usuario hace click en el chip `Noche`
- **THEN** la tarjeta de `night` muestra `0.5` y las otras 8 tarjetas muestran `0.0`

#### Scenario: El preset se aplica sin confirmación
- **WHEN** el usuario hace click en cualquier chip de preset
- **THEN** no se muestra ningún modal de confirmación
- **AND** el cambio se aplica inmediatamente y se refleja en el canvas del editor

### Requirement: 9 tarjetas horizontales de efecto, una por tipo de clima
El panel SHALL contener exactamente 9 tarjetas (`.ed-weather-item`), una por cada tipo de `WEATHER_TYPES` (en orden: `rain`, `snow`, `pollen`, `leaves`, `night`, `fog`, `dust`, `wind`, `storm`). Cada tarjeta SHALL medir ~68px de alto y SHALL contener, de izquierda a derecha: un ícono pixel-art animado de 40×40 px, el nombre del tipo, un slider horizontal arrastrable de ~150 px de ancho, el valor numérico actual con un decimal, y un botón de acción rápida `0/0.5/1` (ícono ⓘ). Las tarjetas SHALL generarse dinámicamente desde JS iterando `WEATHER_TYPES` (importado de `WeatherSystem.js`), no declararse estáticamente en el HTML.

#### Scenario: Las 9 tarjetas son visibles bajo CLIMA
- **WHEN** el usuario activa el tab principal `CLIMA`
- **THEN** las 9 tarjetas son visibles en una columna vertical, en este orden: `rain`, `snow`, `pollen`, `leaves`, `night`, `fog`, `dust`, `wind`, `storm`
- **AND** cada tarjeta tiene altura ~68px y el ancho disponible del panel (~322px)

#### Scenario: El ícono de cada tarjeta es visualmente distinto
- **WHEN** las 9 tarjetas son visibles
- **THEN** los 9 íconos son distinguibles entre sí (no se repiten formas ni colores)
- **AND** cada ícono está dibujado como SVG inline con `viewBox="0 0 8 8"` y se renderiza a 40×40 px con `image-rendering: pixelated`

#### Scenario: El nombre de cada tarjeta es el label canónico en español
- **WHEN** el usuario ve una tarjeta
- **THEN** el nombre mostrado es el `getWeatherLabel(type)` correspondiente (`Rain`, `Snow`, `Pollen`, `Leaves`, `Night`, `Fog`, `Dust`, `Wind`, `Storm`) en mayúsculas, fuente `SproutPixel`, color `var(--sprout-dark)`

#### Scenario: Las tarjetas se generan desde WEATHER_TYPES
- **WHEN** `renderWeatherControls(cfg)` se ejecuta
- **THEN** el número de tarjetas en `#ed-weather-list` es exactamente `WEATHER_TYPES.length` (9)
- **AND** el `data-weather` de cada tarjeta coincide con el string del tipo correspondiente
- **AND** el orden de las tarjetas en el DOM es el mismo que el orden en `WEATHER_TYPES`

### Requirement: Slider horizontal arrastrable de 0.0 a 1.0
Cada tarjeta SHALL contener un slider horizontal custom (no `<input type="range">` visible) de ~150px de ancho con track, fill coloreado por el color canónico del tipo, y un thumb arrastrable. El slider SHALL permitir ajustar la intensidad de 0.0 a 1.0 en pasos de 0.1. SHALL aceptar los siguientes gestos: click en cualquier punto del track → salta a ese valor; drag del thumb → ajuste continuo; click derecho sobre la tarjeta → reset a 0; doble click en el thumb → salta a 1.0; Shift+click en el track → snap a 0.5. Al terminar el drag (pointerup) SHALL invocarse `cfg.onWeatherChange` una sola vez con el valor final.

#### Scenario: Click en el track ajusta el valor directamente
- **WHEN** el usuario hace click en un punto del track del slider
- **THEN** el thumb salta a esa posición
- **AND** el valor numérico se actualiza al valor correspondiente (redondeado a 0.1)
- **AND** la intensidad del efecto en `cfg.getWeather()` cambia a ese valor
- **AND** `cfg.onWeatherChange` se invoca una vez con el valor actualizado

#### Scenario: Drag del thumb ajusta el valor continuamente
- **WHEN** el usuario hace pointerdown sobre el thumb y arrastra sin soltar
- **THEN** el thumb sigue al cursor en tiempo real
- **AND** el valor numérico se actualiza continuamente (sin redondear hasta el final)
- **AND** `cfg.onWeatherChange` NO se invoca durante el drag
- **WHEN** el usuario suelta (pointerup)
- **THEN** el valor se redondea a 0.1
- **AND** `cfg.onWeatherChange` se invoca una sola vez con el valor final redondeado

#### Scenario: Click derecho sobre la tarjeta resetea a 0
- **WHEN** el usuario hace click derecho (contextmenu) sobre una tarjeta
- **THEN** la intensidad de ese efecto se resetea a 0
- **AND** el slider se posiciona al inicio (thumb en 0)
- **AND** `cfg.onWeatherChange` se invoca una vez con ese efecto en 0
- **AND** se previene el menú contextual del navegador (`preventDefault`)

#### Scenario: Doble click en el thumb salta a 1.0
- **WHEN** el usuario hace doble click sobre el thumb del slider
- **THEN** la intensidad salta a 1.0
- **AND** el thumb se posiciona al final del track
- **AND** `cfg.onWeatherChange` se invoca una vez con el efecto en 1.0

#### Scenario: Shift+click en el track snap a 0.5
- **WHEN** el usuario hace Shift+click sobre el track
- **THEN** la intensidad se ajusta a 0.5 (independientemente del punto clickeado)
- **AND** el thumb se posiciona en la mitad del track
- **AND** `cfg.onWeatherChange` se invoca una vez con el efecto en 0.5

#### Scenario: El fill del slider se tiñe con el color canónico del tipo
- **WHEN** el usuario ve una tarjeta con intensidad > 0
- **THEN** el fill del slider (la parte coloreada entre el inicio y el thumb) tiene un color basado en el `COLORS[type]` de `WeatherSystem.js` para el tipo de esa tarjeta
- **AND** el fill tiene opacidad ~0.6 para no saturar visualmente

#### Scenario: Botones ▲▼ siguen disponibles como atajo de teclado
- **WHEN** el usuario tabula hasta los botones ▲▼ de una tarjeta y presiona Enter sobre ▲
- **THEN** la intensidad sube 0.1 (sin pasar de 1.0)
- **AND** `cfg.onWeatherChange` se invoca con el nuevo valor
- **WHEN** el usuario presiona Enter sobre ▼
- **THEN** la intensidad baja 0.1 (sin pasar de 0.0)
- **AND** `cfg.onWeatherChange` se invoca con el nuevo valor

#### Scenario: Slider accesible vía input range oculto para screen readers
- **WHEN** el editor se inicializa
- **THEN** cada tarjeta contiene un `<input type="range" min="0" max="1" step="0.1" aria-label="<Tipo> intensidad">` visualmente oculto (`position: absolute; opacity: 0; pointer-events: none`)
- **AND** ese input range se sincroniza con el slider visible: cambia de valor cuando el usuario arrastra/snap/click en el track, y al cambiar el input (vía teclado/asistente) se actualiza el slider visible y `cfg.onWeatherChange`

### Requirement: Iconos pixel-art animados por tipo
Cada una de las 9 tarjetas SHALL contener un ícono pixel-art único, dibujado como SVG inline con `viewBox="0 0 8 8"`, renderizado a 40×40 px con `image-rendering: pixelated`. Los íconos SHALL animarse (vía CSS `@keyframes`) cuando la intensidad de su efecto es > 0, y SHALL estar dimmed/pausados cuando la intensidad es 0. La paleta de cada ícono SHALL estar alineada con los `COLORS` de `WeatherSystem.js` para ese tipo.

#### Scenario: Cada tipo tiene un ícono visualmente distinto
- **WHEN** las 9 tarjetas son visibles
- **THEN** los 9 íconos son distinguibles entre sí: rain muestra gotas/líneas, snow muestra copos, pollen muestra motas amarillas, leaves muestra hojas marrones, night muestra luna+estrellas, fog muestra formas difusas, dust muestra puntos, wind muestra líneas curvas, storm muestra rayo+glifo

#### Scenario: Ícono animado cuando intensidad > 0
- **WHEN** una tarjeta tiene intensidad > 0
- **THEN** el SVG del ícono de esa tarjeta aplica una animación CSS `@keyframes` específica de su tipo (drop fall, snow drift, leaf rotate, etc.)
- **AND** la animación tiene `animation-play-state: running`
- **AND** el color principal del ícono usa el `COLORS[type]` correspondiente (teñido vía `currentColor` + `color` CSS)

#### Scenario: Ícono dimmed y pausado cuando intensidad == 0
- **WHEN** una tarjeta tiene intensidad == 0
- **THEN** el SVG del ícono de esa tarjeta tiene `opacity: 0.5` y `filter: grayscale(0.3)`
- **AND** su animación CSS tiene `animation-play-state: paused`
- **AND** la tarjeta completa tiene una opacidad visual reducida (no el slider ni el valor, solo el ícono)

#### Scenario: Transición de estado al cambiar la intensidad
- **WHEN** la intensidad de una tarjeta cambia de 0 a 0.1 (o más)
- **THEN** el ícono de esa tarjeta pasa de dimmed/pausado a animado/full opacity (transición CSS de ~150ms)
- **WHEN** la intensidad cambia de >0 a 0
- **THEN** el ícono pasa de animado a dimmed/pausado (transición de ~150ms)

### Requirement: Render data-driven desde WEATHER_TYPES
La función `renderWeatherControls(cfg)` SHALL iterar `WEATHER_TYPES` (importado de `engine/level/WeatherSystem.js`) para construir las 9 tarjetas dinámicamente. SHALL leer las intensidades actuales de `cfg.getWeather?.()` y SHALL inicializar cada slider y valor numérico al valor correspondiente (redondeado a 0.1, clampeado a [0, 1]). SHALL leer `getWeatherLabel(type)` para el nombre visible. SHALL invocarse una sola vez al `showEditor(cfg)` (mismo lugar que la implementación actual).

#### Scenario: Inicialización desde cfg.getWeather()
- **WHEN** `renderWeatherControls(cfg)` se ejecuta con `cfg.getWeather()` retornando `{rain: 0.3, snow: 0, pollen: 0.4, leaves: 0, night: 0.5, fog: 0, dust: 0, wind: 0.1, storm: 0}`
- **THEN** la tarjeta de `rain` muestra `0.3` en su slider y valor numérico
- **AND** la tarjeta de `pollen` muestra `0.4`
- **AND** la tarjeta de `night` muestra `0.5`
- **AND** la tarjeta de `wind` muestra `0.1`
- **AND** las tarjetas de `snow`, `leaves`, `fog`, `dust`, `storm` muestran `0.0`
- **AND** las tarjetas con intensidad > 0 muestran su ícono animado, las demás dimmed

#### Scenario: Valores fuera de rango se clampean
- **WHEN** `cfg.getWeather()` retorna un valor fuera de [0, 1] para algún tipo (por migración de formato legacy)
- **THEN** el slider y el valor numérico de esa tarjeta se inicializan al valor clampeado a [0, 1]
- **AND** se redondea a 0.1

#### Scenario: Si cfg.getWeather() retorna undefined, se usa DEFAULT_WEATHER
- **WHEN** `cfg.getWeather` no existe o retorna undefined
- **THEN** se usa `getDefaultWeather()` de `WeatherSystem.js` (todas las intensidades en 0) como estado inicial
- **AND** todas las tarjetas muestran `0.0`

#### Scenario: Si cfg.onWeatherChange no existe, los gestos son no-ops visuales
- **WHEN** `cfg.onWeatherChange` no está definido
- **THEN** el slider, el valor numérico y el ícono se actualizan visualmente igual
- **AND** no se lanza error (el `?.` lo hace opcional)

### Requirement: Compatibilidad con el motor y los formatos existentes
La nueva UI SHALL ser compatible con el contrato existente: `cfg.getWeather()` y `cfg.onWeatherChange(updated)` SHALL mantener la misma firma y el mismo shape de datos (`{rain, snow, pollen, leaves, night, fog, dust, wind, storm}` con valores 0.0-1.0). Los niveles guardados con `weather` válido en JSON o `localStorage` SHALL seguir cargando sin cambios. El handler `cfg.onWeatherChange` SHALL seguir siendo invocado con un objeto completo, no con diffs parciales.

#### Scenario: Carga de un nivel con weather preexistente
- **WHEN** el editor abre un nivel cuyo JSON tiene `"weather": {"rain": 0.5, "snow": 0, "pollen": 0.2, ...}`
- **THEN** el panel de clima inicializa las 9 tarjetas con los valores del JSON
- **AND** la tarjeta de `rain` muestra `0.5`, la de `pollen` muestra `0.2`, las demás muestran lo que indique el JSON

#### Scenario: Cambio de intensidad se propaga al motor
- **WHEN** el usuario ajusta el slider de `rain` a `0.6`
- **THEN** `cfg.onWeatherChange` se invoca con `{rain: 0.6, ...resto igual al estado anterior}`
- **AND** `EditorScene` actualiza el clima del canvas sin requerir reload

#### Scenario: Aplicar un preset llama a onWeatherChange una sola vez
- **WHEN** el usuario hace click en el preset `Tormenta`
- **THEN** `cfg.onWeatherChange` se invoca exactamente una vez con `{rain: 0.7, snow: 0, pollen: 0, leaves: 0, night: 0.2, fog: 0, dust: 0, wind: 0.4, storm: 0.5}` (las 9 claves presentes)
- **AND** NO se hacen 4 llamadas separadas (una por cada efecto del preset)

### Requirement: API pública de `__setEditor_*` no cambia
Todas las funciones globales expuestas en `window.__setEditor*` SHALL mantener su contrato actual (firma, semántica, eventos que disparan). Los cambios SHALL ser puramente presentacionales y de organización del DOM, sin modificar cómo `EditorScene` se comunica con el panel.

#### Scenario: Las globals siguen expuestas
- **WHEN** el editor se inicializa
- **THEN** `window.__setEditor`, `window.__setEditor_updateLayer`, `window.__setEditor_updateSelected`, `window.__setEditor_updateTerrain`, `window.__setEditor_updateObjectSelected`, `window.__setEditor_updateMode`, `window.__setEditor_updateSummary`, `window.__setEditor_showToast`, `window.__setEditor_showLayerPicker`, `window.__setEditor_hideLayerPicker`, `window.__setEditor_markDirty` siguen existiendo con las mismas firmas
- **AND** `EditorScene` puede llamar a `window.__setEditor(cfg)` con el mismo `cfg` que antes y el editor funciona igual

#### Scenario: El comportamiento de los tab principales no cambia
- **WHEN** el usuario hace click en el tab `ASSETS` o en el tab `CLIMA`
- **THEN** el cambio de visibilidad de los paneles y la conservación del sub-tab activo se comporta igual que en el cambio `reorder-editor-ui` (no se resetea el sub-tab al cambiar a CLIMA y volver)
