"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getCurrentUser, signOutUser } from '@/lib/auth';

interface NavbarProps {
  transparent?: boolean;
}

export default function Navbar({ transparent: propTransparent }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Auto-set transparent for homepage if not explicitly passed
  const transparent = propTransparent ?? (pathname === '/');

  // Handle Auth
  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, [pathname]);

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
    setIsProfileOpen(false);
    router.push('/');
  };

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
    <nav className={`w-full flex items-center justify-between px-6 md:px-12 py-4 fixed top-0 left-0 right-0 z-100 transition-all duration-500 ${
      isLight ? 'bg-transparent py-6' : 'bg-white/95 backdrop-blur-md shadow-xl py-4 border-b border-gray-100'
    }`}>
      
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className={`p-2 rounded-xl transition-all duration-300 ${isLight ? 'bg-white/10 backdrop-blur-md ring-1 ring-white/20' : 'bg-teal-50 ring-1 ring-teal-100'}`}>
          <svg className={`w-8 h-8 ${isLight ? 'text-white' : 'text-[#00b48f]'} transform group-hover:rotate-12 transition-transform`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3L2 12h3v8h14v-8h3L12 3zm4 15h-8v-6h8v6z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className={`text-2xl font-black leading-tight uppercase tracking-tighter ${isLight ? 'text-white' : 'text-gray-900'}`}>
            Bhavyam
          </span>
          <span className={`text-[0.6rem] font-black uppercase tracking-[0.4em] leading-none ${isLight ? 'text-[#00ecbd]' : 'text-[#00b48f]'}`}>
            Properties
          </span>
        </div>
      </Link>

      {/* Main Navigation (Desktop) */}
      <ul className={`hidden xl:flex gap-8 items-center text-[15px] font-medium ${
        isLight ? 'text-white' : 'text-gray-800'
      }`}>
        <li className="relative group">
          <Link href="/" className={`transition-colors ${pathname === '/' ? 'text-[#00b48f]' : 'hover:text-[#00b48f]'}`}>Home</Link>
        </li>
        <li>
          <Link href="/about" className={`transition-colors ${pathname === '/about' ? 'text-[#00b48f]' : 'hover:text-[#00b48f]'}`}>About</Link>
        </li>
        <li>
          <Link href="/properties" className={`transition-colors ${pathname === '/properties' ? 'text-[#00b48f]' : 'hover:text-[#00b48f]'}`}>All Properties</Link>
        </li>
        <li>
          <Link href="/user/apply-agent" className={`transition-colors ${pathname === '/user/apply-agent' ? 'text-[#00b48f]' : 'hover:text-[#00b48f]'}`}>Join Us</Link>
        </li>
        <li>
          <Link href="/terms-and-conditions" className={`transition-colors ${pathname === '/terms-and-conditions' ? 'text-[#00b48f]' : 'hover:text-[#00b48f]'}`}>Terms and Conditions</Link>
        </li>
      </ul>

      {/* Dynamic Actions Container */}
      <div className="flex items-center gap-4">
        
        {/* Heart (Wishlist) Icon */}
        <Link 
          href={user ? "/user/favorites" : "/login"} 
          className={`flex items-center justify-center relative w-10 h-10 rounded-full border border-[#00b48f] transition-all group ${
            isLight ? 'border-white/20 hover:bg-white/10' : 'hover:bg-teal-50'
          }`}
        >
          <svg className={`w-5 h-5 ${isLight ? 'text-white' : 'text-[#00b48f]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {/* Badge */}
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#00b48f] text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">0</span>
        </Link>

        {user ? (
          <div className="relative">
            {/* Profile Dropdown */}
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all border ${
                isLight ? 'border-white/20 hover:bg-white/10' : 'border-[#00b48f] hover:bg-teal-50'
              }`}
            >
              <svg className={`w-5 h-5 ${isLight ? 'text-white' : 'text-[#00b48f]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-300 z-[100]">
                <div className="px-6 py-4 border-b border-gray-50 mb-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Signed in as</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                </div>
                <Link 
                  href="/dashboard" 
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-6 py-4 text-sm font-bold text-gray-600 hover:bg-teal-50 hover:text-[#00b48f] transition-all"
                >
                  <span className="text-xl">👤</span> My Profile & Dashboard
                </Link>
                <div className="border-t border-gray-50 my-1"></div>
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-6 py-4 text-sm font-black text-red-500 hover:bg-red-50 transition-all text-left uppercase tracking-widest"
                >
                  <span className="text-xl">🚪</span> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className={`flex items-center justify-center w-10 h-10 rounded-full border transition-all ${
            isLight ? 'border-white/20 hover:bg-white/10' : 'border-[#00b48f] hover:bg-teal-50'
          }`}>
            <svg className={`w-5 h-5 ${isLight ? 'text-white' : 'text-[#00b48f]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>
        )}

        {/* Add Property Button (Always Visible) */}
        <Link href={user ? "/dashboard" : "/login"} className="flex items-center gap-2 bg-[#00b48f] hover:bg-[#00c69d] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all group shadow-md shadow-teal-500/20">
          <div className="w-5 h-5 bg-white text-[#00b48f] rounded-full flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="whitespace-nowrap">Add Property</span>
        </Link>
      </div>

    </nav>
  );
}
