const fs = require('fs');
const content = fs.readFileSync('public/src/engine/level/TileRegistry.js', 'utf8');
const idx = content.indexOf('export const OBJECTS');
const endIdx = content.indexOf('export const OBJECT_CATEGORIES', idx);
const section = content.substring(idx, endIdx);

// Encontrar cada objeto individual
const objectRegex = /\{ key: '([^']+)',([\s\S]*?)\n\s*\},?\n/g;
let match;
const issues = [];
while ((match = objectRegex.exec(section)) !== null) {
  const key = match[1];
  const objContent = match[2];
  
  if (objContent.includes('frames:')) {
    const framesMatch = objContent.match(/frames: \[([\s\S]*?)\]/);
    if (framesMatch) {
      const framesStr = framesMatch[1];
      // Contar frames
      const frameCount = (framesStr.match(/\{ x:/g) || []).length;
      
      // Buscar cols/rows originales comentados o en el objeto
      const colsMatch = objContent.match(/cols:\s*(\d+)/);
      const rowsMatch = objContent.match(/rows:\s*(\d+)/);
      
      if (colsMatch && rowsMatch) {
        const expected = parseInt(colsMatch[1]) * parseInt(rowsMatch[1]);
        if (frameCount !== expected) {
          issues.push(`${key}: tiene ${frameCount} frames, esperados ${expected} (cols:${colsMatch[1]} rows:${rowsMatch[1]})`);
        }
      } else if (frameCount === 1) {
        // Si solo tiene 1 frame y no hay cols/rows, podría ser correcto o incorrecto
        // No reportamos esto
      }
    }
  }
}

console.log('Objetos con frames inconsistentes:', issues.length);
issues.forEach(i => console.log(i));
