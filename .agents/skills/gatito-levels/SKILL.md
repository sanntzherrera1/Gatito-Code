---
name: gatito-levels
description: Guía la creación de nuevos niveles para Gatito-Code. Use when the user asks to create a map, level, design a puzzle, or add a new stage to the game. Includes pedagogical design rules, asset catalog, weather system, and semantic level compiler.
---

# Skill: Diseñador de Niveles Gatito-Code

## Propósito
Esta skill guía a cualquier LLM en la creación de nuevos mapas/niveles para el juego **Gatito-Code**, un juego de puzles 2D por turnos basado en Phaser 3 que enseña conceptos de programación y lógica algorítmica.

---

## Regla de Interacción Inicial (OBLIGATORIA)

Cuando el usuario te pida crear un mapa o un nivel, **NO** generes código ni archivos inmediatamente. Tu primera acción DEBE ser hacerle estas **8 preguntas obligatorias** y esperar sus respuestas:

1. **Dificultad:** *"¿Qué dificultad deseas para este nivel: fácil, normal, difícil o pesadilla?"*
2. **Concepto Pedagógico:** *"¿Qué concepto de lógica o algoritmos quieres que el jugador practique aquí? (Ej: secuencias simples, esquivar obstáculos, encontrar la ruta más corta, evitar callejones sin salida, planificar con límite de movimientos)."*
3. **Temática y Assets:** *"¿Qué escenario visual te imaginas? Te muestro las opciones disponibles..."* (Ver catálogo más abajo).
4. **Geografía y Bioma:** *"Describe el bioma o geografía del nivel. ¿Qué elementos naturales, animales o construcciones quieres que aparezcan? (Ej: bosque denso con árboles frutales y conejos, granja con gallineros y cultivos, dungeon con piedras y murciélagos, pueblo con casas de madera y puentes, playa con arena y peces)."*
5. **Estado Anímico / Narrativa Visual:** *"¿Qué emoción o sensación debe transmitir el nivel? (Ej: alegre, triste, melancólico, misterioso, nostálgico, aterrador, tranquilo, caótico, esperanzador)."*
6. **Clima / Atmósfera Física:** *"Describe el clima ambiental. Puedes combinar efectos: lluvia intensa de noche, nieve ligera al amanecer, hojas cayendo en día despejado, polen flotante, o simplemente despejado."*
7. **Narrativa de Juego:** *"¿Quieres incluir un mensaje de bienvenida (diálogo al iniciar el nivel) o un texto de misión específico en la pantalla?"*
8. **Nombre del Mapa:** *"¿Cómo quieres llamar a este nivel? (Ej: bosque_encantado, granja_abandonada, pueblo_lobos). Este nombre se usará para el archivo, el menú y el código fuente."*

---

## Catálogo de Assets Disponibles

> **Nota:** Este es un catálogo resumido con los assets más útiles para diseñar niveles. El registro completo de todos los tilesets, objetos, animales e items disponibles está en `public/src/engine/level/TileRegistry.js` (más de 80 spritesheets). Si el usuario pide un asset específico que no aparezca aquí, verifica su existencia en ese archivo antes de decir que no está disponible.

### Terrenos y Muros (Autotile)
El compilador semántico soporta **33 tipos de autotile** que se pintan en las capas `floor` o `walls`. Todo GID distinto de 0 en la capa `walls` bloquea el paso del jugador.

> **Nota:** Existen más tilesets en `TileRegistry.js` (como `grass_hill_slopes`, `wooden_house`, `dungeon_walls`, `ice_tiles`, etc.), pero estos tienen estructuras incompatibles con el sistema de autotile de 4 vecinos (slopes, edificios, items, animaciones). Solo pueden usarse como objetos decorativos (`deco`) o mediante edición manual de GIDs en el editor visual.

#### Grass / Pastos (capa `floor`)
- `grass` — Pasto verde básico
- `grass_v2` — Pasto versión 2
- `grass_hills` — Colinas de pasto
- `grass_layers` — Pasto con capas
- `grass_layers2` — Pasto con capas 2
- `grass_simple` — Pasto simple
- `dgrass_hills` — Colinas de pasto oscuro
- `dgrass_layers` — Pasto oscuro con capas
- `dgrass_layers2` — Pasto oscuro con capas 2
- `dgrass_tiles` — Pasto oscuro
- `bush` — Arbustos como terreno

