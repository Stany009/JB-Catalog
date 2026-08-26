import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const pages = [
  { name: 'home',       path: '/' },
  { name: 'about',      path: '/about' },
  { name: 'products',   path: '/products' },
  { name: 'services',   path: '/services' },
  { name: 'contact',    path: '/contact' },
  { name: 'categories', path: '/categories' },
  { name: 'product-detail', path: '/products/pool-shark-cleaning-robot' },
];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

for (const p of pages) {
  const page = await context.newPage();
  await page.goto(`${BASE}${p.path}`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `screenshots/${p.name}.png`, fullPage: true });
  console.log(`✅ ${p.name} — ${BASE}${p.path}`);
  await page.close();
}

await browser.close();
console.log('\nAll screenshots saved to screenshots/');
