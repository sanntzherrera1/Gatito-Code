import { playSound } from "../../presentacion-gestion/js/sound.js";
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

function gifPlaceholder(description, size = "normal") {
  const cls = {
    small:  "gif-placeholder-sm",
    large:  "gif-placeholder-lg",
    card:   "gif-placeholder-card",
  }[size] ?? "";
  return `<div class="gif-placeholder ${cls}">
    <div class="gif-placeholder-icon">🎬</div>
    <div class="gif-placeholder-text">${description}</div>
  </div>`;
}

export const SLIDES = [
  // ========================================================
  // Slide 1: Portada
  // 🎤 ORADOR: Presentarse brevemente como equipo, dejar que el typewriter termine y
  //    recalcar que el juego corre HOY en el navegador, sin instalar nada.
  // ========================================================
  {
    id: "slide-portada",
    html: `
      <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative;">
        <div style="z-index: 1; text-align: center; width: 100%;">
          <h1>GATITO CODE</h1>
          <p style="font-size: 1.3rem; margin-bottom: 0.2rem; text-shadow: 0 0 8px var(--glow-cyan); color: var(--accent-magenta);">Proyecto Integrador 2026</p>
          <p style="font-size: 1.1rem; margin-top: 0.3rem; text-shadow: 0 0 8px var(--glow-cyan); color: var(--accent);">Ayudá a Tito a resolver puzzles programando</p>
        </div>

        <div style="display: flex; gap: 2rem; align-items: center; margin-top: 1.5rem; width: 90%; max-width: 1000px; z-index: 1;">
          <div class="dialog-box" style="flex: 1;">
            <p style="color: var(--accent-warm); margin-bottom: 8px; text-shadow: 1px 1px 0 #000; font-size: 1rem;">Nuestra propuesta:</p>
            <div id="typewriter-text" style="font-size: 1rem; line-height: 1.8; color: var(--text-primary); min-height: 60px;"></div>
          </div>

          <!-- Tito + burbuja -->
          <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; flex-shrink: 0;">
            <div class="cover-bubble">
              <span style="font-size: 1.2rem;">¡Hola!</span><br>
              <span style="color: var(--text-primary); font-size: 0.9rem; line-height: 1.5;">Soy Tito.<br>¿Listos para programar?</span>
            </div>
            <div style="width: 288px; height: 288px; display: flex; align-items: center; justify-content: center; overflow: visible;">
              <div id="cover-sprite" style="margin: 0;"></div>
            </div>
          </div>
        </div>
      </div>
      ${CORNERS}
    `,
    onEnter: (sessionId) => {
      const text =
        "Un videojuego educativo de pensamiento computacional con estetica pixel-art, para ninos de 6 a 10 anos. El jugador guia a Tito construyendo programas con bloques arrastrables, sin necesidad de escribir codigo.";
      const highlightedText = text
        .replace("videojuego educativo", '<span style="color:var(--accent-warm);">videojuego educativo</span>')
        .replace("pensamiento computacional", '<span style="color:var(--accent);">pensamiento computacional</span>')
        .replace("pixel-art", '<span style="color:var(--green);">pixel-art</span>')
        .replace("bloques arrastrables", '<span style="color:var(--accent-magenta);">bloques arrastrables</span>')
        .replace("sin necesidad de escribir codigo", '<span style="color:var(--green);">sin necesidad de escribir codigo</span>');
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
  // 🎤 ORADOR: Cada integrante se presenta a sí mismo cuando aparece su card;
  //    mantenerlo dinámico y no leer los roles en voz alta.
  // ========================================================
  {
    id: "slide-equipo",
    html: `
      <h2>Equipo de Desarrollo</h2>
      <p class="text-center" style="font-size: 1.1rem; margin-bottom: 24px;">Las personas detras de Gatito Code.</p>

      <div class="party-grid" id="party-grid"></div>
      ${CORNERS}
    `,
    onEnter: (sessionId) => {
      const members = [
        { name: "Brian Herrera",   emoji: "🧠",  title: "Desarrollador"      },
        { name: "Lisett Castillo", emoji: "📋",  title: "Scrum Master"       },
        { name: "Iara Baya",       emoji: "🛠️",  title: "Desarrolladora"     },
        { name: "Luis Herrera",    emoji: "🎮",  title: "Diseñador de Juego" },
        { name: "Jose Martinez",   emoji: "⚡",  title: "Desarrollador"      },
      ];

      const grid = document.getElementById("party-grid");
      if (!grid) return;
      grid.innerHTML = "";

      const row1 = document.createElement("div");
      row1.className = "party-row";
      const row2 = document.createElement("div");
      row2.className = "party-row";
      grid.appendChild(row1);
      grid.appendChild(row2);

      members.forEach((m, idx) => {
        const slot = document.createElement("div");
        slot.className = "party-slot";
        const av = AVATARS[idx % AVATARS.length];
        slot.innerHTML = `
          <div class="party-avatar" style="background-position: ${av.pos};"></div>
          <div class="party-card">
            <div class="party-name">${m.name}</div>
            <div class="party-role-title">${m.emoji} ${m.title}</div>
          </div>
        `;
        (idx < 3 ? row1 : row2).appendChild(slot);

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
  // Slide 3: ¿Qué es Gatito Code? (NUEVO — elevator pitch)
  // 🎤 ORADOR: Mostrar el GIF mientras se explica el loop: "ven el mapa, arman
  //    el programa con bloques, le dan ejecutar, y Tito lo hace". Mantenerlo simple.
  // ========================================================
  {
    id: "slide-que-es",
    html: `
      <h2>¿Que es Gatito Code?</h2>

      <div class="elevator-pitch-layout">
        <div class="elevator-pitch-text">
          <div class="pitch-item" id="pitch-1">
            <div class="pitch-num">01</div>
            <div class="pitch-content">
              <span class="pitch-title">Un juego de puzzles</span>
              <span class="pitch-desc">Tito, el gatito protagonista, queda atrapado en laberintos de tiles. El jugador tiene que guiarlo hasta la salida.</span>
            </div>
          </div>
          <div class="pitch-item" id="pitch-2">
            <div class="pitch-num">02</div>
            <div class="pitch-content">
              <span class="pitch-title">Programar sin escribir</span>
              <span class="pitch-desc">Arrastras bloques (arriba, abajo, izquierda, derecha) a una cola, apretás ejecutar, y ves como Tito sigue tus instrucciones paso a paso.</span>
            </div>
          </div>
          <div class="pitch-item" id="pitch-3">
            <div class="pitch-num">03</div>
            <div class="pitch-content">
              <span class="pitch-title">Para chicos de 6 a 10 anos</span>
              <span class="pitch-desc">Sin texto de codigo, 100% en espanol, gratis y directo en el navegador. Sin instalar nada.</span>
            </div>
          </div>
          <div class="pitch-item" id="pitch-4">
            <div class="pitch-num">04</div>
            <div class="pitch-content">
              <span class="pitch-title">Ensenando sin que se den cuenta</span>
              <span class="pitch-desc">Secuencias, funciones, loops y condicionales: los fundamentos del pensamiento computacional envueltos en gameplay.</span>
            </div>
          </div>
        </div>

        <div class="elevator-pitch-visual">
          ${gifPlaceholder("GIF: Loop completo de gameplay — el jugador arrastra bloques a la cola, presiona Ejecutar, y Tito recorre el mapa recolectando todos los objetos", "large")}
        </div>
      </div>
      ${CORNERS}
    `,
    onEnter: (sessionId) => {
      const items = document.querySelectorAll(".pitch-item");
      items.forEach((item, idx) => {
        scheduleSession(
          () => {
            item.classList.add("show");
            playSound("blup");
          },
          200 + idx * 250,
          sessionId,
        );
      });
    },
  },

  // ========================================================
  // Slide 4: El Problema
  // 🎤 ORADOR: Ir card por card preguntando "¿quién conoce Scratch? ¿está en español?".
  //    Conectar cada barrera con algo que el público ya conoce o vivió.
  // ========================================================
  {
    id: "slide-problema",
    html: `
      <h2>El Problema</h2>
      <p class="text-center" style="font-size: 1.05rem;">Cuatro barreras que impiden que los ninos accedan al pensamiento computacional.</p>

      <div class="problem-cards">
        <div class="problem-card" id="problem-1">
          <div class="problem-icon">⚠</div>
          <div class="problem-stat">Se ensena demasiado tarde</div>
          <div class="problem-desc">En Argentina, la mayoria de los ninos no tiene contacto con pensamiento computacional antes del secundario. Se pierde la ventana clave de aprendizaje temprano.</div>
        </div>

        <div class="problem-card" id="problem-2">
          <div class="problem-icon">🌐</div>
          <div class="problem-stat">Las herramientas no hablan espanol</div>
          <div class="problem-desc">Scratch, Code.org y similares estan en ingles o tienen traducciones deficientes. Los ninos de 6 a 10 anos necesitan interfaces en su idioma nativo.</div>
        </div>

        <div class="problem-card" id="problem-3">
          <div class="problem-icon">🧑‍🏫</div>
          <div class="problem-stat">Sin guia, no hay autonomia</div>
          <div class="problem-desc">Muchos juegos de programacion tienen una curva de aprendizaje que no permite autonomia real. Sin un tutor, el nino se traba y abandona.</div>
        </div>

        <div class="problem-card" id="problem-4">
          <div class="problem-icon">✖</div>
          <div class="problem-stat">El texto y la sintaxis asustan</div>
          <div class="problem-desc">Las interfaces basadas en codigo escrito generan frustracion inmediata en ninos sin experiencia previa. La barrera de entrada es demasiado alta.</div>
        </div>
      </div>

      <div class="dialog-box" style="margin-top:1rem; margin-bottom: 1.1rem; padding: 0.6rem 1.2rem; flex-shrink: 0;">
        <p style="color: var(--text-primary); margin: 0; font-size: 1.05rem; line-height: 1.6; text-align: center;">
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
  // Slide 5: La Solución — con GIF por pilar
  // 🎤 ORADOR: Por cada pilar, señalar el GIF y explicar cómo se ve eso en el juego.
  //    Los tres pilares son: sin escribir código, feedback inmediato, aprender del error.
  // ========================================================
  {
    id: "slide-solucion",
    html: `
      <h2>Como lo resuelve Tito</h2>
      <div class="pedagogy-loop" style="margin-top:0; margin-bottom:0.75rem; opacity:1;">
        Loop pedagogico: <span style="color: var(--accent-warm);">ver mapa</span> &rarr;
        <span style="color: var(--accent-warm);">armar secuencia</span> &rarr;
        <span style="color: var(--accent-warm);">ejecutar</span> &rarr;
        <span style="color: var(--accent-warm);">observar resultado</span> &rarr;
        <span style="color: var(--accent-warm);">corregir</span> &rarr;
        <span style="color: var(--accent-warm);">iterar</span>
      </div>

      <div class="solution-grid">
        <div class="value-prop-item" id="vp-1" style="display:flex; flex-direction:row; align-items:center; gap:1rem;">
          <div style="flex:0 0 55%;">
            <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.4rem;">
              <div class="value-prop-icon">🎮</div>
              <span class="value-prop-title" style="font-size:1rem;">Programa sin escribir</span>
            </div>
            <span class="value-prop-desc" style="font-size:0.9rem;">El jugador arrastra bloques de instrucciones a una cola visual. Sin teclado, sin sintaxis, sin frustracion.</span>
          </div>
          ${gifPlaceholder("GIF: Mano arrastrando bloques (↑ ↓ ← →) a la cola de comandos", "small")}
        </div>

        <div class="value-prop-item" id="vp-2" style="display:flex; flex-direction:row; align-items:center; gap:1rem;">
          <div style="flex:0 0 55%;">
            <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.4rem;">
              <div class="value-prop-icon">⚡</div>
              <span class="value-prop-title" style="font-size:1rem;">Feedback inmediato</span>
            </div>
            <span class="value-prop-desc" style="font-size:0.9rem;">Al ejecutar, Tito sigue las instrucciones paso a paso. El nino ve en tiempo real que hace cada comando y donde falla la secuencia.</span>
          </div>
          ${gifPlaceholder("GIF: Tito ejecutando la cola paso a paso, cada bloque se ilumina al ejecutarse", "small")}
        </div>

        <div class="value-prop-item" id="vp-3" style="display:flex; flex-direction:row; align-items:center; gap:1rem;">
          <div style="flex:0 0 55%;">
            <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.4rem;">
              <div class="value-prop-icon">🔄</div>
              <span class="value-prop-title" style="font-size:1rem;">Aprende del error</span>
            </div>
            <span class="value-prop-desc" style="font-size:0.9rem;">El log muestra que instruccion fallo y por que. Corregir y reintentar es parte del flujo natural del juego, no un castigo.</span>
          </div>
          ${gifPlaceholder("GIF: Tito choca con una pared, el bloque fallido se marca en rojo, el jugador corrige y reintenta", "small")}
        </div>
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
          300 + idx * 280,
          sessionId,
        );
      });
    },
  },

  // ========================================================
  // Slide 6: Público Objetivo
  // 🎤 ORADOR: Enfocar la mitad del tiempo en "la oportunidad": no existe hoy un juego
  //    gratuito, en español y sin instalación para este rango etario.
  // ========================================================
  {
    id: "slide-publico",
    html: `
      <h2>Publico Objetivo</h2>
      <p class="text-center" style="font-size: 1.05rem;">A quien le hablamos y en que contexto de mercado nos insertamos.</p>

      <div class="scrum-container">
        <div class="scrum-panel" id="publico-panel-left">
          <h3>Nuestro Jugador</h3>
          <ul class="scrum-list">
            <li><span class="icon">👦</span><span class="label">6 a 10 anos, hispanohablante</span>Ninos en etapa escolar primaria que manejan mouse o trackpad con soltura.</li>
            <li><span class="icon">🎯</span><span class="label">Sin experiencia previa</span>No conocen Scratch ni ningun lenguaje de programacion. Es su primer contacto con el pensamiento computacional.</li>
            <li><span class="icon">🧩</span><span class="label">Aprende mejor jugando</span>La gamificacion y la narrativa visual son mas efectivas que la instruccion textual a esta edad.</li>
            <li><span class="icon">🔓</span><span class="label">Necesita autonomia</span>Las primeras secciones del juego son completables sin ayuda de un adulto ni instrucciones escritas complejas.</li>
          </ul>
        </div>

        <div class="scrum-panel" id="publico-panel-right">
          <h3>Contexto del Mercado</h3>
          <ul class="scrum-list">
            <li><span class="icon">📊</span><span class="label">Pocos juegos en espanol</span>El mercado de juegos educativos de programacion en espanol es escaso y dominado por traducciones parciales.</li>
            <li><span class="icon">🧱</span><span class="label">Scratch es complejo</span>Requiere lectura en ingles y tiene una interfaz compleja para menores de 10. Muy dificil sin un tutor.</li>
            <li><span class="icon">💰</span><span class="label">Alternativas pagas</span>Lightbot, Rodocodo y similares tienen modelos freemium con contenido muy limitado.</li>
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

      scheduleSession(() => { if (leftH3) leftH3.classList.add("animate-underline"); }, 300, sessionId);
      scheduleSession(() => { if (rightH3) rightH3.classList.add("animate-underline"); }, 500, sessionId);

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
  // Slide 7: El juego por dentro — Features con GIFs
  // 🎤 ORADOR: Recorrer las 6 cards brevemente; el GIF habla por sí solo en cada una.
  //    Destacar el editor de niveles como diferenciador: el jugador también puede crear.
  // ========================================================
  {
    id: "slide-features",
    html: `
      <h2>El Juego por Dentro</h2>
      <p class="text-center" style="font-size: 1.05rem;">Las funcionalidades que hacen de Gatito-Code una herramienta educativa real.</p>

      <div class="feature-showcase">
        <div class="feature-card" id="feat-1">
          <div class="feature-card-icon">📋</div>
          <div class="feature-card-title">Cola de Comandos</div>
          ${gifPlaceholder("Arrastrando bloques ↑ ↓ ← → a los slots de la cola y presionando Ejecutar", "card")}
        </div>

        <div class="feature-card" id="feat-2">
          <div class="feature-card-icon">ƒ</div>
          <div class="feature-card-title">Funciones</div>
          ${gifPlaceholder("Armando una Funcion con 3 bloques, luego llamandola varias veces desde la cola principal", "card")}
        </div>

        <div class="feature-card" id="feat-3">
          <div class="feature-card-icon">🗺</div>
          <div class="feature-card-title">Editor de Niveles</div>
          ${gifPlaceholder("Pintando tiles en el mapa, colocando pickups y ajustando el clima desde el editor", "card")}
        </div>

        <div class="feature-card" id="feat-4">
          <div class="feature-card-icon">📈</div>
          <div class="feature-card-title">Curva Guiada</div>
          ${gifPlaceholder("Comparacion lado a lado: nivel 0 (camino recto) vs nivel avanzado (laberinto con condicionales)", "card")}
        </div>

        <div class="feature-card" id="feat-5">
          <div class="feature-card-icon">💬</div>
          <div class="feature-card-title">Dialogos de Mision</div>
          ${gifPlaceholder("Dialogo del tutorial apareciendo con el texto de mision antes de empezar el nivel", "card")}
        </div>

        <div class="feature-card" id="feat-6">
          <div class="feature-card-icon">🌐</div>
          <div class="feature-card-title">Sin Instalacion</div>
          ${gifPlaceholder("Abriendo el navegador, escribiendo la URL y el juego cargando directo sin instalacion", "card")}
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
  // Slide 8: Estado Actual del Desarrollo
  // 🎤 ORADOR: Ir sprint por sprint en 30 segundos; el foco es mostrar ritmo y
  //    velocidad de entrega. La barra global del 56% cierra el mensaje.
  // ========================================================
  {
    id: "slide-estado",
    html: `
      <h2>Estado Actual del Desarrollo</h2>
      <p class="text-center" style="font-size: 1.05rem;">3 sprints completados con entregas incrementales y 1 en progreso para completar el producto.</p>

      <div class="stat-bar-container">
        <span class="stat-bar-label">Progreso Global</span>
        <div class="stat-bar-track"><div class="stat-bar-fill" id="global-progress" data-width="63"></div></div>
        <span class="stat-bar-value">30 / 48 tareas</span>
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

        <div class="sprint-card completed" id="sprint-card-3">
          <div class="sprint-name">Sprint 3</div>
          <div class="sprint-period">18 may &rarr; 31 may</div>
          <div style="display:flex; align-items:center; gap:0.4rem;">
            <div class="progress-bar" style="flex:1;"><div class="progress-fill green" data-width="100"></div></div>
            <span style="color:var(--green); font-size:0.7rem;">12/12</span>
          </div>
          <div class="sprint-status done">COMPLETADO</div>
          <ul class="sprint-tasks">
            <li>Ejecucion de niveles custom</li>
            <li>Modularizacion de dialogos</li>
            <li>Pickups definidos en JSON</li>
            <li>Animaciones de sprites</li>
            <li>Condicion de victoria</li>
          </ul>
        </div>

        <div class="sprint-card partial" id="sprint-card-4">
          <div class="sprint-name">Sprint 4&ndash;6</div>
          <div class="sprint-period">Junio &rarr; 2027</div>
          <div style="display:flex; align-items:center; gap:0.4rem;">
            <div class="progress-bar" style="flex:1;"><div class="progress-fill cyan" data-width="13"></div></div>
            <span style="color:var(--accent); font-size:0.7rem;">2/15</span>
          </div>
          <div class="sprint-status progress">EN PROGRESO</div>
          <ul class="sprint-tasks">
            <li>Niveles pedagogicos progresivos</li>
            <li>Sistema de progresion</li>
            <li>Pantalla de victoria</li>
            <li>Sonidos y feedback visual</li>
            <li>Hosting web publico</li>
            <li>Playtest con usuarios reales</li>
            <li>30+ niveles completos</li>
            <li>Bucles y condicionales</li>
            <li>Version mobile</li>
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
              scheduleSession(() => { fill.style.width = target + "%"; }, 80, sessionId);
            }
          },
          300 + idx * 200,
          sessionId,
        );
      });

      scheduleSession(
        () => {
          const globalFill = document.getElementById("global-progress");
          if (globalFill) globalFill.style.width = globalFill.dataset.width + "%";
        },
        300 + cards.length * 200 + 300,
        sessionId,
      );
    },
  },

  // ========================================================
  // Slide 9: Roadmap del Producto
  // 🎤 ORADOR: Señalar los ✓ completados con orgullo y detenerse en el nodo activo
  //    (Playtest v1) para anticipar qué viene en las próximas semanas.
  // ========================================================
  {
    id: "slide-roadmap",
    html: `
      <h2>Roadmap del Producto</h2>
      <p class="text-center" style="font-size: 1.05rem;">Hoja de ruta desde la infraestructura tecnica hasta la expansion multiplataforma.</p>

      <div class="roadmap-timeline">
        <div class="roadmap-step done">
          <div class="roadmap-node">&#10003;</div>
          <div class="roadmap-line"></div>
          <div class="roadmap-card">
            <div class="roadmap-card-title">Infraestructura Tecnica</div>
            <div class="roadmap-card-date">Abril 2026</div>
            <ul class="roadmap-card-items">
              <li>55 tilesets registrados</li>
              <li>221+ sprites y animaciones</li>
              <li>JSON Level Format</li>
              <li>Tests unitarios con Vitest</li>
            </ul>
          </div>
        </div>

        <div class="roadmap-step done">
          <div class="roadmap-node">&#10003;</div>
          <div class="roadmap-line"></div>
          <div class="roadmap-card">
            <div class="roadmap-card-title">Motor Jugable</div>
            <div class="roadmap-card-date">Abr &ndash; May 2026</div>
            <ul class="roadmap-card-items">
              <li>Motor Phaser funcional</li>
              <li>2 niveles jugables</li>
              <li>Editor visual de niveles</li>
              <li>Sistema de clima (9 efectos)</li>
            </ul>
          </div>
        </div>

        <div class="roadmap-step done">
          <div class="roadmap-node">&#10003;</div>
          <div class="roadmap-line"></div>
          <div class="roadmap-card">
            <div class="roadmap-card-title">Experiencia de Usuario</div>
            <div class="roadmap-card-date">Mayo 2026</div>
            <ul class="roadmap-card-items">
              <li>Cola de comandos visual</li>
              <li>Drag &amp; drop de instrucciones</li>
              <li>Animaciones de sprites</li>
              <li>Y-sorting 2D</li>
            </ul>
          </div>
        </div>

        <div class="roadmap-step done">
          <div class="roadmap-node">&#10003;</div>
          <div class="roadmap-line"></div>
          <div class="roadmap-card">
            <div class="roadmap-card-title">Playtest v1</div>
            <div class="roadmap-card-date">Junio 2026</div>
            <ul class="roadmap-card-items">
              <li>Niveles pedagogicos</li>
              <li>Sistema de progresion</li>
              <li>Pantalla de victoria</li>
              <li>Sonidos y feedback</li>
            </ul>
          </div>
        </div>

        <div class="roadmap-step active">
          <div class="roadmap-node">&#9654;</div>
          <div class="roadmap-line"></div>
          <div class="roadmap-card">
            <div class="roadmap-card-title">Beta Publica</div>
            <div class="roadmap-card-date">Junio 2026</div>
            <ul class="roadmap-card-items">
              <li>Hosting web publico</li>
              <li>Playtest con usuarios</li>
              <li>Feedback visual de error</li>
            </ul>
          </div>
        </div>

        <div class="roadmap-step pending">
          <div class="roadmap-node">○</div>
          <div class="roadmap-line"></div>
          <div class="roadmap-card">
            <div class="roadmap-card-title">Lanzamiento v1.0</div>
            <div class="roadmap-card-date">Julio 2026</div>
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
              <li>Steam &amp; Play Store</li>
              <li>Editor publico</li>
              <li>Multiplayer cooperativo</li>
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
  // Slide 10: Lanzamiento & Monetización (FUSIONADO)
  // 🎤 ORADOR: Arrancar por itch.io como primer paso concreto y realista; luego
  //    explicar el modelo freemium como decisión pedagógica, no solo económica.
  // ========================================================
  {
    id: "slide-lanzamiento",
    html: `
      <h2>Lanzamiento y Monetizacion</h2>
      <p class="text-center" style="font-size: 1.05rem;">Donde vamos a llegar y como nos sostenemos.</p>

      <div class="launch-mono-layout">
        <div class="launch-platforms-col">
          <h3 style="color: var(--accent-warm); margin-bottom: 0.75rem; font-size: 1.1rem;">Plataformas</h3>
          <div class="platform-card priority-high" style="margin-bottom: 0.5rem; opacity:1; transform:none;" id="plat-1">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span style="font-size:1.2rem;">🎮</span>
              <span class="platform-name" style="font-size:0.95rem;">itch.io</span>
              <span class="platform-badge high" style="margin-left:auto;">AHORA</span>
            </div>
            <p style="font-size:0.8rem; color:var(--text-primary); margin:0.3rem 0 0;">Costo cero, publico indie receptivo, soporte nativo para juegos web.</p>
          </div>
          <div class="platform-card priority-medium" style="margin-bottom: 0.5rem; opacity:1; transform:none;" id="plat-2">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span style="font-size:1.2rem;">🖥</span>
              <span class="platform-name" style="font-size:0.95rem;">Steam</span>
              <span class="platform-badge medium" style="margin-left:auto;">FASE 2</span>
            </div>
            <p style="font-size:0.8rem; color:var(--text-primary); margin:0.3rem 0 0;">Mayor audiencia PC, reviews y wishlists. Fee de $100 USD.</p>
          </div>
          <div class="platform-card priority-medium" style="opacity:1; transform:none;" id="plat-3">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span style="font-size:1.2rem;">📱</span>
              <span class="platform-name" style="font-size:0.95rem;">Play Store</span>
              <span class="platform-badge medium" style="margin-left:auto;">FASE 2</span>
            </div>
            <p style="font-size:0.8rem; color:var(--text-primary); margin:0.3rem 0 0;">Android domina en Latam. Acceso masivo al publico objetivo. Fee de $25 USD.</p>
          </div>
        </div>

        <div class="launch-model-col">
          <h3 style="color: var(--accent-warm); margin-bottom: 0.75rem; font-size: 1.1rem;">Modelo de Ingresos</h3>
          <div class="launch-model-item" id="model-1">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span style="font-size:1.2rem;">🆓</span>
              <span style="color:var(--green); font-weight:bold; font-size:0.95rem;">Base gratuita</span>
            </div>
            <p style="font-size:0.82rem; color:var(--text-primary); margin:0.2rem 0 0;">Los niveles core del juego son gratuitos y completos, sin limites de funcionalidad.</p>
          </div>
          <div class="launch-model-item" id="model-2">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span style="font-size:1.2rem;">⭐</span>
              <span style="color:var(--accent-warm); font-weight:bold; font-size:0.95rem;">Pack premium ($2&ndash;5 USD)</span>
            </div>
            <p style="font-size:0.82rem; color:var(--text-primary); margin:0.2rem 0 0;">Niveles avanzados, editor publico compartido y tematicas adicionales (dungeon, winter, village).</p>
          </div>
          <div class="launch-model-item" id="model-3">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span style="font-size:1.2rem;">🚫</span>
              <span style="color:#ff7e7e; font-weight:bold; font-size:0.95rem;">Sin publicidad</span>
            </div>
            <p style="font-size:0.82rem; color:var(--text-primary); margin:0.2rem 0 0;">El publico son ninos. La publicidad es incompatible con la experiencia educativa y la confianza de los padres.</p>
          </div>
          <div class="launch-model-item" id="model-4">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span style="font-size:1.2rem;">🏛</span>
              <span style="color:var(--accent); font-weight:bold; font-size:0.95rem;">Licencias educativas</span>
            </div>
            <p style="font-size:0.82rem; color:var(--text-primary); margin:0.2rem 0 0;">Futuro: paquetes para escuelas con dashboard de progreso y metricas por alumno.</p>
          </div>

          <div style="margin-top: 0.75rem; padding: 0.5rem 0.75rem; background: var(--bg-surface); border: 2px solid var(--border-bright); border-left: 4px solid var(--accent-magenta); border-radius: 6px; font-size: 0.8rem; line-height: 1.5; color: var(--text-primary);">
            📣 Difusion via <span style="color:var(--accent);">TikTok/Instagram</span>, comunidades docentes, game jams en itch.io y YouTube educativo en espanol.
          </div>
        </div>
      </div>
      ${CORNERS}
    `,
    onEnter: (sessionId) => {
      const items = document.querySelectorAll(".launch-model-item");
      items.forEach((item, idx) => {
        scheduleSession(
          () => {
            item.classList.add("show");
            playSound("bip");
          },
          300 + idx * 180,
          sessionId,
        );
      });
    },
  },

  // ========================================================
  // Slide 11: Tecnologías (simplificado)
  // 🎤 ORADOR: Mantenerlo muy breve; el punto clave es "cero dependencias externas,
  //    corre en cualquier browser". No entrar en detalle técnico de cada capa.
  // ========================================================
  {
    id: "slide-tecnologias",
    html: `
      <h2>Tecnologias</h2>
      <p class="text-center" style="font-size: 1.05rem;">El stack que hace posible Gatito-Code, elegido para simplificar el desarrollo y maximizar el alcance.</p>

      <div class="tech-grid" id="tech-panel">
        <div class="tech-item" id="tech-1">
          <div class="tech-item-icon">🎮</div>
          <div class="tech-item-name">Phaser 3</div>
          <div class="tech-item-desc">Motor de juego 2D para la web. Maneja tilemaps, fisicas, animaciones y particulas.</div>
        </div>
        <div class="tech-item" id="tech-2">
          <div class="tech-item-icon">📦</div>
          <div class="tech-item-name">ES Modules puros</div>
          <div class="tech-item-desc">Sin bundler ni build step. El juego corre directo desde un servidor HTTP estatico.</div>
        </div>
        <div class="tech-item" id="tech-3">
          <div class="tech-item-icon">📄</div>
          <div class="tech-item-name">JSON Level Format</div>
          <div class="tech-item-desc">Niveles como datos: tilesets, capas, spawn, objetos y clima. Facil de editar y compartir.</div>
        </div>
        <div class="tech-item" id="tech-4">
          <div class="tech-item-icon">💾</div>
          <div class="tech-item-name">localStorage</div>
          <div class="tech-item-desc">Persistencia de niveles custom y progreso del jugador sin necesidad de backend.</div>
        </div>
        <div class="tech-item" id="tech-5">
          <div class="tech-item-icon">🧪</div>
          <div class="tech-item-name">Vitest</div>
          <div class="tech-item-desc">Tests unitarios del dominio del juego ejecutables con Node, sin necesidad del browser.</div>
        </div>
        <div class="tech-item" id="tech-6">
          <div class="tech-item-icon">🌐</div>
          <div class="tech-item-name">HTML / CSS / JS</div>
          <div class="tech-item-desc">La UI del juego (cola de comandos, dialogos, editor) es DOM puro, sin framework.</div>
        </div>
      </div>
      ${CORNERS}
    `,
    onEnter: (sessionId) => {
      const items = document.querySelectorAll(".tech-item");
      items.forEach((item, idx) => {
        scheduleSession(
          () => {
            item.classList.add("show");
            if (idx % 2 === 0) playSound("bip");
          },
          300 + idx * 160,
          sessionId,
        );
      });
    },
  },

  // ========================================================
  // Slide 12: Cierre con QR
  // 🎤 ORADOR: Agradecer, mostrar el QR en pantalla y invitar a la audiencia a
  //    probarlo en su celular mientras se abre el espacio de preguntas.
  // ========================================================
  {
    id: "slide-cierre",
    html: `
      <div style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center;">

        <div style="text-align:center; margin-bottom:1.2rem;">
          <h1 style="margin-bottom:0.3rem;">Gatito Code</h1>
          <div style="display:flex; align-items:center; justify-content:center; gap:0.6rem;">
            <div class="thanks-flag"></div>
            <p style="font-size:1.15rem; text-shadow:0 0 8px var(--glow-cyan); margin:0; color: var(--accent);">Proyecto Integrador &mdash; 2026</p>
            <div class="thanks-flag"></div>
          </div>
        </div>

        <div class="thanks-grid" id="thanks-grid" style="flex:none;"></div>

        <div style="display:flex; gap:2rem; align-items:center; margin-top:1.2rem; width:85%; max-width:900px;">
          <div class="dialog-box" style="flex:1; text-align:center; padding:0.9rem 1.2rem;">
            <p style="color:var(--text-primary); margin:0; font-size:0.92rem; line-height:1.7;">
              Un juego hecho en Argentina para que los chicos aprendan a pensar como <span style="color:var(--green);">programadores</span>.
            </p>
            <p style="color:var(--accent-warm); margin:0.5rem 0 0; font-size:1rem; font-weight:bold;">Pronto en itch.io &mdash; ¡Escaneá el QR y probalo!</p>
          </div>

          <div class="qr-placeholder">
            <div class="qr-placeholder-inner">
              <div class="qr-placeholder-icon">📱</div>
              <div class="qr-placeholder-text">QR Code<br><span style="color:var(--text-dim); font-size:0.7rem;">Link al juego<br>en itch.io</span></div>
            </div>
          </div>
        </div>

        <h2 style="margin-top:1.2rem; font-size:3.5rem; text-shadow: 0 0 20px var(--glow-gold);">¡Muchas gracias!</h2>
      </div>
      ${CORNERS}
    `,
    onEnter: (sessionId) => {
      const members = [
        { name: "Brian Herrera",   pos: "0 0"      },
        { name: "Lisett Castillo", pos: "-72px 0"  },
        { name: "Iara Baya",       pos: "-144px 0" },
        { name: "Luis Herrera",    pos: "-216px 0" },
        { name: "Jose Martinez",   pos: "-288px 0" },
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
