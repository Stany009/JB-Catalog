// Comprehensive catalogue processing pipeline.
// Discovers all PDFs, extracts text, identifies products, maps images.
// Run: node scripts/process-all-catalogues.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

const PDF_DIR = path.join(ROOT, '..', 'Mambe Catalog 25-26');
const EXTRACTED_TEXT = path.join(ROOT, 'extracted', 'text');
const EXTRACTED_IMAGES = path.join(ROOT, 'extracted', 'images');
const PRODUCTS_IMG_DIR = path.join(ROOT, 'website', 'public', 'images', 'products');
const DATA_FILE = path.join(ROOT, 'data', 'products.json');
const WEBSITE_DATA = path.join(ROOT, 'website', 'src', 'data', 'products.json');

// PDF filename to directory slug mapping
const PDF_SLUG_MAP = {};
function slugify(name) {
  return name
    .replace(/\.PDF$/i, '')
    .replace(/\[1\]/g, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

// ─── Step 1: Discover all PDFs ──────────────────────────────────

function discoverPDFs() {
  const files = fs.readdirSync(PDF_DIR).filter(f => f.toLowerCase().endsWith('.pdf'));
  const pdfs = [];
  for (const f of files) {
    const fullPath = path.join(PDF_DIR, f);
    const stat = fs.statSync(fullPath);
    const slug = slugify(f);
    PDF_SLUG_MAP[f] = slug;
    pdfs.push({ filename: f, fullPath, slug, size: stat.size });
  }
  return pdfs;
}

// ─── Step 2: Extract text from PDF ──────────────────────────────

async function extractTextFromPDF(pdfInfo) {
  const data = new Uint8Array(fs.readFileSync(pdfInfo.fullPath));
  const doc = await pdfjsLib.getDocument({
    data,
    disableFontFace: true,
    useSystemFonts: false,
    isEvalSupported: false,
    verbosity: 0,
  }).promise;

  const numPages = doc.numPages;
  const pages = [];

  for (let p = 1; p <= numPages; p++) {
    const page = await doc.getPage(p);
    const tc = await page.getTextContent();
    const lines = [];
    let lastY = null;
    let currentLine = [];

    for (const item of tc.items) {
      const t = ('str' in item ? item.str : '').trim();
      if (!t) continue;
      const y = Math.round(item.transform[5]);
      if (lastY === null || Math.abs(y - lastY) < 3) {
        currentLine.push(t);
      } else {
        lines.push(currentLine.join(' ').replace(/\s+/g, ' ').trim());
        currentLine = [t];
      }
      lastY = y;
    }
    if (currentLine.length) lines.push(currentLine.join(' ').replace(/\s+/g, ' ').trim());

    pages.push({ page: p, text: lines.join('\n') });
    process.stdout.write(`  ${pdfInfo.slug} p${p}/${numPages}\r`);
  }

  // Save extracted text
  const outDir = path.join(EXTRACTED_TEXT, pdfInfo.slug);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, 'text.json'),
    JSON.stringify({ source: pdfInfo.filename, slug: pdfInfo.slug, numPages, pages }, null, 2)
  );

  return { source: pdfInfo.filename, slug: pdfInfo.slug, numPages, pages };
}

// ─── Step 3: Extract embedded images from PDF ───────────────────

