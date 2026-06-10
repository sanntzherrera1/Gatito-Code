import { TileLevelScene } from '../scenes/TileLevelScene.js';
import { showCard, injectStyles } from './intro.js';
import { pathDirections } from '../level/PathAnimator.js';

export class Nivel3Scene extends TileLevelScene {
  constructor() {
    super('Nivel3');
    this.levelKey = 'nivel3';
    this.missionText = 'Usá el botón de función para agregarlo al panel principal.';
    this.welcomeMessage = '¡Bienvenido al Nivel 3! 🌿\nRecolectá objetos y llegá a la casilla final.';
  }

  create() {
    super.create();
    // Bloquear toda interacción durante el tutorial (welcome → path → demo)
    this._lockPanels(true);
    window.__setIfPanel?.(false);
    const els = [
      document.querySelector('[data-dir="func1"]'),
      document.getElementById('queue-func1'),
      document.getElementById('target-switch'),
    ];
    for (const el of els) {
      if (!el) continue;
      el.style.opacity = '0.3';
      el.style.pointerEvents = 'none';
      el.style.filter = 'grayscale(1)';
    }

    this.onPathAnimationComplete = () => this._unlockFunc1(els);

    this.events.once('shutdown', () => {
      window.__setIfPanel?.(true);
      document.getElementById('intro-card')?.remove();
      document.getElementById('panel-backdrop')?.remove();
      for (const p of ['panels', 'right-panels']) {
        const el = document.getElementById(p);
        if (el) { el.style.position = ''; el.style.zIndex = ''; el.style.pointerEvents = ''; }
      }
      document.querySelector('canvas')?.classList.remove('intro-highlight');
      const d = document.getElementById('dirs');
      if (d) {
        d.classList.remove('intro-highlight');
        d.style.transform = '';
        d.style.transition = '';
        d.style.transformOrigin = '';
        d.style.position = '';
        d.style.zIndex = '';
      }
      document.querySelector('[data-dir="func1"]')?.classList.remove('intro-highlight');
      const ts = document.getElementById('target-switch');
      if (ts) { ts.classList.remove('intro-highlight', 'intro-zoom', 'tut-bigzoom'); ts.style.opacity = ''; ts.style.zIndex = ''; ts.style.position = ''; }
      document.querySelector('[data-target="func1"]')?.classList.remove('intro-highlight', 'btn-press-big');
      document.querySelector('[data-dir="right"]')?.classList.remove('intro-highlight');
      for (const el of els) {
        if (!el) continue;
        el.style.opacity = '';
        el.style.pointerEvents = '';
        el.style.filter = '';
        el.style.transition = '';
        el.classList.remove('intro-highlight', 'intro-zoom', 'unlock-glow', 'unlock-layer');
      }
    });
  }

  // Nivel tutorial: un intento incompleto no es "perder", solo se alienta a reintentar.
  showResultOverlay(isWin) {
    if (isWin) { super.showResultOverlay(true); return; }
    const pickupsLeft = this.pickups.size;
    window.__showResult?.({
      state: 'idle',
      message: pickupsLeft > 0
        ? '¡Casi! Agregá más movimientos para juntar todo. Volvé a intentarlo 💪'
        : '¡Buen intento! Ajustá tu programa y probá de nuevo 💪',
      onRestart: () => {
        const domRestart = document.getElementById('restart');
        if (domRestart) domRestart.click();
        else this.resetLevel();
      },
      onMenu: () => this.exitToMenu(),
    });
  }

  // Bloquea/desbloquea toda interacción con los paneles (pointer-events).
  _lockPanels(locked) {
    for (const p of ['panels', 'right-panels']) {
      const el = document.getElementById(p);
      if (el) el.style.pointerEvents = locked ? 'none' : '';
    }
  }

