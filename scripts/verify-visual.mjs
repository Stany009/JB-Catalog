// Visual verification: take screenshots of product pages to confirm images load.
// Run: node scripts/verify-visual.mjs

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SCREENSHOT_DIR = path.join(ROOT, 'data', 'screenshots');

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const BASE_URL = 'http://localhost:3099';

// Products to check - one from each category + some pump variants
const CHECK_PRODUCTS = [
  { slug: 'pool-shark-cleaning-robot', label: 'Cleaning Robot' },
  { slug: 'eq-series-salt-chlorinator', label: 'Salt Chlorinator' },
  { slug: 'ft800-top-mount-sand-filter', label: 'Sand Filter' },
  { slug: 'l11-resin-pool-light', label: 'Pool Light' },
  { slug: 'sk30c-heavy-duty-skimmer', label: 'Skimmer' },
  { slug: 'pc050-pool-pump', label: 'Pump PC050 (was series img)' },
  { slug: 'pk100-pool-pump', label: 'Pump PK100 (was series img)' },
  { slug: 'pf200-pool-pump', label: 'Pump PF200 (was series img)' },
  { slug: 'wd300-water-descent', label: 'Water Descent' },
  { slug: 'cbt400-integrated-filter', label: 'Integrated Filter' },
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  console.log('═══ VISUAL VERIFICATION ═══\n');

  // 1. Check homepage
  console.log('Checking homepage...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-homepage.png'), fullPage: false });
  
  // Count visible product images on homepage
  const homeImages = await page.$$eval('.product-card img', imgs =>
    imgs.map(img => ({ src: img.src, loaded: img.naturalWidth > 0 }))
  );
  console.log(`  Homepage: ${homeImages.length} product card images`);
  console.log(`  Loaded: ${homeImages.filter(i => i.loaded).length}/${homeImages.length}`);
  console.log('');

  // 2. Check products listing page
  console.log('Checking products page...');
  await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-products-page.png'), fullPage: false });
  
  const listImages = await page.$$eval('.product-card img', imgs =>
    imgs.map(img => ({ src: img.src, loaded: img.naturalWidth > 0 }))
  );
  console.log(`  Products page: ${listImages.length} product card images`);
  console.log(`  Loaded: ${listImages.filter(i => i.loaded).length}/${listImages.length}`);
  console.log('');

  // 3. Check individual product pages
  console.log('Checking individual product pages...');
  let allPassed = true;
  
  for (const product of CHECK_PRODUCTS) {
    const url = `${BASE_URL}/products/${product.slug}`;
    try {
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
      
      if (response.status() === 404) {
        console.log(`  ⚠️  ${product.label}: 404 (slug may differ)`);
        continue;
      }
      
      // Check if product image loaded
      const mainImg = await page.$eval('img[alt]', img => ({
        src: img.src,
        loaded: img.naturalWidth > 0,
        width: img.naturalWidth,
        alt: img.alt,
      })).catch(() => null);
      
      const slug = product.slug;
      const screenshotName = `03-${slug}.png`;
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, screenshotName), fullPage: false });
      
      if (mainImg && mainImg.loaded) {
        console.log(`  ✅ ${product.label}: Image loaded (${mainImg.width}px wide)`);
      } else if (mainImg) {
        console.log(`  ❌ ${product.label}: Image NOT loaded (${mainImg.src})`);
        allPassed = false;
      } else {
        console.log(`  ⚠️  ${product.label}: No main image found`);
      }
    } catch (e) {
      console.log(`  ❌ ${product.label}: Error - ${e.message}`);
    }
  }

  // 4. Check a few more pump products that were fixed from series images
  console.log('\nChecking fixed pump product pages...');
  const extraPumps = [
    'pb200-pool-pump',
    'ps150-pool-pump', 
    'ph400t-pool-pump',
    'pw200-pool-pump',
    'pie22-inverter-pool-pump',
  ];
  
  for (const slug of extraPumps) {
    const url = `${BASE_URL}/products/${slug}`;
    try {
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
      if (response.status() === 404) {
        console.log(`  ⚠️  ${slug}: 404`);
        continue;
      }
      
      const mainImg = await page.$eval('img[alt]', img => ({
        src: img.src,
        loaded: img.naturalWidth > 0,
      })).catch(() => null);
      
      if (mainImg && mainImg.loaded) {
        console.log(`  ✅ ${slug}: Image loaded`);
      } else if (mainImg) {
        console.log(`  ❌ ${slug}: Image NOT loaded`);
        allPassed = false;
      }
    } catch (e) {
      console.log(`  ❌ ${slug}: Error`);
    }
  }

  await browser.close();
  
  console.log('\n═══ SUMMARY ═══');
  console.log(`All checks passed: ${allPassed ? '✅ YES' : '❌ NO'}`);
  console.log(`Screenshots saved to: ${SCREENSHOT_DIR}`);
}

main().catch(e => {
  console.error('Verification failed:', e);
  process.exit(1);
});
