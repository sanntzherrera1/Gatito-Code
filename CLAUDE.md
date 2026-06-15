# CLAUDE.md

Guía de arquitectura para agentes de IA trabajando en Gatito-Code. Para referencia rápida de comandos y hechos clave, ver `AGENTS.md`.

## Proyecto

Juego educativo 2D tile-based con Phaser 3. El jugador programa secuencias de comandos (arriba/abajo/izquierda/derecha/saltar) para recolectar objetos en un mapa pixel-art. Todo el código, comentarios y documentación están en **español**.

## Ejecución

```bash
npm start      # browser-sync serve public/ → http://localhost:3000
npm test       # vitest tests/domain.test.js
```

> No hay bundler ni build step. Phaser 3 se carga desde CDN. Los ES Modules requieren HTTP; `file://` no funciona.

## Estructura de directorios

```
public/
├── index.html              # UI DOM: paneles, slots, diálogos
├── css/                    # Estilos de la UI superpuesta
├── levels/                 # JSON estáticos (gym.json, main.json, etc.)
├── assets/
│   ├── SproutLands-Sprites/      # Tilesets, personajes, objetos
│   ├── SproutLands-SorrySprites/ # Packs extendidos (dungeon, invierno, aldea)
│   ├── SproutLands-UI/           # Fuentes, botones, menús, dialogs
│   └── ui.json                   # Manifest de texturas/animaciones UI
└── src/
    ├── main.js             # Bootstrap Phaser.Game + registro de escenas
    ├── config/game.js      # Constantes: TILE, COLS, ROWS, STEP_MS, DIRS
    ├── domain/             # JS puro. Sin Phaser. Testable con Node.
    │   ├── Player.js       # Estado, colisión, movimiento, facing
    │   ├── Level.js        # Grilla, sólidos, spawn, objetos, clima
    │   └── Program.js      # Secuencia inmutable de comandos
    ├── engine/             # Todo lo que toca Phaser
    │   ├── scenes/
    │   │   ├── BootScene.js       # Preload dinámico de assets + anims globales
    │   │   ├── MenuScene.js       # Menú principal
    │   │   ├── EditorScene.js     # Editor visual de niveles
    │   │   └── TileLevelScene.js  # Clase base de niveles jugables
    │   ├── levels/          # Escenas concretas que extienden TileLevelScene
    │   │   ├── GymScene.js
    │   │   ├── MainScene.js
    │   │   ├── CustomScene.js
    │   │   ├── Nivel0Scene.js
    │   │   ├── Nivel3Scene.js
    │   │   ├── PruebaScene.js
    │   │   ├── DungeonScene.js
    │   │   ├── BosqueDePruebaScene.js
    │   │   └── BosqueFloralScene.js
    │   ├── entities/
    │   │   ├── PlayerView.js      # Sprite, tweens, walk/idle/jump
    │   │   ├── PickupView.js      # Sprite flotante + efecto de recolección
    │   │   └── WorldObjectView.js # Sprite visual para objetos del mapa
    │   ├── level/
    │   │   ├── TileRegistry.js      # 55 tilesets, ~221 objetos, GIDs, variantes
    │   │   ├── ObjectAnimations.js  # Definición de animaciones de objetos
    │   │   ├── TileLevelLoader.js   # JSON → Phaser Tilemap + domain/Level
    │   │   └── WeatherSystem.js     # Lluvia, nieve, viento, tormenta, noche, etc.
    │   └── program/
    │       └── ProgramExecutor.js   # Intérprete asíncrono de comandos
    ├── game/
    │   └── PickupManager.js     # Orquestación de pickups en runtime
    ├── services/
    │   └── Storage.js             # localStorage: overrides, niveles personalizados
    └── ui/                      # DOM: paleta, diálogos, cola de comandos
        ├── index.js
        ├── queue.js
        ├── dialog.js
        ├── mission.js
        ├── editor-ui.js
        ├── jump-picker.js
        ├── name-dialog.js
        └── state.js
```

## Reglas de importación (estrictas)

| Capa | Puede importar de | No puede importar de |
|---|---|---|
| `domain/` | `config/` | `engine/`, `services/`, `ui/` |
| `engine/` | `config/`, `domain/`, `services/` | `ui/` |
| `services/` | `config/`, `domain/`, `engine/level/` | `ui/` |
| `ui/` | `config/` (indirecto via globals) | `engine/`, `domain/`, `services/` |

## Comunicación UI ↔ Phaser

- **DOM → Phaser**: `window.__GYM` (bus global con `onRun(moves)` y `onRestart()`).
- **Phaser → DOM**: `window.__setPanels()`, `window.__showDialog()`, `window.__setEditor()`, `window.__setMission()`.

## Constantes (`config/game.js`)

```js
export const TILE = 16;      // píxeles por tile
export const COLS = 16;      // ancho del mapa en tiles
export const ROWS = 12;      // alto del mapa en tiles
export const STEP_MS = 240;  // duración de un paso/salto
export const DIRS = {        // vectores cardinales
    up:    { dx: 0, dy: -1 },
    down:  { dx: 0, dy: 1 },
    left:  { dx: -1, dy: 0 },
    right: { dx: 1, dy: 0 },
};
```

`main.js` re-exporta estas constantes por compatibilidad hacia atrás. Todo código nuevo debe importar directamente de `config/game.js`.

> Cambiar `COLS`/`ROWS` invalida los niveles guardados en `localStorage` (mismatch de grilla dispara fallback al JSON del disco).

