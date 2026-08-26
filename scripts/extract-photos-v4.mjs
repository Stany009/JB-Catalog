// Extract product photos v4: Uses saturation + edge detection to find real product photos.
// Photos have high color saturation AND lots of edges. Tables have low saturation + grid edges.
// Blue bars have high blue channel + low edges. Text has low everything.
// Run: node scripts/extract-photos-v4.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const IMG_DIR = path.join(ROOT, 'website', 'public', 'images');
const OUT_DIR = path.join(ROOT, 'website', 'public', 'images', 'products');
const DATA_FILE = path.join(ROOT, 'website', 'src', 'data', 'products.json');

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

// ── Analyze a strip of the image ──────────────────────────────────

function analyzeStrip(rgbData, width, channels, yStart, yEnd) {
  let pixelCount = 0;
  let nonWhiteCount = 0;
  let brightnessSum = 0;
  let brightnessSqSum = 0;

  // Color channel sums for saturation detection
  let rSum = 0, gSum = 0, bSum = 0;
  let rVar = 0, gVar = 0, bVar = 0;

  // Edge detection (simple horizontal gradient)
  let edgeCount = 0;

  for (let y = yStart; y < yEnd; y += 2) {
    let prevR = 0, prevG = 0, prevB = 0;
    for (let x = 0; x < width; x += 2) {
      const idx = (y * width + x) * channels;
      const r = rgbData[idx];
      const g = channels >= 3 ? rgbData[idx + 1] : r;
      const b = channels >= 3 ? rgbData[idx + 2] : r;
      const brightness = (r + g + b) / 3;

      pixelCount++;
      if (brightness < 245) nonWhiteCount++;
      brightnessSum += brightness;
      brightnessSqSum += brightness * brightness;
      rSum += r; gSum += g; bSum += b;

      // Edge detection
      if (x > 0) {
        const dr = Math.abs(r - prevR);
        const dg = Math.abs(g - prevG);
        const db = Math.abs(b - prevB);
        if (dr + dg + db > 60) edgeCount++;
      }
      prevR = r; prevG = g; prevB = b;
    }
  }

  const mean = brightnessSum / pixelCount;
  const variance = brightnessSqSum / pixelCount - mean * mean;

  // Saturation: how much color variation there is
  const rMean = rSum / pixelCount;
  const gMean = gSum / pixelCount;
  const bMean = bSum / pixelCount;
  const maxChannel = Math.max(rMean, gMean, bMean);
  const minChannel = Math.min(rMean, gMean, bMean);
  const saturation = maxChannel > 0 ? (maxChannel - minChannel) / maxChannel : 0;

  // Edge density (edges per pixel)
  const edgeDensity = edgeCount / pixelCount;

  // Blue dominance (for detecting blue header bars)
  const blueDominance = bMean > rMean + 30 && bMean > gMean + 10;

  return {
    coverage: nonWhiteCount / pixelCount,
    variance,
    saturation,
    edgeDensity,
    blueDominance,
    brightness: mean,
    rMean, gMean, bMean,
  };
}

// ── Classify a region ─────────────────────────────────────────────

function classifyRegion(analysis) {
  const { coverage, variance, saturation, edgeDensity, blueDominance, brightness } = analysis;

  // Empty/white region
  if (coverage < 0.05) return 'empty';

  // Blue header bar (common in Mambe catalogue)
  if (blueDominance && saturation > 0.15 && coverage > 0.1) return 'blue-bar';

  // Spec table: lots of edges (grid lines) but low saturation, high brightness
  if (edgeDensity > 0.08 && saturation < 0.08 && brightness > 200) return 'table';

  // Text block: low saturation, moderate edges, mostly white
  if (saturation < 0.05 && variance < 500) return 'text';

  // Product photo: high saturation OR high variance with good coverage
  if (saturation > 0.1 || (variance > 2000 && coverage > 0.15)) return 'photo';

  // Mixed content
  if (variance > 800 || saturation > 0.05) return 'mixed';

  return 'text';
}

// ── Find regions on a page ────────────────────────────────────────

