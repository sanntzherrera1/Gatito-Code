const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TILE_REGISTRY_PATH = 'public/src/engine/level/TileRegistry.js';
const DETECT_PROPS_PATH = 'tools/detect-props.cjs';
const ASSETS_DIR = 'public/assets';

// Leer archivo
let content = fs.readFileSync(TILE_REGISTRY_PATH, 'utf8');

// Extraer todos los objetos de OBJECTS
const objectsRegex = /export const OBJECTS = \[([\s\S]*?)\];\s*\nexport const OBJECT_CATEGORIES/;
const objectsMatch = content.match(objectsRegex);
if (!objectsMatch) {
  console.error('No se encontro OBJECTS');
  process.exit(1);
}

const objectsSection = objectsMatch[1];

// Encontrar cada objeto individual
const objectRegex = /\{ key: '([^']+)',([\s\S]*?)\n\s*\},?\n/g;
let match;
const objects = [];

while ((match = objectRegex.exec(objectsSection)) !== null) {
  const key = match[1];
  const objContent = match[2];
  const fullMatch = match[0];
  
  // Verificar si tiene cols y no tiene frames ya definidos
  if (objContent.includes('cols:') && !objContent.includes('frames:')) {
    // Extraer url
    const urlMatch = objContent.match(/url: '([^']+)'/);
    const url = urlMatch ? urlMatch[1] : null;
    
    // Extraer propiedades
    const colsMatch = objContent.match(/cols:\s*(\d+)/);
    const rowsMatch = objContent.match(/rows:\s*(\d+)/);
    const frameWMatch = objContent.match(/frameW:\s*(\d+)/);
    const frameHMatch = objContent.match(/frameH:\s*(\d+)/);
    const occupyWMatch = objContent.match(/occupyW:\s*(\d+)/);
    const occupyHMatch = objContent.match(/occupyH:\s*(\d+)/);
    
    if (colsMatch && rowsMatch && frameWMatch && frameHMatch) {
      objects.push({
        key,
        url,
        cols: parseInt(colsMatch[1]),
        rows: parseInt(rowsMatch[1]),
        frameW: parseInt(frameWMatch[1]),
        frameH: parseInt(frameHMatch[1]),
        occupyW: occupyWMatch ? parseInt(occupyWMatch[1]) : undefined,
        occupyH: occupyHMatch ? parseInt(occupyHMatch[1]) : undefined,
        originalMatch: fullMatch,
        objContent
      });
    }
  }
}

console.log(`Encontrados ${objects.length} objetos para convertir`);

