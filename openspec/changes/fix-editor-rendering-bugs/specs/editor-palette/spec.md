## ADDED Requirements

### Requirement: Editor tile ghosts use the Phaser texture key
The editor MUST render tile hover ghosts and drag ghosts using the tileset's Phaser texture key (`tileset.key`), not its Tiled-format name (`tileset.name`).

#### Scenario: Hover ghost after selecting a tile
- **WHEN** the user selects a tile from the tileset palette and moves the cursor over the map
- **THEN** the editor renders a semi-transparent preview sprite using the selected tile's texture without logging `Texture "__MISSING" has no frame "<n>"` in the console

#### Scenario: Drag ghost when moving a tile
- **WHEN** the user clicks and drags an existing tile on the map
- **THEN** the editor renders a drag-following sprite using that tile's texture without falling back to Phaser's `__MISSING` placeholder

### Requirement: Editor object selection stores OBJECTS key, frame index and type
The editor MUST populate `this.selection` with the OBJECTS texture key, the numeric frame index, and the object type string when the user picks a frame from the Objects palette.

#### Scenario: Clicking a frame in the Objects palette
- **WHEN** the user clicks a frame in the Objects palette
- **THEN** `this.selection.key` equals the selected OBJECTS key, `this.selection.frame` is a numeric frame index, and `this.selection.objType` is the object type string

#### Scenario: Placing the selected object on the map
- **WHEN** the user clicks an in-bounds map tile while a valid object selection is active
- **THEN** the editor places a sprite that displays the selected frame at the correct map position (no Phaser `__MISSING` black-with-diagonal placeholder)
