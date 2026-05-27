'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function VerifyFAB() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Show on all main public pages
    const isPublicPage = pathname === '/' || pathname === '/about' || pathname?.startsWith('/properties') || pathname === '/membership' || pathname === '/terms-and-conditions' || pathname === '/privacy-policy';
    setIsVisible(isPublicPage);
  }, [pathname]);

  if (!isVisible) return null;

  return (
    <Link
      href="/verify-property"
      className="fixed top-32 right-2.5 z-[90] w-[125px] md:w-[145px] justify-center group flex items-center gap-1.5 bg-[#00ecbd] hover:bg-white text-[#112743] py-2 md:py-2.5 rounded-full font-black text-[9px] md:text-[10px] uppercase tracking-wider shadow-lg border-2 border-white hover:scale-105 active:scale-95 transition-all duration-300 animate-in fade-in slide-in-from-top-10 duration-500 cursor-pointer focus:outline-none"
      aria-label="Get Your Property Verified"
    >
      <ShieldCheck className="w-4 h-4 md:w-4.5 md:h-4.5 animate-pulse text-[#112743] fill-none" />
      <span className="whitespace-nowrap font-black">Verify Property</span>
    </Link>
  );
}
