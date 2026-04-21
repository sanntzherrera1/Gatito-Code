import { TileLevelScene } from './TileLevelScene.js';

export class GymScene extends TileLevelScene {
  constructor() {
    super('Gym');
    this.levelKey = 'gym';
    this.welcomeMessage = '¡Bienvenido al Nivel 1! 🌱\nUsá los botones para mover\nal personaje y recolectar items.';
  }

}
