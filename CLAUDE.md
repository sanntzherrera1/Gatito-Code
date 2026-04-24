# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gatito-Code is a 2D tile-based puzzle game built with Phaser 3 that teaches programming concepts to Spanish-speaking learners. Players queue movement commands (up/down/left/right) and execute them to navigate a pixel-art character across a tile map to collect objects. All code comments, variable names, and documentation are in Spanish.

## Running the Project

There is no build step, no bundler, and no package.json. The project is pure ES Modules served statically.

```bash
# Option 1 (Node)
npx serve public

# Option 2 (Python)
python -m http.server 3000 --directory public
```

Open `http://localhost:3000`. HTTP is required (ES Modules won't load from `file://`).

## Architecture

```
public/
├── index.html              # DOM shell: UI panels, palette, dialogs
├── src/
│   ├── main.js             # Phaser.Game bootstrap, exports TILE/COLS/ROWS constants
│   ├── level/
│   │   └── TileLevel.js    # Domain logic: tileset registry, GID mapping, level loader
│   └── scenes/
│       ├── BootScene.js        # Asset preload + animation setup
│       ├── MenuScene.js        # Menu navigation
│       ├── TileLevelScene.js   # Base gameplay class: movement, collision, pickups
│       ├── GymScene.js         # Tutorial level (extends TileLevelScene, key='gym')
│       ├── MainScene.js        # Main level (extends TileLevelScene, key='main')
│       └── EditorScene.js      # Visual tile editor
├── levels/
│   ├── gym.json            # Gym level data (16×12 tiles)
│   └── main.json           # Main level data
└── assets/
    ├── SproutLands-Sprites/    # Character, tilesets (Grass, Fences, Dirt, Hills, Water)
    ├── SproutLands-UI/         # UI sprites, fonts, dialog boxes
    └── ui.json                 # Asset manifest (textures + animations)
```

**Phaser → DOM**: Global functions — `window.__setPanels()`, `window.__showDialog()`, `window.__setEditor()`

**DOM → Phaser**: Global bus at `window.__GYM` with `onRun(moves)` and `onRestart()` callbacks set by `TileLevelScene`

## Level Format

```json
{
  "version": 1,
  "cols": 16, "rows": 12, "tile": 16,
  "tilesets": ["grass", "fences", "dirt", "hills", "water"],
  "layers": {
    "floor": [/* GIDs, length = cols*rows */],
    "walls": [/* GIDs, non-zero = solid */]
  },
  "spawn": { "tx": 8, "ty": 6 },
  "objects": [
    { "tx": 2, "ty": 2, "key": "plants", "frame": 5, "type": "pickup" },
    { "tx": 5, "ty": 3, "key": "grass_props", "frame": 0, "type": "deco" }
  ]
}
```

Levels load from `localStorage` (key `level:${levelKey}`) first, then fall back to the preloaded JSON cache. The editor writes to `localStorage`.

## Tileset GID Registry — Do Not Change

GID ranges in `TileLevel.TILESETS` are **immutable**. Changing them invalidates all saved levels (both JSON files and any `localStorage` overrides):

| Tileset  | GID Range |
|----------|-----------|
| grass    | 1–99      |
| fences   | 100–199   |
| dirt     | 200–299   |
| hills    | 300–399   |
| water    | 400–499   |

## Core Constants (`main.js`)

```js
export const TILE = 16;   // pixels per tile
export const COLS = 16;   // map width in tiles
export const ROWS = 12;   // map height in tiles
```

Changing `COLS`/`ROWS` invalidates any `localStorage` level overrides (grid size mismatch triggers fallback to disk).

## Autotile Bitmask

Terrain tiles use a 4-neighbor cardinal bitmask: North=1, East=2, South=4, West=8 (values 0–15). `TileLevel.resolveTerrainGid(terrain, bitmask)` maps the mask to the correct sprite frame.

## Gameplay Loop

Each step executes at `STEP_MS = 160ms`. `TileLevelScene.runProgram(moves)` iterates the queued commands sequentially; each `step(dir)` checks the collision matrix, updates tile position, plays the directional walk animation, and handles pickups.

## Known Limitations

- No win condition when all pickups are collected
- `MainScene` hardcodes pickup logic in code instead of reading it fully from JSON — pickup definitions are split between `main.json` and `MainScene.js`
- DOM ↔ Phaser communication relies on global `window.*` coupling
- No automated tests or CI pipeline
