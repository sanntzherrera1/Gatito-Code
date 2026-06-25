import { TileLevelScene } from '../scenes/TileLevelScene.js';
import { runIfTutorial } from './ifTutorial.js';
import { runForTutorial } from './forTutorial.js';
import { unlockPanels, lockPanels } from './intro.js';
import { t } from '../../services/i18n.js';

function getLevelCopy(key) {
  const known = ['if', 'si_2', 'jardin_tutorial', 'for', 'si_1', 'si_3'];
  if (!known.includes(key)) return null;
  return {
    welcome: t(`custom.${key}.welcome`),
    mission: t(`custom.${key}.mission`),
  };
}

const IF_LEVELS = ['if', 'si_2'];
const FOR_LEVELS = ['for', 'si_1', 'si_3'];

export class CustomScene extends TileLevelScene {
  constructor() {
    super('Custom');
  }

  init(data) {
    super.init(data);
    const copy = getLevelCopy(this.levelKey);
    this.welcomeMessage = copy?.welcome ?? t('custom.default_welcome', { key: this.levelKey });
    this.missionText = copy?.mission ?? t('custom.default_mission', { key: this.levelKey });
    if (this.levelKey === 'if') {
      // El nivel 6 (IF) arranca con un tutorial cinematico al cerrar la bienvenida.
      this.onWelcomeClose = () => this._startIfTutorial();
    } else if (this.levelKey === 'for') {
      // El nivel 9 (FOR) arranca con un tutorial cinematico al cerrar la bienvenida.
      this.onWelcomeClose = () => this._startForTutorial();
    } else {
      this.onWelcomeClose = null;
    }
    if (!data?.returnScreen) this.returnScreen = 'levels';
  }

  create() {
    super.create();

    this.events.once('shutdown', () => {
      window.__setIfPanel?.(true);
      window.__setForPanel?.(false);
    });

    if (this.levelKey === 'if') {
      window.__setIfPanel?.(false);
      window.__setForPanel?.(false);
      lockPanels();

      // Patron de cancelacion del tutorial (igual que Nivel0Scene): si el
      // jugador sale a mitad de la animacion, cerramos carteles y limpiamos.
      this._ifSignal = { cancelled: false, _cbs: [], _onCancel(cb) { this._cbs.push(cb); } };
      this.events.once('shutdown', () => {
        this._ifSignal.cancelled = true;
        this._ifSignal._cbs.forEach(cb => cb());
        this._ifSignal._cbs = [];
        this._tutorialActive = false;
        unlockPanels();
        document.getElementById('intro-card')?.remove();
        document.getElementById('panel-backdrop')?.remove();
        document.getElementById('level-dialog-box')?.classList.remove('intro-highlight');
        document.getElementById('if-condition-select')?.classList.remove('intro-highlight');
        document.getElementById('if-action-select')?.classList.remove('intro-highlight');
        const logicaPanel = document.getElementById('queue-logica');
        if (logicaPanel) {
          logicaPanel.classList.remove('unlock-glow', 'unlock-layer');
          logicaPanel.style.position = '';
          logicaPanel.style.zIndex = '';
        }
      });
      return;
    }

    if (this.levelKey === 'for') {
      window.__setForPanel?.(false);
      window.__setIfPanel?.(false);
      lockPanels();
      // Nivel 9: el panel FOR vive en la columna izquierda (debajo del D-pad);
      // los mensajes del tutorial se reubican en el espacio sobrante via CSS
      // (body.level-for, ver panels.css).
      this._moveForPanelToLeft();

      // Mismo patron de cancelacion que el tutorial del IF.
      this._forSignal = { cancelled: false, _cbs: [], _onCancel(cb) { this._cbs.push(cb); } };
      this.events.once('shutdown', () => {
        this._forSignal.cancelled = true;
        this._forSignal._cbs.forEach(cb => cb());
        this._forSignal._cbs = [];
        this._tutorialActive = false;
        this._restoreForPanel();
        unlockPanels();
        document.getElementById('intro-card')?.remove();
        document.getElementById('panel-backdrop')?.remove();
        document.getElementById('level-dialog-box')?.classList.remove('intro-highlight');
        document.getElementById('for-count-select')?.classList.remove('intro-highlight');
        document.getElementById('slots-for')?.classList.remove('intro-highlight');
        document.querySelector('[data-dir="for"]')?.classList.remove('unlock-glow', 'unlock-layer');
        const logicaPanel = document.getElementById('queue-logica');
        if (logicaPanel) {
          logicaPanel.classList.remove('unlock-glow', 'unlock-layer');
          logicaPanel.style.position = '';
          logicaPanel.style.zIndex = '';
        }
        const dirsPanel = document.getElementById('dirs');
        if (dirsPanel) {
          dirsPanel.style.position = '';
          dirsPanel.style.zIndex = '';
        }
      });
      return;
    }

    if (IF_LEVELS.includes(this.levelKey)) {
      window.__setIfPanel?.(true);
      window.__setForPanel?.(false);
      return;
    }

    if (FOR_LEVELS.includes(this.levelKey)) {
      window.__setForPanel?.(true);
      window.__setIfPanel?.(true);
      return;
    }

    window.__setIfPanel?.(false);
    window.__setForPanel?.(false);
  }

  // Lanza el tutorial cinematico del IF y, al terminar, devuelve el control al
  // jugador mostrando el panel de mision.
  _startIfTutorial() {
    this._tutorialActive = true;
    runIfTutorial(this, this._ifSignal).then(() => {
      if (this._ifSignal?.cancelled) return;
      this._tutorialActive = false;
      this.showIdlePanel();
    });
  }

  // Lanza el tutorial cinematico del FOR y devuelve el control al jugador.
  _startForTutorial() {
    this._tutorialActive = true;
    runForTutorial(this, this._forSignal).then(() => {
      if (this._forSignal?.cancelled) return;
      this._tutorialActive = false;
      this.showIdlePanel();
    });
  }

  // Durante los tutoriales de IF/FOR no debe aparecer el panel de mision (lo
  // dispara el resetLevel interno); se muestra recien al terminar la animacion.
  showIdlePanel() {
    if (this._tutorialActive && (this.levelKey === 'if' || this.levelKey === 'for')) return;
    super.showIdlePanel();
  }

  // Nivel 9 (FOR): reubica el panel FOR a la columna izquierda (#panels), debajo
  // del D-pad. Guarda su posicion original para devolverlo al salir del nivel.
  _moveForPanelToLeft() {
    const logicaPanel = document.getElementById('queue-logica');
    const leftCol = document.getElementById('panels');
    if (!logicaPanel || !leftCol) return;
    this._forPanelHome = { parent: logicaPanel.parentNode, next: logicaPanel.nextSibling };
    leftCol.appendChild(logicaPanel);
    document.body.classList.add('level-for');
  }

  // Devuelve el panel de logica a su contenedor original (#right-panels) en la
  // misma posicion en la que estaba, para no romper el layout de otros niveles.
  _restoreForPanel() {
    document.body.classList.remove('level-for', 'for-open');
    const logicaPanel = document.getElementById('queue-logica');
    if (logicaPanel && this._forPanelHome?.parent) {
      this._forPanelHome.parent.insertBefore(logicaPanel, this._forPanelHome.next);
    }
    this._forPanelHome = null;
  }
}
