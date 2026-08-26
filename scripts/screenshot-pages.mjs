import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SCREENSHOT_DIR = path.join(ROOT, 'data', 'screenshots');

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
const BASE_URL = 'http://localhost:3099';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // 1. Homepage
  console.log('📸 Homepage...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'final-homepage.png') });

  // 2. Products page - scroll down to trigger lazy loading
  console.log('📸 Products page (with scroll)...');
  await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle' });
  // Scroll down gradually to trigger lazy loading
  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(300);
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'final-products-scrolled.png') });
  
  // Count loaded images after scrolling
  const loadedAfterScroll = await page.$$eval('.product-card img', imgs =>
    imgs.filter(i => i.naturalWidth > 0).length
  );
  console.log(`  Loaded after scroll: ${loadedAfterScroll}/233`);

  // 3. Pump product detail (was using series image)
  console.log('📸 Pump PC050 detail...');
  await page.goto(`${BASE_URL}/products/pc050-pool-pump`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'final-pump-pc050.png') });

  // 4. Cleaning product detail
  console.log('📸 Cleaning robot detail...');
  await page.goto(`${BASE_URL}/products/pool-shark-cleaning-robot`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'final-cleaning-robot.png') });

  // 5. Light product detail
  console.log('📸 Pool light detail...');
  await page.goto(`${BASE_URL}/products/l11-resin-pool-light`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'final-pool-light.png') });

  // 6. Category filter page
  console.log('📸 Category: Pumps...');
  await page.goto(`${BASE_URL}/products?category=pumps`, { waitUntil: 'networkidle' });
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(200);
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'final-category-pumps.png') });

  await browser.close();
  console.log('\n✅ All screenshots saved to:', SCREENSHOT_DIR);
}

main().catch(e => { console.error(e); process.exit(1); });
