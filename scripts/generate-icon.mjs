// Generate a Windows .ico file from a procedurally generated PNG.
// Output: resources/icon.ico
// We hand-craft a 256x256 PNG with a Codex-style spark-in-squircle.
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'resources');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const W = 256, H = 256;
const buf = Buffer.alloc(W * H * 4);

function put(x, y, r, g, b, a) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 4;
  buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = a;
}

function blend(dx, dy, color) {
  const x = Math.round(dx);
  const y = Math.round(dy);
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 4;
  const a = color[3] / 255;
  buf[i] = Math.round(buf[i] * (1 - a) + color[0] * a);
  buf[i + 1] = Math.round(buf[i + 1] * (1 - a) + color[1] * a);
  buf[i + 2] = Math.round(buf[i + 2] * (1 - a) + color[2] * a);
  buf[i + 3] = Math.max(buf[i + 3], color[3]);
}

const sqR = 62;
const sqX0 = 20, sqY0 = 20, sqX1 = 236, sqY1 = 236;

function inSquircle(x, y) {
  // Smooth squircle: (|x-cx|/a)^n + (|y-cy|/b)^n <= 1, n=4
  const cx = (sqX0 + sqX1) / 2, cy = (sqY0 + sqY1) / 2;
  const a = (sqX1 - sqX0) / 2, b = (sqY1 - sqY0) / 2;
  const nx = Math.abs(x - cx) / a, ny = Math.abs(y - cy) / b;
  return Math.pow(nx, 4) + Math.pow(ny, 4) <= 1;
}

// Background gradient #1A1A1A -> #0A0A0A
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (inSquircle(x, y)) {
      const t = ((x - sqX0) + (y - sqY0)) / ((sqX1 - sqX0) + (sqY1 - sqY0));
      const r = Math.round(0x1A * (1 - t) + 0x0A * t);
      const g = Math.round(0x1A * (1 - t) + 0x0A * t);
      const b = Math.round(0x1A * (1 - t) + 0x0A * t);
      put(x, y, r, g, b, 255);
    } else {
      put(x, y, 0, 0, 0, 0);
    }
  }
}

// Ring stroke
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const cx = (sqX0 + sqX1) / 2, cy = (sqY0 + sqY1) / 2;
    const a = (sqX1 - sqX0) / 2, b = (sqY1 - sqY0) / 2;
    const nx = Math.abs(x - cx) / a, ny = Math.abs(y - cy) / b;
    const d = Math.pow(nx, 4) + Math.pow(ny, 4);
    if (d > 0.99 && d < 1.02) {
      const t = ((x - sqX0) + (y - sqY0)) / ((sqX1 - sqX0) + (sqY1 - sqY0));
      const r = Math.round(0x52 * (1 - t) + 0x26 * t);
      const g = Math.round(0x52 * (1 - t) + 0x26 * t);
      const b = Math.round(0x52 * (1 - t) + 0x26 * t);
      put(x, y, r, g, b, 255);
    }
  }
}

// 4-point spark: orange #FB923C -> #EA580C gradient
function inSpark(x, y) {
  // Diamond with star points
  const cx = 128, cy = 128;
  // Vertices: (cx, 56), (200, cy), (cx, 200), (56, cy)
  // With notches at (138, 118) etc.
  const pts = [
    [128, 56], [138, 118], [200, 128], [138, 138],
    [128, 200], [118, 138], [56, 128], [118, 118],
  ];
  // Barycentric / point-in-polygon
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (inSpark(x, y)) {
      const t = (y - 56) / (200 - 56);
      const r = Math.round(0xFB * (1 - t) + 0xEA * t);
      const g = Math.round(0x92 * (1 - t) + 0x58 * t);
      const b = Math.round(0x3C * (1 - t) + 0x0C * t);
      put(x, y, r, g, b, 255);
    }
  }
}

// Inner core: white circle r=14 + orange dot r=6
const cx = 128, cy = 128;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const d = Math.hypot(x - cx, y - cy);
    if (d < 14) put(x, y, 255, 255, 255, 255);
    if (d < 6) put(x, y, 0xF9, 0x73, 0x16, 255);
  }
}

// Accent dots
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (Math.hypot(x - 200, y - 56) < 4) put(x, y, 0xFB, 0x92, 0x3C, 178);
    if (Math.hypot(x - 56, y - 200) < 4) put(x, y, 0xFB, 0x92, 0x3C, 178);
    if (Math.hypot(x - 210, y - 210) < 2.5) put(x, y, 0xFB, 0x92, 0x3C, 115);
    if (Math.hypot(x - 46, y - 46) < 2.5) put(x, y, 0xFB, 0x92, 0x3C, 115);
  }
}

// === Encode PNG (RGBA) ===
function crc32(data) {
  let c, t = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) crc = (t[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8)) >>> 0;
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}
const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8;   // bit depth
ihdr[9] = 6;   // color type: RGBA
ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
// Filter byte 0 per scanline
const raw = Buffer.alloc(H * (1 + W * 4));
for (let y = 0; y < H; y++) {
  raw[y * (1 + W * 4)] = 0;
  buf.copy(raw, y * (1 + W * 4) + 1, y * W * 4, (y + 1) * W * 4);
}
const idat = deflateSync(raw);
const png = Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);

// === Build ICO container with a single 256x256 PNG entry ===
// Windows supports PNG-compressed icons in ICO since Vista.
// ICONDIR (6 bytes) + ICONDIRENTRY (16 bytes) + image data
const iconDir = Buffer.alloc(6);
iconDir.writeUInt16LE(0, 0);     // reserved
iconDir.writeUInt16LE(1, 2);     // type: 1=icon
iconDir.writeUInt16LE(1, 4);     // count
const iconEntry = Buffer.alloc(16);
iconEntry[0] = 0;                // width: 0 means 256
iconEntry[1] = 0;                // height: 0 means 256
iconEntry[2] = 0;                // palette
iconEntry[3] = 0;                // reserved
iconEntry.writeUInt16LE(1, 4);   // color planes
iconEntry.writeUInt16LE(32, 6);  // bits per pixel
iconEntry.writeUInt32LE(png.length, 8); // image size
iconEntry.writeUInt32LE(6 + 16, 12);    // offset
const ico = Buffer.concat([iconDir, iconEntry, png]);
writeFileSync(join(outDir, 'icon.ico'), ico);
writeFileSync(join(outDir, 'icon.png'), png);
console.log(`Wrote ${join(outDir, 'icon.ico')} (${ico.length} bytes) and icon.png (${png.length} bytes).`);
