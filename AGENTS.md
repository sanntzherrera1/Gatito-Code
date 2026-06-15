# AGENTS.md — Gatito-Code

Compact reference for agents working in this repo. For deeper architecture, see `CLAUDE.md`.

## Dev commands

- `npm start` — Serves `public/` (not root) via browser-sync. Opens `http://localhost:3000`. `file://` does **not** work because ES Modules require HTTP.
- `npm test` — Runs Vitest on `tests/domain.test.js`. No config file; defaults apply.
- No bundler, no build step. Phaser 3 is loaded from CDN. Pure ES Modules in the browser.

## Architecture (strict import layers)

| Layer | What it is | Can import from |
|---|---|---|
| `domain/` | Pure JS. Zero Phaser. Testable in Node. | `config/` only |
| `engine/` | Phaser scenes, entities, rendering, tweens | `config/`, `domain/`, `services/` |
| `services/` | localStorage persistence, level registry | `config/`, `domain/`, `engine/level/` |
| `ui/` | DOM/HTML overlays. No Phaser imports. | `config/` (indirectly via globals) |

**UI ↔ Phaser coupling:** `window.__GYM` (DOM → Phaser), `window.__setPanels`, `window.__showDialog`, `window.__setEditor`, `window.__setMission` (Phaser → DOM). The editor also uses `window.__setEditor_updateSummary`, `__setEditor_showToast`, `__setEditor_showLayerPicker`, `__setEditor_hideLayerPicker`, `__setEditor_markDirty`, `__setEditor_updateSelected`, `__setEditor_updateObjectSelected`. Expect globals when debugging or adding features.

## Hard-to-guess code facts

- `config/game.js` source of truth: `TILE = 16`, `COLS = 16`, `ROWS = 12`, `STEP_MS = 240`. Changing `COLS`/`ROWS` invalidates all `localStorage` saved levels (grid mismatch triggers fallback to disk JSON).
- `main.js` registers more scenes than documented in README/CLAUDE: `BootScene`, `MenuScene`, `GymScene`, `MainScene`, `EditorScene`, `CustomScene`, `Nivel0Scene`, `Nivel3Scene`, `PruebaScene`, `DungeonScene`, `BosqueDePruebaScene`, `BosqueFloralScene`. Treat `main.js` as the canonical scene list.
- **TileRegistry GIDs are immutable.** Changing `TILESETS` ranges breaks every saved level (JSON + localStorage). GIDs 2600–3003 are reserved/free; do not reuse.
- Levels load from `localStorage` (key `level:${levelKey}`) first, then fall back to preloaded JSON in `public/levels/`. The editor writes to `localStorage`.
- `BootScene.js` dynamically preloads every asset registered in `TileRegistry.js`. Adding a new object requires registering it in `TileRegistry.js` `OBJECTS` (and `VARIANT_DEFS` if applicable); no manual preload changes needed.

## Testing

- Only `domain/` has unit tests (`tests/domain.test.js`). `engine/` and `ui/` are not unit-tested.
- No CI pipeline is configured.

## Language

- All code comments, variable names, and UI copy are in **Spanish**. Keep new code and comments in Spanish.

## Related instruction files

- `CLAUDE.md` — detailed architecture, layer rules, gameplay loop, weather system, asset registry.
- `README.md` — editor hotkeys, level JSON format, autotile bitmask, how to add objects.
- `docs/documentacion-tecnica.md` — legacy technical docs.
