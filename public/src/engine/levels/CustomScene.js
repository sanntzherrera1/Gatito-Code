import { TileLevelScene } from '../scenes/TileLevelScene.js';

export class CustomScene extends TileLevelScene {
  constructor() {
    super('Custom');
  }

  init(data) {
    super.init(data);
    this.welcomeMessage = `¡Jugando nivel: ${this.levelKey}!`;
    this.missionText = `Mision: Recolecta todos los items en el nivel ${this.levelKey}.`;
    if (!data?.returnScreen) this.returnScreen = 'levels';
  }
}
