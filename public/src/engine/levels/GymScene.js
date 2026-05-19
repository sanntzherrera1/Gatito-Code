import { TileLevelScene } from '../scenes/TileLevelScene.js';

export class GymScene extends TileLevelScene {
  constructor() {
    super('Gym');
    this.levelKey = 'gym';
    this.welcomeMessage = '¡Bienvenido al Nivel 1! 🌱\nUsá los botones para mover\nal personaje y recolectar items.';
    this.missionText = 'Misión: Recolecta todos los plantines usando comandos de movimiento.';
  }
}
