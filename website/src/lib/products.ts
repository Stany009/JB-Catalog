import productsData from '@/data/products.json';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  model: string;
  productCode: string;
  sizes: string[];
  description: string;
  features: string[];
  benefits: string[];
  applications: string[];
  specifications: Record<string, string>;
  images: string[];
  sourcePdf: string;
  sourcePage: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface ProductDatabase {
  lastUpdated: string;
  totalProducts: number;
  categories: Category[];
  products: Product[];
}

const data = productsData as unknown as ProductDatabase;

export function getAllProducts(): Product[] {
  return data.products;
}

export function getProductById(id: string): Product | undefined {
  return data.products.find((p) => p.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return data.products.find((p) => slugify(p.name) === slug || p.id === slug);
}

export function getAllCategories(): Category[] {
  return data.categories;
}

export function getCategoryById(id: string): Category | undefined {
  return data.categories.find((c) => c.id === id);
}

export function getProductsByCategory(categoryId: string): Product[] {
  return data.products.filter((p) => p.category === categoryId);
}

export function getProductCountByCategory(categoryId: string): number {
  return data.products.filter((p) => p.category === categoryId).length;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function searchProducts(query: string, products: Product[] = data.products): Product[] {
  if (!query.trim()) return products;
  
  const q = query.toLowerCase().trim();
  const terms = q.split(/\s+/);
  
  return products.filter((product) => {
    const searchText = [
      product.name,
      product.brand,
      product.model,
      product.productCode,
      product.category,
      product.subcategory,
      product.description,
      ...product.features,
      ...product.applications,
      ...product.sizes,
      ...Object.values(product.specifications),
    ]
      .join(' ')
      .toLowerCase();
    
    return terms.every((term) => searchText.includes(term));
  });
}

export function getFilterOptions(products: Product[]) {
  const brands = new Set<string>();
  const categories = new Set<string>();
  const subcategories = new Set<string>();
  
  products.forEach((p) => {
    if (p.brand) brands.add(p.brand);
    if (p.category) categories.add(p.category);
    if (p.subcategory) subcategories.add(p.subcategory);
  });
  
  return {
    brands: Array.from(brands).sort(),
    categories: Array.from(categories).sort(),
    subcategories: Array.from(subcategories).sort(),
  };
}

export function filterProducts(
  products: Product[],
  filters: {
    search?: string;
    category?: string;
    subcategory?: string;
    brand?: string;
  }
): Product[] {
  let result = [...products];
  
  if (filters.search) {
    result = searchProducts(filters.search, result);
  }
  
  if (filters.category) {
    result = result.filter((p) => p.category === filters.category);
  }
  
  if (filters.subcategory) {
    result = result.filter((p) => p.subcategory === filters.subcategory);
  }
  
  if (filters.brand) {
    result = result.filter((p) => p.brand === filters.brand);
  }
  
  return result;
}

export function getFeaturedProducts(count: number = 8): Product[] {
  const featured = [
    'pool-shark-robot',
    'eq-salt-chlorinator',
    'ft800-top-mount-sand-filter',
    'l11-resin-pool-light',
    'pw200-pool-pump',
    'sk30c-heavy-duty-skimmer',
    'wd300-water-descent',
    'sj680a-swimming-machine',
    'uvp85-uv-sterilizer',
    'l31-slim-ss-light',
    'cbt400-integrated-filter',
    'nq50-salt-chlorinator',
  ];
  
  const products = featured
    .map((id) => getProductById(id))
    .filter((p): p is Product => p !== undefined);
  
  return products.slice(0, count);
}

export function getRelatedProducts(product: Product, count: number = 4): Product[] {
  return data.products
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.category === product.category || p.subcategory === product.subcategory)
    )
    .slice(0, count);
}

export function getCategoriesWithCounts() {
  return data.categories.map((cat) => ({
    ...cat,
    count: getProductCountByCategory(cat.id),
  }));
}

import { SITE_CONFIG } from './siteConfig';

export const WHATSAPP_NUMBER = SITE_CONFIG.whatsappNumber;
export const PHONE_NUMBER = SITE_CONFIG.phone;
export const EMAIL = SITE_CONFIG.contactEmail;
export const COMPANY_NAME = SITE_CONFIG.companyName;
