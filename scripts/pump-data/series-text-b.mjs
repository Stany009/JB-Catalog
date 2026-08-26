// Series descriptions & features transcribed from Pumps Final - PART 1.PDF
// B: PF Force, PFV Variable Speed, PCV/PBV Variable Speed, PIE, PIH, PW Whirlpool

export const PF_FEATURES = [
  'Ergonomically designed heavy built pumps',
  'Inlet and outlet reinforced with stainless steel ring',
  'Low decibel noise', 'High energy efficient',
  'Available in single and dual speed',
];
export const pfDesc = (txt, qmax, hmax) =>
  `"PF" series Force pump is an ergonomically designed heavy built pump for residential and commercial swimming pools. Equipped with 2 inch suction and discharged port reinforced with stainless steel ring. One piece handle for convenient handling and easy installation. ${txt} Maximum flow ${qmax} l/min, maximum head ${hmax} m.`;

export const PFV_FEATURES = [
  'Variable speed inverter pump', 'Energy efficient',
  '2 inch suction and discharged port', 'Thermal protector TI.USA',
  'Insulation class F', 'Protection IP55',
];
export const pfvDesc = (txt, qmax, hmax) =>
  `"PFV" series variable speed pool pump with inverter motor for energy efficient operation. ${txt} Maximum flow ${qmax} l/min, maximum head ${hmax} m.`;

export const PCV_FEATURES = [
  'Variable speed pump', 'Energy efficient',
  '1.5-inch suction & discharged port', 'Thermal protector TI.USA',
  'Insulation class F', 'Protection IP55',
];
export const pcvDesc = (txt, qmax, hmax) =>
  `"PCV" series variable speed pool pump, variable speed version of the PC power series for energy efficient operation. ${txt} Maximum flow ${qmax} l/min, maximum head ${hmax} m.`;
export const pbvDesc = (txt, qmax, hmax) =>
  `"PBV" series variable speed pool pump, variable speed version of the PB turbo series for energy efficient operation. ${txt} Maximum flow ${qmax} l/min, maximum head ${hmax} m.`;

export const PIE_FEATURES = [
  'Smart intelligent processor', 'Full Inverter Technology',
  'Saves energy and money', 'DC brushless motor',
  'Works on Volute hydraulic system', 'Silent performer',
  'Digital display screen', '4 Timers for daily operation',
  'Running Capacity from 30%-100%', 'One-click backwash',
  'Power consumption reading',
];
export const pieDesc = (pool, kw, qmax, hmax) =>
  `PIE series inverter Eco pool pump, specially designed inverter pump for excellent performance, silent and energy saving. Saves energy up to 90% and runs intelligently between 30 - 120% capacity to fulfill different applications like filtration and backwash, while reducing the sound level by more than 30 times. Advised pool volume ${pool}. ${kw} kW model with ${qmax} m3/h maximum flow and ${hmax} m maximum head.`;

export const PIH_FEATURES = [
  'Iconic pump designed ergonomically', 'Smart intelligent processor',
  'Full Inverter Technology', 'Saves energy and money',
  'DC brushless motor', 'Works on Volute hydraulic system',
  'Silent performer', 'Digital display screen',
];
export const pihDesc = (pool, kw, qmax, hmax) =>
  `PIH series Inverter Hero pool pump upgraded with Inver Silence technology developed by Mambe for the most silent and saving pump solutions. Combines full inverter technology, volute hydraulic system and DC brushless motor; runs intelligently between 30~120% capacity to fulfill applications like filtration and backwash, reducing sound level by more than 30 times and saving energy up to 90%. Advised pool volume ${pool}. ${kw} kW model with ${qmax} m3/h maximum flow and ${hmax} m maximum head.`;

export const PW_FEATURES = [
  'Class insulation 155(F)', 'Low noise level',
  'Build in Thermal protection',
  'Complete separation of water and the shaft, safe and reliable',
  'High quality wear resistant mechanical seal', 'IP55 waterproof standard',
];
export const PW_DESC =
  'PW series whirlpool pump motor is especially designed for bathtub, whirlpool and spa. Equipped with 1.5 inch suction & discharged port. Operates at low noise level, delivers high flow and is energy efficient.';
