import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple pure-JS uncompressed PNG builder from RGBA buffer
function createPngBuffer(width, height, rgbaBuffer) {
  const IHDR = Buffer.alloc(13);
  IHDR.writeUInt32BE(width, 0);
  IHDR.writeUInt32BE(height, 4);
  IHDR[8] = 8; // 8 bit depth
  IHDR[9] = 6; // Color type 6 (RGBA)
  IHDR[10] = 0; // Compression
  IHDR[11] = 0; // Filter
  IHDR[12] = 0; // Interlace

  // Raw image data with 0 filter byte per scanline
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    const rawOffset = y * scanlineLength;
    rawData[rawOffset] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = rawOffset + 1 + x * 4;
      rawData[dstIdx] = rgbaBuffer[srcIdx];
      rawData[dstIdx + 1] = rgbaBuffer[srcIdx + 1];
      rawData[dstIdx + 2] = rgbaBuffer[srcIdx + 2];
      rawData[dstIdx + 3] = rgbaBuffer[srcIdx + 3];
    }
  }

  // Deflate rawData using zlib
  import('zlib').then(({ deflateSync, crc32 }) => {
    const compressedData = deflateSync(rawData);

    function createChunk(type, data) {
      const len = data.length;
      const buf = Buffer.alloc(12 + len);
      buf.writeUInt32BE(len, 0);
      buf.write(type, 4, 4, 'ascii');
      data.copy(buf, 8);
      
      // Calculate CRC32 of type + data
      const crcBuffer = Buffer.alloc(4 + len);
      crcBuffer.write(type, 0, 4, 'ascii');
      data.copy(crcBuffer, 4);
      
      // CRC32 table calculation
      let c = 0 ^ (-1);
      for (let i = 0; i < crcBuffer.length; i++) {
        c = (c >>> 8) ^ crcTable[(c ^ crcBuffer[i]) & 0xFF];
      }
      const finalCrc = (c ^ (-1)) >>> 0;
      buf.writeUInt32BE(finalCrc, 8 + len);
      return buf;
    }

    const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    const ihdrChunk = createChunk('IHDR', IHDR);
    const idatChunk = createChunk('IDAT', compressedData);
    const iendChunk = createChunk('IEND', Buffer.alloc(0));

    const finalPng = Buffer.concat([pngHeader, ihdrChunk, idatChunk, iendChunk]);
    return finalPng;
  });
}

// Full self-contained script
import zlib from 'zlib';

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
  }
  crcTable[n] = c >>> 0;
}