#### Soil / Suelos (capa `floor`)
- `dirt` — Tierra arada básica
- `dirt_v2` — Tierra versión 2
- `dirt_wide` — Tierra ancha
- `dirt_wide_v2` — Tierra ancha versión 2
- `soil_hills` — Colinas de suelo
- `soil_tiles` — Suelo
- `dsoil_hills` — Colinas de suelo oscuro
- `dsoil_tiles` — Suelo oscuro
- `stone_hills` — Colinas de piedra
- `stone_tiles` — Suelo de piedra

#### Dungeon (capa `floor`)
- `dungeon_ground_orange` — Suelo dungeon naranja
- `dungeon_ground_orange_dark` — Suelo dungeon naranja oscuro

#### Winter / Invierno (capa `floor`)
- `snow_tiles_1` — Nieve 1
- `snow_tiles_2` — Nieve 2

#### Water / Agua (capa `floor`)
- `water` - Agua básica

#### Extended / Más terrenos (capa `floor`)
- `grass_layers_sorry_1` — Capas extendidas 1
- `grass_layers_sorry_2` — Capas extendidas 2
- `grass_layers_sorry_3` — Capas extendidas 3
- `grass_layers_sorry_4` — Capas extendidas 4
- `blue_grass_layers_1` — Pasto azul capas 1
- `blue_grass_layers_2` — Pasto azul capas 2
- `blue_grass_layers_3` — Pasto azul capas 3
- `blue_grass_layers_4` — Pasto azul capas 4

#### Walls / Muros (capa `walls`)
- `hills` - Colinas y rocas
- `fences` - Cercas de madera

### Tilesets Especiales (Manuales / Sin Autotile)
Existen tilesets adicionales que no soportan el sistema de autotile de 4 vecinos debido a su estructura (ej. edificios, agujeros, paredes complejas de mazmorra, rieles, interruptores, hielo). Estos tilesets disponibles son:

- `doors`
- `wooden_house`
- `wooden_roof`
- `wooden_walls`
- `stone_path`
- `dungeon_walls`
- `dungeon_walls_decor`
- `dungeon_ground_orange_hole`
- `dungeon_ground_orange_darker_hole`
- `dungeon_items`
- `dungeon_carts`
- `dungeon_rails`
- `dungeon_rocks`
- `dungeon_switch`
- `ice_tiles`

> **Instrucción de Uso Manual:** Si decides utilizar alguno de estos tilesets, **NO puedes usar el compilador semántico** para ellos. Debes usar la herramienta de búsqueda para leer `public/src/engine/level/TileRegistry.js` y encontrar sus valores exactos de `cols`, `rows` y `firstgid`. Luego, deberás calcular matemáticamente el GID que necesitas y editar tú misma el array plano del JSON final del nivel.

