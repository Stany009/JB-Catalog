// Generate favicon from logo.png
// Run after adding logo.png to website/public/

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, '..', 'website', 'public');

const logoPath = path.join(PUBLIC_DIR, 'logo.png');

if (!fs.existsSync(logoPath)) {
  console.log('logo.png not found in website/public/');
  console.log('Please copy your logo file to: jb-pools-catalogue/website/public/logo.png');
  process.exit(1);
}

async function generateFavicons() {
  console.log('Generating favicons from logo.png...');

  // Square the wordmark: contain-fit on white with 12% padding
  const meta = await sharp(logoPath).metadata();
  const side = Math.max(meta.width, meta.height);
  const pad = Math.round(side * 0.12);
  const squared = await sharp({
    create: { width: side + pad * 2, height: side + pad * 2, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
  })
    .composite([{ input: logoPath, gravity: 'centre' }])
    .png()
    .toBuffer();

  // Generate different sizes
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
  ];

  for (const { name, size } of sizes) {
    await sharp(squared)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toFile(path.join(PUBLIC_DIR, name));
    console.log(`  Created ${name}`);
  }

  // Real multi-size .ico with PNG-embedded entries (16/32/48)
  const icoSizes = [16, 32, 48];
  const pngs = [];
  for (const size of icoSizes) {
    pngs.push(await sharp(squared).resize(size, size).png().toBuffer());
  }
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(icoSizes.length, 4);
  const dirLen = 16 * icoSizes.length;
  let offset = 6 + dirLen;
  const dir = Buffer.alloc(dirLen);
  pngs.forEach((png, i) => {
    const size = icoSizes[i];
    dir.writeUInt8(size === 256 ? 0 : size, i * 16);     // width
    dir.writeUInt8(size === 256 ? 0 : size, i * 16 + 1); // height
    dir.writeUInt8(0, i * 16 + 2);  // palette
    dir.writeUInt8(0, i * 16 + 3);  // reserved
    dir.writeUInt16LE(1, i * 16 + 4);  // color planes
    dir.writeUInt16LE(32, i * 16 + 6); // bits per pixel
    dir.writeUInt32LE(png.length, i * 16 + 8);
    dir.writeUInt32LE(offset, i * 16 + 12);
    offset += png.length;
  });
  const ico = Buffer.concat([header, dir, ...pngs]);
  for (const dest of [
    path.join(PUBLIC_DIR, 'favicon.ico'),
    path.join(__dirname, '..', 'website', 'src', 'app', 'favicon.ico'),
  ]) {
    fs.writeFileSync(dest, ico);
    console.log(`  Created ${path.relative(path.join(__dirname, '..'), dest)}`);
  }

  console.log('\nDone! Favicons generated.');
}

generateFavicons().catch(console.error);
