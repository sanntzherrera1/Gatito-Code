import { TileLevelScene } from '../scenes/TileLevelScene.js';

export class MainScene extends TileLevelScene {
  constructor() {
    super('Main');
    this.levelKey = 'main';
    this.missionText = 'Misión: Recolecta todos los plantines usando comandos de movimiento.';
  }

  decorate() {
    this.addPickup(2,  1,  5);
    this.addPickup(8,  1,  11);
    this.addPickup(13, 1,  5);
    this.addPickup(6,  5,  11);
    this.addPickup(2,  9,  11);
    this.addPickup(13, 9,  5);
  }
}
