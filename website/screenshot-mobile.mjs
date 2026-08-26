import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const pages = [
  { name: 'home-mobile',       path: '/' },
  { name: 'products-mobile',   path: '/products' },
  { name: 'product-detail-mobile', path: '/products/pool-shark-cleaning-robot' },
];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });

for (const p of pages) {
  const page = await context.newPage();
  await page.goto(`${BASE}${p.path}`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `screenshots/${p.name}.png`, fullPage: true });
  console.log(`✅ ${p.name}`);
  await page.close();
}

await browser.close();