  async _unlockFunc1(els) {
    injectStyles();
    const dirsPanel = document.getElementById('dirs');
    const func1Btn = document.querySelector('[data-dir="func1"]');

    // Paso 1: backdrop + cámara se acerca al panel (body zoom centrado en #dirs)
    const backdrop = document.createElement('div');
    backdrop.id = 'panel-backdrop';
    document.body.appendChild(backdrop);

    if (dirsPanel) {
      dirsPanel.style.transition = 'transform 0.5s cubic-bezier(.22,1,.36,1)';
      dirsPanel.style.transform = 'scale(1.35)';
      dirsPanel.style.transformOrigin = 'center';
      dirsPanel.style.position = 'relative';
      dirsPanel.style.zIndex = '9002';
    }
    // El panel hace zoom, pero el resalte va ÚNICAMENTE en el botón de la Función.
    // Lo revelamos (sale del gris) para que el glow se vea con nitidez.
    if (func1Btn) {
      func1Btn.style.opacity = '1';
      func1Btn.style.filter = 'none';
      func1Btn.classList.add('intro-highlight');
    }
    // Paso 2a: mensaje mientras se resalta el botón de la Función
    await showCard(
      'Ahora desbloqueaste la Función 🎉<br><br>Con este panel vas a poder tener movimientos extras…',
      null
    );
    if (func1Btn) func1Btn.classList.remove('intro-highlight');   // apaga el pulso, queda revelado

    // Paso 2b: resaltar el switch Program/F1 y explicar
    const targetSwitch = document.getElementById('target-switch');
    const queueFunc1 = document.getElementById('queue-func1');
    if (targetSwitch) {
      targetSwitch.style.opacity = '1';
      targetSwitch.style.pointerEvents = 'none';
      targetSwitch.style.zIndex = '9002';
      targetSwitch.style.position = 'relative';
      targetSwitch.classList.add('intro-highlight');
    }
    if (queueFunc1) {
      queueFunc1.style.opacity = '1';
      queueFunc1.style.zIndex = '9002';
      queueFunc1.style.position = 'relative';
      queueFunc1.classList.add('intro-highlight');
    }
    await showCard(
      'Si tocás <b>F1</b> y apretás un movimiento, se verá en el panel de la Función 1.',
      null
    );
    if (targetSwitch) {
      targetSwitch.classList.remove('intro-highlight');
      targetSwitch.style.opacity = '';
      targetSwitch.style.zIndex = '';
      targetSwitch.style.position = '';
    }
    if (queueFunc1) {
      queueFunc1.classList.remove('intro-highlight');
      queueFunc1.style.opacity = '';
      queueFunc1.style.zIndex = '';
      queueFunc1.style.position = '';
    }

    // Paso 3: zoom-out suave, quitar backdrop y highlights
    if (dirsPanel) {
      dirsPanel.style.transform = '';
      setTimeout(() => {
        dirsPanel.style.transition = '';
        dirsPanel.style.transformOrigin = '';
        dirsPanel.style.position = '';
        dirsPanel.style.zIndex = '';
      }, 520);
    }
    backdrop.classList.add('out');
    setTimeout(() => backdrop.remove(), 320);

    // Paso 4: revelar (gris → color) y, al mismo tiempo, un glow amarillo notorio
    // que entra, respira y se desvanece. Colorizamos enseguida para que el glow se
    // vea a opacidad plena (con el panel gris a opacity 0.3 la sombra queda apagada).
    const GLOW_MS = 3200;   // debe coincidir con la duración de .unlock-glow en intro.js
    for (const el of els) {
      if (!el) continue;
      el.classList.add('unlock-glow', 'unlock-layer');
      el.style.transition = 'opacity 0.7s ease, filter 0.7s ease';
      el.style.opacity = '';
      el.style.filter = '';
      el.style.pointerEvents = 'auto';
    }

    // Paso 5: al terminar el glow (ya desvanecido) limpiar y arrancar la demo
    setTimeout(() => {
      for (const el of els) {
        if (!el) continue;
        el.classList.remove('unlock-glow', 'unlock-layer');
        el.style.transition = '';
      }
      this._demoFunc1();
    }, GLOW_MS);
  }

