// Smart crop v3: Picks the LARGEST actual product photo per page.
// Uses color variance to distinguish photos from tables/text.
// Run: node scripts/crop-photos-v3.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const IMG_DIR = path.join(ROOT, 'website', 'public', 'images');
const OUT_DIR = path.join(ROOT, 'website', 'public', 'images', 'products');
const DATA_FILE = path.join(ROOT, 'website', 'src', 'data', 'products.json');

// ── Analyze a page to find PHOTO regions ──────────────────────────

async function findPhotoRegions(imgPath) {
  const img = sharp(imgPath);
  const meta = await img.metadata();
  const { data: rgbData, info } = await img
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  // Scan in horizontal strips to find non-white regions
  const STRIP_H = 10; // pixels per strip
  const strips = [];

  for (let y = 0; y < height; y += STRIP_H) {
    const yEnd = Math.min(y + STRIP_H, height);
    let pixelCount = 0;
    let nonWhiteCount = 0;
    let colorSum = 0;
    let colorSumSq = 0;
    let rSum = 0, gSum = 0, bSum = 0;

    for (let py = y; py < yEnd; py += 2) {
      for (let px = 0; px < width; px += 2) {
        const idx = (py * width + px) * channels;
        const r = rgbData[idx];
        const g = channels >= 3 ? rgbData[idx + 1] : r;
        const b = channels >= 3 ? rgbData[idx + 2] : r;
        const brightness = (r + g + b) / 3;
        pixelCount++;
        if (brightness < 245) nonWhiteCount++;
        colorSum += brightness;
        colorSumSq += brightness * brightness;
        rSum += r;
        gSum += g;
        bSum += b;
      }
    }

    const coverage = nonWhiteCount / pixelCount;
    const mean = colorSum / pixelCount;
    const variance = colorSumSq / pixelCount - mean * mean;
    const r = Math.round(rSum / pixelCount);
    const g = Math.round(gSum / pixelCount);
    const b = Math.round(bSum / pixelCount);

    strips.push({
      y,
      yEnd,
      coverage,      // 0..1 how much non-white content
      variance,      // high = photo, low = text/table
      mean,          // brightness 0..255
      r, g, b,       // average color
    });
  }

  // Merge consecutive non-white strips into regions
  const regions = [];
  let current = null;

  for (const strip of strips) {
    const isContent = strip.coverage > 0.05; // at least 5% non-white
    if (isContent) {
      if (!current) {
        current = { top: strip.y, bottom: strip.yEnd, varianceSum: 0, varianceCount: 0, strips: 0 };
      }
      current.bottom = strip.yEnd;
      current.varianceSum += strip.variance;
      current.varianceCount++;
      current.strips++;
    } else {
      if (current && current.strips >= 2) {
        current.avgVariance = current.varianceSum / current.varianceCount;
        regions.push(current);
      }
      current = null;
    }
  }
  if (current && current.strips >= 2) {
    current.avgVariance = current.varianceSum / current.varianceCount;
    regions.push(current);
  }

  // Filter out tiny regions (< 30px tall)
  const filtered = regions.filter(r => (r.bottom - r.top) >= 30);

  // Classify each region
  for (const r of filtered) {
    if (r.avgVariance > 2000) {
      r.type = 'photo';
    } else if (r.avgVariance > 800) {
      r.type = 'mixed';
    } else {
      r.type = 'text';
    }
    r.area = (r.bottom - r.top) * width;
  }

  return { width, height, regions: filtered };
}

// ── Find the best photo region for a page ─────────────────────────

function pickBestPhotoRegion(regions) {
  // Prefer 'photo' type, then 'mixed', then 'text' — always pick the LARGEST by area
  const photos = regions.filter(r => r.type === 'photo');
  if (photos.length > 0) {
    return photos.sort((a, b) => b.area - a.area)[0];
  }
  const mixed = regions.filter(r => r.type === 'mixed');
  if (mixed.length > 0) {
    return mixed.sort((a, b) => b.area - a.area)[0];
  }
  // Last resort: largest region regardless of type
  if (regions.length > 0) {
    return regions.sort((a, b) => b.area - a.area)[0];
  }
  return null;
}

