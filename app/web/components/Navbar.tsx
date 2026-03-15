'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface NavbarProps {
  transparent?: boolean;
}

export default function Navbar({ transparent: propTransparent }: NavbarProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Auto-set transparent for homepage if not explicitly passed
  const transparent = propTransparent ?? (pathname === '/');

  // Handle scroll for changing transparent navbar to solid
  useEffect(() => {
    if (!transparent) return;
    
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [transparent]);

  // If transparent but not yet scrolled, use white text. Otherwise use theme colors.
  const isLight = transparent && !isScrolled;

  return (
    <nav className={`w-full flex items-center justify-between px-8 py-4 fixed top-0 z-50 transition-all duration-300 ${
      isLight ? 'bg-transparent' : 'bg-white shadow-md'
    }`}>
      
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-2 group">
        <div className={`p-1.5 rounded-lg ${isLight ? 'bg-white/10 backdrop-blur-sm' : 'bg-transparent'}`}>
          <svg className={`w-9 h-9 ${isLight ? 'text-white' : 'text-[#00b48f]'} transform group-hover:scale-105 transition-transform`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3L2 12h3v8h14v-8h3L12 3zm4 15h-8v-6h8v6z" />
            <path d="M11 13h2v4h-2z" fill={isLight ? '#00b48f' : 'white'} />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className={`text-2xl font-black leading-none uppercase tracking-tighter ${isLight ? 'text-white' : 'text-[#00b48f]'}`}>
            Bhavyam
          </span>
          <span className={`text-[0.6rem] font-bold uppercase tracking-[0.25em] leading-tight ${isLight ? 'text-white/80' : 'text-gray-500'}`}>
            Properties
          </span>
        </div>
      </Link>

      {/* Center Links */}
      <ul className={`hidden lg:flex gap-8 items-center text-sm font-bold uppercase tracking-wide transition-colors ${
        isLight ? 'text-white' : 'text-gray-700'
      }`}>
        <li className="relative group">
          <Link href="/" className="hover:text-teal-400 transition-colors">Home</Link>
          {pathname === '/' && <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-teal-400" />}
        </li>
        <li><Link href="/about" className="hover:text-teal-400 transition-colors">About</Link></li>
        <li><Link href="/properties" className="hover:text-teal-400 transition-colors">All Properties</Link></li>
        <li><Link href="/join" className="hover:text-teal-400 transition-colors">Join Us</Link></li>
        <li><Link href="/terms" className="hover:text-teal-400 transition-colors">Terms and Conditions</Link></li>
      </ul>

      {/* Right Side Actions */}
      <div className="flex items-center gap-5">
        <button className={`relative p-2.5 rounded-full border transition-all ${
          isLight ? 'border-white/30 text-white hover:bg-white/10' : 'border-gray-200 text-[#00b48f] hover:bg-teal-50'
        }`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="absolute -top-1 -right-1 bg-[#00b48f] text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white">
            0
          </span>
        </button>

        <Link href="/login" className={`p-2.5 rounded-full border transition-all ${
          isLight ? 'border-white/30 text-white hover:bg-white/10' : 'border-gray-200 text-[#00b48f] hover:bg-teal-50'
        }`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </Link>

        <Link href="/submit-property" className="flex items-center gap-2 bg-[#00b48f] hover:bg-teal-600 text-white px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ml-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Property
        </Link>
      </div>

    </nav>
  );
}
