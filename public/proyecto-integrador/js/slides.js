import { playSound } from "../../presentacion-gestion/js/sound.js";
import { startDemo, stopDemo } from "../../presentacion-gestion/js/demo-game.js";
import { scheduleSession } from "../../presentacion-gestion/js/timers.js";

const AVATARS = [
  { pos: "0 0" },
  { pos: "-56px 0" },
  { pos: "-112px 0" },
  { pos: "-168px 0" },
  { pos: "-224px 0" },
  { pos: "-280px 0" },
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
    id: "slide-portada",
    html: `
      <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative;">
        <div style="z-index: 1; text-align: center;">
          <div id="cover-sprite"></div>
          <h1>GATITO CODE</h1>
          <p style="font-size: 1.15rem; margin-bottom: 0.2rem; text-shadow: 0 0 8px var(--glow-cyan); color: var(--accent-magenta);">Proyecto Integrador</p>
          <p style="font-size: 1rem; margin-top: 0; text-shadow: 0 0 8px var(--glow-cyan);">Un juego para aprender programacion</p>
        </div>

        <div class="dialog-box" style="z-index: 1; margin-top: 40px; width: 80%; max-width: 900px;">
          <p style="color: var(--accent-warm); margin-bottom: 8px; text-shadow: 1px 1px 0 #000;">Nuestra propuesta:</p>
          <div id="typewriter-text" style="font-size: 0.9rem; line-height: 1.8; color: var(--text-primary); min-height: 50px;"></div>
        </div>
      </div>
      ${CORNERS}
    `,
    onEnter: (sessionId) => {
      const text =
        "Gatito-Code es un videojuego educativo de pensamiento computacional con estetica pixel-art, destinado a ninos y ninas de 8 a 10 anos sin conocimientos previos de programacion. El juego estara disponible originalmente en la web, sin necesidad de instalar nada. El jugador guia a un gatito en un mapa de tiles, construyendo programas mediante bloques de instrucciones arrastrables (arriba, abajo, izquierda, derecha) para recolectar objetos y completar niveles.";
      const highlightedText = text
        .replace(
          "videojuego educativo",
          '<span style="color:var(--accent-warm);">videojuego educativo</span>',
        )
        .replace(
          "pensamiento computacional",
          '<span style="color:var(--accent);">pensamiento computacional</span>',
        )
        .replace(
          "pixel-art",
          '<span style="color:var(--green);">pixel-art</span>',
        )
        .replace(
          "en la web",
          '<span style="color:var(--accent-magenta);">en la web</span>',
        )
        .replace(
          "sin necesidad de instalar nada",
          '<span style="color:var(--green);">sin necesidad de instalar nada</span>',
        );
      const el = document.getElementById("typewriter-text");
      if (!el) return;
      el.innerHTML = "";
      let i = 0;
      function typeWriter() {
        if (i < text.length) {
          el.innerHTML += text.charAt(i);
          i++;
          if (i % 20 === 0) playSound("bip");
          scheduleSession(typeWriter, 6, sessionId);
        } else {
          el.innerHTML = highlightedText;
        }
      }
      scheduleSession(typeWriter, 300, sessionId);
    },
  },

  // ========================================================
  // Slide 2: Equipo (Party Select)
  // ========================================================
  {
    id: "slide-equipo",
    html: `
      <h2>Equipo de Desarrollo</h2>
      <p class="text-center" style="margin-bottom: 24px;">Conoce a los integrantes que hicieron posible Gatito Code.</p>

      <div class="party-grid" id="party-grid"></div>
      ${CORNERS}
    `,
    onEnter: (sessionId) => {
      const members = [
        {
          name: "Brian Herrera",
          emoji: "🧠",
          title: "Desarrollador",
          desc: "Programacion de la logica del juego, movimiento del jugador, colisiones y sistema de ejecucion de comandos.",
        },
        {
          name: "Lisett Castillo",
          emoji: "📋",
          title: "Scrum Master",
          desc: "Facilitacion de ceremonias agiles, gestion del backlog y aseguramiento del flujo de trabajo.",
        },
        {
          name: "Iara Baya",
          emoji: "🛠️",
          title: "Desarrolladora",
          desc: "Desarrollo del motor de tilemaps, sistema de clima y editor visual de niveles.",
        },
        {
          name: "Luis Herrera",
          emoji: "🎨",
          title: "Disenador UI/UX",
          desc: "Creacion de interfaces, paletas de colores, tipografia pixel-art y experiencia de usuario.",
        },
        {
          name: "Inti Taretto",
          emoji: "⚡",
          title: "Desarrollador",
          desc: "Implementacion de mecanicas de niveles, integracion de assets y optimizacion de rendimiento.",
        },
        {
          name: "Lucas Gimenez",
          emoji: "🔍",
          title: "QA y Documentacion",
          desc: "Diseno de casos de prueba, control de calidad y redaccion de documentacion tecnica.",
        },
      ];

      const grid = document.getElementById("party-grid");
      if (!grid) return;
      grid.innerHTML = "";

      members.forEach((m, idx) => {
        const slot = document.createElement("div");
        slot.className = "party-slot";
        const av = AVATARS[idx % AVATARS.length];
        slot.innerHTML = `
          <div class="party-avatar" style="background-position: ${av.pos};"></div>
          <div class="party-card">
            <div class="party-name">${m.name}</div>
            <div class="party-role"><span class="party-role-title">${m.emoji} ${m.title}</span> - ${m.desc}</div>
          </div>
        `;
        grid.appendChild(slot);

        scheduleSession(
          () => {
            slot.classList.add("show");
            playSound("blup");
          },
          200 + idx * 180,
          sessionId,
        );
      });
    },
  },

  // ========================================================
  // Slide 3: El Problema
  // ========================================================
  {
    id: "slide-problema",
    html: `
      <h2>El Problema</h2>
      <p class="text-center">Cuatro barreras que impiden que los ninos accedan al pensamiento computacional.</p>

      <div class="problem-cards">
        <div class="problem-card" id="problem-1">
          <div class="problem-icon">⚠</div>
          <div class="problem-stat">Se ensena demasiado tarde</div>
          <div class="problem-desc">En Argentina, la mayoria de los ninos no tiene contacto con pensamiento computacional antes del secundario. Se pierde la ventana clave de aprendizaje temprano.</div>
        </div>

        <div class="problem-card" id="problem-2">
          <div class="problem-icon">🌐</div>
          <div class="problem-stat">Las herramientas no hablan espanol</div>
          <div class="problem-desc">Scratch, Code.org y similares estan en ingles o tienen traducciones deficientes. Los ninos de 8 anos necesitan interfaces en su idioma nativo para aprender sin frustracion.</div>
        </div>

        <div class="problem-card" id="problem-3">
          <div class="problem-icon">🧑‍🏫</div>
          <div class="problem-stat">Sin guia, no hay autonomia</div>
          <div class="problem-desc">Muchos juegos de programacion tienen una curva de aprendizaje inicial que no permite autonomia real. Si no hay un tutor que guie paso a paso, el nino se traba y abandona.</div>
        </div>
        
        <div class="problem-card" id="problem-4">
          <div class="problem-icon">✖</div>
          <div class="problem-stat">El texto y la sintaxis asustan</div>
          <div class="problem-desc">Las interfaces basadas en codigo escrito generan frustracion inmediata en ninos sin experiencia previa. La barrera de entrada es demasiado alta.</div>
        </div>
      </div>

      <div class="dialog-box" style="margin-top:1rem; margin-bottom: 1.1rem; padding: 0.6rem 1.2rem; flex-shrink: 0;">
        <p style="color: var(--text-primary); margin: 0; font-size: 1rem; line-height: 1.6; text-align: center;">
          Gatito-Code nace para resolver estos cuatro problemas:
          <span style="color: var(--green);">accesible</span>,
          <span style="color: var(--accent);">en espanol</span>,
          <span style="color: var(--accent-warm);">sin texto</span>,
          <span style="color: var(--accent-magenta);">y divertido</span>.
        </p>
      </div>
      ${CORNERS}
    `,
    onEnter: (sessionId) => {
      const cards = document.querySelectorAll(".problem-card");
      cards.forEach((card, idx) => {
        scheduleSession(
          () => {
            card.classList.add("show");
            playSound("blup");
          },
          300 + idx * 250,
          sessionId,
        );
      });
    },
  },

  // ========================================================
  // Slide 4: La Solución
  // ========================================================
  {
    id: "slide-solucion",
    html: `
      <h2>La Solucion &mdash; Gatito Code</h2>
      <p class="text-center">Tres pilares que hacen del juego una herramienta educativa efectiva.</p>

      <div class="value-props">
        <div class="value-prop-item" id="vp-1">
          <div class="value-prop-icon">🎮</div>
          <div class="value-prop-text">
            <span class="value-prop-title">Programa sin escribir</span>
            <span class="value-prop-desc">El jugador arrastra bloques de instrucciones (arriba, abajo, izquierda, derecha, saltar) a una cola visual. Sin teclado, sin sintaxis, sin frustracion.</span>
          </div>
        </div>

        <div class="value-prop-item" id="vp-2">
          <div class="value-prop-icon">⚡</div>
          <div class="value-prop-text">
            <span class="value-prop-title">Feedback inmediato</span>
            <span class="value-prop-desc">Al ejecutar el programa, el gatito sigue las instrucciones paso a paso. El nino ve en tiempo real que hace cada comando y donde falla la secuencia.</span>
          </div>
        </div>

        <div class="value-prop-item" id="vp-3">
          <div class="value-prop-icon">🔄</div>
          <div class="value-prop-text">
            <span class="value-prop-title">Aprende del error</span>
            <span class="value-prop-desc">El log muestra que instruccion fallo y por que. Corregir y reintentar es parte del flujo natural del juego, no un castigo.</span>
          </div>
        </div>
      </div>

      <div class="pedagogy-loop" id="pedagogy-loop">
        Loop pedagogico: <span style="color: var(--accent-warm);">ver mapa</span> &rarr;
        <span style="color: var(--accent-warm);">armar secuencia</span> &rarr;
        <span style="color: var(--accent-warm);">ejecutar</span> &rarr;
        <span style="color: var(--accent-warm);">observar resultado</span> &rarr;
        <span style="color: var(--accent-warm);">corregir</span> &rarr;
        <span style="color: var(--accent-warm);">iterar</span>
      </div>
      ${CORNERS}
    `,
    onEnter: (sessionId) => {
      const items = document.querySelectorAll(".value-prop-item");
      items.forEach((item, idx) => {
        scheduleSession(
          () => {
            item.classList.add("show");
            playSound("blup");
          },
          300 + idx * 250,
          sessionId,
        );
      });
      scheduleSession(
        () => {
          const loop = document.getElementById("pedagogy-loop");
          if (loop) loop.classList.add("show");
        },
        300 + items.length * 250 + 200,
        sessionId,
      );
    },
  },

  // ========================================================
  // Slide 5: Público Objetivo
  // ========================================================
  {
    id: "slide-publico",
    html: `
      <h2>Publico Objetivo</h2>
      <p class="text-center">A quien le hablamos y en que contexto de mercado nos insertamos.</p>

      <div class="scrum-container">
        <div class="scrum-panel" id="publico-panel-left">
          <h3>Nuestro Jugador</h3>
          <ul class="scrum-list">
            <li><span class="icon">👦</span><span class="label">8 a 10 anos, hispanohablante</span>Ninos en etapa escolar primaria que leen textos cortos y manejan mouse o trackpad con soltura.</li>
            <li><span class="icon">🎯</span><span class="label">Sin experiencia previa</span>No conocen Scratch ni ningun lenguaje de programacion. Es su primer contacto con el pensamiento computacional.</li>
            <li><span class="icon">🧩</span><span class="label">Aprende mejor jugando</span>La gamificacion y la narrativa visual son mas efectivas que la instruccion textual a esta edad.</li>
            <li><span class="icon">🔓</span><span class="label">Necesita autonomia</span>Las primeras secciones del juego deben ser completables sin ayuda de un adulto ni instrucciones escritas complejas.</li>
          </ul>
        </div>

        <div class="scrum-panel" id="publico-panel-right">
          <h3>Contexto del Mercado</h3>
          <ul class="scrum-list">
            <li><span class="icon">📊</span><span class="label">Pocos juegos en espanol</span>El mercado de juegos educativos de programacion en espanol es escaso y dominado por traducciones parciales.</li>
            <li><span class="icon">🧱</span><span class="label">Scratch es complejo</span>Scratch requiere lectura en ingles y presenta una interfaz compleja para menores de 10 anos. Bastante dificil de manejar sin un tutor formado exclusivo.</li>
            <li><span class="icon">💰</span><span class="label">Alternativas pagas</span>Lightbot, Rodocodo y similares son pagos o tienen modelos freemium con contenido limitado.</li>
            <li><span class="icon">🚀</span><span class="label">Oportunidad clara</span>Un juego gratuito, en navegador, sin instalacion, 100% en espanol y con estetica atractiva no existe hoy.</li>
          </ul>
        </div>
      </div>
      ${CORNERS}
    `,
    onEnter: (sessionId) => {
      const leftH3 = document.querySelector("#publico-panel-left h3");
      const rightH3 = document.querySelector("#publico-panel-right h3");
      const leftItems = document.querySelectorAll(
        "#publico-panel-left .scrum-list li",
      );
      const rightItems = document.querySelectorAll(
        "#publico-panel-right .scrum-list li",
      );

      scheduleSession(
        () => {
          if (leftH3) leftH3.classList.add("animate-underline");
        },
        300,
        sessionId,
      );
      scheduleSession(
        () => {
          if (rightH3) rightH3.classList.add("animate-underline");
        },
        500,
        sessionId,
      );

      [...leftItems, ...rightItems].forEach((li, idx) => {
        scheduleSession(
          () => {
            li.classList.add("show");
            if (idx % 2 === 0) playSound("bip");
          },
          600 + idx * 120,
          sessionId,
        );
      });
    },
  },

  // ========================================================
  // Slide 6: Características del Producto
  // ========================================================
  {
    id: "slide-features",
    html: `
      <h2>Caracteristicas del Producto</h2>
      <p class="text-center">Funcionalidades clave que distinguen a Gatito-Code como herramienta educativa.</p>

      <div class="feature-showcase">
        <div class="feature-card" id="feat-1">
          <div class="feature-card-icon">📋</div>
          <div class="feature-card-title">Cola de Comandos</div>
          <div class="feature-card-desc">Arrastra instrucciones (arriba, abajo, izquierda, derecha, saltar) a una cola de hasta 5 slots para construir tu programa.</div>
        </div>

        <div class="feature-card" id="feat-2">
          <div class="feature-card-icon">ƒ</div>
          <div class="feature-card-title">Funciones</div>
          <div class="feature-card-desc">Agrupa bloques en subrutinas reutilizables con Function 1. Aprende abstraccion y reutilizacion sin escribir codigo.</div>
        </div>

        <div class="feature-card" id="feat-3">
          <div class="feature-card-icon">🗺</div>
          <div class="feature-card-title">Editor de Niveles</div>
          <div class="feature-card-desc">55 tilesets, 221+ sprites, sistema de clima, placement de objetos y spawn. Crea niveles personalizados sin codigo.</div>
        </div>

        <div class="feature-card" id="feat-4">
          <div class="feature-card-icon">📈</div>
          <div class="feature-card-title">Curva de Aprendizaje Guiada</div>
          <div class="feature-card-desc">Progresion pedagogica cuidada para jugadores sin experiencia: comienza con secuencias simples e introduce gradualmente loops, funciones y condicionales con desafios claros y feedback inmediato.</div>
        </div>

        <div class="feature-card" id="feat-5">
          <div class="feature-card-icon">💬</div>
          <div class="feature-card-title">Dialogos de Mision</div>
          <div class="feature-card-desc">Narrativa integrada con retratos de personajes para contextualizar cada nivel y guiar al jugador.</div>
        </div>

        <div class="feature-card" id="feat-6">
          <div class="feature-card-icon">🌐</div>
          <div class="feature-card-title">Sin Instalacion</div>
          <div class="feature-card-desc">Corre en cualquier navegador moderno. Sin descargas, sin cuentas, sin barreras de acceso.</div>
        </div>
      </div>
      ${CORNERS}
    `,
    onEnter: (sessionId) => {
      const cards = document.querySelectorAll(".feature-card");
      cards.forEach((card, idx) => {
        scheduleSession(
          () => {
            card.classList.add("show");
            playSound("blup");
          },
          300 + idx * 180,
          sessionId,
        );
      });
    },
  },

  // ========================================================
  // Slide 7: Demo Interactiva
  // ========================================================
  {
    id: "slide-demo",
    html: `
      <h2>Demo Visual</h2>
      <p class="text-center" style="margin-bottom: 0.3rem;">Identidad Visual del Juego</p>
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
      startDemo("demo-container");
    },
    onLeave: () => {
      stopDemo();
    },
  },

  // ========================================================
  // Slide 8: Arquitectura & Tecnologías
  // ========================================================
  {
    id: "slide-arquitectura",
    html: `
      <h2>Tecnologias</h2>
      <p class="text-center">Estructura en capas con separacion estricta entre logica pura y motor de renderizado.</p>

      <div class="architecture-container">
        <div class="tree-panel tree-current" style="flex: 3;">
          <h3>Arquitectura en Capas</h3>
          <div class="tree-content">
            <span class="dir">public/src/</span>
            ├── <span class="dir">config/</span>
            │   └── <span class="file">game.js</span>         <span class="comment"># Constantes: TILE, COLS, ROWS, STEP_MS, DIRS</span>
            ├── <span class="dir">domain/</span>             <span class="comment"># Puro JavaScript. Cero imports de Phaser.</span>
            │   ├── <span class="file">Player.js</span>       <span class="comment"># Estado de movimiento, colision, facing</span>
            │   ├── <span class="file">Level.js</span>        <span class="comment"># Geometria de grilla, solidos, spawn, objetos</span>
            │   └── <span class="file">Program.js</span>      <span class="comment"># Secuencia inmutable de comandos</span>
            ├── <span class="dir">engine/</span>             <span class="comment"># Todo lo que toca Phaser</span>
            │   ├── <span class="dir">scenes/</span>         <span class="comment"># Boot, Menu, Editor, TileLevelScene</span>
            │   ├── <span class="dir">levels/</span>         <span class="comment"># Gym, Main, Custom</span>
            │   ├── <span class="dir">entities/</span>       <span class="comment"># PlayerView, PickupView</span>
            │   ├── <span class="dir">level/</span>          <span class="comment"># TileRegistry, Loader, WeatherSystem</span>
            │   └── <span class="dir">program/</span>        <span class="comment"># ProgramExecutor</span>
            ├── <span class="dir">services/</span>
            │   └── <span class="file">Storage.js</span>      <span class="comment"># localStorage: niveles, progreso</span>
            └── <span class="dir">ui/</span>                 <span class="comment"># Modulos DOM: queue, dialog, mission</span>
          </div>
        </div>

        <div class="scrum-panel" style="flex: 2;" id="tech-panel">
          <h3>Stack Tecnologico</h3>
          <ul class="scrum-list">
            <li><span class="icon">🎮</span><span class="label">Phaser 3.80.1</span>Motor de juego 2D con soporte de tilemaps, fisicas y animaciones.</li>
            <li><span class="icon">📦</span><span class="label">ES Modules puros</span>Sin bundler ni build step. Servido estaticamente desde cualquier servidor HTTP.</li>
            <li><span class="icon">📄</span><span class="label">JSON Level Format</span>Niveles descritos como datos: tilesets, capas, spawn, objetos y clima.</li>
            <li><span class="icon">💾</span><span class="label">localStorage</span>Persistencia de niveles custom y overrides sin backend.</li>
            <li><span class="icon">🧪</span><span class="label">Vitest</span>Tests unitarios del dominio ejecutables con Node.</li>
            <li><span class="icon">🌐</span><span class="label">HTML/CSS/JS</span>UI del DOM sin framework. Comunicacion via globals.</li>
          </ul>
        </div>
      </div>
      ${CORNERS}
    `,
    onEnter: (sessionId) => {
      const h3 = document.querySelector("#tech-panel h3");
      const items = document.querySelectorAll("#tech-panel .scrum-list li");

      scheduleSession(
        () => {
          if (h3) h3.classList.add("animate-underline");
        },
        300,
        sessionId,
      );
      items.forEach((li, idx) => {
        scheduleSession(
          () => {
            li.classList.add("show");
            if (idx % 2 === 0) playSound("bip");
          },
          500 + idx * 140,
          sessionId,
        );
      });
    },
  },

  // ========================================================
  // Slide 9: Estado Actual del Desarrollo
  // ========================================================
  {
    id: "slide-estado",
    html: `
      <h2>Estado Actual del Desarrollo</h2>
      <p class="text-center">3 sprints ejecutados con entregas incrementales y 2 planificados para completar el producto.</p>

      <div class="stat-bar-container">
        <span class="stat-bar-label">Progreso Global</span>
        <div class="stat-bar-track"><div class="stat-bar-fill" id="global-progress" data-width="68"></div></div>
        <span class="stat-bar-value">27 / 40 tareas</span>
      </div>

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
          </ul>
        </div>

        <div class="sprint-card" id="sprint-card-4" style="border-color:var(--border-dim);">
          <div class="sprint-name" style="color:var(--text-dim);">Sprint 4&ndash;5</div>
          <div class="sprint-period">Proximas iteraciones</div>
          <div style="display:flex; align-items:center; gap:0.4rem;">
            <div class="progress-bar" style="flex:1;"><div class="progress-fill green" data-width="0"></div></div>
            <span style="color:var(--text-dim); font-size:0.7rem;">0/7</span>
          </div>
          <div class="sprint-status planned">PLANIFICADO</div>
          <ul class="sprint-tasks">
            <li>Niveles pedagogicos completos (18)</li>
            <li>Playtest con usuarios (8&ndash;10 anos)</li>
            <li>Pantalla de resultados</li>
            <li>Progresion entre niveles</li>
            <li>Despliegue publico (hosting)</li>
          </ul>
        </div>
      </div>

      ${CORNERS}
    `,
    onEnter: (sessionId) => {
      const cards = document.querySelectorAll(".sprint-card");
      cards.forEach((card, idx) => {
        scheduleSession(
          () => {
            card.classList.add("show");
            playSound("blup");
            const fill = card.querySelector(".progress-fill");
            if (fill) {
              const target = fill.dataset.width;
              scheduleSession(
                () => {
                  fill.style.width = target + "%";
                },
                80,
                sessionId,
              );
            }
          },
          300 + idx * 200,
          sessionId,
        );
      });

      scheduleSession(
        () => {
          const globalFill = document.getElementById("global-progress");
          if (globalFill)
            globalFill.style.width = globalFill.dataset.width + "%";
        },
        300 + cards.length * 200 + 300,
        sessionId,
      );
    },
  },

  // ========================================================
  // Slide 10: Roadmap del Producto
  // ========================================================
  {
    id: "slide-roadmap",
    html: `
      <h2>Roadmap del Producto</h2>
      <p class="text-center">Hoja de ruta desde el MVP actual hasta la expansion multiplataforma.</p>

      <div class="roadmap-timeline">
        <div class="roadmap-step done">
          <div class="roadmap-node">&#10003;</div>
          <div class="roadmap-line"></div>
          <div class="roadmap-card">
            <div class="roadmap-card-title">MVP Actual</div>
            <div class="roadmap-card-date">Mayo 2026</div>
            <ul class="roadmap-card-items">
              <li>Motor de juego jugable</li>
              <li>2 niveles funcionales</li>
              <li>Editor de niveles completo</li>
              <li>Sistema de clima (9 efectos)</li>
              <li>11 tests unitarios</li>
            </ul>
          </div>
        </div>

        <div class="roadmap-step active">
          <div class="roadmap-node">&#9654;</div>
          <div class="roadmap-line"></div>
          <div class="roadmap-card">
            <div class="roadmap-card-title">Playtest v1</div>
            <div class="roadmap-card-date">Junio 2026</div>
            <ul class="roadmap-card-items">
              <li>18 niveles pedagogicos</li>
              <li>Sistema de progresion</li>
              <li>Pantalla de victoria</li>
              <li>Sonidos y feedback</li>
            </ul>
          </div>
        </div>

        <div class="roadmap-step pending">
          <div class="roadmap-node">○</div>
          <div class="roadmap-line"></div>
          <div class="roadmap-card">
            <div class="roadmap-card-title">Beta Publica</div>
            <div class="roadmap-card-date">Julio 2026</div>
            <ul class="roadmap-card-items">
              <li>Hosting web publico</li>
              <li>Feedback visual de error</li>
              <li>Efectos de sonido completos</li>
            </ul>
          </div>
        </div>

        <div class="roadmap-step pending">
          <div class="roadmap-node">○</div>
          <div class="roadmap-line"></div>
          <div class="roadmap-card">
            <div class="roadmap-card-title">Lanzamiento v1.0</div>
            <div class="roadmap-card-date">Agosto 2026</div>
            <ul class="roadmap-card-items">
              <li>30+ niveles completos</li>
              <li>Bucles y condicionales</li>
              <li>Responsive basico</li>
            </ul>
          </div>
        </div>

        <div class="roadmap-step pending">
          <div class="roadmap-node">○</div>
          <div class="roadmap-card">
            <div class="roadmap-card-title">Expansion</div>
            <div class="roadmap-card-date">2026 &ndash; 2027</div>
            <ul class="roadmap-card-items">
              <li>Version mobile</li>
              <li>Publicacion en Steam</li>
              <li>Multiplayer cooperativo</li>
              <li>Editor publico de niveles</li>
            </ul>
          </div>
        </div>
      </div>
      ${CORNERS}
    `,
    onEnter: (sessionId) => {
      const steps = document.querySelectorAll(".roadmap-step");
      steps.forEach((step, idx) => {
        scheduleSession(
          () => {
            step.classList.add("show");
            playSound("blup");
          },
          300 + idx * 280,
          sessionId,
        );
      });
    },
  },

  // ========================================================
  // Slide 11: Estrategia de Lanzamiento
  // ========================================================
  {
    id: "slide-lanzamiento",
    html: `
      <h2>Estrategia de Lanzamiento</h2>
      <p class="text-center">Plataformas candidatas ordenadas por prioridad y viabilidad tecnica.</p>

      <div class="platform-grid">
        <div class="platform-card priority-high" id="plat-1">
          <div class="platform-icon">🎮</div>
          <div class="platform-name">itch.io</div>
          <div class="platform-badge high">PRIORIDAD ALTA</div>
          <ul class="platform-pros">
            <li>Costo cero de publicacion</li>
            <li>Publico indie receptivo</li>
            <li>Soporte nativo para juegos web</li>
          </ul>
          <hr class="platform-divider">
          <ul class="platform-cons">
            <li>Menor visibilidad mainstream</li>
            <li>Descubrimiento limitado</li>
          </ul>
        </div>

        <div class="platform-card priority-medium" id="plat-2">
          <div class="platform-icon">🖥</div>
          <div class="platform-name">Steam</div>
          <div class="platform-badge medium">FASE 2</div>
          <ul class="platform-pros">
            <li>Mayor audiencia de PC</li>
            <li>Sistema de reviews y comunidad</li>
            <li>Wishlists para traccion</li>
          </ul>
          <hr class="platform-divider">
          <ul class="platform-cons">
            <li>Fee de $100 USD por juego</li>
            <li>Requiere wrapper Electron</li>
          </ul>
        </div>

        <div class="platform-card priority-medium" id="plat-3">
          <div class="platform-icon">📱</div>
          <div class="platform-name">Play Store</div>
          <div class="platform-badge medium">FASE 2</div>
          <ul class="platform-pros">
            <li>Android domina en Latam</li>
            <li>Acceso masivo al publico objetivo</li>
            <li>Fee unico de $25 USD</li>
          </ul>
          <hr class="platform-divider">
          <ul class="platform-cons">
            <li>Requiere port a mobile</li>
            <li>Adaptacion de controles tactiles</li>
          </ul>
        </div>

        <div class="platform-card priority-low" id="plat-4">
          <div class="platform-icon">🍎</div>
          <div class="platform-name">Apple Store</div>
          <div class="platform-badge low">FASE 3</div>
          <ul class="platform-pros">
            <li>Mercado premium y curado</li>
            <li>Alta calidad percibida</li>
          </ul>
          <hr class="platform-divider">
          <ul class="platform-cons">
            <li>Fee de $99 USD por ano</li>
            <li>Requiere Mac para builds</li>
            <li>Review estricta de Apple</li>
          </ul>
        </div>
      </div>

      <div class="platform-note-card" id="launch-note">
        <div class="platform-note-title">Estrategia inicial de distribucion y feedback</div>
        <p>
          La demo se va a lanzar primero en <span style="color: var(--green);">itch.io</span> para recibir feedback temprano.
          Esta salida estara acompaniada por difusion en <span style="color: var(--accent);">LinkedIn</span> y
          <span style="color: var(--accent);">Reddit</span> para llegar a distintos perfiles de usuarios,
          agilizar reportes de bugs y sumar sugerencias reales de uso.
          En paralelo, se contempla como posibilidad de distribucion institucional el trabajo con
          <span style="color: var(--accent-warm);">escuelas publicas y privadas</span>.
          <span style="color: var(--accent-magenta);"> 🚀 🐞 💡 🏫</span>
        </p>
      </div>
      ${CORNERS}
    `,
    onEnter: (sessionId) => {
      const cards = document.querySelectorAll(".platform-card");
      cards.forEach((card, idx) => {
        scheduleSession(
          () => {
            card.classList.add("show");
            playSound("blup");
          },
          300 + idx * 220,
          sessionId,
        );
      });

      scheduleSession(
        () => {
          const note = document.getElementById("launch-note");
          if (note) note.classList.add("show");
        },
        300 + cards.length * 220 + 180,
        sessionId,
      );
    },
  },

  // ========================================================
  // Slide 12: Marketing & Monetización
  // ========================================================
  {
    id: "slide-marketing",
    html: `
      <h2>Marketing y Monetizacion</h2>
      <p class="text-center">Estrategia de difusion y modelo de ingresos alineado con la mision educativa.</p>

      <div class="scrum-container">
        <div class="scrum-panel" id="marketing-panel-left">
          <h3>Canales de Difusion</h3>
          <ul class="scrum-list">
            <li><span class="icon">📹</span><span class="label">Redes sociales</span>TikTok e Instagram con clips cortos de gameplay pixel-art. El formato visual encaja perfecto con estas plataformas.</li>
            <li><span class="icon">🏫</span><span class="label">Comunidades educativas</span>Docentes de programacion, grupos de padres homeschooling y foros de educacion STEAM en espanol.</li>
            <li><span class="icon">🎪</span><span class="label">Game jams y eventos indie</span>Participacion en jams de itch.io para ganar visibilidad organica en la comunidad de desarrollo.</li>
            <li><span class="icon">🎬</span><span class="label">YouTube educativo</span>Colaboraciones con canales de divulgacion de programacion y educacion en espanol.</li>
          </ul>
        </div>

        <div class="scrum-panel" id="marketing-panel-right">
          <h3>Modelo de Monetizacion</h3>
          <ul class="scrum-list">
            <li><span class="icon">🆓</span><span class="label">Base gratuita</span>Los niveles core del juego (18 niveles) son gratuitos y completos. Sin limite de tiempo ni funcionalidad reducida.</li>
            <li><span class="icon">⭐</span><span class="label">Pack premium ($2&ndash;5 USD)</span>Niveles avanzados, editor publico de niveles compartidos y tematicas adicionales (dungeon, winter, village).</li>
            <li><span class="icon">🚫</span><span class="label">Sin publicidad</span>El publico objetivo son ninos. La publicidad es incompatible con la experiencia educativa y la confianza de los padres.</li>
            <li><span class="icon">🏛</span><span class="label">Licencias educativas</span>Modelo institucional futuro: paquetes para escuelas con dashboard de progreso y metricas por alumno.</li>
          </ul>
        </div>
      </div>
      ${CORNERS}
    `,
    onEnter: (sessionId) => {
      const leftH3 = document.querySelector("#marketing-panel-left h3");
      const rightH3 = document.querySelector("#marketing-panel-right h3");
      const leftItems = document.querySelectorAll(
        "#marketing-panel-left .scrum-list li",
      );
      const rightItems = document.querySelectorAll(
        "#marketing-panel-right .scrum-list li",
      );

      scheduleSession(
        () => {
          if (leftH3) leftH3.classList.add("animate-underline");
        },
        300,
        sessionId,
      );
      scheduleSession(
        () => {
          if (rightH3) rightH3.classList.add("animate-underline");
        },
        500,
        sessionId,
      );

      [...leftItems, ...rightItems].forEach((li, idx) => {
        scheduleSession(
          () => {
            li.classList.add("show");
            if (idx % 2 === 0) playSound("bip");
          },
          600 + idx * 130,
          sessionId,
        );
      });
    },
  },

  // ========================================================
  // Slide 13: Cierre
  // ========================================================
  {
    id: "slide-cierre",
    html: `
      <div style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center;">

        <div style="text-align:center; margin-bottom:1.5rem;">
          <h1 style="margin-bottom:0.5rem;">Gatito Code</h1>
          <div style="display:flex; align-items:center; justify-content:center; gap:0.6rem;">
          <div class="thanks-flag"></div>
          <p style="font-size:1.1rem; text-shadow:0 0 8px var(--glow-cyan); margin:0;">Proyecto Integrador &mdash; 2026</p>
          <div class="thanks-flag"></div>
          </div>
          </div>
          
          <div class="thanks-grid" id="thanks-grid" style="flex:none;"></div>
          
          <div class="dialog-box" style="margin-top:1.1rem; width:70%; max-width:750px; text-align:center; padding:1rem 1.5rem;">
          <p style="color:var(--text-primary); margin:0; font-size:0.85rem; line-height:1.7;">
          Un juego hecho en Argentina para que los chicos aprendan a pensar como <span style="color:var(--green);">programadores</span>.<br>
          <span style="color:var(--accent-warm);">Disponible pronto en itch.io</span> &mdash; Preguntas?
          </p>
          </div>
          <h2 style="margin-bottom:5rem; font-size:5rem;">¡Muchas gracias!</h2>
      </div>
      ${CORNERS}
    `,
    onEnter: (sessionId) => {
      const members = [
        { name: "Brian Herrera", pos: "0 0" },
        { name: "Lisett Castillo", pos: "-72px 0" },
        { name: "Iara Baya", pos: "-144px 0" },
        { name: "Luis Herrera", pos: "-216px 0" },
        { name: "Inti Taretto", pos: "-288px 0" },
        { name: "Lucas Gimenez", pos: "-360px 0" },
      ];

      const grid = document.getElementById("thanks-grid");
      if (!grid) return;
      grid.innerHTML = "";

      members.forEach((m, idx) => {
        const el = document.createElement("div");
        el.className = "thanks-member";
        el.innerHTML =
          '<div class="thanks-avatar" style="background-position: ' +
          m.pos +
          ';"></div>' +
          '<div class="thanks-name">' +
          m.name +
          "</div>";
        grid.appendChild(el);

        scheduleSession(
          () => {
            el.classList.add("show");
            playSound("blup");
          },
          300 + idx * 180,
          sessionId,
        );
      });
    },
  },
];
