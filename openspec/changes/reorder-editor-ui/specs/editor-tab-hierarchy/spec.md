## ADDED Requirements

### Requirement: Jerarquía de tabs de dos niveles
El panel del editor SHALL expone una jerarquía de tabs de dos niveles. El primer nivel SHALL contener exactamente dos tabs: `ASSETS` y `CLIMA`. El segundo nivel SHALL existir solo bajo `ASSETS` y SHALL contener exactamente dos sub-tabs: `Tileset` y `Objetos`. En cualquier momento SHALL haber exactamente un tab principal activo y (bajo `ASSETS`) exactamente un sub-tab activo.

#### Scenario: Editor abre con ASSETS activo
- **WHEN** el editor se muestra por primera vez (`window.__setEditor(cfg)` con un cfg válido)
- **THEN** el tab principal `ASSETS` está marcado como activo y su contenido es visible
- **AND** el tab principal `CLIMA` está marcado como inactivo y su contenido está oculto
- **AND** el sub-tab `Tileset` (o el último sub-tab activo de la sesión anterior, si se persistiera) está marcado como activo

#### Scenario: Click en tab principal CLIMA
- **WHEN** el usuario hace click en el botón del tab principal `CLIMA`
- **THEN** el botón `CLIMA` queda marcado como activo y `ASSETS` como inactivo
- **AND** el panel de clima se vuelve visible y el panel de assets se oculta
- **AND** el sub-tab activo dentro de assets no cambia (no se resetea)

#### Scenario: Click en tab principal ASSETS
- **WHEN** el usuario hace click en el botón del tab principal `ASSETS` mientras `CLIMA` está activo
- **THEN** el botón `ASSETS` queda marcado como activo y `CLIMA` como inactivo
- **AND** el panel de assets se vuelve visible y el panel de clima se oculta
- **AND** el sub-tab que estaba activo la última vez que se visitó `ASSETS` queda activo (no se resetea al cambiar a CLIMA y volver)

#### Scenario: Click en sub-tab Tileset bajo ASSETS
- **WHEN** el tab principal `ASSETS` está activo y el usuario hace click en el sub-tab `Tileset`
- **THEN** el botón `Tileset` queda marcado como activo y `Objetos` como inactivo
- **AND** el panel de tileset se vuelve visible y el panel de objetos se oculta
- **AND** el callback `cfg.onTabChange?.('tileset')` se invoca

#### Scenario: Click en sub-tab Objetos bajo ASSETS
- **WHEN** el tab principal `ASSETS` está activo y el usuario hace click en el sub-tab `Objetos`
- **THEN** el botón `Objetos` queda marcado como activo y `Tileset` como inactivo
- **AND** el panel de objetos se vuelve visible y el panel de tileset se oculta
- **AND** el callback `cfg.onTabChange?.('objects')` se invoca

#### Scenario: Sub-tabs no son clickeables bajo CLIMA
- **WHEN** el tab principal `CLIMA` está activo
- **THEN** los botones de sub-tabs `Tileset` y `Objetos` no son interactuables (están ocultos junto con el resto del panel de assets)

### Requirement: Botón "Limpiar capa" inline en el header de Capa
El editor SHALL mostrar el botón `#ed-clear` (Limpiar capa) en el header del bloque "Capa", alineado a la derecha del título `<h3>Capa</h3>`. El botón SHALL ser visualmente compacto (un ícono, no un botón full-width) y SHALL disparar el mismo handler que dispara actualmente: el modal de confirmación `¿Limpiar la capa "<nombre de la capa activa>"?` seguido de `cfg.onClear?.()` si el usuario confirma.

#### Scenario: Click en el botón inline de Limpiar capa
- **WHEN** el usuario hace click en el botón 🧹 del header de "Capa"
- **THEN** se muestra el modal con el texto `¿Limpiar la capa "<nombre>"?` donde `<nombre>` es el valor retornado por `cfg.getLayer?.()`
- **AND** si el usuario confirma, se invoca `cfg.onClear?.()` (que limpia la capa activa)
- **AND** si el usuario cancela, no se invoca `cfg.onClear?.()`

#### Scenario: El botón inline es visible en cualquier tab principal
- **WHEN** el tab principal es `ASSETS` o `CLIMA`
- **THEN** el botón 🧹 del header de "Capa" es visible e interactuable (la columna izquierda del editor no se ve afectada por el cambio de tab principal)

### Requirement: Duplicados de Undo/Redo eliminados de "Acciones"
El editor SHALL NO contener los botones `#ed-undo` o `#ed-redo` en la sección "Acciones". Las funcionalidades de deshacer y rehacer SHALL seguir disponibles exclusivamente a través de:
- Los botones `#ed-tool-undo` y `#ed-tool-redo` en la sección "Historial"
- Los atajos de teclado `Ctrl+Z` (undo) y `Ctrl+Y` (redo) ya definidos en `EditorScene.js:238-239`

