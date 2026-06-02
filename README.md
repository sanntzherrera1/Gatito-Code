# Gatito-codev2

Juego educativo de programación con estética pixel-art. El jugador controla un personaje en un mapa de tiles, ejecutando secuencias de comandos (arriba, abajo, izquierda, derecha, saltar) para recolectar objetos. Introduce a los jugadores a los algoritmos de forma didáctica.

Incluye un **editor visual de niveles** con soporte para clima, objetos con variantes y múltiples tilesets.

## Demo

<!-- Reemplazá la ruta por tu GIF una vez que lo grabes -->
![Demo del juego](public/assets/demo.gif)

## Documentación

- Técnica: [AGENTS.md](AGENTS.md) / [CLAUDE.md](CLAUDE.md) — guía de arquitectura para agentes de IA
- Técnica (legacy): [docs/documentacion-tecnica.md](docs/documentacion-tecnica.md)

## Presentaciones

Con el servidor levantado en `http://localhost:3000`, estas son las rutas disponibles:

- Juego principal: `http://localhost:3000/`
- Presentación de gestión: `http://localhost:3000/presentacion-gestion/`
- Presentación proyecto integrador: `http://localhost:3000/proyecto-integrador/`

### Resumen de enfoque y contenido

- `presentacion-gestion/`:
  Enfoque en gestión de proyecto (equipo, Scrum, alcance, sprints, ceremonias, retrospectiva, lecciones, acta de cierre, evolución de arquitectura y validación por tests).

- `proyecto-integrador/`:
  Enfoque en propuesta/producto (problema, solución pedagógica, público objetivo, características, arquitectura técnica, estado actual, roadmap, estrategia de lanzamiento y cierre).

## Stack

