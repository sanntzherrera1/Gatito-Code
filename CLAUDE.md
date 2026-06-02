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
├── css/                    # Stylesheets for DOM UI
├── levels/                 # Static JSON level files (gym.json, main.json)
├── assets/                 # Sprites, tilesets, fonts, UI textures
│   ├── SproutLands-Sprites/    # Character, tilesets, objects, animals
│   ├── SproutLands-SorrySprites/ # Extended asset packs (dungeon, winter, village)
│   ├── SproutLands-UI/         # UI sprites, fonts, dialog boxes
│   └── ui.json                 # Asset manifest (textures + animations)
└── src/
    ├── main.js             # Phaser.Game bootstrap, re-exports TILE/COLS/ROWS
    ├── config/
    │   └── game.js         # Core constants: TILE, COLS, ROWS, STEP_MS, DIRS
    ├── domain/             # Pure JavaScript. Zero Phaser imports. Testable with Node.
    │   ├── Player.js       # Movement state, collision, facing
    │   ├── Level.js        # Grid geometry, solids, spawn, objects, weather
    │   └── Program.js      # Immutable command sequence
    ├── engine/             # Everything that touches Phaser
    │   ├── scenes/
    │   │   ├── BootScene.js    # Asset preload + global animation setup
    │   │   ├── MenuScene.js    # Menu navigation (levels, editor, credits)
    │   │   ├── EditorScene.js  # Visual tile editor with weather & object placement
    │   │   └── TileLevelScene.js # Base gameplay: orchestrates domain + views
    │   ├── levels/         # Content scenes extending TileLevelScene
    │   │   ├── GymScene.js     # Tutorial level (key='gym')
    │   │   ├── MainScene.js    # Main level (key='main')
    │   │   └── CustomScene.js  # Dynamic user-created levels
    │   ├── entities/       # Self-contained visual actors
    │   │   ├── PlayerView.js   # Sprite, tweens, walk/idle/jump animations
    │   │   └── PickupView.js   # Floating sprite + collection effect
    │   ├── level/
    │   │   ├── TileRegistry.js     # Tilesets, GIDs, objects, terrains, variant defs
    │   │   ├── TileLevelLoader.js  # JSON → Phaser Tilemap + domain/Level
    │   │   └── WeatherSystem.js    # Rain, snow, wind, storm, night overlay
    │   └── program/
    │       └── ProgramExecutor.js  # Async command interpreter
    ├── services/
    │   └── Storage.js      # localStorage: level overrides, custom levels registry
    └── ui/                 # DOM modules (unchanged from refactor)
        ├── index.js
        ├── queue.js
        ├── dialog.js
        ├── mission.js
        ├── editor-ui.js
        ├── name-dialog.js
        └── state.js
```

## Layered Architecture

The codebase is organized into four layers with strict import rules:

| Layer | Can import from | Cannot import from |
|---|---|---|
| **domain/** | `config/` | `engine/`, `services/`, `ui/` |
| **engine/** | `config/`, `domain/`, `services/` | `ui/` |
| **services/** | `config/`, `domain/`, `engine/level/` | `ui/` |
| **ui/** | `config/` (indirectly via globals) | `engine/`, `domain/`, `services/` |

**Data flow:**
```
UI (DOM) ──window.__GYM──► engine/scenes/TileLevelScene
                              │
                              ├──► domain/Player (state + collision)
                              ├──► engine/entities/PlayerView (rendering)
                              └──► services/Storage (persist)
```

**Phaser → DOM**: Global functions — `window.__setPanels()`, `window.__showDialog()`, `window.__setEditor()`, `window.__setMission()`

**DOM → Phaser**: Global bus at `window.__GYM` with `onRun(moves)` and `onRestart()` callbacks set by `TileLevelScene`

## Core Constants (`config/game.js`)

```js
export const TILE = 16;       // pixels per tile
export const COLS = 16;       // map width in tiles
export const ROWS = 12;       // map height in tiles
export const STEP_MS = 160;   // duration of one step/jump tween
export const DIRS = {         // cardinal direction vectors
    up:    { dx: 0, dy: -1 },
    down:  { dx: 0, dy: 1 },
    left:  { dx: -1, dy: 0 },
    right: { dx: 1, dy: 0 },
};
```

`main.js` imports these from `config/game.js` and re-exports them for backward compatibility. All new code should import directly from `config/game.js`.

Changing `COLS`/`ROWS` invalidates any `localStorage` level overrides (grid size mismatch triggers fallback to disk).

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
  ],
  "weather": { "rain": 0, "snow": 0, "pollen": 0, "leaves": 0, "night": 0, "fog": 0, "dust": 0, "wind": 0, "storm": 0 }
}
```