  _demoFunc1() {
    const delay = ms => new Promise(r => setTimeout(r, ms));
    const press = el => {
      if (!el) return;
      el.classList.add('btn-press');
      setTimeout(() => el.classList.remove('btn-press'), 250);
    };
    const dirBtn = dir => document.querySelector(`[data-dir="${dir}"]`);
    // Resalta, presiona y agrega un movimiento, luego apaga el resalte.
    const tapDir = async dir => {
      const btn = dirBtn(dir);
      btn?.classList.add('intro-highlight');
      press(btn);
      await delay(180);
      btn?.click();
      btn?.classList.remove('intro-highlight');
      await delay(350);
    };

    (async () => {
      await delay(800);

      // Direcciones reales del camino (capa `path` asignada en el editor del nivel).
      // El panel principal admite 5 slots: ponemos 4 movimientos + ƒ, y el resto en F1.
      const dirs = pathDirections(this);
      if (!dirs.length) { this._lockPanels(false); return; }   // sin path no hay demo
      const mainDirs = dirs.slice(0, 4);
      const funcDirs = dirs.slice(4);

      // Arrancar con las colas limpias
      document.getElementById('clear')?.click();
      document.getElementById('clear-func1')?.click();

      // Backdrop + elevar paneles sobre él
      const backdrop = document.createElement('div');
      backdrop.id = 'panel-backdrop';
      document.body.appendChild(backdrop);
      const panelsEl      = document.getElementById('panels');
      const rightPanelsEl = document.getElementById('right-panels');
      for (const el of [panelsEl, rightPanelsEl]) {
        if (!el) continue;
        el.style.position      = 'relative';
        el.style.zIndex        = '9002';
        el.style.pointerEvents = 'none';
      }
      await delay(400);

      const queueEl = document.getElementById('queue');

      // 1. Plantear el problema y cargar los primeros 4 movimientos en el panel principal
      queueEl?.classList.add('intro-highlight');
      await showCard('El panel principal solo permite <b>5</b> movimientos… pero este camino necesita <b>6</b>. 🤔', null);
      queueEl?.classList.remove('intro-highlight');
      await delay(200);
      for (const dir of mainDirs) await tapDir(dir);
      await delay(300);

      // 2. Quinto slot: la Función ƒ (los movimientos "extra")
      const func1Btn = dirBtn('func1');
      func1Btn?.classList.add('intro-highlight');
      await showCard('Ya usamos 4 slots. En el último metemos la <b>Función ƒ</b>, que nos da movimientos extra.', null);
      press(func1Btn);
      await delay(180);
      func1Btn?.click();
      func1Btn?.classList.remove('intro-highlight');
      await delay(600);

      // 3. Cambiar el switch a F1
      const targetSwitch = document.getElementById('target-switch');
      const f1Btn        = document.querySelector('[data-target="func1"]');
      targetSwitch?.classList.add('intro-highlight');
      await showCard('Ahora cambiamos a <b>F1</b> para cargar los movimientos extra de la función.', null);
      f1Btn?.classList.add('intro-highlight');
      await delay(250);
      press(f1Btn);
      await delay(220);
      f1Btn?.click();                // activeTarget → func1
      await delay(900);
      f1Btn?.classList.remove('intro-highlight');
      targetSwitch?.classList.remove('intro-highlight');
      await delay(300);

      // 4. Cargar los movimientos restantes en el panel de la Función
      const queueFunc1 = document.getElementById('queue-func1');
      queueFunc1?.classList.add('intro-highlight');
      await showCard(`Agregamos los <b>${funcDirs.length}</b> movimientos que faltan en la <b>Función</b>.`, null);
      for (const dir of funcDirs) await tapDir(dir);
      await delay(400);
      queueFunc1?.classList.remove('intro-highlight');

      // 5. Volver a Program
      const programBtn = document.querySelector('[data-target="main"]');
      press(programBtn);
      await delay(180);
      programBtn?.click();
      await delay(500);

      // 6. Ejecutar: el gatito recorre los 4 + 2 = 6 pasos hasta el final
      await showCard(`4 movimientos + ${funcDirs.length} en la función = <b>${dirs.length} pasos</b>. ¡Le damos a <b>Ejecutar</b>! ▶`, null);

      // Sacar el backdrop oscuro → el juego se ilumina
      backdrop.classList.add('out');
      setTimeout(() => backdrop.remove(), 320);
      for (const el of [panelsEl, rightPanelsEl]) {
        if (!el) continue;
        el.style.position = '';
        el.style.zIndex   = '';
      }

      const canvas = document.querySelector('canvas');
      canvas?.classList.add('intro-highlight');
      this._demoRunning = true;       // no marca el nivel ni muestra overlay durante la demo
      press(document.getElementById('run'));
      await delay(200);
      document.getElementById('run')?.click();
      await delay(50);
      while (window.__GYM?.running) await delay(100);   // esperar a que termine el recorrido
      this._demoRunning = false;
      await delay(600);
      canvas?.classList.remove('intro-highlight');

      // 7. Mensaje final + invitación a jugar
      await showCard('¡Así se usa la función! 🎉<br><br>Cuando te faltan slots en el panel principal, metés movimientos extra en <b>F1</b> y los llamás con <b>ƒ</b>.', null);
      await showCard('¡Ahora probalo vos! 🎮<br><br>No te preocupes si no llegás de una, podés intentarlo las veces que quieras.', null);

      // 8. Reiniciar para el jugador: limpiar colas, volver al spawn y habilitar
      document.getElementById('clear')?.click();
      document.getElementById('clear-func1')?.click();
      this.resetLevel();
      this._lockPanels(false);
    })();
  }
}
