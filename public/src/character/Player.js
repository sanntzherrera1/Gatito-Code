/**
 * Player domain logic — pure movement state, collision detection, no rendering.
 * Decoupled from Phaser to enable testing and reuse.
 */

export const DIRS = {
    up: { dx: 0, dy: -1 },
    down: { dx: 0, dy: 1 },
    left: { dx: -1, dy: 0 },
    right: { dx: 1, dy: 0 },
};

export class Player {
    constructor(cols, rows, solid, spawnTx, spawnTy) {
        this.cols = cols;
        this.rows = rows;
        this.solid = solid;
        this.spawnTx = spawnTx;
        this.spawnTy = spawnTy;

        this.tx = spawnTx;
        this.ty = spawnTy;
        this.facing = 'down';
    }

    /**
     * Check if a tile is within bounds and not solid.
     */
    canEnter(tx, ty) {
        return tx >= 0 && ty >= 0 &&
            tx < this.cols &&
            ty < this.rows &&
            !this.solid[ty][tx];
    }

    /**
     * Attempt movement in a direction.
     * Returns { success: bool, tx, ty, facing: string }
     */
    tryMove(dir) {
        const delta = DIRS[dir];
        if (!delta) return { success: false, tx: this.tx, ty: this.ty, facing: this.facing };

        const { dx, dy } = delta;
        const nx = this.tx + dx;
        const ny = this.ty + dy;

        if (!this.canEnter(nx, ny)) {
            return { success: false, tx: this.tx, ty: this.ty, facing: dir };
        }

        this.tx = nx;
        this.ty = ny;
        this.facing = dir;
        return { success: true, tx: this.tx, ty: this.ty, facing: this.facing };
    }

    /**
     * Attempt jump in a direction (jump 2 tiles over 1 solid tile).
     * Returns { success: bool, fromTx, fromTy, toTx, toTy, facing: string }
     */
    tryJump(dir) {
        const delta = DIRS[dir];
        if (!delta) {
            // Jump in place
            return { success: true, fromTx: this.tx, fromTy: this.ty, toTx: this.tx, toTy: this.ty, facing: this.facing };
        }

        const { dx, dy } = delta;
        const nx = this.tx + dx;
        const ny = this.ty + dy;
        const lx = this.tx + dx * 2;
        const ly = this.ty + dy * 2;

        // Can jump 2 tiles, even if the middle tile is solid
        if (!this.canEnter(lx, ly)) {
            // Can't land there, stay in place
            return { success: false, fromTx: this.tx, fromTy: this.ty, toTx: this.tx, toTy: this.ty, facing: dir };
        }

        const fromTx = this.tx;
        const fromTy = this.ty;
        this.tx = lx;
        this.ty = ly;
        this.facing = dir;
        return { success: true, fromTx, fromTy, toTx: this.tx, toTy: this.ty, facing: this.facing };
    }

    /**
     * Jump in place (no directional movement).
     * Returns { success: true, fromTx, fromTy, toTx, toTy, facing: string }
     */
    jumpInPlace() {
        return { success: true, fromTx: this.tx, fromTy: this.ty, toTx: this.tx, toTy: this.ty, facing: this.facing };
    }

    /**
     * Reset to spawn position.
     */
    reset() {
        this.tx = this.spawnTx;
        this.ty = this.spawnTy;
        this.facing = 'down';
    }

    /**
     * Get animation frame indices for a direction.
     * Used by Phaser scene for sprite frame selection.
     */
    static getBaseFrameForDir(dir) {
        if (dir === 'up') return 4;
        if (dir === 'left') return 8;
        if (dir === 'right') return 12;
        return 0; // down
    }

    static getIdleFrameForDir(dir) {
        return Player.getBaseFrameForDir(dir);
    }

    static getJumpFramesForDir(dir) {
        const base = Player.getBaseFrameForDir(dir);
        return [base + 1, base + 2];
    }
}
