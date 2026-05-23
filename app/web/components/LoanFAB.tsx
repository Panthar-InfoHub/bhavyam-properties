'use client';

import { useState, useEffect } from 'react';
import { Landmark } from 'lucide-react';
import { usePathname } from 'next/navigation';
import ServiceRequestModal from './ServiceRequestModal';

export default function LoanFAB() {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Show only on the home page
    setIsVisible(pathname === '/');
  }, [pathname]);

  if (!isVisible) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-24 right-6 z-[90] group flex items-center gap-3 animate-in fade-in slide-in-from-top-10 duration-500 cursor-pointer focus:outline-none"
        aria-label="Apply for Property Loan"
      >
        {/* Tooltip */}
        <div className="bg-[#112743] text-white px-4 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap border border-white/10 backdrop-blur-md">
          Property Loan? Apply Now 🏦
        </div>

        {/* Button */}
        <div className="relative p-4 rounded-[1.5rem] bg-gradient-to-br from-[#00b48f] to-[#112743] text-white shadow-[0_20px_50px_rgba(0,180,143,0.35)] hover:shadow-[0_20px_50px_rgba(0,180,143,0.6)] hover:scale-115 active:scale-95 transition-all duration-300 border-2 border-white/20 flex items-center justify-center">
          <Landmark className="w-6 h-6 text-white" />
          
          {/* Notification / Pulse Dot */}
          <div className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-[#00ecbd] border-2 border-white rounded-full animate-bounce shadow-md shadow-emerald-500/50" />
          
          {/* Ping wave effect */}
          <div className="absolute inset-0 rounded-[1.5rem] border-2 border-[#00ecbd] animate-ping opacity-30 pointer-events-none" />
        </div>
      </button>

      {/* Loan Service Request Modal */}
      {isOpen && (
        <ServiceRequestModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          serviceType="Property Loan"
          color="bg-[#112743]"
        />
      )}
    </>
  );
}
