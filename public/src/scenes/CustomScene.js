import { TileLevelScene } from './TileLevelScene.js';

export class CustomScene extends TileLevelScene {
  constructor() { super('Custom'); }

  init(data) {
    this.levelKey = data?.levelKey ?? 'gym';
    this.welcomeMessage = null;
    this.missionText = null;
  }
}
