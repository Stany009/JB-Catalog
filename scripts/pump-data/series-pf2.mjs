// PF Force dual speed (II) models (PDF page 14)
import { build, dsSpecs, MATERIAL_STD } from './shared.mjs';
import { PF_FEATURES, pfDesc } from './series-text-b.mjs';

// [model, lowQ, lowH, lowKw, lowHp, lowAmps, highQ, highH, highKw, highHp, highAmps, gw]
const PF2_ROWS = [
  ['PF150-II', '200', '4', '0.3', '3/8', '2.2', '400', '19', '1.1', '1.5', '5.2', '20'],
  ['PF200-II', '215', '4.5', '0.35', '3/8', '2.4', '480', '21', '1.5', '2.0', '7.0', '21'],
  ['PF250-II', '230', '5', '0.4', '1/2', '2.8', '530', '21', '1.85', '2.5', '8.6', '22.5'],
  ['PF300-II', '250', '5.5', '0.45', '5/8', '3.2', '550', '22', '2.2', '3.0', '10', '24.5'],
];

export const PF2_SERIES = PF2_ROWS.map(([model, lq, lh, lkw, lhp, la, hq, hh, hkw, hhp, ha, gw]) =>
  build({
    id: `${model.toLowerCase().replace('-ii', '-2')}-pool-pump`,
    name: `${model} Force Series Pool Pump (Dual Speed)`,
    sub: 'Swimming Pool Pumps',
    model, page: 14, image: '/images/products/series-pf-force.png',
    desc: pfDesc('Dual speed model for higher energy efficiency.', hq, hh),
    features: PF_FEATURES,
    applications: ['Residential pools', 'Commercial pools'],
    benefits: ['Single and dual speed options', 'Stainless steel reinforced ports'],
    specs: dsSpecs({
      low: { qmax: lq, hmax: lh, kw: lkw, hp: lhp, amps: la },
      high: { qmax: hq, hmax: hh, kw: hkw, hp: hhp, amps: ha },
      fit: '60.3 or 63 mm', gw, pack: '645x295x400',
    }, {
      'Max Suction': '3 M', 'Insulation Class': 'F', 'Protection': 'IP55', ...MATERIAL_STD,
    }),
  })
);
