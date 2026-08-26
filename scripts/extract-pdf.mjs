// Extract text and images from each PDF using pdfjs-dist 3.x
// Output: extracted/text/<slug>.json with per-page text, and extracted/images/<slug>/page-N.png

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { createCanvas } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

const ROOT = path.resolve(__dirname, '..');
const PDF_DIR = path.join(ROOT, '..', 'Mambe Catalog 25-26');
const OUT_TEXT_DIR = path.join(ROOT, 'extracted', 'text');
const OUT_IMG_DIR = path.join(ROOT, 'extracted', 'images');

fs.mkdirSync(OUT_TEXT_DIR, { recursive: true });
fs.mkdirSync(OUT_IMG_DIR, { recursive: true });

function slugify(name) {
  return name
    .replace(/\.PDF$/i, '')
    .replace(/\[1\]/g, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

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

async function extractOne(pdfPath) {
  const baseName = path.basename(pdfPath);
  const slug = slugify(baseName);
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({
    data,
    disableFontFace: true,
    useSystemFonts: false,
    canvasFactory: new NodeCanvasFactory(),
    isEvalSupported: false,
    verbosity: 0,
  }).promise;
  const numPages = doc.numPages;
  const pageData = [];

  const imgOutDir = path.join(OUT_IMG_DIR, slug);
  fs.mkdirSync(imgOutDir, { recursive: true });

  const factory = new NodeCanvasFactory();

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

    // Render page to PNG
    try {
      const viewport = page.getViewport({ scale: 1.5 });
      const { canvas, context } = factory.create(viewport.width, viewport.height);
      await page.render({ canvasContext: context, viewport, canvasFactory: factory }).promise;
      const outImg = path.join(imgOutDir, `page-${String(p).padStart(3, '0')}.png`);
      fs.writeFileSync(outImg, canvas.toBuffer('image/png'));
      factory.destroy({ canvas, context });
    } catch (e) {
      console.error(`  render fail p${p}: ${e.message}`);
    }

    pageData.push({ page: p, text: lines.join('\n') });
    process.stdout.write(`  ${slug} p${p}/${numPages}\r`);
  }

  fs.writeFileSync(
    path.join(OUT_TEXT_DIR, `${slug}.json`),
    JSON.stringify({ source: baseName, slug, numPages, pages: pageData }, null, 2)
  );
  console.log(`OK ${baseName} (${numPages} pages) -> ${slug}`);
  return { source: baseName, slug, numPages };
}

const files = fs.readdirSync(PDF_DIR).filter(f => f.toLowerCase().endsWith('.pdf'));
const results = [];
for (const f of files) {
  try {
    results.push(await extractOne(path.join(PDF_DIR, f)));
  } catch (e) {
    console.error(`FAIL ${f}: ${e.message}`);
  }
}
fs.writeFileSync(path.join(OUT_TEXT_DIR, '_index.json'), JSON.stringify(results, null, 2));
console.log('\nAll done.');
