import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getProductBySlug, getAllProducts, slugify, getRelatedProducts } from '@/lib/products';
import { SITE_CONFIG } from '@/lib/siteConfig';
import ProductCard from '@/components/ProductCard';
import type { Metadata } from 'next';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const products = getAllProducts();
  return products.map((p) => ({ slug: slugify(p.name) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: 'Product Not Found' };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getRelatedProducts(product, 4);

  const categoryIcons: Record<string, string> = {
    'cleaning-equipment': '🧹',
    'disinfection-systems': '💧',
    'sand-filters': '🔄',
    'cartridge-filters': '🔬',
    'underwater-lights': '💡',
    'pool-fittings': '🔧',
    'pumps': '⚙️',
    'integrated-filters': '🏗️',
    'water-features': '🌊',
  };

  const hasImage = product.images && product.images.length > 0 && product.images[0];

  const sizeStr = product.sizes.length > 0 && product.sizes[0] ? product.sizes[0] : '';
  const waUrl = `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    `Hello JB Pools & Accessories,\n\nI am interested in: ${product.name}${product.model ? `\nModel: ${product.model}` : ''}${sizeStr ? `\nSize: ${sizeStr}` : ''}\n\nPlease share availability and pricing.`
  )}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-[#0D5EA6]">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-[#0D5EA6]">Products</Link>
        <span>/</span>
        <Link href={`/products?category=${product.category}`} className="hover:text-[#0D5EA6]">
          {product.subcategory || product.category.replace(/-/g, ' ')}
        </Link>
        <span>/</span>
        <span className="text-gray-600 truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Image + Enquiry */}
        <div className="lg:col-span-2">
          {/* Product Image */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-4 sm:mb-6">
            <div className="aspect-square bg-gradient-to-br from-[#0B2342]/5 to-[#35C6D9]/10 flex items-center justify-center overflow-hidden">
              {hasImage ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  width={800}
                  height={800}
                  className="w-full h-full object-contain p-2 sm:p-4"
                  priority
                />
              ) : (
                <span className="text-6xl sm:text-8xl">{categoryIcons[product.category] || '📦'}</span>
              )}
            </div>
          </div>

          {/* Enquiry Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-[#0B2342] mb-3">Interested in this product?</h3>
            <div className="space-y-3 mb-4">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 sm:py-2.5 text-sm font-semibold bg-[#25D366] text-white rounded-lg hover:bg-[#20bd5a] transition-colors min-h-[48px]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp Enquiry
              </a>
              <Link
                href={`/contact?product=${encodeURIComponent(product.name)}`}
                className="flex items-center justify-center gap-2 w-full py-3 sm:py-2.5 text-sm font-semibold border border-[#0D5EA6] text-[#0D5EA6] rounded-lg hover:bg-[#0D5EA6] hover:text-white transition-colors min-h-[48px]"
              >
                Send Enquiry
              </Link>
            </div>
            <p className="text-xs text-gray-400 text-center">
              Contact us for pricing and availability
            </p>
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="lg:col-span-3">
          {/* Title & Meta */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              {product.brand && (
                <span className="text-xs font-semibold px-2.5 py-0.5 bg-[#0D5EA6]/10 text-[#0D5EA6] rounded-full">
                  {product.brand}
                </span>
              )}
              <span className="text-xs text-gray-400">{product.subcategory}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0B2342] mb-2">{product.name}</h1>
            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
              {product.model && (
                <span className="flex items-center gap-1">
                  <span className="font-medium">Model:</span> {product.model}
                </span>
              )}
              {product.productCode && (
                <span className="flex items-center gap-1">
                  <span className="font-medium">Code:</span> {product.productCode}
                </span>
              )}
            </div>
            {product.sizes.length > 0 && product.sizes[0] && (
              <div className="mt-2 text-xs text-gray-500">
                <span className="font-medium">Size:</span> {product.sizes.join(' | ')}
              </div>
            )}
          </div>

          {/* Price */}
          <div className="bg-gray-50 rounded-lg px-4 py-3 mb-6">
            <span className="text-sm text-gray-500">Contact us for pricing</span>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-[#0B2342] mb-2 uppercase tracking-wider">Description</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Key Features */}
          {product.features.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-[#0B2342] mb-3 uppercase tracking-wider">Key Features</h2>
              <ul className="space-y-2">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 mt-0.5 shrink-0 text-[#35C6D9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Specifications */}
          {Object.keys(product.specifications).length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-[#0B2342] mb-3 uppercase tracking-wider">Specifications</h2>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[320px]">
                    <tbody>
                      {Object.entries(product.specifications).map(([key, value], i) => (
                        <tr key={key} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-4 py-3 text-xs font-medium text-gray-600 w-2/5 sm:w-1/3 whitespace-nowrap">{key}</td>
                          <td className="px-4 py-3 text-xs text-gray-800">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Applications */}
          {product.applications.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-[#0B2342] mb-3 uppercase tracking-wider">Applications</h2>
              <div className="flex flex-wrap gap-2">
                {product.applications.map((app, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full">
                    {app}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Benefits */}
          {product.benefits.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-[#0B2342] mb-3 uppercase tracking-wider">Benefits</h2>
              <ul className="space-y-1.5">
                {product.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-[#35C6D9] mt-0.5">✦</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Source PDF */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Source: Catalogue PDF — {product.sourcePdf} — Page {product.sourcePage}
            </p>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-12 pt-8 border-t border-gray-100">
          <h2 className="text-lg font-bold text-[#0B2342] mb-6">Related Products</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
