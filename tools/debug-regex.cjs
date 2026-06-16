const fs = require('fs');
const content = fs.readFileSync('public/src/engine/level/TileRegistry.js', 'utf8');
const m = content.match(/export const OBJECTS = \[([\s\S]*?)\];\s*\nexport const OBJECT_CATEGORIES/);
console.log('Match found:', !!m);
if (m) {
  console.log('Length:', m[1].length);
  console.log('First 500 chars:', m[1].substring(0, 500));
} else {
  // Buscar el indice de OBJECTS y OBJECT_CATEGORIES
  const idx1 = content.indexOf('export const OBJECTS');
  const idx2 = content.indexOf('export const OBJECT_CATEGORIES');
  console.log('OBJECTS index:', idx1);
  console.log('OBJECT_CATEGORIES index:', idx2);
  if (idx1 !== -1 && idx2 !== -1) {
    console.log('Between them:', content.substring(idx1, idx1 + 200));
  }
}