// ── Crop a region from an image ───────────────────────────────────

async function cropRegion(srcPath, region, outPath, pageWidth) {
  const pad = 10;
  const left = Math.max(0, pad);
  const top = Math.max(0, region.top - pad);
  const width = Math.min(pageWidth - pad * 2, pageWidth - pad);
  const height = (region.bottom - region.top) + pad * 2;

  await sharp(srcPath)
    .extract({ left, top, width, height })
    .png()
    .toFile(outPath);

  return Math.round(fs.statSync(outPath).size / 1024);
}

// ── Load products and group by image source ───────────────────────

function loadProducts() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function getProductsByPage(products) {
  const byPage = {};
  for (const p of products) {
    const img = p.images?.[0];
    if (!img) continue;
    // Group by the full image path
    if (!byPage[img]) byPage[img] = [];
    byPage[img].push(p);
  }
  return byPage;
}

// ── Main ──────────────────────────────────────────────────────────

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const data = loadProducts();
  const byPage = getProductsByPage(data.products);

  let cropped = 0;
  let skipped = 0;
  let failed = 0;
  const results = [];

  for (const [imgPath, products] of Object.entries(byPage)) {
    // Resolve the full filesystem path
    const fullPath = path.join(ROOT, 'website', 'public', imgPath);

    if (!fs.existsSync(fullPath)) {
      console.log(`MISSING: ${imgPath}`);
      failed += products.length;
      continue;
    }

    // If already a dedicated crop (small file), skip
    const stat = fs.statSync(fullPath);
    if (stat.size < 50000 && imgPath.includes('/products/')) {
      // This is likely already a crop, check if it looks ok
      skipped += products.length;
      continue;
    }

    const analysis = await findPhotoRegions(fullPath);
    const bestRegion = pickBestPhotoRegion(analysis.regions);

    if (!bestRegion) {
      console.log(`NO REGIONS: ${imgPath} (${products.length} products)`);
      // Use full page as fallback
      for (const p of products) {
        const outName = `${p.id}.png`;
        const outPath = path.join(OUT_DIR, outName);
        try {
          await sharp(fullPath).png().toFile(outPath);
          p.images = [`/images/products/${outName}`];
          cropped++;
        } catch (e) {
          console.log(`  ✗ ${outName}: ${e.message}`);
          failed++;
        }
      }
      continue;
    }

    const regionTypes = analysis.regions.map(r => `${r.type}(${Math.round(r.avgVariance)})`).join(', ');
    console.log(`${path.basename(imgPath)}: ${products.length} products, ${analysis.regions.length} regions [${regionTypes}] -> best: ${bestRegion.type} (variance ${Math.round(bestRegion.avgVariance)}, y=${bestRegion.top}-${bestRegion.bottom})`);

    // Crop the best region for ALL products from this page
    for (const p of products) {
      const outName = `${p.id}.png`;
      const outPath = path.join(OUT_DIR, outName);

      try {
        const kb = await cropRegion(fullPath, bestRegion, outPath, analysis.width);
        p.images = [`/images/products/${outName}`];
        console.log(`  ✓ ${outName} (${kb} KB)`);
        cropped++;
        results.push({ id: p.id, region: bestRegion.type, variance: Math.round(bestRegion.avgVariance) });
      } catch (e) {
        console.log(`  ✗ ${outName}: ${e.message}`);
        failed++;
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
  console.log(`Cropped: ${cropped}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed:  ${failed}`);

  // Stats on region types used
  const byType = {};
  for (const r of results) {
    byType[r.region] = (byType[r.region] || 0) + 1;
  }
  console.log(`Region types: ${JSON.stringify(byType)}`);
}

main();
