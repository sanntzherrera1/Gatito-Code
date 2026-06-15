const fs = require('fs');
const path = 'C:/Users/brian/OneDrive/Desktop/Gatito-Code/public/src/engine/level/TileRegistry.js';
let content = fs.readFileSync(path, 'utf8');

const func = `

/**
 * Obtiene las dimensiones y ocupacion (occupyW/occupyH) de un frame especifico de un objeto.
 * Si el objeto tiene ` + '`frames`' + ` (atlas de rects variables generados por detect-props),
 * devuelve las dimensiones y ocupacion del frame indicado (pudiendo ser personalizadas por frame).
 * Si no, devuelve los valores por defecto basados en frameW/frameH y occupyW/occupyH globales.
 */
export function getFrameDimensions(objDef, frameIndex) {
  if (objDef?.frames && objDef.frames[frameIndex]) {
    const f = objDef.frames[frameIndex];
    const frameW = f.w;
    const frameH = f.h;
    const occupyW = f.occupyW ?? objDef.occupyW ?? Math.ceil(frameW / TILE);
    const occupyH = f.occupyH ?? objDef.occupyH ?? Math.ceil(frameH / TILE);
    return { frameW, frameH, occupyW, occupyH };
  }
  const frameW = objDef?.frameW ?? 16;
  const frameH = objDef?.frameH ?? 16;
  const occupyW = objDef?.occupyW ?? Math.ceil(frameW / TILE);
  const occupyH = objDef?.occupyH ?? Math.ceil(frameH / TILE);
  return { frameW, frameH, occupyW, occupyH };
}
`;

content = content.replace(/\];\r?\n\r?\n\r?\nexport function isSameTerrain\(gid, terrain\) \{/, '];' + func + '\n\nexport function isSameTerrain(gid, terrain) {');

fs.writeFileSync(path, content);
console.log('Added getFrameDimensions');
