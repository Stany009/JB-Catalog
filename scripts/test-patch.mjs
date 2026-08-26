// Test monkey-patch approach
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nodeCanvas from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

const ROOT = path.resolve(__dirname, '..');
const PDF = path.join(ROOT, '..', 'Mambe Catalog 25-26', 'cover pages new.PDF');

// Patch the Canvas constructor so its instances can be passed to drawImage
const OriginalCanvas = nodeCanvas.Canvas;
class PatchedCanvas extends OriginalCanvas {
  // pass-through
}

// Patch Context2d's drawImage to handle our Canvas
const OriginalContext2d = nodeCanvas.Context2d;
const origDrawImage = OriginalContext2d.prototype.drawImage;
// eslint-disable-next-line no-undef
const PDFJSDrawImage = function(...args) {
  try {
    return origDrawImage.apply(this, args);
  } catch (e) {
    if (e.message && e.message.includes('Image or Canvas expected')) {
      // Try with Image element
      const c = args[0];
      if (c && c.constructor && c.constructor.name === 'Canvas' && typeof c.toBuffer === 'function') {
        // Force convert via Image
        const data = c.toBuffer('image/png');
        const img = new nodeCanvas.Image();
        img.src = data;
        args[0] = img;
        return origDrawImage.apply(this, args);
      }
    }
    throw e;
  }
};
OriginalContext2d.prototype.drawImage = PDFJSDrawImage;

class NodeCanvasFactory {
  create(width, height) {
    if (width <= 0 || height <= 0) throw new Error('Invalid canvas size');
    const canvas = nodeCanvas.createCanvas(width, height);
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
console.log('OK page 1 rendered -> test-render.png');
