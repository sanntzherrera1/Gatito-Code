## ADDED Requirements

### Requirement: Layer picker shows the full stack of elements at a cell
When the user hovers over a map cell in the editor (with no active selection), the floating layer picker MUST list every element present at that cell — tiles in any layer (`floor`, `path`, `walls`, `overlay`, `top`) and any object whose footprint covers the cell.

#### Scenario: Hover over a cell with a single tile
- **WHEN** the user hovers over a cell that contains exactly one tile in the `floor` layer and no other elements
- **THEN** the layer picker MUST appear and list that one tile

#### Scenario: Hover over a cell with multiple stacked tiles
- **WHEN** the user hovers over a cell with tiles in several layers
- **THEN** the layer picker MUST list all of them, with `top` listed first and `floor` listed last

#### Scenario: Hover over a cell that contains an object
- **WHEN** the user hovers over a cell that has an object (e.g. a tree, a chest, a sign) placed on it
- **THEN** the layer picker MUST list the object alongside any tiles, with the object appearing first (visually on top)

#### Scenario: Hover over a cell covered by a multi-tile object's footprint
- **WHEN** the user hovers over any cell inside the footprint of a multi-tile object (e.g. a 2-tile-wide chest)
- **THEN** the layer picker MUST list that object for each cell of its footprint

#### Scenario: Hover over an empty cell
- **WHEN** the user hovers over a cell with no tile and no object
- **THEN** the layer picker MUST NOT appear

### Requirement: Layer picker items are clickable to select their element
Each item in the layer picker MUST be clickable, and the resulting action MUST match the element's type: a tile item selects that tile for copy/paste; an object item selects that object for copy/paste.

#### Scenario: Clicking a tile item
- **WHEN** the user clicks a tile item in the layer picker
- **THEN** the editor MUST select that tile's GID in its layer, ready to paste on the next map click

#### Scenario: Clicking an object item
- **WHEN** the user clicks an object item in the layer picker
- **THEN** the editor MUST select that object's key/frame/type, ready to paste on the next map click
