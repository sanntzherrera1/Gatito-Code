import { describe, it, expect } from 'vitest';
import { Player } from '../public/src/domain/Player.js';
import { Level } from '../public/src/domain/Level.js';

// ============================================================
//  Helper: construye una matriz de solidos 5×5 con una pared
//  en el centro (2,2) y el resto libre.
// ============================================================
function makeSolid5x5(wallX = 2, wallY = 2) {
  return Array.from({ length: 5 }, (_, y) =>
    Array.from({ length: 5 }, (_, x) => x === wallX && y === wallY)
  );
}

// ============================================================
//  SUITE 1: domain/Player.js
//  Navegación y colisiones del jugador
// ============================================================
describe('domain/Player.js — Navegacion y colisiones del jugador', () => {

  it('El jugador puede moverse libremente por casillas vacias en las 4 direcciones cardinales', () => {
    // Iniciamos en (3,3); la pared está en (2,2), así que tenemos espacio libre alrededor
    const player = new Player(5, 5, makeSolid5x5(), 3, 3);

    // Arriba  -> (3,2)
    let r = player.tryMove('up');
    expect(r.success).toBe(true);
    expect(r.tx).toBe(3);
    expect(r.ty).toBe(2);

    // Izquierda -> (2,2) … es pared, así que probamos otra ruta libre:
    // Nos movemos arriba de nuevo -> (3,1)
    r = player.tryMove('up');
    expect(r.success).toBe(true);
    expect(r.tx).toBe(3);
    expect(r.ty).toBe(1);

    // Izquierda -> (2,1)
    r = player.tryMove('left');
    expect(r.success).toBe(true);
    expect(r.tx).toBe(2);
    expect(r.ty).toBe(1);

    // Abajo -> (2,2) es pared, probamos desde (2,1) hacia abajo no funciona,
    // así que movemos izquierda -> (1,1) y luego abajo -> (1,2)
    r = player.tryMove('left');
    expect(r.success).toBe(true);
    expect(r.tx).toBe(1);
    expect(r.ty).toBe(1);

    r = player.tryMove('down');
    expect(r.success).toBe(true);
    expect(r.tx).toBe(1);
    expect(r.ty).toBe(2);
  });

  it('El jugador NO puede atravesar casillas solidas (paredes)', () => {
    // Jugador en (1,2), pared en (2,2)
    const player = new Player(5, 5, makeSolid5x5(2, 2), 1, 2);
    const before = { tx: player.tx, ty: player.ty };

    const r = player.tryMove('right');
    expect(r.success).toBe(false);
    expect(r.tx).toBe(before.tx);
    expect(r.ty).toBe(before.ty);
  });

  it('El jugador NO puede salirse de los limites del mapa', () => {
    // Esquina superior izquierda (0,0)
    const player = new Player(5, 5, makeSolid5x5(), 0, 0);

    expect(player.tryMove('up').success).toBe(false);
    expect(player.tryMove('left').success).toBe(false);

    // Esquina inferior derecha (4,4)
    player.tx = 4;
    player.ty = 4;
    expect(player.tryMove('down').success).toBe(false);
    expect(player.tryMove('right').success).toBe(false);
  });

  it('El jugador puede saltar 2 casillas, atravesando 1 casilla solida intermedia', () => {
    // Jugador en (0,2), pared en (1,2), destino libre en (2,2)
    const solid = Array.from({ length: 5 }, (_, y) =>
      Array.from({ length: 5 }, (_, x) => x === 1 && y === 2)
    );
    const player = new Player(5, 5, solid, 0, 2);

    const r = player.tryJump('right');
    expect(r.success).toBe(true);
    expect(r.toTx).toBe(2);
    expect(r.toTy).toBe(2);
  });

  it('El jugador NO puede saltar si la casilla de aterrizaje esta fuera del mapa', () => {
    // Jugador en (4,2), salto a la derecha iría a (6,2) → fuera del mapa 5×5
    const player = new Player(5, 5, makeSolid5x5(), 4, 2);
    const before = { tx: player.tx, ty: player.ty };

    const r = player.tryJump('right');
    expect(r.success).toBe(false);
    expect(player.tx).toBe(before.tx);
    expect(player.ty).toBe(before.ty);
  });

  it('El jugador vuelve exactamente a su posicion de spawn al reiniciar', () => {
    const player = new Player(5, 5, makeSolid5x5(), 0, 0);

    // Moverlo varias veces por casillas libres (evitando la pared en 2,2)
    player.tryMove('right'); // (1,0)
    player.tryMove('down');  // (1,1)
    player.tryMove('right'); // (2,1)
    expect(player.tx).not.toBe(player.spawnTx);
    expect(player.ty).not.toBe(player.spawnTy);

    player.reset();
    expect(player.tx).toBe(player.spawnTx);
    expect(player.ty).toBe(player.spawnTy);
    expect(player.facing).toBe('down');
  });
});

