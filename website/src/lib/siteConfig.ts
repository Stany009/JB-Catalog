// Single source of truth for JB Pools & Accessories company configuration.
// Use these constants everywhere instead of hardcoding contact details.

export const SITE_CONFIG = {
  companyName: 'JB Pools & Accessories',
  tagline: 'Complete Swimming Pool Solutions',

  // WhatsApp
  whatsappNumber: '917676036101',
  whatsappDisplay: '+91 76760 36101',
  get whatsappUrl() {
    return `https://wa.me/${this.whatsappNumber}`;
  },

  // Contact
  phone: '+91 76760 36101',
  phoneRaw: '917676036101',

  // Email (configured via env)
  contactEmail: process.env.CONTACT_EMAIL || '',

  // Website
  websiteUrl: process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://jbpools.in',

  // Meta
  description:
    'Pool equipment, accessories, water treatment and maintenance solutions for residential, commercial, hotel and resort pools.',
} as const;

/**
 * Build a WhatsApp enquiry URL for a specific product.
 */
export function buildProductWhatsAppUrl(productName: string, model?: string, size?: string): string {
  const lines = [
    'Hello JB Pools & Accessories,',
    '',
    `I am interested in: ${productName}`,
  ];
  if (model) lines.push(`Model: ${model}`);
  if (size) lines.push(`Size: ${size}`);
  lines.push('', 'Please share availability and pricing.');

  return `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
}

/**
 * Build a general WhatsApp enquiry URL.
 */
export function buildGeneralWhatsAppUrl(): string {
  const message = [
    'Hello JB Pools & Accessories,',
    '',
    'I would like to enquire about your pool products and services.',
    '',
    'Please share your catalogue and pricing.',
  ].join('\n');

  return `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
