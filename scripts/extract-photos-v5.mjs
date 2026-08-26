// Extract product photos v5: Works for both color AND grayscale catalogue pages.
// Uses variance + edge density patterns to distinguish photos from tables/text.
// Photos: high variance, moderate edges, smooth gradients
// Tables: high edges (grid lines), structured rows
// Text: moderate variance, moderate edges
// Blue bars: detected by blue channel dominance
// Run: node scripts/extract-photos-v5.mjs

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

// ── Analyze strip ─────────────────────────────────────────────────

function analyzeStrip(rgbData, width, channels, yStart, yEnd) {
  let pc = 0, nwc = 0;
  let brightnessSum = 0, brightnessSqSum = 0;
  let rSum = 0, gSum = 0, bSum = 0;

  // Horizontal edge detection
  let hEdgeCount = 0;
  // Vertical edge detection (between strips)
  let rowBrightness = [];

  for (let y = yStart; y < yEnd; y++) {
    let rowSum = 0, rowPc = 0;
    for (let x = 0; x < width; x += 2) {
      const idx = (y * width + x) * channels;
      const r = rgbData[idx];
      const g = channels >= 3 ? rgbData[idx + 1] : r;
      const b = channels >= 3 ? rgbData[idx + 2] : r;
      const bright = (r + g + b) / 3;
      pc++;
      if (bright < 240) nwc++;
      brightnessSum += bright;
      brightnessSqSum += bright * bright;
      rSum += r; gSum += g; bSum += b;

      // Horizontal edge
      if (x >= 2) {
        const prevIdx = (y * width + (x - 2)) * channels;
        const prevBright = (rgbData[prevIdx] + (channels >= 3 ? rgbData[prevIdx+1] : rgbData[prevIdx]) + (channels >= 3 ? rgbData[prevIdx+2] : rgbData[prevIdx])) / 3;
        if (Math.abs(bright - prevBright) > 30) hEdgeCount++;
      }
      rowSum += bright;
      rowPc++;
    }
    rowBrightness.push(rowSum / rowPc);
  }

  // Vertical edge detection (contrast between consecutive rows)
  let vEdgeCount = 0;
  for (let i = 1; i < rowBrightness.length; i++) {
    if (Math.abs(rowBrightness[i] - rowBrightness[i-1]) > 15) vEdgeCount++;
  }

  const mean = brightnessSum / pc;
  const variance = brightnessSqSum / pc - mean * mean;
  const hEdge = hEdgeCount / pc;
  const vEdge = vEdgeCount / rowBrightness.length;

  // Blue detection
  const rMean = rSum / pc;
  const gMean = gSum / pc;
  const bMean = bSum / pc;
  const blueDom = bMean > rMean + 20 && bMean > gMean + 10;

  // Table detection: high horizontal edges (grid lines) + regular vertical edges
  // Photos: high variance, low structured edges
  // Text: moderate variance, low edges

  return {
    coverage: nwc / pc,
    variance,
    hEdge,
    vEdge,
    blueDom,
    brightness: mean,
  };
}

// ── Classify region ───────────────────────────────────────────────

function classifyRegion(analysis) {
  const { coverage, variance, hEdge, vEdge, blueDom, brightness } = analysis;

  if (coverage < 0.03) return 'empty';

  // Blue header bar
  if (blueDom && coverage > 0.1) return 'blue-bar';

  // Table: high horizontal edge density (grid lines) + moderate coverage
  // Tables have very regular horizontal lines (row separators)
  if (hEdge > 0.12 && coverage > 0.4) return 'table';

  // Spec table with numbers: high hEdge, lower coverage (text in cells)
  if (hEdge > 0.08 && vEdge > 0.15 && coverage > 0.15) return 'table';

  // Product photo: high variance, moderate edges (object outlines, not grid)
  // Photos have more variance than tables because they contain real-world imagery
  if (variance > 3000 && coverage > 0.1) return 'photo';
  if (variance > 1500 && hEdge < 0.06 && coverage > 0.08) return 'photo';

  // Text block: low hEdge, moderate variance (text characters)
  if (hEdge < 0.04 && coverage > 0.3) return 'text';

  // Mixed content
  if (variance > 500) return 'mixed';

  return 'text';
}

// ── Analyze page ──────────────────────────────────────────────────