// ============================================================
//  SUITE 2: domain/Level.js
//  Geometria de la grilla del mapa
// ============================================================
describe('domain/Level.js — Geometria de la grilla del mapa', () => {

  // Mapa 16×12 con paredes en los bordes (muro perimetral)
  function makeBorderedMap(cols = 16, rows = 12) {
    const solid = Array.from({ length: rows }, (_, y) =>
      Array.from({ length: cols }, (_, x) =>
        x === 0 || x === cols - 1 || y === 0 || y === rows - 1
      )
    );
    const objects = [
      { tx: 2, ty: 2, key: 'plants', frame: 5, type: 'pickup' },
      { tx: 5, ty: 3, key: 'grass_props', frame: 0, type: 'deco' },
    ];
    return new Level(cols, rows, solid, { tx: 8, ty: 6 }, objects, null);
  }

  it('Se crea un nivel con dimensiones 16x12, spawn en (8,6) y objetos correctamente registrados', () => {
    const level = makeBorderedMap();

    expect(level.cols).toBe(16);
    expect(level.rows).toBe(12);
    expect(level.spawn).toEqual({ tx: 8, ty: 6 });
    expect(level.objects).toHaveLength(2);
    expect(level.objects[0].type).toBe('pickup');
    expect(level.objects[1].type).toBe('deco');
  });

  it('isSolid() detecta correctamente las casillas marcadas como paredes', () => {
    const level = makeBorderedMap();

    // Borde superior
    expect(level.isSolid(5, 0)).toBe(true);
    // Borde izquierdo
    expect(level.isSolid(0, 5)).toBe(true);
    // Borde inferior
    expect(level.isSolid(10, 11)).toBe(true);
    // Borde derecho
    expect(level.isSolid(15, 7)).toBe(true);
  });

  it('isSolid() devuelve true para coordenadas fuera de los limites del mapa', () => {
    const level = makeBorderedMap();

    expect(level.isSolid(-1, 5)).toBe(true);
    expect(level.isSolid(5, -1)).toBe(true);
    expect(level.isSolid(16, 5)).toBe(true);
    expect(level.isSolid(5, 12)).toBe(true);
  });

  it('isSolid() devuelve false para casillas de piso sin paredes', () => {
    const level = makeBorderedMap();

    // Centro del mapa (lejos de los bordes)
    expect(level.isSolid(8, 6)).toBe(false);
    expect(level.isSolid(3, 3)).toBe(false);
    expect(level.isSolid(10, 10)).toBe(false);
  });

  it('El nivel registra correctamente los objetos de recoleccion con su posicion y tipo', () => {
    const objects = [
      { tx: 2, ty: 2, key: 'plants', frame: 5, type: 'pickup' },
      { tx: 5, ty: 3, key: 'grass_props', frame: 0, type: 'deco' },
      { tx: 10, ty: 8, key: 'mushrooms', frame: 3, type: 'pickup' },
    ];
    const level = new Level(16, 12, makeBorderedMap().solid, { tx: 8, ty: 6 }, objects);

    expect(level.objects).toHaveLength(3);

    const pickups = level.objects.filter(o => o.type === 'pickup');
    expect(pickups).toHaveLength(2);
    expect(pickups[0]).toMatchObject({ tx: 2, ty: 2, key: 'plants' });
    expect(pickups[1]).toMatchObject({ tx: 10, ty: 8, key: 'mushrooms' });

    const decos = level.objects.filter(o => o.type === 'deco');
    expect(decos).toHaveLength(1);
    expect(decos[0]).toMatchObject({ tx: 5, ty: 3, key: 'grass_props' });
  });
});
