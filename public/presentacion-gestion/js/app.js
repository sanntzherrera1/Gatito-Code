import { SLIDES } from './slides.js';
import { transitionTo } from './transitions.js';
import { initSounds, stopAllSounds } from './sound.js';
import { clearAllTimers, setSessionId } from './timers.js';

let currentSlideIndex = 0;
const slideElements = [];
let isTransitioning = false;
let soundsInitialized = false;
let slideSessionId = 0;

const NEXT_KEYS = new Set(['arrowright', ' ', 'spacebar', 'enter', 'pagedown', 'n', 'right']);
const PREV_KEYS = new Set(['arrowleft', 'pageup', 'p', 'left']);
const NEXT_CODES = new Set(['ArrowRight', 'PageDown', 'NumpadEnter']);
const PREV_CODES = new Set(['ArrowLeft', 'PageUp']);

function init() {
  const container = document.getElementById('presentation-container');
  container.tabIndex = -1;
  
  // Render all slides into DOM
  SLIDES.forEach((slideDef) => {
    const el = document.createElement('div');
    el.className = 'slide';
    el.id = slideDef.id;
    el.innerHTML = slideDef.html;
    container.appendChild(el);
    slideElements.push(el);
  });

  updateCounter();
  
  // Event listeners
  document.getElementById('btn-prev').addEventListener('click', () => {
    initAudioContext();
    prevSlide();
  });
  
  document.getElementById('btn-next').addEventListener('click', () => {
    initAudioContext();
    nextSlide();
  });

  const onKeyNavigation = (e) => {
    if (handleKeyNavigation(e)) return;
  };

  // Captura en window y document para mejorar compatibilidad con remotos USB/Bluetooth.
  window.addEventListener('keydown', onKeyNavigation, true);
  document.addEventListener('keydown', onKeyNavigation, true);

  // Muchos punteros/controles de presentacion emulan un clic izquierdo.
  // Se navega por zonas: izquierda = anterior, derecha = siguiente.
  container.addEventListener('pointerup', (e) => {
    handlePointerNavigation(e);
  });

  // Fallback global: algunos remotos disparan click fuera del contenedor visible.
  document.addEventListener('click', (e) => {
    if (!(e instanceof MouseEvent)) return;
    handlePointerNavigation(e);
  }, true);

  document.addEventListener('pointerup', (e) => {
    handlePointerNavigation(e);
  }, true);

  // Mantiene el foco para que keydown llegue incluso tras cambiar de ventana.
  window.addEventListener('focus', () => {
    container.focus({ preventScroll: true });
  });

  container.addEventListener('pointerdown', () => {
    container.focus({ preventScroll: true });
  });

  container.focus({ preventScroll: true });

  // Start at slide 0
  goToSlide(0, true);
}

function handleKeyNavigation(e) {
  const key = normalizeKey(e.key);
  if (!key && !e.code) return false;

  initAudioContext();

  if (NEXT_KEYS.has(key) || NEXT_CODES.has(e.code)) {
    e.preventDefault();
    nextSlide();
    return true;
  }

  if (PREV_KEYS.has(key) || PREV_CODES.has(e.code)) {
    e.preventDefault();
    prevSlide();
    return true;
  }

  return false;
}

function handlePointerNavigation(e) {
    if (e.button !== 0) return;
    if (isInteractiveTarget(e.target)) return;
    if (isTransitioning) return;

    initAudioContext();
    const midX = window.innerWidth / 2;
    if (e.clientX < midX) {
      prevSlide();
    } else {
      nextSlide();
    }
}

function normalizeKey(key) {
  if (typeof key !== 'string') return '';
  return key.toLowerCase();
}

function initAudioContext() {
  if (!soundsInitialized) {
    initSounds();
    soundsInitialized = true;
  }
}

async function nextSlide() {
  if (isTransitioning || currentSlideIndex >= SLIDES.length - 1) return;
  await goToSlide(currentSlideIndex + 1);
}

async function prevSlide() {
  if (isTransitioning || currentSlideIndex <= 0) return;
  await goToSlide(currentSlideIndex - 1);
}

async function goToSlide(index, immediate = false) {
  if (index < 0 || index >= SLIDES.length) return;
  if (isTransitioning) return;
  
  // Generate new session ID to invalidate old callbacks
  slideSessionId++;
  setSessionId(slideSessionId);
  
  // Stop all sounds and timers from previous slide
  stopAllSounds();
  clearAllTimers();
  
  const oldIndex = currentSlideIndex;
  const oldDef = SLIDES[oldIndex];
  const oldEl = slideElements[oldIndex];
  
  currentSlideIndex = index;
  const newDef = SLIDES[currentSlideIndex];
  const newEl = slideElements[currentSlideIndex];
  
  const direction = currentSlideIndex > oldIndex ? 1 : -1;
  
  isTransitioning = true;
  updateCounter();

  if (oldDef && oldDef.onLeave && !immediate) {
    oldDef.onLeave();
  }

  // Reset animation state before the new slide becomes visible.
  resetSlideAnimations(newEl);

  if (immediate) {
    if (oldEl) oldEl.classList.remove('active');
    newEl.classList.add('active');
  } else {
    await transitionTo(oldEl, newEl, direction);
  }

  if (newDef && newDef.onEnter) {
    newDef.onEnter(slideSessionId);
  }
  
  isTransitioning = false;
}

function resetSlideAnimations(slideEl) {
  slideEl.querySelectorAll('.show').forEach(el => el.classList.remove('show'));
  slideEl.querySelectorAll('.animate-underline').forEach(el => el.classList.remove('animate-underline'));
  slideEl.querySelectorAll('.progress-fill').forEach(el => { el.style.width = '0'; });
}

function isInteractiveTarget(target) {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest('button, a, input, select, textarea, [role="button"], [data-no-slide-nav="true"]'));
}

function updateCounter() {
  const display = document.getElementById('slide-counter-display');
  if (display) {
    display.innerHTML = `<span id="slide-counter">${currentSlideIndex + 1}</span><span class="sep">/</span><span>${SLIDES.length}</span>`;
  }
}

window.addEventListener('DOMContentLoaded', init);
