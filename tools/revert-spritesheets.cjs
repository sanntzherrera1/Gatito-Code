const fs = require('fs');
const { execSync } = require('child_process');

const filePath = 'public/src/engine/level/TileRegistry.js';

// Lista de objetos que deben ser spritesheets (usados en animaciones)
const spritesheetObjects = [
  'door_animation',
  'fire_animation',
  'bat_animations',
  'small_bat_animations',
  'boats',
  'chicken',
  'chicken_brown',
  'chicken_blue',
  'chicken_green',
  'chicken_red',
  'chicken_baby',
  'chicken_baby_blue',
  'chicken_baby_brown',
  'chicken_baby_green',
  'chicken_baby_red',
];

// Obtener las definiciones originales del git
const originalDefs = {};
for (const key of spritesheetObjects) {
  try {
    const output = execSync(
      `git show HEAD:public/src/engine/level/TileRegistry.js | Select-String -Pattern "key: '${key}'" -Context 0,5`,
      { encoding: 'utf8', shell: 'powershell' }
    );
    const lines = output.split('\n').filter(l => l.includes('key:') || l.includes('cols:') || l.includes('rows:') || l.includes('frameW:') || l.includes('frameH:') || l.includes('category:'));
    
    if (lines.length > 0) {
      originalDefs[key] = lines.join('\n');
    }
  } catch (e) {
    console.warn(`⚠️ No se pudo obtener definicion original para ${key}`);
  }
}

console.log('Definiciones originales encontradas:', Object.keys(originalDefs).length);
console.log(originalDefs);
