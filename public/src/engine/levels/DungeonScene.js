import { TileLevelScene } from '../scenes/TileLevelScene.js';

export class DungeonScene extends TileLevelScene {
  constructor() {
    super('Dungeon');
    this.levelKey = 'dungeon';
    this.missionText = 'Escapa del dungeon helado antes de que la tormenta te atrape.';
  }

  init(data) {
    super.init(data);
    this.welcomeMessage = 'El frio muerde tus huesos. No todos los que entraron aqui salieron.';
    if (!data?.returnScreen) this.returnScreen = 'levels';
  }
}
