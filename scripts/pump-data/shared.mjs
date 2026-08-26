// Shared builder for Pumps Final - PART 1 product entries.
// All data transcribed from the source PDF - nothing invented.

export const SRC = 'Pumps Final - PART 1.PDF';
export const BRAND = 'Mambe';
export const CAT = 'pumps';

export const MATERIAL_STD = {
  'Pump Body': 'Polypropylene+30% Fiberglass',
  'Filter Basket': 'Polypropylene',
  'Shaft': '45# steel nickel-plated',
  'Mechanical Seal': 'Ceramic/Carbon/Viton/SUS304',
  'Impeller & Diffuser': 'PA66+GlassFiber30 & Polypropylene+Fiberglass30',
  'Motor': 'COPPER',
};

export const MATERIAL_PH = {
  'Pump Body': 'Polypropylene+30% Fiberglass',
  'Filter Basket': 'Polypropylene',
  'Shaft': '45# steel nickel-plated',
  'Mechanical Seal': 'Carbon/Silicon/Viton/SUS316',
  'Impeller & Diffuser': 'NORYL-GFN20-801',
  'Motor': 'COPPER',
};

// m: { id, name, model, code, sub, page, image, desc, features, applications,
//     benefits, specs }
export function build(m) {
  return {
    id: m.id,
    name: m.name,
    brand: BRAND,
    category: CAT,
    subcategory: m.sub,
    model: m.model,
    productCode: m.code || m.model,
    sizes: m.sizes || [],
    description: m.desc,
    features: m.features,
    benefits: m.benefits || [],
    applications: m.applications,
    specifications: m.specs,
    images: [m.image],
    sourcePdf: SRC,
    sourcePage: m.page,
  };
}

// Single-speed model row -> specs
export function ssSpecs(m, extra = {}) {
  return {
    'Qmax': `${m.qmax} l/min`,
    'Hmax': `${m.hmax} m`,
    'Voltage': m.volt || '220-240V/50Hz',
    'Power (P1)': `${m.kw} kW / ${m.hp} HP`,
    'Amps': m.amps,
    'Fitting Size': m.fit,
    'G.W': `${m.gw} kg`,
    'Packing Size': `${m.pack} mm`,
    ...extra,
  };
}

// Dual-speed model row -> specs (low/high objects with qmax,hmax,curve,kw,hp,amps)
export function dsSpecs(m, extra = {}) {
  const L = m.low, H = m.high;
  return {
    'Qmax': `Low speed ${L.qmax} l/min / High speed ${H.qmax} l/min`,
    'Hmax': `Low speed ${L.hmax} m / High speed ${H.hmax} m`,
    'Voltage': m.volt || '220-240V/50Hz',
    'Power (P1)': `Low speed ${L.kw} kW (${L.hp} HP) / High speed ${H.kw} kW (${H.hp} HP)`,
    'Amps': `Low speed ${L.amps} / High speed ${H.amps}`,
    'Fitting Size': m.fit,
    'G.W': `${m.gw} kg`,
    'Packing Size': `${m.pack} mm`,
    ...extra,
  };
}

export function hpLabel(hp) {
  return hp.includes('/') ? hp : `${hp} HP`;
}
