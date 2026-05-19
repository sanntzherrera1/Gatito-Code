# Skill: Diseñador de Niveles Gatito-Code

## Propósito
Esta skill guía a cualquier LLM en la creación de nuevos mapas/niveles para el juego **Gatito-Code**, un juego de puzles 2D por turnos basado en Phaser 3 que enseña conceptos de programación y lógica algorítmica.

---

## Regla de Interacción Inicial (OBLIGATORIA)

Cuando el usuario te pida crear un mapa o un nivel, **NO** generes código ni archivos inmediatamente. Tu primera acción DEBE ser hacerle estas **7 preguntas obligatorias** y esperar sus respuestas:

1. **Dificultad:** *"¿Qué dificultad deseas para este nivel: fácil, normal, difícil o pesadilla?"*
2. **Concepto Pedagógico:** *"¿Qué concepto de lógica o algoritmos quieres que el jugador practique aquí? (Ej: secuencias simples, esquivar obstáculos, encontrar la ruta más corta, evitar callejones sin salida, planificar con límite de movimientos)."*
3. **Temática y Assets:** *"¿Qué escenario visual te imaginas? Te muestro las opciones disponibles..."* (Ver catálogo más abajo).
4. **Estado Anímico / Narrativa Visual:** *"¿Qué emoción o sensación debe transmitir el nivel? (Ej: alegre, triste, melancólico, misterioso, nostálgico, aterrador, tranquilo, caótico, esperanzador)."*
5. **Clima / Atmósfera Física:** *"Describe el clima ambiental. Puedes combinar efectos: lluvia intensa de noche, nieve ligera al amanecer, hojas cayendo en día despejado, polen flotante, o simplemente despejado."*
6. **Narrativa de Juego:** *"¿Quieres incluir un mensaje de bienvenida (diálogo al iniciar el nivel) o un texto de misión específico en la pantalla?"*
7. **Nombre del Mapa:** *"¿Cómo quieres llamar a este nivel? (Ej: bosque_encantado, granja_abandonada, pueblo_lobos). Este nombre se usará para el archivo, el menú y el código fuente."*

---

## Catálogo de Assets Disponibles

### Terrenos Transitables (Autotile)
Estos son los suelos por donde el jugador camina. Se pintan en la capa `floor`.
- `grass` — Pasto verde básico (GID 1-99)
- `dirt` — Tierra arada/marrón (GID 200-299)
- `water` — Agua (GID 400-499)

### Obstáculos / Muros (Autotile)
Se pintan en la capa `walls`. Todo GID distinto de 0 bloquea el paso.
- `hills` — Colinas y elevaciones verdes (GID 300-399)
- `fences` — Cercas de madera (GID 100-199)
- `Wooden House` — Casa de madera completa (usar con cuidado, ocupa mucho espacio)
- `Wooden_House_Roof_Tilset` — Techos modulares
- `Wooden_House_Walls_Tilset` — Paredes modulares
- `Doors` — Puertas de madera
- `ground tiles` — Suelos de piedra o madera para interiores
- `Building parts` — Partes misceláneas de construcción

### Objetos (Pickups y Decoración)
Se colocan en el array `objects` del JSON. `type` puede ser `"pickup"` (coleccionable) o `"deco"` (decoración).
- `plants` — Cultivos y plantas pequeñas (frames 0-11)
- `grass_props` — Elementos naturales: tocones, arbustos, troncos, hongos, flores (frames 0-44)
- `furniture` — Mobiliario: camas, mesas, sillas, estantes (frames 0-53)
- `tools` — Herramientas de granja: picos, hachas, regaderas (frames 0-5)
- `Trees, stumps and bushes` — Árboles enteros, tocones, arbustos grandes
- `Farming Plants` — Cultivos en diferentes estados de crecimiento
- `Mushrooms, Flowers, Stones` — Hongos, flores y rocas
- `Boats` — Botes pequeños
- `Chest` — Cofres de tesoro
- `Egg item` — Huevo como objeto coleccionable
- `Piknik basket` / `Piknik blanket` — Cesta y manta de picnic
- `signs` / `signs_sides` — Letreros de madera
- `Water Objects` — Objetos acuáticos
- `Water well` — Pozo de agua
- `Wood Bridge` — Puente de madera
- `work station` — Mesa de trabajo/crafteo

### Animales (Decorativos / Ambientales)
- `Chicken`, `Chicken_Baby`, `Chicken_Egg`
- `Cow`, `Cow_Baby`

### Personajes (Solo referencia, no para objetos del mapa)
- `character_base` — El protagonista controlado por el jugador

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
| **Misterioso** | Noche (`night: 0.7`), niebla implícita por oscuridad | Casa de madera (`Wooden House`), `fences`, carteles (`signs`), cofres (`Chest`), puentes (`Wood Bridge`) |
| **Aterrador** | Noche intensa (`night: 0.9`), lluvia torrencial (`rain: 0.9`) | Todo lo anterior + ausencia total de animales, muchos `hills` (montañas) cerrando el espacio |
| **Tranquilo / Nostálgico** | Despejado de noche (`night: 0.5`), nieve ligera (`snow: 0.3`) | `grass` con árboles (`Trees`), animales pasivos, pozo, caminos de `dirt` |
| **Caótico** | Tormenta de hojas (`leaves: 0.8`) + lluvia (`rain: 0.6`) | Objetos dispersos sin orden, múltiples tipos de terreno mezclados, puentes rotos, obstáculos inesperados |

