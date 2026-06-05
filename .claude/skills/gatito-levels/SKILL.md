---
name: gatito-levels
description: Diseñador de niveles Gatito-Code. Crea niveles nuevos jugables (path + pickups + decoración + clima) o enriquece niveles existentes, mediante preguntas, y los deja registrados como built-in.
---

# Skill: Diseñador de Niveles Gatito-Code

Guía para crear o enriquecer niveles del juego **Gatito-Code** (puzles 2D por turnos en
Phaser 3 que enseñan lógica de programación). El jugador encola movimientos y los ejecuta
para recorrer un **corredor** (`path`), juntar pickups y llegar a la meta.

Esta skill **hace preguntas primero** y recién después genera. Usa dos scripts auxiliares
de esta carpeta:
- `build-level.js` — compila un spec semántico en el JSON final (con GIDs reales y la capa `path`).
- `validate-level.js` — verifica que el nivel sea **realmente jugable** (corredor conectado,
  pickups sobre el path, y factibilidad según el presupuesto de movimientos).

---

## 0. Apertura OBLIGATORIA (primera pregunta, siempre)

Antes que nada, preguntá:

> **«¿Querés *crear un nivel desde cero* o *actualizar/enriquecer un nivel existente*?»**

- Si **enriquecer** → pedí enseguida **qué nivel** (key: `nivel0`, `gym`, `main`, `nivel3`, …)
  y seguí el **Modo B**.
- Si **crear** → seguí el **Modo A**.

No generes código ni archivos hasta completar el flujo de preguntas.

---

## 1. Flujo de preguntas

Hacé estas preguntas (podés agruparlas con `AskUserQuestion`):

1. **Modo** (crear / enriquecer) y, si enriquece, **qué nivel**.
2. **Herramientas:** «¿El nivel usa **Función (ƒ)**? ¿**loop/for**? ¿**if**?»
   → Luego **VERIFICÁ EN EL CÓDIGO** cuáles existen de verdad (ver §2). Diseñá solo con las reales.
3. **Dificultad** (fácil / normal / difícil / pesadilla) **y qué incluye** (nº de pickups,
   nº de pasos objetivo) → usá la tabla de §3.
4. **Temática/assets**, **emoción**, **clima**, **narrativa** (mensaje de bienvenida y/o misión),
   y **nombre** del nivel (kebab/lowercase; se usa para archivo, key y escena).
5. **Path:** generá caminos candidatos y dejá que el usuario elija uno (ver §4).

---

## 2. Herramientas reales (VERIFICAR antes de diseñar)

El motor **hoy** solo ejecuta:
- **Movimiento** (arriba/abajo/izq/der) — panel principal, **máximo 5 slots** (`public/src/ui/state.js`, `MAX=5`).
- **Salto** (`jump`) — cruza un hueco.
- **Función `func1`** (panel **F1**) — una sub-secuencia de **hasta 3 pasos** reutilizable
  (`public/src/ui/queue.js`).

**`loop`/`for` e `if` NO existen todavía.** Si el usuario los pide, avisá que aún no están
implementados y diseñá con lo disponible (no generes un nivel injugable).

Cómo verificar qué herramientas tiene un nivel:
- La Función se habilita/deshabilita **por escena**, de forma imperativa. Buscá en
  `public/src/engine/levels/<Nivel>Scene.js` un patrón tipo `_disableFunc1()`
  (ej. `Nivel0Scene` la **grisea** → ese nivel NO usa Función). Si no la deshabilita, está disponible.
- Confirmá los botones en `public/index.html` (`[data-dir="func1"]`, `[data-target="func1"]`).
- Si en el futuro aparecen `loop`/`if`, se detectarán igual (nuevos botones/colas); hasta entonces, no asumas que existen.

---

## 3. Dificultad ↔ presupuesto de movimientos

La dificultad sale de **pasos del path + cantidad de pickups**, acotada por el **presupuesto**
de un único programa (se juntan TODOS los pickups y se llega a la meta en una sola ejecución):

- **Sin Función:** máximo **5 pasos** (5 slots).
- **Con Función:** `pasos = (5 − k) + k·L`, con `k` slots usados como `ƒ` y `L = |bloque ƒ| ≤ 3`.
  → hasta **15 pasos**, pero solo si el path tiene un **motivo repetido** (la misma sub-secuencia
  se reutiliza). Ej.: ƒ=[right,right,right] usado 2 veces = 6 pasos en 2 slots.
- **Salto:** permite cruzar un hueco de 1 tile.

| Dificultad | Pasos del path | Pickups | Herramienta típica |
|---|---|---|---|
| **Fácil** | 2–4 (casi recto) | 1 | solo movimiento |
| **Normal** | 5–6 (L / pocos giros) | 1–2 | movimiento, o ƒ usada 1 vez |
| **Difícil** | 7–9 (con motivo repetido) | 2–3 | **ƒ requerida** (2 usos) |
| **Pesadilla** | 10–15 (motivo muy repetido, presupuesto justo) | 3+ | **ƒ muy reutilizada** |

