const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const TILE_REGISTRY_PATH = path.join(__dirname, '..', 'public', 'src', 'engine', 'level', 'TileRegistry.js');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

function decode(file) {
  const buf = fs.readFileSync(file);
  let p = 8, w, h, bd, ct;
  const idat = [];
  let plte = null, trns = null;

  while (p < buf.length) {
    const len = buf.readUInt32BE(p);
    const type = buf.toString('ascii', p + 4, p + 8);
    const data = buf.slice(p + 8, p + 8 + len);

    if (type === 'IHDR') {
      w = data.readUInt32BE(0);
      h = data.readUInt32BE(4);
      bd = data[8];
      ct = data[9];
    } else if (type === 'PLTE') {
      plte = data;
    } else if (type === 'tRNS') {
      trns = data;
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') {
      break;
    }
    p += 12 + len;
  }

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const ch = ct === 6 ? 4 : ct === 2 ? 3 : 1;
  const stride = w * ch;
  const out = Buffer.alloc(h * stride);

  function pae(a, b, c) {
    const pp = a + b - c;
    const pa = Math.abs(pp - a);
    const pb = Math.abs(pp - b);
    const pc = Math.abs(pp - c);
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
  }

  let pos = 0;
  for (let y = 0; y < h; y++) {
    const ft = raw[pos++];
    for (let x = 0; x < stride; x++) {
      const v = raw[pos++];
      const a = x >= ch ? out[y * stride + x - ch] : 0;
      const b = y > 0 ? out[(y - 1) * stride + x] : 0;
      const c = (x >= ch && y > 0) ? out[(y - 1) * stride + x - ch] : 0;
      let val;
      switch (ft) {
        case 0: val = v; break;
        case 1: val = v + a; break;
        case 2: val = v + b; break;
        case 3: val = v + ((a + b) >> 1); break;
        case 4: val = v + pae(a, b, c); break;
      }
      out[y * stride + x] = val & 255;
    }
  }

  const al = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    let a = 255;
    if (ct === 6) a = out[i * 4 + 3];
    else if (ct === 3) {
      const idx = out[i];
      a = trns && idx < trns.length ? trns[idx] : 255;
    } else if (ct === 0) {
      a = 255;
    }
    al[i] = a > 16 ? 1 : 0;
  }

  return { w, h, al };
}

function detectFrames(file, grid = 16) {
  const { w, h, al } = decode(file);
  const lab = new Int32Array(w * h).fill(0);
  let n = 0;
  const boxes = [];
  const st = [];

  for (let i = 0; i < w * h; i++) {
    if (al[i] && !lab[i]) {
      n++;
      let minx = w, miny = h, maxx = 0, maxy = 0;
      st.push(i);
      lab[i] = n;

      while (st.length) {
        const j = st.pop();
        const x = j % w;
        const y = (j / w) | 0;
        if (x < minx) minx = x;
        if (x > maxx) maxx = x;
        if (y < miny) miny = y;
        if (y > maxy) maxy = y;

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            const k = ny * w + nx;
            if (al[k] && !lab[k]) {
              lab[k] = n;
              st.push(k);
            }
          }
        }
      }
      boxes.push([minx, miny, maxx, maxy]);
    }
  }

  const snapped = boxes.map(([a, b, c, d]) => {
    const x = Math.floor(a / grid) * grid;
    const y = Math.floor(b / grid) * grid;
    const X = Math.ceil((c + 1) / grid) * grid;
    const Y = Math.ceil((d + 1) / grid) * grid;
    return [x, y, X - x, Y - y];
  });

  const merged = [];
  for (const bx of snapped) {
    let hit = null;
    for (const m of merged) {
      if (!(bx[0] + bx[2] <= m[0] || m[0] + m[2] <= bx[0] || bx[1] + bx[3] <= m[1] || m[1] + m[3] <= bx[1])) {
        hit = m;
        break;
      }
    }
    if (hit) {
      const x = Math.min(hit[0], bx[0]);
      const y = Math.min(hit[1], bx[1]);
      const X = Math.max(hit[0] + hit[2], bx[0] + bx[2]);
      const Y = Math.max(hit[1] + hit[3], bx[1] + bx[3]);
      hit[0] = x;
      hit[1] = y;
      hit[2] = X - x;
      hit[3] = Y - y;
    } else {
      merged.push(bx);
    }
  }

  merged.sort((p, q) => p[1] - q[1] || p[0] - q[0]);

  return merged.map(([x, y, fw, fh]) => ({ x, y, w: fw, h: fh }));
}

