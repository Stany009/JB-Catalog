// PK Kinetic model tables (PDF pages 11-12)
import { MATERIAL_STD, build, ssSpecs } from './shared.mjs';
import { PK_FEATURES, pkDesc } from './series-text-a.mjs';

// [model, qmax, hmax, kw, hp, amps, fit, gw, pack, page]
const PK_ROWS = [
  ['PK025', '140', '5', '0.18', '0.25', '0.9', '48.5 or 50 mm', '6', '470x180x295', 11],
  ['PK035', '160', '8', '0.25', '0.35', '1.6', '48.5 or 50 mm', '6.5', '470x180x295', 11],
  ['PK050', '210', '11', '0.37', '0.5', '2.0', '48.5 or 50 mm', '7', '470x180x295', 11],
  ['PK075', '240', '10.5', '0.55', '0.75', '3.2', '48.5 or 50 mm', '8.8', '470x180x295', 11],
  ['PK100', '275', '11', '0.75', '1.0', '3.8', '48.5 or 50 mm', '9.5', '470x180x295', 11],
  ['PK120', '300', '13', '0.9', '1.2', '4.6', '48.5 or 50 mm', '9.8', '470x180x295', 11],
  ['PK150', '430', '16.5', '1.1', '1.5', '5.8', '60.3 or 63 mm', '14', '600x295x345', 12],
  ['PK200', '520', '18', '1.5', '2.0', '7.0', '60.3 or 63 mm', '15.5', '600x295x345', 12],
  ['PK250', '600', '19', '1.85', '2.5', '8.5', '60.3 or 63 mm', '16.5', '600x295x345', 12],
  ['PK300', '635', '19.5', '2.2', '3.0', '10', '60.3 or 63 mm', '18', '600x295x345', 12],
];

export const PK_SERIES = PK_ROWS.map(([model, qmax, hmax, kw, hp, amps, fit, gw, pack, page]) =>
  build({
    id: `${model.toLowerCase()}-pool-pump`,
    name: `${model} Kinetic Series Pool Pump`,
    sub: 'Swimming Pool Pumps',
    model, page, image: '/images/products/series-pk-kinetic.png',
    desc: pkDesc(hp, qmax, hmax),
    features: PK_FEATURES,
    applications: ['Residential pools', 'Commercial pools'],
    benefits: ['Compact kinetic design', 'Thermal protection built in'],
    specs: ssSpecs({ qmax, hmax, kw, hp, amps, gw, fit, pack }, {
      'Insulation Class': 'F', 'Protection': 'IP55', ...MATERIAL_STD,
    }),
  })
);
