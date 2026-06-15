// ============================================================================
// detect-props.js — Detector de objetos en una hoja de sprites (componentes conexos)
//
// QUÉ HACE: dada una imagen PNG con varios objetos separados por espacios
// transparentes, encuentra cada objeto entero (no lo parte en celdas de 16) y
// devuelve su rectángulo [x, y, ancho, alto] ajustado a la grilla. Eso es lo que
// se pega en TileRegistry.js OBJECTS como propiedad `frames`.
//
// CÓMO: 1) decode() lee el PNG y arma una máscara de píxeles NO transparentes.
//       2) cc() agrupa los píxeles pegados (8-vecinos) -> cada grupo = 1 objeto.
//       3) calcula la "caja" (bounding box) de cada grupo y la snapea a múltiplos
//          de grid (16 por defecto). Fusiona cajas que se superponen.
//
// LIMITACIÓN: si dos objetos se tocan sin espacio transparente, los une en uno.
//
// USO (desde la carpeta del proyecto):
//   node tools/detect-props.js "public/assets/.../alguna_hoja.png"
//   node tools/detect-props.js a.png b.png        (varias hojas)
//
// Imprime, por hoja: tamaño, cantidad de objetos y el array de rects en JSON.
// El formato de salida es compatible con la propiedad `frames` de OBJECTS en
// TileRegistry.js:  frames: [{x, y, w, h}, ...]
// ============================================================================
const fs = require('fs');
const zlib = require('zlib');

/**
 * Decodifica un PNG y devuelve una máscara de alfa (1 = opaco, 0 = transparente).
 * Soporta color types: 6 (RGBA), 3 (indexed/palette), 2 (RGB), 0 (grayscale).
 */
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

  // Paeth predictor
  function pae(a, b, c) {
    const pp = a + b - c;
    const pa = Math.abs(pp - a);
    const pb = Math.abs(pp - b);
    const pc = Math.abs(pp - c);
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
  }

  // Reconstruir scanlines con filtros PNG
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

  // Construir máscara de alfa
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

/**
 * Detecta componentes conexos (8-vecinos) en la máscara de alfa,
 * calcula bounding boxes, los snapea a la grilla y fusiona solapados.
 */
function cc(file, grid = 16) {
  const { w, h, al } = decode(file);
  const lab = new Int32Array(w * h).fill(0);
  let n = 0;
  const boxes = [];
  const st = [];

  // Flood-fill por componentes conexos
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

  // Snap a grilla
  const snapped = boxes.map(([a, b, c, d]) => {
    const x = Math.floor(a / grid) * grid;
    const y = Math.floor(b / grid) * grid;
    const X = Math.ceil((c + 1) / grid) * grid;
    const Y = Math.ceil((d + 1) / grid) * grid;
    return [x, y, X - x, Y - y];
  });

  // Fusionar cajas que se solapan
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

  // Ordenar: primero por fila (Y), luego columna (X)
  merged.sort((p, q) => p[1] - q[1] || p[0] - q[0]);

  // Salida legible
  const name = file.split(/[/\\]/).pop();
  console.log(`\n=== ${name} (${w}x${h}) -> ${merged.length} objetos ===`);
  console.log('Rects [x, y, w, h]:');
  console.log(JSON.stringify(merged));

  // Salida como frames compatibles con TileRegistry.js
  const frames = merged.map(([x, y, fw, fh]) => ({ x, y, w: fw, h: fh }));
  console.log('\nframes (para TileRegistry.js OBJECTS):');
  console.log(JSON.stringify(frames, null, 2));
}

// Ejecutar sobre cada archivo pasado como argumento
const files = process.argv.slice(2);
if (files.length === 0) {
  console.log('Uso: node tools/detect-props.js <imagen.png> [imagen2.png ...]');
  console.log('Ejemplo: node tools/detect-props.js public/assets/SproutLands-Sprites/Objects/Water\\ Objects.png');
  process.exit(1);
}
files.forEach(f => cc(f));