Levels load from `localStorage` (key `level:${levelKey}`) first, then fall back to the preloaded JSON cache. The editor writes to `localStorage`.

## Tileset GID Registry — Do Not Change

GID ranges in `TileRegistry.TILESETS` are **immutable**. Changing them invalidates all saved levels (both JSON files and any `localStorage` overrides).

The registry contains **55 tilesets** across **8 categories**:

| Category | Count | Example tilesets |
|---|---|---|
| grass | 15 | Classic, v2, Hills, Layers, Dark variants, Bush, Ground Slopes |
| soil | 10 | Dirt, Tilled, Wide, Stone, Dark variants |
| water | 1 | Classic (4-frame animation) |
| fences | 2 | Classic, v2 |
| buildings | 5 | Doors, Wooden House, Roof, Walls, Stone Path |
| dungeon | 11 | Walls, Decor, Ground (orange, dark, darker), Items, Carts, Rails, Rocks, Switch |
| winter | 3 | Ice, Snow 1, Snow 2 |
| more | 8 | Layers 1-4, Blue Layers 1-4 |

> Note: GIDs 2600–3003 are reserved/free (5 water tilesets removed). Do not reuse this range.

## Assets

`BootScene.js` dynamically preloads all assets registered in `TileRegistry.js`:

- **Objects**: ~221 spritesheets across 7 categories: `objects`, `nature`, `structures`, `animals`, `characters`, `items`, `shadow`
- **Variant system**: Objects with `group` + `variant` fields (e.g. `furniture` with versions `basic`, `new`, `new_2`) are filtered by the editor's variant picker (`VARIANT_DEFS`)
- **Extended packs**: Includes `SproutLands-SorrySprites` (dungeon, ocean, plant update 2, winter, village packs)

## Autotile Bitmask

Terrain tiles use a 4-neighbor cardinal bitmask: North=1, East=2, South=4, West=8 (values 0–15). `TileRegistry.resolveTerrainGid(terrain, bitmask)` maps the mask to the correct sprite frame.

## Gameplay Loop

Each step executes at `STEP_MS = 160ms`. The loop is now delegated across layers:

1. `TileLevelScene.runProgram(moves)` builds a `context` with callbacks.
2. `ProgramExecutor.executeProgram()` iterates commands.
3. `step(dir)` queries `playerModel.tryMove(dir)` (**domain** — state + collision).
4. On success, `playerView.moveTo(tx, ty)` executes the visual tween (**engine/entities**).
5. On arrival, `checkPickup(tx, ty)` finds the `PickupView` and calls `.collect()` (**engine/entities**).
6. `jumpDir(dir)` follows the same flow via `playerModel.tryJump()` → `playerView.jumpTo()`.

The scene no longer handles sprite creation, tween logic, or animation frames directly. It **orchestrates** the domain model and visual entities.

## Weather System

Location: `engine/level/WeatherSystem.js`

Supports **9 simultaneous effects** (intensity 0.0–1.0):

| Effect | Type |
|---|---|
| `rain` | Particle drops |
| `snow` | Particle flakes with rotation |
| `pollen` | Floating ascending particles |
| `leaves` | Falling particles with rotation |
| `night` | Dark semi-transparent overlay |
| `fog` | Diffuse particle haze |
| `dust` | Dust particles with rotation |
| `wind` | Multi-layer sprite pools (haze + far/near streaks with wobble) |
| `storm` | Periodic lightning with zigzag, branches, glow, and fade |

## Known Limitations

- No win condition when all pickups are collected
- Pickups and objects are fully loaded from the level JSON; `MainScene` no longer hardcodes entities in `decorate()`
- DOM ↔ Phaser communication relies on global `window.*` coupling
- `domain/` is pure JavaScript and testable with Node; unit tests with Vitest exist in `tests/domain.test.js`, but no CI pipeline is configured yet
- `CustomScene` uses dynamic `levelKey` but shares the same mechanic as `MainScene`/`GymScene`
