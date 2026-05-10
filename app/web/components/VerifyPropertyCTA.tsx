'use client';

import Link from 'next/link';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function VerifyPropertyCTA() {
  return (
    <section id="verify-property-section" className="py-20 px-4 md:px-8 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        <div className="bg-[#112743] rounded-[3rem] p-8 md:p-16 flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden shadow-2xl">
          
          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
            <svg viewBox="0 0 400 400" className="w-full h-full text-white">
              <defs>
                <pattern id="grid-cta" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-cta)" />
            </svg>
          </div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#00ecbd]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Left Content */}
          <div className="relative z-10 flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-[#00ecbd] text-xs font-black tracking-widest uppercase mb-6 border border-white/10 backdrop-blur-md">
              <ShieldCheck size={14} className="animate-pulse" />
              Trust & Safety
            </div>
            
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tighter leading-tight">
              Get Your Property <br />
              <span className="text-[#00ecbd]">Verified</span> With Us
            </h2>
            
            <p className="text-gray-300 text-base md:text-lg font-medium max-w-xl mb-10 leading-relaxed">
              Boost your property's visibility and build instant trust with potential buyers or tenants. Our rigorous verification process ensures authenticity and speed.
            </p>

            <Link 
              href="/verify-property" 
              className="inline-flex items-center gap-3 bg-[#00ecbd] text-[#112743] px-8 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl shadow-[#00ecbd]/20"
            >
              Start Verification
              <ArrowRight size={20} />
            </Link>
          </div>

          {/* Right Image/Graphic */}
          <div className="relative z-10 w-full lg:w-[45%] flex justify-center">
            <div className="relative">
              {/* Main Image */}
              <div className="w-[280px] md:w-[400px] h-[200px] md:h-[400px] aspect-[4/5] bg-gray-800 rounded-[2.5rem] overflow-hidden border-4 border-white/10 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                <img 
                  src="/images/ChatGPT Image May 10, 2026, 05_29_58 PM.png" 
                  alt="Verified Property" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#112743] via-transparent to-transparent opacity-60" />
              </div>
              
              {/* Floating Badge */}
              {/* <div className="absolute -top-6 -right-6 md:-top-10 md:-right-10 bg-white p-4 md:p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-2 animate-bounce duration-1000">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-[#00ecbd] rounded-full flex items-center justify-center text-[#112743]">
                  <ShieldCheck size={32} />
                </div>
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-[#112743]">Verified</span>
              </div> */}

              {/* Floating Stat Card */}
              <div className="absolute -bottom-6 -left-6 md:-bottom-8 md:-left-8 bg-white p-4 md:p-6 rounded-3xl shadow-2xl border border-gray-100 hidden md:block">
                <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Trust Score</div>
                <div className="text-2xl font-black text-[#112743]">100% Secure</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
