import Link from 'next/link';
import Image from 'next/image';
import { getCategoriesWithCounts, getFeaturedProducts, getAllProducts, getAllCategories } from '@/lib/products';
import ProductCard from '@/components/ProductCard';



export default function HomePage() {
  const categories = getCategoriesWithCounts();
  const featured = getFeaturedProducts(8);
  const totalProducts = getAllProducts().length;
  const totalCategories = getAllCategories().length;

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero-gradient text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16 relative z-10">
          <div className="max-w-3xl">
            <Image
              src="/logo-white.png"
              alt="JB Pools & Accessories"
              width={800}
              height={502}
              className="h-16 sm:h-20 lg:h-24 w-auto mb-8"
              priority
            />
            <h1 className="sr-only">JB Pools & Accessories — Complete Swimming Pool Solutions</h1>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full mb-5">
              <span className="w-2 h-2 bg-[#35C6D9] rounded-full" />
              <span className="text-[#35C6D9] text-xs font-semibold uppercase tracking-wider">
                Complete Swimming Pool Solutions
              </span>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl text-white/90 leading-relaxed mb-10 max-w-2xl font-light">
              Pool equipment, accessories, water treatment and maintenance for residential,
              commercial, hotel and resort pools.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products" className="btn-aqua px-7 py-3.5 text-sm">
                EXPLORE PRODUCTS
              </Link>
              <Link href="/contact" className="btn-outline px-7 py-3.5 text-sm font-semibold">
                CONTACT US
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F5F8FA] to-transparent" />
      </section>

      {/* ── Stats ── */}
      <section className="relative z-10 -mt-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
              {[
                { value: `${totalProducts}+`, label: 'Products', color: 'text-[#0D5EA6]' },
                { value: `${totalCategories}`, label: 'Categories', color: 'text-[#0B2342]' },
                { value: '11', label: 'Catalogue PDFs', color: 'text-[#0D5EA6]' },
                { value: '100%', label: 'Verified Data', color: 'text-[#0B2342]' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className={`text-3xl sm:text-4xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Product Categories ── */}
      <section className="section-spacing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0B2342] mb-3">Product Categories</h2>
            <p className="text-sm sm:text-base text-gray-500 max-w-lg mx-auto">
              Browse our complete range of pool equipment and accessories
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="category-card group bg-white rounded-xl border border-gray-100 p-5 sm:p-6 text-center"
              >

                <h3 className="text-sm sm:text-base font-semibold text-[#0B2342] mb-1 group-hover:text-[#0D5EA6] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#35C6D9] font-semibold mb-2">{cat.count} products</p>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{cat.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="section-spacing bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0B2342] mb-2">Featured Products</h2>
              <p className="text-sm sm:text-base text-gray-500">Hand-picked products from our catalogue</p>
            </div>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-[#0D5EA6] hover:text-[#0B2342] transition-colors"
            >
              View All
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0D5EA6] px-6 py-3 border border-[#0D5EA6]/20 rounded-xl hover:bg-[#0D5EA6]/5 transition-colors"
            >
              View All Products
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why JB Pools ── */}
      <section className="section-spacing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0B2342] mb-3">Why JB Pools</h2>
            <p className="text-sm sm:text-base text-gray-500 max-w-lg mx-auto">
              Trusted by professionals across the industry
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                title: 'Comprehensive Catalogue',
                desc: `Over ${totalProducts} products across ${totalCategories} categories extracted from 11 official catalogue PDFs. Every product verified against source documents.`,
              },
              {
                title: 'Quality Equipment',
                desc: 'Premium pool equipment from leading manufacturers. Fiberglass filters, stainless steel fittings, and IP68 rated lighting systems.',
              },
              {
                title: 'Complete Solutions',
                desc: 'From construction to maintenance. Pumps, filters, lights, fittings, disinfection systems, and water features — everything in one place.',
              },
              {
                title: 'Easy Enquiry',
                desc: 'Find the product you need, check specifications, and send an enquiry directly via WhatsApp or our contact form. Quick and simple.',
              },
              {
                title: 'Commercial & Residential',
                desc: 'Serving homeowners, hotels, resorts, architects, builders, and pool contractors with the right equipment for every project.',
              },
              {
                title: 'Technical Specifications',
                desc: 'Detailed specifications, flow rates, dimensions, and material information for every product. Make informed decisions.',
              },
            ].map((item) => (
              <div key={item.title} className="feature-card p-6 sm:p-7">

                <h3 className="text-base font-semibold text-[#0B2342] mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-spacing bg-[#0B2342]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Find the Right Equipment?
          </h2>
          <p className="text-gray-300 text-sm sm:text-base mb-10 max-w-2xl mx-auto leading-relaxed">
            Browse our complete product catalogue or contact us for expert advice on pool
            construction, equipment, and maintenance solutions.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/products" className="btn-aqua px-8 py-3.5 text-sm">
              Browse Products
            </Link>
            <Link href="/contact" className="btn-outline px-8 py-3.5 text-sm font-semibold">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
