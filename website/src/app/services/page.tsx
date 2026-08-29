import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Pool construction, renovation, maintenance, water treatment, equipment and accessories services.',
};

const services = [
  {
    title: 'Pool Construction',
    description: 'Complete swimming pool construction services from design to completion. Residential and commercial projects.',
  },
  {
    title: 'Pool Renovation',
    description: 'Pool renovation and refurbishment services. Update your existing pool with modern equipment and finishes.',
  },
  {
    title: 'Pool Maintenance',
    description: 'Regular pool maintenance services to keep your pool clean, safe, and running efficiently.',
  },
  {
    title: 'Water Treatment',
    description: 'Professional water treatment solutions including chemical balancing, chlorination systems, and UV sterilization.',
  },
  {
    title: 'Pool Equipment',
    description: 'Supply and installation of pumps, filters, lights, and all essential pool equipment from our comprehensive catalogue.',
  },
  {
    title: 'Pool Accessories',
    description: 'Complete range of pool accessories including cleaning tools, fittings, and water features.',
  },
];

export default function ServicesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-3xl mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0B2342] mb-4">Our Services</h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          From pool construction to ongoing maintenance, we provide end-to-end solutions for all your
          swimming pool needs.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {services.map((service) => (
          <div
            key={service.title}
            className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >

            <h2 className="text-base font-semibold text-[#0B2342] mb-2">{service.title}</h2>
            <p className="text-xs text-gray-500 leading-relaxed">{service.description}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <section className="bg-gray-50 rounded-xl p-6 sm:p-8 text-center">
        <h2 className="text-lg font-bold text-[#0B2342] mb-3">Need a Custom Solution?</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-xl mx-auto">
          Contact us to discuss your specific requirements. Our team will help you find the right
          products and services for your project.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/contact"
            className="px-6 py-2.5 text-sm font-semibold bg-[#0D5EA6] text-white rounded-lg hover:bg-[#0B2342] transition-colors"
          >
            Contact Us
          </Link>
          <Link
            href="/products"
            className="px-6 py-2.5 text-sm font-semibold border border-[#0D5EA6] text-[#0D5EA6] rounded-lg hover:bg-[#0D5EA6] hover:text-white transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </section>
    </div>
  );
}
