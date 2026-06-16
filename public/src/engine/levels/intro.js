// Intro cinematica del tutorial de Gatito Code.
// Sin frameworks externos — solo DOM, CSS y tweens de Phaser.

const CAM_W = 256; // COLS * TILE
const CAM_H = 192; // ROWS * TILE
const TILE  = 16;

const FULL = { x: CAM_W / 2, y: CAM_H / 2 };

// Textos para cada punto de intro (por indice)
const MSGS = [
  '🐱 <b>¡Este es Gatito!</b>',
  '🌱 Le gusta cuidar sus plantas.',
  '🎣 Le gusta pescar.',
  '🍎 Ademas le gusta cosechar sus frutas favoritas.',
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
    #intro-card {
      position: fixed;
      left: 50%;
      bottom: 20%;
      transform: translateX(-50%);
      background: rgba(10, 20, 12, 0.94);
      border: 2px solid #66ee99;
      border-radius: 12px;
      padding: 18px 30px 16px;
      font-family: monospace;
      color: #e8f5e9;
      font-size: 14px;
      text-align: center;
      z-index: 9000;
      min-width: 250px;
      max-width: 420px;
      line-height: 1.6;
      pointer-events: all;
      box-shadow: 0 4px 24px rgba(0,0,0,0.7);
      animation: icard-in .28s cubic-bezier(.22,1,.36,1) both;
    }
    #intro-card p {
      margin: 0 0 16px;
      font-size: 15px;
    }
    #intro-card button {
      background: #163d1c;
      border: 1px solid #66ee99;
      color: #adf0bb;
      font-family: monospace;
      font-size: 11px;
      padding: 6px 22px;
      border-radius: 6px;
      cursor: pointer;
      letter-spacing: .03em;
      transition: background .15s;
    }
    #intro-card button:hover { background: #1e5426; }
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
export async function runNivel0Intro(scene, missionText = null, signal = null) {
  const pts = scene.introPoints || [];
  if (!pts.length) return;

  injectStyles();
  window.__setPanels?.(false);
  await wait(scene, 200);
  if (signal?.cancelled) return;

  // Primer punto: el spawn del gatito
  const p0 = { x: pts[0].tx * TILE + 8, y: pts[0].ty * TILE + 8 };
  await panTo(scene, p0, 2.5, 1000);
  if (signal?.cancelled) return;
  await showCard(MSGS[0], signal);
  if (signal?.cancelled) return;

  // Vista del jardin completo
  await panTo(scene, FULL, 1, 950);
  if (signal?.cancelled) return;
  await showCard('🌿 Este es su jardin.', signal);
  if (signal?.cancelled) return;

  // Puntos restantes (NPCs)
  for (let i = 1; i < pts.length; i++) {
    const pos = { x: pts[i].tx * TILE + 8, y: pts[i].ty * TILE + 8 };
    await panTo(scene, pos, 2.5, 900);
    if (signal?.cancelled) return;
    await showCard(MSGS[i] ?? `Punto ${i + 1}`, signal);
    if (signal?.cancelled) return;
  }

  // Volver al mapa completo
  await panTo(scene, FULL, 1, 800);
  if (signal?.cancelled) return;

  // Mostrar paneles y resaltar con el mensaje final
  window.__setPanels?.(true);
  await wait(scene, 350);
  if (signal?.cancelled) return;

  // Panel de movimientos
  const dirsPanel = document.getElementById('dirs');
  dirsPanel?.classList.add('intro-highlight', 'intro-zoom');
  await showCard('🎮 Tu mision es ayudarle mediante movimientos a conseguir sus preciadas frutas.<br><br>Elegi los movimientos adecuados… ¿me ayudas a que descanse despues de su dia de trabajo?', signal);
  dirsPanel?.classList.remove('intro-highlight', 'intro-zoom');
  if (signal?.cancelled) return;

  // Panel de programa
  await wait(scene, 200);
  if (signal?.cancelled) return;
  const queuePanel = document.getElementById('queue');
  queuePanel?.classList.add('intro-highlight', 'intro-zoom');
  await showCard('▶ Aca se veran tus movimientos.', signal);
  queuePanel?.classList.remove('intro-highlight', 'intro-zoom');

  if (missionText) window.__setMission?.(missionText);
}
