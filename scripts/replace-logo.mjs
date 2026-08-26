// Replace logo.png with the new JB Pools wordmark.
// Source: Gemini render whose "transparency" is a checkerboard painted into
// the image (white 255 + gray 205 squares). Keys out neutral bright pixels to
// produce a real transparent PNG, plus a white knockout for dark backgrounds.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC = process.argv[2];
const PUBLIC_DIR = path.join(ROOT, 'website', 'public');

if (!SRC || !fs.existsSync(SRC)) {
  console.error('Usage: node scripts/replace-logo.mjs <path-to-new-logo.png>');
  process.exit(1);
}

const KEY_CHROMA_MAX = 15; // strictly neutral pixels (checker squares + seams)
const KEY_LUMA_MIN = 180;  // covers 205 gray, 255 white, and blends between

async function main() {
  const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
  const C = info.channels;
  const out = Buffer.allocUnsafe(data.length);

  for (let i = 0; i < data.length; i += C) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    const keyed = chroma <= KEY_CHROMA_MAX && luma >= KEY_LUMA_MIN;
    out[i] = r; out[i + 1] = g; out[i + 2] = b;
    out[i + 3] = keyed ? 0 : 255;
  }

  const keyed = await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png().toBuffer();

  // Trim transparent border and normalize size
  const trimmed = await sharp(keyed).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
  const t = trimmed.info;
  console.log(`keyed + trimmed: ${info.width}x${info.height} -> ${t.width}x${t.height}`);

  const colorPng = await sharp(trimmed.data)
    .resize({ width: 800, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toBuffer();

  // White knockout: keep alpha, force RGB to white
  const { data: aData, info: aInfo } = await sharp(trimmed.data)
    .resize({ width: 800, withoutEnlargement: true })
    .ensureAlpha()
    .extractChannel('alpha')
    .raw()
    .toBuffer({ resolveWithObject: true });
  const white = Buffer.alloc(aData.length * 4);
  for (let i = 0; i < aData.length; i++) {
    white[i * 4] = 255; white[i * 4 + 1] = 255; white[i * 4 + 2] = 255; white[i * 4 + 3] = aData[i];
  }
  const whitePng = await sharp(white, { raw: { width: aInfo.width, height: aInfo.height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toBuffer();

  fs.writeFileSync(path.join(PUBLIC_DIR, 'logo.png'), colorPng);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'logo-white.png'), whitePng);
  console.log(`wrote logo.png (${(colorPng.length / 1024).toFixed(0)} KB) and logo-white.png (${(whitePng.length / 1024).toFixed(0)} KB)`);

  // Previews over navy and white for visual verification
  for (const [name, buf, bg] of [
    ['preview-color-navy.png', colorPng, '#0B2342'],
    ['preview-color-white.png', colorPng, '#FFFFFF'],
    ['preview-white-navy.png', whitePng, '#0B2342'],
  ]) {
    await sharp({ create: { width: 900, height: 560, channels: 4, background: bg } })
      .composite([{ input: await sharp(buf).resize({ width: 800 }).toBuffer(), gravity: 'center' }])
      .png()
      .toFile(path.join(ROOT, 'extracted', name));
    console.log(`preview: extracted/${name}`);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
