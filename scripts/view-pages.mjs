// View PDF pages to understand their layouts
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const IMG_DIR = path.join(ROOT, 'website', 'public', 'images');
const OUT_DIR = path.join(ROOT, 'website', 'screenshots');

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 1300 } });

  const pages = [
    ['pumps-final-part-1/page-007.png', 'pump-ps'],
    ['pumps-final-part-1/page-009.png', 'pump-ph'],
    ['pumps-final-part-1/page-011.png', 'pump-pk'],
    ['pumps-final-part-1/page-013.png', 'pump-pf'],
    ['pumps-final-part-1/page-015.png', 'pump-pfv'],
    ['pump-final-part-2/page-001.png', 'pump-pw'],
    ['pump-final-part-2/page-003.png', 'pump-pj'],
    ['pump-final-part-2/page-017.png', 'pump-pie'],
    ['pump-final-part-2/page-019.png', 'pump-pih'],
    ['cleaning-equipment-a4-09-nove/page-005.png', 'clean-tp'],
    ['cleaning-equipment-a4-09-nove/page-006.png', 'clean-vac'],
    ['final-filters-07-11-2024/page-006.png', 'filter-ft'],
    ['lights-a4-final/page-003.png', 'light-l11'],
    ['lights-a4-final/page-012.png', 'light-l01'],
    ['pool-fittings-final/page-003.png', 'fitting-sk'],
    ['pool-fittings-final/page-007.png', 'fitting-md'],
    ['surronding-equipments-water-features/page-006.png', 'surround-jet'],
    ['surronding-equipments-water-features/page-013.png', 'surround-shower'],
  ];

  for (const [imgPath, label] of pages) {
    const fullPath = path.join(IMG_DIR, imgPath);
    if (!fs.existsSync(fullPath)) { console.log('MISSING:', imgPath); continue; }
    const fileUrl = 'file:///' + fullPath.replace(/\\/g, '/');
    await page.goto(fileUrl);
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUT_DIR, 'pdf-' + label + '.png') });
    console.log('✓', label);
  }

  await browser.close();
  console.log('Done -', pages.length, 'page screenshots');
}

main();
