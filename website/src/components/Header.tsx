'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/categories', label: 'Categories' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[68px]">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo.png"
              alt="JB Pools & Accessories"
              width={800}
              height={502}
              className="h-9 lg:h-11 w-auto object-contain"
              style={{ maxHeight: '44px', maxWidth: '180px' }}
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                    isActive
                      ? 'text-[#0D5EA6] bg-[#0D5EA6]/8'
                      : 'text-gray-600 hover:text-[#0B2342] hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/products" className="btn-primary px-5 py-2.5 text-sm">
              Browse Catalogue
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden w-11 h-11 rounded-lg flex items-center justify-center text-gray-600 hover:text-[#0B2342] hover:bg-gray-100 active:bg-gray-200 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    isActive
                      ? 'text-[#0D5EA6] bg-[#0D5EA6]/8'
                      : 'text-gray-600 hover:text-[#0B2342] hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-2">
              <Link
                href="/products"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center px-4 py-3 text-sm font-semibold text-white btn-primary"
              >
                Browse Catalogue
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
