---
name: gatito-levels
description: Diseñador de niveles Gatito-Code. Crea niveles nuevos jugables (path + pickups + decoracion + clima) o enriquece niveles existentes, mediante preguntas, y los deja registrados como built-in.
---

# Skill: Diseñador de Niveles Gatito-Code

Guia para crear o enriquecer niveles del juego **Gatito-Code** (puzles 2D por turnos en
Phaser 3 que enseñan logica de programacion). El jugador encola movimientos y los ejecuta
para recorrer un **corredor** (`path`), juntar pickups y llegar a la meta.

Esta skill **hace preguntas primero** y recien despues genera. Usa dos scripts auxiliares
de esta carpeta:
- `build-level.js` — compila un spec semantico en el JSON final (con GIDs reales y la capa `path`).
- `validate-level.js` — verifica que el nivel sea **realmente jugable** (corredor conectado,
  pickups sobre el path, y factibilidad segun el presupuesto de movimientos).

---

## 0. Apertura OBLIGATORIA (primera pregunta, siempre)

Antes que nada, pregunta:

> **«¿Queres *crear un nivel desde cero* o *actualizar/enriquecer un nivel existente*?»**

- Si **enriquecer** → pedi enseguida **que nivel** (key: `nivel0`, `gym`, `main`, `nivel3`, …)
  y segui el **Modo B**.
- Si **crear** → segui el **Modo A**.

No generes codigo ni archivos hasta completar el flujo de preguntas.

---

## 1. Flujo de preguntas

Hace estas preguntas (podes agruparlas con `AskUserQuestion`):

1. **Modo** (crear / enriquecer) y, si enriquece, **que nivel**.
2. **Herramientas:** «¿El nivel usa **Funcion (ƒ)**? ¿**loop/for**? ¿**if**?»
   → Luego **VERIFICa EN EL CoDIGO** cuales existen de verdad (ver §2). Diseña solo con las reales.
3. **Dificultad** (facil / normal / dificil / pesadilla) **y que incluye** (nº de pickups,
   nº de pasos objetivo) → usa la tabla de §3.
4. **Tematica/assets**, **emocion**, **clima**, **narrativa** (mensaje de bienvenida y/o mision),
   y **nombre** del nivel (kebab/lowercase; se usa para archivo, key y escena).
5. **Path:** genera caminos candidatos y deja que el usuario elija uno (ver §4).

---

## 2. Herramientas reales (VERIFICAR antes de diseñar)

El motor **hoy** solo ejecuta:
- **Movimiento** (arriba/abajo/izq/der) — panel principal, **maximo 5 slots** (`public/src/ui/state.js`, `MAX=5`).
- **Salto** (`jump`) — cruza un hueco.
- **Funcion `func1`** (panel **F1**) — una sub-secuencia de **hasta 3 pasos** reutilizable
  (`public/src/ui/queue.js`).

**`loop`/`for` e `if` NO existen todavia.** Si el usuario los pide, avisa que aun no estan
implementados y diseña con lo disponible (no generes un nivel injugable).

Como verificar que herramientas tiene un nivel:
- La Funcion se habilita/deshabilita **por escena**, de forma imperativa. Busca en
  `public/src/engine/levels/<Nivel>Scene.js` un patron tipo `_disableFunc1()`
  (ej. `Nivel0Scene` la **grisea** → ese nivel NO usa Funcion). Si no la deshabilita, esta disponible.
- Confirma los botones en `public/index.html` (`[data-dir="func1"]`, `[data-target="func1"]`).
- Si en el futuro aparecen `loop`/`if`, se detectaran igual (nuevos botones/colas); hasta entonces, no asumas que existen.

---

## 3. Dificultad ↔ presupuesto de movimientos

La dificultad sale de **pasos del path + cantidad de pickups**, acotada por el **presupuesto**
de un unico programa (se juntan TODOS los pickups y se llega a la meta en una sola ejecucion):

