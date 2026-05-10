'use client';

import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function WhatsAppFAB() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  
  const phoneNumber = '919451567034';
  const initialMessage = encodeURIComponent('I want help related to properties');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${initialMessage}`;

  useEffect(() => {
    // Show fixed on landing and about pages
    const isTargetPage = pathname === '/' || pathname === '/about';
    setIsVisible(isTargetPage);
  }, [pathname]);

  if (!isVisible) return null;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[100] group flex items-center gap-3 animate-in fade-in slide-in-from-bottom-10 duration-500"
      aria-label="Contact us on WhatsApp"
    >
      {/* Tooltip */}
      <div className="bg-[#112743] text-white px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap border border-white/10 backdrop-blur-md">
        Need Help? Chat with us
      </div>

      {/* Button */}
      <div className="relative p-0 rounded-[1.5rem] shadow-[0_20px_50px_rgba(37,211,102,0.3)] hover:shadow-[0_20px_50px_rgba(37,211,102,0.5)] hover:scale-110 active:scale-95 transition-all duration-300">
        <img src="/images/whatsapp.png" alt="WhatsApp" className="w-16 h-16 object-contain" />
        
        {/* Notification Dot */}
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full animate-bounce" />
      </div>
    </a>
  );
}
