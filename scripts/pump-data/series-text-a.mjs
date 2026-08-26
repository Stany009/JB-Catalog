// Series descriptions & features transcribed from Pumps Final - PART 1.PDF
// A: PC Power, PB Turbo, PS Supreme, PH Hurricane, PK Kinetic

export const PC_FEATURES = [
  'Heavy duty Power Pump', 'Strong & Sturdy built',
  '1.5-inch suction & discharged port', 'Transparent Lid',
  'Easy pickup handle', 'Low Decibel', 'Diffuser & Impeller in PPO',
  'Single Phase 220-240V/50Hz', 'High efficiency self-priming centrifugal pump',
];
export const pcDesc = (hp, qmax, hmax) =>
  `"PC" Power series swimming pool pump designed for medium head installation in residential projects and small to medium sized pools. Equipped with 1.5 inch suction and discharged port with transparent lid for inspection. Operates at low decibel and is easy for maintenance. ${hp} HP model with ${qmax} l/min maximum flow and ${hmax} m maximum head.`;

export const PB_FEATURES = [
  'Heavy duty Turbo Pump', 'Strong & Sturdy built',
  '2-inch suction & discharged port', 'Transparent Lid',
  'Easy pickup handle', 'Low Decibel & Energy efficient',
  'Diffuser & Impeller in PPO', 'High efficiency self-priming centrifugal pump',
];
export const pbDesc = (hp, qmax, hmax, volt) =>
  `"PB" Turbo series swimming pool pump is a heavy-duty pump with high flow and energy efficiency ultra performance, suitable for commercial swimming pools and medium and large size swimming pools. Equipped with 2 inch suction and discharge port with ring lock seal designed to eliminate suction leak and maximize suction efficiency. ${hp} HP model (${volt}) with ${qmax} l/min maximum flow and ${hmax} m maximum head.`;

export const PS_FEATURES = [
  'Heavy duty Power Pump', 'Strong & Sturdy built',
  '2-inch suction & discharged port', 'Transparent Lid',
  'Easy pickup handle', 'Low Decibel & Energy efficient',
  'High efficiency self-priming centrifugal pump',
];
export const psDesc = (txt, qmax, hmax) =>
  `"PS" Supreme series pool pump is a heavy duty pump for residential and commercial pools, available in single speed and double speed for higher energy efficiency. Equipped with 2 inch suction and discharged port. ${txt} Maximum flow ${qmax} l/min, maximum head ${hmax} m.`;

export const PH_FEATURES = [
  'Strong & Sturdy built', 'Large Flow rate',
  'Water temperature upto 75°C', 'Max working pressure 0.7MPa',
  'Suitable for large commercial pool', 'Big Strainer basket',
];
export const phDesc = (hp, qmax, hmax) =>
  `"PH" Hurricane series is a very heavy-duty swimming pool pump with large flow rate, suitable for commercial and large swimming pools, compatible large water world and aquarium. Built tough to work under high water temperature upto 75°C, hence suitable for natural hot spring water circulation. High efficiency motor for energy saving and long durability. ${hp} HP model with ${qmax} l/min maximum flow and ${hmax} m maximum head.`;

export const PK_FEATURES = [
  'Thermal protector TI.USA', 'Insulation class F', 'Protection IP55',
  'High efficiency self-priming centrifugal pump',
];
export const pkDesc = (hp, qmax, hmax) =>
  `"PK" series kinetic swimming pool pump. High efficiency self-priming centrifugal pump with thermal protector. ${hp} HP model with ${qmax} l/min maximum flow and ${hmax} m maximum head. 230V/60Hz, 110V/60Hz and 110V/50Hz models available on request.`;
