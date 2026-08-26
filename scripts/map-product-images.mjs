// Map products to their corresponding PDF page images
// Updates products.json with image paths based on sourcePdf and sourcePage

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// PDF filename to directory slug mapping (matches extract-pdf.mjs slugify)
const PDF_SLUG_MAP = {
  'Cleaning equipment A4 09 nove.PDF': 'cleaning-equipment-a4-09-nove',
  'cover pages new.PDF': 'cover-pages-new',
  'Disinfection_system_FINAL[1].PDF': 'disinfection-system-final',
  'Final_filters_07-11-2024[1].PDF': 'final-filters-07-11-2024',
  'INTEGRATED FILTERS FINAL.PDF': 'integrated-filters-final',
  'intro page.PDF': 'intro-page',
  'Lights A4 Final.PDF': 'lights-a4-final',
  'Pool Fittings final.PDF': 'pool-fittings-final',
  'Pump Final - PART 2.PDF': 'pump-final-part-2',
  'Pumps Final - PART 1.PDF': 'pumps-final-part-1',
  'Surronding Equipments & Water Features.PDF': 'surronding-equipments-water-features',
};

// Read both data files
const dataDir = path.join(ROOT, 'data');
const websiteDataDir = path.join(ROOT, 'website', 'src', 'data');

const productsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'products.json'), 'utf-8'));

let updatedCount = 0;
let noImageCount = 0;

for (const product of productsData.products) {
  if (!product.sourcePdf || !product.sourcePage) {
    noImageCount++;
    continue;
  }

  const slug = PDF_SLUG_MAP[product.sourcePdf];
  if (!slug) {
    console.log(`  No slug mapping for: ${product.sourcePdf}`);
    noImageCount++;
    continue;
  }

  const pageNum = String(product.sourcePage).padStart(3, '0');
  const imagePath = `/images/${slug}/page-${pageNum}.png`;

  // Check if the image file actually exists
  const publicPath = path.join(ROOT, 'website', 'public', imagePath);
  if (fs.existsSync(publicPath)) {
    product.images = [imagePath];
    updatedCount++;
  } else {
    console.log(`  Image not found: ${publicPath}`);
    noImageCount++;
  }
}

// Write updated data to both locations
const updatedJson = JSON.stringify(productsData, null, 2);
fs.writeFileSync(path.join(dataDir, 'products.json'), updatedJson);
fs.writeFileSync(path.join(websiteDataDir, 'products.json'), updatedJson);

console.log(`\nDone!`);
console.log(`  Products with images: ${updatedCount}`);
console.log(`  Products without images: ${noImageCount}`);
console.log(`  Total products: ${productsData.products.length}`);
