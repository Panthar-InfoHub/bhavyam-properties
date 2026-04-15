'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface PremiumLoaderProps {
  messages?: string[];
  duration?: number;
}

export default function PremiumLoader({ 
  messages = ["Preparing your experience", "Fetching details", "Almost ready"], 
  duration = 2000 
}: PremiumLoaderProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (messages.length <= 1) return;

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % messages.length);
        setFade(true);
      }, 500);
    }, duration);

    return () => clearInterval(interval);
  }, [messages, duration]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0f18] overflow-hidden">
      
      {/* Animated Background Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00579e]/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
      
      <div className="relative flex flex-col items-center max-w-sm w-full px-10 z-10">
        
        {/* Logo Container with Sophisticated Glow */}
        <div className="relative w-48 h-48 mb-16">
          {/* Multi-layered Glow */}
          <div className="absolute inset-0 bg-teal-400/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute inset-4 bg-teal-400/10 rounded-full blur-2xl animate-pulse delay-300"></div>
          
          {/* Main Logo Image with breathing effect */}
          <div className="relative w-full h-full flex items-center justify-center animate-breathing">
             <Image 
               src="/image.png" 
               alt="Bhavyam Properties" 
               width={180} 
               height={100} 
               className="w-full h-auto object-contain brightness-0 invert opacity-90"
             />
          </div>
          
          {/* Rotating Sophisticated Rings */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle 
              cx="96" cy="96" r="80" 
              fill="none" 
              stroke="white" 
              strokeWidth="1" 
              strokeOpacity="0.05"
            />
            <circle 
              cx="96" cy="96" r="80" 
              fill="none" 
              stroke="#00ecbd" 
              strokeWidth="2" 
              strokeDasharray="10 490"
              strokeLinecap="round"
              className="animate-spin-slow"
            />
            <circle 
              cx="96" cy="96" r="70" 
              fill="none" 
              stroke="#00ecbd" 
              strokeWidth="1" 
              strokeDasharray="5 435"
              strokeLinecap="round"
              strokeOpacity="0.3"
              className="animate-spin-reverse"
            />
          </svg>
        </div>

        {/* Text Area with Smooth Fading */}
        <div className="text-center h-12 flex flex-col justify-center">
           <div className={`transition-all duration-500 transform ${fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.6em] text-teal-400/60 mb-2">Systems Status</p>
              <h2 className="text-sm font-black text-white uppercase tracking-[0.3em] whitespace-nowrap">
                {messages[messageIndex]}
              </h2>
           </div>
        </div>

        {/* Premium Progress Visualizer */}
        <div className="mt-12 w-full flex items-center gap-4">
           <span className="text-[10px] font-black text-zinc-600 font-mono">0{messageIndex + 1}</span>
           <div className="flex-1 h-[2px] bg-zinc-800 rounded-full overflow-hidden relative">
              <div 
                className="absolute inset-y-0 left-0 bg-linear-to-r from-transparent via-teal-400 to-transparent w-[30%] animate-scanning"
              ></div>
           </div>
           <span className="text-[10px] font-black text-zinc-600 font-mono">0{messages.length}</span>
        </div>

        {/* Footer Detail */}
        <div className="mt-16 flex items-center gap-2 opacity-20">
           <div className="w-1 h-1 bg-white rounded-full animate-ping"></div>
           <p className="text-[8px] font-black text-white uppercase tracking-[0.5em]">
             Authorized Access Only
           </p>
        </div>

      </div>
      
      <style jsx>{`
        @keyframes breathing {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes scanning {
          0% { left: -30%; }
          100% { left: 100%; }
        }
        .animate-breathing {
          animation: breathing 4s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
          transform-origin: center;
        }
        .animate-spin-reverse {
          animation: spin-reverse 12s linear infinite;
          transform-origin: center;
        }
        .animate-scanning {
          animation: scanning 1.5s infinite linear;
        }
      `}</style>
    </div>
  );
}
