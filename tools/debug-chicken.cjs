const fs = require('fs');
const content = fs.readFileSync('public/src/engine/level/TileRegistry.js', 'utf8');
const idx = content.indexOf("key: 'chicken'");
const section = content.substring(idx, idx + 800);
console.log(section);
