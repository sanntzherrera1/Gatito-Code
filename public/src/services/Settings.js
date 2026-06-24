// Preferencias de usuario (volumen de musica y de efectos), persistidas en
// localStorage. Lo consumen el helper de audio (engine/audio.js) y la pantalla
// de Configuracion del menu (engine/scenes/MenuScene.js).

const KEY = 'gatito_settings';
const defaults = { musicVolume: 1, sfxVolume: 1, language: 'es' };

let state = load();
const listeners = new Set();

function load() {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
  catch { return { ...defaults }; }
}
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}
function emit() {
  for (const cb of listeners) { try { cb(state); } catch {} }
}
const clamp = v => Math.max(0, Math.min(1, Number(v) || 0));

export function getMusicVolume() { return state.musicVolume; }
export function getSfxVolume()   { return state.sfxVolume; }
export function setMusicVolume(v) { state.musicVolume = clamp(v); persist(); emit(); }
export function setSfxVolume(v)   { state.sfxVolume = clamp(v); persist(); emit(); }

export function getLanguage() {
  const lang = state.language;
  return (lang === 'es' || lang === 'en') ? lang : 'es';
}
export function setLanguage(lang) {
  if (lang !== 'es' && lang !== 'en') return;
  if (state.language === lang) return;
  state.language = lang;
  persist();
  emit();
}

/** Suscribe a cambios; devuelve una funcion para desuscribirse. */
export function onChange(cb) { listeners.add(cb); return () => listeners.delete(cb); }
