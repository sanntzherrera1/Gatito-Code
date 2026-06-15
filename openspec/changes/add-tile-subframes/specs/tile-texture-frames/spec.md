## ADDED Requirements

### Requirement: Tileset textures expose one named frame per cell
The system MUST register a named sub-frame on every tileset texture for each cell in the tileset grid, so that `scene.add.sprite(tilesetKey, localIndex)` displays that single tile instead of the entire image.

#### Scenario: Selecting a specific GID from the editor palette
- **WHEN** a consumer renders a sprite with `scene.add.sprite(tilesetKey, localIndex)` where `localIndex` is in the range `[0, cols*rows)`
- **THEN** the sprite MUST display the corresponding 16x16 sub-region of the tileset image (not the whole image and not Phaser's `__MISSING` placeholder)

#### Scenario: Skipping a missing tileset texture
- **WHEN** a tileset texture is not present in Phaser's texture manager (load failed or was skipped)
- **THEN** the system MUST skip that tileset without throwing, and other tilesets MUST still be processed
