'use client';

import { useState, useEffect, useRef } from 'react';

function AnimatedCounter({ endValue, suffix }: { endValue: number, suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let start = 0;
          const duration = 2000; // 2 seconds
          const stepTime = Math.abs(Math.floor(duration / endValue));
          
          const timer = setInterval(() => {
            start += 1;
            setCount(start);
            if (start >= endValue) {
              clearInterval(timer);
            }
          }, stepTime);
          
          // Only animate once
          if (ref.current) {
            observer.disconnect();
          }
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [endValue]);

  return (
    <span ref={ref} className="flex items-baseline font-black">
      {count}{suffix}
    </span>
  );
}

export default function CounterSection() {
  const stats = [
    { value: 80, suffix: '%', label: 'Completed Property' },
    { value: 27, suffix: '%', label: 'Property Taxes' },
    { value: 99, suffix: '%', label: 'Satisfied Customers' },
    { value: 50, suffix: '%', label: 'Home ownership' }
  ];

  return (
    <section className="relative w-full bg-[#112743] pt-16 pb-0 overflow-hidden mt-12 border-t border-[#1e3a5a]">
      
      {/* Background City Skyline Graphic */}
      <div 
         className="absolute bottom-0 left-0 w-full h-full opacity-60 bg-repeat-x bg-bottom z-0 pointer-events-none blend-luminosity"
         style={{ 
           backgroundImage: "url('/images/counter-bg-2.webp')",
           backgroundSize: '1000px auto'
         }}
      ></div>

      <div className="max-w-7xl mx-auto relative z-10 px-4 md:px-8 pb-24 md:pb-28">
        
        {/* Header */}
        <div className="text-center mb-16 relative">
           {/* Cursive Watermark */}
           <div 
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[70px] md:text-[100px] leading-none font-black text-white/5 select-none z-[-1] pointer-events-none tracking-widest whitespace-nowrap" 
             style={{ fontFamily: "'Brush Script MT', 'Comic Sans MS', cursive" }}
           >
             Numbers
           </div>
           
           <h2 className="text-[28px] md:text-[34px] font-black text-white tracking-tight mb-2">
             Real Estate by the Numbers
           </h2>
           <p className="text-gray-300 font-medium text-[13px] md:text-[14px]">
             In 2024 things look like this percentage
           </p>
        </div>

        {/* Counter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 justify-items-center">
           {stats.map((stat, idx) => (
             <div key={idx} className="flex flex-col items-center group relative">
                
                {/* Glowing Concentric Rings Effect behind the circle */}
                <div className="absolute inset-0 bg-white/5 rounded-full blur-[30px] scale-150 group-hover:bg-white/10 transition-all duration-500"></div>

                {/* Main Circle */}
                <div className="relative w-[160px] h-[160px] md:w-[170px] md:h-[170px] rounded-full flex items-center justify-center bg-transparent border-[5px] border-white/10 group-hover:border-[#00c194] transition-colors duration-500 shadow-[0_0_20px_rgba(0,0,0,0.25)]">
                   {/* Inner ring gradient/glow */}
                   <div className="absolute inset-1.5 rounded-full bg-linear-to-b from-white/10 to-transparent"></div>
                   
                   <div className="text-[38px] md:text-[44px] text-white drop-shadow-md relative z-10 flex">
                      <AnimatedCounter endValue={stat.value} suffix={stat.suffix} />
                   </div>
                </div>

                <p className="mt-6 text-white font-bold text-[14px] md:text-[15px] tracking-wide relative z-10 group-hover:text-[#00c194] transition-colors">
                  {stat.label}
                </p>
             </div>
           ))}
        </div>

      </div>
    </section>
  );
}
