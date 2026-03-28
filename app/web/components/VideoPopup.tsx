'use client';

import { useState } from 'react';

export default function VideoPopup({ 
  videoId = "4jnzf1yj48M", // Generic real estate example video or default
  children,
  className = ""
}: { 
  videoId?: string; 
  children: React.ReactNode;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div onClick={() => setIsOpen(true)} className={`cursor-pointer ${className}`}>
        {children}
      </div>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
             <button 
               onClick={() => setIsOpen(false)}
               className="absolute top-4 right-4 z-10 w-12 h-12 bg-black/50 hover:bg-red-600 rounded-full text-white flex items-center justify-center transition-colors border border-white/20"
             >
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
             <iframe 
               src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
               className="w-full h-full border-0 absolute inset-0"
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
               allowFullScreen
             ></iframe>
          </div>
        </div>
      )}
    </>
  );
}