### Objetos Decorativos y Estructuras
Se colocan en el array `objects` del JSON con `type: "deco"`.
- `grass_props` — Arbustos, troncos, hongos, flores
- `plants` — Cultivos pequeños
- `trees` — Árboles, tocones y arbustos grandes
- `tree_full` — Árbol completo (sin fruta)
- `tree_apple` — Árbol con manzanas
- `tree_orange` — Árbol con naranjas
- `tree_peach` — Árbol con duraznos
- `tree_pear` — Árbol con peras
- `no_tree_apple` — Manzana sin árbol
- `no_tree_orange` — Naranja sin árbol
- `no_tree_peach` — Durazno sin árbol
- `no_tree_pear` — Pera sin árbol
- `mushrooms` — Hongos, flores y piedras
- `farming` — Cultivos en crecimiento
- `farming_v2` — Cultivos versión 2 (sin regar)
- `farming_v2_watered` — Cultivos versión 2 (regados)
- `furniture` — Mobiliario básico
- `new_wooden_furniture` — Mobiliario nuevo de madera
- `new_wooden_furniture_items` — Items de mobiliario nuevo
- `birch_biom` — Bioma de abedul
- `birch_water_plants` — Plantas acuáticas de abedul
- `cherry_biom` — Bioma de cerezo
- `cherry_water_plants` — Plantas acuáticas de cerezo
- `pine_biom` — Bioma de pino
- `pine_water_plants` — Plantas acuáticas de pino
- `trees_v2` — Árboles versión 2
- `wood_shrooms` — Madera y hongos
- `christmas_tree` — Árbol de Navidad
- `snowflakes` — Copos de nieve
- `fire_animation` — Fuego animado
- `winter_sprites` — Sprites de invierno
- `dungeon_probs` — Props de mazmorra
- `fishing_splash` — Salpicaduras de pesca
- `dungeon_rocks_obj` — Rocas de mazmorra
- `water_tray` — Bebedero de agua
- `dungeon_carts_obj` — Carros de mazmorra
- `dungeon_switch_obj` — Interruptor de mazmorra
- `signs` — Letreros de madera frontales
- `signs_sides` — Letreros laterales
- `well` — Pozo de agua
- `wood_bridge` — Puente de madera v1
- `wooden_bridge_v2` — Puente de madera v2
- `workstation` — Mesa de trabajo
- `paths` — Caminos decorativos
- `boats` — Botes pequeños
- `water_objs` — Objetos acuáticos
- `barn_structures` — Estructuras de granja
- `chicken_houses` — Gallineros
- `door_animation` — Puertas animadas
- `fence_gates_anim` — Puertas de cerca animadas
- `mailbox_anim` — Buzón animado
- `campfire` — Fogata

#### Village Pack — Casas y Edificios
- `wooden_door_spritesheet` — Puerta de madera
- `grey_brick_houses` — Casa de ladrillo gris
- `grey_brick_houses_doors` — Casa de ladrillo gris con puerta
- `grey_brick_houses_doors_grass` — Casa de ladrillo gris con puerta y pasto
- `grey_brick_houses_grass` — Casa de ladrillo gris con pasto
- `small_house` — Casa pequeña
- `small_house_light` — Casa pequeña con luz
- `small_house_door` — Casa pequeña con puerta
- `small_house_door_grass` — Casa pequeña con puerta y pasto
- `small_house_grass` — Casa pequeña con pasto
- `small_house_light_door` — Casa pequeña con luz y puerta
- `small_house_light_door_grass` — Casa pequeña con luz, puerta y pasto
- `small_house_light_grass` — Casa pequeña con luz y pasto
- `small_huts` — Cabañas pequeñas
- `small_huts_doors` — Cabañas pequeñas con puertas
- `small_huts_doors_grass` — Cabañas pequeñas con puertas y pasto
- `small_huts_grass` — Cabañas pequeñas con pasto
- `small_house_shadow` — Sombra de casa pequeña
- `small_hut_shadow` — Sombra de cabaña
- `brick_houses_shadow` — Sombra de casa de ladrillo

### Items (Pickups Coleccionables)
Se colocan en `objects` con `type: "pickup"`. El jugador debe recogerlos para completar la misión.
- `egg_items` — Huevo
- `tools_items` — Herramientas y materiales
- `piknik_basket` — Cesta de picnic
- `piknik_blanket` — Manta de picnic
- `fruit_berries_items` — Frutas y bayas
- `milk_items` — Productos lácteos
- `grass_ground_items` — Items de suelo
- `farming_plants_items` — Items de cultivo
- `farming_items_v2` — Items de cultivo versión 2
- `present_green` — Regalo verde
- `present_green_2` — Regalo verde 2
- `present_red` — Regalo rojo
- `present_red_2` — Regalo rojo 2
- `present_red_3` — Regalo rojo 3
- `winter_items` — Items de invierno

### Cofres (Estructuras con animación)
- `birch_chest`, `cherry_chest`, `golden_chest`, `oak_chest`, `pine_chest`, `silver_chest` — Cofres de diferentes materiales

### Animales (Decorativos / Ambientales)
- `free_chicken` — Gallina libre
- `chicken` / `chicken_blue` / `chicken_brown` / `chicken_green` / `chicken_red` — Gallinas de colores
- `chicken_baby` / `chicken_baby_blue` / `chicken_baby_brown` / `chicken_baby_green` / `chicken_baby_red` — Pollitos
- `cow` / `cow_brown` / `cow_green` / `cow_pink` / `cow_purple` — Vacas
- `cow_baby_brown` / `cow_baby_green` / `cow_baby_light` / `cow_baby_pink` / `cow_baby_purple` — Terneros
- `bat_animations` — Murciélagos
- `small_green_slime` — Slime verde
- `fish_sprites` — Peces

