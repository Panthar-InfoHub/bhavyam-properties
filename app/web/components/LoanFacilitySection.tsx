'use client';

import { useState } from 'react';
import LoanFacilityModal from '@/components/LoanFacilityModal';

export default function LoanFacilitySection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="py-12 px-4 md:px-8 bg-gradient-to-r from-[var(--color-emerald-heritage)] to-[#00579e]">
      <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 bg-white/10 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-white/20 shadow-2xl">
        <div className="text-white text-center md:text-left flex-1">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-sm font-bold tracking-widest uppercase mb-4 shadow-sm border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#00ffcc] animate-pulse"></span>
            Financial Assistance
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-sm">
            Need a Home Loan?
          </h2>
          <p className="text-lg md:text-xl text-white/80 font-medium max-w-xl">
            Get hassle-free loan facilities through our partnered top banks and NBFCs. Check your EMI and apply instantly!
          </p>
        </div>
        
        <div className="shrink-0">
          <button 
            onClick={() => setIsModalOpen(true)}
            suppressHydrationWarning
            className="group relative inline-flex items-center justify-center px-8 py-5 text-lg font-black tracking-widest text-white uppercase transition-all duration-300 ease-in-out bg-[#022039] rounded-full hover:bg-white hover:text-[#022039] shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_40px_rgba(255,255,255,0.3)] overflow-hidden"
          >
            <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
            <span className="relative flex items-center gap-2">
              Explore Loan Options
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </span>
          </button>
        </div>
      </div>

      <LoanFacilityModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
