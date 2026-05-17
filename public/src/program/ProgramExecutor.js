/**
 * Program execution engine — interprets and executes command sequences.
 * Decoupled from Phaser to enable testing and reuse.
 */

export const DIRS = {
    up: { dx: 0, dy: -1 },
    down: { dx: 0, dy: 1 },
    left: { dx: -1, dy: 0 },
    right: { dx: 1, dy: 0 },
};

/**
 * Execute a program (sequence of commands).
 * 
 * @param {Array<string>} moves - Command sequence: 'up', 'down', 'left', 'right', 'jump', 'jump_<dir>', 'func1'
 * @param {Object} context - Action context with methods:
 *   - step(dir): Promise<void>
 *   - jumpInPlace(): Promise<void>
 *   - jumpDir(dir): Promise<void>
 *   - onComplete(facing): void - called after all moves finish
 * @param {Object} state - Global state object:
 *   - queueFunc1?: Array<string> - Function 1 command queue
 */
export async function executeProgram(moves, context, state = {}) {
    const bus = state || window.__GYM || {};

    for (const dir of moves) {
        // Función 1: ejecutar cola secundaria
        if (dir === 'func1' && bus?.queueFunc1) {
            for (const fdir of bus.queueFunc1) {
                if (fdir === 'jump') {
                    await context.jumpInPlace();
                } else if (typeof fdir === 'string' && fdir.startsWith('jump_')) {
                    await context.jumpDir(fdir.slice('jump_'.length));
                } else if (DIRS[fdir]) {
                    await context.step(fdir);
                }
            }
        }
        // Salto sin dirección
        else if (dir === 'jump') {
            await context.jumpInPlace();
        }
        // Salto con dirección
        else if (typeof dir === 'string' && dir.startsWith('jump_')) {
            await context.jumpDir(dir.slice('jump_'.length));
        }
        // Movimiento direccional
        else if (DIRS[dir]) {
            await context.step(dir);
        }
    }

    // Notificar que el programa terminó
    if (context.onComplete) {
        context.onComplete();
    }
}
