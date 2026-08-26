// Test if pdfjs's internal caching returns a non-Canvas object
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nodeCanvas from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

const ROOT = path.resolve(__dirname, '..');
const PDF = path.join(ROOT, '..', 'Mambe Catalog 25-26', 'cover pages new.PDF');

class NodeCanvasFactory {
  create(width, height) {
    if (width <= 0 || height <= 0) throw new Error('Invalid canvas size');
    const canvas = nodeCanvas.createCanvas(width, height);
    console.log('  factory.create:', width, 'x', height, '-> canvas is Canvas?', canvas instanceof nodeCanvas.Canvas);
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

// Patch the context's drawImage to log what's being passed
const origDraw = context.drawImage.bind(context);
context.drawImage = function(...args) {
  const a = args[0];
  const ctor = a && a.constructor ? a.constructor.name : 'null';
  const isC = a instanceof nodeCanvas.Canvas;
  const isI = a instanceof nodeCanvas.Image;
  console.log('  drawImage(', ctor, ') isCanvas:', isC, 'isImage:', isI, 'w:', a?.width, 'h:', a?.height);
  if (!isC && !isI) {
    console.log('  -- FAIL -- details:', Object.keys(a || {}).slice(0, 10));
    throw new Error('not a canvas or image');
  }
  return origDraw(...args);
};

try {
  await page.render({ canvasContext: context, viewport, canvasFactory: factory }).promise;
  console.log('Render OK');
  fs.writeFileSync(path.join(ROOT, 'extracted', 'test-render.png'), canvas.toBuffer('image/png'));
} catch (e) {
  console.log('Render FAIL:', e.message);
}
