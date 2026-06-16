import { TileLevelScene } from '../scenes/TileLevelScene.js';

export class BosqueFloralScene extends TileLevelScene {
  constructor() {
    super('BosqueFloral');
    this.levelKey = 'bosque_floral';
    this.missionText = 'Recoge las flores del bosque encantado';
    this.welcomeMessage = '¡Bienvenido al Bosque Floral! Usa la Funcion para recorrer el sendero.';
  }
}
