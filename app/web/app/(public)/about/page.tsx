import Image from 'next/image';
import Link from 'next/link';
import CounterSection from '@/components/CounterSection';
import ExpertSolutionsSection from '@/components/ExpertSolutionsSection';
import AboutMeetSection from '@/components/AboutMeetSection';
import ProblemsSection from '@/components/ProblemsSection';

export default function AboutPage() {
  return (
    <main className="bg-[#fbfcfa] min-h-screen">
      
      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6 md:px-12 bg-[#112743] overflow-hidden group">
         <div className="absolute inset-0 z-0 opacity-40">
            <Image 
              src="/images/hero.png" 
              alt="Background" 
              fill 
              className="object-cover grayscale"
            />
         </div>
         <div className="absolute inset-0 bg-linear-to-b from-transparent to-[#112743] z-0"></div>
         
         <div className="max-w-7xl mx-auto relative z-10 text-center">
            <h1 className="text-white text-5xl md:text-7xl font-black tracking-tighter mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
               Your Trusted <span className="text-[#00ecbd]">Real Estate</span> Partner
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-10 duration-1000">
               At Bhavyam Properties, we are committed to turning your real estate dreams into reality through integrity, innovation, and customer-centric service.
            </p>
         </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 px-6 md:px-12 relative overflow-hidden">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
            <div className="bg-white p-12 rounded-[2.5rem] shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 group">
               <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 text-3xl mb-8 group-hover:scale-110 transition-transform">🎯</div>
               <h2 className="text-3xl font-black text-gray-800 mb-6 tracking-tight">Our Mission</h2>
               <p className="text-gray-500 text-lg leading-relaxed font-medium">
                  To redefine real estate experiences through unparalleled service, expert guidance, and personalized solutions.
               </p>
            </div>
            <div className="bg-white p-12 rounded-[2.5rem] shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 group">
               <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-3xl mb-8 group-hover:scale-110 transition-transform">👁️</div>
               <h2 className="text-3xl font-black text-gray-800 mb-6 tracking-tight">Our Vision</h2>
               <p className="text-gray-500 text-lg leading-relaxed font-medium">
                  To be a trusted name in real estate, known for quality, transparency, and strong customer relationships.
               </p>
            </div>
         </div>
      </section>

      {/* Meet the Team/Values Section (from our reference) */}
      <AboutMeetSection />

      {/* Problem Solver Section (The Core of Bhavyam) */}
      <ProblemsSection />

      {/* Statistics Section Integration */}
      <CounterSection />

      {/* Services Integration */}
      <div className="bg-white pt-12">
        <ExpertSolutionsSection />
      </div>

      {/* Action CTA */}
      <section className="py-24 px-6 md:px-12 text-center bg-white pb-32">
         <div className="max-w-3xl mx-auto bg-linear-to-r from-[#112743] to-[#1e3a5a] p-12 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ecbd]/10 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:bg-[#00ecbd]/20 transition-all"></div>
            <h2 className="text-white text-3xl md:text-4xl font-black tracking-tight mb-8 relative z-10">
               Ready to experience <br/> real estate with trust?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
               <Link href="/properties" className="bg-[#00ecbd] hover:bg-[#00d0a5] text-[#112743] px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95">
                  Browse Properties
               </Link>
               <Link href="/login" className="bg-transparent border border-white/20 hover:bg-white/10 text-white px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all active:scale-95">
                  Become an Agent
               </Link>
            </div>
         </div>
      </section>
    </main>
  );
}
