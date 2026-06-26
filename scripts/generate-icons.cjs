#!/usr/bin/env node
// Generates PNG icons using pure Node.js (no canvas needed)
// Uses a minimal PNG encoder to create solid-color icons with the app letter

const fs = require('fs');
const path = require('path');

// Minimal PNG encoder
function createPNG(width, height, pixels) {
  const { deflateSync } = require('zlib');

  function crc32(buf) {
    let crc = 0xffffffff;
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[i] = c;
    }
    for (const byte of buf) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const typeB = Buffer.from(type);
    const crcB = Buffer.alloc(4);
    crcB.writeUInt32BE(crc32(Buffer.concat([typeB, data])));
    return Buffer.concat([len, typeB, data, crcB]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // Raw image data (filter byte 0 per row)
  const raw = [];
  for (let y = 0; y < height; y++) {
    raw.push(0); // filter type None
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      raw.push(pixels[idx], pixels[idx+1], pixels[idx+2]);
    }
  }
  const compressed = deflateSync(Buffer.from(raw));

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function drawIcon(size, maskable = false) {
  const pixels = new Uint8Array(size * size * 4);

  const padding = maskable ? Math.floor(size * 0.1) : Math.floor(size * 0.0);
  const cx = size / 2;
  const cy = size / 2;
  const radius = maskable ? size / 2 : size * 0.22;

  // Background: dark navy #0A0E1A
  const bgR = 10, bgG = 14, bgB = 26;
  // Gold gradient approximation #D4A853
  const goldR = 212, goldG = 168, goldB = 83;
  // Deep gold #7A5520
  const dGoldR = 122, dGoldG = 85, dGoldB = 32;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = x - cx, dy = y - cy;

      if (maskable) {
        // Full-bleed circle background
        const dist = Math.sqrt(dx * dx + dy * dy);
        const r = size / 2 - 1;
        if (dist > r) {
          pixels[idx] = bgR; pixels[idx+1] = bgG; pixels[idx+2] = bgB;
        } else {
          // Dark background
          pixels[idx] = bgR; pixels[idx+1] = bgG; pixels[idx+2] = bgB;
        }
      } else {
        pixels[idx] = bgR; pixels[idx+1] = bgG; pixels[idx+2] = bgB;
      }
    }
  }

  // Draw a gold circle/diamond in the center
  const iconR = maskable ? size * 0.35 : size * 0.4;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < iconR) {
        // Gradient: top-left gold -> bottom-right deep gold
        const t = (dx + dy + iconR * 2) / (iconR * 4);
        const r = Math.round(goldR + (dGoldR - goldR) * t);
        const g = Math.round(goldG + (dGoldG - goldG) * t);
        const b = Math.round(goldB + (dGoldB - goldB) * t);
        pixels[idx] = Math.max(0, Math.min(255, r));
        pixels[idx+1] = Math.max(0, Math.min(255, g));
        pixels[idx+2] = Math.max(0, Math.min(255, b));
      }
    }
  }

  // Draw "E" letter (simple pixel-based) centered in the circle
  const letterSize = iconR * 0.9;
  const lx = Math.floor(cx - letterSize * 0.3);
  const ly = Math.floor(cy - letterSize * 0.5);
  const lw = Math.floor(letterSize * 0.6);
  const lh = Math.floor(letterSize);
  const sw = Math.max(2, Math.floor(size * 0.04)); // stroke width

  function drawRect(rx, ry, rw, rh) {
    for (let y = ry; y < ry + rh && y < size; y++) {
      for (let x = rx; x < rx + rw && x < size; x++) {
        if (x < 0 || y < 0) continue;
        const idx = (y * size + x) * 4;
        pixels[idx] = bgR; pixels[idx+1] = bgG; pixels[idx+2] = bgB;
      }
    }
  }

  // Vertical stroke (left side of E)
  drawRect(lx, ly, sw, lh);
  // Top bar
  drawRect(lx, ly, lw, sw);
  // Middle bar
  drawRect(lx, Math.floor(ly + lh / 2 - sw / 2), Math.floor(lw * 0.8), sw);
  // Bottom bar
  drawRect(lx, ly + lh - sw, lw, sw);

  return createPNG(size, size, pixels);
}

const outDir = path.join(__dirname, '../public/icons');
fs.mkdirSync(outDir, { recursive: true });

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
for (const size of sizes) {
  const buf = drawIcon(size, false);
  fs.writeFileSync(path.join(outDir, `icon-${size}.png`), buf);
  console.log(`Created icon-${size}.png`);
}

// Maskable icons
for (const size of [192, 512]) {
  const buf = drawIcon(size, true);
  fs.writeFileSync(path.join(outDir, `icon-maskable-${size}.png`), buf);
  console.log(`Created icon-maskable-${size}.png`);
}

// Screenshot placeholder (430x932 dark)
const ssW = 430, ssH = 932;
const ssPixels = new Uint8Array(ssW * ssH * 4);
for (let i = 0; i < ssW * ssH; i++) {
  ssPixels[i*4] = 10; ssPixels[i*4+1] = 14; ssPixels[i*4+2] = 26;
}
fs.writeFileSync(path.join(outDir, 'screenshot-mobile.png'), createPNG(ssW, ssH, ssPixels));
console.log('Created screenshot-mobile.png');

console.log('All icons generated!');
