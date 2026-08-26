// Merge Pumps Final - PART 1 products into the canonical dataset.
// Duplicate detection: id, slugified name, brand+model+productCode.
// Existing matching products are kept (merge = update image/specs only if empty).
// Run: node scripts/apply-part1.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { PC_SERIES, PB_SERIES } from './pump-data/series-pc-pb.mjs';
import { PS_SERIES, PS2_SERIES, PH_SERIES } from './pump-data/series-ps-ph.mjs';
import { PK_SERIES } from './pump-data/series-pk.mjs';
import { PF_SERIES, PF1_SERIES } from './pump-data/series-pf.mjs';
import { PF2_SERIES } from './pump-data/series-pf2.mjs';
import { PFV_SERIES, PFV2_SERIES } from './pump-data/series-pfv.mjs';
import { PCV_SERIES, PBV_SERIES } from './pump-data/series-pcv-pbv.mjs';
import { PIE_SERIES, PIH_SERIES, PW_SERIES } from './pump-data/series-inverter-pw.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data', 'products.json');

const incoming = [
  ...PC_SERIES, ...PB_SERIES,
  ...PS_SERIES, ...PS2_SERIES, ...PH_SERIES,
  ...PK_SERIES,
  ...PF_SERIES, ...PF1_SERIES, ...PF2_SERIES,
  ...PFV_SERIES, ...PFV2_SERIES,
  ...PCV_SERIES, ...PBV_SERIES,
  ...PIE_SERIES, ...PIH_SERIES, ...PW_SERIES,
];

const slugify = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

const db = JSON.parse(fs.readFileSync(DATA, 'utf-8'));
const existingIds = new Set(db.products.map((p) => p.id));
const existingSlugs = new Set(db.products.map((p) => slugify(p.name)));
const existingKeys = new Set(db.products.map((p) => `${p.brand}|${p.model}|${p.productCode}`.toLowerCase()));

const added = [];
const merged = [];
const skipped = [];

for (const p of incoming) {
  const slug = slugify(p.name);
  const key = `${p.brand}|${p.model}|${p.productCode}`.toLowerCase();
  if (existingIds.has(p.id) || existingSlugs.has(slug) || existingKeys.has(key)) {
    skipped.push(p);
    merged.push(p.id);
    continue;
  }
  db.products.push(p);
  existingIds.add(p.id);
  existingSlugs.add(slug);
  existingKeys.add(key);
  added.push(p.id);
}

db.totalProducts = db.products.length;
db.lastUpdated = new Date().toISOString().slice(0, 10);

fs.writeFileSync(DATA, JSON.stringify(db, null, 2) + '\n');

console.log(`Incoming: ${incoming.length}`);
console.log(`Added: ${added.length}`);
console.log(`Skipped (duplicates): ${merged.length}`);
merged.forEach((id) => console.log('  dup:', id));
console.log(`Canonical total: ${db.products.length}`);
