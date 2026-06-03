import { OBJECTS } from './TileRegistry.js';

/**
 * Registro de animaciones para objetos del mundo.
 * Cada textureKey mapea a un objeto de animaciones.
 * 'frames' puede ser un array de indices o la cadena 'all'.
 */
export const OBJECT_ANIMATIONS = {
  door_animation: {
    idle: { frames: [5], frameRate: 1, repeat: 0 },
    open: { frames: [5,4,3,2,1,0], frameRate: 12, repeat: 0 },
    close: { frames: [0,1,2,3,4,5], frameRate: 12, repeat: 0 }
  },
  fire_animation: {
    idle: { frames: 'all', frameRate: 10, repeat: -1 }
  },
  bat_animations: {
    idle: { frames: [0,1,2,3,4], frameRate: 6, repeat: -1 }
  },
  small_bat_animations: {
    idle: { frames: [0,1,2,3,4], frameRate: 6, repeat: -1 }
  },
  boats: {
    idle_moored: { frames: [0,1], frameRate: 1, repeat: -1 },
    idle_free:   { frames: [3,4], frameRate: 1, repeat: -1 },
  },
  chicken_brown: {
    idle:   { frames: [8,9,10,11,12,14,14,14], frameRate: 1, repeat: -1 },
    walk:   { frames: [16,17,18,19,20,21,22,23], frameRate: 5, repeat: -1 },
    tired:  { frames: [24,25,26,27,28,29,30,32,33,34,35,36,37,38,40,41,42,43,44,45,46,48,49,50,51,52,53,54,56,57,58,59,60], frameRate: 4, repeat: -1 },
    tired2: { frames: [64,65,66,67,72,73,74,75,76], frameRate: 4, repeat: -1 },
    sleep:  { frames: [80,81,82,83], frameRate: 3, repeat: -1 },
    eat:    { frames: [88,89,90,91,92,93,96,97], frameRate: 4, repeat: -1 },
  },
  chicken: {
    idle:   { frames: [8,9,10,11,12,14,14,14], frameRate: 1, repeat: -1 },
    walk:   { frames: [16,17,18,19,20,21,22,23], frameRate: 5, repeat: -1 },
    tired:  { frames: [24,25,26,27,28,29,30,32,33,34,35,36,37,38,40,41,42,43,44,45,46,48,49,50,51,52,53,54,56,57,58,59,60], frameRate: 4, repeat: -1 },
    tired2: { frames: [64,65,66,67,72,73,74,75,76], frameRate: 4, repeat: -1 },
    sleep:  { frames: [80,81,82,83], frameRate: 3, repeat: -1 },
    eat:    { frames: [88,89,90,91,92,93,96,97], frameRate: 4, repeat: -1 },
  },
  chicken_blue: {
    idle:   { frames: [8,9,10,11,12,14,14,14], frameRate: 1, repeat: -1 },
    walk:   { frames: [16,17,18,19,20,21,22,23], frameRate: 5, repeat: -1 },
    tired:  { frames: [24,25,26,27,28,29,30,32,33,34,35,36,37,38,40,41,42,43,44,45,46,48,49,50,51,52,53,54,56,57,58,59,60], frameRate: 4, repeat: -1 },
    tired2: { frames: [64,65,66,67,72,73,74,75,76], frameRate: 4, repeat: -1 },
    sleep:  { frames: [80,81,82,83], frameRate: 3, repeat: -1 },
    eat:    { frames: [88,89,90,91,92,93,96,97], frameRate: 4, repeat: -1 },
  },
  chicken_green: {
    idle:   { frames: [8,9,10,11,12,14,14,14], frameRate: 1, repeat: -1 },
    walk:   { frames: [16,17,18,19,20,21,22,23], frameRate: 5, repeat: -1 },
    tired:  { frames: [24,25,26,27,28,29,30,32,33,34,35,36,37,38,40,41,42,43,44,45,46,48,49,50,51,52,53,54,56,57,58,59,60], frameRate: 4, repeat: -1 },
    tired2: { frames: [64,65,66,67,72,73,74,75,76], frameRate: 4, repeat: -1 },
    sleep:  { frames: [80,81,82,83], frameRate: 3, repeat: -1 },
    eat:    { frames: [88,89,90,91,92,93,96,97], frameRate: 4, repeat: -1 },
  },
  chicken_red: {
    idle:   { frames: [8,9,10,11,12,14,14,14], frameRate: 1, repeat: -1 },
    walk:   { frames: [16,17,18,19,20,21,22,23], frameRate: 5, repeat: -1 },
    tired:  { frames: [24,25,26,27,28,29,30,32,33,34,35,36,37,38,40,41,42,43,44,45,46,48,49,50,51,52,53,54,56,57,58,59,60], frameRate: 4, repeat: -1 },
    tired2: { frames: [64,65,66,67,72,73,74,75,76], frameRate: 4, repeat: -1 },
    sleep:  { frames: [80,81,82,83], frameRate: 3, repeat: -1 },
    eat:    { frames: [88,89,90,91,92,93,96,97], frameRate: 4, repeat: -1 },
  },
  chicken_baby: {
    idle:   { frames: [8,9,10,11,12,14,14,14], frameRate: 1, repeat: -1 },
    walk:   { frames: [16,17,18,19,20,21,22,23], frameRate: 5, repeat: -1 },
    tired:  { frames: [24,25,26,27,28,29,30,32,33,34,35,36,37,38,40,41,42,43,44,45,46,48,49,50,51,52,53,54,56,57,58,59,60], frameRate: 4, repeat: -1 },
    tired2: { frames: [64,65,66,67,72,73,74,75,76], frameRate: 4, repeat: -1 },
    sleep:  { frames: [80,81,82,83], frameRate: 3, repeat: -1 },
    eat:    { frames: [88,89,90,91,92,93,96,97], frameRate: 4, repeat: -1 },
  },
  chicken_baby_blue: {
    idle:   { frames: [8,9,10,11,12,14,14,14], frameRate: 1, repeat: -1 },
    walk:   { frames: [16,17,18,19,20,21,22,23], frameRate: 5, repeat: -1 },
    tired:  { frames: [24,25,26,27,28,29,30,32,33,34,35,36,37,38,40,41,42,43,44,45,46,48,49,50,51,52,53,54,56,57,58,59,60], frameRate: 4, repeat: -1 },
    tired2: { frames: [64,65,66,67,72,73,74,75,76], frameRate: 4, repeat: -1 },
    sleep:  { frames: [80,81,82,83], frameRate: 3, repeat: -1 },
    eat:    { frames: [88,89,90,91,92,93,96,97], frameRate: 4, repeat: -1 },
  },
  chicken_baby_brown: {
    idle:   { frames: [8,9,10,11,12,14,14,14], frameRate: 1, repeat: -1 },
    walk:   { frames: [16,17,18,19,20,21,22,23], frameRate: 5, repeat: -1 },
    tired:  { frames: [24,25,26,27,28,29,30,32,33,34,35,36,37,38,40,41,42,43,44,45,46,48,49,50,51,52,53,54,56,57,58,59,60], frameRate: 4, repeat: -1 },
    tired2: { frames: [64,65,66,67,72,73,74,75,76], frameRate: 4, repeat: -1 },
    sleep:  { frames: [80,81,82,83], frameRate: 3, repeat: -1 },
    eat:    { frames: [88,89,90,91,92,93,96,97], frameRate: 4, repeat: -1 },
  },
  chicken_baby_green: {
    idle:   { frames: [8,9,10,11,12,14,14,14], frameRate: 1, repeat: -1 },
    walk:   { frames: [16,17,18,19,20,21,22,23], frameRate: 5, repeat: -1 },
    tired:  { frames: [24,25,26,27,28,29,30,32,33,34,35,36,37,38,40,41,42,43,44,45,46,48,49,50,51,52,53,54,56,57,58,59,60], frameRate: 4, repeat: -1 },
    tired2: { frames: [64,65,66,67,72,73,74,75,76], frameRate: 4, repeat: -1 },
    sleep:  { frames: [80,81,82,83], frameRate: 3, repeat: -1 },
    eat:    { frames: [88,89,90,91,92,93,96,97], frameRate: 4, repeat: -1 },
  },
  chicken_baby_red: {
    idle:   { frames: [8,9,10,11,12,14,14,14], frameRate: 1, repeat: -1 },
    walk:   { frames: [16,17,18,19,20,21,22,23], frameRate: 5, repeat: -1 },
    tired:  { frames: [24,25,26,27,28,29,30,32,33,34,35,36,37,38,40,41,42,43,44,45,46,48,49,50,51,52,53,54,56,57,58,59,60], frameRate: 4, repeat: -1 },
    tired2: { frames: [64,65,66,67,72,73,74,75,76], frameRate: 4, repeat: -1 },
    sleep:  { frames: [80,81,82,83], frameRate: 3, repeat: -1 },
    eat:    { frames: [88,89,90,91,92,93,96,97], frameRate: 4, repeat: -1 },
  },
};

/**
 * Crea todas las animaciones de objetos en el AnimationManager de la escena.
 * Las keys resultantes son `${textureKey}_${animName}`.
 */
export function createObjectAnimations(scene) {
  for (const [textureKey, anims] of Object.entries(OBJECT_ANIMATIONS)) {
    if (!scene.textures.exists(textureKey)) continue;

    for (const [animName, config] of Object.entries(anims)) {
      const animKey = `${textureKey}_${animName}`;
      if (scene.anims.exists(animKey)) continue;

      let frames;
      if (config.frames === 'all') {
        frames = scene.anims.generateFrameNumbers(textureKey);
      } else {
        frames = scene.anims.generateFrameNumbers(textureKey, { frames: config.frames });
      }

      scene.anims.create({
        key: animKey,
        frames,
        frameRate: config.frameRate,
        repeat: config.repeat,
      });
    }
  }
}
