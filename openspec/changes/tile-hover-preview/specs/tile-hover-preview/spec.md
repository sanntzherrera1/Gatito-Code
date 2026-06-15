## ADDED Requirements

### Requirement: Preview flotante al hacer hover sobre un tile de la paleta
Al hacer hover sobre un `.ed-tile` (no `.eraser`) en `#ed-palette` o `#ed-obj-palette`, el editor MUST mostrar un preview flotante (`#ed-tile-hover-preview`) anclado al tile hovereado, mostrando ese mismo frame. Al hacer `mouseleave` del tile o de la paleta, el preview MUST ocultarse.

#### Scenario: Hover sobre un tile de tileset 16×16
- **WHEN** el usuario hace hover sobre un `.ed-tile` en `#ed-palette` correspondiente a un tile 16×16 del tileset activo, con el canvas del editor renderizándose a una escala de display de 4x
- **THEN** el preview flotante aparece a la derecha del tile hovereado, centrado verticalmente
- **AND** el preview muestra el tile 16×16 escalado a 64×64 CSS px (tamaño real en el mapa: `16 × 4x`)
- **AND** el tile se ve correctamente recortado de la imagen del tileset, sin pixelado incorrecto ni descentramiento

#### Scenario: Hover sobre un frame irregular de objeto (16×32)
- **WHEN** el usuario hace hover sobre un `.ed-tile` en `#ed-obj-palette` correspondiente a un frame de 16×32 (e.g. furniture frame 6), con escala de display 4x
- **THEN** el preview muestra ese frame dimensionado a 64×128 CSS px (tamaño real en el mapa)
- **AND** el frame está correctamente recortado y posicionado dentro del preview (no aparece pegado a un lado, no se corta)

#### Scenario: Hover sobre un frame que excede el cap de 128px
- **WHEN** el usuario hace hover sobre un `.ed-tile` cuyo frame multiplicado por la escala del mapa excede 128px en alguna dimensión (e.g. un frame 64×64 a 4x = 256px)
- **THEN** el preview MUST mostrar el frame capeado a 128px en su dimensión más larga, preservando el aspect ratio
- **AND** la dimensión más corta se escala proporcionalmente (e.g. 64×64 a 4x capeado → 128×128)

#### Scenario: Hover cerca del borde derecho del editor
- **WHEN** el usuario hace hover sobre un `.ed-tile` cuyo tile hovereado está a menos de 128px + 8px de gap + padding del borde derecho del viewport
- **THEN** el preview MUST flipear para aparecer a la izquierda del tile, en vez de a la derecha
- **AND** el preview no debe quedar cortado por el borde del viewport

#### Scenario: Hover sobre el tile de borrador
- **WHEN** el usuario hace hover sobre el `.ed-tile.eraser` en `#ed-palette`
- **THEN** el preview flotante NO debe aparecer (no hay frame que previsualizar)

#### Scenario: Cursor sale de la paleta
- **WHEN** el usuario mueve el cursor fuera de `#ed-palette` o `#ed-obj-palette` (e.g. hacia el canvas)
- **THEN** el preview flotante MUST ocultarse (`mouseleave` de la paleta)
- **AND** el preview no debe reaparecer hasta que el cursor vuelva a hacer hover sobre un `.ed-tile`

#### Scenario: Cambio de tab principal
- **WHEN** el usuario cambia del tab principal `ASSETS` al tab `CLIMA` con el cursor sobre un `.ed-tile`
- **THEN** el preview flotante MUST ocultarse
- **AND** al volver a `ASSETS`, el preview no debe aparecer hasta el próximo hover sobre un tile (no se persiste el estado del último preview)

### Requirement: Render del frame compartido entre paleta y preview
El cálculo del recorte de un frame dentro de la imagen fuente (URL, `backgroundSize`, `backgroundPosition`) MUST ser el mismo en la paleta (`#ed-palette`, `#ed-obj-palette`) y en el preview flotante (`#ed-tile-hover-preview`). Ambos consumidores MUST usar el mismo helper `buildFrameThumbnailStyle(fingerprint, targetSize)` que recibe el fingerprint `{url, f, imgW, imgH}` del frame en la imagen fuente y devuelve los estilos CSS. Esto elimina la duplicación de la fórmula de recorte y previene divergencia entre la paleta y el preview.

#### Scenario: Frame irregular renderiza igual en paleta y preview
- **WHEN** un objeto tiene un frame de 16×32 (e.g. furniture frame 6) y el usuario lo ve en la paleta a 24×24
- **THEN** la fórmula de `backgroundSize` y `backgroundPosition` usada en el `inner` div de la paleta MUST ser la misma fórmula (con `targetSize=24`) que la usada en el preview flotante (con `targetSize` igual a la dimensión real del mapa, capeada a 128)
- **AND** cambiar el helper MUST reflejarse idénticamente en ambos consumidores

### Requirement: Eliminación del bloque `#ed-preview` permanente
El editor MUST NO contener un bloque DOM permanente `#ed-preview` (con su `#ed-preview-image` y `#ed-preview-info`). Toda la funcionalidad de preview del tile u objeto seleccionado pasa al preview flotante de hover. Las funciones `clearPreview`, `updateTilePreview`, `updateObjectPreview`, y `updatePreviewForActiveTab` MUST eliminarse. Los callbacks `window.__setEditor_updateSelected` y `window.__setEditor_updateObjectSelected` MUST seguir actualizando el estado de selección (`selectedGid`, `selectedObject`) para alimentar el fantasma del canvas, pero MUST NOT tocar un bloque de preview.

#### Scenario: El bloque `#ed-preview` ya no existe en el DOM
- **WHEN** el editor se inicializa
- **THEN** `document.getElementById('ed-preview')` MUST retornar `null`
- **AND** `document.getElementById('ed-preview-image')` MUST retornar `null`
- **AND** `document.getElementById('ed-preview-info')` MUST retornar `null`

#### Scenario: La selección de un tile actualiza el estado pero no un bloque de preview
- **WHEN** `EditorScene` llama a `window.__setEditor_updateSelected(gid)` con un gid válido
- **THEN** el estado interno `selectedGid` MUST actualizarse (para que el fantasma del cursor muestre el tile correcto)
- **AND** no se MUST modificar ningún elemento del DOM con id `#ed-preview*`

#### Scenario: La selección de un objeto actualiza el estado pero no un bloque de preview
- **WHEN** `EditorScene` llama a `window.__setEditor_updateObjectSelected(key, frame, type)`
- **THEN** el estado interno `selectedObject` MUST actualizarse
- **AND** no se MUST modificar ningún elemento del DOM con id `#ed-preview*`