async function analyzePage(imgPath) {
  const img = sharp(imgPath);
  const meta = await img.metadata();
  const { data: rgbData, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const STRIP_H = 8;
  const stripAnalyses = [];

  for (let y = 0; y < height; y += STRIP_H) {
    const yEnd = Math.min(y + STRIP_H, height);
    const analysis = analyzeStrip(rgbData, width, channels, y, yEnd);
    stripAnalyses.push({ y, yEnd, ...analysis });
  }

  // Merge consecutive strips into regions (break on empty strips)
  const regions = [];
  let current = null;

  for (const strip of stripAnalyses) {
    if (strip.coverage > 0.03) {
      if (!current) {
        current = {
          top: strip.y,
          bottom: strip.yEnd,
          analyses: [],
        };
      }
      current.bottom = strip.yEnd;
      current.analyses.push(strip);
    } else {
      if (current && current.analyses.length >= 2) {
        regions.push(current);
      }
      current = null;
    }
  }
  if (current && current.analyses.length >= 2) {
    regions.push(current);
  }

  // Filter tiny regions and classify
  const classified = [];
  for (const region of regions) {
    if ((region.bottom - region.top) < 20) continue;

    // Average the analyses across the region
    const avg = {
      coverage: 0, variance: 0, saturation: 0,
      edgeDensity: 0, blueDominance: false, brightness: 0,
    };
    for (const a of region.analyses) {
      avg.coverage += a.coverage;
      avg.variance += a.variance;
      avg.saturation += a.saturation;
      avg.edgeDensity += a.edgeDensity;
      avg.brightness += a.brightness;
      if (a.blueDominance) avg.blueDominance = true;
    }
    const n = region.analyses.length;
    avg.coverage /= n;
    avg.variance /= n;
    avg.saturation /= n;
    avg.edgeDensity /= n;
    avg.brightness /= n;

    const type = classifyRegion(avg);

    classified.push({
      top: region.top,
      bottom: region.bottom,
      height: region.bottom - region.top,
      type,
      score: type === 'photo' ? (avg.saturation * 100 + avg.variance / 100 + avg.coverage * 10) : 0,
      avg,
    });
  }

  return { width, height, regions: classified };
}

// ── Pick best photo region ────────────────────────────────────────

function pickBestPhoto(regions) {
  // Prefer 'photo' type, sorted by score (saturation + variance + coverage)
  const photos = regions.filter(r => r.type === 'photo');
  if (photos.length > 0) {
    return photos.sort((a, b) => b.score - a.score)[0];
  }

  // Fallback: 'mixed' with decent saturation
  const mixed = regions.filter(r => r.type === 'mixed' && r.avg.saturation > 0.05);
  if (mixed.length > 0) {
    return mixed.sort((a, b) => b.score - a.score)[0];
  }

  // Last resort: largest non-text, non-table region
  const usable = regions.filter(r => r.type !== 'text' && r.type !== 'table' && r.type !== 'blue-bar' && r.type !== 'empty');
  if (usable.length > 0) {
    return usable.sort((a, b) => b.height - a.height)[0];
  }

  return null;
}

// ── Crop ──────────────────────────────────────────────────────────

async function cropRegion(srcPath, region, outPath, pageWidth, pageHeight) {
  const pad = 5;
  const left = pad;
  const top = Math.max(0, region.top - pad);
  const width = pageWidth - pad * 2;
  const height = Math.min(region.height + pad * 2, pageHeight - top);

  if (height < 10 || top + height > pageHeight + 10) {
    throw new Error(`Bad bounds: top=${top} h=${height} pageH=${pageHeight}`);
  }

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

  // Step 1: Reset all products to full page images
  console.log('═══ Step 1: Reset to full page images ═══');
  let resetCount = 0;
  for (const p of data.products) {
    if (!p.sourcePdf || !p.sourcePage) continue;
    const dirName = PDF_TO_DIR[p.sourcePdf];
    if (!dirName) continue;
    const pageNum = String(p.sourcePage).padStart(3, '0');
    const pageImg = `/images/${dirName}/page-${pageNum}.png`;
    const fullPath = path.join(ROOT, 'website', 'public', pageImg);
    if (!fs.existsSync(fullPath)) continue;
    p.images = [pageImg];
    resetCount++;
  }
  console.log(`Reset ${resetCount} products to full pages`);

  // Step 2: Group by page and find best photo
  console.log('\n═══ Step 2: Extract photos ═══');

  const byPage = {};
  for (const p of data.products) {
    const img = p.images?.[0];
    if (!img) continue;
    if (!byPage[img]) byPage[img] = [];
    byPage[img].push(p);
  }

  let cropped = 0, failed = 0, usedFallback = 0, skipped = 0;

  for (const [imgPath, products] of Object.entries(byPage)) {
    const fullPath = path.join(ROOT, 'website', 'public', imgPath);
    if (!fs.existsSync(fullPath)) {
      console.log(`MISSING: ${imgPath}`);
      failed += products.length;
      continue;
    }

    // Skip if already a dedicated small crop (not a page image)
    if (imgPath.includes('/products/') && !imgPath.includes('page-')) {
      skipped += products.length;
      continue;
    }

    const analysis = await analyzePage(fullPath);
    const best = pickBestPhoto(analysis.regions);

    const regionSummary = analysis.regions.map(r => `${r.type}(${Math.round(r.score || 0)})`).join(', ');

    if (!best) {
      console.log(`${path.basename(imgPath)}: NO PHOTO — fallback full page for ${products.length} products`);
      for (const p of products) {
        const outName = `${p.id}.png`;
        const outPath = path.join(OUT_DIR, outName);
        try {
          await sharp(fullPath).resize({ width: 800, fit: 'contain', background: '#f0f4f8' }).png().toFile(outPath);
          p.images = [`/images/products/${outName}`];
          cropped++;
          usedFallback++;
        } catch (e) {
          console.log(`  ✗ ${outName}: ${e.message}`);
          failed++;
        }
      }
      continue;
    }

    console.log(`${path.basename(imgPath)}: ${products.length} products → ${best.type} score=${Math.round(best.score)} y=${best.top}-${best.bottom} [${regionSummary}]`);

    for (const p of products) {
      const outName = `${p.id}.png`;
      const outPath = path.join(OUT_DIR, outName);

      try {
        const kb = await cropRegion(fullPath, best, outPath, analysis.width, analysis.height);
        p.images = [`/images/products/${outName}`];
        console.log(`  ✓ ${outName} (${kb} KB)`);
        cropped++;
      } catch (e) {
        // Fallback: resize full page
        console.log(`  ⚠ ${outName}: ${e.message} — using full page`);
        try {
          await sharp(fullPath).resize({ width: 800, fit: 'contain', background: '#f0f4f8' }).png().toFile(outPath);
          p.images = [`/images/products/${outName}`];
          cropped++;
          usedFallback++;
        } catch (e2) {
          console.log(`  ✗ ${outName}: ${e2.message}`);
          failed++;
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
  console.log(`Cropped: ${cropped}`);
  console.log(`Fallback: ${usedFallback}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${data.products.length}`);
}

main();
