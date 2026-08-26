#!/usr/bin/env node
/**
 * extract-all-images.mjs
 * Extract ALL embedded images from every PDF page.
 * Saves everything - large product photos and small thumbnails.
 * Analyzes which images are unique vs duplicated across pages.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from 'canvas';
import pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');
const PDF_DIR = path.join(PROJECT_ROOT, '..', 'Mambe Catalog 25-26');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'data', 'extracted-embedded');

function findPDFs() {
  return fs.readdirSync(PDF_DIR)
    .filter(f => f.toLowerCase().endsWith('.pdf'))
    .map(f => ({ name: f, path: path.join(PDF_DIR, f) }));
}

function saveImage(imgData, outPath) {
  if (!imgData.data) return 0;
  const canvas = createCanvas(imgData.width, imgData.height);
  const ctx = canvas.getContext('2d');
  const id = ctx.createImageData(imgData.width, imgData.height);
  id.data.set(imgData.data);
  ctx.putImageData(id, 0, 0);
  const buf = canvas.toBuffer('image/png');
  fs.writeFileSync(outPath, buf);
  return buf.length;
}

async function main() {
  const pdfs = findPDFs();
  console.log(`Found ${pdfs.length} PDFs\n`);
  
  // Create fingerprint map to detect duplicates
  const fingerprintMap = new Map(); // fingerprint -> [{ pdf, page, imgName, path }]
  
  for (const pdf of pdfs) {
    console.log(`\n=== ${pdf.name} ===`);
    
    const data = new Uint8Array(fs.readFileSync(pdf.path));
    const doc = await pdfjsLib.getDocument({ data }).promise;
    const pdfSlug = pdf.name.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').toLowerCase();
    const pdfDir = path.join(OUTPUT_DIR, pdfSlug);
    fs.mkdirSync(pdfDir, { recursive: true });
    
    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      const page = await doc.getPage(pageNum);
      const ops = await page.getOperatorList();
      
      const imgNames = [];
      for (let j = 0; j < ops.fnArray.length; j++) {
        if (ops.fnArray[j] === pdfjsLib.OPS.paintImageXObject ||
            ops.fnArray[j] === pdfjsLib.OPS.paintJpegXObject) {
          imgNames.push(ops.argsArray[j][0]);
        }
      }
      
      if (imgNames.length === 0) continue;
      
      const pageDir = path.join(pdfDir, `p${String(pageNum).padStart(3, '0')}`);
      fs.mkdirSync(pageDir, { recursive: true });
      
      let savedCount = 0;
      for (const imgName of imgNames) {
        try {
          const imgData = await new Promise((resolve, reject) => {
            const t = setTimeout(() => reject(new Error('timeout')), 5000);
            page.objs.get(imgName, (d) => { clearTimeout(t); d ? resolve(d) : reject(new Error('no data')); });
          });
          
          if (imgData && imgData.width > 10 && imgData.height > 10) {
            // Create fingerprint from first 1000 bytes of image data
            const fp = imgData.data ? Array.from(imgData.data.slice(0, 1000)).join(',') : '';
            const sizeKey = `${imgData.width}x${imgData.height}`;
            
            const outPath = path.join(pageDir, `${imgName}.png`);
            const size = saveImage(imgData, outPath);
            
            if (!fingerprintMap.has(fp)) {
              fingerprintMap.set(fp, []);
            }
            fingerprintMap.get(fp).push({
              pdf: pdf.name,
              page: pageNum,
              imgName,
              width: imgData.width,
              height: imgData.height,
              size,
              path: outPath,
            });
            
            savedCount++;
          }
        } catch(e) {
          // skip
        }
      }
      
      if (savedCount > 0) {
        console.log(`  Page ${pageNum}: ${savedCount} images saved`);
      }
    }
  }
  
  // Analyze duplicates
  console.log('\n\n=== DUPLICATE ANALYSIS ===\n');
  
  let duplicateGroups = 0;
  let uniqueImages = 0;
  
  for (const [fp, entries] of fingerprintMap) {
    if (entries.length > 1) {
      duplicateGroups++;
      console.log(`\nDuplicate group ${duplicateGroups}: ${entries[0].width}x${entries[0].height} (${entries.length} copies)`);
      for (const e of entries) {
        console.log(`  ${e.pdf} page ${e.page} -> ${path.basename(e.path)}`);
      }
    } else {
      uniqueImages++;
    }
  }
  
  console.log(`\n\nSummary:`);
  console.log(`  Unique images: ${uniqueImages}`);
  console.log(`  Duplicate groups: ${duplicateGroups}`);
  console.log(`  Total entries: ${fingerprintMap.size}`);
}

main().catch(console.error);
