## ADDED Requirements

### Requirement: Layer picker is purely informational
The floating layer picker MUST NOT register click or pointer handlers on its items. Its only purpose is to display information about the elements at the hovered cell.

#### Scenario: No click handlers on items
- **WHEN** the picker renders an item row
- **THEN** the row MUST NOT have any `onclick` handler (i.e., clicking the row does not select, copy, or move the element)

### Requirement: Layer picker positions itself to the left of the hovered cell
The floating layer picker MUST position itself adjacent to the cell the user is hovering over, preferring the left side. It MUST use the canvas's actual rendered scale to convert game coordinates to viewport coordinates.

#### Scenario: Hovering a cell away from the canvas edges
- **WHEN** the user hovers over a cell that is at least the picker's width away from the viewport's left edge
- **THEN** the picker MUST appear just to the left of that cell (small gap, ~8px)

#### Scenario: Cell near the left edge of the canvas
- **WHEN** the user hovers over a cell where there is not enough room on the left for the picker
- **THEN** the picker MUST fall back to appearing to the right of the cell

#### Scenario: Rendering respects the canvas zoom scale
- **WHEN** the canvas is rendered at a non-1:1 scale (e.g. Phaser `zoom=4`)
- **THEN** the picker position MUST be computed from the canvas's `getBoundingClientRect()` ratio (viewport size / internal canvas size), not from raw game coordinates

### Requirement: Each layer picker item shows a layer badge
Each row in the layer picker MUST show a text badge with one of the 5 valid layer names (FLOOR, WALLS, PATH, OVERLAY, TOP), in addition to its identifying label.

#### Scenario: Tile item in the picker
- **WHEN** the picker lists a tile element
- **THEN** the row MUST show a badge with the tile's layer name in uppercase (e.g. "WALLS", "FLOOR", "PATH", "OVERLAY", "TOP") followed by the tileset name and the GID

#### Scenario: Object item in the picker
- **WHEN** the picker lists an object element
- **THEN** the row MUST show a badge with the text "TOP" (since objects are rendered on top of the top layer, that is their effective layer for the picker) followed by the object's key and the frame index