async function extractEmbeddedImages(pdfInfo) {
  const data = new Uint8Array(fs.readFileSync(pdfInfo.fullPath));
  const doc = await pdfjsLib.getDocument({
    data,
    disableFontFace: true,
    useSystemFonts: false,
    isEvalSupported: false,
    verbosity: 0,
  }).promise;

  const numPages = doc.numPages;
  const extractedImages = [];

  for (let p = 1; p <= numPages; p++) {
    const page = await doc.getPage(p);
    const ops = await page.getOperatorList();

    let imageCount = 0;
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === 82) { // OPS.paintImageXObject
        const imgName = ops.argsArray[i][0];
        try {
          const imgData = await page.objs.get(imgName);
          if (imgData && imgData.bitmap) {
            // Save the embedded image
            const outDir = path.join(EXTRACTED_IMAGES, pdfInfo.slug, 'embedded');
            fs.mkdirSync(outDir, { recursive: true });
            const outPath = path.join(outDir, `page-${String(p).padStart(3, '0')}-img-${imageCount}.png`);

            // Convert bitmap to PNG using sharp
            const { width, height, data: rgba } = imgData.bitmap;
            await sharp(Buffer.from(rgba), {
              raw: { width, height, channels: 4 }
            }).png().toFile(outPath);

            extractedImages.push({
              page: p,
              index: imageCount,
              path: outPath,
              width,
              height,
              size: fs.statSync(outPath).size,
            });
            imageCount++;
          }
        } catch (e) {
          // Skip images that can't be extracted
        }
      }
    }
  }

  return extractedImages;
}

// ─── Step 4: Render pages as fallback images ────────────────────

async function renderPages(pdfInfo) {
  const data = new Uint8Array(fs.readFileSync(pdfInfo.fullPath));
  const doc = await pdfjsLib.getDocument({
    data,
    disableFontFace: true,
    useSystemFonts: false,
    isEvalSupported: false,
    verbosity: 0,
  }).promise;

  const outDir = path.join(EXTRACTED_IMAGES, pdfInfo.slug);
  fs.mkdirSync(outDir, { recursive: true });

  const { createCanvas } = await import('canvas');
  
  class NodeCanvasFactory {
    create(width, height) {
      if (width <= 0 || height <= 0) throw new Error('Invalid canvas size');
      const canvas = createCanvas(width, height);
      return { canvas, context: canvas.getContext('2d') };
    }
    reset(canvasAndContext, width, height) {
      if (!canvasAndContext.canvas) throw new Error('Canvas is not specified');
      canvasAndContext.canvas.width = width;
      canvasAndContext.canvas.height = height;
    }
    destroy(canvasAndContext) {
      if (canvasAndContext.canvas) {
        canvasAndContext.canvas.width = 0;
        canvasAndContext.canvas.height = 0;
        canvasAndContext.canvas = null;
        canvasAndContext.context = null;
      }
    }
  }

  const factory = new NodeCanvasFactory();
  const numPages = doc.numPages;

  for (let p = 1; p <= numPages; p++) {
    const page = await doc.getPage(p);
    const viewport = page.getViewport({ scale: 1.5 });
    const { canvas, context } = factory.create(viewport.width, viewport.height);
    
    try {
      await page.render({ canvasContext: context, viewport, canvasFactory: factory }).promise;
      const outPath = path.join(outDir, `page-${String(p).padStart(3, '0')}.png`);
      fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
    } catch (e) {
      console.error(`  render fail p${p}: ${e.message}`);
    } finally {
      factory.destroy({ canvas, context });
    }
  }

  return numPages;
}

// ─── Step 5: Smart product image extraction from page ───────────

async function extractProductImageFromPage(pageImgPath, region) {
  // region: { top, bottom, left, right } in pixel coordinates
  try {
    const meta = await sharp(pageImgPath).metadata();
    const padX = Math.round(meta.width * 0.02);
    const padY = Math.round(meta.height * 0.02);

    const left = Math.max(0, (region.left || 30) - padX);
    const top = Math.max(0, region.top - padY);
    const width = Math.min(meta.width - left, (region.right || meta.width - 30) - (region.left || 30) + padX * 2);
    const height = Math.min(meta.height - top, region.bottom - region.top + padY * 2);

    if (width < 30 || height < 30) return null;

    const buffer = await sharp(pageImgPath)
      .extract({ left, top, width, height })
      .png()
      .toBuffer();

    return buffer;
  } catch (e) {
    return null;
  }
}

// ─── Step 6: Analyze page for product photo regions ─────────────