### Personajes (Solo referencia, no para objetos del mapa)
- `character_base` — El protagonista controlado por el jugador

### Nota sobre los `key` de objetos
En el esquema semántico, el campo `key` debe coincidir **exactamente** con el `key` registrado en `TileRegistry.js`. Por ejemplo:
- Correcto: `{ "key": "well", "frame": 0 }`
- Incorrecto: `{ "key": "Water well", "frame": 0 }`

---

## Reglas de Diseño Pedagógico y Físico

### Regla de Oro: Máximo 7 Movimientos
El jugador solo puede encolar **7 movimientos** por ejecución del programa. Por lo tanto:

- La **distancia transitable real** (pathfinding esquivando muros) desde el `spawn` hasta cada objetivo `pickup` debe ser **≤ 7 pasos**.
- Alternativamente, la distancia entre el `spawn` y un pickup, o entre cualquier par de pickups, debe permitir una secuencia de recolección donde cada salto sea ≤ 7 pasos.
- **NUNCA** diseñes un pickup que requiera 8 o más pasos seguidos sin un punto de descanso intermedio.

### Diseño por Dificultad

| Dificultad | Propósito Educativo | Diseño Espacial |
|------------|---------------------|-----------------|
| **Fácil** | Secuencias básicas, confianza | Caminos casi rectos. 1-2 obstáculos decorativos. Distancia spawn→pickup de 2-4 pasos. Sin trampas. |
| **Normal** | Caminos en L, zig-zag, planificación simple | Muros que obligan a rodear. 3-4 pickups. Distancias de 4-6 pasos. Primera introducción de callejones sin salida visibles. |
| **Difícil** | Optimización de rutas, reconocimiento de patrones | Pasillos estrechos, callejones sin salida que parecen caminos válidos. Distancias de 6-7 pasos. Caminos engañosos visibles. |
| **Pesadilla** | Eficiencia algorítmica extrema, cero error | Exactamente 7 pasos entre zonas seguras. Caminos alternativos tentadores pero ineficientes (requieren 8+ pasos o son dead-ends). Castiga severamente no planificar. |

### Técnica de "Caminos Engañosos" (Decoy Paths)
Para niveles Normal, Difícil y Pesadilla, **SIEMPRE** incluye al menos una ruta alternativa que:
- Sea visualmente tentadora (más corta en línea recta).
- Sea un **callejón sin salida** o requiera más de 7 pasos para salir.
- Force al jugador a contar mentalmente antes de presionar "Run".

### Narrativa Visual por Emoción (Camino Simple - Sin tintes dinámicos)
El motor NO soporta cambiar colores de los tiles dinámicamente. La emoción se transmite **exclusivamente mediante la combinación de assets** y el clima.

| Emoción | Clima Sugerido | Assets Dominantes |
|---------|---------------|-------------------|
| **Alegre / Feliz** | Despejado, polen ligero (`pollen: 0.3`) | `grass`, flores (`grass_props`), animales, puentes, picnic |
| **Triste / Melancólico** | Lluvia ligera (`rain: 0.4`), noche tenue (`night: 0.3`) | `dirt` predominante, tocones cortados, mobiliario abandonado, pozo seco, cercas rotas (`fences`) |
| **Misterioso** | Noche (`night: 0.7`), niebla implícita por oscuridad | Casa de madera (`wooden_house`), `fences`, carteles (`signs`), cofres (`oak_chest`), puentes (`wood_bridge`) |
| **Aterrador** | Noche intensa (`night: 0.9`), lluvia torrencial (`rain: 0.9`) | Todo lo anterior + ausencia total de animales, muchos `hills` (montañas) cerrando el espacio |
| **Tranquilo / Nostálgico** | Despejado de noche (`night: 0.5`), nieve ligera (`snow: 0.3`) | `grass` con árboles (`Trees`), animales pasivos, pozo, caminos de `dirt` |
| **Caótico** | Tormenta de hojas (`leaves: 0.8`) + lluvia (`rain: 0.6`) | Objetos dispersos sin orden, múltiples tipos de terreno mezclados, puentes rotos, obstáculos inesperados |
| **Peligroso / Hostil** | Noche profunda (`night: 0.8`) + nieve intensa (`snow: 0.7`) + tormenta (`storm: 0.5`) + viento (`wind: 0.3`) | Dungeon, rocas (`hills`), objetos dungeon (`dungeon_probs`, `dungeon_rocks_obj`), ausencia de animales |

