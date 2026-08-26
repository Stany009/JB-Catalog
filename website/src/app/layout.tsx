import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { SITE_CONFIG } from '@/lib/siteConfig';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.websiteUrl),
  title: {
    default: `${SITE_CONFIG.companyName} | ${SITE_CONFIG.tagline}`,
    template: `%s | ${SITE_CONFIG.companyName}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    'swimming pool equipment',
    'pool accessories',
    'pool maintenance',
    'water treatment',
    'pool filters',
    'pool pumps',
    'pool lights',
    'pool cleaning',
    'salt chlorinator',
    'pool fittings',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: SITE_CONFIG.companyName,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
