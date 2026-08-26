// Polyfill createImageBitmap for node-canvas and pdfjs
import nodeCanvas from 'canvas';

// Polyfill createImageBitmap
if (typeof globalThis.createImageBitmap === 'undefined') {
  globalThis.createImageBitmap = async function(src, ...args) {
    // If it's a node-canvas Canvas, convert to ImageData
    if (src instanceof nodeCanvas.Canvas) {
      const ctx = src.getContext('2d');
      const id = ctx.getImageData(0, 0, src.width, src.height);
      return {
        width: src.width,
        height: src.height,
        data: id.data,
        colorSpace: 'srgb',
        close: () => {},
      };
    }
    throw new Error('createImageBitmap: unsupported source type ' + (src?.constructor?.name || typeof src));
  };
}

// Test
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

class NodeCanvasFactory {
  create(width, height) {
    if (width <= 0 || height <= 0) throw new Error('Invalid canvas size');
    const canvas = nodeCanvas.createCanvas(width, height);
    return { canvas, context: canvas.getContext('2d') };
  }
  reset(c, w, h) {
    if (!c.canvas) throw new Error('Canvas missing');
    c.canvas.width = w;
    c.canvas.height = h;
  }
  destroy(c) {
    if (c.canvas) {
      c.canvas.width = 0;
      c.canvas.height = 0;
      c.canvas = null;
      c.context = null;
    }
  }
}

const ROOT = path.resolve(__dirname, '..');
const PDF = path.join(ROOT, '..', 'Mambe Catalog 25-26', 'cover pages new.PDF');

const data = new Uint8Array(fs.readFileSync(PDF));
const doc = await pdfjsLib.getDocument({
  data,
  disableFontFace: true,
  useSystemFonts: false,
  canvasFactory: new NodeCanvasFactory(),
}).promise;

console.log('Pages:', doc.numPages);

// Render each page
for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const viewport = page.getViewport({ scale: 1.0 });
  const factory = new NodeCanvasFactory();
  const { canvas, context } = factory.create(viewport.width, viewport.height);
  try {
    await page.render({ canvasContext: context, viewport, canvasFactory: factory }).promise;
    const outPath = path.join(ROOT, 'extracted', `test-page-${p}.png`);
    fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
    console.log(`  page ${p}: OK -> ${outPath}`);
  } catch (e) {
    console.log(`  page ${p}: FAIL - ${e.message}`);
  }
  factory.destroy({ canvas, context });
}
