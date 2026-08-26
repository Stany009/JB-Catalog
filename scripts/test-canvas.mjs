// Test if @napi-rs/canvas works with pdfjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas } from '@napi-rs/canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

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
}).promise;

const page = await doc.getPage(1);
const viewport = page.getViewport({ scale: 1.5 });
const factory = new NodeCanvasFactory();
const { canvas, context } = factory.create(viewport.width, viewport.height);
await page.render({ canvasContext: context, viewport, canvasFactory: factory }).promise;
fs.writeFileSync(path.join(ROOT, 'extracted', 'test-render.png'), canvas.toBuffer('image/png'));
console.log('OK page 1 rendered');
