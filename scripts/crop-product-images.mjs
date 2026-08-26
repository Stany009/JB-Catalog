// Crop product-specific images from catalogue page renders.
// Definitions: output name -> { pdf slug, page, crop rect }.
// Source of truth: extracted/images/<slug>/page-NNN.png (rendered from official PDFs).
// Output: website/public/images/products/<name>.png
// Run: node scripts/crop-product-images.mjs [--verify]

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'extracted', 'images');
const OUT_DIR = path.join(ROOT, 'website', 'public', 'images', 'products');

// Pumps Final - PART 1 series product photos (one photo per series).
export const CROPS = {
  'series-pc-power': { slug: 'pumps-final-part-1', page: 3, left: 55, top: 105, width: 780, height: 745 },
  'series-pb-turbo': { slug: 'pumps-final-part-1', page: 5, left: 60, top: 110, width: 770, height: 700 },
  'series-ps-supreme': { slug: 'pumps-final-part-1', page: 7, left: 100, top: 130, width: 740, height: 590 },
  'series-ph-hurricane': { slug: 'pumps-final-part-1', page: 9, left: 40, top: 90, width: 820, height: 680 },
  'series-pk-kinetic': { slug: 'pumps-final-part-1', page: 11, left: 165, top: 140, width: 510, height: 460 },
  'series-pf-force': { slug: 'pumps-final-part-1', page: 13, left: 120, top: 180, width: 700, height: 490 },
  'series-pfv-variable': { slug: 'pumps-final-part-1', page: 15, left: 80, top: 140, width: 740, height: 520 },
  'series-pcv-variable': { slug: 'pumps-final-part-1', page: 16, left: 340, top: 115, width: 550, height: 350 },
  'series-pbv-variable': { slug: 'pumps-final-part-1', page: 16, left: 338, top: 672, width: 360, height: 310 },
  'series-pie-inverter': { slug: 'pumps-final-part-1', page: 17, left: 150, top: 140, width: 660, height: 445 },
  'series-pih-inverter': { slug: 'pumps-final-part-1', page: 19, left: 130, top: 170, width: 660, height: 430 },
  'series-pw-whirlpool': { slug: 'pumps-final-part-1', page: 21, left: 110, top: 260, width: 720, height: 530 },
};

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const [name, c] of Object.entries(CROPS)) {
    const src = path.join(SRC_DIR, c.slug, `page-${String(c.page).padStart(3, '0')}.png`);
    if (!fs.existsSync(src)) {
      console.error(`MISSING SOURCE: ${src}`);
      continue;
    }
    const out = path.join(OUT_DIR, `${name}.png`);
    await sharp(src).extract({ left: c.left, top: c.top, width: c.width, height: c.height }).png().toFile(out);
    const kb = Math.round(fs.statSync(out).size / 1024);
    console.log(`${name}.png  ${kb} KB`);
  }
}

main();
