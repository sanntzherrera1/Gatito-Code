import { TileLevelScene } from '../scenes/TileLevelScene.js';
import { t } from '../../services/i18n.js';

export class BosqueFloralScene extends TileLevelScene {
  constructor() {
    super('BosqueFloral');
    this.levelKey = 'bosque_floral';
  }

  init(data) {
    super.init(data);
    this.missionText = t('bosque_floral.mission');
    this.welcomeMessage = t('bosque_floral.welcome');
  }
}
