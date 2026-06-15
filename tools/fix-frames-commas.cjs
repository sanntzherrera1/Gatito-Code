const fs = require('fs');

const filePath = 'public/src/engine/level/TileRegistry.js';
let content = fs.readFileSync(filePath, 'utf8');

// Función para corregir comas en un array de frames
function fixFramesCommas(text) {
  // Buscar bloques de frames: [ ... ]
  const framesRegex = /(frames:\s*\[)([\s\S]*?)(\])/g;
  
  return text.replace(framesRegex, (match, start, framesContent, end) => {
    const lines = framesContent.split('\n');
    const newLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Si la línea termina con } y no tiene coma, y la siguiente línea empieza con { o es parte de un array
      if (trimmed.endsWith('}') && !trimmed.endsWith('},')) {
        // Verificar si la siguiente línea no vacía empieza con { o es el cierre ]
        let nextLine = '';
        for (let j = i + 1; j < lines.length; j++) {
          const nextTrimmed = lines[j].trim();
          if (nextTrimmed !== '') {
            nextLine = nextTrimmed;
            break;
          }
        }
        
        // Si la siguiente línea empieza con {, agregar coma
        if (nextLine.startsWith('{')) {
          newLines.push(line.replace(/\}$/, '},'));
        } else {
          newLines.push(line);
        }
      } else {
        newLines.push(line);
      }
    }
    
    return start + newLines.join('\n') + end;
  });
}

const newContent = fixFramesCommas(content);

if (newContent !== content) {
  fs.writeFileSync(filePath, newContent);
  console.log('✅ Comas corregidas en los frames de TileRegistry.js');
} else {
  console.log('ℹ️ No se encontraron cambios necesarios');
}

// Verificar que no hay objetos sin comas
const framesCheck = newContent.match(/frames:\s*\[[\s\S]*?\]/g);
let issues = 0;
if (framesCheck) {
  for (const block of framesCheck) {
    const lines = block.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (trimmed.endsWith('}') && !trimmed.endsWith('},') && !trimmed.endsWith('}')) {
        // Verificar siguiente línea
        for (let j = i + 1; j < lines.length; j++) {
          const nextTrimmed = lines[j].trim();
          if (nextTrimmed !== '' && nextTrimmed.startsWith('{')) {
            console.log(`❌ Falta coma en: ${trimmed}`);
            issues++;
            break;
          } else if (nextTrimmed !== '' && !nextTrimmed.startsWith('{')) {
            break;
          }
        }
      }
    }
  }
}

if (issues === 0) {
  console.log('✅ Todos los frames tienen comas correctamente');
} else {
  console.log(`⚠️ Encontrados ${issues} frames sin comas`);
}
