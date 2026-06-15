import { TILE } from '../main.js';
import { OBJECTS, getValidFrame } from '../engine/level/TileRegistry.js';

/**
 * Manages pickup sprites and collection mechanics.
 * Handles creation, detection, and animated removal of pickups.
 */
export class PickupManager {
    constructor(scene) {
        this.scene = scene;
        this.pickups = new Map(); // key: "tx,ty" => Phaser.Physics.Sprite
        this.collected = 0;
    }

    /**
     * Add a pickup sprite at tile position (tx, ty).
     * @param {number} tx - Tile X coordinate
     * @param {number} ty - Tile Y coordinate
     * @param {number} frame - Sprite frame index
     * @param {string} textureKey - Asset texture key (default: 'plants')
     * @param {boolean} force - Force add even if solid tile (default: false)
     */
    addPickup(tx, ty, frame, textureKey = 'plants', force = false) {
        if (!force && this.scene.solid[ty]?.[tx]) return;

        const objDef = OBJECTS.find(o => o.key === textureKey);
        const safeFrame = getValidFrame(objDef, frame);
        const [cx, cy] = this._tileCenter(tx, ty);
        const sprite = this.scene.add.sprite(cx, cy, textureKey, safeFrame).setDepth(50);

        // Float animation
        this.scene.tweens.add({
            targets: sprite,
            y: cy - 2,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.pickups.set(`${tx},${ty}`, sprite);
    }

    /**
     * Check for pickup collision at tile position.
     * Removes pickup and plays collection animation.
     * @param {number} tx - Tile X coordinate
     * @param {number} ty - Tile Y coordinate
     */
    checkPickup(tx, ty) {
        const key = `${tx},${ty}`;
        const sprite = this.pickups.get(key);
        if (!sprite) return;

        this.pickups.delete(key);
        this.scene.tweens.killTweensOf(sprite);

        // Fade out and scale up animation
        this.scene.tweens.add({
            targets: sprite,
            y: sprite.y - 14,
            scale: 1.8,
            alpha: 0,
            duration: 380,
            ease: 'Cubic.easeOut',
            onComplete: () => sprite.destroy(),
        });

        // Pulse ring effect
        const ring = this.scene.add
            .circle(sprite.x, sprite.y, 4, 0xffffff, 0)
            .setStrokeStyle(2, 0xffee88)
            .setDepth(60);
        this.scene.tweens.add({
            targets: ring,
            scale: 3,
            alpha: { from: 1, to: 0 },
            duration: 380,
            ease: 'Cubic.easeOut',
            onComplete: () => ring.destroy(),
        });

        // "+1" floating text
        const txt = this.scene.add.text(sprite.x, sprite.y - 6, '+1', {
            fontFamily: 'monospace',
            fontSize: '9px',
            color: '#ffee88',
            stroke: '#000',
            strokeThickness: 2,
        }).setOrigin(0.5).setDepth(61);

        this.scene.tweens.add({
            targets: txt,
            y: txt.y - 16,
            alpha: 0,
            duration: 500,
            ease: 'Cubic.easeOut',
            onComplete: () => txt.destroy(),
        });

        this.collected++;
    }

    /**
     * Get total pickups (collected + remaining).
     * @returns {number}
     */
    getTotalPickups() {
        return this.collected + this.pickups.size;
    }

    /**
     * Get collected pickup count.
     * @returns {number}
     */
    getCollected() {
        return this.collected;
    }

    /**
     * Get remaining pickup count.
     * @returns {number}
     */
    getRemaining() {
        return this.pickups.size;
    }

    /**
     * Reset manager state (for level restart).
     */
    reset() {
        // Kill all tween animations
        for (const sprite of this.pickups.values()) {
            this.scene.tweens.killTweensOf(sprite);
            sprite.destroy();
        }
        this.pickups.clear();
        this.collected = 0;
    }

    // Private helper
    _tileCenter(tx, ty) {
        return [tx * TILE + TILE / 2, ty * TILE + TILE / 2];
    }
}
