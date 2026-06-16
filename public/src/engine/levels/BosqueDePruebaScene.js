import { TileLevelScene } from '../scenes/TileLevelScene.js';

export class BosqueDePruebaScene extends TileLevelScene {
  constructor() {
    super('BosqueDePrueba');
    this.levelKey = 'bosque_de_prueba';
    this.missionText = 'Sobrevive.';
  }

  init(data) {
    super.init(data);
    this.welcomeMessage = 'Sobrevive al frio bosque.';
    if (!data?.returnScreen) this.returnScreen = 'levels';
  }
}
