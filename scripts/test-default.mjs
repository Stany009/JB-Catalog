// Test with default pdfjs settings (uses @napi-rs/canvas internally)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import napiCanvas from '@napi-rs/canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

const ROOT = path.resolve(__dirname, '..');
const PDF = path.join(ROOT, '..', 'Mambe Catalog 25-26', 'cover pages new.PDF');

const data = new Uint8Array(fs.readFileSync(PDF));
const doc = await pdfjsLib.getDocument({ data }).promise;
console.log('Pages:', doc.numPages);

for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const viewport = page.getViewport({ scale: 1.0 });
  const canvas = napiCanvas.createCanvas(viewport.width, viewport.height);
  const context = canvas.getContext('2d');
  try {
    await page.render({ canvasContext: context, viewport }).promise;
    const outPath = path.join(ROOT, 'extracted', `test-page-${p}.png`);
    fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
    console.log(`  page ${p}: OK -> ${outPath}`);
  } catch (e) {
    console.log(`  page ${p}: FAIL - ${e.message}`);
  }
}