#### Scenario: No existen los IDs #ed-undo ni #ed-redo
- **WHEN** el editor se inicializa
- **THEN** `document.getElementById('ed-undo')` retorna `null`
- **AND** `document.getElementById('ed-redo')` retorna `null`

#### Scenario: El handler de undo sigue accesible vía toolbar
- **WHEN** el usuario hace click en `#ed-tool-undo` (toolbar de Historial)
- **THEN** se invoca `cfg.onUndo?.()` (mismo comportamiento que antes)

#### Scenario: El handler de undo sigue accesible vía atajo de teclado
- **WHEN** el usuario presiona `Ctrl+Z` mientras el canvas del editor tiene foco
- **THEN** se invoca `this.undo()` en `EditorScene` (mismo comportamiento que antes, sin cambios en `EditorScene.js`)

### Requirement: Preview visible solo bajo ASSETS
El bloque `#ed-preview` (imagen + info del tile u objeto seleccionado) SHALL ser visible solo cuando el tab principal `ASSETS` está activo. Cuando el tab principal `CLIMA` está activo, el bloque SHALL estar oculto (no debe ocupar espacio vertical ni ser visible al usuario).

#### Scenario: Preview visible en ASSETS
- **WHEN** el tab principal `ASSETS` está activo y hay un tile u objeto seleccionado
- **THEN** el bloque `#ed-preview` es visible y muestra la imagen e info del elemento seleccionado

#### Scenario: Preview oculto en CLIMA
- **WHEN** el usuario cambia al tab principal `CLIMA`
- **THEN** el bloque `#ed-preview` se oculta (no visible, no ocupa espacio)
- **AND** el tile u objeto previamente seleccionado sigue seleccionado internamente (la selección NO se resetea al cambiar de tab)

#### Scenario: Preview reaparece al volver a ASSETS
- **WHEN** el usuario vuelve al tab principal `ASSETS` después de haber estado en `CLIMA`
- **THEN** el bloque `#ed-preview` vuelve a ser visible
- **AND** sigue mostrando el tile u objeto que estaba seleccionado antes de ir a `CLIMA` (no se pierde el estado de selección)

### Requirement: Panel de clima con altura reservada
El panel `#ed-weather-panel` SHALL tener `min-height: 300px` y `overflow-y: auto`. SHALL ser visible solo cuando el tab principal `CLIMA` está activo. SHALL contener la lista de efectos de clima (`#ed-weather-list` con sus `.ed-weather-item` para rain, snow, pollen, leaves, night, fog, dust, wind, storm).

#### Scenario: Panel de clima visible bajo CLIMA
- **WHEN** el usuario activa el tab principal `CLIMA`
- **THEN** `#ed-weather-panel` es visible
- **AND** su altura es al menos 300px (aunque los 8 efectos actuales ocupen menos)
- **AND** los 8 efectos (rain, snow, pollen, leaves, night, fog, dust, wind, storm) son visibles y editables

#### Scenario: Panel de clima oculto bajo ASSETS
- **WHEN** el usuario activa el tab principal `ASSETS`
- **THEN** `#ed-weather-panel` no es visible

#### Scenario: Scroll vertical si el contenido excede la altura
- **WHEN** en el futuro el rediseño de clima agrega más controles y la suma excede la altura disponible del panel
- **THEN** el panel muestra una scrollbar vertical en lugar de cortar el contenido o expandir el `#editor-panel`

### Requirement: API pública de `__setEditor_*` no cambia
Todas las funciones globales expuestas en `window.__setEditor*` SHALL mantener su contrato actual (firma, semántica, eventos que disparan). Los cambios SHALL ser puramente presentacionales y de organización del DOM, sin modificar cómo `EditorScene` se comunica con el panel.

#### Scenario: Las globals siguen expuestas
- **WHEN** el editor se inicializa
- **THEN** `window.__setEditor`, `window.__setEditor_updateLayer`, `window.__setEditor_updateSelected`, `window.__setEditor_updateTerrain`, `window.__setEditor_updateObjectSelected`, `window.__setEditor_updateMode`, `window.__setEditor_updateSummary`, `window.__setEditor_showToast`, `window.__setEditor_showLayerPicker`, `window.__setEditor_hideLayerPicker`, `window.__setEditor_markDirty` siguen existiendo con las mismas firmas

#### Scenario: EditorScene no requiere cambios
- **WHEN** `EditorScene` llama a `window.__setEditor(cfg)` con el mismo `cfg` que antes del cambio
- **THEN** el editor se muestra y funciona igual que antes (las llamadas a `cfg.onLayer`, `cfg.onSelect`, `cfg.onObjectSelect`, `cfg.onClear`, `cfg.onClearObjects`, `cfg.onUndo`, `cfg.onRedo`, `cfg.onRevert`, `cfg.onWeatherChange`, etc. siguen funcionando)
