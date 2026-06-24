/**
 * Level domain model — grid geometry, solids, spawn and objects.
 * Pure data, no Phaser dependency.
 */
export class Level {
    constructor(cols, rows, solid, spawn, objects = [], weather = null, rocks = [], trees = []) {
        this.cols = cols;
        this.rows = rows;
        this.solid = solid;      // boolean[][]
        this.spawn = spawn;      // { tx, ty }
        this.objects = objects;  // Array<{tx, ty, key, frame, type}>
        this.weather = weather;
        this.rocks = rocks;      // boolean[][]
        this.trees = trees;      // boolean[][]
    }

    isSolid(tx, ty) {
        return tx < 0 || ty < 0 || tx >= this.cols || ty >= this.rows || this.solid[ty][tx];
    }

    isRock(tx, ty) {
        if (tx < 0 || ty < 0 || tx >= this.cols || ty >= this.rows) return false;
        return this.rocks[ty] ? this.rocks[ty][tx] : false;
    }

    isTree(tx, ty) {
        if (tx < 0 || ty < 0 || tx >= this.cols || ty >= this.rows) return false;
        return this.trees[ty] ? this.trees[ty][tx] : false;
    }
}
