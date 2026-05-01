'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import VideoPopup from './VideoPopup';
import { getCurrentUser } from '@/lib/auth';

export default function VideoTourSection() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  return (
    <section className="relative w-full h-[750px] flex items-center justify-start overflow-hidden group">

      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 z-0 w-full h-full object-cover brightness-[0.7] transition-transform duration-[2000ms] group-hover:scale-105"
      >
        <source
          src="https://eyhzfduixvzlgrmaahry.supabase.co/storage/v1/object/public/property-media/82f3f4e7-103c-47ab-9ca9-7ce81a81be67/bathrooms/WhatsApp%20Video%202026-04-30%20at%2023.04.45.mp4"
          type="video/mp4"
        />
      </video>

      {/* Background Image Overlay Gradient */}
      <div className="absolute inset-0 z-[5] bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none" />

      {/* Background Text Overlay */}
      <div 
         className="absolute inset-0 z-10 flex items-center justify-center font-black text-white/5 select-none pointer-events-none tracking-tight text-[100px] md:text-[200px] opacity-20 uppercase" 
      >
         Property For All
      </div>

      {/* Content Box */}
      <div className="relative z-20 max-w-7xl mx-auto w-full px-6 md:px-12">
         <div className="max-w-3xl animate-in slide-in-from-left duration-1000">
            
            <p className="text-[var(--color-emerald-mint)] font-black text-xs md:text-sm tracking-[0.3em] uppercase mb-6 flex items-center gap-3">
               <span className="w-8 h-[2px] bg-[var(--color-emerald-mint)]"></span>
               LET'S TAKE A TOUR
            </p>
            
            <h2 className="text-5xl md:text-[85px] leading-[0.95] font-black text-white tracking-[-0.05em] mb-12 drop-shadow-2xl">
               <br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40"></span>
            </h2>
            
            <div className="flex flex-wrap items-center gap-6">
              {/* Join With Us Button */}
              <Link 
                href={user ? "/properties" : "/login"}
                className="bg-[#3a372e]/90 hover:bg-[#4a473e] text-white px-12 py-5 rounded-full text-lg font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl border border-white/10 backdrop-blur-md"
              >
                Check Out Properties
              </Link>

              {/* Play Button */}
              <VideoPopup videoId="4jnzf1yj48M" className="group">
                 <div className="w-[70px] h-[70px] rounded-full bg-[#3a372e]/90 hover:bg-[#4a473e] flex items-center justify-center transition-all hover:scale-110 shadow-2xl border border-white/10 backdrop-blur-md">
                    <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                 </div>
              </VideoPopup>
            </div>
            
         </div>
      </div>
    </section>
  );
}