### Efectos Climáticos (Nativos del Motor)
El motor soporta **9 efectos simultáneos**. En el JSON del nivel se incluyen todos:

```json
"weather": {
  "rain": 0.0,
  "snow": 0.0,
  "pollen": 0.0,
  "leaves": 0.0,
  "night": 0.0,
  "fog": 0.0,
  "dust": 0.0,
  "wind": 0.0,
  "storm": 0.0
}
```

- **Valores:** `0.0` (desactivado) a `1.0` (máxima intensidad).
- **Combinaciones:** Ilimitadas.

| Tipo | Descripción Visual | Ejemplo de Uso |
|------|-------------------|----------------|
| `rain` | Gotas de lluvia cayendo | `{ "rain": 0.8 }` — Lluvia torrencial |
| `snow` | Copos de nieve con rotación | `{ "snow": 0.7 }` — Ventisca |
| `pollen` | Partículas flotantes ascendentes | `{ "pollen": 0.3 }` — Primavera |
| `leaves` | Hojas cayendo con rotación | `{ "leaves": 0.8 }` — Otoño |
| `night` | Overlay oscuro semitransparente | `{ "night": 0.6 }` — Anochecer |
| `fog` | Niebla difusa con partículas | `{ "fog": 0.5 }` — Mañana brumosa |
| `dust` | Partículas de polvo con rotación | `{ "dust": 0.4 }` — Desierto |
| `wind` | Viento con ráfagas visibles | `{ "wind": 0.5 }` — Temporal |
| `storm` | Rayos periódicos con destello | `{ "storm": 0.9 }` — Tormenta eléctrica |

**Ejemplos de combinaciones atmosféricas:**
- `"noche lluviosa"` = `{ "night": 0.6, "rain": 0.8 }`
- `"ventisca helada"` = `{ "night": 0.8, "snow": 0.7, "wind": 0.5 }`
- `"tormenta eléctrica"` = `{ "night": 0.9, "rain": 0.9, "storm": 0.9, "wind": 0.6 }`
- `"mañana brumosa"` = `{ "fog": 0.6, "pollen": 0.2 }`
- `"desierto"` = `{ "dust": 0.7, "wind": 0.4 }`

### Implicaciones del Clima en el Diseño del Mapa
El clima no es solo visual: debe influir activamente en los tiles y objetos que coloques.

| Clima Principal | Regla de Diseño Automático |
|---|---|
| **Lluvioso** (`rain > 0.5`) | Agregar tiles de `water` (charcos) o `water_objs` en el suelo como decoración acuática. |
| **Nevado** (`snow > 0.5`) | Usar `snow_tiles_1` o `snow_tiles_2` como terreno base en lugar de `grass`. |
| **Noche profunda** (`night > 0.7`) | Reducir animales pasivos (`chicken`, `cow`) y aumentar elementos misteriosos/amenazantes (`bat_animations`, `dungeon_probs`). |
| **Tormenta** (`storm > 0.5`) | Combinar con `rain` alto. Considerar ausencia total de animales y terreno oscuro (`dungeon_ground_orange_dark`). |
| **Desierto / Polvoriento** (`dust > 0.5`) | Usar `dirt` o `stone_tiles` como terreno base. Reducir vegetación verde. |
| **Otoño** (`leaves > 0.5`) | Usar `trees` con fruta madura (`tree_apple`, `tree_orange`, etc.) y dejar hojas caídas como objetos decorativos. |

---

## Flujo de Integración al Código Fuente

Cuando generes un nuevo nivel, la IA debe realizar estos pasos exactos en el orden indicado. Omitir cualquiera de ellos dejará el nivel parcialmente inaccesible.

