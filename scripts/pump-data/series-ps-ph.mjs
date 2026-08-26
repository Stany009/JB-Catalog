// PS Supreme + PH Hurricane model tables (PDF pages 7-10)
import { MATERIAL_STD, MATERIAL_PH, build, ssSpecs, dsSpecs } from './shared.mjs';
import { PS_FEATURES, psDesc, PH_FEATURES, phDesc } from './series-text-a.mjs';

// [model, qmax, hmax, kw, hp, amps, gw]
const PS_ROWS = [
  ['PS075', '290', '10', '0.55', '0.75', '3.2', '14.6'],
  ['PS100', '380', '13', '0.75', '1.0', '3.8', '16'],
  ['PS150', '420', '17', '1.1', '1.5', '5.2', '17.3'],
  ['PS200', '465', '19', '1.5', '2.0', '7.0', '19'],
  ['PS250', '480', '21', '1.85', '2.5', '8.6', '20.8'],
  ['PS300', '540', '23', '2.2', '3.0', '10', '22.3'],
];

export const PS_SERIES = PS_ROWS.map(([model, qmax, hmax, kw, hp, amps, gw]) =>
  build({
    id: `${model.toLowerCase()}-pool-pump`,
    name: `${model} Supreme Series Pool Pump`,
    sub: 'Swimming Pool Pumps',
    model, page: 7, image: '/images/products/series-ps-supreme.png',
    desc: psDesc('Single speed model.', qmax, hmax),
    features: PS_FEATURES,
    applications: ['Residential pools', 'Commercial pools'],
    benefits: ['Single or double speed for higher energy efficiency', 'Low decibel operation'],
    specs: ssSpecs({ qmax, hmax, kw, hp, amps, gw, fit: '60.3 or 63 mm', pack: '635x275x380' }, {
      'Max Suction': '1.5 M', 'Insulation Class': 'F', 'Protection': 'IP55',
      'Thermal Protector': 'TI.USA', 'Note': '230V/60Hz version on request', ...MATERIAL_STD,
    }),
  })
);

// [model, lowQ, lowH, lowKw, lowHp, lowAmps, highQ, highH, highKw, highHp, highAmps, gw]
const PS2_ROWS = [
  ['PS150-II', '200', '4.0', '0.3', '3/8', '2.2', '420', '18.5', '1.1', '1.5', '5.2', '20'],
  ['PS200-II', '215', '4.5', '0.35', '3/8', '2.4', '465', '19.5', '1.5', '2.0', '7.0', '22'],
  ['PS250-II', '230', '5', '0.4', '1/2', '2.8', '480', '21', '1.85', '2.5', '8.6', '24'],
  ['PS300-II', '250', '5.5', '0.45', '5/8', '3.2', '540', '23', '2.2', '3.0', '10', '24.8'],
];

// [model, qmax, hmax, kw, hp, amps, fitting, gw]
const PH_ROWS = [
  ['PH300(T)', '1080', '14', '2.2', '3', '4.1', '4 inch', '45.5'],
  ['PH400(T)', '1300', '15', '3.0', '4', '5.2', '4 inch', '47'],
  ['PH500(T)', '1580', '17', '4.0', '5', '8.2', '110 mm', '54.5'],
  ['PH750(T)', '1700', '22', '5.5', '7.5', '9.6', '114.3 mm', '60.3'],
  ['PH1000(T)', '2100', '21.5', '7.5', '10', '11.1', '114.3 mm', '64.5'],
];

export const PH_SERIES = PH_ROWS.map(([model, qmax, hmax, kw, hp, amps, fit, gw]) =>
  build({
    id: `${model.toLowerCase().replace(/\(|\)/g, '')}-pool-pump`,
    name: `${model} Hurricane Series Pool Pump`,
    sub: 'Swimming Pool Pumps',
    model, page: 9, image: '/images/products/series-ph-hurricane.png',
    desc: phDesc(hp, qmax, hmax),
    features: PH_FEATURES,
    applications: ['Commercial pools', 'Large swimming pools', 'Water worlds and aquariums', 'Natural hot spring water circulation'],
    benefits: ['Large flow rate', 'Works under high water temperature upto 75°C'],
    specs: ssSpecs({ qmax, hmax, kw, hp, amps, volt: '380V/50Hz', gw, fit, pack: '840x395x600' }, {
      'Insulation Class': 'F', 'Protection': 'IP55', ...MATERIAL_PH,
    }),
  })
);

export const PS2_SERIES = PS2_ROWS.map(([model, lq, lh, lkw, lhp, la, hq, hh, hkw, hhp, ha, gw]) =>
  build({
    id: `${model.toLowerCase().replace('-ii','-2')}-pool-pump`,
    name: `${model} Supreme Series Pool Pump (Dual Speed)`,
    sub: 'Swimming Pool Pumps',
    model, page: 7, image: '/images/products/series-ps-supreme.png',
    desc: psDesc('Dual speed model for higher energy efficiency.', hq, hh),
    features: PS_FEATURES,
    applications: ['Residential pools', 'Commercial pools'],
    benefits: ['Dual speed for higher energy efficiency', 'Low decibel operation'],
    specs: dsSpecs({
      low: { qmax: lq, hmax: lh, kw: lkw, hp: lhp, amps: la },
      high: { qmax: hq, hmax: hh, kw: hkw, hp: hhp, amps: ha },
      fit: '60.3 or 63 mm', gw, pack: '635x275x380',
    }, {
      'Max Suction': '1.5 M', 'Insulation Class': 'F', 'Protection': 'IP55',
      'Thermal Protector': 'TI.USA', ...MATERIAL_STD,
    }),
  })
);