async function analyzePage(imgPath) {
  const img = sharp(imgPath);
  const meta = await img.metadata();
  const { data: rgbData, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const STRIP_H = 12;
  const stripData = [];

  for (let y = 0; y < height; y += STRIP_H) {
    const yEnd = Math.min(y + STRIP_H, height);
    const a = analyzeStrip(rgbData, width, channels, y, yEnd);
    stripData.push({ y, yEnd, ...a });
  }

  // Merge consecutive non-empty strips into regions
  const regions = [];
  let cur = null;

  for (const s of stripData) {
    if (s.coverage > 0.02) {
      if (!cur) cur = { top: s.y, bottom: s.yEnd, analyses: [] };
      cur.bottom = s.yEnd;
      cur.analyses.push(s);
    } else {
      if (cur && cur.analyses.length >= 2) regions.push(cur);
      cur = null;
    }
  }
  if (cur && cur.analyses.length >= 2) regions.push(cur);

  // Classify each region
  const classified = [];
  for (const region of regions) {
    if ((region.bottom - region.top) < 20) continue;

    const avg = { coverage: 0, variance: 0, hEdge: 0, vEdge: 0, blueDom: false, brightness: 0 };
    for (const a of region.analyses) {
      avg.coverage += a.coverage;
      avg.variance += a.variance;
      avg.hEdge += a.hEdge;
      avg.vEdge += a.vEdge;
      avg.brightness += a.brightness;
      if (a.blueDom) avg.blueDom = true;
    }
    const n = region.analyses.length;
    avg.coverage /= n;
    avg.variance /= n;
    avg.hEdge /= n;
    avg.vEdge /= n;
    avg.brightness /= n;

    const type = classifyRegion(avg);

    classified.push({
      top: region.top,
      bottom: region.bottom,
      height: region.bottom - region.top,
      type,
      score: type === 'photo' ? (avg.variance / 100 + avg.coverage * 20) : 0,
      avg,
    });
  }

  return { width, height, regions: classified };
}

// ── Pick best photo ───────────────────────────────────────────────

function pickBestPhoto(regions) {
  const photos = regions.filter(r => r.type === 'photo');
  if (photos.length > 0) return photos.sort((a, b) => b.score - a.score)[0];

  // Fallback: largest region that's not table/text/blue-bar/empty
  const usable = regions.filter(r => !['text', 'table', 'blue-bar', 'empty'].includes(r.type));
  if (usable.length > 0) return usable.sort((a, b) => b.height - a.height)[0];

  // Last resort: largest region overall
  if (regions.length > 0) return regions.sort((a, b) => b.height - a.height)[0];

  return null;
}

// ── Crop ──────────────────────────────────────────────────────────

async function cropAndSave(srcPath, region, outPath, pageWidth, pageHeight) {
  const pad = 5;
  const top = Math.max(0, region.top - pad);
  const height = Math.min(region.height + pad * 2, pageHeight - top);

  await sharp(srcPath)
    .extract({ left: 0, top, width: pageWidth, height })
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
    if (!fs.existsSync(path.join(ROOT, 'website', 'public', pageImg))) continue;
    p.images = [pageImg];
    resetCount++;
  }
  console.log(`Reset ${resetCount} products`);

  // Step 2: Group by page and extract
  console.log('\n═══ Step 2: Extract photos ═══');

  const byPage = {};
  for (const p of data.products) {
    const img = p.images?.[0];
    if (!img) continue;
    if (!byPage[img]) byPage[img] = [];
    byPage[img].push(p);
  }

  let cropped = 0, fallback = 0, failed = 0;

  for (const [imgPath, products] of Object.entries(byPage)) {
    const fullPath = path.join(ROOT, 'website', 'public', imgPath);
    if (!fs.existsSync(fullPath)) { failed += products.length; continue; }

    // Skip already-cropped product images
    if (imgPath.includes('/products/') && !imgPath.includes('page-')) continue;

    const analysis = await analyzePage(fullPath);
    const best = pickBestPhoto(analysis.regions);

    const summary = analysis.regions.map(r => `${r.type}(${Math.round(r.score || 0)})`).join(', ');

    if (!best || best.height < 30) {
      console.log(`${path.basename(imgPath)}: no good region → full page for ${products.length}`);
      for (const p of products) {
        const out = path.join(OUT_DIR, `${p.id}.png`);
        try {
          await sharp(fullPath).resize({ width: 800, fit: 'contain', background: '#f0f4f8' }).png().toFile(out);
          p.images = [`/images/products/${p.id}.png`];
          fallback++;
        } catch (e) { failed++; }
      }
      continue;
    }

    console.log(`${path.basename(imgPath)}: ${products.length}p → ${best.type} y=${best.top}-${best.bottom} h=${best.height} [${summary}]`);

    for (const p of products) {
      const out = path.join(OUT_DIR, `${p.id}.png`);
      try {
        const kb = await cropAndSave(fullPath, best, out, analysis.width, analysis.height);
        p.images = [`/images/products/${p.id}.png`];
        console.log(`  ✓ ${p.id} (${kb}KB)`);
        cropped++;
      } catch (e) {
        // Fallback
        try {
          await sharp(fullPath).resize({ width: 800, fit: 'contain', background: '#f0f4f8' }).png().toFile(out);
          p.images = [`/images/products/${p.id}.png`];
          fallback++;
        } catch (e2) { failed++; }
      }
    }
  }

  // Save
  data.totalProducts = data.products.length;
  data.lastUpdated = new Date().toISOString().slice(0, 10);
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(DATA_FILE, json);
  fs.writeFileSync(path.join(ROOT, 'website', 'src', 'data', 'products.json'), json);

  console.log(`\n═══ Done ═══`);
  console.log(`Cropped: ${cropped}, Fallback: ${fallback}, Failed: ${failed}`);
}

main();
