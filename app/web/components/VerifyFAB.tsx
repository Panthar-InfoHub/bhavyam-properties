'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function VerifyFAB() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    const target = document.getElementById('verify-property-section');
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [pathname]);

  if (!isVisible) return null;

  return (
    <Link
      href="/verify-property"
      className="fixed bottom-8 left-8 z-[100] group flex items-center gap-3 animate-in fade-in slide-in-from-bottom-10 duration-500"
      aria-label="Get Your Property Verified"
    >
      {/* Button with Image */}
      <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,236,189,0.3)] hover:shadow-[0_20px_50px_rgba(0,236,189,0.5)] hover:scale-110 active:scale-95 transition-all duration-300 border-4 border-white bg-[#00ecbd] group">
        <img 
          src="/images/ChatGPT Image May 10, 2026, 05_29_58 PM.png" 
          alt="Verification" 
          className="w-full h-full object-cover"
        />
        
        {/* Verification Icon Overlay */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-full border border-white/30">
                <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-white fill-[#00ecbd]" />
            </div>
        </div>

        {/* Pulse Effect */}
        <div className="absolute inset-0 rounded-[2rem] border-2 border-[#00ecbd] animate-ping opacity-20 pointer-events-none" />
      </div>

      {/* Tooltip */}
      <div className="bg-[#112743] text-white px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap border border-white/10 backdrop-blur-md">
        Verify Your Property Now
      </div>
    </Link>
  );
}
