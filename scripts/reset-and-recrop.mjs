// Reset all products to full page images, then smart-crop the best photo region.
// Run: node scripts/reset-and-recrop.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const IMG_DIR = path.join(ROOT, 'website', 'public', 'images');
const OUT_DIR = path.join(ROOT, 'website', 'public', 'images', 'products');
const DATA_FILE = path.join(ROOT, 'website', 'src', 'data', 'products.json');

// Map PDF names to page image directories
const PDF_TO_DIR = {
  'Cleaning equipment A4 09 nove.PDF': 'cleaning-equipment-a4-09-nove',
  'Disinfection_system_FINAL[1].PDF': 'disinfection-system-final',
  'Final_filters_07-11-2024[1].PDF': 'final-filters-07-11-2024',
  'Lights A4 Final.PDF': 'lights-a4-final',
  'Pool Fittings final.PDF': 'pool-fittings-final',
  'Pump Final - PART 2.PDF': 'pump-final-part-2',
  'INTEGRATED FILTERS FINAL.PDF': 'integrated-filters-final',
  'Surronding Equipments & Water Features.PDF': 'surronding-equipments-water-features',
  'Pumps Final - PART 1.PDF': 'pumps-final-part-1',
};

// ── Analyze page for photo regions ────────────────────────────────

async function findPhotoRegions(imgPath) {
  const img = sharp(imgPath);
  const meta = await img.metadata();
  const { data: rgbData, info } = await img
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const STRIP_H = 10;
  const strips = [];

  for (let y = 0; y < height; y += STRIP_H) {
    const yEnd = Math.min(y + STRIP_H, height);
    let pixelCount = 0, nonWhiteCount = 0;
    let colorSum = 0, colorSumSq = 0;

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
      }
    }

    const coverage = nonWhiteCount / pixelCount;
    const mean = colorSum / pixelCount;
    const variance = colorSumSq / pixelCount - mean * mean;

    strips.push({ y, yEnd, coverage, variance });
  }

  // Merge consecutive content strips into regions
  const regions = [];
  let current = null;

  for (const strip of strips) {
    const isContent = strip.coverage > 0.05;
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

  // Filter tiny regions and classify
  const filtered = regions.filter(r => (r.bottom - r.top) >= 30);
  for (const r of filtered) {
    r.type = r.avgVariance > 2000 ? 'photo' : r.avgVariance > 800 ? 'mixed' : 'text';
    r.area = (r.bottom - r.top) * width;
  }

  return { width, height, regions: filtered };
}

function pickBestRegion(regions) {
  const photos = regions.filter(r => r.type === 'photo');
  if (photos.length > 0) return photos.sort((a, b) => b.area - a.area)[0];
  
  const mixed = regions.filter(r => r.type === 'mixed');
  if (mixed.length > 0) return mixed.sort((a, b) => b.area - a.area)[0];
  
  if (regions.length > 0) return regions.sort((a, b) => b.area - a.area)[0];
  return null;
}

// ── Crop region from page ─────────────────────────────────────────

async function cropRegion(srcPath, region, outPath, pageWidth) {
  const pad = 5;
  const left = pad;
  const top = Math.max(0, region.top - pad);
  const width = pageWidth - pad * 2;
  const height = (region.bottom - region.top) + pad * 2;

  await sharp(srcPath)
    .extract({ left, top, width, height })
    .png()
    .toFile(outPath);

  return Math.round(fs.statSync(outPath).size / 1024);
}

// ── Main ──────────────────────────────────────────────────────────

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));

  // Step 1: Reset ALL products to their full page images
  console.log('═══ Step 1: Reset to full page images ═══');
  let resetCount = 0;
  let alreadyGood = 0;
  let noMapping = 0;

  for (const p of data.products) {
    if (!p.sourcePdf || !p.sourcePage) {
      // No mapping — keep as-is (already has dedicated image)
      alreadyGood++;
      continue;
    }

    const dirName = PDF_TO_DIR[p.sourcePdf];
    if (!dirName) {
      console.log(`  UNKNOWN PDF: ${p.sourcePdf} for ${p.id}`);
      noMapping++;
      continue;
    }

    const pageNum = String(p.sourcePage).padStart(3, '0');
    const pageImg = path.join('website', 'public', 'images', dirName, `page-${pageNum}.png`);
    const fullPagePath = path.join(ROOT, pageImg);

    if (!fs.existsSync(fullPagePath)) {
      console.log(`  MISSING: ${pageImg} for ${p.id}`);
      noMapping++;
      continue;
    }

    // Check if current image is already the full page (not a crop)
    const currentImg = p.images?.[0] || '';
    if (currentImg.includes(dirName) && currentImg.includes('page-')) {
      alreadyGood++;
      continue; // Already pointing to full page
    }

    // Reset to full page
    p.images = [`/${pageImg.replace(/\\/g, '/')}`];
    resetCount++;
  }

  console.log(`Reset: ${resetCount}, Already good: ${alreadyGood}, No mapping: ${noMapping}`);

  // Step 2: Group products by page and find best photo region
  console.log('\n═══ Step 2: Smart crop photo regions ═══');

  // Group by page image
  const byPage = {};
  for (const p of data.products) {
    const img = p.images?.[0];
    if (!img) continue;
    if (!byPage[img]) byPage[img] = [];
    byPage[img].push(p);
  }

  let cropped = 0;
  let failed = 0;

  for (const [imgPath, products] of Object.entries(byPage)) {
    const fullPath = path.join(ROOT, imgPath);

    if (!fs.existsSync(fullPath)) {
      console.log(`MISSING: ${imgPath}`);
      failed += products.length;
      continue;
    }

    const analysis = await findPhotoRegions(fullPath);
    const bestRegion = pickBestRegion(analysis.regions);

    if (!bestRegion) {
      console.log(`${path.basename(imgPath)}: NO REGIONS — using full page for ${products.length} products`);
      // Use full page as fallback
      for (const p of products) {
        const outName = `${p.id}.png`;
        const outPath = path.join(OUT_DIR, outName);
        try {
          await sharp(fullPath).resize({ width: 800 }).png().toFile(outPath);
          p.images = [`/images/products/${outName}`];
          cropped++;
        } catch (e) {
          console.log(`  ✗ ${outName}: ${e.message}`);
          failed++;
        }
      }
      continue;
    }

    const regionInfo = analysis.regions.map(r => `${r.type}(${Math.round(r.avgVariance)})`).join(', ');
    console.log(`${path.basename(imgPath)}: ${products.length} products → best: ${bestRegion.type} var=${Math.round(bestRegion.avgVariance)} y=${bestRegion.top}-${bestRegion.bottom} [${regionInfo}]`);

    // Crop the best region for ALL products from this page
    for (const p of products) {
      const outName = `${p.id}.png`;
      const outPath = path.join(OUT_DIR, outName);

      try {
        const kb = await cropRegion(fullPath, bestRegion, outPath, analysis.width);
        p.images = [`/images/products/${outName}`];
        console.log(`  ✓ ${outName} (${kb} KB)`);
        cropped++;
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
  console.log(`Failed:  ${failed}`);
  console.log(`Total:   ${data.products.length}`);
}

main();
