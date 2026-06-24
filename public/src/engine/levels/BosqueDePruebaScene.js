import { TileLevelScene } from '../scenes/TileLevelScene.js';
import { t } from '../../services/i18n.js';

export class BosqueDePruebaScene extends TileLevelScene {
  constructor() {
    super('BosqueDePrueba');
    this.levelKey = 'bosque_de_prueba';
  }

  init(data) {
    super.init(data);
    this.missionText = t('bosque_prueba.mission');
    this.welcomeMessage = t('bosque_prueba.welcome');
    if (!data?.returnScreen) this.returnScreen = 'levels';
  }
}
