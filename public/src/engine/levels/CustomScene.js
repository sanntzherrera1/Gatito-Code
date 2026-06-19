import { TileLevelScene } from '../scenes/TileLevelScene.js';

const LEVEL_COPY = {
  if: {
    welcome: 'Nuevo concepto: IF. SI sucede una condicion, Gatito hace otra cosa. En este nivel, si hay una roca adelante, la salta.',
    mission: 'Mision: Activa SI ROCA SALTAR y usa mover a la derecha para cruzar la linea de piedras.',
  },
  si_1: {
    welcome: 'Ahora que ya conoces IF, usalo junto con movimientos normales para cruzar y despues girar.',
    mission: 'Mision: Usa SI junto con movimientos normales para cruzar las rocas y recolectar todo.',
  },
  si_2: {
    welcome: 'Este tramo repite la misma idea dos veces. Usa FUNCION 1 como bloque reutilizable junto con SI ROCA SALTAR.',
    mission: 'Mision: Repite una mini-rutina con F1 para juntar todo usando SI ROCA SALTAR.',
  },
  si_3: {
    welcome: 'Este nivel mezcla saltos automaticos con giros. Si solo avanzas, no alcanza.',
    mission: 'Mision: Usa SI ROCA SALTAR y cambia de direccion para juntar los dos objetos.',
  },
  for: {
    welcome: 'Nuevo concepto: FOR. Repite un bloque varias veces sin llenar todo el programa principal. IF sigue disponible como herramienta ya desbloqueada.',
    mission: 'Mision: Usa FOR para repetir una secuencia corta y llegar al objetivo. Tambien podes combinarlo con SI cuando haga falta.',
  },
};

const IF_LEVELS = ['if', 'si_1', 'si_2', 'si_3'];
const FOR_LEVELS = ['for'];

export class CustomScene extends TileLevelScene {
  constructor() {
    super('Custom');
  }

  init(data) {
    super.init(data);
    const copy = LEVEL_COPY[this.levelKey];
    this.welcomeMessage = copy?.welcome ?? `Jugando nivel: ${this.levelKey}.`;
    this.missionText = copy?.mission ?? `Mision: Recolecta todos los items en el nivel ${this.levelKey}.`;
    if (this.levelKey === 'if') {
      this.onWelcomeClose = () => {
        window.__setIfPanel?.(true);
        window.__setForPanel?.(false);
        this.showIdlePanel();
      };
    } else if (this.levelKey === 'for') {
      this.onWelcomeClose = () => {
        window.__setForPanel?.(true);
        window.__setIfPanel?.(true);
        this.showIdlePanel();
      };
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
      return;
    }

    if (this.levelKey === 'for') {
      window.__setForPanel?.(false);
      window.__setIfPanel?.(false);
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
}
