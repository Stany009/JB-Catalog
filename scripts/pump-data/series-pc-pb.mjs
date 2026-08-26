// PC Power + PB Turbo model tables (transcribed from PDF pages 3-6)
import { MATERIAL_STD, build, ssSpecs } from './shared.mjs';
import { PC_FEATURES, pcDesc, PB_FEATURES, pbDesc } from './series-text-a.mjs';

const PC_ROWS = [
  ['PC050', '195', '7', '0.37', '0.50', '1.9', '9.6'],
  ['PC075', '255', '10', '0.55', '0.75', '2.7', '10.7'],
  ['PC100', '340', '12.5', '0.75', '1.0', '3.8', '11.3'],
  ['PC120', '370', '15', '0.9', '1.2', '4.6', '12.5'],
  ['PC150', '390', '17.5', '1.1', '1.5', '5.8', '13'],
  ['PC200', '470', '18.5', '1.5', '2.0', '7.0', '13.8'],
];

export const PC_SERIES = PC_ROWS.map(([model, qmax, hmax, kw, hp, amps, gw]) =>
  build({
    id: `${model.toLowerCase()}-pool-pump`,
    name: `${model} Power Series Pool Pump`,
    sub: 'Swimming Pool Pumps',
    model, page: 3, image: '/images/products/series-pc-power.png',
    desc: pcDesc(hp, qmax, hmax),
    features: PC_FEATURES,
    applications: ['Residential pools', 'Small to medium sized pools'],
    benefits: ['Low decibel operation', 'Easy maintenance with transparent lid'],
    specs: ssSpecs({ qmax, hmax, kw, hp, amps, gw, fit: '48.5 or 50 mm', pack: '575x275x405' }, {
      'Max Suction': '2.5 M', 'Insulation Class': 'F', 'Protection': 'IP55',
      'Thermal Protector': 'TI.USA', ...MATERIAL_STD,
    }),
  })
);

// [model, qmax, hmax, kw, hp, amps, volt, gw, pack]
const PB_ROWS = [
  ['PB120', '350', '12.5', '0.9', '1.2', '4.6', '220-240V/50Hz', '15.8', '675x315x420'],
  ['PB150', '380', '16.5', '1.1', '1.5', '5.2', '220-240V/50Hz', '16.5', '675x315x420'],
  ['PB200', '500', '20', '1.5', '2.0', '7.0', '220-240V/50Hz', '18.8', '675x315x420'],
  ['PB250', '560', '19.5', '1.85', '2.5', '8.6', '220-240V/50Hz', '20.5', '675x315x420'],
  ['PB300', '600', '22', '2.2', '3.0', '10', '220-240V/50Hz', '22', '675x315x420'],
  ['PB300T', '600', '22', '2.2', '3.0', '10', '380-420V/50Hz', '22', '675x315x420'],
  ['PB400', '650', '25', '3.0', '4.0', '14', '220-240V/50Hz', '25.3', '700x315x420'],
  ['PB400T', '650', '25', '3.0', '4.0', '14', '380-420V/50Hz', '25.3', '700x315x420'],
];

export const PB_SERIES = PB_ROWS.map(([model, qmax, hmax, kw, hp, amps, volt, gw, pack]) =>
  build({
    id: `${model.toLowerCase()}-pool-pump`,
    name: `${model} Turbo Series Pool Pump`,
    sub: 'Swimming Pool Pumps',
    model, page: 5, image: '/images/products/series-pb-turbo.png',
    desc: pbDesc(hp, qmax, hmax, volt),
    features: PB_FEATURES,
    applications: ['Commercial pools', 'Medium and large size swimming pools'],
    benefits: ['Low decibel & energy efficient', 'Ring lock seal maximizes suction efficiency'],
    specs: ssSpecs({ qmax, hmax, kw, hp, amps, volt, gw, fit: '60.3 or 63 mm', pack }, {
      'Max Suction': '2.5 M', 'Insulation Class': 'F', 'Protection': 'IP55',
      'Thermal Protector': 'TI.USA', ...MATERIAL_STD,
    }),
  })
);
