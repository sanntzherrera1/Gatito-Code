import { TileLevelScene } from '../scenes/TileLevelScene.js';

export class Nivel3Scene extends TileLevelScene {
  constructor() {
    super('Nivel3');
    this.levelKey = 'nivel3';
    this.missionText = 'Recolectá todos los objetos del camino para avanzar.';
  }
}
