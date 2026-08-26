#!/usr/bin/env node
/**
 * extract-pdf-images.mjs
 * 
 * Step 1: Extract ALL embedded images from every page of every PDF.
 * Step 2: For each page, also render a high-res screenshot.
 * Step 3: Map extracted images to products based on size/position analysis.
 * 
 * This script does NOT modify any product data - it only extracts and analyzes.
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
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'data', 'extracted-images');

// Find all PDFs
function findPDFs() {
  const files = fs.readdirSync(PDF_DIR);
  return files
    .filter(f => f.toLowerCase().endsWith('.pdf'))
    .map(f => ({
      name: f,
      path: path.join(PDF_DIR, f),
      size: fs.statSync(path.join(PDF_DIR, f)).size,
    }));
}

// Extract embedded images from a single page
async function extractPageImages(doc, pageNum) {
  const page = await doc.getPage(pageNum);
  const ops = await page.getOperatorList();
  const viewport = page.getViewport({ scale: 1.0 });
  
  const imageOps = [];
  for (let j = 0; j < ops.fnArray.length; j++) {
    if (ops.fnArray[j] === pdfjsLib.OPS.paintImageXObject ||
        ops.fnArray[j] === pdfjsLib.OPS.paintJpegXObject) {
      imageOps.push({
        name: ops.argsArray[j][0],
        index: j,
      });
    }
  }
  
  const images = [];
  for (const imgOp of imageOps) {
    try {
      const imgData = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);
        page.objs.get(imgOp.name, (data) => {
          clearTimeout(timeout);
          if (data) resolve(data);
          else reject(new Error('No data'));
        });
      });
      
      if (imgData && imgData.width && imgData.height) {
        images.push({
          name: imgOp.name,
          width: imgData.width,
          height: imgData.height,
          area: imgData.width * imgData.height,
          data: imgData.data,
          bpp: imgData.data ? imgData.data.length / (imgData.width * imgData.height) : 0,
        });
      }
    } catch(e) {
      // Skip failed images
    }
  }
  
  // Get text content with positions
  const textContent = await page.getTextContent();
  const textItems = textContent.items
    .filter(t => t.str.trim())
    .map(t => ({
      text: t.str.trim(),
      x: Math.round(t.transform[4]),
      y: Math.round(t.transform[5]),
      width: Math.round(t.width),
      height: Math.round(t.height),
    }));
  
  return {
    pageNum,
    width: viewport.width,
    height: viewport.height,
    images,
    textItems,
  };
}

// Save extracted image to disk
function saveImage(imgData, outPath) {
  if (!imgData.data) return false;
  
  const canvas = createCanvas(imgData.width, imgData.height);
  const ctx = canvas.getContext('2d');
  const imgDataObj = ctx.createImageData(imgData.width, imgData.height);
  
  // pdf.js gives us RGBA data
  imgDataObj.data.set(imgData.data);
  ctx.putImageData(imgDataObj, 0, 0);
  
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outPath, buffer);
  return buffer.length;
}

// Classify images by size to identify product images vs decorations
function classifyImages(images, pageWidth, pageHeight) {
  const pageArea = pageWidth * pageHeight;
  
  return images.map(img => {
    const areaRatio = img.area / pageArea;
    const aspectRatio = img.width / img.height;
    
    let type = 'unknown';
    
    if (img.width < 50 || img.height < 50) {
      type = 'icon-or-badge'; // Too small to be a product image
    } else if (areaRatio > 0.5) {
      type = 'background-or-hero'; // Takes up most of the page
    } else if (areaRatio > 0.1) {
      type = 'main-product'; // Likely a product image
    } else if (areaRatio > 0.02) {
      type = 'secondary-product'; // Could be a smaller product image
    } else if (areaRatio > 0.005) {
      type = 'thumbnail'; // Small thumbnail
    } else {
      type = 'decoration'; // Very small, likely decorative
    }
    
    return {
      ...img,
      areaRatio: (areaRatio * 100).toFixed(2) + '%',
      aspectRatio: aspectRatio.toFixed(2),
      type,
    };
  });
}

async function main() {
  console.log('=== PDF Image Extraction Tool ===\n');
  
  const pdfs = findPDFs();
  console.log(`Found ${pdfs.length} PDFs:\n`);
  
  for (const pdf of pdfs) {
    console.log(`  ${pdf.name} (${(pdf.size / 1024 / 1024).toFixed(1)} MB)`);
  }
  console.log('');
  
  // Process first PDF as test
  const testPdf = pdfs.find(p => p.name.includes('Pumps') && p.name.includes('PART 1'));
  if (!testPdf) {
    console.error('Test PDF not found');
    return;
  }
  
  console.log(`\n=== Processing: ${testPdf.name} ===\n`);
  
  const data = new Uint8Array(fs.readFileSync(testPdf.path));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  
  const outDir = path.join(OUTPUT_DIR, 'pumps-part1');
  fs.mkdirSync(outDir, { recursive: true });
  
  for (let pageNum = 1; pageNum <= Math.min(doc.numPages, 5); pageNum++) {
    console.log(`--- Page ${pageNum} ---`);
    
    const pageInfo = await extractPageImages(doc, pageNum);
    console.log(`  Page size: ${pageInfo.width}x${pageInfo.height}`);
    console.log(`  Embedded images: ${pageInfo.images.length}`);
    console.log(`  Text items: ${pageInfo.textItems.length}`);
    
    // Classify images
    const classified = classifyImages(pageInfo.images, pageInfo.width, pageInfo.height);
    
    // Show classifications
    for (const img of classified) {
      console.log(`    ${img.name}: ${img.width}x${img.height} [${img.areaRatio}] type=${img.type}`);
    }
    
    // Save product-relevant images (main-product and secondary-product)
    let savedCount = 0;
    for (const img of classified) {
      if (img.type === 'main-product' || img.type === 'secondary-product') {
        const pageDir = path.join(outDir, `page-${String(pageNum).padStart(2, '0')}`);
        fs.mkdirSync(pageDir, { recursive: true });
        const outPath = path.join(pageDir, `${img.name}.png`);
        const size = saveImage(img, outPath);
        if (size) {
          console.log(`    SAVED: ${img.name} -> ${outPath} (${size} bytes)`);
          savedCount++;
        }
      }
    }
    
    // Show relevant text items (model names)
    const modelTexts = pageInfo.textItems.filter(t => 
      /^(PC|PB|PH|PF|PK|PS|PIE|PT|PCV|PBV|PFV)/.test(t.text)
    );
    if (modelTexts.length > 0) {
      console.log('  Model references in text:');
      for (const t of modelTexts) {
        console.log(`    "${t.text}" at (${t.x}, ${t.y})`);
      }
    }
    
    console.log(`  Saved ${savedCount} product images\n`);
  }
  
  console.log('\n=== Done ===');
}

main().catch(console.error);
