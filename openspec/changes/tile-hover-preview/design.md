## Context

El editor tiene dos paths de render para mostrar un frame de un OBJECTS o un tile de un tileset:

**Path 1: Paleta (`renderObjPalette` + `renderPalette` en `editor-ui.js:475-831`)**
- Tilesets y spritesheet objects: `.ed-tile` de 24×24 con `backgroundSize: t.cols*24, t.rows*24` y `backgroundPosition: -c*24, -r*24`. La escala es fija en 1.5x (24 CSS px por 16 source px).
- Objects con `frames` array: `.ed-tile` de 24×24 con `display: flex; justifyContent: center; alignItems: center`, e `inner` div dimensionado a `f.w * min(24/f.w, 24/f.h) × f.h * min(...)`, con `backgroundSize: imgW*scale, imgH*scale` y `backgroundPosition: -f.x*scale, -f.y*scale`. El centrado es implícito (el flex center del .ed-tile).

**Path 2: Preview (`updateObjectPreview` + `updateTilePreview` en `editor-ui.js:378-437`)**
- Tilesets: mismo cálculo que la paleta pero `scaleX=24` implícito (no se pasa por variable).
- Objects con `frames` array: `scale = min(80/f.w, 80/f.h)`, container dimensionado a `dispW × dispH = f.w*scale, f.h*scale`, `backgroundSize: imgW*scale, imgH*scale`, `backgroundPosition: -f.x*scale, -f.y*scale`. Sin centering — el frame se ancla a top-left del container dimensionado.
- Objects spritesheet: `scale = min(80/f.w, 80/f.h)`, mismo cálculo que path 1 con `80` reemplazando `24`.

El bug: para un frame 16×32 en path 2, `scale = 2.5`, `dispW = 40, dispH = 80`. El container es 40×80, el background-image es `imgW*2.5 × imgH*2.5` con offset `-f.x*2.5, -f.y*2.5`. El frame renderizado es 40×80 dentro del container 40×80, **pero** la imagen fuente (imgW × imgH) tiene padding o espacio sobrante para otros frames, así que cuando la hoja es mixta con frames de distintos tamaños, el "anclaje a top-left" pone el frame correcto en su lugar — la fórmula es matemáticamente válida. El problema visual viene de comparar con path 1, donde el `inner` está **flex-centered** dentro del 24×24 — la misma fórmula con `24` en vez de `80` produce un render idéntico al del preview, pero en el preview el container se *redimensiona* al frame en vez de centrarlo. Cuando el frame es más estrecho que 80, hay espacio sobrante a los lados, pero como el container también es angosto, no se nota. **El verdadero problema** es que el preview muestra el frame solo, sin contexto de la grilla — y el cap fijo de 80px es arbitrario: un frame 32×48 termina a 80×120 (sobrepasa el container CSS de 64×64 del `.ed-preview-image` que se le olvidó overridear — o sí lo overridea via inline style, eso sí funciona). El usuario percibe "se ve mal" porque **el preview no coincide con la realidad del mapa** (donde un tile 16×16 se ve a 64×64 con zoom 4x, no a 80×80 fijo).

**Decisión del usuario en explore mode:** en vez de arreglar la math (como se hizo con `fix-layer-picker-thumbnail-centering`), eliminar la duplicación estructuralmente. Reutilizar el render del `.ed-tile` que ya muestra el frame correctamente, escalado al tamaño real del mapa en vez de un cap arbitrario.

## Goals / Non-Goals

**Goals:**
- Eliminar el bloque DOM permanente `#ed-preview` y todas sus reglas CSS.
- Eliminar las funciones `clearPreview`, `updateTilePreview`, `updateObjectPreview`, `updatePreviewForActiveTab` y los refs `edPreviewImage`, `edPreviewInfo`.
- Al hacer hover sobre un `.ed-tile` (no eraser) en `#ed-palette` o `#ed-obj-palette`, mostrar un preview flotante con el mismo frame, dimensionado a su tamaño real en el mapa (`f.w × scaleX`, `f.h × scaleY` donde `scaleX/Y` es la escala de display actual del canvas), capeado a 128px en la dimensión más larga.
- Posicionar el preview anclado al `.ed-tile` hovereado (a la derecha, centrado verticalmente). Si se sale del viewport por la derecha, flipear a la izquierda.
- Extraer un helper `buildFrameThumbnailStyle(fingerprint, targetSize)` compartido entre la paleta y el hover preview, con fingerprint = `{url, f, imgW, imgH}`.
- Extraer helpers de fingerprint `getFrameRectInImage(objDef, frame)` y `getTilesetFrameRect(tileset, gid)` para los tres casos (frames array, spritesheet objects, tilesets).
- Conservar `window.__setEditor_updateSelected` y `__setEditor_updateObjectSelected` (siguen actualizando `selectedGid`/`selectedObject` para el fantasma del canvas) pero sin tocar un bloque de preview.
- Desktop only. El `title` attribute del `.ed-tile` sigue dando metadata.

