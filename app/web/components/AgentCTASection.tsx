export default function AgentCTASection() {
  return (
    <section className="bg-white py-12 px-4 md:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto relative bg-[#eaf7f4] rounded-xl flex flex-col md:flex-row items-center justify-between shadow-sm">
        
        {/* Faint Background Buildings */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden rounded-xl">
           <img 
             src="/images/video-bg-2.svg" 
             alt="City Background"
             className="w-full h-full object-cover"
           />
        </div>

        {/* Left Graphics (Man + House + Blob) */}
        <div className="relative w-full md:w-[40%] h-[200px] md:h-auto flex justify-center md:justify-start items-end z-10 pt-8 pl-0 md:pl-16">
           {/* Abstract Green Blob behind him */}
           <div 
             className="absolute bottom-0 left-1/2 md:left-24 -translate-x-1/2 md:translate-x-0 w-[180px] h-[220px] bg-[#00c194] rounded-t-full rounded-bl-3xl z-0"
             style={{ clipPath: 'polygon(50% 0%, 100% 30%, 100% 100%, 0 100%, 0 30%)' }} // Approx abstract shape
           ></div>
           
           {/* Dot Pattern */}
           <div className="absolute top-4 left-1/2 md:left-32 z-0 grid grid-cols-4 gap-2 opacity-30">
             {Array.from({length: 16}).map((_, i) => (
                <div key={i} className="w-[4px] h-[4px] rounded-full bg-gray-800"></div>
             ))}
           </div>

           {/* The Man Image - Negative margin to break out of the banner slightly */}
           {/* placehold since we don't have the explicit man image */}
           <img 
             src="https://placehold.co/400x500/transparent/333?text=Agent+Image" 
             alt="Real Estate Agent" 
             className="relative z-10 h-[280px] md:h-[340px] object-contain -mb-2 md:-mt-16"
           />
        </div>

        {/* Right Content */}
        <div className="relative z-10 w-full md:w-[60%] flex flex-col md:flex-row items-center justify-between p-10 md:py-16 md:pr-16 text-center md:text-left gap-8">
           
           <div>
             <h2 className="text-[28px] md:text-[36px] font-black text-[#1a1a1a] mb-2 tracking-tight">
               Become a Real Estate Agent
             </h2>
             <p className="text-gray-500 font-medium text-[15px] md:text-[16px]">
               We only work with the best companies around the globe to survey
             </p>
           </div>
           
           <button className="whitespace-nowrap bg-[#00c194] text-white font-bold text-[15px] px-8 py-3.5 hover:bg-[#00a67f] shadow-[0_4px_15px_rgba(0,193,148,0.3)] transition-all duration-300 hover:-translate-y-1 rounded-sm">
             Register Now
           </button>
           
        </div>

      </div>
    </section>
  );
}
