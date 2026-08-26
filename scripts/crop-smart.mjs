// Smart product image cropping pipeline.
// Instead of splitting by white-space gaps (which catches text headers),
// this scans the page for regions with the HIGHEST visual complexity
// (edge density, file size) — actual product photos, not text.
// Run: node scripts/crop-smart.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const IMG_DIR = path.join(ROOT, 'website', 'public', 'images');
const OUT_DIR = path.join(ROOT, 'website', 'public', 'images', 'products');
const DATA_FILE = path.join(ROOT, 'data', 'products.json');

const PAGE_W = 892;
const PAGE_H = 1262;

// ── Visual complexity analysis ───────────────────────────────────

async function analyzeRegion(rawData, channels, width, height) {
  let edges = 0;
  let totalPixels = width * height;
  let sum = 0;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * channels;
      const left = rawData[(y * width + (x - 1)) * channels];
      const right = rawData[(y * width + (x + 1)) * channels];
      const top = rawData[((y - 1) * width + x) * channels];
      const bottom = rawData[((y + 1) * width + x) * channels];
      const gradient = Math.abs(right - left) + Math.abs(bottom - top);
      if (gradient > 30) edges++;
      sum += rawData[idx];
    }
  }

  const edgeDensity = edges / totalPixels;
  const avgBrightness = sum / totalPixels;
  const score = edgeDensity * 1000 + (totalPixels / 10000);

  return { edgeDensity, avgBrightness, score, totalPixels };
}

async function findBestCropRegion(srcPath, top, bottom, left, right) {
  const { data, info } = await sharp(srcPath)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { channels } = info;

  // Extract the region
  const regionWidth = right - left;
  const regionHeight = bottom - top;
  if (regionWidth < 30 || regionHeight < 30) return null;

  const regionData = [];
  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) {
      regionData.push(data[(y * PAGE_W + x) * channels]);
    }
  }

  return await analyzeRegion(new Uint8Array(regionData), channels, regionWidth, regionHeight);
}

// ── Find product photo regions on a page ─────────────────────────

async function findProductRegions(srcPath) {
  const { data, info } = await sharp(srcPath)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { channels } = info;

  // Scan the page in a grid to find visual hotspots
  const GRID_SIZE = 40; // scan every 40px
  const MARGIN = 40;

  // Find horizontal white-space gaps (to separate product sections)
  const rowAvg = [];
  for (let y = 0; y < PAGE_H; y++) {
    let sum = 0;
    for (let x = 0; x < PAGE_W; x++) {
      sum += data[(y * PAGE_W + x) * channels];
    }
    rowAvg.push(sum / PAGE_W);
  }

  // Find product sections (regions between white gaps)
  const sections = [];
  let sectionStart = MARGIN;
  let inGap = false;
  let gapStart = 0;

  for (let y = MARGIN; y < PAGE_H - MARGIN; y++) {
    if (rowAvg[y] > 238) {
      if (!inGap) { gapStart = y; inGap = true; }
    } else {
      if (inGap && (y - gapStart) > 20) {
        if (gapStart > sectionStart + 40) {
          sections.push({ top: sectionStart, bottom: gapStart });
        }
        sectionStart = y;
      }
      inGap = false;
    }
  }
  if (sectionStart < PAGE_H - MARGIN) {
    sections.push({ top: sectionStart, bottom: PAGE_H - MARGIN });
  }

  // For each section, find the sub-region with highest visual complexity
  const photoRegions = [];

  for (const section of sections) {
    const sectionH = section.bottom - section.top;
    if (sectionH < 60) continue;

    // Scan sub-regions within this section
    let bestScore = 0;
    let bestRegion = null;

    // Try sliding window of different sizes
    for (const windowH of [Math.min(sectionH, 400), Math.min(sectionH, 300), Math.min(sectionH, 200)]) {
      for (let y = section.top; y + windowH <= section.bottom; y += 20) {
        // Also scan left/right halves for columns
        for (const [l, r] of [[MARGIN, PAGE_W / 2], [PAGE_W / 2, PAGE_W - MARGIN], [MARGIN, PAGE_W - MARGIN]]) {
          const regionW = r - l;
          if (regionW < 50) continue;

          const regionData = [];
          for (let ry = y; ry < y + windowH; ry++) {
            for (let rx = l; rx < r; rx++) {
              regionData.push(data[(ry * PAGE_W + rx) * channels]);
            }
          }

          const analysis = await analyzeRegion(new Uint8Array(regionData), channels, regionW, windowH);

          // Penalize very bright regions (likely white space or text backgrounds)
          const brightnessPenalty = analysis.avgBrightness > 230 ? 0.3 : 1;

          const adjustedScore = analysis.score * brightnessPenalty;

          if (adjustedScore > bestScore) {
            bestScore = adjustedScore;
            bestRegion = { top: y, bottom: y + windowH, left: l, right: r };
          }
        }
      }
    }

    if (bestRegion) {
      photoRegions.push(bestRegion);
    }
  }

  return photoRegions;
}

// ── Main pipeline ────────────────────────────────────────────────

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

async function cropRegion(srcPath, region, outPath) {
  const left = Math.max(0, region.left);
  const top = Math.max(0, region.top);
  const width = Math.min(PAGE_W - left, region.right - region.left);
  const height = Math.min(PAGE_H - top, region.bottom - region.top);

  if (width < 30 || height < 30) return 0;

  await sharp(srcPath)
    .extract({ left, top, width, height })
    .png()
    .toFile(outPath);

  return Math.round(fs.statSync(outPath).size / 1024);
}

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

    console.log(`\n${imgPath} (${products.length} products)`);

    const regions = await findProductRegions(fullPath);
    console.log(`  Found ${regions.length} photo regions`);

    if (regions.length === 0) {
      // Fallback: keep original page image
      console.log(`  No photo regions found, keeping page image`);
      for (const product of products) {
        // Keep existing image path
        totalCropped++;
      }
      continue;
    }

    if (regions.length >= products.length) {
      // Each product gets its own region
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const region = regions[i];
        const outName = `${product.id}.png`;
        const outPath = path.join(OUT_DIR, outName);

        const kb = await cropRegion(fullPath, region, outPath);
        if (kb > 2) {
          product.images = [`/images/products/${outName}`];
          console.log(`  ✓ ${outName} (${kb} KB)`);
          totalCropped++;
        } else {
          console.log(`  ✗ ${outName}: too small (${kb} KB), keeping page image`);
          totalCropped++;
        }
      }
    } else {
      // More products than regions — assign best region to each
      // Products that are size variants share the same photo
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const regionIdx = Math.min(i, regions.length - 1);
        const region = regions[regionIdx];
        const outName = `${product.id}.png`;
        const outPath = path.join(OUT_DIR, outName);

        const kb = await cropRegion(fullPath, region, outPath);
        if (kb > 2) {
          product.images = [`/images/products/${outName}`];
          console.log(`  ✓ ${outName} (${kb} KB) [region ${regionIdx + 1}]`);
          totalCropped++;
        } else {
          console.log(`  ✗ ${outName}: too small (${kb} KB)`);
          totalCropped++;
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
  console.log(`Processed: ${totalCropped}`);
  console.log(`Failed: ${totalFailed}`);
}

main();