**Non-Goals:**
- No soporte touch / mobile (`@media (hover: none)` desactiva el preview; el `title` tooltip del navegador sigue funcionando).
- No soporte teclado para disparar el preview (no hay equivalente a hover para foco; el `title` cubre el caso).
- No refactor de `renderLayerPicker` (el "tercer consumidor" de `buildFrameThumbnailStyle` que el design de `fix-layer-picker-full-stack` anticipó) — oportunidad futura, fuera de scope.
- No tocar el eraser (no hay preview para el eraser).
- No modificar la spec `editor-tab-hierarchy` de `reorder-editor-ui` aunque su requirement "Preview visible solo bajo ASSETS" quede obsoleto — por decisión del usuario.
- No cambiar la API pública de `__setEditor_*` (las firmas se mantienen, solo se eliminan las llamadas internas a funciones de preview).
- No introducir nuevas dependencias.

## Decisions

### Helper `buildFrameThumbnailStyle(fingerprint, targetSize)`

Devuelve `{backgroundImage, backgroundSize, backgroundPosition, width, height}` donde `width` y `height` son las dimensiones *del frame renderizado* (no del container):

```js
function buildFrameThumbnailStyle({ url, f, imgW, imgH }, targetSize) {
  const scale = Math.min(targetSize / f.w, targetSize / f.h);
  return {
    backgroundImage: `url("${url}")`,
    backgroundSize: `${imgW * scale}px ${imgH * scale}px`,
    backgroundPosition: `-${f.x * scale}px -${f.y * scale}px`,
    width: `${f.w * scale}px`,
    height: `${f.h * scale}px`,
  };
}
```

- `targetSize` = dimensión máxima del frame en CSS px. Para la paleta: `24`. Para el hover preview: `min(max(f.w*scaleX, f.h*scaleY), 128)`.
- `scale = min(targetSize/f.w, targetSize/f.h)` garantiza aspect ratio y que el frame quepa en `targetSize × targetSize`.
- El frame renderizado ocupa `f.w*scale × f.h*scale` (puede ser menor que `targetSize` en una dimensión si el frame no es cuadrado).
- El container que use este estilo debe tener `background-repeat: no-repeat` (lo aplicamos en CSS, no en el helper).

### Helpers de fingerprint

Dos funciones simétricas que devuelven `{url, f, imgW, imgH}`:

```js
function getFrameRectInImage(objDef, frame, sourceTileSize = 16) {
  if (objDef.frames) {
    const f = objDef.frames[frame] || objDef.frames[0];
    const imgW = Math.max(...objDef.frames.map(fr => fr.x + fr.w));
    const imgH = Math.max(...objDef.frames.map(fr => fr.y + fr.h));
    return { url: objDef.url, f, imgW, imgH };
  } else {
    const cols = objDef.cols;
    const row = Math.floor(frame / cols);
    const col = frame % cols;
    return {
      url: objDef.url,
      f: { x: col * sourceTileSize, y: row * sourceTileSize, w: sourceTileSize, h: sourceTileSize },
      imgW: cols * sourceTileSize,
      imgH: objDef.rows * sourceTileSize,
    };
  }
}

function getTilesetFrameRect(tileset, gid) {
  const localIdx = gid - tileset.firstgid;
  const row = Math.floor(localIdx / tileset.cols);
  const col = localIdx % tileset.cols;
  return {
    url: tileset.url,
    f: { x: col * 16, y: row * 16, w: 16, h: 16 },
    imgW: tileset.cols * 16,
    imgH: tileset.rows * 16,
  };
}
```

**Decisión:** el tamaño source por defecto es 16, que coincide con `TILE = 16` en `config/game.js` (todos los tilesets y spritesheets del juego son 16×16 por celda). Si en el futuro hay tilesets de otro tamaño, se parametriza por tileset.

**Decisión:** la rama de `frames` array calcula `imgW`/`imgH` como bounding box (`max(x+w), max(y+h)`) — el mismo cálculo que `renderObjPalette` ya hace. Es el tamaño "útil" de la imagen, no necesariamente el tamaño real del PNG. Si el PNG tiene padding transparente alrededor de los frames, ese padding se ignora.

