import Hero from '@/components/Hero';
import LatestProperties from '@/components/LatestProperties';
import WhyChooseUs from '@/components/WhyChooseUs';
import ServicesSection from '@/components/ServicesSection';
import MissionVisionSection from '@/components/MissionVisionSection';
import ExpertSolutionsSection from '@/components/ExpertSolutionsSection';
import VideoTourSection from '@/components/VideoTourSection';
import CounterSection from '@/components/CounterSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import BlogSection from '@/components/BlogSection';
import AgentCTASection from '@/components/AgentCTASection';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      <Hero />
      
      <LatestProperties />

      <WhyChooseUs />

      <ServicesSection />
      
      <MissionVisionSection />
      
      <ExpertSolutionsSection />

      <VideoTourSection />

      <TestimonialsSection />

      <BlogSection />

      <CounterSection />

      <AgentCTASection />

      {/* Subsequent sections could go here */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-black text-gray-800 mb-4">Why Choose Bhavyam?</h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            We simplify the complex process of buying, selling, or renting properties with our verified agent network and secure submission system.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16 text-left">
             <div className="p-8 rounded-3xl bg-[#fbfcfa] border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
                <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 text-3xl mb-6">🏘️</div>
                <h4 className="text-xl font-bold text-gray-800 mb-3">Verified Listings</h4>
                <p className="text-gray-500 text-sm leading-relaxed">Every property undergoes a strict 24-48 hour manual verification by our regional audit team before going live.</p>
             </div>
             <div className="p-8 rounded-3xl bg-[#fbfcfa] border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 text-3xl mb-6">👮</div>
                <h4 className="text-xl font-bold text-gray-800 mb-3">Expert Agents</h4>
                <p className="text-gray-500 text-sm leading-relaxed">Connect with BHA-certified agents who hold deep local market knowledge and legal expertise.</p>
             </div>
             <div className="p-8 rounded-3xl bg-[#fbfcfa] border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 text-3xl mb-6">💳</div>
                <h4 className="text-xl font-bold text-gray-800 mb-3">Secure Payments</h4>
                <p className="text-gray-500 text-sm leading-relaxed">Integrated escrow and secure payment channels ensure your transactions are protected from end to end.</p>
             </div>
          </div>
          
          <div className="mt-20">
             <Link href="/properties" className="bg-[#00579e] hover:bg-blue-900 text-white px-10 py-4 rounded-full font-bold transition-all shadow-lg active:scale-95">
                Explore All Properties
             </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
