import { TileLevelScene } from '../scenes/TileLevelScene.js';

export class PruebaScene extends TileLevelScene {
  constructor() {
    super('Prueba');
    this.levelKey = 'prueba';
    this.missionText = 'Mision: Recoge los objetos abandonados antes de que la tormenta empeore.';
  }

  init(data) {
    super.init(data);
    this.welcomeMessage = 'No deberias estar aqui. Algo te observa desde las colinas.';
    if (!data?.returnScreen) this.returnScreen = 'levels';
  }
}
