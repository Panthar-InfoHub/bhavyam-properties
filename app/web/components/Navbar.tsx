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
      <ul className={`hidden xl:flex gap-10 items-center text-[0.75rem] font-black uppercase tracking-[0.15em] ${
        isLight ? 'text-white' : 'text-gray-600'
      }`}>
        <li className="relative group">
          <Link href="/" className="hover:text-teal-400 transition-colors">Home</Link>
          {pathname === '/' && <div className="absolute -bottom-2 left-0 w-full h-1 bg-teal-400 rounded-full" />}
        </li>
        <li><Link href="/properties?type=sell" className="hover:text-teal-400 transition-colors">Buy Property</Link></li>
        <li><Link href="/properties?type=rent" className="hover:text-teal-400 transition-colors">Rent Property</Link></li>
        <li><Link href="#" className="hover:text-teal-400 transition-colors">About Us</Link></li>
      </ul>

      {/* Dynamic Actions Container */}
      <div className="flex items-center gap-4">
        
        {user ? (
          <>
            {/* Logged In Icons: Heart (Wishlist) and Profile */}
            <Link 
              href="/user/favorites" 
              className={`p-3 rounded-2xl transition-all relative group ${
                isLight ? 'bg-white/10 text-white hover:bg-white/20 ring-1 ring-white/10' : 'bg-gray-50 text-gray-700 hover:bg-teal-50 hover:text-[#00b48f] border border-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`flex items-center gap-2 p-1.5 rounded-2xl transition-all border ${
                  isLight ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'
                }`}
              >
                <div className="w-10 h-10 bg-linear-to-br from-teal-400 to-[#00579e] rounded-xl flex items-center justify-center text-white font-black shadow-inner uppercase">
                  {user.profile?.first_name?.[0] || user.email?.[0]}
                </div>
                <svg className={`w-4 h-4 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
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
          </>
        ) : (
          <>
            {/* Logged Out Actions: Login and Add Property */}
            <Link href="/login" className={`hidden md:flex text-[0.7rem] font-black uppercase tracking-widest px-6 py-3 transition-colors ${
              isLight ? 'text-white hover:text-teal-300' : 'text-gray-700 hover:text-[#00b48f]'
            }`}>
              Login / Sign up
            </Link>

            <Link href="/login" className="flex items-center gap-3 bg-[#00b48f] hover:bg-teal-600 text-white px-8 py-4 rounded-2xl text-[0.7rem] font-black uppercase tracking-widest transition-all shadow-xl shadow-teal-500/20 active:scale-95 group">
              <svg className="w-4 h-4 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Property</span>
            </Link>
          </>
        )}
      </div>

    </nav>
  );
}
