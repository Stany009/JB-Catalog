// PCV / PBV Variable Speed series (PDF page 16)
import { MATERIAL_STD, build, ssSpecs } from './shared.mjs';
import { PCV_FEATURES, pcvDesc, pbvDesc } from './series-text-b.mjs';

// [model, qmax, hmax, curve, kw, hp, amps, gw]
const PCV_ROWS = [
  ['PCV050', '195', '7', '1', '0.37', '0.50', '1.9', '9.6'],
  ['PCV075', '255', '10', '2', '0.55', '0.75', '2.7', '10.7'],
  ['PCV100', '340', '12.5', '3', '0.75', '1.0', '3.8', '11.3'],
  ['PCV120', '370', '15', '4', '0.9', '1.2', '4.6', '12.5'],
  ['PCV150', '390', '17.5', '5', '1.1', '1.5', '5.8', '13'],
  ['PCV200', '470', '18.5', '6', '1.5', '2.0', '7.0', '13.8'],
];

const PCV_EXTRA = { 'Insulation Class': 'F', 'Protection': 'IP55', 'Thermal Protector': 'TI.USA', ...MATERIAL_STD };

export const PCV_SERIES = PCV_ROWS.map(([m, q, h, c, kw, hp, a, gw]) =>
  build({
    id: `${m.toLowerCase()}-pool-pump`,
    name: `${m} Variable Speed Pool Pump`,
    sub: 'Swimming Pool Pumps',
    model: m, page: 16, image: '/images/products/series-pcv-variable.png',
    desc: pcvDesc('Variable speed version of the PC power series.', q, h),
    features: PCV_FEATURES,
    applications: ['Residential pools', 'Small to medium sized pools'],
    benefits: ['Variable speed energy saving', 'Low decibel operation'],
    specs: ssSpecs({ qmax: q, hmax: h, kw, hp, amps: a, gw, fit: '48.5 or 50 mm', pack: '575x275x405' }, PCV_EXTRA),
  })
);

// [model, qmax, hmax, curve, kw, hp, amps, volt, gw, pack]
const PBV_ROWS = [
  ['PBV120', '350', '12.5', '1', '0.9', '1.2', '4.6', '220-240V/50Hz', '15.8', '675x315x420'],
  ['PBV150', '380', '16.5', '2', '1.1', '1.5', '5.2', '220-240V/50Hz', '16.5', '675x315x420'],
  ['PBV200', '500', '20', '3', '1.5', '2.0', '7.0', '220-240V/50Hz', '18.8', '675x315x420'],
  ['PBV250', '560', '19.5', '4', '1.85', '2.5', '8.6', '220-240V/50Hz', '20.5', '675x315x420'],
  ['PBV300', '600', '22', '5', '2.2', '3.0', '10', '220-240V/50Hz', '22', '675x315x420'],
  ['PBV300T', '600', '22', '5', '2.2', '3.0', '14', '380-420V/50Hz', '22', '675x315x420'],
  ['PBV400', '650', '25', '6', '3.0', '4.0', '4.6', '220-240V/50Hz', '25.3', '700x315x420'],
  ['PBV400T', '650', '25', '6', '3.0', '4.0', '5.2', '380-420V/50Hz', '25.3', '700x315x420'],
];

export const PBV_SERIES = PBV_ROWS.map(([m, q, h, c, kw, hp, a, volt, gw, pack]) =>
  build({
    id: `${m.toLowerCase()}-pool-pump`,
    name: `${m} Variable Speed Pool Pump`,
    sub: 'Swimming Pool Pumps',
    model: m, page: 16, image: '/images/products/series-pbv-variable.png',
    desc: pbvDesc('Variable speed version of the PB turbo series.', q, h),
    features: PCV_FEATURES,
    applications: ['Commercial pools', 'Medium and large size swimming pools'],
    benefits: ['Variable speed energy saving', 'Low decibel operation'],
    specs: ssSpecs({ qmax: q, hmax: h, kw, hp, amps: a, volt, gw, fit: '60.3 or 63 mm', pack }, PCV_EXTRA),
  })
);
