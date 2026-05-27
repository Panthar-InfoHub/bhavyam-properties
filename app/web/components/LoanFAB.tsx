'use client';

import { useState, useEffect } from 'react';
import { Landmark } from 'lucide-react';
import { usePathname } from 'next/navigation';
import LoanFacilityModal from '@/components/LoanFacilityModal';

export default function LoanFAB() {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Show on all main public pages
    const isPublicPage = pathname === '/' || pathname === '/about' || pathname?.startsWith('/properties') || pathname === '/membership' || pathname === '/terms-and-conditions' || pathname === '/privacy-policy';
    setIsVisible(isPublicPage);
  }, [pathname]);

  if (!isVisible) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-[88px] md:top-[96px] right-4 md:right-[14px] z-[90] w-[125px] md:w-[145px] justify-center group flex items-center gap-1.5 bg-gradient-to-r from-[#FFB000] to-[#E29500] hover:from-[#E29500] hover:to-[#C68200] text-white py-2 md:py-2.5 rounded-full font-black text-[9px] md:text-[10px] uppercase tracking-wider shadow-lg shadow-[#FFB000]/20 border-2 border-white hover:scale-105 active:scale-95 transition-all duration-300 animate-in fade-in slide-in-from-top-10 duration-500 cursor-pointer focus:outline-none"
        aria-label="Apply for Property Loan"
      >
        <Landmark className="w-4 h-4 md:w-4.5 md:h-4.5 text-white animate-pulse" />
        <span className="whitespace-nowrap font-black">Home Loan</span>
      </button>

      {/* Loan Facility Modal */}
      <LoanFacilityModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
