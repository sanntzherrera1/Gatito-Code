## 1. Add sub-frame registration for tileset textures

- [x] 1.1 En `public/src/engine/level/TileRegistry.js`, agregar e importar `TILE` desde `../../config/game.js` (ya está importado en el archivo, confirmar) y exportar una nueva función `defineTileFrames(scene)` que itere `TILESETS`, obtenga la textura con `scene.textures.get(t.key)` y, para cada celda `(col, row)` del tileset, llame `tex.add(String(idx), 0, col * TILE, row * TILE, TILE, TILE)` con `idx = row * t.cols + col`, saltando si la textura es null o el frame ya existe (`if (!tex.has(String(idx)))`).

## 2. Wire it into BootScene

- [x] 2.1 En `public/src/engine/scenes/BootScene.js`, agregar `defineTileFrames` a los imports desde `../../engine/level/TileRegistry.js` y llamar `defineTileFrames(this);` dentro de `create()`, justo después del loop de sub-frames de OBJECTS (líneas 90-99) y antes de `createObjectAnimations(this);`.

## 3. Verificación manual

- [ ] 3.1 Abrir el editor con `npm start`, seleccionar un tile específico (p. ej. `Grass -> Verde -> GID 13`) y mover el cursor sobre el mapa: el fantasma debe mostrar **solo** el tile GID 13 (16×16) y no la paleta entera del tileset. La consola no debe registrar `__MISSING`.
- [ ] 3.2 Click + drag sobre un tile existente del mapa: el ghost de drag debe mostrar el tile arrastrado, no toda la imagen.
- [ ] 3.3 Click izquierdo corto sobre un tile ya colocado: el HUD debe pasar a "pegar tile GID X" con el GID correcto y el ghost debe mostrar el mismo tile puntual.
- [ ] 3.4 Repetir 3.1 con al menos 2 tilesets de categorías distintas (p. ej. `Soil -> Dirt` y `Buildings -> Wooden House`) para confirmar que aplica a todos.
- [ ] 3.5 Cargar un nivel (p. ej. `gym`) en el editor y confirmar que el render de los layers del mapa **no cambió** (los tiles siguen viendose correctamente en el mapa, no se introdujeron glitches visuales por los sub-frames extra).
- [ ] 3.6 Jugar el nivel con `P` desde el editor y confirmar que el render del runtime sigue igual que antes.