function renderIconRgba(width, height, isMaskable = false) {
  const buf = Buffer.alloc(width * height * 4);
  const cx = width / 2;
  const cy = height / 2;
  const cornerR = isMaskable ? 0 : width * 0.22;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const nx = x / width;
      const ny = y / height;

      // Rounded rect check for standard icons
      let inBounds = true;
      if (!isMaskable) {
        const dx = Math.abs(x - cx) - (cx - cornerR);
        const dy = Math.abs(y - cy) - (cy - cornerR);
        if (dx > 0 && dy > 0 && (dx * dx + dy * dy > cornerR * cornerR)) {
          inBounds = false;
        }
      }

      if (!inBounds) {
        buf[idx] = 0;
        buf[idx + 1] = 0;
        buf[idx + 2] = 0;
        buf[idx + 3] = 0;
        continue;
      }

      // Base gradient: Pastel pink (#FFF2F6) to lilac (#E9D5FF)
      let r = Math.round(255 * (1 - ny * 0.1) + 233 * (ny * 0.1));
      let g = Math.round(242 * (1 - ny) + 213 * ny);
      let b = Math.round(246 * (1 - ny) + 255 * ny);

      // Inner card
      const cardInset = width * 0.18;
      const cardR = width * 0.08;
      const cardDx = Math.abs(x - cx) - (cx - cardInset - cardR);
      const cardDy = Math.abs(y - cy) - (cy - cardInset - cardR);
      const inCard = cardDx <= 0 || cardDy <= 0 || (cardDx * cardDx + cardDy * cardDy <= cardR * cardR);

      if (inCard && x >= cardInset && x <= width - cardInset && y >= cardInset && y <= height - cardInset) {
        r = 252;
        g = 250;
        b = 255;
      }

      // Purple Wax Seal center
      const distFromCenter = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
      const sealRadius = width * 0.20;

      if (distFromCenter <= sealRadius) {
        // Violet gradient: #8B5CF6 to #6D28D9
        const sealFactor = (y - (cy - sealRadius)) / (sealRadius * 2);
        r = Math.round(139 * (1 - sealFactor) + 109 * sealFactor);
        g = Math.round(92 * (1 - sealFactor) + 40 * sealFactor);
        b = Math.round(246 * (1 - sealFactor) + 217 * sealFactor);

        // Gold/white inner dashed border line
        if (Math.abs(distFromCenter - sealRadius * 0.85) < width * 0.008) {
          r = 240;
          g = 230;
          b = 255;
        }

        // Center Letter 'C'
        // Approximate 'C' shape in center
        const cRadius = sealRadius * 0.52;
        const cThick = sealRadius * 0.22;
        const cAngle = Math.atan2(y - cy, x - cx); // -PI to PI
        const deg = (cAngle * 180) / Math.PI;

        if (distFromCenter <= cRadius + cThick && distFromCenter >= cRadius - cThick) {
          // Leave gap on right side for letter C (around -45 deg to 45 deg)
          if (deg > 45 || deg < -45) {
            r = 255;
            g = 255;
            b = 255;
          }
        }

        // Top and bottom serif ticks for C
        if (Math.abs(x - (cx + cRadius * 0.6)) < cThick && (Math.abs(y - (cy - cRadius * 0.7)) < cThick * 0.8 || Math.abs(y - (cy + cRadius * 0.7)) < cThick * 0.8)) {
          r = 255;
          g = 255;
          b = 255;
        }
      }

      buf[idx] = r;
      buf[idx + 1] = g;
      buf[idx + 2] = b;
      buf[idx + 3] = 255;
    }
  }

  return buf;
}

function buildPng(width, height, rgbaBuffer) {
  const IHDR = Buffer.alloc(13);
  IHDR.writeUInt32BE(width, 0);
  IHDR.writeUInt32BE(height, 4);
  IHDR[8] = 8;
  IHDR[9] = 6;
  IHDR[10] = 0;
  IHDR[11] = 0;
  IHDR[12] = 0;

  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    const rawOffset = y * scanlineLength;
    rawData[rawOffset] = 0;
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = rawOffset + 1 + x * 4;
      rawData[dstIdx] = rgbaBuffer[srcIdx];
      rawData[dstIdx + 1] = rgbaBuffer[srcIdx + 1];
      rawData[dstIdx + 2] = rgbaBuffer[srcIdx + 2];
      rawData[dstIdx + 3] = rgbaBuffer[srcIdx + 3];
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  function createChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    
    const crcBuffer = Buffer.alloc(4 + len);
    crcBuffer.write(type, 0, 4, 'ascii');
    data.copy(crcBuffer, 4);
    
    let c = 0 ^ (-1);
    for (let i = 0; i < crcBuffer.length; i++) {
      c = (c >>> 8) ^ crcTable[(c ^ crcBuffer[i]) & 0xFF];
    }
    const finalCrc = (c ^ (-1)) >>> 0;
    buf.writeUInt32BE(finalCrc, 8 + len);
    return buf;
  }

  const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdrChunk = createChunk('IHDR', IHDR);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([pngHeader, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.resolve('public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 1. icon-192.png
const buf192 = renderIconRgba(192, 192, false);
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), buildPng(192, 192, buf192));

// 2. icon-512.png
const buf512 = renderIconRgba(512, 512, false);
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), buildPng(512, 512, buf512));

// 3. icon-maskable-192.png
const bufMask192 = renderIconRgba(192, 192, true);
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-192.png'), buildPng(192, 192, bufMask192));

// 4. icon-maskable-512.png
const bufMask512 = renderIconRgba(512, 512, true);
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512.png'), buildPng(512, 512, bufMask512));

// 5. apple-touch-icon.png (180x180)
const bufApple180 = renderIconRgba(180, 180, false);
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), buildPng(180, 180, bufApple180));

console.log('Successfully generated all PWA icons in public/icons/');
