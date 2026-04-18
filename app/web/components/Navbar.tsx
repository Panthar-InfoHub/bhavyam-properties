"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getCurrentUser, signOutUser } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';

interface NavbarProps {
  transparent?: boolean;
}

export default function Navbar({ transparent: propTransparent }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  
  // Auto-set transparent for homepage if not explicitly passed
  const transparent = propTransparent ?? (pathname === '/');

  // Handle Auth & Wishlist Count
  useEffect(() => {
    const fetchAuthAndWishlist = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        // Initial Fetch
        const { count, error } = await supabase
          .from('favorites')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', currentUser.id);
        
        if (!error) setWishlistCount(count || 0);

        // Realtime Subscription for Wishlist
        const channel = supabase
          .channel('wishlist-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'favorites',
              filter: `user_id=eq.${currentUser.id}`,
            },
            async () => {
              // Re-fetch count on any change
              const { count: newCount } = await supabase
                .from('favorites')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', currentUser.id);
              setWishlistCount(newCount || 0);
            }
          )
          .subscribe();

        // Realtime Subscription for Profile (Credits/Subscription Wallet Updates)
        const profileChannel = supabase
          .channel('profile-changes')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'profiles',
              filter: `id=eq.${currentUser.id}`,
            },
            async (payload) => {
              // Refresh user profile so Navbar wallet reflects new credits instantly
              const freshUser = await getCurrentUser();
              if (freshUser) setUser(freshUser);
            }
          )
          .subscribe();

        // Custom Local Event Listener (Bulletproof Fallback)
        const handleWalletUpdate = async () => {
          const freshUser = await getCurrentUser();
          if (freshUser) setUser((prev: any) => ({ ...prev, profile: freshUser.profile }));
        };
        window.addEventListener('wallet-updated', handleWalletUpdate);

        return () => {
          supabase.removeChannel(channel);
          supabase.removeChannel(profileChannel);
          window.removeEventListener('wallet-updated', handleWalletUpdate);
        };
      } else {
        setWishlistCount(0);
      }
    };
    fetchAuthAndWishlist();
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
        <div className={`transition-all duration-500 bg-[var(--color-deep-navy)] rounded-2xl py-2 px-5 shadow-lg group-hover:shadow-[var(--color-emerald-heritage)]/20 group-hover:-translate-y-0.5 border border-white/5`}>
          <Image 
            src="/image.png" 
            alt="Bhavyam Properties" 
            width={180} 
            height={50} 
            className="h-9 w-auto object-contain brightness-110"
            priority
          />
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
          <Link href="/membership" className={`transition-colors ${pathname === '/membership' ? 'text-[#00b48f]' : 'hover:text-[#00b48f]'}`}>Membership</Link>
        </li>
        <li>
          <Link href="/user/apply-agent" className={`transition-colors ${pathname === '/user/apply-agent' ? 'text-[#00b48f]' : 'hover:text-[#00b48f]'}`}>Join Us</Link>
        </li>
        <li>
          <Link href="/terms-and-conditions" className={`transition-colors ${pathname === '/terms-and-conditions' ? 'text-[#00b48f]' : 'hover:text-[#00b48f]'}`}>Terms and Conditions</Link>
        </li>
      </ul>

      {/* Dynamic Actions Container */}
      <div className="flex items-center gap-2 md:gap-4">
        
        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`xl:hidden flex items-center justify-center w-10 h-10 rounded-full border transition-all ${
            isLight ? 'border-white/20 hover:bg-white/10' : 'border-[#00b48f] hover:bg-teal-50'
          }`}
        >
          <svg className={`w-5 h-5 ${isLight ? 'text-white' : 'text-[#00b48f]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        
        {/* Credits Display (New) */}
        {user && (
          <div className={`hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all ${
            isLight ? 'border-white/20 bg-white/10 text-white' : 'border-teal-100 bg-teal-50 text-teal-700'
          }`}>
             <span className="text-sm font-black tracking-tighter">{user.profile?.credits || 0}</span>
             <span className="text-[9px] font-black uppercase tracking-widest opacity-70">Credits</span>
             <Link href="/membership" className="ml-1 w-5 h-5 bg-[#00b48f] text-white rounded-full flex items-center justify-center text-xs font-bold hover:scale-110 active:scale-95 transition-all shadow-sm">
                +
             </Link>
          </div>
        )}
        
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
          {wishlistCount > 0 && (
            <span className={`absolute -top-1 -right-1 w-5 h-5 bg-[#00b48f] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 ${isLight ? 'border-[#112743]' : 'border-white'} animate-in zoom-in duration-300`}>
              {wishlistCount}
            </span>
          )}
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
                  <p className="text-sm font-bold text-gray-900 truncate mb-2">{user.email}</p>
                  <div className="flex items-center justify-between bg-teal-50 px-3 py-2 rounded-xl border border-teal-100">
                     <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Balance</span>
                     <span className="text-sm font-black text-teal-700">{user.profile?.credits || 0} Credits</span>
                  </div>
                </div>
                <Link 
                  href="/dashboard" 
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-6 py-4 text-sm font-bold text-gray-600 hover:bg-teal-50 hover:text-[#00b48f] transition-all"
                >
                  <span className="text-xl">👤</span> My Profile & Dashboard
                </Link>
                <Link 
                  href="/user/transactions" 
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-6 py-4 text-sm font-bold text-gray-600 hover:bg-teal-50 hover:text-[#00b48f] transition-all"
                >
                  <span className="text-xl">💸</span> My Transactions
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
        <Link href={user ? "/dashboard" : "/login"} className="hidden md:flex items-center gap-2 bg-[#00b48f] hover:bg-[#00c69d] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all group shadow-md shadow-teal-500/20">
          <div className="w-5 h-5 bg-white text-[#00b48f] rounded-full flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="whitespace-nowrap">Add Property</span>
        </Link>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-[72px] bg-white z-[90] xl:hidden overflow-y-auto animate-in slide-in-from-right duration-300">
          <div className="flex flex-col p-6 gap-6">
            <div className="flex flex-col gap-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Navigation</p>
              <nav className="flex flex-col">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className={`px-4 py-3 text-lg font-black uppercase tracking-tight ${pathname === '/' ? 'text-[#00b48f]' : 'text-gray-900'}`}>Home</Link>
                <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className={`px-4 py-3 text-lg font-black uppercase tracking-tight ${pathname === '/about' ? 'text-[#00b48f]' : 'text-gray-900'}`}>About</Link>
                <Link href="/properties" onClick={() => setIsMobileMenuOpen(false)} className={`px-4 py-3 text-lg font-black uppercase tracking-tight ${pathname === '/properties' ? 'text-[#00b48f]' : 'text-gray-900'}`}>Properties</Link>
                <Link href="/membership" onClick={() => setIsMobileMenuOpen(false)} className={`px-4 py-3 text-lg font-black uppercase tracking-tight ${pathname === '/membership' ? 'text-[#00b48f]' : 'text-gray-900'}`}>Membership</Link>
                <Link href="/user/apply-agent" onClick={() => setIsMobileMenuOpen(false)} className={`px-4 py-3 text-lg font-black uppercase tracking-tight ${pathname === '/user/apply-agent' ? 'text-[#00b48f]' : 'text-gray-900'}`}>Join Us</Link>
              </nav>
            </div>

            <div className="border-t border-gray-100 pt-6 flex flex-col gap-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Quick Actions</p>
              <Link href={user ? "/dashboard" : "/login"} onClick={() => setIsMobileMenuOpen(false)} className="mx-4 flex items-center justify-center gap-2 bg-[#00b48f] text-white p-4 rounded-2xl font-black uppercase tracking-widest text-xs">
                 Post New Property
              </Link>
            </div>
          </div>
        </div>
      )}

    </nav>
  );
}
