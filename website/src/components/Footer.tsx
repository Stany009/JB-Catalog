import Link from 'next/link';
import Image from 'next/image';
import { getAllCategories } from '@/lib/products';
import { SITE_CONFIG } from '@/lib/siteConfig';

export default function Footer() {
  const categories = getAllCategories();

  return (
    <footer className="bg-[#0B2342] text-white no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Company */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Image
              src="/logo-white.png"
              alt="JB Pools & Accessories"
              width={800}
              height={502}
              className="h-10 w-auto mb-5 object-contain"
              style={{ maxHeight: '40px', maxWidth: '160px' }}
            />
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Complete swimming pool solutions. Equipment, accessories, water treatment and maintenance
              for residential, commercial, hotel and resort pools.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#35C6D9] mb-5">
              Quick Links
            </h3>
            <ul className="space-y-1">
              {[
                { href: '/products', label: 'All Products' },
                { href: '/categories', label: 'Categories' },
                { href: '/about', label: 'About Us' },
                { href: '/services', label: 'Services' },
                { href: '/contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center min-h-[40px]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#35C6D9] mb-5">
              Product Categories
            </h3>
            <ul className="space-y-1">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/products?category=${cat.id}`}
                    className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center min-h-[40px]"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#35C6D9] mb-5">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-[#35C6D9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <a
                  href={SITE_CONFIG.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center min-h-[40px]"
                >
                  {SITE_CONFIG.whatsappDisplay}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-[#35C6D9]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <span className="inline-flex items-center min-h-[40px]">WhatsApp: {SITE_CONFIG.whatsappDisplay}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} JB Pools &amp; Accessories. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            Product data extracted from official catalogue PDFs.
          </p>
        </div>
      </div>
    </footer>
  );
}
