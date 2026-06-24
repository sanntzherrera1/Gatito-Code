import { TileLevelScene } from '../scenes/TileLevelScene.js';
import { t } from '../../services/i18n.js';

export class DungeonScene extends TileLevelScene {
  constructor() {
    super('Dungeon');
    this.levelKey = 'dungeon';
  }

  init(data) {
    super.init(data);
    this.missionText = t('dungeon.mission');
    this.welcomeMessage = t('dungeon.welcome');
    if (!data?.returnScreen) this.returnScreen = 'levels';
  }
}
