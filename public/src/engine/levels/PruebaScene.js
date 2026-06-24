import { TileLevelScene } from '../scenes/TileLevelScene.js';
import { t } from '../../services/i18n.js';

export class PruebaScene extends TileLevelScene {
  constructor() {
    super('Prueba');
    this.levelKey = 'prueba';
  }

  init(data) {
    super.init(data);
    this.missionText = t('prueba.mission');
    this.welcomeMessage = t('prueba.welcome');
    if (!data?.returnScreen) this.returnScreen = 'levels';
  }
}