Regla de oro: **el `validate-level.js` debe dar factible** con las herramientas declaradas.
A más camino y más pickups, más difícil planear el programa dentro del presupuesto.

---

## 4. Generar el path (caminos candidatos a elección)

### Modo A (nuevo)
1. Escribí un *cand-spec* y pedí candidatos:
   ```bash
   node .claude/skills/gatito-levels/build-level.js candidates cand.json
   ```
   `cand.json`: `{ "cols":16, "rows":12, "spawn":{"tx":1,"ty":6}, "steps":6, "pickups":2, "tools":["func"] }`
2. El script imprime **2–4 corredores** (recto, en L, escalera, motivo-repetido) con **preview ASCII**
   (`S`=spawn, `·`=corredor, `*`=pickup, `G`=meta) y su JSON (`tiles`, `dirs`, `pickups`, `goal`).
3. Mostrá los previews al usuario con `AskUserQuestion` (usando el campo `preview`) y que **elija uno**.

### Modo B (enriquecer)
1. **Leé el path actual** del nivel (su `public/levels/<key>.json`, o adelantá al usuario que su
   localStorage `level:<key>` puede pisarlo) y **mostralo** (preview ASCII del corredor).
2. Preguntá: **«¿Mantener el path tal cual, modificarlo, o generar una variación?»**
   - **Mantener** → no toques el corredor; solo agregá decoración/objetos.
   - **Modificar/variación** → pasá el corredor actual como `basePath` al generador:
     `{ "basePath":[{"x":1,"y":6}, …], "pickups":2 }` → produce variaciones (original, extendido,
     acortado, con recodo). El usuario elige una.
3. Al **cambiar** el path: **re-ubicá los pickups sobre el nuevo corredor** y **re-validá**.

---

## 5. Spec para `build-level.js build`

Una vez elegido el path, escribí el spec y compilá:

```jsonc
{
  "name": "bosque_encantado",          // archivo/key del nivel
  "cols": 16, "rows": 12,
  "tools": ["func"],                    // informativo: lo pasás también al validador
  "spawn": { "tx": 1, "ty": 6 },        // en un EXTREMO del corredor
  "floor": { "base": "grass",           // terreno base + parches opcionales (autotile)
             "patches": [{ "type": "dirt", "rect": [10,2,4,3] }] },
  "walls":  [{ "type": "hills", "rect": [0,0,16,12], "border": true }],  // opcional
  "path":   { "tiles": [{ "x":1,"y":6 }, … ] },   // el corredor elegido (o "waypoints")
  "pathGid": 212,                       // opcional; tile del sendero (≠0). 212 = tierra
  "objects": [
    { "tx":4, "ty":6, "key":"grass_props", "frame":19, "type":"pickup_with_animation" },
    { "tx":12,"ty":3, "key":"trees",       "frame":0,  "type":"deco" }
  ],
  "weather": { "pollen": 0.3 }
}
```

```bash
node .claude/skills/gatito-levels/build-level.js build spec.json public/levels/
node .claude/skills/gatito-levels/validate-level.js public/levels/<name>.json --tools func
```

**Si el validador FALLA, corregí el spec y reconstruí.** No presentes un nivel que no pase.

---

## 6. Catálogo (assets reales)

> Fuente de verdad: `public/src/engine/level/TileRegistry.js` (`TILESETS`, `TERRAINS`, `OBJECTS`).
> Los **rangos de GID son INMUTABLES** (CLAUDE.md). No inventes GIDs.

### Terrenos transitables (capa `floor`, autotile) — usar como `base`/`patches.type`
`grass` (pasto), `dirt` / `dirt_v2` (tierra), `grass_hills` (pasto colinas), `dgrass_tiles`
(pasto oscuro), `bush` (arbustos), `water` (agua).

### Muros/obstáculos (capa `walls`, autotile) — `walls[].type`
`hills` (colinas verdes), `fences` (cercas). Todo GID ≠ 0 bloquea. *Con un `path` presente, el
jugador ya queda confinado al corredor; los muros son sobre todo visuales/encierre.*

### Objetos (`objects[]`): `pickup` / `pickup_with_animation` (coleccionables) y `deco` / `top` (decoración)
Cada objeto es **un solo tile de 16×16**: `{ tx, ty, key, frame, type }`, donde `frame` es el índice
(0..cols·rows−1) del spritesheet.

> ⚠️ **CRÍTICO — los objetos multi-tile se ven CORTADOS.** Muchas hojas mezclan props de 1 tile con
> objetos grandes (árboles, troncos, rocas grandes, girasol, casas) que ocupan 2×2 o más. Si ponés un
> `frame` suelto de uno de esos, se renderiza **solo un pedacito** (un árbol cortado, media planta). El
> motor **no** compone multi-tile en un objeto. **Usá solo frames que sean un dibujo completo en su celda.**

