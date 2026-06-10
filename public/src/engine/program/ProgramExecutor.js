/**
 * Motor de ejecucion de programas: interpreta y ejecuta secuencias de comandos.
 * No depende de Phaser para poder probarse y reutilizarse.
 */

import { DIRS } from '../../config/game.js';

/**
 * Ejecuta un programa.
 *
 * @param {Array<string>} moves - Comandos: 'up', 'down', 'left', 'right', 'jump', 'jump_<dir>', 'func1', 'if-rock-jump'
 * @param {Object} context - Contexto con acciones del nivel.
 * @param {Object} state - Estado global opcional, por ejemplo queueFunc1.
 */
export async function executeProgram(moves, context, state = {}) {
    const bus = state || window.__GYM || {};

    await ejecutarComandos(moves, context, bus);

    if (context.onComplete) {
        context.onComplete();
    }
}

async function ejecutarComandos(moves, context, bus) {
    for (const comando of moves) {
        if (comando === 'func1' && bus?.queueFunc1) {
            await ejecutarComandos(bus.queueFunc1.slice(), context, bus);
        } else if (comando === 'if-rock-jump') {
            const direccion = context.obtenerDireccion?.() || 'down';

            if (context.hayRocaAdelante?.(direccion)) {
                await context.jumpDir(direccion);
            } else {
                await context.step(direccion);
            }
        } else if (comando === 'jump') {
            await context.jumpInPlace();
        } else if (typeof comando === 'string' && comando.startsWith('jump_')) {
            await context.jumpDir(comando.slice('jump_'.length));
        } else if (DIRS[comando]) {
            await ejecutarMovimiento(comando, context, bus);
        }
    }
}

async function ejecutarMovimiento(direccion, context, bus) {
    const reglaAutomatica = bus?.queueIfRock?.[0] || '';

    if (reglaAutomatica === 'if-rock-jump' && context.hayRocaAdelante?.(direccion)) {
        await context.jumpDir(direccion);
        return;
    }

    if (reglaAutomatica === 'if-navigate' && context.estaBloqueado?.(direccion)) {
        await ejecutarRodeo(direccion, context);
        return;
    }

    await context.step(direccion);
}

async function ejecutarRodeo(direccion, context) {
    const izquierda = obtenerDireccionIzquierda(direccion);
    const derecha = obtenerDireccionDerecha(direccion);

    if (!context.estaBloqueado?.(izquierda)) {
        await context.step(izquierda);
        return;
    }

    if (!context.estaBloqueado?.(derecha)) {
        await context.step(derecha);
        return;
    }

    await context.step(direccion);
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
