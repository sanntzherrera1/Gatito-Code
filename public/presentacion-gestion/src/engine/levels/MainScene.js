import { TileLevelScene } from '../scenes/TileLevelScene.js';

export class MainScene extends TileLevelScene {
  constructor() {
    super('Main');
    this.levelKey = 'main';
    this.missionText = 'Mision: Recolecta todos los plantines usando comandos de movimiento.';
  }
}
