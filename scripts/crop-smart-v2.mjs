// Smart product image cropping v2.
// Detects actual product photos vs spec tables / text blocks.
// Run: node scripts/crop-smart-v2.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'website', 'public', 'images', 'products');
const DATA_FILE = path.join(ROOT, 'data', 'products.json');

const MARGIN = 30;

// ── Region scoring: is this region a product photo or a table/text? ──

async function scoreRegion(srcPath, region) {
  const padY = 10;
  const top = Math.max(0, region.top - padY);
  const height = Math.min(1262 - top, region.bottom - region.top + padY * 2);
  const left = MARGIN;
  const width = 892 - MARGIN * 2;

  if (height < 20 || width < 20) return { score: -1, type: 'tiny' };

  const { data, info } = await sharp(srcPath)
    .extract({ left, top, width, height })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: w, height: h, channels } = info;
  const pixelCount = w * h;

  // 1. Average brightness
  let sum = 0;
  for (let i = 0; i < pixelCount; i++) {
    sum += data[i * channels];
  }
  const avgBrightness = sum / pixelCount;

  // 2. Color variance (photos have high variance, white/near-white = low)
  let sumSq = 0;
  for (let i = 0; i < pixelCount; i++) {
    const v = data[i * channels] - avgBrightness;
    sumSq += v * v;
  }
  const variance = sumSq / pixelCount;
  const stddev = Math.sqrt(variance);

  // 3. Detect horizontal line patterns (tables have many regular horizontal lines)
  // Count rows that are mostly uniform (low variance across the row)
  let uniformRows = 0;
  for (let y = 0; y < h; y++) {
    let rowSum = 0;
    let rowSumSq = 0;
    for (let x = 0; x < w; x++) {
      const v = data[(y * w + x) * channels];
      rowSum += v;
      rowSumSq += v * v;
    }
    const rowAvg = rowSum / w;
    const rowVar = rowSumSq / w - rowAvg * rowAvg;
    if (rowVar < 200) uniformRows++; // Very uniform row = likely table row or white space
  }
  const uniformRatio = uniformRows / h;

  // 4. Detect dark pixel density (text = many dark pixels in small areas)
  let darkPixels = 0;
  for (let i = 0; i < pixelCount; i++) {
    if (data[i * channels] < 80) darkPixels++;
  }
  const darkRatio = darkPixels / pixelCount;

  // Scoring logic:
  // Product photos: moderate brightness, HIGH variance, low uniform ratio
  // Tables: moderate brightness, LOW variance, HIGH uniform ratio, high dark ratio (text)
  // Text blocks: high brightness, low variance
  // Blue bars: low brightness in some channels (but we're in greyscale)

  let score = 0;
  let type = 'unknown';

  if (stddev > 40 && uniformRatio < 0.6) {
    // High variance, not too uniform → likely a product photo
    score = stddev * 2 + (1 - uniformRatio) * 100;
    type = 'photo';
  } else if (uniformRatio > 0.7 && darkRatio > 0.05) {
    // Very uniform rows with dark text → likely a table
    score = -50;
    type = 'table';
  } else if (avgBrightness > 220 && stddev < 20) {
    // Very bright, very uniform → white space or near-empty
    score = -100;
    type = 'blank';
  } else if (uniformRatio > 0.5 && darkRatio < 0.03) {
    // Mostly uniform, few dark pixels → text block or design element
    score = -30;
    type = 'text';
  } else {
    // Moderate - could be a mix
    score = stddev;
    type = 'mixed';
  }

  return { score, type, avgBrightness: Math.round(avgBrightness), stddev: Math.round(stddev), uniformRatio: Math.round(uniformRatio * 100), darkRatio: Math.round(darkRatio * 100) };
}

// ── Layout analysis (same as v1) ──

async function analyzePage(imgPath) {
  const { data, info } = await sharp(imgPath)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  const rowAvg = [];
  for (let y = 0; y < height; y++) {
    let sum = 0;
    for (let x = 0; x < width; x++) {
      sum += data[(y * width + x) * channels];
    }
    rowAvg.push(sum / width);
  }

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

// ── Data helpers ──

function loadProducts() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function getSharedPages(products) {
  const byPage = {};
  for (const p of products) {
    const img = p.images?.[0];
    if (!img || img.startsWith('/images/products/')) continue;
    if (!byPage[img]) byPage[img] = [];
    byPage[img].push(p);
  }
  return byPage;
}

// ── Crop ──

async function cropRegion(srcPath, region, outPath) {
  const meta = await sharp(srcPath).metadata();
  const padX = Math.round(meta.width * 0.02);
  const padY = Math.round(meta.height * 0.02);

  const left = Math.max(0, MARGIN - padX);
  const top = Math.max(0, region.top - padY);
  const width = Math.min(meta.width - left, (892 - MARGIN) + padX * 2);
  const height = Math.min(meta.height - top, region.bottom - region.top + padY * 2);

  await sharp(srcPath)
    .extract({ left, top, width, height })
    .png()
    .toFile(outPath);

  return Math.round(fs.statSync(outPath).size / 1024);
}

// ── Main ──

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const data = loadProducts();
  const sharedPages = getSharedPages(data.products);

  let totalCropped = 0;
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

    // Score each region
    const scored = [];
    for (const region of regions) {
      const s = await scoreRegion(fullPath, region);
      scored.push({ ...region, ...s });
    }

    const photoRegions = scored.filter(r => r.type === 'photo' || r.type === 'mixed');
    const allRegions = scored;

    console.log(`\n${imgPath} (${products.length} products, ${regions.length} regions)`);
    console.log(`  Regions: ${scored.map(r => `${r.type}(${r.score})`).join(', ')}`);

    // Assign products to best regions
    // Strategy: use photo regions first, then fall back to any region
    const usableRegions = photoRegions.length >= products.length ? photoRegions : allRegions;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      let region;

      if (i < usableRegions.length) {
        // Sort by score descending, pick the best available
        const sorted = [...usableRegions].sort((a, b) => b.score - a.score);
        region = sorted[Math.min(i, sorted.length - 1)];
      } else {
        // More products than regions — share
        region = usableRegions[usableRegions.length - 1];
      }

      const outName = `${product.id}.png`;
      const outPath = path.join(OUT_DIR, outName);

      try {
        const kb = await cropRegion(fullPath, region, outPath);
        product.images = [`/images/products/${outName}`];
        console.log(`  ✓ ${outName} (${kb} KB) [${region.type}]`);
        totalCropped++;
      } catch (e) {
        console.log(`  ✗ ${outName}: ${e.message}`);
        totalFailed++;
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
  console.log(`Products with dedicated images: ${data.products.filter(p => p.images?.[0]?.startsWith('/images/products/')).length}`);
}

main();
