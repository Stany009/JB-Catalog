// PF Force series (PDF pages 13-14)
import { MATERIAL_STD, build, ssSpecs, dsSpecs } from './shared.mjs';
import { PF_FEATURES, pfDesc } from './series-text-b.mjs';

const PF_COMMON = {
  fit: '60.3 or 63 mm', pack: '645x295x400',
  extra: { 'Max Suction': '3 M', 'Insulation Class': 'F', 'Protection': 'IP55', ...MATERIAL_STD },
};
const mk = (model, page, txt, specs) => build({
  id: `${model.toLowerCase().replace('-ii', '-2').replace('-i', '-1')}-pool-pump`,
  name: `${model} Force Series Pool Pump`,
  sub: 'Swimming Pool Pumps',
  model, page, image: '/images/products/series-pf-force.png',
  desc: pfDesc(txt, specs.Qmax.replace(' l/min', ''), specs.Hmax.replace(' m', '')),
  features: PF_FEATURES,
  applications: ['Residential pools', 'Commercial pools'],
  benefits: ['Stainless steel reinforced ports', 'One piece handle for easy installation'],
  specs,
});

const SS = [
  ['PF075', '285', '12', '0.55', '0.75', '3.2', '14.6'],
  ['PF100', '315', '15', '0.75', '1.0', '3.8', '15.5'],
  ['PF120', '335', '17', '0.9', '1.2', '4.6', '16.3'],
  ['PF150', '400', '19', '1.1', '1.5', '5.2', '17.3'],
  ['PF200', '480', '21', '1.5', '2.0', '7.0', '18.3'],
  ['PF250', '530', '21', '1.85', '2.5', '8.6', '20.4'],
  ['PF300', '550', '22', '2.2', '3.0', '10', '21.6'],
];

export const PF_SERIES = SS.map(([m, q, h, kw, hp, a, gw]) =>
  mk(m, 13, 'Single speed model.', ssSpecs({ qmax: q, hmax: h, kw, hp, amps: a, gw, ...PF_COMMON }, PF_COMMON.extra))
);

const I = [
  ['PF150-I', '400', '19', '1.1', '1.5', '5.2', '18.6'],
  ['PF200-I', '480', '21', '1.5', '2.0', '7.0', '19.7'],
  ['PF250-I', '530', '21', '1.85', '2.5', '8.6', '21'],
  ['PF300-I', '550', '22', '2.2', '3.0', '10', '22.6'],
  ['PF400-I', '600', '23', '3.0', '4.0', '14', '24.3'],
];

export const PF1_SERIES = I.map(([m, q, h, kw, hp, a, gw]) =>
  mk(m, 14, 'Single speed I-configuration model.', ssSpecs({ qmax: q, hmax: h, kw, hp, amps: a, gw, ...PF_COMMON }, PF_COMMON.extra))
);