### Efectos Climáticos (Nativos del Motor)
El motor soporta múltiples efectos simultáneos. En el JSON del nivel se incluye:

```json
"weather": {
  "rain": 0.0,
  "snow": 0.0,
  "pollen": 0.0,
  "leaves": 0.0,
  "night": 0.0
}
```

- **Valores:** `0.0` (desactivado) a `1.0` (máxima intensidad).
- **Combinaciones:** Ilimitadas. Ejemplo: `"noche lluviosa"` = `{ "night": 0.6, "rain": 0.8 }`.
- **Tipos:** `rain` (lluvia), `snow` (nieve), `pollen` (polen flotante), `leaves` (hojas cayendo), `night` (overlay oscuro).

---

## Flujo de Integración al Código Fuente

Cuando generes un nuevo nivel, la IA debe realizar estos pasos exactos:

### Paso 1: Generar el archivo JSON del nivel
Guardar en: `public/levels/[nombre].json`

### Paso 2: Registrar el nivel en el cargador
Editar `public/src/level/TileLevel.js`:
- Añadir `"[nombre]"` al array `LEVELS` (Ej: `export const LEVELS = ['gym', 'main', 'bosque_encantado'];`)

### Paso 3: Agregar botón al menú
Editar `public/src/scenes/MenuScene.js` en la sección `screen === 'levels'`:
- Añadir: `this.makeButton(bx, y, 'Nombre Visible', () => this.scene.start('Custom', { levelKey: '[nombre]' }));`

### Paso 4 (Opcional - Recomendado para narrativa personalizada): Crear una clase de Escena
Si el usuario pidió `missionText` o `welcomeMessage` personalizados, crear `public/src/scenes/[NombreCamelCase]Scene.js`:

```javascript
import { TileLevelScene } from './TileLevelScene.js';

export class [NombreCamelCase]Scene extends TileLevelScene {
  constructor() {
    super('[NombreCamelCase]');
    this.levelKey = '[nombre]';
    this.missionText = '[Texto de misión personalizado]';
  }

  init(data) {
    super.init(data);
    this.welcomeMessage = '[Mensaje de bienvenida personalizado]';
    if (!data?.returnScreen) this.returnScreen = 'levels';
  }
}
```

### Paso 5 (Si se creó Escena personalizada): Registrar en el motor
Editar `public/src/main.js`:
- Importar la nueva escena: `import { [NombreCamelCase]Scene } from './scenes/[NombreCamelCase]Scene.js';`
- Agregarla al array `scene: [ ..., [NombreCamelCase]Scene ]`
- **Y modificar el botón del menú** para que llame a `this.scene.start('[NombreCamelCase]')` en lugar de `'Custom'`.

---

## Formato Semántico de Entrada (Para el Compilador)

La IA NO debe escribir a mano arrays de 192 GIDs. En su lugar, debe generar un archivo semántico (JSON o YAML) y ejecutar el script `build-level.js`.

### Estructura del esquema semántico:

```json
{
  "name": "bosque_encantado",
  "cols": 16,
  "rows": 12,
  "weather": { "rain": 0, "snow": 0, "pollen": 0, "leaves": 0, "night": 0.6 },
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
    { "tx": 5, "ty": 3, "key": "Trees, stumps and bushes", "frame": 0, "type": "deco" }
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
  "weather": { "rain": 0.4, "snow": 0, "pollen": 0, "leaves": 0.2, "night": 0.5 },
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
    { "tx": 5, "ty": 5, "key": "Chest", "frame": 0, "type": "deco" }
  ]
}
```

### Ejecución:
```bash
node .agents/skills/gatito-levels/build-level.js granja_abandonada.json public/levels/
node .agents/skills/gatito-levels/validate-level.js public/levels/granja_abandonada.json
```

### Integración al código:
1. Añadir `"granja_abandonada"` a `LEVELS` en `TileLevel.js`.
2. Añadir botón en `MenuScene.js`.
3. Crear `GranjaAbandonadaScene.js` con `missionText` personalizado.
4. Registrar escena en `main.js`.

---

## Notas Importantes para el LLM

- **NUNCA** inventes GIDs que no existan en los rangos definidos (grass: 1-99, fences: 100-199, dirt: 200-299, hills: 300-399, water: 400-499).
- **NUNCA** pongas pickups dentro de muros (coordenadas donde la capa `walls` tenga un GID != 0).
- **NUNCA** pongas el spawn sobre un muro.
- **SIEMPRE** ejecuta `validate-level.js` antes de dar por terminado un nivel.
- Si un asset que quiere usar el usuario no está en el catálogo, explica que no está registrado en el motor y sugiere una alternativa del catálogo.
- Todos los comentarios de código y nombres de archivos deben seguir el estilo del proyecto (principalmente español para la experiencia del usuario).
