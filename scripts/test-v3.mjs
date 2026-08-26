// Test with pdfjs-dist 3.x
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

const ROOT = path.resolve(__dirname, '..');
const PDF = path.join(ROOT, '..', 'Mambe Catalog 25-26', 'cover pages new.PDF');

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

const data = new Uint8Array(fs.readFileSync(PDF));
const doc = await pdfjsLib.getDocument({
  data,
  disableFontFace: true,
  useSystemFonts: false,
  canvasFactory: new NodeCanvasFactory(),
  isEvalSupported: false,
  verbosity: 0,
}).promise;
console.log('Pages:', doc.numPages);

for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const viewport = page.getViewport({ scale: 1.0 });
  const factory = new NodeCanvasFactory();
  const { canvas, context } = factory.create(viewport.width, viewport.height);
  try {
    await page.render({ canvasContext: context, viewport, canvasFactory: factory }).promise;
    const outPath = path.join(ROOT, 'extracted', `test-page-${p}.png`);
    fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
    console.log(`  page ${p}: OK`);
  } catch (e) {
    console.log(`  page ${p}: FAIL - ${e.message}`);
  }
  factory.destroy({ canvas, context });
}
