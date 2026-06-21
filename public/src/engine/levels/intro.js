// Intro cinematica del tutorial de Gatito Code.
// Sin frameworks externos — solo DOM, CSS y tweens de Phaser.

const CAM_W = 256; // COLS * TILE
const CAM_H = 192; // ROWS * TILE
const TILE  = 16;

const FULL = { x: CAM_W / 2, y: CAM_H / 2 };

// ── Iconos pixel-art del juego ───────────────────────────────────────────────
// Reemplazan a los emojis del sistema para que los carteles combinen con la
// estetica SproutLands. Cada entrada es [columna, fila] dentro del spritesheet
// `Emoji_Spritesheet_Free.png` (grilla de 32px, 5 columnas x 19 filas).
export const ICONS = {
  gato:     [3, 2],   // gatito naranja sonriente
  gatoFeliz:[3, 5],   // gatito con ojos de corazon (entusiasmado)
  sprout:   [0, 12],  // brote / plantin
  manzana:  [0, 13],  // manzana
  jardin:   [2, 12],  // trebol de 4 hojas (jardin / naturaleza)
  control:  [0, 11],  // joystick / mando
  estrella: [4, 8],   // estrella (celebracion)
  pregunta: [3, 7],   // signo de pregunta (duda)
  pulgar:   [0, 9],   // pulgar arriba
  check:    [0, 7],   // tilde verde
};

// Devuelve el HTML de un icono pixel-art inline para usar dentro de los carteles.
export function ico(name) {
  const [c, r] = ICONS[name] || [0, 0];
  return `<i class="gico" style="--c:${c};--r:${r}"></i>`;
}

// Textos para cada punto de intro (por indice)
const MSGS = [
  `${ico('gato')} <b>¡Este es Gatito!</b>`,
  `${ico('sprout')} Le gusta cuidar sus plantas.`,
  '🎣 Le gusta pescar.',
  `${ico('manzana')} Ademas le gusta cosechar sus frutas favoritas.`,
];

// Mueve y hace zoom a (pos.x, pos.y) de forma suave usando la API nativa de Phaser
function panTo(scene, pos, zoom, duration = 900) {
  const cam = scene.cameras.main;
  return new Promise(resolve => {
    let done = 0;
    const check = () => { if (++done === 2) resolve(); };
    cam.pan(pos.x, pos.y, duration, 'Cubic.easeInOut', false, (c, progress) => {
      if (progress === 1) check();
    });
    cam.zoomTo(zoom, duration, 'Cubic.easeInOut', false, (c, progress) => {
      if (progress === 1) check();
    });
  });
}

// Espera N milisegundos
function wait(scene, ms) {
  return new Promise(resolve => scene.time.delayedCall(ms, resolve));
}