## Formato de nivel (JSON)

```json
{
  "version": 1,
  "cols": 16, "rows": 12, "tile": 16,
  "tilesets": ["grass", "fences", "dirt", "hills", "water"],
  "layers": {
    "floor": [ /* GIDs, length = cols*rows */ ],
    "walls": [ /* GID != 0 = tile sólido con colisión */ ]
  },
  "spawn": { "tx": 8, "ty": 6 },
  "objects": [
    { "tx": 2, "ty": 2, "key": "plants", "frame": 5, "type": "pickup" },
    { "tx": 5, "ty": 3, "key": "grass_props", "frame": 0, "type": "deco" }
  ],
  "weather": { "rain": 0, "snow": 0, "pollen": 0, "leaves": 0, "night": 0, "fog": 0, "dust": 0, "wind": 0, "storm": 0 }
}
```

- `type: "pickup"` — recolectable, sprite flotante.
- `type: "deco"` — decorativo estático.
- `weather` — intensidad de 0.0 a 1.0 por efecto.

Los niveles cargan desde `localStorage` (clave `level:${levelKey}`) primero; si falla, fallback al JSON precargado en `public/levels/`. El editor persiste en `localStorage`.

## Registro de GIDs — Inmutables

Los rangos de GIDs en `TileRegistry.TILESETS` **no deben cambiarse**. Cambiarlos rompe todos los niveles guardados (JSON y `localStorage`).

- **55 tilesets** en 8 categorías (grass, soil, water, fences, buildings, dungeon, winter, more).
- GIDs 2600–3003 están reservados/libres (5 tilesets de agua eliminados). No reutilizar.

## Assets

`BootScene.js` precarga **dinámicamente** todo lo registrado en `TileRegistry.js`:

- **~221 spritesheets** en 7 categorías: `objects`, `nature`, `structures`, `animals`, `characters`, `items`, `shadow`.
- **Variantes**: Objetos con campos `group` + `variant` se filtran por el picker de variantes del editor (`VARIANT_DEFS`).
- **Packs extendidos**: `SproutLands-SorrySprites` (dungeon, océano, plant update 2, invierno, aldea).

## Autotile

Terrenos usan bitmask de 4 vecinos cardinales: North=1, East=2, South=4, West=8 (valores 0–15). `TileRegistry.resolveTerrainGid(terrain, bitmask)` mapea la máscara al frame correcto.

## Gameplay Loop

Cada paso se ejecuta a `STEP_MS = 240ms`:

1. `TileLevelScene.runProgram(moves)` construye un `context` con callbacks.
2. `ProgramExecutor.executeProgram()` itera los comandos.
3. `step(dir)` consulta `playerModel.tryMove(dir)` (**domain** — estado + colisión).
4. Si tiene éxito, `playerView.moveTo(tx, ty)` ejecuta el tween visual (**engine/entities**).
5. Al llegar, `checkPickup(tx, ty)` encuentra el `PickupView` y llama `.collect()` (**engine/entities**).
6. `jumpDir(dir)` sigue el mismo flujo vía `playerModel.tryJump()` → `playerView.jumpTo()`.

La escena **orquesta** el modelo de dominio y las entidades visuales; no maneja directamente sprites, tweens o frames de animación.

## Sistema de clima

Ubicación: `engine/level/WeatherSystem.js`

Soporta **9 efectos simultáneos** con intensidad `0.0 – 1.0`:

| Efecto | Tipo |
|---|---|
| `rain` | Gotas de partículas |
| `snow` | Copos con rotación |
| `pollen` | Partículas flotantes ascendentes |
| `leaves` | Partículas cayendo con rotación |
| `night` | Overlay semitransparente oscuro |
| `fog` | Niebla difusa |
| `dust` | Partículas polvorientas con rotación |
| `wind` | Sistema multicapa: bruma + streaks lejanos/cercanos con wobble |
| `storm` | Relámpagos periódicos con zigzag, ramas, glow y fade |

## Limitaciones conocidas

- No hay condición de victoria cuando se recolectan todos los pickups.
- Pickups y objetos se cargan completamente desde el JSON del nivel; `MainScene` ya no hardcodea entidades en `decorate()`.
- La comunicación DOM ↔ Phaser depende de variables globales (`window.*`).
- `domain/` es JavaScript puro y testable con Node; existen tests unitarios con Vitest en `tests/domain.test.js`, pero no hay pipeline de CI configurada.
- `CustomScene` usa `levelKey` dinámico pero comparte la misma mecánica que `MainScene`/`GymScene`.

## Cómo agregar un nuevo objeto

1. Colocar la imagen en `public/assets/SproutLands-Sprites/Objects/` (o la carpeta correspondiente).
2. Registrarlo en `engine/level/TileRegistry.js` dentro del array `OBJECTS`:
   ```js
   { key: 'mi_objeto', label: 'Mi Objeto', url: 'assets/.../mi_objeto.png', cols: 4, rows: 2, frameW: 16, frameH: 16, category: 'objects' }
   ```
3. Si tiene variantes, definirlas en `VARIANT_DEFS` (mismo archivo).
4. Recargar — `BootScene.js` precarga automáticamente todo `OBJECTS`.

## Referencias

- `AGENTS.md` — referencia compacta para sesiones rápidas.
- `README.md` — hotkeys del editor, formato JSON detallado, guía de uso.
- `docs/documentacion-tecnica.md` — documentación técnica legacy.