### Cap de 128px

Para el hover preview, `targetSize = min(max(f.w*scaleX, f.h*scaleY), 128)` donde `scaleX, scaleY` se leen del `canvas` actual (igual que hace `renderLayerPicker` en `editor-ui.js:246-250`).

Justificación del cap:
- 128px es ~3.3x el ancho del `#editor-panel` mínimo (480px) dividido entre ~3.3 = generoso pero no overflow.
- A 4x zoom (típico), un frame 16×16 → 64px (sin cap). Un frame 32×32 → 128px (toca el cap). Un frame 64×64 → 256px → capeado a 128. Un frame 96×96 (caso patológico) → 384px → capeado a 128.
- El cap es por dimensión más larga, no por área: un frame 16×48 a 4x = 64×192 → capeado a 128 en la dimensión larga → targetSize=128, scale=min(128/16, 128/48)=2.67, final=42.67×128. Razonable.

**Decisión:** cap fijo en 128 (no configurable en esta change). Si en el futuro aparece un caso real que necesite más, se agrega una constante o se parametriza.

### "Tamaño real en el mapa" = escala de display del canvas

El usuario pidió "el tamaño real que tendría ese elemento en el mapa". El mapa se renderiza en un canvas Phaser de 256×192 (16×12 cells × 16 game-px) que el browser estira al viewport. La escala de display actual es `rect.width / canvas.width` (típicamente 4x a 1024×768). Usamos esa escala para calcular las dimensiones del preview:

```js
const canvas = document.querySelector('canvas');
const rect = canvas?.getBoundingClientRect();
const scaleX = canvas.width > 0 ? rect.width / canvas.width : 4;
const scaleY = canvas.height > 0 ? rect.height / canvas.height : 4;
```

Si la ventana se redimensiona, el preview se ajusta automáticamente en el próximo hover (no recalculamos en cada frame, solo cuando se dispara el evento).

**Decisión:** misma fórmula que `renderLayerPicker` (`editor-ui.js:249-250`) — reuso mental, código idéntico. Si en el futuro se centraliza el cálculo de escala de canvas, se extrae a un helper compartido.

### DOM del hover preview

Un solo elemento singleton en `index.html`, hermano de `#ed-layer-picker`:

```html
<div id="ed-tile-hover-preview" class="ed-tile-hover-preview"></div>
```

CSS:
```css
.ed-tile-hover-preview {
  position: fixed;
  display: none;
  background-repeat: no-repeat;
  image-rendering: pixelated;
  border: 1px solid rgba(255,200,80,.35);
  border-radius: 6px;
  background-color: rgba(40,28,16,.92);
  z-index: 998;  /* below #ed-layer-picker (999) */
  box-shadow: 0 4px 16px rgba(0,0,0,.4);
}
.ed-tile-hover-preview.visible {
  display: block;
}
```

**Decisión:** z-index 998, debajo del layer picker (999). Si ambos se muestran simultáneamente (caso raro: usuario en modo copiar, hover sobre el mapa, y mueve el mouse a la paleta), el layer picker tiene precedencia visual.

### Posicionamiento (Modelo A)

Anclado al `.ed-tile` hovereado, a la derecha por defecto, flipea a la izquierda si se sale del viewport:

```js
function positionHoverPreview(tileEl, dispW, dispH) {
  const padding = 6;
  const gap = 8;
  const totalW = dispW + padding * 2;
  const totalH = dispH + padding * 2;
  const rect = tileEl.getBoundingClientRect();

  // Try right
  let left = rect.right + gap;
  if (left + totalW > window.innerWidth - 4) {
    // Flip to left
    left = rect.left - gap - totalW;
    if (left < 4) {
      // Fallback: center horizontally
      left = Math.max(4, (window.innerWidth - totalW) / 2);
    }
  }

  // Center vertically on the tile, clamped
  let top = rect.top + rect.height / 2 - totalH / 2;
  top = Math.max(4, Math.min(window.innerHeight - totalH - 4, top));

  edHoverPreview.style.left = `${left}px`;
  edHoverPreview.style.top = `${top}px`;
}
```

**Decisión:** padding interno de 6px para que el frame no toque el borde. Centrado vertical sobre el tile, no sobre la paleta — así si el usuario scrollea la paleta, el preview se reposiciona en cada hover (el listener se re-dispara en `mouseover`).

### Event delegation

