import { SLIDES } from './slides.js';
import { transitionTo } from '../../presentacion-gestion/js/transitions.js';
import { initSounds, stopAllSounds } from '../../presentacion-gestion/js/sound.js';
import { clearAllTimers, setSessionId } from '../../presentacion-gestion/js/timers.js';


let currentSlideIndex = 0;
const slideElements = [];
let isTransitioning = false;
let soundsInitialized = false;
let slideSessionId = 0;

function init() {
  const container = document.getElementById('presentation-container');

  SLIDES.forEach((slideDef) => {
    const el = document.createElement('div');
    el.className = 'slide';
    el.id = slideDef.id;
    el.innerHTML = slideDef.html;
    container.appendChild(el);
    slideElements.push(el);
  });

  updateCounter();

  document.getElementById('btn-prev').addEventListener('click', () => {
    initAudioContext();
    prevSlide();
  });

  document.getElementById('btn-next').addEventListener('click', () => {
    initAudioContext();
    nextSlide();
  });

  window.addEventListener('keydown', (e) => {
    initAudioContext();
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      goToSlide(0);
    }
  });

  goToSlide(0, true);
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

  slideSessionId++;
  setSessionId(slideSessionId);

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

function updateCounter() {
  const display = document.getElementById('slide-counter-display');
  if (display) {
    display.innerHTML = `<span id="slide-counter">${currentSlideIndex + 1}</span><span class="sep">/</span><span>${SLIDES.length}</span>`;
  }
}

window.addEventListener('DOMContentLoaded', init);