**Frames de 1 tile SEGUROS (verificados, ideales para decoración):**
- `plants` (Basic Plants, 6×2 = 12 frames): **0–11**, todas plantitas/brotes pequeños. 100% seguros.
- `mushrooms` (Mushrooms/Flowers/Stones, 12×5): **fila 0 = frames 0–11** (hongos). Las filas siguientes
  tienen rocas grandes y un girasol multi-tile → evitarlas salvo flores chicas ya verificadas.
- `grass_props` (9×5): la **fila 0 (frames 0–8) son ÁRBOLES multi-tile → NO usar sueltos.** Props de
  1 tile verificados: `5` (remolacha), `28` y `36` (arbustos/piedras). Pickups animados conocidos: `19`, `31`.
- `free_chicken` (4×2): **frame 0** (gallina) — 1 tile, decorativo.

**Cómo verificar un frame nuevo:** abrí el PNG (`Read` de la imagen en `public/assets/...`), contá la
grilla `cols×rows` del registry y elegí solo celdas con un dibujo **completo**. Árboles/casas/rocas
grandes: **no hay soporte multi-tile → no los uses como deco.**

Otras keys (usar con la verificación de arriba): `winter_sprites`, `wood_shrooms` (props chicos);
`free_chicken`/`chicken_baby` (animales 1 tile); `egg_items`,`fruit_berries_items`,`tools_items` (items chicos).

**Pickups SIEMPRE sobre el corredor** (un tile del `path`). La decoración va donde quieras (es visual).

### Clima (`weather`, 0.0–1.0) — combinables
`rain`, `snow`, `pollen`, `leaves`, `night`, `fog`, `dust`, `wind`, `storm`.

| Emoción | Clima sugerido | Assets dominantes |
|---|---|---|
| Alegre | `pollen:0.3` | flores/`grass_props`, animales, puentes |
| Triste/Melancólico | `rain:0.4, night:0.3` | `dirt`, tocones, cercas, pozo |
| Misterioso | `night:0.7, fog:0.3` | casas, `signs`, `chest`, puentes |
| Aterrador | `night:0.9, rain:0.8` | sin animales, muchos `hills` cerrando |
| Tranquilo | `night:0.5, snow:0.3` | `grass`, árboles, animales pasivos |

**Caminos engañosos (decoy):** para difícil/pesadilla, agregá decoración que sugiera un atajo
falso (la decoración no es transitable: el jugador solo camina el `path`), forzando a contar pasos.

---

## 7. Integración built-in (dejar el nivel jugable en el menú)

Para un nivel **nuevo** (en modo enriquecer ya está registrado), hacé los 5 pasos:

1. **JSON:** `build-level.js build … public/levels/` → `public/levels/<key>.json`.
2. **Preload:** agregá `'<key>'` al array `LEVELS` en
   `public/src/engine/level/TileRegistry.js` (BootScene precarga `level_<key>`).
3. **Registro/menú:** agregá `{ key:'<key>', name:'<Nombre>', scene:'<SceneKey>' }` a
   `BUILTIN_LEVELS` en `public/src/services/Storage.js` (el menú lo lista solo vía `getAllLevels()`).
4. **Escena:** creá `public/src/engine/levels/<Nombre>Scene.js` extendiendo `TileLevelScene`:
   ```js
   import { TileLevelScene } from '../scenes/TileLevelScene.js';
   export class <Nombre>Scene extends TileLevelScene {
     constructor() {
       super('<SceneKey>');
       this.levelKey = '<key>';
       this.missionText  = '<misión opcional>';
       this.welcomeMessage = '<bienvenida opcional o null>';
     }
   }
   ```
   Si el nivel **NO** usa Función, copiá el patrón `_disableFunc1()` de `Nivel0Scene` para grisearla.
5. **Registrar escena:** en `public/src/main.js`, importá la clase y agregala al array `scene:[…]`.

---

## 8. Verificación final

1. `node validate-level.js public/levels/<key>.json --tools <herramientas>` → **PASA**.
2. `node --check` sobre la Scene nueva y los archivos editados.
3. `npx serve public` → el nivel aparece en **Levels**, se juega, el `path` confina al jugador,
   se juntan los pickups y se gana al llegar a la meta dentro del presupuesto.

> **Ojo localStorage:** `readLevelJson` (Storage.js) prioriza `level:<key>` de localStorage sobre
> el disco. Si ya editaste ese nivel en el editor, limpiá ese override para ver el JSON nuevo:
> en la consola del navegador `localStorage.removeItem('level:<key>')`.

---

## Errores comunes (evitar)
- Poner un **pickup fuera del corredor** → inalcanzable. Siempre sobre un tile del `path`.
- Diseñar un path **más largo que el presupuesto** de las herramientas → el validador lo marca NO factible.
- Inventar GIDs o keys de objetos que no están en el registry.
- Olvidar el paso 2 (`LEVELS`): sin precarga, el nivel carga vacío.
- Asumir `loop`/`if`: no existen aún.