// Inyecta los estilos del cartel una sola vez
export function injectStyles() {
  if (document.getElementById('intro-css')) return;
  const s = document.createElement('style');
  s.id = 'intro-css';
  s.textContent = `
    /* Cartel cozy: mismo lenguaje visual que los dialogos del juego
       (parchment de madera + borde marron + fuente SproutPixel). */
    #intro-card {
      position: fixed;
      left: 50%;
      bottom: 20%;
      transform: translateX(-50%);
      background: linear-gradient(170deg, #dfc99e 0%, #c8a87a 40%, #b89564 100%);
      border-radius: 8px;
      padding: 20px 26px 18px;
      font-family: 'SproutPixel', monospace;
      color: #3d2008;
      font-size: 15px;
      text-align: center;
      z-index: 9000;
      min-width: 250px;
      max-width: 420px;
      line-height: 1.55;
      pointer-events: all;
      filter: drop-shadow(0 6px 30px rgba(0,0,0,0.55));
      animation: icard-in .28s cubic-bezier(.22,1,.36,1) both;
    }
    /* Marco interior tallado, igual que #level-dialog-box */
    #intro-card::before {
      content: '';
      position: absolute;
      inset: 3px;
      border: 2px solid rgba(90,58,26,0.18);
      border-radius: 5px;
      pointer-events: none;
    }
    #intro-card p {
      margin: 0 0 16px;
      font-size: 15px;
      text-shadow: 0 1px 0 rgba(255,255,255,0.35);
    }
    #intro-card b { color: #2e6032; }
    #intro-card button {
      background-color: rgba(255,255,255,0.3);
      border: 1px solid rgba(90,58,26,0.4);
      color: #3d2008;
      font-family: 'SproutPixel', monospace;
      font-size: 13px;
      padding: 6px 22px;
      border-radius: 5px;
      cursor: pointer;
      letter-spacing: .02em;
      transition: background-color .15s ease, transform .1s ease, filter .15s ease;
    }
    #intro-card button:hover { background-color: rgba(255,235,180,0.65); filter: brightness(1.08); }
    #intro-card button:active { transform: translateY(1px) scale(.97); }
    /* Icono pixel-art inline (Emoji_Spritesheet_Free, grilla 32px 5x19).
       --c y --r seleccionan el frame (columna, fila). */
    .gico {
      display: inline-block;
      width: 22px; height: 22px;
      vertical-align: middle;
      margin: 0 2px;
      background: url('assets/SproutLands-UI/emojis-free/Emoji_Spritesheet_Free.png') no-repeat;
      background-size: 110px 418px;
      background-position: calc(var(--c, 0) * -22px) calc(var(--r, 0) * -22px);
      image-rendering: pixelated;
    }
    #intro-card.icard-out { animation: icard-out .22s ease-in forwards; }
    .intro-highlight {
      box-shadow: 0 0 0 4px #ffe600, 0 0 28px #ffe600cc, 0 0 52px #ffe60055 !important;
      animation: intro-pulse .85s ease-in-out infinite !important;
    }
    .intro-zoom {
      transform: scale(1.07) !important;
      transform-origin: center !important;
      transition: transform .3s cubic-bezier(.22,1,.36,1) !important;
      z-index: 9001 !important;
      position: relative !important;
    }
    @keyframes intro-pulse {
      0%, 100% { box-shadow: 0 0 0 4px #ffe600, 0 0 28px #ffe600cc, 0 0 52px #ffe60055; }
      50%       { box-shadow: 0 0 0 5px #ffe600, 0 0 42px #ffe600ee, 0 0 70px #ffe60077; }
    }
    @keyframes icard-in {
      from { opacity: 0; transform: translateX(-50%) translateY(14px) scale(.93); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0)    scale(1);   }
    }
    @keyframes icard-out {
      from { opacity: 1; transform: translateX(-50%) translateY(0)    scale(1);   }
      to   { opacity: 0; transform: translateX(-50%) translateY(14px) scale(.93); }
    }
    @keyframes backdrop-in  { from { opacity: 0; } to { opacity: 1; } }
    @keyframes backdrop-out { from { opacity: 1; } to { opacity: 0; } }
    #panel-backdrop {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.82);
      z-index: 8998;
      animation: backdrop-in 0.35s ease forwards;
    }
    #panel-backdrop.out { animation: backdrop-out 0.3s ease forwards; }
    @keyframes btn-press {
      0%   { transform: scale(1); }
      40%  { transform: scale(0.88); filter: brightness(1.4); }
      100% { transform: scale(1); }
    }
    .btn-press { animation: btn-press 0.22s ease-out; }
    /* Zoom fuerte para elementos chicos (switch) durante el tutorial */
    .tut-bigzoom {
      transform: scale(2.6) !important;
      transform-origin: center !important;
      transition: transform 0.45s cubic-bezier(.22,1,.36,1) !important;
      position: relative !important;
      z-index: 9003 !important;
    }
    @keyframes btn-press-big {
      0%   { transform: scale(2.6); }
      40%  { transform: scale(2.25); filter: brightness(1.5); }
      100% { transform: scale(2.6); }
    }
    .btn-press-big { animation: btn-press-big 0.3s ease-out; }
    /* Desbloqueo suave: el glow entra, respira despacio y se desvanece sin golpes */
    .unlock-layer { position: relative !important; z-index: 9001 !important; }
    .unlock-glow { animation: unlock-glow 3.2s ease-in-out forwards !important; }
    @keyframes unlock-glow {
      0%   { box-shadow: 0 0 0 0   rgba(255,230,0,0);                                 transform: scale(1);    }
      20%  { box-shadow: 0 0 0 5px rgba(255,230,0,1),   0 0 40px rgba(255,230,0,.85); transform: scale(1.07); }
      45%  { box-shadow: 0 0 0 3px rgba(255,230,0,.65), 0 0 24px rgba(255,230,0,.45); transform: scale(1.03); }
      70%  { box-shadow: 0 0 0 5px rgba(255,230,0,1),   0 0 40px rgba(255,230,0,.85); transform: scale(1.07); }
      100% { box-shadow: 0 0 0 0   rgba(255,230,0,0);                                 transform: scale(1);    }
    }
  `;
  document.head.appendChild(s);
}

