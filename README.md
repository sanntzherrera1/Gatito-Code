# Gatito-Code

Juego educativo de programacion con estetica pixel-art. El jugador controla un personaje en un mapa de tiles, ejecutando secuencias de comandos (arriba, abajo, izquierda, derecha, saltar) para recolectar objetos. Introduce a los jugadores a los algoritmos de forma didactica.

Incluye un **editor visual de niveles** con soporte para clima, objetos con variantes y multiples tilesets. Disponible en **español e inglés**.

## Demo

<!-- Reemplaza la ruta por tu GIF una vez que lo grabes -->
![Demo del juego](public/assets/demo.gif)

## Documentacion

- Tecnica: [AGENTS.md](AGENTS.md) / [CLAUDE.md](CLAUDE.md) — guia de arquitectura para agentes de IA
- Tecnica (legacy): [docs/documentacion-tecnica.md](docs/documentacion-tecnica.md)

## Presentaciones

Con el servidor levantado en `http://localhost:3000`, estas son las rutas disponibles:

- Juego principal: `http://localhost:3000/`
- Presentacion de gestion: `http://localhost:3000/presentacion-gestion/`
- Presentacion proyecto integrador: `http://localhost:3000/proyecto-integrador/`

### Resumen de enfoque y contenido

- `presentacion-gestion/`:
  Enfoque en gestion de proyecto (equipo, Scrum, alcance, sprints, ceremonias, retrospectiva, lecciones, acta de cierre, evolucion de arquitectura y validacion por tests).

- `proyecto-integrador/`:
  Enfoque en propuesta/producto (problema, solucion pedagogica, publico objetivo, caracteristicas, arquitectura tecnica, estado actual, roadmap, estrategia de lanzamiento y cierre).

## Stack

