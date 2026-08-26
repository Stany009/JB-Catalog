'use client';

import { useState, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { SITE_CONFIG, buildProductWhatsAppUrl, buildGeneralWhatsAppUrl } from '@/lib/siteConfig';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

function ContactForm() {
  const searchParams = useSearchParams();
  const prefillProduct = searchParams.get('product') || '';

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    product: prefillProduct,
    message: '',
  });
  const [formState, setFormState] = useState<FormState>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setFormState('success');
      } else {
        setFormState('error');
      }
    } catch {
      setFormState('error');
    }
  };

  const waLink = form.product
    ? buildProductWhatsAppUrl(form.product)
    : buildGeneralWhatsAppUrl();

  if (formState === 'success') {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
        <Image src="/logo.png" alt="JB Pools & Accessories" width={800} height={502} className="h-16 w-auto mx-auto mb-6 object-contain" style={{ maxHeight: '64px', maxWidth: '200px' }} />
        <div className="text-4xl mb-4">✅</div>
        <h3 className="text-lg font-semibold text-[#0B2342] mb-2">Enquiry Sent Successfully</h3>
        <p className="text-sm text-gray-500 mb-6">
          Thank you, <strong>{form.name}</strong>. Your enquiry has been sent successfully. We&apos;ll get back to you shortly.
          {form.product && (
            <>
              {' '}Regarding: <strong>{form.product}</strong>
            </>
          )}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold bg-[#25D366] text-white rounded-lg hover:bg-[#20bd5a] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Also Send via WhatsApp
          </a>
        </div>

        <button
          onClick={() => { setFormState('idle'); setForm({ name: '', phone: '', email: '', product: '', message: '' }); }}
          className="px-4 py-2 text-sm font-medium text-[#0D5EA6] border border-[#0D5EA6] rounded-lg hover:bg-[#0D5EA6] hover:text-white transition-colors"
        >
          Send Another Enquiry
        </button>
      </div>
    );
  }

  if (formState === 'error') {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-[#0B2342] mb-2">Enquiry Failed</h3>
        <p className="text-sm text-gray-500 mb-6">
          We couldn&apos;t send your enquiry. Please try again or contact us directly on WhatsApp.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold bg-[#25D366] text-white rounded-lg hover:bg-[#20bd5a] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Contact via WhatsApp
          </a>
          <button
            onClick={() => setFormState('idle')}
            className="px-5 py-2.5 text-sm font-semibold border border-[#0D5EA6] text-[#0D5EA6] rounded-lg hover:bg-[#0D5EA6] hover:text-white transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6">
      {/* Logo Header */}
      <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
        <Image src="/logo.png" alt="JB Pools & Accessories" width={800} height={502} className="h-10 w-auto object-contain" style={{ maxHeight: '40px', maxWidth: '200px' }} />
        <div>
          <h2 className="text-base font-semibold text-[#0B2342]">Send an Enquiry</h2>
          <p className="text-xs text-gray-400">We respond to all enquiries promptly</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="contact-name" className="text-xs font-medium text-gray-600 block mb-1">Name *</label>
          <input
            id="contact-name"
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#35C6D9]/30 focus:border-[#0D5EA6] min-h-[44px]"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contact-phone" className="text-xs font-medium text-gray-600 block mb-1">Phone</label>
            <input
              id="contact-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#35C6D9]/30 focus:border-[#0D5EA6] min-h-[44px]"
            />
          </div>
          <div>
            <label htmlFor="contact-email" className="text-xs font-medium text-gray-600 block mb-1">Email</label>
            <input
              id="contact-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#35C6D9]/30 focus:border-[#0D5EA6] min-h-[44px]"
            />
          </div>
        </div>
        <div>
          <label htmlFor="contact-product" className="text-xs font-medium text-gray-600 block mb-1">Product</label>
          <input
            id="contact-product"
            type="text"
            value={form.product}
            onChange={(e) => setForm({ ...form, product: e.target.value })}
            placeholder="Product name or model"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#35C6D9]/30 focus:border-[#0D5EA6] min-h-[44px]"
          />
        </div>
        <div>
          <label htmlFor="contact-message" className="text-xs font-medium text-gray-600 block mb-1">Message *</label>
          <textarea
            id="contact-message"
            required
            rows={4}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Tell us what you need..."
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#35C6D9]/30 focus:border-[#0D5EA6] resize-none min-h-[44px]"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={formState === 'submitting'}
            className="flex-1 py-2.5 text-sm font-semibold bg-[#0D5EA6] text-white rounded-lg hover:bg-[#0B2342] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {formState === 'submitting' ? 'Sending...' : 'Send Enquiry'}
          </button>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-[#25D366] text-white rounded-lg hover:bg-[#20bd5a] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </a>
        </div>
      </div>
    </form>
  );
}

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-3xl mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0B2342] mb-4">Contact Us</h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          Get in touch for product enquiries, pricing, or custom solutions. We respond to all enquiries promptly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-[#0B2342] mb-3">Get in Touch</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#0D5EA6]/10 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-[#0D5EA6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-[#0B2342]">Phone</p>
                  <a href={`tel:${SITE_CONFIG.phone}`} className="text-xs text-gray-500 hover:text-[#0D5EA6] inline-flex items-center min-h-[44px]">{SITE_CONFIG.phone}</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#25D366]/10 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-[#0B2342]">WhatsApp</p>
                  <a href={SITE_CONFIG.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-[#0D5EA6]">
                    {SITE_CONFIG.whatsappDisplay}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#0B2342] to-[#0D5EA6] rounded-xl p-5 text-white">
            <h3 className="text-sm font-semibold mb-3">Why Contact Us?</h3>
            <ul className="space-y-2 text-xs text-gray-200">
              <li className="flex items-center gap-2">
                <span className="text-[#35C6D9]">✓</span> 230+ products in catalogue
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#35C6D9]">✓</span> Expert technical advice
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#35C6D9]">✓</span> Competitive pricing
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#35C6D9]">✓</span> Quick response time
              </li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2">
          <Suspense fallback={<div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400">Loading...</div>}>
            <ContactForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
