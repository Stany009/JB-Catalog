import Link from 'next/link';
import { getCategoriesWithCounts } from '@/lib/products';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Product Categories',
  description: 'Browse all swimming pool equipment categories including pumps, filters, lights, fittings, and more.',
};

export default function CategoriesPage() {
  const categories = getCategoriesWithCounts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="mb-12">
        <h1 className="text-3xl font-light text-gray-900 tracking-tight mb-4">Product Categories</h1>
        <p className="text-base text-gray-500 max-w-2xl">
          Explore our complete range of swimming pool equipment, accessories, and maintenance solutions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.id}`}
            className="group block bg-white border border-gray-200 p-6 hover:border-gray-900 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-medium text-gray-900 group-hover:text-black transition-colors">
                {cat.name}
              </h2>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                {cat.count}
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-6 min-h-[40px]">
              {cat.description}
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-900">
              Explore
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
