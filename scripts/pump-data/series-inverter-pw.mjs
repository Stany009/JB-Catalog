// PIE Inverter Eco (pages 17-18), PIH Inverter Hero (pages 19-20), PW Whirlpool (page 21)
import { build } from './shared.mjs';
import { PIE_FEATURES, pieDesc, PIH_FEATURES, pihDesc, PW_FEATURES, PW_DESC } from './series-text-b.mjs';

// [model, pool m3, kw, qmax m3/h, hmax m, flow10, flow8]
const PIE_ROWS = [
  ['PIE14', '20~40', '0.60', '18.0', '14.0', '9.0', '14.5'],
  ['PIE18', '30~50', '0.75', '21.0', '16.0', '14.0', '18.0'],
  ['PIE22', '40~70', '1.00', '25.5', '18.0', '18.0', '22.0'],
  ['PIE27', '60~90', '1.35', '28.5', '20.0', '27.0', '24.0'],
];

export const PIE_SERIES = PIE_ROWS.map(([m, pool, kw, qmax, hmax, f10, f8]) =>
  build({
    id: `${m.toLowerCase()}-inverter-pool-pump`,
    name: `${m} Inverter Eco Pool Pump`,
    sub: 'Inverter Pool Pumps',
    model: m, page: 17, image: '/images/products/series-pie-inverter.png',
    desc: pieDesc(`${pool} m3`, kw, qmax, hmax),
    features: PIE_FEATURES,
    applications: ['Residential pools', 'Filtration and backwash applications'],
    benefits: ['Saves energy up to 90%', 'Reduces sound level by more than 30 times', 'One year save energy 7884 kwh'],
    specs: {
      'Advised Pool Volume': `${pool} m3`,
      'Power (P1)': `${kw} kW`,
      'Voltage': '220~240V 50/60Hz',
      'Qmax': `${qmax} m3/h`,
      'Hmax': `${hmax} m`,
      'Circulation Flow (10m head)': `${f10} m3/h`,
      'Circulation Flow (8m head)': `${f8} m3/h`,
      'Packing Dimension': '585x255x525 mm',
    },
  })
);

// [model, pool m3, kw, qmax m3/h, hmax m, flow10, flow8]
const PIH_ROWS = [
  ['PIH20', '30~50', '0.75', '23.4', '18.0', '14.1', '18.1'],
  ['PIH24', '40~70', '1.05', '26.0', '20.0', '19.3', '23.0'],
  ['PIH30', '50~80', '1.4', '28.3', '20.5', '24.5', '27.6'],
  ['PIH40', '70~100', '1.75', '40.3', '20.5', '32.0', '35.6'],
];

export const PIH_SERIES = PIH_ROWS.map(([m, pool, kw, qmax, hmax, f10, f8]) =>
  build({
    id: `${m.toLowerCase()}-inverter-pool-pump`,
    name: `${m} Inverter Hero Pool Pump`,
    sub: 'Inverter Pool Pumps',
    model: m, page: 19, image: '/images/products/series-pih-inverter.png',
    desc: pihDesc(`${pool} m3`, kw, qmax, hmax),
    features: PIH_FEATURES,
    applications: ['Residential pools', 'Filtration and backwash applications'],
    benefits: ['Up to 15 times more energy-saving', '30 times more silent than on/off pumps', 'Saves energy up to 90%'],
    specs: {
      'Advised Pool Volume': `${pool} m3`,
      'Power (P1)': `${kw} kW`,
      'Voltage': '220~240V 50/60Hz',
      'Qmax': `${qmax} m3/h`,
      'Hmax': `${hmax} m`,
      'Circulation Flow (10m head)': `${f10} m3/h`,
      'Circulation Flow (8m head)': `${f8} m3/h`,
      'Packing Dimension': '648x270x340 mm',
    },
  })
);

export const PW_SERIES = [
  build({
    id: 'pw-series-whirlpool-pump',
    name: 'PW Series Whirlpool Pump',
    sub: 'Jet & Whirlpool Pumps',
    model: 'PW Series', page: 21, image: '/images/products/series-pw-whirlpool.png',
    desc: PW_DESC,
    features: PW_FEATURES,
    applications: ['Bathtubs', 'Whirlpools', 'Spas'],
    benefits: ['Low noise level', 'High flow and energy efficient'],
    specs: {
      'Suction & Discharged Port': '1.5 inch',
      'Insulation Class': '155(F)',
      'Protection': 'IP55',
      'Thermal Protector': 'TI.USA',
    },
  }),
];
