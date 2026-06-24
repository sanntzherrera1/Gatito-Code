// Helpers de audio que aplican los volumenes configurados por el usuario
// (ver services/Settings.js). El volumen base de cada sonido se multiplica por
// el volumen de su categoria (musica / efectos), de 0 (mute) a 1 (full).

import * as Settings from '../services/Settings.js';

const MUSIC_BASE = 0.12;   // volumen base de la musica de fondo

/**
 * Reproduce musica de fondo en loop respetando el volumen de musica.
 * Se actualiza en vivo si el usuario mueve el slider, y se limpia al cerrar la escena.
 * @returns {Phaser.Sound.BaseSound}
 */
export function playMusic(scene, key) {
  const music = scene.sound.add(key, { loop: true, volume: MUSIC_BASE * Settings.getMusicVolume() });
  music.play();
  const off = Settings.onChange(() => {
    if (music && !music.pendingRemove) music.setVolume(MUSIC_BASE * Settings.getMusicVolume());
  });
  scene.events.once('shutdown', off);
  return music;
}

/** Reproduce un efecto puntual respetando el volumen de efectos. */
export function playSfx(scene, key, base = 0.15) {
  scene.sound.play(key, { volume: base * Settings.getSfxVolume() });
}

/** Conecta el sound manager de Phaser para que los botones DOM puedan emitir sonido. */
export function bindUiSfx(soundManager) {
  window.__playUiSfx = (key = 'ui_click') => {
    try { soundManager.play(key, { volume: 0.15 * Settings.getSfxVolume() }); } catch {}
  };
}
