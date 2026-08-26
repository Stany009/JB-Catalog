import type { Metadata } from 'next';
import { getAllProducts, getAllCategories } from '@/lib/products';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about JB Pools & Accessories - complete swimming pool solutions for residential, commercial, hotel and resort pools.',
};

export default function AboutPage() {
  const totalProducts = getAllProducts().length;
  const totalCategories = getAllCategories().length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="max-w-3xl mb-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0B2342] mb-4">About JB Pools &amp; Accessories</h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          Complete swimming pool solutions — equipment, accessories, water treatment and maintenance
          for residential, commercial, hotel and resort pools.
        </p>
      </div>

      {/* Values */}
      <section className="mb-12">
        <h2 className="text-lg font-bold text-[#0B2342] mb-6">Our Core Values</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {['Quality', 'Excellence', 'Customer Satisfaction', 'Innovation', 'Integrity', 'Sustainability'].map((value) => (
            <div key={value} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <div className="text-2xl mb-2">
                {value === 'Quality' && '⭐'}
                {value === 'Excellence' && '🏆'}
                {value === 'Customer Satisfaction' && '😊'}
                {value === 'Innovation' && '💡'}
                {value === 'Integrity' && '🤝'}
                {value === 'Sustainability' && '🌿'}
              </div>
              <p className="text-xs font-semibold text-[#0B2342]">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Content */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-[#0B2342] mb-4">Who We Are</h2>
          <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
            <p>
              JB Pools &amp; Accessories is a complete swimming pool solutions provider, serving the pool
              construction, equipment, accessories, maintenance and water treatment industry.
            </p>
            <p>
              Our comprehensive product catalogue spans {totalCategories} categories and over {totalProducts} products, sourced from
              leading manufacturers and verified against official catalogue documentation.
            </p>
            <p>
              We serve a wide range of customers including homeowners, villa owners, hotels, resorts,
              architects, builders, commercial properties, schools, pool contractors and pool maintenance
              companies.
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-[#0B2342] mb-4">Our Departments</h2>
          <div className="space-y-3">
            {[
              { name: 'Research & Development', desc: 'Innovation in pool technology and solutions' },
              { name: 'Production', desc: 'Manufacturing quality pool equipment' },
              { name: 'Quality Control', desc: 'Ensuring every product meets standards' },
              { name: 'Customer Support', desc: 'Dedicated assistance for all enquiries' },
              { name: 'Sales & Marketing', desc: 'Connecting products with customers' },
              { name: 'Logistics', desc: 'Reliable delivery and distribution' },
            ].map((dept) => (
              <div key={dept.name} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#35C6D9] mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[#0B2342]">{dept.name}</p>
                  <p className="text-xs text-gray-500">{dept.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry */}
      <section className="bg-[#0B2342] rounded-xl p-6 sm:p-8 text-white">
        <h2 className="text-lg font-bold mb-4">Industries We Serve</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            'Homeowners',
            'Villas',
            'Hotels',
            'Resorts',
            'Architects',
            'Builders',
            'Commercial Properties',
            'Schools',
            'Pool Contractors',
            'Pool Maintenance Companies',
          ].map((industry) => (
            <div key={industry} className="bg-white/10 rounded-lg px-3 py-2 text-xs font-medium">
              {industry}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
