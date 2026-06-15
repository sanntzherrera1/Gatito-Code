## ADDED Requirements

### Requirement: Drag-to-move shows a destination cell outline
While the user is dragging an existing element (tile or object) to a new map cell, the editor MUST mark the destination cell with a visible outline whose size matches the element's footprint (1×1 for tiles, multi-tile for objects) and whose color signals validity (green for a valid move, red for an invalid one).

#### Scenario: Dragging a tile to a valid empty cell
- **WHEN** the user drags a tile from its original cell to another empty cell inside the map
- **THEN** the editor MUST show a 1×1 outline at the destination cell in a "valid" color (green or yellow)

#### Scenario: Dragging an object with a multi-tile footprint
- **WHEN** the user drags an object whose footprint covers multiple tiles (e.g. a 2-tile-wide chest) to a new position
- **THEN** the editor MUST show a multi-tile outline at the destination whose size matches the object's footprint, in a "valid" color when the destination is free

#### Scenario: Dragging outside the map
- **WHEN** the user drags the cursor outside the map bounds
- **THEN** the editor MUST show the destination outline in an "invalid" color (red)

#### Scenario: Dragging onto a wall (objects only)
- **WHEN** the user drags an object onto a cell that contains a wall
- **THEN** the editor MUST show the destination outline in an "invalid" color (red)

#### Scenario: Dragging onto another object (objects only)
- **WHEN** the user drags an object onto a cell whose footprint overlaps another object
- **THEN** the editor MUST show the destination outline in an "invalid" color (red)

#### Scenario: Dragging back to the source cell
- **WHEN** the user drags an element back to its original cell (no actual move)
- **THEN** the editor MUST NOT show a destination outline at the source cell
