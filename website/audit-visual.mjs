import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const pages = [
  { name: 'Home',          path: '/' },
  { name: 'About',         path: '/about' },
  { name: 'Products',      path: '/products' },
  { name: 'Services',      path: '/services' },
  { name: 'Contact',       path: '/contact' },
  { name: 'Categories',    path: '/categories' },
  { name: 'Product Detail', path: '/products/pool-shark-cleaning-robot' },
];

const browser = await chromium.launch();

// ---- DESKTOP CHECKS ----
console.log('═══════════════════════════════════════');
console.log('  DESKTOP AUDIT (1440×900)');
console.log('═══════════════════════════════════════');

const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });

for (const p of pages) {
  const page = await desktop.newPage();
  await page.goto(`${BASE}${p.path}`, { waitUntil: 'networkidle' });
  console.log(`\n── ${p.name} (${p.path}) ──`);

  // 1. Broken images
  const brokenImages = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src);
  });
  if (brokenImages.length) console.log(`  ❌ Broken images: ${brokenImages.join(', ')}`);
  else console.log(`  ✅ All images load OK`);

  // 2. Horizontal overflow
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  if (overflow) console.log(`  ⚠️  Horizontal overflow detected`);
  else console.log(`  ✅ No horizontal overflow`);

  // 3. Console errors
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  await page.reload({ waitUntil: 'networkidle' });
  if (errors.length) console.log(`  ❌ Console errors: ${errors.slice(0, 3).join(' | ')}`);
  else console.log(`  ✅ No console errors`);

  // 4. Empty links / buttons
  const emptyLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a, button')).filter(el => {
      const text = (el.textContent || '').trim();
      const ariaLabel = el.getAttribute('aria-label');
      const title = el.getAttribute('title');
      const hasImg = el.querySelector('img');
      return !text && !ariaLabel && !title && !hasImg;
    }).map(el => el.tagName + (el.href ? `→${el.href}` : ''));
  });
  if (emptyLinks.length) console.log(`  ⚠️  Empty interactive elements: ${emptyLinks.join(', ')}`);
  else console.log(`  ✅ All interactive elements have accessible names`);

  // 5. Low contrast text (simplified check)
  const lowContrast = await page.evaluate(() => {
    const results = [];
    document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, li, td, th, label, button').forEach(el => {
      const style = getComputedStyle(el);
      const color = style.color;
      const bg = style.backgroundColor;
      // flag very light text on light bg (rough heuristic)
      if (color && bg && color === bg && color !== 'rgba(0, 0, 0, 0)') {
        results.push(`${el.tagName}: color=${color} bg=${bg}`);
      }
    });
    return results.slice(0, 3);
  });
  if (lowContrast.length) console.log(`  ⚠️  Possible contrast issues: ${lowContrast.join(' | ')}`);
  else console.log(`  ✅ No obvious contrast issues`);

  // 6. Missing alt text
  const missingAlt = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).filter(img => !img.alt && img.alt !== '').length;
  });
  if (missingAlt > 0) console.log(`  ⚠️  ${missingAlt} images missing alt text`);
  else console.log(`  ✅ All images have alt text`);

  // 7. Heading hierarchy
  const headings = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map(h => ({
      level: parseInt(h.tagName[1]),
      text: h.textContent.trim().substring(0, 40),
    }));
  });
  const h1Count = headings.filter(h => h.level === 1).length;
  if (h1Count === 0) console.log(`  ⚠️  No <h1> found`);
  else if (h1Count > 1) console.log(`  ⚠️  Multiple <h1> tags (${h1Count})`);
  else console.log(`  ✅ Heading hierarchy OK (${headings.length} headings)`);

  // 8. Layout shift indicators (images without dimensions)
  const imgNoDim = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).filter(img => !img.width && !img.height && !img.style.width && !img.style.height && !img.getAttribute('width') && !img.getAttribute('height')).length;
  });
  if (imgNoDim > 0) console.log(`  ⚠️  ${imgNoDim} images missing explicit dimensions (CLS risk)`);
  else console.log(`  ✅ All images have explicit dimensions`);

  await page.close();
}
await desktop.close();

// ---- MOBILE CHECKS ----
console.log('\n═══════════════════════════════════════');
console.log('  MOBILE AUDIT (390×844 iPhone 14)');
console.log('═══════════════════════════════════════');

const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });

for (const p of pages) {
  const page = await mobile.newPage();
  await page.goto(`${BASE}${p.path}`, { waitUntil: 'networkidle' });
  console.log(`\n── ${p.name} (mobile) ──`);

  // Horizontal overflow
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  if (overflow) console.log(`  ⚠️  Horizontal overflow (mobile)`);
  else console.log(`  ✅ No horizontal overflow`);

  // Touch targets too small (< 44px)
  const smallTargets = await page.evaluate(() => {
    const results = [];
    document.querySelectorAll('a, button, input, select, textarea').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
        const text = (el.textContent || '').trim().substring(0, 20);
        results.push(`${el.tagName} "${text}" ${Math.round(rect.width)}×${Math.round(rect.height)}`);
      }
    });
    return results.slice(0, 5);
  });
  if (smallTargets.length) console.log(`  ⚠️  Small touch targets: ${smallTargets.join(' | ')}`);
  else console.log(`  ✅ All touch targets ≥ 44px`);

  // Font size too small
  const smallFont = await page.evaluate(() => {
    let count = 0;
    document.querySelectorAll('p, a, li, td, span, label, button').forEach(el => {
      const size = parseFloat(getComputedStyle(el).fontSize);
      if (size < 12 && el.textContent.trim()) count++;
    });
    return count;
  });
  if (smallFont > 0) console.log(`  ⚠️  ${smallFont} elements with font-size < 12px`);
  else console.log(`  ✅ All text ≥ 12px`);

  await page.close();
}
await mobile.close();

await browser.close();
console.log('\n═══════════════════════════════════════');
console.log('  AUDIT COMPLETE');
console.log('═══════════════════════════════════════');
