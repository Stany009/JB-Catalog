// Fix pump products: remap from series-level images to individual product images.
// Individual images already exist at /images/products/<product-id>.png
// Run: node scripts/fix-pump-images.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'products.json');
const WEBSITE_DATA = path.join(ROOT, 'website', 'src', 'data', 'products.json');
const PRODUCTS_IMG_DIR = path.join(ROOT, 'website', 'public', 'images', 'products');

const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));

let fixed = 0;
let alreadyGood = 0;
let noIndividualImage = 0;

for (const product of data.products) {
  if (!product.images || product.images.length === 0) continue;
  
  const currentImg = product.images[0];
  
  // Skip if already using individual image
  if (!currentImg.includes('series-')) {
    alreadyGood++;
    continue;
  }
  
  // Try to find individual image
  const individualPng = path.join(PRODUCTS_IMG_DIR, `${product.id}.png`);
  const individualJpg = path.join(PRODUCTS_IMG_DIR, `${product.id}.jpg`);
  
  if (fs.existsSync(individualPng)) {
    product.images = [`/images/products/${product.id}.png`];
    fixed++;
  } else if (fs.existsSync(individualJpg)) {
    product.images = [`/images/products/${product.id}.jpg`];
    fixed++;
  } else {
    console.log(`  No individual image for: ${product.id} (keeping ${currentImg})`);
    noIndividualImage++;
  }
}

// Write updated data
data.lastUpdated = new Date().toISOString().slice(0, 10);
const json = JSON.stringify(data, null, 2);
fs.writeFileSync(DATA_FILE, json);
fs.writeFileSync(WEBSITE_DATA, json);

console.log(`\n=== Pump Image Fix Summary ===`);
console.log(`Fixed (series -> individual): ${fixed}`);
console.log(`Already good: ${alreadyGood}`);
console.log(`No individual image found: ${noIndividualImage}`);
console.log(`Total products: ${data.products.length}`);
