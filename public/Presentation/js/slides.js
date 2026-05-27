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
  { pos: '-56px 0' },
  { pos: '-112px 0' },
  { pos: '-168px 0' },
  { pos: '-224px 0' },
  { pos: '-280px 0' }
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
        <div style="z-index: 1; text-align: center;">
          <div id="cover-sprite"></div>
          <h1>GATITO CODE</h1>
          <p style="font-size: 1.15rem; text-shadow: 0 0 8px var(--glow-cyan);">Un juego para aprender programacion</p>
        </div>

        <div class="dialog-box" style="z-index: 1; margin-top: 40px; width: 80%; max-width: 900px;">
          <p style="color: var(--accent-warm); margin-bottom: 8px; text-shadow: 1px 1px 0 #000;">Sobre el proyecto:</p>
          <div id="typewriter-text" style="font-size: 0.9rem; line-height: 1.8; color: var(--text-primary); min-height: 50px;"></div>
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
        { name: "Brian Herrera", title: "Desarrollador", desc: "Programacion de la logica del juego, movimiento del jugador, colisiones y sistema de ejecucion de comandos." },
        { name: "Lisett Castillo", title: "Scrum Master", desc: "Facilitacion de ceremonias agiles, gestion del backlog y aseguramiento del flujo de trabajo." },
        { name: "Iara Baya", title: "Desarrolladora", desc: "Desarrollo del motor de tilemaps, sistema de clima y editor visual de niveles." },
        { name: "Luis Herrera", title: "Disenador UI/UX", desc: "Creacion de interfaces, paletas de colores, tipografia pixel-art y experiencia de usuario." },
        { name: "Inti Taretto", title: "Desarrollador", desc: "Implementacion de mecanicas de niveles, integracion de assets y optimizacion de rendimiento." },
        { name: "Lucas Gimenez", title: "QA & Documentacion", desc: "Diseno de casos de prueba, control de calidad y redaccion de documentacion tecnica." }
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
            <div class="party-role"><span class="party-role-title">${m.title}</span> — ${m.desc}</div>
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
  // Slide 4: Documento de Alcance
  // ========================================================
  {
    id: 'slide-4',
    html: `
      <h2>Documento de Alcance</h2>
      <p class="text-center">MVP definido: un juego educativo de pensamiento computacional navegable sin instalacion, orientado a ninos de 8 a 10 anos.</p>

      <div class="scrum-container">
        <div class="scrum-panel" id="alcance-panel-left">
          <h3>En Alcance (MVP)</h3>
          <ul class="scrum-list">
            <li><span class="icon">◈</span><span class="label">Juego en navegador</span>Sin instalacion, accesible desde cualquier dispositivo de escritorio con un navegador moderno.</li>
            <li><span class="icon">◈</span><span class="label">18 niveles en 6 secciones</span>Progresion pedagogica: secuencias, bucles, condicionales, variables y funciones.</li>
            <li><span class="icon">◈</span><span class="label">Editor de niveles</span>Herramienta interna para crear y testear niveles personalizados sin modificar el codigo.</li>
            <li><span class="icon">◈</span><span class="label">Nivel tutorial "Gym"</span>Onboarding jugable sin instrucciones de texto que introduce las mecanicas basicas.</li>
            <li><span class="icon">◈</span><span class="label">Feedback visual de error</span>El log muestra que instruccion fallo, promoviendo el aprendizaje por ensayo y error.</li>
          </ul>
        </div>

        <div class="scrum-panel" id="alcance-panel-right">
          <h3>Fuera de Alcance</h3>
          <ul class="scrum-list">
            <li><span class="icon">◇</span><span class="label">Version movil / tablet</span>La interfaz esta optimizada para escritorio; la adaptacion responsiva queda para una etapa futura.</li>
            <li><span class="icon">◇</span><span class="label">Logros y leaderboards</span>Sistemas de gamificacion extrinseca no forman parte del MVP educativo.</li>
            <li><span class="icon">◇</span><span class="label">Modo multijugador</span>El foco es la experiencia individual de aprendizaje; el modo cooperativo es una extension futura.</li>
            <li><span class="icon">◇</span><span class="label">Analiticas y tracking</span>No se registra ni se envia informacion sobre el uso o progreso del jugador.</li>
            <li><span class="icon">◇</span><span class="label">Narrativa / cutscenes</span>Se priorizan las mecanicas de juego; la historia y cinematicas son mejoras post-MVP.</li>
          </ul>
        </div>
      </div>
      ${CORNERS}
    `,
    onEnter: (sessionId) => {
      const leftH3 = document.querySelector('#alcance-panel-left h3');
      const rightH3 = document.querySelector('#alcance-panel-right h3');
      const leftItems = document.querySelectorAll('#alcance-panel-left .scrum-list li');
      const rightItems = document.querySelectorAll('#alcance-panel-right .scrum-list li');

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
  // Slide 5: Tablero SCRUM — Sprints
  // ========================================================
  {
    id: 'slide-5',
    html: `
      <h2>Tablero SCRUM — Sprints</h2>
      <p class="text-center">Iteraciones de 2 semanas con planning y review al inicio y cierre de cada ciclo.</p>

      <div class="sprint-board">
        <div class="sprint-card completed" id="sprint-card-1">
          <div class="sprint-name">Sprint 1</div>
          <div class="sprint-period">20 abr &rarr; 03 may</div>
          <div style="display:flex; align-items:center; gap:0.4rem;">
            <div class="progress-bar" style="flex:1;"><div class="progress-fill green" data-width="100"></div></div>
            <span style="color:var(--green); font-size:0.7rem;">13/13</span>
          </div>
          <div class="sprint-status done">COMPLETADO</div>
          <ul class="sprint-tasks">
            <li>Setup entorno y configuracion Phaser</li>
            <li>Menu principal y escenas base</li>
            <li>Implementacion del jugador</li>
            <li>Estructura del mapa de tiles</li>
            <li>Documentacion de arquitectura</li>
          </ul>
        </div>

        <div class="sprint-card completed" id="sprint-card-2">
          <div class="sprint-name">Sprint 2</div>
          <div class="sprint-period">04 may &rarr; 17 may</div>
          <div style="display:flex; align-items:center; gap:0.4rem;">
            <div class="progress-bar" style="flex:1;"><div class="progress-fill green" data-width="100"></div></div>
            <span style="color:var(--green); font-size:0.7rem;">5/8</span>
          </div>
          <div class="sprint-status done">COMPLETADO</div>
          <ul class="sprint-tasks">
            <li>Modularizacion del index.html</li>
            <li>Rediseno visual del panel UI</li>
            <li>Sistema de niveles custom</li>
            <li class="carried">Drag &amp; drop de comandos &rarr; S3</li>
            <li class="carried">Jump picker inline &rarr; S3</li>
            <li class="carried">Selector de destino &rarr; S3</li>
          </ul>
        </div>

        <div class="sprint-card partial" id="sprint-card-3">
          <div class="sprint-name">Sprint 3</div>
          <div class="sprint-period">18 may &rarr; 31 may</div>
          <div style="display:flex; align-items:center; gap:0.4rem;">
            <div class="progress-bar" style="flex:1;"><div class="progress-fill cyan" data-width="75"></div></div>
            <span style="color:var(--accent); font-size:0.7rem;">9/12</span>
          </div>
          <div class="sprint-status progress">EN PROGRESO</div>
          <ul class="sprint-tasks">
            <li>Ejecucion de niveles custom</li>
            <li>Modularizacion de dialogos</li>
            <li>Pickups definidos en JSON</li>
            <li>Animaciones de sprites</li>
            <li>Condicion de victoria</li>
            <li>Efectos de sonido</li>
            <li>Persistencia de progreso</li>
          </ul>
        </div>

        <div class="sprint-card" id="sprint-card-4" style="border-color:var(--border-dim);">
          <div class="sprint-name" style="color:var(--text-dim);">Sprint 4–5</div>
          <div class="sprint-period">Proximas iteraciones</div>
          <div style="display:flex; align-items:center; gap:0.4rem;">
            <div class="progress-bar" style="flex:1;"><div class="progress-fill green" data-width="0"></div></div>
            <span style="color:var(--text-dim); font-size:0.7rem;">0/7</span>
          </div>
          <div class="sprint-status planned">PLANIFICADO</div>
          <ul class="sprint-tasks">
            <li>Niveles pedagogicos completos (18)</li>
            <li>Playtest con usuarios (8–10 anos)</li>
            <li>Pantalla de resultados y celebracion</li>
            <li>Sistema de progresion entre niveles</li>
            <li>Despliegue publico (hosting)</li>
          </ul>
        </div>
      </div>
      ${CORNERS}
    `,
    onEnter: (sessionId) => {
      const cards = document.querySelectorAll('.sprint-card');
      cards.forEach((card, idx) => {
        scheduleSession(() => {
          card.classList.add('show');
          playSound('blup');
          const fill = card.querySelector('.progress-fill');
          if (fill) {
            const target = fill.dataset.width;
            scheduleSession(() => { fill.style.width = target + '%'; }, 80, sessionId);
          }
        }, 300 + idx * 200, sessionId);
      });
    }
  },

  // ========================================================
  // Slide 6: Ceremonias — Agenda y Minuta
  // ========================================================
  {
    id: 'slide-6',
    html: `
      <h2>Ceremonias &mdash; Agenda y Minuta</h2>
      <p class="text-center">Dos reuniones clave que definieron el rumbo del proyecto y la organizacion del equipo.</p>

      <div style="display:flex; gap:1rem; flex:1; min-height:0;">
        <div class="doc-sheet" style="display:flex; flex-direction:column; gap:0.5rem;">
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.2rem;">
            <span style="color:var(--accent-warm); font-size:1rem; font-weight:bold;">Agenda</span>
            <span style="color:var(--text-dim); font-size:0.7rem;">Reunion #2 &mdash; 10/04/2026 &mdash; Google Meet</span>
          </div>
          <ul class="doc-items" id="agenda-items">
            <li><span class="item-num">01.</span>Presentacion de propuestas de juego por cada integrante.</li>
            <li><span class="item-num">02.</span>Seleccion del enfoque: juego educativo de pensamiento computacional.</li>
            <li><span class="item-num">03.</span>Definicion de mecanicas core y flujo de juego.</li>
            <li><span class="item-num">04.</span>Decision visual: pixel-art, personaje gatito, tilesets.</li>
            <li><span class="item-num">05.</span>Division de roles y proximos pasos para Sprint 1.</li>
          </ul>
          <div style="border-top:1px dashed rgba(255,255,255,0.1); padding-top:0.4rem;">
            <p style="color:var(--green); font-size:0.72rem; margin:0;">Resultado: proyecto definido, mecanicas acordadas, roles asignados.</p>
          </div>
        </div>

        <div class="doc-sheet" style="display:flex; flex-direction:column; gap:0.5rem;">
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.2rem;">
            <span style="color:var(--accent-warm); font-size:1rem; font-weight:bold;">Minuta</span>
            <span style="color:var(--text-dim); font-size:0.7rem;">Reunion #3 &mdash; 12/05/2026 &mdash; Google Meet</span>
          </div>
          <ul class="doc-items" id="minuta-items">
            <li><span class="item-bullet">&#9654;</span>Refactoring para escalabilidad antes de nuevas features.</li>
            <li><span class="item-bullet">&#9654;</span>Conflictos de merge frecuentes trabajando en main.</li>
            <li><span class="item-bullet">&#10003;</span>Decision: feature branches obligatorias por tarea.</li>
            <li><span class="item-bullet">&#10003;</span>Decision: un responsable unico por modulo UI.</li>
            <li><span class="item-bullet">&#8594;</span>[Iara] Paneles de mision y comandos.</li>
            <li><span class="item-bullet">&#8594;</span>[Brian] Pickups a JSON. &nbsp; [J. Luis] Dialogos y escena custom.</li>
          </ul>
          <div style="border-top:1px dashed rgba(255,255,255,0.1); padding-top:0.4rem;">
            <p style="color:var(--green); font-size:0.72rem; margin:0;">Resultado: prioridades reordenadas, politica de branches adoptada.</p>
          </div>
        </div>
      </div>

      <div class="dialog-box" style="margin-top:0.7rem; padding:0.6rem 1.2rem; max-width:100%; flex-shrink:0;">
        <p style="color:var(--text-primary); margin:0; font-size:0.78rem; line-height:1.6; text-align:center;">
          Preparar <span style="color:var(--accent-warm);">agendas antes</span> de cada reunion y registrar
          <span style="color:var(--accent-warm);">minutas despues</span> nos permitio llegar con propuestas concretas,
          tomar decisiones en el momento y no perder acuerdos entre reuniones.
        </p>
      </div>
      ${CORNERS}
    `,
    onEnter: (sessionId) => {
      const items = document.querySelectorAll('#agenda-items li, #minuta-items li');
      items.forEach((item, idx) => {
        scheduleSession(() => {
          item.classList.add('show');
          if (idx % 2 === 0) playSound('bip');
        }, 300 + idx * 110, sessionId);
      });
    }
  },

  // ========================================================
  // Slide 7: Retrospectiva
  // ========================================================
  {
    id: 'slide-7',
    html: `
      <h2>Retrospectiva &mdash; Sprint 3</h2>
      <p class="text-center">Ceremonia de mejora continua: que funciono bien, que debemos mejorar y que acciones concretas tomamos.</p>

      <div class="retro-board">
        <div class="retro-col green">
          <div class="retro-col-title">&#10003; Que salio bien</div>
          <div class="retro-card">Division de tareas por modulo desde el inicio del proyecto.</div>
          <div class="retro-card">Documentacion activa en Notion durante todo el proceso de desarrollo.</div>
          <div class="retro-card">Comunicacion fluida via Meet con reuniones regulares y agendas preparadas.</div>
          <div class="retro-card">Arquitectura en capas que facilito el trabajo en paralelo sin conflictos de logica.</div>
          <div class="retro-card">Estandares de codigo acordados desde la primera reunion de equipo.</div>
        </div>

        <div class="retro-col red">
          <div class="retro-col-title">&#128295; Que mejorar</div>
          <div class="retro-card">Conflictos de merge frecuentes por trabajar directamente en la rama main.</div>
          <div class="retro-card">Estimaciones de sprint optimistas: Sprint 2 cerro con solo 5 de 8 tareas completadas.</div>
          <div class="retro-card">Deuda tecnica acumulada al no modularizar el codigo desde etapas tempranas.</div>
          <div class="retro-card">Comunicacion asincronica insuficiente entre reuniones formales.</div>
        </div>

        <div class="retro-col blue">
          <div class="retro-col-title">&#9889; Acciones</div>
          <div class="retro-card">Feature branches obligatorias por cada historia de usuario o tarea de sprint.</div>
          <div class="retro-card">Standup asincroni breve en el canal del equipo al menos 2 veces por semana.</div>
          <div class="retro-card">Refactoring como item explicito del sprint backlog, no como tarea opcional.</div>
          <div class="retro-card">Revisar estimaciones con margen del 20% para absorber imprevistos tecnicos.</div>
        </div>
      </div>
      ${CORNERS}
    `,
    onEnter: (sessionId) => {
      const allCards = document.querySelectorAll('.retro-card');
      allCards.forEach((card, idx) => {
        scheduleSession(() => {
          card.classList.add('show');
          playSound('blup');
        }, 300 + idx * 110, sessionId);
      });
    }
  },

  // ========================================================
  // Slide 9: Lecciones Aprendidas
  // ========================================================
  {
    id: 'slide-8',
    html: `
      <h2>Lecciones Aprendidas</h2>
      <p class="text-center">Conocimiento obtenido del proceso que guiara nuestras proximas iteraciones.</p>

      <div class="scrum-container">
        <div class="scrum-panel" id="lec-panel-left">
          <h3>Tecnicas</h3>
          <ul class="scrum-list">
            <li><span class="icon">⚙</span><span class="label">Ciclo de vida de Phaser</span>Es esencial comprender el ciclo create/update/destroy antes de escribir logica de juego; saltear esto genera deuda tecnica dificil de resolver.</li>
            <li><span class="icon">⚙</span><span class="label">ES Modules sin bundler</span>Funciona bien para el MVP pero limita hot-reload e importaciones de npm. Evaluar Vite desde el inicio del proximo proyecto.</li>
            <li><span class="icon">⚙</span><span class="label">Separar dominio del motor</span>Aislar la logica pura de Phaser fue la decision tecnica mas valiosa: permitio testear con Node sin levantar el juego.</li>
            <li><span class="icon">⚙</span><span class="label">Niveles en JSON</span>Describir los niveles en formato de datos fue la decision de arquitectura mas escalable del proyecto.</li>
          </ul>
        </div>

        <div class="scrum-panel" id="lec-panel-right">
          <h3>De Equipo</h3>
          <ul class="scrum-list">
            <li><span class="icon">★</span><span class="label">Responsable unico por modulo</span>Asignar un dueno por cada area del codigo elimina la ambiguedad sobre quien decide y quien hace code review.</li>
            <li><span class="icon">★</span><span class="label">Reuniones con agenda preparada</span>Las reuniones donde el equipo llega con propuestas concretas son considerablemente mas productivas que las improvisadas.</li>
            <li><span class="icon">★</span><span class="label">Notion como fuente de verdad</span>Centralizar tareas, historias y decisiones en una sola herramienta elimina confusion y duplicacion de informacion.</li>
            <li><span class="icon">★</span><span class="label">Sprints cortos (2 semanas)</span>Los ciclos breves forzaron priorizar features reales sobre deseadas y facilitaron adaptarse a cambios de alcance.</li>
          </ul>
        </div>
      </div>
      ${CORNERS}
    `,
    onEnter: (sessionId) => {
      const leftH3 = document.querySelector('#lec-panel-left h3');
      const rightH3 = document.querySelector('#lec-panel-right h3');
      const leftItems = document.querySelectorAll('#lec-panel-left .scrum-list li');
      const rightItems = document.querySelectorAll('#lec-panel-right .scrum-list li');

      scheduleSession(() => { if (leftH3) leftH3.classList.add('animate-underline'); }, 300, sessionId);
      scheduleSession(() => { if (rightH3) rightH3.classList.add('animate-underline'); }, 500, sessionId);

      [...leftItems, ...rightItems].forEach((li, idx) => {
        scheduleSession(() => {
          li.classList.add('show');
          if (idx % 2 === 0) playSound('bip');
        }, 600 + idx * 140, sessionId);
      });
    }
  },

  // ========================================================
  // Slide 10: Acta de Cierre
  // ========================================================
  {
    id: 'slide-9',
    html: `
      <h2>Acta de Cierre del Proyecto</h2>

      <div class="closing-doc">
        <div class="closing-header">
          <div class="doc-title">ACTA DE CIERRE &mdash; GATITO CODE</div>
          <div class="doc-subtitle">Proyecto: Juego Educativo de Pensamiento Computacional</div>
          <div class="doc-date">
            Fecha: 27 de mayo de 2026 &nbsp;|&nbsp; Materia: Gestion de Proyectos<br>
            Equipo: Lisett Castillo &middot; Brian Herrera &middot; J. Luis Herrera &middot; Iara Baya &middot; Inti Taretto &middot; Lucas Gimenez
          </div>
        </div>

        <div class="closing-body">
          <div class="closing-section">
            <h4>&#10003; Entregables Alcanzados</h4>
            <ul class="closing-items" id="cierre-logros">
              <li>Prototipo jugable en navegador sin instalacion.</li>
              <li>Editor de niveles con soporte de clima y objetos.</li>
              <li>3 sprints completados con documentacion en Notion.</li>
              <li>Arquitectura en capas documentada y testeada.</li>
              <li>Niveles "Gym" y "Main" funcionales y jugables.</li>
              <li>11 tests unitarios del dominio con Vitest.</li>
            </ul>
          </div>

          <div class="closing-section">
            <h4>&#9201; Pendiente para Proxima Etapa</h4>
            <ul class="closing-items" id="cierre-pendiente">
              <li>Condicion de victoria al recolectar todos los objetos.</li>
              <li>Persistencia del progreso del jugador en localStorage.</li>
              <li>Efectos de sonido y feedback visual de bloqueo.</li>
              <li>Niveles pedagogicos completos (18 niveles).</li>
              <li>Pantalla de resultados al completar un nivel.</li>
            </ul>
          </div>
        </div>

        <div class="closing-footer">
          <p class="declaration">El equipo declara concluida la fase inicial de desarrollo del proyecto, con MVP funcional y base solida para continuar en iteraciones futuras.</p>
          <div class="closing-stamp" id="closing-stamp">APROBADO &#10003;</div>
        </div>
      </div>
      ${CORNERS}
    `,
    onEnter: (sessionId) => {
      const logros = document.querySelectorAll('#cierre-logros li');
      const pendiente = document.querySelectorAll('#cierre-pendiente li');
      const stamp = document.getElementById('closing-stamp');

      [...logros, ...pendiente].forEach((item, idx) => {
        scheduleSession(() => {
          item.classList.add('show');
          playSound('bip');
        }, 400 + idx * 130, sessionId);
      });

      const totalItems = logros.length + pendiente.length;
      scheduleSession(() => {
        if (stamp) {
          stamp.classList.add('show');
          playSound('pickup');
        }
      }, 400 + totalItems * 130 + 400, sessionId);
    }
  },

  // ========================================================
  // Slide 11: Evolucion de la Arquitectura
  // ========================================================
  {
    id: 'slide-10',
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
  // Slide 12: Tests Implementados (CRT Monitor)
  // ========================================================
  {
    id: 'slide-11',
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
  // Slide 13: Demo Visual (Arcade Machine)
  // ========================================================
  {
    id: 'slide-12',
    html: `
      <h2>Demo Visual</h2>
      <p class="text-center" style="margin-bottom: 0.3rem;">Identidad Visual del Juego &middot; Mapa de Muestra</p>
      <p class="text-center" style="font-size: 0.85rem; color: var(--accent); margin-bottom: 0.75rem;">Nuestro personaje principal recorre un mapa de ejemplo con la estetica pixel-art del juego.</p>

      <div class="arcade-machine">
        <div class="arcade-screen" id="demo-container"></div>
        <div class="arcade-controls">
          <div class="arcade-stick"></div>
          <div class="arcade-btn red"></div>
          <div class="arcade-btn blue"></div>
          <div class="arcade-btn green"></div>
        </div>
      </div>
      ${CORNERS}
    `,
    onEnter: () => {
      startDemo('demo-container');
    },
    onLeave: () => {
      stopDemo();
    }
  },

  // ========================================================
  // Slide 14: Gracias
  // ========================================================
  {
    id: 'slide-13',
    html: `
      <div style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; position:relative;">

        <div style="z-index:1; text-align:center; margin-bottom:1.5rem;">
          <h1 style="margin-bottom:0.5rem;">Gracias!</h1>
          <div style="display:flex; align-items:center; justify-content:center; gap:0.6rem;">
            <div class="thanks-flag"></div>
            <p style="font-size:1.1rem; text-shadow:0 0 8px var(--glow-cyan); margin:0;">Gestion de Proyectos &mdash; 2026</p>
            <div class="thanks-flag"></div>
          </div>
        </div>

        <div class="thanks-grid" id="thanks-grid" style="z-index:1; flex:none;"></div>

        <div class="dialog-box" style="z-index:1; margin-top:1.5rem; width:70%; max-width:750px; text-align:center; padding:1rem 1.5rem;">
          <p style="color:var(--text-primary); margin:0; font-size:0.85rem; line-height:1.7;">
            Proyecto desarrollado con Phaser 3, puro JavaScript y mucho pixel-art.<br>
            Assets: <span style="color:var(--accent-warm);">Cup Nooble &mdash; Sprout Lands</span>
          </p>
        </div>
      </div>
      ${CORNERS}
    `,
    onEnter: (sessionId) => {
      const members = [
        { name: "Brian Herrera",    pos: '0 0' },
        { name: "Lisett Castillo",  pos: '-72px 0' },
        { name: "Iara Baya",        pos: '-144px 0' },
        { name: "Luis Herrera",     pos: '-216px 0' },
        { name: "Inti Taretto",     pos: '-288px 0' },
        { name: "Lucas Gimenez",    pos: '-360px 0' }
      ];

      const grid = document.getElementById('thanks-grid');
      if (!grid) return;
      grid.innerHTML = '';

      members.forEach((m, idx) => {
        const el = document.createElement('div');
        el.className = 'thanks-member';
        el.innerHTML =
          '<div class="thanks-avatar" style="background-position: ' + m.pos + ';"></div>' +
          '<div class="thanks-name">' + m.name + '</div>';
        grid.appendChild(el);

        scheduleSession(() => {
          el.classList.add('show');
          playSound('blup');
        }, 300 + idx * 180, sessionId);
      });
    }
  }
];
