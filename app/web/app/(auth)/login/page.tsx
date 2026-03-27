'use client';

import Image from 'next/image';
import GoogleButton from '@/components/auth/GoogleButton';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-white overflow-hidden">
      
      {/* Left Side: Visual & Quote (50%) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center p-12 xl:p-20 overflow-hidden bg-[#112743]">
        <Image
          src="/images/hero.png" 
          alt="Premium Architecture"
          fill
          className="object-cover opacity-60 grayscale"
        />
        <div className="absolute inset-0 bg-linear-to-r from-[#112743] via-[#112743]/60 to-transparent z-10"></div>
        
        {/* Content on Image - Centered vertically with sidebar */}
        <div className="relative z-20 max-w-lg lg:-mt-8">
          <div className="flex items-center gap-3 mb-8">
             <div className="w-12 h-1 bg-[#00ecbd] rounded-full"></div>
             <p className="text-[#00ecbd] font-black uppercase tracking-[0.3em] text-[10px]">Premium Lifestyle</p>
          </div>
          <h1 className="text-white text-5xl xl:text-6xl font-black leading-tight tracking-tighter mb-8">
            Experience the <span className="text-[#00ecbd]">Future</span> of Real Estate.
          </h1>
          <blockquote className="border-l-4 border-[#00ecbd] pl-6 py-2">
             <p className="text-gray-300 italic text-lg font-medium leading-relaxed">
               &ldquo;Quality is not an act, it is a habit. At Bhavyam, we define quality through transparency and trust.&rdquo;
             </p>
          </blockquote>
        </div>

        {/* Branding (Fixed bottom corner) */}
        <div className="absolute bottom-12 left-12 xl:left-20 z-20 flex items-center gap-3">
           <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
              <svg className="w-6 h-6 text-[#00ecbd]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3L2 12h3v8h14v-8h3L12 3zm4 15h-8v-6h8v6z" />
              </svg>
           </div>
           <span className="text-white font-black text-xl uppercase tracking-tighter">Bhavyam Properties</span>
        </div>
      </div>

      {/* Right Side: Sign In (50%) */}
      <div className="flex-1 lg:w-1/2 flex flex-col items-center justify-center p-8 md:p-16 lg:p-20 bg-[#fbfcfa] min-h-screen">
         <div className="w-full max-w-md animate-in fade-in slide-in-from-right-8 duration-700 lg:mt-12">
            
            {/* Header */}
            <div className="mb-12">
               <h2 className="text-4xl xl:text-5xl font-black text-gray-900 tracking-tighter mb-4 uppercase leading-none">
                 Welcome Back
               </h2>
               <p className="text-gray-500 font-medium leading-relaxed">
                 Sign in to access your dashboard, saved properties, and exclusive market insights.
               </p>
            </div>

            {/* Exclusive Google Sign In UI */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-50 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ecbd]/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-[#00ecbd]/10 transition-all"></div>
               
               <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8 text-center">
                 Secure Universal Access
               </p>

               <div className="space-y-6">
                 <GoogleButton />
                 
                 <p className="text-[11px] text-gray-400 text-center font-medium leading-relaxed px-4">
                    By continuing, you agree to Bhavyam Properties&apos; <Link href="/terms-and-conditions" className="text-[#00b48f] hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-[#00b48f] hover:underline">Privacy Policy</Link>.
                 </p>
               </div>

               <div className="mt-12 pt-8 border-t border-gray-50">
                  <p className="text-sm font-bold text-gray-900 text-center">
                    New to Bhavyam? <Link href="/properties" className="text-[#00b48f] hover:underline ml-1 uppercase tracking-widest text-xs">Explore Listings</Link>
                  </p>
               </div>
            </div>

            {/* Floating Trust Badge */}
            <div className="mt-12 flex items-center justify-center gap-6 opacity-30">
               <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z"/></svg>
                  <span className="text-[10px] font-black uppercase tracking-widest">Secure Auth</span>
               </div>
               <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
               <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.47 4.04-3.02 7.64-7 8.99V12H5V6.3l7-3.11v8.8z"/></svg>
                  <span className="text-[10px] font-black uppercase tracking-widest">Data Privacy</span>
               </div>
            </div>

         </div>
      </div>
    </main>
  );
}
