// Optimize extracted images for web use
// Creates thumbnails for product cards and compresses full-size images

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const IMG_DIR = path.join(ROOT, 'website', 'public', 'images');

const THUMB_WIDTH = 600;
const THUMB_QUALITY = 80;
const FULL_QUALITY = 85;

async function optimizeDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  let count = 0;

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      count += await optimizeDirectory(fullPath);
    } else if (entry.name.endsWith('.png') && !entry.name.includes('-thumb')) {
      try {
        const thumbPath = fullPath.replace('.png', '-thumb.jpg');

        // Create thumbnail for product cards
        await sharp(fullPath)
          .resize(THUMB_WIDTH, null, { withoutEnlargement: true })
          .jpeg({ quality: THUMB_QUALITY })
          .toFile(thumbPath);

        // Compress original
        await sharp(fullPath)
          .jpeg({ quality: FULL_QUALITY })
          .toFile(fullPath.replace('.png', '.jpg'));

        count++;
        if (count % 20 === 0) {
          process.stdout.write(`  Optimized ${count} images...\r`);
        }
      } catch (e) {
        // Skip files that can't be processed
      }
    }
  }
  return count;
}

console.log('Optimizing images for web...');
const total = await optimizeDirectory(IMG_DIR);
console.log(`Done! Optimized ${total} images.`);
console.log(`Thumbnails: ${THUMB_WIDTH}px wide, JPEG quality ${THUMB_QUALITY}`);
