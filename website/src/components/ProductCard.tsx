import Link from 'next/link';
import Image from 'next/image';
import { Product, slugify } from '@/lib/products';

export default function ProductCard({ product }: { product: Product }) {
  const slug = slugify(product.name);
  const hasImage = product.images && product.images.length > 0 && product.images[0];
  const thumbSrc = hasImage ? product.images[0].replace('.png', '-thumb.jpg') : '';

  return (
    <Link href={`/products/${slug}`} className="product-card block bg-white border border-gray-100 flex flex-col">
      {/* Product Image */}
      <div className="relative overflow-hidden bg-gray-50" style={{ paddingBottom: '100%' }}>
        {hasImage ? (
          <Image
            src={thumbSrc}
            alt={product.name}
            width={600}
            height={600}
            className="product-card-img absolute inset-0 w-full h-full object-contain p-3 sm:p-4"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {product.brand && (
          <span className="absolute top-2.5 right-2.5 text-[10px] font-semibold px-2 py-0.5 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full shadow-sm">
            {product.brand}
          </span>
        )}
      </div>

      <div className="p-3.5 sm:p-4 flex flex-col flex-1">
        {/* Category tag */}
        <span className="text-[10px] font-semibold px-2 py-0.5 bg-[#0D5EA6]/8 text-[#0D5EA6] rounded-full uppercase tracking-wider self-start mb-2">
          {product.subcategory || product.category.replace(/-/g, ' ')}
        </span>

        {/* Name */}
        <h3 className="text-[13px] sm:text-sm font-semibold text-[#0B2342] line-clamp-2 mb-1.5 leading-snug">
          {product.name}
        </h3>

        {/* Model & Sizes */}
        <div className="mb-3 flex-1">
          {product.model && (
            <p className="text-xs text-gray-500 mb-0.5">
              Model: <span className="text-gray-700 font-medium">{product.model}</span>
            </p>
          )}
          {product.sizes && product.sizes.length > 0 && product.sizes[0] && (
            <p className="text-xs text-gray-500">
              Size: <span className="text-gray-700 font-medium">{product.sizes[0]}</span>
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="pt-2.5 mt-auto border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium">
            Contact for pricing
          </span>
          <span className="text-xs text-[#0D5EA6] font-semibold flex items-center gap-1">
            View Details
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