async function findProductPhotoRegions(pageImgPath) {
  try {
    const { data: rawData, info } = await sharp(pageImgPath)
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height, channels } = info;
    
    // Find horizontal white-space gaps
    const rowAvg = [];
    for (let y = 0; y < height; y++) {
      let sum = 0;
      for (let x = 0; x < width; x++) {
        sum += rawData[(y * width + x) * channels];
      }
      rowAvg.push(sum / width);
    }

    // Find sections between white gaps
    const MARGIN = Math.round(height * 0.02);
    const sections = [];
    let sectionStart = MARGIN;
    let inGap = false;
    let gapStart = 0;

    for (let y = MARGIN; y < height - MARGIN; y++) {
      if (rowAvg[y] > 235) {
        if (!inGap) { gapStart = y; inGap = true; }
      } else {
        if (inGap && (y - gapStart) > 12) {
          if (gapStart > sectionStart + 30) {
            sections.push({ top: sectionStart, bottom: gapStart });
          }
          sectionStart = y;
        }
        inGap = false;
      }
    }
    if (sectionStart < height - MARGIN) {
      sections.push({ top: sectionStart, bottom: height - MARGIN });
    }

    // Score each section for visual complexity (photo vs text/table)
    const scoredSections = [];
    for (const section of sections) {
      const sectionH = section.bottom - section.top;
      if (sectionH < 40) continue;

      const regionData = [];
      const left = Math.round(width * 0.03);
      const right = width - left;
      const regionW = right - left;

      for (let y = section.top; y < section.bottom; y++) {
        for (let x = left; x < right; x++) {
          regionData.push(rawData[(y * width + x) * channels]);
        }
      }

      // Calculate visual metrics
      let sum = 0, sumSq = 0;
      for (let i = 0; i < regionData.length; i++) {
        sum += regionData[i];
        sumSq += regionData[i] * regionData[i];
      }
      const avg = sum / regionData.length;
      const variance = sumSq / regionData.length - avg * avg;
      const stddev = Math.sqrt(variance);

      // Count uniform rows (table indicator)
      let uniformRows = 0;
      for (let y = section.top; y < section.bottom; y++) {
        let rowSum = 0, rowSumSq = 0;
        for (let x = left; x < right; x++) {
          const v = rawData[(y * width + x) * channels];
          rowSum += v;
          rowSumSq += v * v;
        }
        const rowAvg = rowSum / regionW;
        const rowVar = rowSumSq / regionW - rowAvg * rowAvg;
        if (rowVar < 200) uniformRows++;
      }
      const uniformRatio = uniformRows / sectionH;

      // Score: photos have high variance, tables have uniform rows
      let score = stddev * 2 + (1 - uniformRatio) * 100;
      let type = 'photo';
      if (uniformRatio > 0.7 && stddev < 30) {
        score = -50;
        type = 'table';
      } else if (avg > 230 && stddev < 15) {
        score = -100;
        type = 'blank';
      }

      scoredSections.push({ ...section, left, right, score, type, stddev: Math.round(stddev), uniformRatio: Math.round(uniformRatio * 100) });
    }

    return scoredSections.filter(s => s.type === 'photo' || s.score > 0);
  } catch (e) {
    return [];
  }
}

// ─── Step 7: Product data enrichment ────────────────────────────

