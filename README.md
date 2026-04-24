# Gatito-codev2

Juego educativo de programación con estética pixel-art. El jugador controla un personaje en un mapa de tiles, ejecutando secuencias de comandos (arriba, abajo, izquierda, derecha) para recolectar objetos. Y lo introducen a entender como funcionan los algoritmos de una forma mas didactica. 
Ademas Incluye un editor visual de niveles.

## Demo

<!-- Reemplazá la ruta por tu GIF una vez que lo grabes -->
![Demo del juego](public/assets/demo.gif)

## Documentacion

- Tecnica: [docs/documentacion-tecnica.md](docs/documentacion-tecnica.md)

## Stack

- [Phaser 3.80.1](https://phaser.io/) — cargado desde CDN, sin bundler
- ES Modules nativos del browser
- Sin dependencias de npm — no hay `package.json`
- Assets: [Sprout Lands](https://cup-nooble.itch.io/sprout-lands) (sprites, tilesets, UI)

## Levantar el proyecto

### Requisitos

- Node.js instalado (solo para el servidor estático)

### Pasos

```bash
# 1. Clonar o descargar el repositorio
git clone 'https://github.com/sanntzherrera1/GatitoCode.git'
cd gatito-codev2

# 2. Servir la carpeta public con cualquier servidor HTTP estático
npx serve public
# o también:
# npx http-server public -p 3000

# 3. Abrir en el browser
# http://localhost:3000
```

> **Por que un servidor?** Los ES Modules y la carga de assets requieren HTTP. Abrir `index.html` directo con `file://` no funciona.

### Alternativa con Python (sin Node)

```bash
cd public
python -m http.server 3000
# http://localhost:3000
```

## Estructura del proyecto

```
gatito-codev2/
└── public/
    ├── index.html              # Entrada principal, UI DOM (paneles, slots, dialogs)
    ├── src/
    │   ├── main.js             # Configuración Phaser + registro de escenas
    │   ├── level/
    │   │   └── TileLevel.js    # Sistema de tiles, tilesets, terrenos, objetos
    │   └── scenes/
    │       ├── BootScene.js    # Preload de todos los assets
    │       ├── MenuScene.js    # Menú principal
    │       ├── GymScene.js     # Nivel 1 (gym) — tutorial
    │       ├── MainScene.js    # Nivel 2 (main)
    │       ├── TileLevelScene.js # Clase base de niveles jugables
    │       └── EditorScene.js  # Editor visual de niveles
    ├── levels/
    │   ├── gym.json            # Datos del nivel Gym
    │   └── main.json           # Datos del nivel Main
    └── assets/
        ├── ui.json             # Manifest de texturas/animaciones UI
        ├── SproutLands-Sprites/ # Tilesets y sprites del personaje/objetos
        └── SproutLands-UI/     # Fuentes, botones, menús, dialogs
```

## Cómo jugar

1. Desde el menú elegir **Gym** (nivel tutorial) o **Main**
2. Arrastrar o clickear los botones de dirección (panel izquierdo) para llenar los slots del programa (panel derecho)
3. Presionar **Ejecutar** para que el personaje ejecute los movimientos en secuencia
4. Recolectar todos los items para completar el nivel
5. **Reiniciar** vuelve al personaje al punto de spawn

## Editor de niveles

Desde el menú: **Edit Gym** o **Edit Main**

| Tecla | Acción |
|-------|--------|
| `1` / `2` | Capa floor / walls |
| `E` | Eyedrop (copiar tile bajo el cursor) |
| `G` | Toggle grilla |
| `S` | Modo spawn (click para mover el punto de inicio) |
| `O` | Modo objeto (colocar/borrar objetos) |
| `P` | Play test desde el editor |
| `Ctrl+S` | Guardar (descarga JSON + persiste en localStorage) |
| `Ctrl+Z` / `Ctrl+Y` | Undo / Redo (50 snapshots) |
| `Esc` | Volver al menú |

Los niveles editados se persisten en `localStorage` del browser. Para exportar, usar `Ctrl+S` que descarga el JSON y reemplazar el archivo en `public/levels/`.

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
  ]
}
```

- `type: "pickup"` — objeto flotante, recolectable
- `type: "deco"` — sprite estático decorativo

## Tilesets y GIDs

| Tileset | firstGID |
|---------|----------|
| grass   | 1        |
| fences  | 100      |
| dirt    | 200      |
| hills   | 300      |
| water   | 400      |

Los terrenos usan autotile con bitmask de 4 vecinos (N=1, E=2, S=4, W=8).
