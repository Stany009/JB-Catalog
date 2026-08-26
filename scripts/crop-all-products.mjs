// Comprehensive product image cropping pipeline.
// Analyzes page layouts using pixel intensity to find product regions,
// then crops individual product images from catalogue pages.
// Run: node scripts/crop-all-products.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const IMG_DIR = path.join(ROOT, 'website', 'public', 'images');
const OUT_DIR = path.join(ROOT, 'website', 'public', 'images', 'products');
const DATA_FILE = path.join(ROOT, 'data', 'products.json');

// Page dimensions (all A4 catalogue pages are 892x1262)
const PAGE_W = 892;
const PAGE_H = 1262;
const MARGIN = 30; // Safe margin from page edges

// ── Layout analysis ──────────────────────────────────────────────

async function analyzePage(imgPath) {
  const { data, info } = await sharp(imgPath)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  // Average brightness per row
  const rowAvg = [];
  for (let y = 0; y < height; y++) {
    let sum = 0;
    for (let x = 0; x < width; x++) {
      sum += data[(y * width + x) * channels];
    }
    rowAvg.push(sum / width);
  }

  // Find horizontal gaps (bright rows = white space between products)
  const gaps = [];
  let inGap = false;
  let gapStart = 0;
  for (let y = 0; y < height; y++) {
    if (rowAvg[y] > 235) {
      if (!inGap) { gapStart = y; inGap = true; }
    } else {
      if (inGap && (y - gapStart) > 12) {
        gaps.push({ start: gapStart, end: y });
      }
      inGap = false;
    }
  }

  // Build product regions from gaps
  const regions = [];
  let regionStart = MARGIN;
  for (const gap of gaps) {
    if (gap.start > regionStart + 30) {
      regions.push({ top: regionStart, bottom: gap.start });
    }
    regionStart = gap.end;
  }
  if (regionStart < height - MARGIN) {
    regions.push({ top: regionStart, bottom: height - MARGIN });
  }

  return { width, height, gaps, regions };
}

// ── Product-to-page mapping ──────────────────────────────────────

function loadProducts() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function getSharedPages(products) {
  // Group products by their image path (exclude already-cropped /images/products/ paths)
  const byPage = {};
  for (const p of products) {
    const img = p.images?.[0];
    if (!img || img.startsWith('/images/products/')) continue;
    if (!byPage[img]) byPage[img] = [];
    byPage[img].push(p);
  }
  return byPage;
}

// ── Crop generation ──────────────────────────────────────────────

function generateCropsForRegion(regions, productCount) {
  // Given N product regions on a page and M products,
  // assign products to regions (distribute evenly).
  // If M > N, some products share a region (acceptable for size variants).
  const assignments = [];
  for (let i = 0; i < productCount; i++) {
    const regionIdx = Math.min(i, regions.length - 1);
    assignments.push(regionIdx);
  }
  return assignments;
}

async function cropRegion(srcPath, region, outPath, padPercent = 0.02) {
  const meta = await sharp(srcPath).metadata();
  const padX = Math.round(meta.width * padPercent);
  const padY = Math.round(meta.height * padPercent);

  const left = Math.max(0, MARGIN - padX);
  const top = Math.max(0, region.top - padY);
  const width = Math.min(meta.width - left, PAGE_W - MARGIN + padX * 2);
  const height = Math.min(meta.height - top, region.bottom - region.top + padY * 2);

  await sharp(srcPath)
    .extract({ left, top, width, height })
    .png()
    .toFile(outPath);

  return Math.round(fs.statSync(outPath).size / 1024);
}

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const data = loadProducts();
  const sharedPages = getSharedPages(data.products);

  let totalCropped = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  for (const [imgPath, products] of Object.entries(sharedPages)) {
    const fullPath = path.join(ROOT, 'website', 'public', imgPath);
    if (!fs.existsSync(fullPath)) {
      console.log(`MISSING: ${imgPath}`);
      totalFailed += products.length;
      continue;
    }

    const analysis = await analyzePage(fullPath);
    const regions = analysis.regions;

    console.log(`\n${imgPath} (${products.length} products, ${regions.length} regions)`);

    if (regions.length >= products.length) {
      // Each product gets its own region
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const region = regions[i];
        const outName = `${product.id}.png`;
        const outPath = path.join(OUT_DIR, outName);

        try {
          const kb = await cropRegion(fullPath, region, outPath);
          product.images = [`/images/products/${outName}`];
          console.log(`  ✓ ${outName} (${kb} KB)`);
          totalCropped++;
        } catch (e) {
          console.log(`  ✗ ${outName}: ${e.message}`);
          totalFailed++;
        }
      }
    } else {
      // More products than regions — distribute evenly
      // Products in the same region are size variants (share the same crop)
      const assignments = generateCropsForRegion(regions, products.length);

      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const regionIdx = assignments[i];
        const region = regions[regionIdx];
        const outName = `${product.id}.png`;
        const outPath = path.join(OUT_DIR, outName);

        try {
          const kb = await cropRegion(fullPath, region, outPath);
          product.images = [`/images/products/${outName}`];
          console.log(`  ✓ ${outName} (${kb} KB) [region ${regionIdx + 1}]`);
          totalCropped++;
        } catch (e) {
          console.log(`  ✗ ${outName}: ${e.message}`);
          totalFailed++;
        }
      }
    }
  }

  // Write updated data
  data.totalProducts = data.products.length;
  data.lastUpdated = new Date().toISOString().slice(0, 10);
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(DATA_FILE, json);
  fs.writeFileSync(path.join(ROOT, 'website', 'src', 'data', 'products.json'), json);

  console.log(`\n═══ Summary ═══`);
  console.log(`Cropped: ${totalCropped}`);
  console.log(`Failed:  ${totalFailed}`);
  console.log(`Total products: ${data.products.length}`);
  console.log(`Products with dedicated images: ${data.products.filter(p => p.images?.[0]?.startsWith('/images/products/')).length}`);
}

main();
