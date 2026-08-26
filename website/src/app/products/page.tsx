'use client';

import { useState, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getAllProducts, getAllCategories, filterProducts, getFilterOptions } from '@/lib/products';
import ProductCard from '@/components/ProductCard';

const allProducts = getAllProducts();
const allCategories = getAllCategories();

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlCategory = searchParams.get('category') || '';

  const [search, setSearch] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [brand, setBrand] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');

  const setCategory = useCallback((cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat) {
      params.set('category', cat);
    } else {
      params.delete('category');
    }
    router.push(`/products${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
  }, [router, searchParams]);

  const category = urlCategory;

  const filtered = useMemo(() => {
    const results = filterProducts(allProducts, { search, category, subcategory, brand });
    if (sortBy === 'name') {
      results.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'category') {
      results.sort((a, b) => a.category.localeCompare(b.category));
    }
    return results;
  }, [search, category, subcategory, brand, sortBy]);

  const filterOpts = useMemo(() => getFilterOptions(allProducts), []);

  const clearFilters = useCallback(() => {
    setSearch('');
    setCategory('');
    setSubcategory('');
    setBrand('');
  }, [setCategory]);

  const hasFilters = search || category || subcategory || brand;

  const categoryLabels: Record<string, string> = {};
  allCategories.forEach((c) => { categoryLabels[c.id] = c.name; });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0B2342] mb-1">Product Catalogue</h1>
        <p className="text-sm text-gray-500">
          {filtered.length} products found
          {hasFilters && ' (filtered)'}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="search-input w-full pl-10 pr-4 py-3.5 sm:py-3 text-sm bg-white border border-gray-200 rounded-lg min-h-[48px]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#0B2342]">Filters</h2>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-[#0D5EA6] hover:underline">
                  Clear All
                </button>
              )}
            </div>

            {/* Category */}
            <div className="mb-5">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Category</h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {allCategories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2 cursor-pointer py-1">
                    <input
                      type="radio"
                      name="category"
                      checked={category === cat.id}
                      onChange={() => setCategory(category === cat.id ? '' : cat.id)}
                      className="w-3.5 h-3.5 text-[#0D5EA6] accent-[#0D5EA6]"
                    />
                    <span className="text-xs text-gray-600">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Subcategory */}
            <div className="mb-5">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Subcategory</h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {filterOpts.subcategories.map((sub) => (
                  <label key={sub} className="flex items-center gap-2 cursor-pointer py-1">
                    <input
                      type="radio"
                      name="subcategory"
                      checked={subcategory === sub}
                      onChange={() => setSubcategory(subcategory === sub ? '' : sub)}
                      className="w-3.5 h-3.5 text-[#0D5EA6] accent-[#0D5EA6]"
                    />
                    <span className="text-xs text-gray-600">{sub}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brand */}
            <div className="mb-5">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Brand</h3>
              <div className="space-y-1">
                {filterOpts.brands.map((b) => (
                  <label key={b} className="flex items-center gap-2 cursor-pointer py-1">
                    <input
                      type="radio"
                      name="brand"
                      checked={brand === b}
                      onChange={() => setBrand(brand === b ? '' : b)}
                      className="w-3.5 h-3.5 text-[#0D5EA6] accent-[#0D5EA6]"
                    />
                    <span className="text-xs text-gray-600">{b}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Mobile filter button + Sort */}
          <div className="flex items-center justify-between mb-4 gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-3 py-2.5 text-xs font-medium bg-white border border-gray-200 rounded-lg min-h-[44px]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {hasFilters && (
                <span className="w-5 h-5 bg-[#0D5EA6] text-white rounded-full text-[10px] flex items-center justify-center">
                  {[search, category, subcategory, brand].filter(Boolean).length}
                </span>
              )}
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white"
            >
              <option value="name">Sort by Name</option>
              <option value="category">Sort by Category</option>
            </select>
          </div>

          {/* Mobile Filters Dropdown */}
          {showFilters && (
            <div className="lg:hidden bg-white rounded-xl border border-gray-100 p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Filters</h3>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs text-[#0D5EA6]">Clear All</button>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2"
                  >
                    <option value="">All Categories</option>
                    {allCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Subcategory</label>
                  <select
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2"
                  >
                    <option value="">All Subcategories</option>
                    {filterOpts.subcategories.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Brand</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2"
                  >
                    <option value="">All Brands</option>
                    {filterOpts.brands.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Active Filters */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {category && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-[#0D5EA6]/10 text-[#0D5EA6] rounded-full">
                  {categoryLabels[category] || category}
                  <button onClick={() => setCategory('')} className="hover:text-[#0B2342]">×</button>
                </span>
              )}
              {subcategory && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-[#0D5EA6]/10 text-[#0D5EA6] rounded-full">
                  {subcategory}
                  <button onClick={() => setSubcategory('')} className="hover:text-[#0B2342]">×</button>
                </span>
              )}
              {brand && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-[#0D5EA6]/10 text-[#0D5EA6] rounded-full">
                  {brand}
                  <button onClick={() => setBrand('')} className="hover:text-[#0B2342]">×</button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                  &quot;{search}&quot;
                  <button onClick={() => setSearch('')} className="hover:text-gray-800">×</button>
                </span>
              )}
            </div>
          )}

          {/* Product Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-[#0B2342] mb-2">No products found</h3>
              <p className="text-sm text-gray-500 mb-4">Try adjusting your search or filters</p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-[#0D5EA6] border border-[#0D5EA6] rounded-lg hover:bg-[#0D5EA6] hover:text-white transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"><div className="text-center py-16 text-gray-400">Loading products...</div></div>}>
      <ProductsContent />
    </Suspense>
  );
}
