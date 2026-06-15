## ADDED Requirements

### Requirement: Editor panel uses Tileset and Objects tabs
The editor panel SHALL provide two tabs, labeled "Tileset" and "Objects", that switch the visible palette and its associated controls.

#### Scenario: Default tab on editor open
- **WHEN** the editor scene starts
- **THEN** the "Tileset" tab is active by default

#### Scenario: Switching tabs by click
- **WHEN** the user clicks the "Objects" tab
- **THEN** the object palette, object categories and object variant switches become visible
- **AND** the tileset palette and tileset categories are hidden

#### Scenario: Returning to Tileset tab
- **WHEN** the user clicks the "Tileset" tab after being on "Objects"
- **THEN** the tileset palette and tileset categories become visible
- **AND** the object palette, object categories and variant switches are hidden

### Requirement: Selected item preview is always visible
The editor panel SHALL contain a preview area below the active tab content that displays the currently selected tile or object/frame.

#### Scenario: Preview updates on tile selection
- **WHEN** the user selects a tile in the tileset palette
- **THEN** the preview area shows the selected tile image
- **AND** displays the tileset name, tile GID and tile coordinates

#### Scenario: Preview updates on object selection
- **WHEN** the user selects an object/frame in the object palette
- **THEN** the preview area shows the selected object frame image
- **AND** displays the object label, object key, frame index, dimensions and placement type

#### Scenario: Empty preview state
- **WHEN** no tile or object is selected
- **THEN** the preview area shows a placeholder message indicating that an item must be selected

### Requirement: Panel layout keeps shared controls accessible
The editor panel SHALL keep layer selector, spawn, intro, weather and action controls available regardless of the active tab.

#### Scenario: Shared controls remain visible on tab switch
- **WHEN** the user switches between "Tileset" and "Objects" tabs
- **THEN** the layer selector, spawn button, intro button, weather controls and action buttons remain visible

### Requirement: Editor panel is responsive
The editor panel width SHALL adapt to the available viewport while never causing the game canvas to shrink below its intrinsic size.

#### Scenario: Small viewport
- **WHEN** the viewport width is less than or equal to 900px
- **THEN** the editor panel width is at least 320px
- **AND** the game canvas keeps its original 256×192 pixel size

#### Scenario: Large viewport
- **WHEN** the viewport width is greater than or equal to 1400px
- **THEN** the editor panel may expand up to 520px
- **AND** the preview area scales accordingly
