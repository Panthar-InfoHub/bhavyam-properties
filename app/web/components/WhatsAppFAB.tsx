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
    // Show on all main public pages
    const isPublicPage = pathname === '/' || pathname === '/about' || pathname?.startsWith('/properties') || pathname === '/membership' || pathname === '/terms-and-conditions' || pathname === '/privacy-policy';
    setIsVisible(isPublicPage);
  }, [pathname]);

  if (!isVisible) return null;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-3 right-3 z-[100] group flex items-center gap-2 animate-in fade-in slide-in-from-bottom-10 duration-500"
      aria-label="Contact us on WhatsApp"
    >
      {/* Tooltip */}
      <div className="bg-[#112743] text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-2xl opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap border border-white/10 backdrop-blur-md">
        Chat with us
      </div>

      {/* Button */}
      <div className="relative p-0 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all duration-300">
        <img src="/images/whatsapp.png" alt="WhatsApp" className="w-12 h-12 md:w-14 md:h-14 object-contain" />
        
        {/* Notification Dot */}
        <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border border-white rounded-full animate-bounce" />
      </div>
    </a>
  );
}