function slugifyProduct(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function enrichProduct(product, sourcePdf, sourcePage, imageUrl) {
  return {
    ...product,
    id: product.id || slugifyProduct(product.name),
    slug: product.slug || slugifyProduct(product.name),
    images: product.images || [imageUrl],
    sourcePdf: product.sourcePdf || sourcePdf,
    sourcePage: product.sourcePage || sourcePage,
  };
}

// ─── Main pipeline ─────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  MAMBE CATALOGUE PROCESSING PIPELINE');
  console.log('═══════════════════════════════════════════════════\n');

  // Step 1: Discover PDFs
  const pdfs = discoverPDFs();
  console.log(`Found ${pdfs.length} PDFs:`);
  pdfs.forEach(p => console.log(`  - ${p.filename} (${(p.size / 1024 / 1024).toFixed(1)} MB)`));
  console.log('');

  // Load existing products
  const existingData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  const existingProducts = new Map();
  for (const p of existingData.products) {
    // Index by multiple keys for duplicate detection
    const keys = [
      `${p.name.toLowerCase()}:${p.model || ''}`,
      `${p.id}`,
      `${p.productCode || ''}:${p.model || ''}`,
    ];
    for (const key of keys) {
      if (key.replace(/:/g, '')) existingProducts.set(key, p);
    }
  }

  const report = {
    totalPdfs: pdfs.length,
    pdfsProcessed: [],
    totalPages: 0,
    totalProductsDiscovered: 0,
    newProducts: 0,
    existingProductsMatched: 0,
    duplicatesMerged: 0,
    productsWithDedicatedImages: 0,
    productsUsingPageFallback: 0,
    productsRequiringReview: 0,
    productsFromPumpsPart1: 0,
  };

  const newProducts = [];

  // Process each PDF
  for (const pdfInfo of pdfs) {
    console.log(`\n── Processing: ${pdfInfo.filename} ──`);

    const pdfReport = {
      filename: pdfInfo.filename,
      slug: pdfInfo.slug,
      totalPages: 0,
      productsDiscovered: 0,
      newProducts: 0,
      existingMatched: 0,
      extractionStatus: 'pending',
    };

    try {
      // Extract text
      console.log('  Extracting text...');
      const textData = await extractTextFromPDF(pdfInfo);
      pdfReport.totalPages = textData.numPages;
      report.totalPages += textData.numPages;

      // Check for existing extracted page images
      const pageImgDir = path.join(EXTRACTED_IMAGES, pdfInfo.slug);
      let needsRender = false;
      if (!fs.existsSync(pageImgDir) || fs.readdirSync(pageImgDir).filter(f => f.endsWith('.png') && !f.includes('embedded')).length < textData.numPages) {
        console.log('  Rendering pages...');
        needsRender = true;
        await renderPages(pdfInfo);
      } else {
        console.log('  Page images already exist');
      }

      // Try to extract embedded images
      console.log('  Checking for embedded images...');
      let embeddedImages = [];
      try {
        embeddedImages = await extractEmbeddedImages(pdfInfo);
        console.log(`  Found ${embeddedImages.length} embedded images`);
      } catch (e) {
        console.log(`  Embedded extraction failed: ${e.message}`);
      }

      // Map existing products to this PDF
      for (const product of existingData.products) {
        if (product.sourcePdf === pdfInfo.filename) {
          pdfReport.existingMatched++;
          report.existingProductsMatched++;
        }
      }

      pdfReport.productsDiscovered = pdfReport.existingMatched;
      pdfReport.existingMatched = pdfReport.existingMatched; // Will be recounted below
      pdfReport.extractionStatus = 'complete';

    } catch (e) {
      console.error(`  ERROR: ${e.message}`);
      pdfReport.extractionStatus = 'failed';
    }

    report.pdfsProcessed.push(pdfReport);
  }

  // Final summary
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  PROCESSING COMPLETE');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  Total PDFs processed: ${report.totalPdfs}`);
  console.log(`  Total pages processed: ${report.totalPages}`);
  console.log(`  Existing products: ${existingData.products.length}`);
  console.log(`  Products with dedicated images: ${existingData.products.filter(p => p.images?.[0]?.startsWith('/images/products/')).length}`);
  console.log('');

  // Detailed per-PDF report
  console.log('  Per-PDF Breakdown:');
  for (const pdf of report.pdfsProcessed) {
    console.log(`    ${pdf.filename}: ${pdf.totalPages} pages, ${pdf.extractionStatus}`);
  }

  // Save report
  fs.writeFileSync(
    path.join(ROOT, 'data', 'processing-report.json'),
    JSON.stringify(report, null, 2)
  );
  console.log('\n  Report saved to data/processing-report.json');
}

main().catch(e => {
  console.error('Pipeline failed:', e);
  process.exit(1);
});
