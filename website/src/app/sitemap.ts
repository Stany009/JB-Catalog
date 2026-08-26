import type { MetadataRoute } from 'next';
import { getAllProducts, getAllCategories, slugify } from '@/lib/products';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://jbpools.in';
  
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
  ];

  const productPages = getAllProducts().map((product) => ({
    url: `${baseUrl}/products/${slugify(product.name)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categoryPages = getAllCategories().map((cat) => ({
    url: `${baseUrl}/products?category=${cat.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...categoryPages];
}
