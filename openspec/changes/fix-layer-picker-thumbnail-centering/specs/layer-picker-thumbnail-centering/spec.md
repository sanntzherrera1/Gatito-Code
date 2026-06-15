## ADDED Requirements

### Requirement: Layer picker thumbnails center frames of any aspect ratio
When the layer picker renders a thumbnail for an object with a non-square frame (e.g. 16×32, 32×32, 48×48), the frame MUST appear centered within the 20×20 thumbnail container, not aligned to the top-left corner.

#### Scenario: Furniture frame with 16×32 dimensions
- **WHEN** the picker renders a `furniture` frame that is 16×32 pixels in the source image (e.g. frames 6, 7, 8, 17, 18, 19)
- **THEN** the visible frame in the thumbnail MUST be vertically centered, with equal empty space above and below the frame within the 20×20 container

#### Scenario: Tree frame with 32×32 dimensions
- **WHEN** the picker renders a `trees` frame that is 32×32 pixels in the source image
- **THEN** the frame MUST be scaled to fit within 20×20 and centered both horizontally and vertically

#### Scenario: Mushroom frame with 64×48 dimensions
- **WHEN** the picker renders a `mushrooms` frame that is 64×48 pixels in the source image (e.g. frame 7)
- **THEN** the frame MUST be scaled to fit within 20×20, centered horizontally, with the frame vertically centered (equal space above and below)

#### Scenario: Square frame (regression check)
- **WHEN** the picker renders a frame that is 16×16 pixels in the source image
- **THEN** the frame MUST fill the 20×20 container and remain centered (no visible change from before the fix)
