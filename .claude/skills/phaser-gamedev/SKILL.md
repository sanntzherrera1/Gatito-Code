# Phaser Game Development

Build 2D browser games using Phaser 3's scene-based architecture and physics systems.

Source: https://github.com/chongdashu/phaserjs-oakwoods/tree/main/.claude/skills/phaser-gamedev

Key rules applied in this repo:
- Measure spritesheets before loading; never guess frame dimensions.
- Boot scene loads assets + creates animations; gameplay scenes assume they exist.
- Arcade physics for 2D AABB; Matter only if you need realistic contact.
- Frame-rate independent movement: `x += speed * (delta / 1000)`.
- Pixel art: `pixelArt: true`, integer camera, no smoothing.
- Scene list: Boot → Gym. UI can be a parallel scene if needed.
