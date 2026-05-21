import { playSound } from './sound.js';
import { startDemo, stopDemo } from './demo-game.js';
import { schedule, scheduleSession } from './timers.js';

/*
  Spritesheet: 576x576 px, 12 cols x 12 rows, frame=48px.
  Avatar container: 56x56 px.
  background-size = 56 * 12 = 672px.
  Each frame in the container is exactly 56px.
  Positions (col*56, row*56) negative:
    Brian  → (0,0)    down idle
    Inti   → (2*56,0) down walk2
    Iara   → (0,1*56) up idle
    Luis   → (1*56,1*56) up walk1
    Lisett → (2*56,1*56) up walk2
    Lucas  → (0,2*56) left idle
*/
const AVATARS = [
  { pos: '0 0' },
  { pos: '-112px 0' },
  { pos: '0 -56px' },
  { pos: '-56px -56px' },
  { pos: '-112px -56px' },
  { pos: '0 -112px' }
];

const CORNERS = `
  <div class="corner-ornament tl"></div>
  <div class="corner-ornament tr"></div>
  <div class="corner-ornament bl"></div>
  <div class="corner-ornament br"></div>
`;

export const SLIDES = [
  // ========================================================
  // Slide 1: Portada
  // ========================================================
  {
    id: 'slide-1',
    html: `
      <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative;">
        <div style="position: absolute; inset: 0; background: url('../assets/SproutLands-Sprites/Tilesets/Grass.png'); background-size: 176px 112px; opacity: 0.15; z-index: 0; image-rendering: pixelated; mix-blend-mode: overlay;"></div>
        
        <div style="z-index: 1; text-align: center;">
          <div id="cover-sprite"></div>
          <h1>GATITO CODE</h1>
          <p style="font-size: clamp(16px, 2vw, 24px); text-shadow: 0 0 8px var(--glow-cyan);">Un juego para aprender programacion</p>
        </div>
        
        <div class="dialog-box" style="z-index: 1; margin-top: 40px; width: 80%; max-width: 900px;">
          <p style="color: var(--accent-warm); margin-bottom: 8px; text-shadow: 1px 1px 0 #000;">Sobre el proyecto:</p>
          <div id="typewriter-text" style="font-size: clamp(12px, 1.5vw, 18px); line-height: 1.8; color: var(--text-primary); min-height: 50px;"></div>
        </div>
      </div>
      ${CORNERS}
    `,
    onEnter: (sessionId) => {
      const text = "Gatito-Code es un videojuego educativo de pensamiento computacional con estetica pixel-art, destinado a ninos y ninas de 8 a 10 anos sin conocimientos previos de programacion. El jugador guia a un gatito en un mapa de tiles, construyendo programas mediante bloques de instrucciones arrastrables (arriba, abajo, izquierda, derecha) para recolectar objetos y completar niveles.";
      const el = document.getElementById('typewriter-text');
      if (!el) return;
      el.innerHTML = '';
      let i = 0;
      function typeWriter() {
        if (i < text.length) {
          el.innerHTML += text.charAt(i);
          i++;
          if (i % 20 === 0) playSound('bip');
          scheduleSession(typeWriter, 6, sessionId);
        }
      }
      scheduleSession(typeWriter, 300, sessionId);
    }
  },

  // ========================================================
  // Slide 2: Equipo (Party Select)
  // ========================================================
  {
    id: 'slide-2',
    html: `
      <h2>Equipo de Desarrollo</h2>
      <p class="text-center" style="margin-bottom: 24px;">Conoce a los integrantes que hicieron posible Gatito Code.</p>
      
      <div class="party-grid" id="party-grid"></div>
      ${CORNERS}
    `,
    onEnter: (sessionId) => {
      const members = [
        { name: "Brian Herrera", role: "Desarrollador — Programacion de la logica del juego, movimiento del jugador, colisiones y sistema de ejecucion de comandos." },
        { name: "Inti Taretto", role: "Desarrollador — Implementacion de mecanicas de niveles, integracion de assets y optimizacion de rendimiento." },
        { name: "Iara Baya", role: "Desarrolladora — Desarrollo del motor de tilemaps, sistema de clima y editor visual de niveles." },
        { name: "Luis Herrera", role: "Disenador UI/UX — Creacion de interfaces, paletas de colores, tipografia pixel-art y experiencia de usuario." },
        { name: "Lisett Castillo", role: "Scrum Master — Facilitacion de ceremonias agiles, gestion del backlog y aseguramiento del flujo de trabajo." },
        { name: "Lucas Gimenez", role: "QA & Documentacion — Diseno de casos de prueba, control de calidad y redaccion de documentacion tecnica." }
      ];
      
      const grid = document.getElementById('party-grid');
      if (!grid) return;
      grid.innerHTML = '';
      
      members.forEach((m, idx) => {
        const slot = document.createElement('div');
        slot.className = 'party-slot';
        const av = AVATARS[idx % AVATARS.length];
        slot.innerHTML = `
          <div class="party-avatar" style="background-position: ${av.pos};"></div>
          <div class="party-card">
            <div class="party-name">${m.name}</div>
            <div class="party-role">${m.role}</div>
          </div>
        `;
        grid.appendChild(slot);
        
        scheduleSession(() => {
          slot.classList.add('show');
          playSound('blup');
        }, 200 + idx * 180, sessionId);
      });
    }
  },

  // ========================================================
  // Slide 3: Metodologia SCRUM (Quest Log)
  // ========================================================
  {
    id: 'slide-3',
    html: `
      <h2>Metodologia Agil — SCRUM</h2>
      <p class="text-center">Organizacion del trabajo en iteraciones cortas y enfocadas en la entrega de valor.</p>
      
      <div class="scrum-container">
        <div class="scrum-panel" id="scrum-panel-left">
          <h3>Flujo de Trabajo</h3>
          <ul class="scrum-list">
            <li><span class="icon">⧉</span><span class="label">Sprint Planning</span>Al inicio de cada ciclo se seleccionan las historias de usuario del Product Backlog y se definen las tareas del Sprint Backlog.</li>
            <li><span class="icon">⏳</span><span class="label">Daily Standups</span>Reuniones breves de 15 minutos, dos veces por semana, para sincronizar avances y remover impedimentos.</li>
            <li><span class="icon">★</span><span class="label">Sprint Review</span>Demostracion del incremento funcional al final del sprint para recibir feedback y ajustar prioridades.</li>
            <li><span class="icon">⚙</span><span class="label">Retrospective</span>Espacio de mejora continua donde el equipo identifica que funciono, que no y que acciones tomaran en el siguiente ciclo.</li>
          </ul>
        </div>
        
        <div class="scrum-panel" id="scrum-panel-right">
          <h3>Artefactos y Control</h3>
          <ul class="scrum-list">
            <li><span class="icon">❖</span><span class="label">Historias de Usuario</span>Cada funcionalidad se describe desde la perspectiva del jugador, incluyendo criterios de aceptacion claros y medibles.</li>
            <li><span class="icon">✓</span><span class="label">Criterios de Aceptacion</span>Condiciones minimas para considerar una historia completa: comportamiento esperado, casos limite y validacion visual.</li>
            <li><span class="icon">⚡</span><span class="label">Casos de Prueba</span>Escenarios documentados antes de la implementacion para garantizar que la funcionalidad cumpla los requisitos.</li>
            <li><span class="icon">✎</span><span class="label">Registro en Notion</span>Tablero centralizado con el estado de cada tarea (Pendiente, En progreso, Testing, Done) vinculado a su historia y tests.</li>
          </ul>
        </div>
      </div>
      ${CORNERS}
    `,
    onEnter: (sessionId) => {
      const leftH3 = document.querySelector('#scrum-panel-left h3');
      const rightH3 = document.querySelector('#scrum-panel-right h3');
      const leftItems = document.querySelectorAll('#scrum-panel-left .scrum-list li');
      const rightItems = document.querySelectorAll('#scrum-panel-right .scrum-list li');
      
      scheduleSession(() => { if (leftH3) leftH3.classList.add('animate-underline'); }, 300, sessionId);
      scheduleSession(() => { if (rightH3) rightH3.classList.add('animate-underline'); }, 500, sessionId);
      
      [...leftItems, ...rightItems].forEach((li, idx) => {
        scheduleSession(() => {
          li.classList.add('show');
          if (idx % 2 === 0) playSound('bip');
        }, 600 + idx * 120, sessionId);
      });
    }
  },

  // ========================================================
  // Slide 4: Historias de Usuario
  // ========================================================
  {
    id: 'slide-4',
    html: `
      <h2>Historias de Usuario y Testing</h2>
      <p class="text-center">Documentamos requerimientos mediante historias de usuario y definimos casos de prueba para validar cada funcionalidad antes de su implementacion.</p>
      
      <div class="placeholder-container">
        <div class="frame-wrapper">
          <div class="frame-label">Tablero de Notion</div>
          <div class="placeholder-img" style="background-image: url('assets/slides/notion-board.png');"></div>
        </div>
        <div class="frame-wrapper">
          <div class="frame-label">Historia de usuarios</div>
          <div class="placeholder-img" style="background-image: url('assets/slides/notion-tasks.png'); background-position: top left;"></div>
        </div>
      </div>
      ${CORNERS}
    `
  },

  // ========================================================
  // Slide 5: Tests Implementados (CRT Monitor)
  // ========================================================
  {
    id: 'slide-5',
    html: `
      <h2>Tests Implementados</h2>
      <p class="text-center">Validamos la logica de dominio con tests unitarios ejecutables con un solo comando.</p>
      
      <div class="crt-monitor">
        <div class="terminal" id="test-terminal"></div>
      </div>
      ${CORNERS}
    `,
    onEnter: (sessionId) => {
      const output = `> npm test

<span class="green">✓</span> domain/Player.js — Navegacion y colisiones del jugador
  <span class="green">✓</span> El jugador puede moverse libremente por casillas vacias en las 4 direcciones cardinales
  <span class="green">✓</span> El jugador NO puede atravesar casillas solidas (paredes)
  <span class="green">✓</span> El jugador NO puede salirse de los limites del mapa
  <span class="green">✓</span> El jugador puede saltar 2 casillas, atravesando 1 casilla solida intermedia
  <span class="green">✓</span> El jugador NO puede saltar si la casilla de aterrizaje esta fuera del mapa
  <span class="green">✓</span> El jugador vuelve exactamente a su posicion de spawn al reiniciar

<span class="green">✓</span> domain/Level.js — Geometria de la grilla del mapa
  <span class="green">✓</span> Se crea un nivel con dimensiones 16x12, spawn en (8,6) y objetos correctamente registrados
  <span class="green">✓</span> isSolid() detecta correctamente las casillas marcadas como paredes
  <span class="green">✓</span> isSolid() devuelve true para coordenadas fuera de los limites del mapa
  <span class="green">✓</span> isSolid() devuelve false para casillas de piso sin paredes
  <span class="green">✓</span> El nivel registra correctamente los objetos de recoleccion con su posicion y tipo

Archivos modificados/creados
Archivo\t                Accion
tests/domain.test.js\tCreado — 11 tests unitarios
package.json\t        Editado — script test ahora ejecuta vitest run
node_modules/\t        Instalado — Vitest v4.1.7 + dependencias
`;
      
      const term = document.getElementById('test-terminal');
      if (!term) return;
      term.innerHTML = '';
      
      const lines = output.split('\n');
      let i = 0;
      function typeLine() {
        if (i < lines.length) {
          term.innerHTML += lines[i] + '\n';
          term.scrollTop = term.scrollHeight;
          i++;
          playSound('bip');
          scheduleSession(typeLine, Math.random() * 40 + 15, sessionId);
        }
      }
      scheduleSession(typeLine, 400, sessionId);
    }
  },

  // ========================================================
  // Slide 6: Evolucion de la Arquitectura
  // ========================================================
  {
    id: 'slide-6',
    html: `
      <h2>Evolucion de la Arquitectura</h2>
      <p class="text-center">
        El proyecto comenzo como un monolito donde toda la logica residia en un unico archivo embebido,
        sin separacion de capas ni responsabilidades. Mediante refactorizacion progresiva, evoluciono
        hacia una arquitectura estratificada que distingue dominio puro, motor de renderizado,
        servicios de persistencia y UI del DOM.
      </p>

      <div class="architecture-container">
        <div class="tree-panel tree-initial">
          <div class="status-icon">⚠</div>
          <h3>Arquitectura Inicial</h3>
<span class="dir">public/</span>
├── <span class="file">index.html</span>              <span class="comment"># DOM shell: UI panels, palette, dialogs</span>
├── <span class="dir">src/</span>
│   ├── <span class="file">main.js</span>             <span class="comment"># Phaser.Game bootstrap, exports TILE/COLS/ROWS constants</span>
│   ├── <span class="dir">level/</span>
│   │   └── <span class="file">TileLevel.js</span>    <span class="comment"># Domain logic: tileset registry, GID mapping, level loader</span>
│   └── <span class="dir">scenes/</span>
│       ├── <span class="file">BootScene.js</span>        <span class="comment"># Asset preload + animation setup</span>
│       ├── <span class="file">MenuScene.js</span>        <span class="comment"># Menu navigation</span>
│       ├── <span class="file">TileLevelScene.js</span>   <span class="comment"># Base gameplay class: movement, collision, pickups</span>
│       ├── <span class="file">GymScene.js</span>         <span class="comment"># Tutorial level (extends TileLevelScene, key='gym')</span>
│       ├── <span class="file">MainScene.js</span>        <span class="comment"># Main level (extends TileLevelScene, key='main')</span>
│       └── <span class="file">EditorScene.js</span>      <span class="comment"># Visual tile editor</span>
├── <span class="dir">levels/</span>
│   ├── <span class="file">gym.json</span>            <span class="comment"># Gym level data (16×12 tiles)</span>
│   └── <span class="file">main.json</span>           <span class="comment"># Main level data</span>
└── <span class="dir">assets/</span>
    ├── <span class="dir">SproutLands-Sprites/</span>    <span class="comment"># Character, tilesets (Grass, Fences, Dirt, Hills, Water)</span>
    ├── <span class="dir">SproutLands-UI/</span>         <span class="comment"># UI sprites, fonts, dialog boxes</span>
    └── <span class="file">ui.json</span>                 <span class="comment"># Asset manifest (textures + animations)</span>
        </div>

        <div class="arch-arrow">⇒</div>

        <div class="tree-panel tree-current">
          <div class="status-icon">◆</div>
          <h3>Arquitectura Actual</h3>
<span class="dir">public/</span>
├── <span class="file">index.html</span>              <span class="comment"># DOM shell: UI panels, palette, dialogs</span>
├── <span class="dir">css/</span>                    <span class="comment"># Stylesheets for DOM UI</span>
├── <span class="dir">levels/</span>                 <span class="comment"># Static JSON level files (gym.json, main.json)</span>
├── <span class="dir">assets/</span>                 <span class="comment"># Sprites, tilesets, fonts, UI textures</span>
└── <span class="dir">src/</span>
    ├── <span class="file">main.js</span>             <span class="comment"># Phaser.Game bootstrap, re-exports TILE/COLS/ROWS</span>
    ├── <span class="dir">config/</span>
    │   └── <span class="file">game.js</span>         <span class="comment"># Core constants: TILE, COLS, ROWS, STEP_MS, DIRS</span>
    ├── <span class="dir">domain/</span>             <span class="comment"># Pure JavaScript. Zero Phaser imports. Testable with Node.</span>
    │   ├── <span class="file">Player.js</span>       <span class="comment"># Movement state, collision, facing</span>
    │   ├── <span class="file">Level.js</span>        <span class="comment"># Grid geometry, solids, spawn, objects, weather</span>
    │   └── <span class="file">Program.js</span>      <span class="comment"># Immutable command sequence</span>
    ├── <span class="dir">engine/</span>             <span class="comment"># Everything that touches Phaser</span>
    │   ├── <span class="dir">scenes/</span>         <span class="comment"># BootScene, MenuScene, EditorScene, TileLevelScene</span>
    │   ├── <span class="dir">levels/</span>         <span class="comment"># GymScene, MainScene, CustomScene</span>
    │   ├── <span class="dir">entities/</span>       <span class="comment"># PlayerView, PickupView</span>
    │   ├── <span class="dir">level/</span>          <span class="comment"># TileRegistry, TileLevelLoader, WeatherSystem</span>
    │   └── <span class="dir">program/</span>        <span class="comment"># ProgramExecutor</span>
    ├── <span class="dir">services/</span>
    │   └── <span class="file">Storage.js</span>      <span class="comment"># localStorage: level overrides, custom levels registry</span>
    └── <span class="dir">ui/</span>                 <span class="comment"># DOM modules (queue, dialog, mission, etc)</span>
        </div>
      </div>
      ${CORNERS}
    `
  },

  // ========================================================
  // Slide 7: Demo en vivo (Arcade Machine)
  // ========================================================
  {
    id: 'slide-7',
    html: `
      <h2>Demo Interactiva</h2>
      <p class="text-center" style="margin-bottom: 16px;">Mapa Principal · Tutorial Automatico</p>
      
      <div class="arcade-machine">
        <div class="arcade-screen" id="demo-container"></div>
        <div class="arcade-controls">
          <div class="arcade-stick"></div>
          <div class="arcade-btn red"></div>
          <div class="arcade-btn blue"></div>
          <div class="arcade-btn green"></div>
        </div>
      </div>
      
      <p class="text-center" style="font-size: clamp(12px, 1.5vw, 16px); color: var(--text-dim); margin-top: 4px;">El gatito ejecutara automaticamente una secuencia de comandos.</p>
      ${CORNERS}
    `,
    onEnter: () => {
      startDemo('demo-container');
    },
    onLeave: () => {
      stopDemo();
    }
  }
];
