const SOUNDS = {
  bip: '../../assets/SproutLands-SorrySprites/Audio/bip_1.wav',
  blup: '../../assets/SproutLands-SorrySprites/Audio/blup_1.wav',
  squick: '../../assets/SproutLands-SorrySprites/Audio/squick_1.wav',
  pickup: '../../assets/SproutLands-SorrySprites/Audio/blup_2.wav'
};

const audioElements = {};
const activeClones = [];

export function initSounds() {
  for (const [key, path] of Object.entries(SOUNDS)) {
    const audio = new Audio(path);
    audio.volume = 0.4;
    audioElements[key] = audio;
  }
}

export function playSound(key) {
  const audio = audioElements[key];
  if (!audio) return;

  const clone = audio.cloneNode();
  clone.volume = audio.volume;
  
  // Track active clone so we can stop it later
  activeClones.push(clone);
  
  clone.addEventListener('ended', () => {
    const idx = activeClones.indexOf(clone);
    if (idx !== -1) activeClones.splice(idx, 1);
  });
  
  clone.play().catch(e => console.warn('Audio play failed:', e));
}

export function stopAllSounds() {
  // Stop all tracked clones
  for (const clone of activeClones) {
    clone.pause();
    clone.currentTime = 0;
  }
  activeClones.length = 0;
  
  // Also pause the master elements to prevent any pending playback
  for (const audio of Object.values(audioElements)) {
    audio.pause();
    audio.currentTime = 0;
  }
}