- **Sin Funcion:** maximo **5 pasos** (5 slots).
- **Con Funcion:** `pasos = (5 − k) + k·L`, con `k` slots usados como `ƒ` y `L = |bloque ƒ| ≤ 3`.
  → hasta **15 pasos**, pero solo si el path tiene un **motivo repetido** (la misma sub-secuencia
  se reutiliza). Ej.: ƒ=[right,right,right] usado 2 veces = 6 pasos en 2 slots.
- **Salto:** permite cruzar un hueco de 1 tile.

| Dificultad | Pasos del path | Pickups | Herramienta tipica |
|---|---|---|---|
| **Facil** | 2–4 (casi recto) | 1 | solo movimiento |
| **Normal** | 5–6 (L / pocos giros) | 1–2 | movimiento, o ƒ usada 1 vez |
| **Dificil** | 7–9 (con motivo repetido) | 2–3 | **ƒ requerida** (2 usos) |
| **Pesadilla** | 10–15 (motivo muy repetido, presupuesto justo) | 3+ | **ƒ muy reutilizada** |

Regla de oro: **el `validate-level.js` debe dar factible** con las herramientas declaradas.
A mas camino y mas pickups, mas dificil planear el programa dentro del presupuesto.

---

## 4. Generar el path (caminos candidatos a eleccion)

### Modo A (nuevo)
1. Escribi un *cand-spec* y pedi candidatos:
   ```bash
   node .claude/skills/gatito-levels/build-level.js candidates cand.json
   ```
   `cand.json`: `{ "cols":16, "rows":12, "spawn":{"tx":1,"ty":6}, "steps":6, "pickups":2, "tools":["func"] }`
2. El script imprime **2–4 corredores** (recto, en L, escalera, motivo-repetido) con **preview ASCII**
   (`S`=spawn, `·`=corredor, `*`=pickup, `G`=meta) y su JSON (`tiles`, `dirs`, `pickups`, `goal`).
3. Mostra los previews al usuario con `AskUserQuestion` (usando el campo `preview`) y que **elija uno**.

### Modo B (enriquecer)
1. **Lee el path actual** del nivel (su `public/levels/<key>.json`, o adelanta al usuario que su
   localStorage `level:<key>` puede pisarlo) y **mostralo** (preview ASCII del corredor).
2. Pregunta: **«¿Mantener el path tal cual, modificarlo, o generar una variacion?»**
   - **Mantener** → no toques el corredor; solo agrega decoracion/objetos.
   - **Modificar/variacion** → pasa el corredor actual como `basePath` al generador:
     `{ "basePath":[{"x":1,"y":6}, …], "pickups":2 }` → produce variaciones (original, extendido,
     acortado, con recodo). El usuario elige una.
3. Al **cambiar** el path: **re-ubica los pickups sobre el nuevo corredor** y **re-valida**.

---

## 5. Spec para `build-level.js build`

### Modelo de CAPAS (orden de dibujo, de abajo hacia arriba)
- **`floor`** — el **piso base**: **UN solo terreno**.
- **`overlay`** — un **2º piso ENCIMA** del floor (parches de tierra, alfombras, caminos sobre el
  pasto). Sus bordes (autotile) dejan ver el floor debajo.
- **`top`** — una **3ª capa de tiles** encima del overlay (detalles sobre el 2º piso).
- **`objects`** — sprites por encima de todo. Usa `type:"top"` para un objeto que va sobre el 2º piso.

> Regla: `floor` = un piso. ¿Otro piso encima? → **`overlay`**. ¿Un objeto/tile sobre el 2º piso? → **`top`**.
> **No** uses `floor.patches` para superponer pisos (eso reemplaza el piso base) — para eso esta `overlay`.

Una vez elegido el path, escribi el spec y compila:

```jsonc
{
  "name": "bosque_encantado",          // archivo/key del nivel
  "cols": 16, "rows": 12,
  "tools": ["func"],                    // informativo: lo pasas tambien al validador
  "spawn": { "tx": 1, "ty": 6 },        // en un EXTREMO del corredor
  "floor":   { "base": "grass_hills" },                       // 1 PISO base (un solo terreno)
  "overlay": [ { "type": "dirt", "rect": [10,8,4,3] } ],      // 2º PISO encima (huerta/alfombra/camino)
  "top":     [ ],                                              // opcional: tiles sobre el overlay
  "walls":   [ { "type": "hills", "rect": [0,0,16,12], "border": true } ],  // opcional
  "path":    { "tiles": [{ "x":1,"y":6 }, … ] },   // el corredor elegido (o "waypoints")
  "pathGid": 59,                        // opcional; tile del sendero (≠0)
  "objects": [
    { "tx":4, "ty":6, "key":"grass_props", "frame":19, "type":"pickup_with_animation" },
    { "tx":12,"ty":3, "key":"tree_full",   "frame":0,  "type":"deco" }
  ],
  "weather": { "pollen": 0.3 }
}
```

```bash
node .claude/skills/gatito-levels/build-level.js build spec.json public/levels/
node .claude/skills/gatito-levels/validate-level.js public/levels/<name>.json --tools func
```

**Si el validador FALLA, corregi el spec y reconstrui.** No presentes un nivel que no pase.

---

## 6. Catalogo (assets reales)

> Fuente de verdad: `public/src/engine/level/TileRegistry.js` (`TILESETS`, `TERRAINS`, `OBJECTS`).
> Los **rangos de GID son INMUTABLES** (CLAUDE.md). No inventes GIDs.

### Terrenos transitables (capa `floor`, autotile) — usar como `base`/`patches.type`
`grass` (pasto), `dirt` / `dirt_v2` (tierra), `grass_hills` (pasto colinas), `dgrass_tiles`
(pasto oscuro), `bush` (arbustos), `water` (agua).

### Muros/obstaculos (capa `walls`, autotile) — `walls[].type`
`hills` (colinas verdes), `fences` (cercas). Todo GID ≠ 0 bloquea. *Con un `path` presente, el
jugador ya queda confinado al corredor; los muros son sobre todo visuales/encierre.*

### Objetos (`objects[]`): `pickup` / `pickup_with_animation` (coleccionables) y `deco` / `top` (decoracion)
Formato: `{ tx, ty, key, frame, type }`. `frame` es el indice del spritesheet.

#### Objetos multi-tile (arboles, casas, etc.) — YA soportados
El motor dibuja estos objetos **enteros** como un solo objeto, anclado a un **tile-base**:
- **Anclaje:** `(tx,ty)` = **fila inferior, columna centrada** de la huella. El objeto se dibuja hacia
  **arriba** (origin abajo). `occupyW/occupyH` (en el registry) definen la **huella** en tiles.
- **Bloquean su huella** (colision) y se ordenan por fila (depth). La huella **no debe pisar** el
  corredor, el spawn, un pickup ni otro objeto — **el validador lo chequea**.

**Keys multi-tile usables (huella W×H):**
- arboles: `tree_full` / `tree_apple` / `tree_orange` / `tree_peach` / `tree_pear` (1×1; se ven de ~3 tiles
  pero solo ocupan el tronco). Frutas sueltas: `no_tree_apple`… (1×1).
- Casas: `small_house`/`small_huts` (+`_door`,`_grass`,`_light`…) (4×1); `grey_brick_houses`(+variantes) (5×2).
- Otros: `well` (2×1), `workstation` (2×1), `water_tray` (2×1), `dungeon_probs` (2×2),
  cofres `golden_chest`/`oak_chest`/… (1×1), `christmas_tree` (1×1).

> ⚠️ **No** uses estos para "grande" porque se cortan (no tienen entrada multi-tile): `trees`,
> `trees_v2`, `wooden_house`, `chicken_houses`, ni la **fila 0 de `grass_props`** (arboles). Usa las keys
> de arriba (`tree_full`, `small_house`, …). El validador avisa y sugiere el reemplazo.

#### Props de 1 tile (decoracion chica, sin huella)
- `plants` (Basic Plants, 6×2): **0–11**, plantitas/brotes. 100% seguros.
- `mushrooms` (12×5): **fila 0 (0–11)** = hongos. (Rocas grandes/girasol de filas siguientes son multi-tile.)
- `grass_props` (9×5): props de 1 tile verificados `5`, `28`, `36`. Pickups animados conocidos: `19`, `31`.
- `free_chicken` (4×2) frame 0 (gallina), `egg_items`/`fruit_berries_items`/`tools_items` (items chicos).

