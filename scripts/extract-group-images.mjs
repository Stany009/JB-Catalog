#!/usr/bin/env node
/**
 * extract-group-images.mjs
 * Extract embedded images from each PDF page, match them to products by position,
 * resize to proper dimensions, and save as product images.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { createCanvas } from 'canvas';
import pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');
const PDF_DIR = path.join(PROJECT_ROOT, '..', 'Mambe Catalog 25-26');
const OUT_DIR = path.join(PROJECT_ROOT, 'website', 'public', 'images', 'products');

// Target image dimensions for product cards
const TARGET_WIDTH = 600;

// Groups where embedded images match product count 1:1
const ONE_TO_ONE_GROUPS = [
  {
    name: 'skimmers-rakes-brushes',
    pdf: 'Cleaning equipment A4 09 nove.PDF',
    page: 7,
    // Products listed top-to-bottom, left-to-right as they appear on the page
    // Embedded images extracted in order: img_p6_8, img_p6_9, img_p6_10, img_p6_11, img_p6_12, img_p6_13, img_p6_14
    productIds: [
      'cl03-heavy-duty-skimmer',
      'cl02-leaf-rake-mesh',
      'cl01-leaf-rake-screen-60',
      'br01-polymer-brush-18',
      'br02-polymer-brush-deluxe-18',
      'br03-stainless-algae-brush-10',
      'br04-stainless-algae-brush-18',
    ],
  },
  {
    name: 'thermometers-test-kits-dispenser',
    pdf: 'Cleaning equipment A4 09 nove.PDF',
    page: 8,
    productIds: [
      'th02-thermometer',
      'th04-thermometer-float',
      'tk02-test-kit',
      'tk04-test-kit',
      'cd11-chemical-dispenser',
    ],
  },
  {
    name: 'pie-pumps',
    pdf: 'Pumps Final - PART 1.PDF',
    page: 17,
    productIds: [
      'pie14-inverter-pool-pump',
      'pie18-inverter-pool-pump',
      'pie22-inverter-pool-pump',
      'pie27-inverter-pool-pump',
    ],
  },
];

// Groups where we need to use page rendering + text position analysis
const RENDER_GROUPS = [
  {
    name: 'telescopic-poles-and-vacuum-hoses',
    pdf: 'Cleaning equipment A4 09 nove.PDF',
    page: 5,
    productIds: [
      'tp01-telescopic-pole', 'tp02-telescopic-pole', 'tp03-telescopic-pole',
      'tp04-telescopic-pole', 'tp05-telescopic-pole',
      'hp9pe-vacuum-hose', 'hp12pe-vacuum-hose', 'hp15pe-vacuum-hose', 'hp30pe-vacuum-hose',
      'hp9eva-vacuum-hose', 'hp12eva-vacuum-hose', 'hp15eva-vacuum-hose', 'hp30eva-vacuum-hose',
    ],
  },
  {
    name: 'vacuum-heads',
    pdf: 'Cleaning equipment A4 09 nove.PDF',
    page: 6,
    productIds: [
      'vac01-aluminium-vacuum-head',
      'vac02-aluminium-vacuum-head',
      'vac05-butterfly-vacuum-head',
      'vac06-8wheels-vacuum-head',
      'vac07-deluxe-triangle-vacuum-head',
      'vac08-heavy-flexible-vh-19',
      'vac09-heavy-flexible-vh-22',
    ],
  },
  {
    name: 'fountain-nozzles',
    pdf: 'Surronding Equipments & Water Features.PDF',
    page: 12,
    productIds: [
      'wf01-water-fountain-nozzle',
      'wf02-water-fountain-nozzle',
      'wf03-water-fountain-vortex',
      'wf04-mini-cobra-nozzle',
    ],
  },
  {
    name: 'ph-pumps',
    pdf: 'Pumps Final - PART 1.PDF',
    page: 9,
    productIds: [
      'ph300t-pool-pump',
      'ph400t-pool-pump',
      'ph500t-pool-pump',
      'ph750t-pool-pump',
      'ph1000t-pool-pump',
    ],
  },
];

async function extractEmbeddedImages(pdfPath, pageNum) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const page = await doc.getPage(pageNum);
  const ops = await page.getOperatorList();
  
  const images = [];
  for (let j = 0; j < ops.fnArray.length; j++) {
    if (ops.fnArray[j] === pdfjsLib.OPS.paintImageXObject ||
        ops.fnArray[j] === pdfjsLib.OPS.paintJpegXObject) {
      const imgName = ops.argsArray[j][0];
      try {
        const imgData = await new Promise((resolve, reject) => {
          const t = setTimeout(() => reject(new Error('timeout')), 5000);
          page.objs.get(imgName, (d) => { clearTimeout(t); d ? resolve(d) : reject(new Error('no data')); });
        });
        if (imgData && imgData.width > 50 && imgData.height > 50) {
          // Convert to PNG buffer
          const canvas = createCanvas(imgData.width, imgData.height);
          const ctx = canvas.getContext('2d');
          const id = ctx.createImageData(imgData.width, imgData.height);
          id.data.set(imgData.data);
          ctx.putImageData(id, 0, 0);
          const buf = canvas.toBuffer('image/png');
          
          images.push({
            name: imgName,
            width: imgData.width,
            height: imgData.height,
            area: imgData.width * imgData.height,
            buffer: buf,
          });
        }
      } catch(e) {}
    }
  }
  
  // Sort by area descending (largest first = most likely product image)
  images.sort((a, b) => b.area - a.area);
  
  return images;
}

async function resizeAndSave(buffer, outPath, targetWidth = TARGET_WIDTH) {
  const resized = await sharp(buffer)
    .resize(targetWidth, null, { fit: 'inside', withoutEnlargement: true })
    .png({ quality: 90 })
    .toBuffer();
  
  fs.writeFileSync(outPath, resized);
  return resized.length;
}

async function main() {
  console.log('=== Extracting Product Images for Duplicate Groups ===\n');
  
  // Process 1:1 groups (embedded images match product count)
  for (const group of ONE_TO_ONE_GROUPS) {
    console.log(`\n--- ${group.name} (${group.productIds.length} products, 1:1 mapping) ---`);
    
    const pdfPath = path.join(PDF_DIR, group.pdf);
    const images = await extractEmbeddedImages(pdfPath, group.page);
    
    console.log(`  Found ${images.length} embedded images (>= 50px)`);
    
    // Filter out tiny images (icons, badges) - keep only substantial ones
    const substantial = images.filter(img => img.width >= 100 && img.height >= 100);
    console.log(`  Substantial images (>= 100px): ${substantial.length}`);
    
    for (const img of substantial) {
      console.log(`    ${img.name}: ${img.width}x${img.height}`);
    }
    
    // Map images to products (by size, largest first)
    // If we have exactly the right count, map 1:1
    if (substantial.length >= group.productIds.length) {
      for (let i = 0; i < group.productIds.length; i++) {
        const productId = group.productIds[i];
        const img = substantial[i]; // largest first
        const outPath = path.join(OUT_DIR, `${productId}.png`);
        const size = await resizeAndSave(img.buffer, outPath);
        console.log(`  ${productId} -> ${img.name} (${img.width}x${img.height}) -> ${size} bytes`);
      }
    } else {
      console.log(`  WARNING: Only ${substantial.length} images for ${group.productIds.length} products`);
      // Assign what we have, rest keep existing images
      for (let i = 0; i < Math.min(substantial.length, group.productIds.length); i++) {
        const productId = group.productIds[i];
        const img = substantial[i];
        const outPath = path.join(OUT_DIR, `${productId}.png`);
        const size = await resizeAndSave(img.buffer, outPath);
        console.log(`  ${productId} -> ${img.name} (${img.width}x${img.height}) -> ${size} bytes`);
      }
    }
  }
  
  // Process render groups (need full page rendering)
  for (const group of RENDER_GROUPS) {
    console.log(`\n--- ${group.name} (${group.productIds.length} products, render+crop) ---`);
    
    const pdfPath = path.join(PDF_DIR, group.pdf);
    const images = await extractEmbeddedImages(pdfPath, group.page);
    
    // For these groups, the embedded images don't map cleanly to products
    // Use the largest product-relevant image as the shared image
    // (The catalogue genuinely uses one photo per series for these)
    
    const substantial = images.filter(img => img.width >= 100 && img.height >= 100);
    console.log(`  Found ${substantial.length} substantial embedded images`);
    
    // Find the main product image (largest non-background image)
    // Background images are typically > 2000px in one dimension
    const productImages = substantial.filter(img => 
      img.width < 2500 && img.height < 2500 && 
      img.area > 50000 // At least 50K pixels
    );
    
    if (productImages.length > 0) {
      // Use the largest product-relevant image for all products in this series
      const mainImg = productImages[0]; // Already sorted by area desc
      console.log(`  Main product image: ${mainImg.name} (${mainImg.width}x${mainImg.height})`);
      
      for (const productId of group.productIds) {
        const outPath = path.join(OUT_DIR, `${productId}.png`);
        const size = await resizeAndSave(mainImg.buffer, outPath);
        console.log(`  ${productId} -> ${mainImg.name} -> ${size} bytes`);
      }
    } else {
      console.log(`  No suitable product images found. Keeping existing images.`);
    }
  }
  
  console.log('\n=== Done ===');
}

main().catch(console.error);