Un listener por palette (`#ed-palette` y `#ed-obj-palette`), usando `mouseover`/`mouseout`/`mouseleave`:

```js
function initHoverPreview() {
  const palettes = ['ed-palette', 'ed-obj-palette'];
  for (const id of palettes) {
    const palette = document.getElementById(id);
    if (!palette) continue;

    palette.addEventListener('mouseover', (e) => {
      const tile = e.target.closest('.ed-tile');
      if (!tile || tile.classList.contains('eraser')) return;
      showTileHoverPreview(id, tile);
    });

    palette.addEventListener('mouseout', (e) => {
      // Hide when leaving a tile (brief flicker acceptable, re-shown on next mouseover)
      if (e.target.closest('.ed-tile')) hideTileHoverPreview();
    });

    palette.addEventListener('mouseleave', () => hideTileHoverPreview());
  }
}
```

- `mouseover` (bubbles): muestra el preview cuando el cursor entra a un tile.
- `mouseout` (bubbles): oculta el preview cuando el cursor sale de un tile. Breve flicker entre tiles adyacentes — aceptable, dura <16ms.
- `mouseleave` (no bubbles, en la palette): oculta el preview cuando el cursor sale de la palette entera (e.g. va al canvas).

**Decisión:** `mouseover`+`mouseout`+`mouseleave` (no `mouseenter`+`mouseleave`) porque el primero permite event delegation. El flicker es aceptable.

### Lookup de fingerprint en el handler de hover

```js
function showTileHoverPreview(paletteId, tileEl) {
  let fingerprint;
  if (paletteId === 'ed-palette') {
    const gid = parseInt(tileEl.dataset.gid, 10);
    if (!gid) return;
    const t = edCfg.tilesets[activeTilesetIdx];
    if (!t) return;
    fingerprint = getTilesetFrameRect(t, gid);
  } else {
    const key = tileEl.dataset.key;
    const frame = parseInt(tileEl.dataset.frame, 10);
    if (!key || isNaN(frame)) return;
    const objDef = edCfg.objects.find(o => o.key === key);
    if (!objDef) return;
    fingerprint = getFrameRectInImage(objDef, frame);
  }
  // ... compute scale, apply style, position
}
```

Requiere agregar `data-frame` y `data-key` a los `.ed-tile` en `renderObjPalette` (los tilesets ya tienen `data-gid`). Cambio mínimo en el código de la paleta.

### Cleanup en `hideEditor()`

```js
function hideEditor() {
  // ... existing cleanup ...
  hideTileHoverPreview();
  // ... rest ...
}
```

Una línea. Garantiza que el preview no quede visible si el editor se cierra con el cursor sobre un tile.

## Risks / Trade-offs

- **[Riesgo] Cap de 128 puede ser insuficiente para algún asset futuro** → Mitigation: la constante `128` está centralizada en una sola función, fácil de ajustar. Si en el futuro aparece un frame > 32×32, el cap se sube.
- **[Riesgo] Spec drift en `reorder-editor-ui/specs/editor-tab-hierarchy/spec.md`** → La requirement "Preview visible solo bajo ASSETS" describe un bloque que ya no existe. Por decisión del usuario, no se actualiza en esta change. Queda como deuda técnica. Mitigation futura: cuando se archive `reorder-editor-ui` o se haga un sync, eliminar o reemplazar ese requirement.
- **[Trade-off] Flicker entre tiles adyacentes en la paleta** → `mouseout`+`mouseover` disparan en succession cuando el cursor cruza el borde entre dos tiles. Dura <16ms (un frame). Aceptable.
- **[Trade-off] No refactor de `renderLayerPicker`** → Quedan 10 líneas duplicadas de cálculo de thumbnail para objetos en `renderLayerPicker` (líneas 197-224). El design de `fix-layer-picker-full-stack` ya lo identificó como duplicación aceptable; aquí también. Refactor futuro cuando se justifique.
- **[Riesgo] `data-frame` y `data-key` colisionan con el `d.title` actual** → Mitigation: el `title` attribute es separado de los `data-*` attributes, no hay colisión. El `title` muestra el label legible humano; los `data-*` son identificadores internos.
- **[Trade-off] El helper no maneja el caso "tileset con frames irregulares"** → Cuando `add-tile-subframes` se implemente, los tilesets podrían tener `frames` array en vez de grid uniforme. El helper `getTilesetFrameRect` actual asume grid uniforme. Mitigation: `getTilesetFrameRect` se puede refactorizar para detectar `frames` y usar `getFrameRectInImage` por dentro, sin cambiar la API externa.