function parseObjects(content) {
  const objects = [];
  const objectsStart = content.indexOf("export const OBJECTS = [");
  const objectsEnd = content.indexOf("];\n\nexport const OBJECT_CATEGORIES", objectsStart);
  const objectsSection = content.slice(objectsStart, objectsEnd);
  
  let i = 0;
  while (i < objectsSection.length) {
    // Buscar el inicio de un objeto: "  { key:"
    const objStart = objectsSection.indexOf("  { key:", i);
    if (objStart === -1) break;
    
    // Encontrar el final del objeto contando llaves
    let braceCount = 0;
    let inString = false;
    let stringChar = null;
    let j = objStart;
    let objEnd = -1;
    
    while (j < objectsSection.length) {
      const ch = objectsSection[j];
      
      if (!inString) {
        if (ch === '"' || ch === "'") {
          inString = true;
          stringChar = ch;
        } else if (ch === '{') {
          braceCount++;
        } else if (ch === '}') {
          braceCount--;
          if (braceCount === 0) {
            objEnd = j + 1;
            break;
          }
        }
      } else {
        if (ch === stringChar && objectsSection[j - 1] !== '\\') {
          inString = false;
          stringChar = null;
        }
      }
      j++;
    }
    
    if (objEnd === -1) {
      console.warn("No se pudo encontrar el fin del objeto en posición " + objStart);
      break;
    }
    
    const objStr = objectsSection.slice(objStart, objEnd);
    const keyMatch = objStr.match(/key\s*:\s*['"]([^'"]+)['"]/);
    const key = keyMatch ? keyMatch[1] : null;
    
    if (key) {
      const hasCols = objStr.includes("cols");
      const hasRows = objStr.includes("rows");
      const hasFrameW = objStr.includes("frameW");
      const hasFrameH = objStr.includes("frameH");
      
      if (hasCols && hasRows && hasFrameW && hasFrameH) {
        const urlMatch = objStr.match(/url\s*:\s*['"]([^'"]+)['"]/);
        const url = urlMatch ? urlMatch[1] : null;
        
        const occupyWMatch = objStr.match(/occupyW\s*:\s*(\d+)/);
        const occupyHMatch = objStr.match(/occupyH\s*:\s*(\d+)/);
        const occupyW = occupyWMatch ? parseInt(occupyWMatch[1]) : null;
        const occupyH = occupyHMatch ? parseInt(occupyHMatch[1]) : null;
        
        const editorRowsMatch = objStr.match(/editorRows\s*:\s*(\d+)/);
        const editorRows = editorRowsMatch ? parseInt(editorRowsMatch[1]) : null;
        
        const animGroupSizeMatch = objStr.match(/animGroupSize\s*:\s*(\d+)/);
        const animGroupSize = animGroupSizeMatch ? parseInt(animGroupSizeMatch[1]) : null;
        
        const isRock = objStr.includes("isRock");
        
        const variantMatch = objStr.match(/variant\s*:\s*(\{[^}]+\})/);
        const variant = variantMatch ? variantMatch[1] : null;
        
        const groupMatch = objStr.match(/group\s*:\s*['"]([^'"]+)['"]/);
        const group = groupMatch ? groupMatch[1] : null;
        
        const labelMatch = objStr.match(/label\s*:\s*['"]([^'"]+)['"]/);
        const label = labelMatch ? labelMatch[1] : null;
        
        const categoryMatch = objStr.match(/category\s*:\s*['"]([^'"]+)['"]/);
        const category = categoryMatch ? categoryMatch[1] : null;
        
        objects.push({
          key,
          url,
          occupyW,
          occupyH,
          editorRows,
          animGroupSize,
          isRock,
          variant,
          group,
          label,
          category,
          originalStr: objStr,
          startIndex: objectsStart + objStart
        });
      }
    }
    
    i = objEnd;
  }
  
  return objects;
}

function generateObjectStr(obj, frames) {
  const lines = [];
  lines.push("  { key: '" + obj.key + "',");
  
  if (obj.group) {
    lines.push("    group: '" + obj.group + "',");
  }
  
  if (obj.variant) {
    lines.push("    variant: " + obj.variant + ",");
  }
  
  if (obj.label) {
    lines.push("    label: '" + obj.label + "',");
  }
  
  lines.push("    url: '" + obj.url + "',");
  
  if (obj.category) {
    lines.push("    category: '" + obj.category + "',");
  }
  
  if (obj.editorRows) {
    lines.push("    editorRows: " + obj.editorRows + ",");
  }
  
  if (obj.animGroupSize) {
    lines.push("    animGroupSize: " + obj.animGroupSize + ",");
  }
  
  if (obj.isRock) {
    lines.push("    isRock: true,");
  }
  
  const frameStrs = frames.map(f => {
    const parts = ["x: " + f.x, "y: " + f.y, "w: " + f.w, "h: " + f.h];
    if (obj.occupyW) parts.push("occupyW: " + obj.occupyW);
    if (obj.occupyH) parts.push("occupyH: " + obj.occupyH);
    return "    { " + parts.join(", ") + " }";
  });
  
  lines.push("    frames: [");
  lines.push(...frameStrs);
  lines.push("    ]},");
  
  return lines.join("\n");
}

async function processTileRegistry() {
  console.log("Leyendo TileRegistry.js...");
  const content = fs.readFileSync(TILE_REGISTRY_PATH, "utf8");
  
  const objects = parseObjects(content);
  console.log("Encontrados " + objects.length + " objetos con cols/rows/frameW/frameH");
  
  let result = content;
  let processedCount = 0;
  let skippedCount = 0;
  
  for (const obj of objects.reverse()) {
    const filePath = path.join(PUBLIC_DIR, obj.url);
    
    if (!fs.existsSync(filePath)) {
      console.warn("⚠️  No encontrado: " + filePath + " (saltando " + obj.key + ")");
      skippedCount++;
      continue;
    }
    
    console.log("Procesando " + obj.key + "...");
    try {
      const frames = detectFrames(filePath);
      console.log("  -> " + frames.length + " frames detectados");
      
      const newObjStr = generateObjectStr(obj, frames);
      
      result = result.replace(obj.originalStr, newObjStr);
      processedCount++;
    } catch (err) {
      console.error("❌ Error procesando " + obj.key + ": " + err.message);
      skippedCount++;
    }
  }
  
  fs.writeFileSync(TILE_REGISTRY_PATH, result);
  console.log("\n✅ TileRegistry.js actualizado exitosamente");
  console.log("Procesados: " + processedCount + " objetos");
  console.log("Saltados: " + skippedCount + " objetos");
}

processTileRegistry().catch(err => {
  console.error("Error fatal:", err);
  process.exit(1);
});
