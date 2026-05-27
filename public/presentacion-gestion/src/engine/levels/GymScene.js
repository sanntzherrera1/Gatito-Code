import { TileLevelScene } from '../scenes/TileLevelScene.js';

export class GymScene extends TileLevelScene {
  constructor() {
    super('Gym');
    this.levelKey = 'gym';
    this.welcomeMessage = '¡Bienvenido al Nivel 1! 🌱\nUsa los botones para mover\nal personaje y recolectar items.';
    this.missionText = 'Mision: Recolecta todos los plantines usando comandos de movimiento.';
  }
}
