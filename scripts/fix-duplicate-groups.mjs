#!/usr/bin/env node
/**
 * fix-duplicate-groups.mjs
 * 
 * For each wrong duplicate group:
 * 1. Render the source PDF page at high resolution
 * 2. Analyze the page layout to find product image regions
 * 3. Extract and crop individual product images
 * 4. Save them with proper filenames
 * 5. Update the product database
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
const OUT_DIR = path.join(PROJECT_ROOT, 'website', 'public', 'images', 'products');

// The 7 wrong duplicate groups
const GROUPS = [
  {
    name: 'telescopic-poles-and-vacuum-hoses',
    pdf: 'Cleaning equipment A4 09 nove.PDF',
    page: 5,
    products: [
      { id: 'tp01-telescopic-pole', name: 'Aluminium Telescopic Pole TP01' },
      { id: 'tp02-telescopic-pole', name: 'Aluminium Telescopic Pole TP02' },
      { id: 'tp03-telescopic-pole', name: 'Aluminium Telescopic Pole TP03' },
      { id: 'tp04-telescopic-pole', name: 'Aluminium Telescopic Pole TP04' },
      { id: 'tp05-telescopic-pole', name: 'Aluminium Telescopic Pole TP05' },
      { id: 'hp9pe-vacuum-hose', name: 'Blow Mold Vacuum Hose HP9PE' },
      { id: 'hp12pe-vacuum-hose', name: 'Blow Mold Vacuum Hose HP12PE' },
      { id: 'hp15pe-vacuum-hose', name: 'Blow Mold Vacuum Hose HP15PE' },
      { id: 'hp30pe-vacuum-hose', name: 'Blow Mold Vacuum Hose HP30PE' },
      { id: 'hp9eva-vacuum-hose', name: 'Spiral Wound Vacuum Hose HP9EVA' },
      { id: 'hp12eva-vacuum-hose', name: 'Spiral Wound Vacuum Hose HP12EVA' },
      { id: 'hp15eva-vacuum-hose', name: 'Spiral Wound Vacuum Hose HP15EVA' },
      { id: 'hp30eva-vacuum-hose', name: 'Spiral Wound Vacuum Hose HP30EVA' },
    ],
  },
  {
    name: 'vacuum-heads',
    pdf: 'Cleaning equipment A4 09 nove.PDF',
    page: 6,
    products: [
      { id: 'vac01-aluminium-vacuum-head', name: '14" Aluminium Vacuum Head' },
      { id: 'vac02-aluminium-vacuum-head', name: '18" Aluminium Vacuum Head' },
      { id: 'vac05-butterfly-vacuum-head', name: 'Butterfly Vinyl Liner Vacuum Head' },
      { id: 'vac06-8wheels-vacuum-head', name: '8 Wheels Flexible Vacuum Head' },
      { id: 'vac07-deluxe-triangle-vacuum-head', name: 'Deluxe Triangle Vacuum Head' },
      { id: 'vac08-heavy-flexible-vh-19', name: '19" Heavy Flexible Vacuum Head' },
      { id: 'vac09-heavy-flexible-vh-22', name: '22" Heavy Flexible Vacuum Head' },
    ],
  },
  {
    name: 'skimmers-rakes-brushes',
    pdf: 'Cleaning equipment A4 09 nove.PDF',
    page: 7,
    products: [
      { id: 'cl03-heavy-duty-skimmer', name: 'Heavy Duty Pool Skimmer' },
      { id: 'cl02-leaf-rake-mesh', name: 'Leaf Rake with Long Wear Mesh' },
      { id: 'cl01-leaf-rake-screen-60', name: 'Leaf Rake Screen 60' },
      { id: 'br01-polymer-brush-18', name: '18" Standard Polymer Brush' },
      { id: 'br02-polymer-brush-deluxe-18', name: '18" Deluxe Wall Brush' },
      { id: 'br03-stainless-algae-brush-10', name: '10" Stainless Steel Algae Brush' },
      { id: 'br04-stainless-algae-brush-18', name: '18" Stainless Steel Algae Brush' },
    ],
  },
  {
    name: 'thermometers-test-kits-dispenser',
    pdf: 'Cleaning equipment A4 09 nove.PDF',
    page: 8,
    products: [
      { id: 'th02-thermometer', name: 'Pool Thermometer TH02' },
      { id: 'th04-thermometer-float', name: 'Floating Pool Thermometer TH04' },
      { id: 'tk02-test-kit', name: 'Pool Test Kit TK02' },
      { id: 'tk04-test-kit', name: 'Pool Test Kit TK04' },
      { id: 'cd11-chemical-dispenser', name: 'Chemical Dispenser CD11' },
    ],
  },
  {
    name: 'fountain-nozzles',
    pdf: 'Surronding Equipments & Water Features.PDF',
    page: 12,
    products: [
      { id: 'wf01-water-fountain-nozzle', name: 'WF01 Horn Box Fountain Nozzle' },
      { id: 'wf02-water-fountain-nozzle', name: 'WF02 Small Hole Horn Box' },
      { id: 'wf03-water-fountain-vortex', name: 'WF03 Vortex Horns' },
      { id: 'wf04-mini-cobra-nozzle', name: 'WF04 Mini Cobra Water Nozzle' },
    ],
  },
  {
    name: 'ph-pumps',
    pdf: 'Pumps Final - PART 1.PDF',
    page: 9,
    products: [
      { id: 'ph300t-pool-pump', name: 'PH300(T) Hurricane Pump' },
      { id: 'ph400t-pool-pump', name: 'PH400(T) Hurricane Pump' },
      { id: 'ph500t-pool-pump', name: 'PH500(T) Hurricane Pump' },
      { id: 'ph750t-pool-pump', name: 'PH750(T) Hurricane Pump' },
      { id: 'ph1000t-pool-pump', name: 'PH1000(T) Hurricane Pump' },
    ],
  },
  {
    name: 'pie-pumps',
    pdf: 'Pumps Final - PART 1.PDF',
    page: 17,
    products: [
      { id: 'pie14-inverter-pool-pump', name: 'PIE14 Inverter Eco Pump' },
      { id: 'pie18-inverter-pool-pump', name: 'PIE18 Inverter Eco Pump' },
      { id: 'pie22-inverter-pool-pump', name: 'PIE22 Inverter Eco Pump' },
      { id: 'pie27-inverter-pool-pump', name: 'PIE27 Inverter Eco Pump' },
    ],
  },
];

async function renderPage(pdfPath, pageNum, scale = 3) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const page = await doc.getPage(pageNum);
  const viewport = page.getViewport({ scale });
  
  const canvas = createCanvas(viewport.width, viewport.height);
  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport }).promise;
  
  return { canvas, width: viewport.width, height: viewport.height, page };
}

async function getPageImages(page) {
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
        if (imgData && imgData.width > 20 && imgData.height > 20) {
          images.push({
            name: imgName,
            width: imgData.width,
            height: imgData.height,
            area: imgData.width * imgData.height,
          });
        }
      } catch(e) {}
    }
  }
  
  return images;
}

function cropRegion(sourceCanvas, x, y, w, h) {
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(sourceCanvas, x, y, w, h, 0, 0, w, h);
  return canvas;
}

async function main() {
  console.log('=== Fixing Duplicate Groups ===\n');
  
  for (const group of GROUPS) {
    console.log(`\n--- ${group.name} ---`);
    console.log(`PDF: ${group.pdf}`);
    console.log(`Page: ${group.page}`);
    console.log(`Products: ${group.products.length}`);
    
    const pdfPath = path.join(PDF_DIR, group.pdf);
    if (!fs.existsSync(pdfPath)) {
      console.log('  PDF NOT FOUND! Skipping.');
      continue;
    }
    
    const scale = 3; // High resolution
    const { canvas, width, height, page } = await renderPage(pdfPath, group.page, scale);
    console.log(`  Rendered: ${width}x${height} pixels`);
    
    // Save the full page for reference
    const refDir = path.join(PROJECT_ROOT, 'data', 'extracted-images', group.name);
    fs.mkdirSync(refDir, { recursive: true });
    fs.writeFileSync(path.join(refDir, 'full-page.png'), canvas.toBuffer('image/png'));
    
    // Get embedded images for analysis
    const images = await getPageImages(page);
    console.log(`  Embedded images: ${images.length}`);
    for (const img of images) {
      console.log(`    ${img.name}: ${img.width}x${img.height} (${(img.area/1000).toFixed(0)}K pixels)`);
    }
    
    // Get text content for position analysis
    const textContent = await page.getTextContent();
    const textItems = textContent.items
      .filter(t => t.str.trim())
      .map(t => ({
        text: t.str.trim(),
        x: t.transform[4] * scale,
        y: t.transform[5] * scale,
        width: t.width * scale,
        height: t.height * scale,
      }));
    
    console.log(`  Text items: ${textItems.length}`);
    
    // Save text positions for manual analysis
    fs.writeFileSync(
      path.join(refDir, 'text-positions.json'),
      JSON.stringify(textItems, null, 2)
    );
    
    // For now, save the full page and text analysis
    // The actual cropping will be done based on manual analysis of the page layout
    console.log(`  Saved reference page to: ${refDir}`);
  }
  
  console.log('\n\n=== Reference pages saved. Analyze layout to determine crop regions. ===');
}

main().catch(console.error);