// Muestra un cartel con texto y espera a que el usuario haga clic en "continuar"
// Si se cancela, elimina el card del DOM y resuelve inmediatamente.
export function showCard(html, signal) {
  return new Promise(resolve => {
    const card = document.createElement('div');
    card.id = 'intro-card';
    card.innerHTML = `<p>${html}</p><button>continuar ›</button>`;
    document.body.appendChild(card);

    const dismiss = () => { card.remove(); resolve(); };

    card.querySelector('button').addEventListener('click', () => {
      card.classList.add('icard-out');
      card.addEventListener('animationend', dismiss, { once: true });
    });

    signal?._onCancel(dismiss);
  });
}

// ── Secuencia principal ────────────────────────────────────────────────────────
export async function runNivel0Intro(scene, missionText = null, signal = null, opts = {}) {
  const pts = scene.introPoints || [];
  if (!pts.length) return;

  const msgs = opts.msgs || MSGS;
  const showGarden = opts.showGarden !== false;
  const showPanelTutorial = opts.showPanelTutorial !== false;

  injectStyles();
  window.__setPanels?.(false);
  await wait(scene, 200);
  if (signal?.cancelled) return;

  // Primer punto: el spawn del gatito
  const p0 = { x: pts[0].tx * TILE + 8, y: pts[0].ty * TILE + 8 };
  await panTo(scene, p0, 2.5, 1000);
  if (signal?.cancelled) return;
  await showCard(msgs[0], signal);
  if (signal?.cancelled) return;

  if (showGarden) {
    // Vista del jardin completo
    await panTo(scene, FULL, 1, 950);
    if (signal?.cancelled) return;
    await showCard(`${ico('jardin')} Este es su jardin.`, signal);
    if (signal?.cancelled) return;
  }

  // Puntos restantes
  for (let i = 1; i < pts.length; i++) {
    const pos = { x: pts[i].tx * TILE + 8, y: pts[i].ty * TILE + 8 };
    await panTo(scene, pos, 2.5, 900);
    if (signal?.cancelled) return;
    await showCard(msgs[i] ?? `Punto ${i + 1}`, signal);
    if (signal?.cancelled) return;
  }

  // Volver al mapa completo
  await panTo(scene, FULL, 1, 800);
  if (signal?.cancelled) return;

  // Mostrar paneles y resaltar con el mensaje final
  window.__setPanels?.(true);
  await wait(scene, 350);
  if (signal?.cancelled) return;

  if (showPanelTutorial) {
    // Panel de movimientos
    const dirsPanel = document.getElementById('dirs');
    dirsPanel?.classList.add('intro-highlight', 'intro-zoom');
    await showCard(`${ico('control')} Tu mision es ayudarle mediante movimientos a conseguir sus preciadas frutas.<br><br>Elegi los movimientos adecuados… ¿me ayudas a que descanse despues de su dia de trabajo?`, signal);
    dirsPanel?.classList.remove('intro-highlight', 'intro-zoom');
    if (signal?.cancelled) return;

    // Panel de programa
    await wait(scene, 200);
    if (signal?.cancelled) return;
    const queuePanel = document.getElementById('queue');
    queuePanel?.classList.add('intro-highlight', 'intro-zoom');
    await showCard(`${ico('control')} Aca se veran tus movimientos.`, signal);
    queuePanel?.classList.remove('intro-highlight', 'intro-zoom');
  }

  if (missionText) window.__setMission?.(missionText);
}
