import Link from 'next/link';

export default function AgentCTASection() {
  return (
    <section className="bg-[var(--color-pure-white)] py-12 px-4 md:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto relative bg-gradient-to-r from-[var(--color-cloud)] to-[var(--color-warm-ivory)] border border-[var(--color-ghost)]/20 rounded-3xl flex flex-col md:flex-row items-center justify-between shadow-[var(--shadow-ambient)]">
        
        {/* Faint Background Buildings */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none overflow-hidden rounded-3xl">
           <img 
             src="/images/video-bg-2.svg" 
             alt="City Background"
             className="w-full h-full object-cover"
           />
        </div>

        {/* Left Graphics (Man + House + Soft Shape) */}
        <div className="relative w-full md:w-[40%] h-[200px] md:h-auto flex justify-center md:justify-start items-end z-10 pt-8 pl-0 md:pl-16">
           {/* Soft Rounded Shape behind him */}
           <div 
             className="absolute bottom-0 left-1/2 md:left-24 -translate-x-1/2 md:translate-x-0 w-[180px] h-[220px] bg-[var(--color-emerald-heritage)] rounded-t-full rounded-bl-3xl z-0"
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
             src="/images/image copy.png" 
             alt="Real Estate Agent" 
             className="relative z-10 h-[280px] md:h-[340px] w-auto object-contain -mb-2 md:-mt-16"
           />
        </div>

        {/* Right Content */}
        <div className="relative z-10 w-full md:w-[60%] flex flex-col md:flex-row items-center justify-between p-10 md:py-16 md:pr-16 text-center md:text-left gap-8">
           
           <div>
             <h2 className="text-[28px] md:text-[36px] font-black text-[var(--color-near-black)] mb-2 tracking-[-0.04em]">
               Become a Real Estate Agent
             </h2>
             <p className="text-[var(--color-slate)] font-medium text-[15px] md:text-[16px]">
               We only work with the best companies around the globe to survey
             </p>
           </div>
           
           <Link href="/user/apply-agent" className="whitespace-nowrap bg-[var(--color-deep-navy)] text-white font-bold text-[14px] uppercase tracking-[0.1em] px-8 py-4 hover:bg-[var(--color-electric-mint-glow)] hover:text-black shadow-[0_4px_15px_rgba(17,39,67,0.3)] transition-all duration-300 hover:-translate-y-1 rounded-full">
             Register Now
           </Link>
           
        </div>

      </div>
    </section>
  );
}