### Paso 1: Generar el archivo JSON del nivel
Guardar en: `public/levels/[nombre].json`

### Paso 2: Registrar el nivel en el cargador de recursos
Editar `public/src/engine/level/TileRegistry.js`:
- Añadir `"[nombre]"` al array `LEVELS` (Ej: `export const LEVELS = ['gym', 'main', 'bosque_encantado'];`)

### Paso 3: Agregar botón de juego al menú principal
Editar `public/src/engine/scenes/MenuScene.js` en la sección `screen === 'levels'`:
- Añadir: `this.makeButton(bx, y, 'Nombre Visible', () => this.scene.start('Custom', { levelKey: '[nombre]' }));`
- **Si se creó una escena personalizada** (Paso 5), usar en su lugar: `this.scene.start('[NombreCamelCase]')`

### Paso 4: Agregar entrada al editor de niveles (OBLIGATORIO)
Editar `public/src/engine/scenes/MenuScene.js` en la sección `screen === 'editor'`, dentro del bucle `for (const lv of [...])`:
- Añadir el nivel al array hardcodeado: `{ key: '[nombre]', name: 'Nombre Visible' }`
- Ejemplo: `for (const lv of [{ key: 'gym', name: 'Gym' }, { key: 'main', name: 'Main' }, { key: '[nombre]', name: 'Nombre Visible' }, ...getCustomLevels()])`

> **Nota:** El editor itera una lista estática de niveles base. Si no se añade aquí, el nivel no aparecerá en "Level Editor → editar existente".

### Paso 5 (Opcional - Recomendado): Crear una clase de Escena personalizada
Si el usuario pidió `missionText` o `welcomeMessage` personalizados, crear `public/src/engine/levels/[NombreCamelCase]Scene.js`:

```javascript
import { TileLevelScene } from '../scenes/TileLevelScene.js';

export class [NombreCamelCase]Scene extends TileLevelScene {
  constructor() {
    super('[NombreCamelCase]');
    this.levelKey = '[nombre]';
    this.missionText = '[Texto de mision personalizado]';
  }

  init(data) {
    super.init(data);
    this.welcomeMessage = '[Mensaje de bienvenida personalizado]';
    if (!data?.returnScreen) this.returnScreen = 'levels';
  }
}
```

### Paso 6 (Si se creó Escena personalizada): Registrar en el motor del juego
Editar `public/src/main.js`:
- Importar la nueva escena: `import { [NombreCamelCase]Scene } from './engine/levels/[NombreCamelCase]Scene.js';`
- Agregarla al array de escenas: `scene: [ ..., [NombreCamelCase]Scene ]`
- **Y modificar el botón del menú** (Paso 3) para que llame a `this.scene.start('[NombreCamelCase]')` en lugar de `'Custom'`.

---

## Formato Semántico de Entrada (Para el Compilador)

La IA NO debe escribir a mano arrays de 192 GIDs. En su lugar, debe generar un archivo semántico (JSON o YAML) y ejecutar el script `build-level.js`.

### Estructura del esquema semántico:

```json
{
  "name": "bosque_encantado",
  "cols": 16,
  "rows": 12,
  "weather": { "rain": 0, "snow": 0, "pollen": 0, "leaves": 0, "night": 0.6, "fog": 0, "dust": 0, "wind": 0, "storm": 0 },
  "spawn": { "tx": 8, "ty": 6 },
  "terrain": [
    { "type": "grass", "rect": [0, 0, 16, 12] },
    { "type": "dirt", "rect": [4, 4, 8, 4] }
  ],
  "walls": [
    { "type": "fences", "rect": [2, 2, 12, 8], "border": true }
  ],
  "objects": [
    { "tx": 10, "ty": 5, "key": "grass_props", "frame": 20, "type": "pickup" },
    { "tx": 5, "ty": 3, "key": "trees", "frame": 0, "type": "deco" }
  ]
}
```

### Notas sobre el formato semántico:
- `terrain`: Lista de rectángulos `[x, y, width, height]`. El compilador calculará automáticamente los bordes (autotile).
- `walls`: Lista de rectángulos. Si tiene `"border": true`, solo dibuja el contorno. Si no, rellena todo.
- `objects`: Cada objeto tiene `tx`, `ty` (coordenadas de tile), `key` (nombre del asset), `frame` (índice del sprite), y `type` (`"pickup"` o `"deco"`).