**Como agregar un objeto multi-tile nuevo:** si solo existe en una hoja 16×16 mixta, agrega una entrada
en `OBJECTS` con `frames:[{x,y,w,h}]` (sub-frames atlas) + `occupyW/occupyH`; si ya hay hoja dedicada,
usa esa. Medi el rect abriendo el PNG con `Read` (cada celda = 16 px).

**Pickups SIEMPRE sobre el corredor** (un tile del `path`). La decoracion va fuera del corredor.

### Clima (`weather`, 0.0–1.0) — combinables
`rain`, `snow`, `pollen`, `leaves`, `night`, `fog`, `dust`, `wind`, `storm`.

| Emocion | Clima sugerido | Assets dominantes |
|---|---|---|
| Alegre | `pollen:0.3` | flores/`grass_props`, animales, puentes |
| Triste/Melancolico | `rain:0.4, night:0.3` | `dirt`, tocones, cercas, pozo |
| Misterioso | `night:0.7, fog:0.3` | casas, `signs`, `chest`, puentes |
| Aterrador | `night:0.9, rain:0.8` | sin animales, muchos `hills` cerrando |
| Tranquilo | `night:0.5, snow:0.3` | `grass`, arboles, animales pasivos |

**Caminos engañosos (decoy):** para dificil/pesadilla, agrega decoracion que sugiera un atajo
falso (la decoracion no es transitable: el jugador solo camina el `path`), forzando a contar pasos.

---

## 7. Integracion built-in (dejar el nivel jugable en el menu)

Para un nivel **nuevo** (en modo enriquecer ya esta registrado), hace los 5 pasos:

1. **JSON:** `build-level.js build … public/levels/` → `public/levels/<key>.json`.
2. **Preload:** agrega `'<key>'` al array `LEVELS` en
   `public/src/engine/level/TileRegistry.js` (BootScene precarga `level_<key>`).
3. **Registro/menu:** agrega `{ key:'<key>', name:'<Nombre>', scene:'<SceneKey>' }` a
   `BUILTIN_LEVELS` en `public/src/services/Storage.js` (el menu lo lista solo via `getAllLevels()`).
4. **Escena:** crea `public/src/engine/levels/<Nombre>Scene.js` extendiendo `TileLevelScene`:
   ```js
   import { TileLevelScene } from '../scenes/TileLevelScene.js';
   export class <Nombre>Scene extends TileLevelScene {
     constructor() {
       super('<SceneKey>');
       this.levelKey = '<key>';
       this.missionText  = '<mision opcional>';
       this.welcomeMessage = '<bienvenida opcional o null>';
     }
   }
   ```
   Si el nivel **NO** usa Funcion, copia el patron `_disableFunc1()` de `Nivel0Scene` para grisearla.
5. **Registrar escena:** en `public/src/main.js`, importa la clase y agregala al array `scene:[…]`.

---

## 8. Verificacion final

1. `node validate-level.js public/levels/<key>.json --tools <herramientas>` → **PASA**.
2. `node --check` sobre la Scene nueva y los archivos editados.
3. `npx serve public` → el nivel aparece en **Levels**, se juega, el `path` confina al jugador,
   se juntan los pickups y se gana al llegar a la meta dentro del presupuesto.

> **Ojo localStorage:** `readLevelJson` (Storage.js) prioriza `level:<key>` de localStorage sobre
> el disco. Si ya editaste ese nivel en el editor, limpia ese override para ver el JSON nuevo:
> en la consola del navegador `localStorage.removeItem('level:<key>')`.

---

## Errores comunes (evitar)
- Poner un **pickup fuera del corredor** → inalcanzable. Siempre sobre un tile del `path`.
- Diseñar un path **mas largo que el presupuesto** de las herramientas → el validador lo marca NO factible.
- Inventar GIDs o keys de objetos que no estan en el registry.
- Olvidar el paso 2 (`LEVELS`): sin precarga, el nivel carga vacio.
- Asumir `loop`/`if`: no existen aun.