// Buscar archivo PNG correspondiente (case-insensitive)
function findAssetFile(url) {
  if (!url) return null;
  
  const urlPath = url.replace(/\//g, path.sep);
  const fullPath = path.join(ASSETS_DIR, urlPath);
  
  // Si existe exactamente
  if (fs.existsSync(fullPath)) {
    return fullPath;
  }
  
  // Buscar case-insensitive
  const dir = path.dirname(fullPath);
  const fileName = path.basename(fullPath);
  
  if (!fs.existsSync(dir)) {
    // Buscar directorio case-insensitive
    const parts = dir.split(path.sep);
    let currentPath = parts[0];
    for (let i = 1; i < parts.length; i++) {
      if (!fs.existsSync(currentPath)) return null;
      const entries = fs.readdirSync(currentPath);
      const found = entries.find(e => e.toLowerCase() === parts[i].toLowerCase());
      if (!found) return null;
      currentPath = path.join(currentPath, found);
    }
    
    // Buscar archivo case-insensitive en el directorio
    const entries = fs.readdirSync(currentPath);
    const found = entries.find(e => e.toLowerCase() === fileName.toLowerCase());
    if (found) {
      return path.join(currentPath, found);
    }
  } else {
    const entries = fs.readdirSync(dir);
    const found = entries.find(e => e.toLowerCase() === fileName.toLowerCase());
    if (found) {
      return path.join(dir, found);
    }
  }
  
  return null;
}

// Ejecutar detect-props para cada objeto
const results = {};
for (const obj of objects) {
  const assetPath = findAssetFile(obj.url);
  if (!assetPath) {
    console.warn(`⚠️ Archivo no encontrado para ${obj.key}: ${obj.url}`);
    // Generar frames manualmente basados en grilla
    results[obj.key] = generateManualFrames(obj);
    continue;
  }
  
  try {
    const output = execSync(`node "${DETECT_PROPS_PATH}" "${assetPath}"`, { 
      encoding: 'utf8', 
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 30000
    });
    
    // Parsear el output
    const framesMatch = output.match(/frames \(para TileRegistry\.js OBJECTS\):\n([\s\S]*)/);
    if (framesMatch) {
      const frames = JSON.parse(framesMatch[1]);
      const expectedFrames = obj.cols * obj.rows;
      
      // Si detect-props devolvio 1 frame pero esperamos multiples, usar grilla manual
      if (frames.length === 1 && expectedFrames > 1) {
        console.log(`⚠️ ${obj.key}: detect-props fusiono en 1 frame, usando grilla manual (${expectedFrames} frames)`);
        results[obj.key] = generateManualFrames(obj);
      } else if (frames.length !== expectedFrames) {
        console.log(`⚠️ ${obj.key}: detect-props devolvio ${frames.length} frames, esperados ${expectedFrames}. Usando detect-props de todos modos.`);
        results[obj.key] = addOccupyProps(frames, obj);
      } else {
        results[obj.key] = addOccupyProps(frames, obj);
      }
    } else {
      console.warn(`⚠️ No se pudo parsear output para ${obj.key}`);
      results[obj.key] = generateManualFrames(obj);
    }
  } catch (e) {
    console.error(`❌ Error ejecutando detect-props para ${obj.key}:`, e.message);
    results[obj.key] = generateManualFrames(obj);
  }
}

function generateManualFrames(obj) {
  const frames = [];
  for (let row = 0; row < obj.rows; row++) {
    for (let col = 0; col < obj.cols; col++) {
      const frame = {
        x: col * obj.frameW,
        y: row * obj.frameH,
        w: obj.frameW,
        h: obj.frameH
      };
      if (obj.occupyW !== undefined) frame.occupyW = obj.occupyW;
      if (obj.occupyH !== undefined) frame.occupyH = obj.occupyH;
      frames.push(frame);
    }
  }
  return frames;
}

function addOccupyProps(frames, obj) {
  return frames.map(f => {
    const frame = { ...f };
    if (obj.occupyW !== undefined) frame.occupyW = obj.occupyW;
    if (obj.occupyH !== undefined) frame.occupyH = obj.occupyH;
    return frame;
  });
}

// Generar el nuevo contenido
let newObjectsSection = objectsSection;

for (const obj of objects) {
  const frames = results[obj.key];
  if (!frames) continue;
  
  // Construir el nuevo objeto sin cols, rows, frameW, frameH
  const lines = obj.originalMatch.split('\n');
  const newLines = [];
  
  for (const line of lines) {
    // Saltar propiedades que vamos a reemplazar
    if (line.includes('cols:') || line.includes('rows:') || 
        line.includes('frameW:') || line.includes('frameH:')) {
      continue;
    }
    newLines.push(line);
  }
  
  // Insertar frames antes de la ultima linea (el cierre del objeto)
  const framesStr = JSON.stringify(frames, null, 2);
  // Formatear para que coincida con el estilo del archivo
  const framesFormatted = framesStr
    .replace(/"x":/g, 'x:')
    .replace(/"y":/g, 'y:')
    .replace(/"w":/g, 'w:')
    .replace(/"h":/g, 'h:')
    .replace(/"occupyW":/g, 'occupyW:')
    .replace(/"occupyH":/g, 'occupyH:')
    .replace(/"/g, '');
  
  // Insertar frames con indentacion correcta
  const indent = '    ';
  const framesLines = framesFormatted.split('\n').map((l, i) => {
    if (i === 0) return `${indent}frames: ${l}`;
    return `${indent}${l}`;
  });
  
  // Insertar antes de la ultima linea (cierre)
  newLines.splice(newLines.length - 1, 0, ...framesLines);
  
  const newObj = newLines.join('\n');
  newObjectsSection = newObjectsSection.replace(obj.originalMatch, newObj);
}

// Reemplazar la seccion en el contenido completo
const newContent = content.replace(objectsSection, newObjectsSection);

fs.writeFileSync(TILE_REGISTRY_PATH, newContent);
console.log(`✅ TileRegistry.js actualizado con ${objects.length} objetos convertidos a frames`);
