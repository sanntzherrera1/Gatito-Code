## 1. HTML structure

- [x] 1.1 Reorder `#editor-panel` so the vertical sections are: header, layer selector, tabs container, tab content container, preview container, spawn/intro, weather, actions, footer.
- [x] 1.2 Add `#ed-tabs-bar` with two buttons: "Tileset" and "Objects".
- [x] 1.3 Wrap tileset-specific elements (categories, tabs, palette, autotile) inside `#ed-tileset-panel`.
- [x] 1.4 Wrap object-specific elements (categories, tabs, variant switches, palette, object type) inside `#ed-objects-panel`.
- [x] 1.5 Add `#ed-preview` container with an image cell (`#ed-preview-image`) and a details block (`#ed-preview-info`).

## 2. CSS styling

- [x] 2.1 Make `#editor-panel` responsive: replace fixed `width: 420px` with `width: clamp(320px, 28vw, 520px)` and keep `overflow-y: auto`.
- [x] 2.2 Style `#ed-tabs-bar` as a segmented tab row with active/hover states.
- [x] 2.3 Ensure `#ed-tileset-panel` and `#ed-objects-panel` can be shown/hidden cleanly without breaking layout.
- [x] 2.4 Style `#ed-preview` with a fixed but responsive size (80×80px base, 112×112px on large screens), centered image and readable metadata.
- [x] 2.5 Ensure the canvas stays centered and does not shrink by keeping `flex-shrink: 0` on the game canvas.

## 3. JavaScript UI logic

- [x] 3.1 Add `activeEditorTab` state to `editor-ui.js` with default value `'tileset'`.
- [x] 3.2 Render tab buttons and toggle visibility of `#ed-tileset-panel` and `#ed-objects-panel` on click.
- [x] 3.3 Initialize the preview area with a placeholder when the editor opens.
- [x] 3.4 Update preview when a tile is selected: show tile image, tileset name, GID and row/col.
- [x] 3.5 Update preview when an object/frame is selected: show object image, label, key, frame index, dimensions and placement type.
- [x] 3.6 Keep shared controls (layer selector, spawn, intro, weather, actions) visible regardless of active tab.

## 4. Scene synchronization

- [x] 4.1 Verify `EditorScene` still calls `__setEditor_updateSelected` and `__setEditor_updateTerrain` so the preview syncs correctly.
- [x] 4.2 If needed, expose selected object data through existing callbacks so `editor-ui.js` can render the preview without duplicating state.

## 5. Verification

- [x] 5.1 Run `npm start` and open the editor on an existing level.
- [x] 5.2 Confirm the "Tileset" tab is active by default and the tileset palette renders.
- [x] 5.3 Switch to "Objects" and confirm the object palette renders.
- [x] 5.4 Select a tile and verify the preview shows the correct image and metadata.
- [x] 5.5 Select an object/frame and verify the preview shows the correct image and metadata.
- [x] 5.6 Resize the browser to small (≤900px) and large (≥1400px) widths and verify the panel and canvas layout.
- [x] 5.7 Verify save, play-test, undo/redo, layer switching and weather controls still work.
