/**
 * Motor de ejecucion de programas: interpreta y ejecuta secuencias de comandos.
 * No depende de Phaser para poder probarse y reutilizarse.
 */

import { DIRS } from '../../config/game.js';

/**
 * Ejecuta un programa.
 *
 * @param {Array<string>} moves - Comandos: 'up', 'down', 'left', 'right', 'jump', 'jump_<dir>', 'func1', 'for'
 * @param {Object} context - Contexto con acciones del nivel.
 * @param {Object} state - Estado global opcional.
 */
export async function executeProgram(moves, context, state = {}) {
  const bus = state || globalThis.window?.__GYM || {};

  await ejecutarComandos(moves, context, bus, 0);

  context.onComplete?.();
}

async function ejecutarComandos(moves, context, bus, profundidad = 0) {
  if (profundidad > 8) return;

  for (const comando of moves) {
    if (comando === 'func1' && bus?.queueFunc1) {
      await ejecutarComandos(bus.queueFunc1.slice(), context, bus, profundidad + 1);
    } else if (comando === 'for' && bus?.queueFor) {
      await ejecutarFor(context, bus, profundidad + 1);
    } else if (comando === 'if-rock-jump') {
      const direccion = context.obtenerDireccion?.() || 'down';
      await ejecutarMovimiento(direccion, context, {
        ifCondition: 'rock-ahead',
        ifAction: 'jump',
      });
    } else if (comando === 'if-navigate') {
      const direccion = context.obtenerDireccion?.() || 'down';
      await ejecutarMovimiento(direccion, context, {
        ifCondition: 'blocked-ahead',
        ifAction: 'navigate',
      });
    } else if (comando === 'jump') {
      await context.jumpInPlace();
    } else if (typeof comando === 'string' && comando.startsWith('jump_')) {
      await context.jumpDir(comando.slice('jump_'.length));
    } else if (DIRS[comando]) {
      await ejecutarMovimiento(comando, context, bus);
    }
  }
}

async function ejecutarFor(context, bus, profundidad) {
  const repeticiones = normalizarRepeticiones(bus?.forCount);
  const comandos = bus.queueFor.slice();

  for (let i = 0; i < repeticiones; i += 1) {
    await ejecutarComandos(comandos, context, bus, profundidad);
  }
}

function normalizarRepeticiones(valor) {
  const numero = Number.parseInt(valor, 10);
  if (!Number.isFinite(numero)) return 2;
  return Math.min(Math.max(numero, 1), 9);
}

async function ejecutarMovimiento(direccion, context, bus) {
  // Se evalúan las reglas IF en orden; dispara la primera que coincide (if / else-if).
  // Como una casilla nunca es roca y árbol a la vez, no hay conflicto.
  const reglas = obtenerReglasIf(bus);

  for (const regla of reglas) {
    if (debeAplicarIf(direccion, context, regla)) {
      await ejecutarAccionIf(direccion, context, regla.action);
      return;
    }
  }

  await context.step(direccion);
}

function obtenerReglasIf(bus) {
  // Compat: regla vieja embebida como token.
  const reglaVieja = bus?.queueIfRock?.[0] || '';
  if (reglaVieja === 'if-rock-jump') {
    return [{ condition: 'rock-ahead', action: 'jump' }];
  }
  if (reglaVieja === 'if-navigate') {
    return [{ condition: 'blocked-ahead', action: 'navigate' }];
  }

  const reglas = [];
  if (bus?.ifCondition && bus?.ifAction) {
    reglas.push({ condition: bus.ifCondition, action: bus.ifAction });
  }
  if (bus?.ifCondition2 && bus?.ifAction2) {
    reglas.push({ condition: bus.ifCondition2, action: bus.ifAction2 });
  }
  return reglas;
}

function debeAplicarIf(direccion, context, regla) {
  if (!regla.condition || !regla.action) return false;

  if (regla.condition === 'rock-ahead') {
    return !!context.hayRocaAdelante?.(direccion);
  }

  if (regla.condition === 'blocked-ahead') {
    return !!context.estaBloqueado?.(direccion);
  }

  if (regla.condition === 'tree-ahead') {
    return !!context.hayArbolAdelante?.(direccion);
  }

  return false;
}

async function ejecutarAccionIf(direccion, context, action) {
  if (action === 'jump') {
    await context.jumpDir(direccion);
    return;
  }

  if (action === 'navigate') {
    await ejecutarRodeo(direccion, context);
    return;
  }

  if (action === 'cut') {
    await context.cutDir(direccion);
    return;
  }

  await context.step(direccion);
}

async function ejecutarRodeo(direccion, context) {
  const rodeos = [
    construirRodeo(direccion, obtenerDireccionDerecha(direccion)),
    construirRodeo(direccion, obtenerDireccionIzquierda(direccion)),
  ];

  for (const rodeo of rodeos) {
    if (await ejecutarSecuenciaSiPuede(rodeo, context)) {
      return;
    }
  }

  await context.step(direccion);
}

function construirRodeo(direccion, lateral) {
  return [
    lateral,
    direccion,
    direccion,
    obtenerDireccionOpuesta(lateral),
  ];
}

async function ejecutarSecuenciaSiPuede(secuencia, context) {
  for (const paso of secuencia) {
    if (context.estaBloqueado?.(paso)) return false;
    await context.step(paso);
  }
  return true;
}

function obtenerDireccionIzquierda(direccion) {
  const mapa = {
    up: 'left',
    left: 'down',
    down: 'right',
    right: 'up',
  };
  return mapa[direccion] || direccion;
}

function obtenerDireccionDerecha(direccion) {
  const mapa = {
    up: 'right',
    right: 'down',
    down: 'left',
    left: 'up',
  };
  return mapa[direccion] || direccion;
}

function obtenerDireccionOpuesta(direccion) {
  const mapa = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left',
  };
  return mapa[direccion] || direccion;
}