- [Phaser 3.80.1](https://phaser.io/) — cargado desde CDN, sin bundler
- ES Modules nativos del browser
- Sin dependencias de produccion de npm
- DevDependencies: `browser-sync` (servidor local) y `vitest` (tests)
- Assets: [Sprout Lands](https://cup-nooble.itch.io/sprout-lands) + [SorrySprites](https://itch.io/) (sprites, tilesets, UI, objetos, animales, personajes)
- Personajes: Basic Char (48×48) y Premium Char (48×48) incluidos
- Audio: efectos de sonido WAV/OGG/MP3 para interacciones, gameplay y UI

## Levantar el proyecto

### Requisitos

- Node.js instalado (solo para el servidor estatico)

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
# http://localhost:3000 (se abre automaticamente)
```

> **¿Por que un servidor?** Los ES Modules y la carga de assets requieren HTTP. Abrir `index.html` directo con `file://` no funciona.

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
│   ├── presentacion-gestion/    # Deck de presentacion orientado a gestion del proyecto
│   ├── proyecto-integrador/     # Deck de presentacion orientado a propuesta/producto
│   ├── src/
│   │   ├── main.js             # Configuracion Phaser + registro de escenas + globals i18n
│   │   ├── config/
│   │   │   ├── game.js         # Constantes: TILE, COLS, ROWS, STEP_MS, DIRS
│   │   │   ├── icons.js        # Definicion de iconos pixel-art inline (ico())
│   │   │   └── i18n-strings.js # Catalogo de traducciones ES / EN (~200 claves)
│   │   ├── domain/             # JavaScript puro. Sin Phaser. Testable con Node.
│   │   │   ├── Player.js       # Estado, colision, movimiento, facing
│   │   │   ├── Level.js        # Grilla, solidos, spawn, objetos, clima
│   │   │   └── Program.js      # Secuencia inmutable de comandos
│   │   ├── engine/             # Todo lo que toca Phaser
│   │   │   ├── audio.js        # playSfx(), bindUiSfx(), listener de focus para UI
│   │   │   ├── scenes/
│   │   │   │   ├── BootScene.js    # Preload de assets + animaciones globales
│   │   │   │   ├── MenuScene.js    # Menu principal con selector de idioma
│   │   │   │   ├── EditorScene.js  # Editor visual de niveles
│   │   │   │   └── TileLevelScene.js # Clase base de niveles jugables
│   │   │   ├── levels/
│   │   │   │   ├── GymScene.js          # Nivel tutorial basico
│   │   │   │   ├── MainScene.js         # Nivel principal
│   │   │   │   ├── Nivel0Scene.js       # Nivel introductorio
│   │   │   │   ├── Nivel3Scene.js       # Nivel con tutorial de Funcion 1
│   │   │   │   ├── CustomScene.js       # Niveles personalizados (IF, FOR, etc.)
│   │   │   │   ├── DungeonScene.js      # Nivel dungeon
│   │   │   │   ├── BosqueDePruebaScene.js
│   │   │   │   ├── BosqueFloralScene.js
│   │   │   │   ├── PruebaScene.js
│   │   │   │   ├── intro.js             # Tutorial cinematico base (carteles, camara)
│   │   │   │   ├── ifTutorial.js        # Tutorial cinematico del IF
│   │   │   │   └── forTutorial.js       # Tutorial cinematico del FOR
│   │   │   ├── entities/
│   │   │   │   ├── PlayerView.js        # Sprite, tweens, anims walk/idle/jump/axe
│   │   │   │   ├── PickupView.js        # Sprite flotante + efecto de recoleccion
│   │   │   │   └── WorldObjectView.js   # Sprite visual para objetos del mapa
│   │   │   ├── level/
│   │   │   │   ├── TileRegistry.js      # 55 tilesets, ~221 objetos, GIDs, variantes
│   │   │   │   ├── ObjectAnimations.js  # Definicion de animaciones de objetos
│   │   │   │   ├── TileLevelLoader.js   # JSON → Phaser Tilemap + domain/Level
│   │   │   │   ├── PathAnimator.js      # Animacion del camino sugerido
│   │   │   │   └── WeatherSystem.js     # Clima: lluvia, nieve, viento, tormenta, etc.
│   │   │   └── program/
│   │   │       └── ProgramExecutor.js   # Interprete asincrono de comandos
│   │   ├── game/
│   │   │   └── PickupManager.js         # Orquestacion de pickups en runtime
│   │   ├── services/
│   │   │   ├── Storage.js               # localStorage: overrides, niveles personalizados
│   │   │   ├── Settings.js              # Preferencias: volumen musica/sfx, idioma
│   │   │   └── i18n.js                  # Runtime i18n: t(), applyDomTranslations()
│   │   └── ui/                          # DOM: paleta, dialogos, cola de comandos
│   │       ├── index.js
│   │       ├── queue.js
│   │       ├── dialog.js
│   │       ├── mission.js
│   │       ├── result.js
│   │       ├── editor-ui.js
│   │       ├── jump-picker.js
│   │       ├── name-dialog.js
│   │       └── state.js
│   ├── levels/                  # JSONs estaticos de niveles built-in
│   └── assets/
│       ├── audio/               # Efectos de sonido (WAV, OGG, MP3)
│       ├── ui.json              # Manifest de texturas/animaciones UI
│       ├── SproutLands-Sprites/ # Tilesets y sprites del personaje/objetos
│       ├── SproutLands-SorrySprites/ # Packs extendidos (dungeon, invierno, aldea)
│       └── SproutLands-UI/      # Fuentes, botones, menus, dialogs
├── tests/
│   └── domain.test.js           # Tests unitarios de dominio (Vitest)
├── package.json                 # Scripts npm (start, test)
└── AGENTS.md / CLAUDE.md        # Documentacion de arquitectura para agentes de IA
```

## Arquitectura en capas

| Capa | Descripcion | Puede importar de |
|---|---|---|
| **`config/`** | Constantes, catalogo de traducciones, definicion de iconos. Sin dependencias. | — |
| **`domain/`** | Logica pura: estado del jugador, colisiones, geometria del nivel. **Sin Phaser.** | `config/` |
| **`engine/`** | Renderizado, input, tweens, escenas de Phaser, efectos visuales y audio. | `config/`, `domain/`, `services/` |
| **`services/`** | Persistencia (localStorage), configuracion, runtime de i18n. | `config/`, `domain/`, `engine/level/` |
| **`ui/`** | DOM/HTML superpuesto al canvas. Comunica con Phaser via `window.__GYM`. | `config/` (indirecto via globals) |

**Flujo de datos:**
```
UI (DOM) ──window.__GYM──► engine/scenes/TileLevelScene
                              │
                              ├──► domain/Player (estado + colision)
                              ├──► engine/entities/PlayerView (renderizado)
                              └──► services/Storage (persistencia)
```

## Como jugar

1. Desde el menu elegir un nivel (tutorial, gym, dungeon, bosque, etc.)
2. Arrastrar o clickear los botones de direccion (panel izquierdo) para llenar los slots del programa (panel derecho)
3. Presionar **Ejecutar** para que el personaje ejecute los movimientos en secuencia
4. Recolectar todos los items para completar el nivel
5. **Reiniciar** vuelve al personaje al punto de spawn
6. **Funcion 1 (F1)**: Podes grabar una subrutina reutilizable que luego invocas con el boton `ƒ`
7. **Repetir (FOR)**: Indica un movimiento y cuantas veces repetirlo
8. **Si (IF)**: Define una condicion (roca adelante, arbol adelante) y una accion automatica (saltar, cortar)

## Editor de niveles

Desde el menu: **Edit Gym**, **Edit Main** o **+ Nuevo nivel**

El panel del editor usa el mismo estilo visual del juego (paneles Sprout Lands) y esta organizado en dos columnas: resumen/capas/acciones a la izquierda, paleta y preview a la derecha.

### Modelo de interaccion

El editor usa un modelo unificado sin modos. Existe un solo estado **seleccion** que se carga desde la paleta o desde el mapa, y determina que hace el click.

| Accion | Sin seleccion | Con seleccion |
|---|---|---|
| **Click izq. en elemento del mapa** | Lo copia a la seleccion | — |
| **Click izq. en celda+layer vacia** | No pasa nada | Pega el elemento |
| **Click der. en elemento** | Borra el elemento de la capa activa | Borra el elemento de la capa activa |
| **Click izq. sostenido + mover** | Mueve el elemento (borra origen, pega destino) | — |
| **Esc** | Primer Esc inicia temporizador | Primer Esc limpia seleccion |

**Esc doble para menu**: hay que presionar `Esc` dos veces seguidas (con menos de 1.5 s entre ambas) para volver al menu. El primer Esc siempre limpia la seleccion/modo si hay algo.

### Hover

- **Sin seleccion**: se dibuja un borde alrededor del elemento de la capa activa bajo el cursor (verde para objetos, amarillo para tiles).
- **Con seleccion**: el borde muestra el area de colocacion (verde = valido, rojo = colision), y un fantasma semi-transparente del elemento se renderiza sobre la celda destino.

### Pegar en otra capa

Al copiar un elemento del mapa o de la paleta, el pegar ocurre en la **capa activa** (la seleccionada con `1`–`5` o los botones de capa), no en la capa de origen.

### Validaciones al pegar

Iguales que al colocar desde la paleta: los objetos no se pueden pegar sobre paredes ni donde ya hay otro objeto. Los tiles pueden sobrescribir cualquier celda de la capa activa.

### Teclas

| Tecla | Accion |
|-------|--------|
| `1`–`5` | Cambiar capa activa |
| `G` | Toggle grilla |
| `S` | Modo spawn (click para mover el punto de inicio) |
| `I` | Modo intro (click para marcar/desmarcar puntos de intro) |
| `P` | Play test desde el editor |
| `Esc` × 2 | Volver al menu (doble Esc en < 1.5 s) |
| `Ctrl+S` | Guardar (descarga JSON + persiste en localStorage) |
| `Ctrl+Z` / `Ctrl+Y` | Undo / Redo (50 snapshots) |
| `Ctrl+Shift+C` | Limpiar capa activa |

Los niveles editados se persisten en `localStorage` del browser de forma diferida (con indicador de "sin guardar"). Para exportar, usar `Ctrl+S` que descarga el JSON y reemplazar el archivo en `public/levels/`.

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
    "walls": [/* GID != 0 = tile solido con colision */]
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
- `type: "deco"` — sprite estatico decorativo
- `weather` — intensidad de 0.0 a 1.0 para cada efecto (ver tabla de clima)

## Registro de Tilesets y GIDs

Los GIDs son **inmutables**. Cambiarlos invalida todos los niveles guardados.

El registro (`engine/level/TileRegistry.js`) contiene **55 tilesets** en **8 categorias**:

| Categoria | Cantidad | Ejemplos |
|---|---|---|
| grass | 15 | Classic, v2, Hills, Layers, Dark variants, Bush, Ground Slopes |
| soil | 10 | Dirt, Tilled, Wide, Stone, Dark variants |
| water | 1 | Classic (4-frame animation) |
| fences | 2 | Classic, v2 |
| buildings | 5 | Doors, Wooden House, Roof, Walls, Stone Path |
| dungeon | 11 | Walls, Decor, Ground (orange, dark, darker), Items, Carts, Rails, Rocks, Switch |
| winter | 3 | Ice, Snow 1, Snow 2 |
| more | 8 | Layers 1-4, Blue Layers 1-4 |

> Nota: GIDs 2600–3003 estan reservados/libres (5 tilesets de agua eliminados). No reutilizar este rango.

## Sistema de clima

Ubicacion: `engine/level/WeatherSystem.js`

Soporta **9 efectos simultaneos** con intensidad `0.0 – 1.0`:

| Efecto | Tipo |
|---|---|
| `rain` | Gotas de particulas |
| `snow` | Copos con rotacion |
| `pollen` | Particulas flotantes ascendentes |
| `leaves` | Particulas cayendo con rotacion |
| `night` | Overlay semitransparente oscuro |
| `fog` | Niebla difusa |
| `dust` | Particulas polvorientas con rotacion |
| `wind` | Sistema multicapa: bruma + streaks lejanos/cercanos con wobble |
| `storm` | Relampagos periodicos con zigzag, ramas, glow y fade |

## Assets y variantes

`BootScene.js` precarga dinamicamente todos los assets registrados en `TileRegistry.js`:

- **~221 spritesheets** en 7 categorias: `objects`, `nature`, `structures`, `animals`, `characters`, `items`, `shadow`
- **Sistema de variantes**: Objetos con campos `group` + `variant` (ej: `furniture` con versiones `basic`, `new`, `new_2`) se filtran por el picker de variantes del editor (`VARIANT_DEFS`)
- **Packs extendidos**: Incluye `SproutLands-SorrySprites` (dungeon, oceano, plant update 2, invierno, aldea)

## Autotile

Los terrenos usan un bitmask de 4 vecinos cardinales: North=1, East=2, South=4, West=8 (valores 0–15). `TileRegistry.resolveTerrainGid(terrain, bitmask)` mapea la mascara al frame correcto.

## Como agregar un nuevo objeto al juego

1. **Colocar la imagen** en `public/assets/SproutLands-Sprites/Objects/` (o la carpeta correspondiente)
2. **Registrarlo** en `engine/level/TileRegistry.js` dentro del array `OBJECTS`:
   ```js
   { key: 'mi_objeto', label: 'Mi Objeto', url: 'assets/.../mi_objeto.png', cols: 4, rows: 2, frameW: 16, frameH: 16, category: 'objects' }
   ```
3. **Si tiene variantes**, definirlas en `VARIANT_DEFS` (mismo archivo)
4. **Recargar** — `BootScene.js` precarga automaticamente todo `OBJECTS`

## Sistema de audio

Ubicacion: `engine/audio.js`

Todos los efectos se reproducen respetando el volumen configurado en Ajustes (slider de efectos).

| Evento | Sonido |
|---|---|
| Click en boton de UI | `ui_click` |
| Focus en elemento interactivo | `ui_focus` |
| Borrar programa / slot | `ui_erase` |
| Ejecutar programa | `ui_execute` |
| Iniciar drag de comando | `drag_pick` |
| Soltar comando en slot | `drag_drop` |
| Salto del personaje | `jump_sound` |
| Recolectar objeto | `pickup_sound` |
| Paso sobre cesped | `step_grass_0/1/2` (aleatorio) |
| Paso sobre madera | `step_wood_0/1/2` (aleatorio) |
| Deslizamiento de camara (tutorial) | `cam_slide` |
| Rebote del camino sugerido | `path_bounce` |
| Victoria | `win_sound` |
| Derrota | `lose_sound` |

El bus de sonido de UI se expone como `window.__playUiSfx(key?)` para que las capas DOM puedan disparar efectos sin importar directamente Phaser.

## Internacionalizacion (i18n)

El juego soporta **español** (por defecto) e **inglés**, seleccionable desde el menu **Configuracion**.

La preferencia se persiste en `localStorage` y se aplica al iniciar cada nivel.

### Arquitectura

| Archivo | Rol |
|---|---|
| `config/i18n-strings.js` | Catalogo plano de ~200 claves en ES y EN |
| `config/icons.js` | Funcion `ico(name)` para iconos pixel-art inline |
| `services/i18n.js` | Runtime: `t(key, params)`, `applyDomTranslations()`, `onLanguageChange(cb)` |
| `services/Settings.js` | Persiste `language` en localStorage junto al volumen |

### Uso

```js
// En Phaser (engine/)
import { t } from '../../services/i18n.js';
this.missionText = t('gym.mission');

// En DOM (ui/) — via global
const label = window.__t?.('btn.run') ?? 'ejecutar';

// En HTML — actualizado automaticamente al cambiar idioma
<span data-i18n="btn.run">ejecutar</span>
```

## Limitaciones conocidas

- No hay condicion de victoria cuando se recolectan todos los pickups
- Pickups y objetos se cargan completamente desde el JSON del nivel; `MainScene` ya no hardcodea entidades en `decorate()`
- La comunicacion DOM ↔ Phaser depende de variables globales (`window.*`)
- `domain/` es JavaScript puro y testable con Node; existen tests unitarios con Vitest en `tests/domain.test.js`, pero aun no hay pipeline de CI configurada
- `CustomScene` usa `levelKey` dinamico pero comparte la misma mecanica que `MainScene`/`GymScene`

## Licencia

[MIT](LICENSE)

---

Hecho con ❤️ para enseñar programacion jugando.