### Ejecución del compilador:
```bash
node .agents/skills/gatito-levels/build-level.js input.json public/levels/
```

---

## Validación del Nivel

Después de generar el JSON, la IA DEBE ejecutar el validador:

```bash
node .agents/skills/gatito-levels/validate-level.js public/levels/[nombre].json
```

El validador verificará:
- ✅ Estructura del JSON correcta.
- ✅ GIDs dentro de rangos válidos.
- ✅ Spawn dentro de límites y sobre suelo transitable.
- ✅ **Pathfinding BFS:** Todos los pickups están conectados al spawn mediante saltos de máximo 7 pasos cada uno.
- ✅ Intensidades del clima entre 0.0 y 1.0.

**Si el validador falla, la IA debe corregir el diseño y volver a ejecutar el compilador y el validador antes de presentar el resultado al usuario.**

---

## Ejemplo Completo (Few-Shot)

### Input del usuario:
- Dificultad: Normal
- Concepto: Esquivar obstáculos y planificar rutas
- Temática: Granja antigua
- Emoción: Melancólica
- Clima: Lluvia ligera de noche
- Narrativa: "Misión: Encuentra las herramientas perdidas de tu abuelo."
- Nombre: granja_abandonada

### Esquema Semántico generado por la IA:

```json
{
  "name": "granja_abandonada",
  "cols": 16,
  "rows": 12,
  "weather": { "rain": 0.4, "snow": 0, "pollen": 0, "leaves": 0.2, "night": 0.5, "fog": 0, "dust": 0, "wind": 0, "storm": 0 },
  "spawn": { "tx": 2, "ty": 2 },
  "terrain": [
    { "type": "dirt", "rect": [0, 0, 16, 12] },
    { "type": "grass", "rect": [1, 1, 14, 10] }
  ],
  "walls": [
    { "type": "fences", "rect": [1, 1, 14, 10], "border": true },
    { "type": "fences", "rect": [6, 4, 4, 4] }
  ],
  "objects": [
    { "tx": 13, "ty": 9, "key": "tools", "frame": 0, "type": "pickup" },
    { "tx": 4, "ty": 8, "key": "tools", "frame": 2, "type": "pickup" },
    { "tx": 10, "ty": 3, "key": "furniture", "frame": 6, "type": "deco" },
    { "tx": 5, "ty": 5, "key": "oak_chest", "frame": 0, "type": "deco" }
  ]
}
```

### Ejecución:
```bash
node .agents/skills/gatito-levels/build-level.js granja_abandonada.json public/levels/
node .agents/skills/gatito-levels/validate-level.js public/levels/granja_abandonada.json
```

### Integración al código:
1. Añadir `"granja_abandonada"` a `LEVELS` en `public/src/engine/level/TileRegistry.js`.
2. Añadir botón de juego en `public/src/engine/scenes/MenuScene.js` (sección `levels`).
3. Añadir entrada al editor en `public/src/engine/scenes/MenuScene.js` (sección `editor`).
4. Crear `public/src/engine/levels/GranjaAbandonadaScene.js` con `missionText` y `welcomeMessage` personalizados.
5. Importar y registrar `GranjaAbandonadaScene` en `public/src/main.js`.
6. Actualizar el botón del menú para usar `this.scene.start('GranjaAbandonada')`.

---

## Notas Importantes para el LLM

- **NUNCA** inventes GIDs que no existan en los rangos definidos (grass: 1-99, fences: 100-199, dirt: 200-299, hills: 300-399, water: 400-499).
- **NUNCA** pongas pickups dentro de muros (coordenadas donde la capa `walls` tenga un GID != 0).
- **NUNCA** pongas el spawn sobre un muro.
- **SIEMPRE** ejecuta `validate-level.js` antes de dar por terminado un nivel.
- Si un asset que quiere usar el usuario no está en el catálogo, explica que no está registrado en el motor y sugiere una alternativa del catálogo.
- Todos los comentarios de código y nombres de archivos deben seguir el estilo del proyecto (principalmente español para la experiencia del usuario).
