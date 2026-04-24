import { TileLevelScene } from './TileLevelScene.js';

export class GymScene extends TileLevelScene {
  constructor() {
    super('Gym');
    this.levelKey = 'gym';
    this.welcomeMessage = '¡Bienvenido al Nivel 1! 🌱\nUsá los botones para mover\nal personaje y recolectar items.';
    this.missionText = 'Al gatito le gustan las manzanas, deberías darle instrucciones para que pueda conseguir la que veas. Solo así avanzarás al siguiente nivel.';
  }

}