- [Phaser 3.80.1](https://phaser.io/) — cargado desde CDN, sin bundler
- ES Modules nativos del browser
- Sin dependencias de producción de npm
- DevDependencies: `browser-sync` (servidor local) y `vitest` (tests)
- Assets: [Sprout Lands](https://cup-nooble.itch.io/sprout-lands) + [SorrySprites](https://itch.io/) (sprites, tilesets, UI, objetos, animales, personajes)
- Personajes: Basic Char (48×48) y Premium Char (48×48) incluidos

## Levantar el proyecto

### Requisitos

- Node.js instalado (solo para el servidor estático)

### Pasos

```bash
# 1. Clonar o descargar el repositorio
git clone 'https://github.com/sanntzherrera1/GatitoCode.git'
cd gatito-codev2

# 2. Instalar dependencias de desarrollo (browser-sync + vitest)
npm install

# 3. Levantar el servidor con livereload
npm start
# Equivalente a: browser-sync start --server public --files "**/*"

# 4. Abrir en el browser
# http://localhost:3000 (se abre automáticamente)
```

> **¿Por qué un servidor?** Los ES Modules y la carga de assets requieren HTTP. Abrir `index.html` directo con `file://` no funciona.

### Alternativas (sin instalar dependencias)

```bash
# Con npx (sin instalar nada previamente)
npx serve public

# Con Python (sin Node)
cd public
python -m http.server 3000
# http://localhost:3000
```

## Estructura del proyecto

```
gatito-codev2/
├── public/
│   ├── index.html              # Entrada principal, UI DOM (paneles, slots, dialogs)
│   ├── presentacion-gestion/    # Deck de presentación orientado a gestión del proyecto
│   ├── proyecto-integrador/     # Deck de presentación orientado a propuesta/producto
│   ├── src/
│   │   ├── main.js             # Configuración Phaser + registro de escenas
│   │   ├── config/
│   │   │   └── game.js         # Constantes: TILE, COLS, ROWS, STEP_MS, DIRS
│   │   ├── domain/             # JavaScript puro. Sin Phaser. Testable con Node.
│   │   │   ├── Player.js       # Estado, colisión, movimiento, facing
│   │   │   ├── Level.js        # Grilla, sólidos, spawn, objetos, clima
│   │   │   └── Program.js      # Secuencia inmutable de comandos
│   │   ├── engine/             # Todo lo que toca Phaser
│   │   │   ├── scenes/
│   │   │   │   ├── BootScene.js    # Preload de assets + animaciones globales
│   │   │   │   ├── MenuScene.js    # Menú principal
│   │   │   │   ├── EditorScene.js  # Editor visual de niveles
│   │   │   │   └── TileLevelScene.js # Clase base de niveles jugables
│   │   │   ├── levels/
│   │   │   │   ├── GymScene.js     # Nivel 1 (gym) — tutorial
│   │   │   │   ├── MainScene.js    # Nivel 2 (main)
│   │   │   │   └── CustomScene.js  # Niveles personalizados
│   │   │   ├── entities/
│   │   │   │   ├── PlayerView.js   # Sprite, tweens, anims walk/idle/jump
│   │   │   │   ├── PickupView.js   # Sprite flotante + efecto de recolección
│   │   │   │   └── WorldObjectView.js # Sprite visual para objetos del mapa
│   │   │   ├── level/
│   │   │   │   ├── TileRegistry.js     # Registro: 55 tilesets, ~221 objetos, terrenos, variantes
│   │   │   │   ├── ObjectAnimations.js  # Definición de animaciones de objetos
│   │   │   │   ├── TileLevelLoader.js  # JSON → Phaser Tilemap + domain/Level
│   │   │   │   └── WeatherSystem.js    # Clima: lluvia, nieve, viento, tormenta, noche, etc.
│   │   │   └── program/
│   │   │       └── ProgramExecutor.js  # Intérprete asíncrono de comandos
│   │   ├── game/
│   │   │   └── PickupManager.js    # Orquestación de pickups en runtime
│   │   ├── services/
│   │   │   └── Storage.js          # localStorage: overrides, niveles personalizados
│   │   └── ui/                     # DOM: paleta, diálogos, cola de comandos
│   │       ├── index.js
│   │       ├── queue.js
│   │       ├── dialog.js
│   │       ├── mission.js
│   │       ├── editor-ui.js
│   │       ├── jump-picker.js
│   │       ├── name-dialog.js
│   │       └── state.js
│   ├── levels/
│   │   ├── gym.json            # Datos del nivel Gym
│   │   └── main.json           # Datos del nivel Main
│   └── assets/
│       ├── ui.json             # Manifest de texturas/animaciones UI
│       ├── SproutLands-Sprites/ # Tilesets y sprites del personaje/objetos
│       ├── SproutLands-SorrySprites/ # Packs extendidos (dungeon, invierno, aldea)
│       └── SproutLands-UI/     # Fuentes, botones, menús, dialogs
├── tests/
│   └── domain.test.js          # Tests unitarios de dominio (Vitest)
├── package.json                # Scripts npm (start, test)
└── AGENTS.md / CLAUDE.md       # Documentación de arquitectura para agentes de IA
```

## Arquitectura en capas

| Capa | Descripción | Puede importar de |
|---|---|---|
| **`domain/`** | Lógica pura: estado del jugador, colisiones, geometría del nivel. **Sin Phaser.** | `config/` |
| **`engine/`** | Renderizado, input, tweens, escenas de Phaser, efectos visuales. | `config/`, `domain/`, `services/` |
| **`services/`** | Persistencia: localStorage, registro de niveles personalizados. | `config/`, `domain/`, `engine/level/` |
| **`ui/`** | DOM/HTML superpuesto al canvas. Comunica con Phaser vía `window.__GYM`. | `config/` (indirecto) |

**Flujo de datos:**
```
UI (DOM) ──window.__GYM──► engine/scenes/TileLevelScene
                              │
                              ├──► domain/Player (estado + colisión)
                              ├──► engine/entities/PlayerView (renderizado)
                              └──► services/Storage (persistencia)
```

## Cómo jugar

1. Desde el menú elegir **Gym** (nivel tutorial), **Main** o un **nivel personalizado**
2. Arrastrar o clickear los botones de dirección (panel izquierdo) para llenar los slots del programa (panel derecho)
3. Presionar **Ejecutar** para que el personaje ejecute los movimientos en secuencia
4. Recolectar todos los items para completar el nivel
5. **Reiniciar** vuelve al personaje al punto de spawn
6. **Función 1 (F1)**: Podés grabar una subrutina reutilizable que luego invocás con el botón `ƒ`

## Editor de niveles

Desde el menú: **Edit Gym**, **Edit Main** o **+ Nuevo nivel**

| Tecla | Acción |
|-------|--------|
| `1` / `2` | Capa floor / walls |
| `E` | Eyedrop (copiar tile bajo el cursor) |
| `G` | Toggle grilla |
| `S` | Modo spawn (click para mover el punto de inicio) |
| `O` | Modo objeto (colocar/borrar objetos y pickups) |
| `P` | Play test desde el editor |
| `Ctrl+S` | Guardar (descarga JSON + persiste en localStorage) |
| `Ctrl+Z` / `Ctrl+Y` | Undo / Redo (50 snapshots) |
| `Ctrl+Shift+C` | Limpiar capa activa |
| `Esc` | Volver al menú |

Los niveles editados se persisten en `localStorage` del browser. Para exportar, usar `Ctrl+S` que descarga el JSON y reemplazar el archivo en `public/levels/`.

## Tests

```bash
npm test
```

Ejecuta la suite de `Vitest` en `tests/domain.test.js` para validar comportamiento del dominio (`Player`, `Level`, etc.).

## Formato de nivel (JSON)

```json
{
  "version": 1,
  "cols": 16, "rows": 12, "tile": 16,
  "tilesets": ["grass", "fences", "dirt", "hills", "water"],
  "layers": {
    "floor": [/* array de GIDs, cols*rows */],
    "walls": [/* GID != 0 = tile sólido con colisión */]
  },
  "spawn": { "tx": 8, "ty": 6 },
  "objects": [
    { "tx": 2, "ty": 2, "key": "plants", "frame": 5, "type": "pickup" },
    { "tx": 5, "ty": 3, "key": "grass_props", "frame": 0, "type": "deco" }
  ],
  "weather": { "rain": 0, "snow": 0, "pollen": 0, "leaves": 0, "night": 0, "fog": 0, "dust": 0, "wind": 0, "storm": 0 }
}
```

- `type: "pickup"` — objeto flotante, recolectable
- `type: "deco"` — sprite estático decorativo
- `weather` — intensidad de 0.0 a 1.0 para cada efecto (ver tabla de clima)

## Registro de Tilesets y GIDs

Los GIDs son **inmutables**. Cambiarlos invalida todos los niveles guardados.

El registro (`engine/level/TileRegistry.js`) contiene **55 tilesets** en **8 categorías**:

| Categoría | Cantidad | Ejemplos |
|---|---|---|
| grass | 15 | Classic, v2, Hills, Layers, Dark variants, Bush, Ground Slopes |
| soil | 10 | Dirt, Tilled, Wide, Stone, Dark variants |
| water | 1 | Classic (4-frame animation) |
| fences | 2 | Classic, v2 |
| buildings | 5 | Doors, Wooden House, Roof, Walls, Stone Path |
| dungeon | 11 | Walls, Decor, Ground (orange, dark, darker), Items, Carts, Rails, Rocks, Switch |
| winter | 3 | Ice, Snow 1, Snow 2 |
| more | 8 | Layers 1-4, Blue Layers 1-4 |

> Nota: GIDs 2600–3003 están reservados/libres (5 tilesets de agua eliminados). No reutilizar este rango.

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

## Assets y variantes

`BootScene.js` precarga dinámicamente todos los assets registrados en `TileRegistry.js`:

- **~221 spritesheets** en 7 categorías: `objects`, `nature`, `structures`, `animals`, `characters`, `items`, `shadow`
- **Sistema de variantes**: Objetos con campos `group` + `variant` (ej: `furniture` con versiones `basic`, `new`, `new_2`) se filtran por el picker de variantes del editor (`VARIANT_DEFS`)
- **Packs extendidos**: Incluye `SproutLands-SorrySprites` (dungeon, océano, plant update 2, invierno, aldea)

## Autotile

Los terrenos usan un bitmask de 4 vecinos cardinales: North=1, East=2, South=4, West=8 (valores 0–15). `TileRegistry.resolveTerrainGid(terrain, bitmask)` mapea la máscara al frame correcto.

## Cómo agregar un nuevo objeto al juego

1. **Colocar la imagen** en `public/assets/SproutLands-Sprites/Objects/` (o la carpeta correspondiente)
2. **Registrarlo** en `engine/level/TileRegistry.js` dentro del array `OBJECTS`:
   ```js
   { key: 'mi_objeto', label: 'Mi Objeto', url: 'assets/.../mi_objeto.png', cols: 4, rows: 2, frameW: 16, frameH: 16, category: 'objects' }
   ```
3. **Si tiene variantes**, definirlas en `VARIANT_DEFS` (mismo archivo)
4. **Recargar** — `BootScene.js` precarga automáticamente todo `OBJECTS`

## Limitaciones conocidas

- No hay condición de victoria cuando se recolectan todos los pickups
- Pickups y objetos se cargan completamente desde el JSON del nivel; `MainScene` ya no hardcodea entidades en `decorate()`
- La comunicación DOM ↔ Phaser depende de variables globales (`window.*`)
- `domain/` es JavaScript puro y testable con Node; existen tests unitarios con Vitest en `tests/domain.test.js`, pero aún no hay pipeline de CI configurada
- `CustomScene` usa `levelKey` dinámico pero comparte la misma mecánica que `MainScene`/`GymScene`

## Licencia

[MIT](LICENSE)

---

Hecho con ❤️ para enseñar programación jugando.
