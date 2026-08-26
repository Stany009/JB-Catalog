// PFV Variable Speed series (PDF page 15)
import { MATERIAL_STD, build, ssSpecs, dsSpecs } from './shared.mjs';
import { PFV_FEATURES, pfvDesc } from './series-text-b.mjs';

const COMMON = { fit: '60.3 or 63 mm' };
const EXTRA = { 'Thermal Protector': 'TI.USA', 'Insulation Class': 'F', 'Protection': 'IP55', ...MATERIAL_STD };

const SS_A = [
  ['PFV075', '285', '12', '0.55', '0.75', '3.2', '14.6', '645x295x400'],
  ['PFV100', '315', '15', '0.75', '1.0', '3.8', '15.5', '645x295x400'],
  ['PFV120', '335', '17', '0.9', '1.2', '4.6', '16.3', '645x295x400'],
  ['PFV150', '400', '19', '1.1', '1.5', '5.2', '17.3', '645x295x400'],
  ['PFV200', '480', '21', '1.5', '2.0', '7.0', '18.3', '645x295x400'],
  ['PFV250', '530', '21', '1.85', '2.5', '8.6', '20.4', '645x295x400'],
  ['PFV300', '550', '22', '2.2', '3.0', '10', '21.6', '645x295x400'],
];

const SS_B = [
  ['PFV150-I', '400', '19', '1.1', '1.5', '5.2', '18.6'],
  ['PFV200-I', '480', '21', '1.5', '2.0', '7.0', '19.7'],
  ['PFV250-I', '530', '21', '1.85', '2.5', '8.6', '21'],
  ['PFV300-I', '550', '22', '2.2', '3.0', '10', '22.6'],
  ['PFV400-I', '600', '23', '3.0', '4.0', '14', '24.3'],
];

const mk = (model, txt, specs) => build({
  id: `${model.toLowerCase().replace('-ii', '-2').replace('-i', '-1')}-pool-pump`,
  name: `${model} Variable Speed Pool Pump`,
  sub: 'Swimming Pool Pumps',
  model, page: 15, image: '/images/products/series-pfv-variable.png',
  desc: pfvDesc(txt, specs.Qmax.replace(' l/min', ''), specs.Hmax.replace(' m', '')),
  features: PFV_FEATURES,
  applications: ['Residential pools', 'Commercial pools'],
  benefits: ['Variable speed energy saving', 'Low decibel operation'],
  specs,
});

export const PFV_SERIES = [
  ...SS_A.map(([m, q, h, kw, hp, a, gw, pack]) =>
    mk(m, 'Single speed configuration.', ssSpecs({ qmax: q, hmax: h, kw, hp, amps: a, gw, pack, ...COMMON }, EXTRA))),
  ...SS_B.map(([m, q, h, kw, hp, a, gw]) =>
    mk(m, 'I-configuration model.', ssSpecs({ qmax: q, hmax: h, kw, hp, amps: a, gw, pack: '680x295x400', ...COMMON }, EXTRA))),
];

// [model, lowQ, lowH, lowKw, lowHp, lowA, highQ, highH, highKw, highHp, highA, gw]
const DS = [
  ['PFV150-II', '200', '4', '0.3', '3/8', '2.2', '400', '19', '1.1', '1.5', '5.2', '20'],
  ['PFV200-II', '215', '4.5', '0.35', '3/8', '2.4', '480', '21', '1.5', '2.0', '7.0', '21'],
  ['PFV250-II', '230', '5', '0.4', '1/2', '2.8', '530', '21', '1.85', '2.5', '8.6', '22.5'],
  ['PFV300-II', '250', '5.5', '0.45', '5/8', '3.2', '550', '22', '2.2', '3.0', '10', '24.5'],
];

export const PFV2_SERIES = DS.map(([m, lq, lh, lkw, lhp, la, hq, hh, hkw, hhp, ha, gw]) =>
  mk(m, 'Dual speed configuration.', dsSpecs({
    low: { qmax: lq, hmax: lh, kw: lkw, hp: lhp, amps: la },
    high: { qmax: hq, hmax: hh, kw: hkw, hp: hhp, amps: ha },
    fit: COMMON.fit, gw, pack: '680x295x400',
  }, EXTRA))
);
