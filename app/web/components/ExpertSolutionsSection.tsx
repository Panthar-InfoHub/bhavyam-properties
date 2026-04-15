export default function ExpertSolutionsSection() {
  return (
    <section className="py-24 px-4 md:px-8 bg-[var(--color-warm-ivory)] relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 relative">
           <div className="relative z-10 text-left">
              {/* Subtle Label Text */}
              <div 
                className="absolute -top-14 -left-8 text-8xl md:text-9xl font-black text-[var(--color-deep-navy)] opacity-5 select-none z-[-1] pointer-events-none tracking-widest" 
              >
                Work Type
              </div>

              <div className="relative z-10">
                <p className="text-[var(--color-emerald-heritage)] font-bold text-[10px] md:text-sm tracking-[0.2em] uppercase mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-emerald-heritage)]"></span>
                  WHAT WE DO
                </p>
                <h2 className="text-4xl md:text-[42px] font-black tracking-[-0.04em] text-[var(--color-near-black)]">Expert Property Solutions</h2>
              </div>
           </div>
        </div>

        {/* 4 Green Block Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           
           {/* Card 1 */}
           <div className="bg-[var(--color-emerald-heritage)] p-10 rounded-3xl text-white group shadow-[var(--shadow-ambient)] transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/0 hover:bg-white/10 hover:backdrop-blur-sm transition-all duration-300 pointer-events-none" />
              <div className="mb-6 h-[80px] flex justify-center items-center relative z-10">
                 <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 22h16"></path>
                    <path d="M12 22V2"></path>
                    <path d="M12 2l4 3-4 3"></path>
                    <path d="M12 12h8v10"></path>
                    <path d="M12 16h4"></path>
                    <path d="M4 12V22"></path>
                    <path d="M4 12h8"></path>
                    <rect x="6" y="14" width="2" height="2"></rect>
                 </svg>
              </div>
              <h3 className="text-[20px] font-bold mb-3 relative z-10">Commercial Spaces</h3>
              <p className="text-white/80 text-[14px] leading-relaxed relative z-10">We deal in high-end commercial spaces tailored for your business needs.</p>
           </div>

           {/* Card 2 */}
           <div className="bg-[var(--color-emerald-mint)] p-10 rounded-3xl text-white group shadow-[var(--shadow-ambient)] transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/0 hover:bg-white/10 hover:backdrop-blur-sm transition-all duration-300 pointer-events-none" />
              <div className="mb-6 h-[80px] flex justify-center items-center relative z-10">
                 <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    <circle cx="15" cy="8" r="3"></circle>
                 </svg>
              </div>
              <h3 className="text-[20px] font-bold mb-3 relative z-10">Rent Property</h3>
              <p className="text-white/80 text-[14px] leading-relaxed relative z-10">Find your perfect rental space with our curated property listings.</p>
           </div>

           {/* Card 3 */}
           <div className="bg-[var(--color-emerald-heritage)] p-10 rounded-3xl text-white group shadow-[var(--shadow-ambient)] transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/0 hover:bg-white/10 hover:backdrop-blur-sm transition-all duration-300 pointer-events-none" />
              <div className="mb-6 h-[80px] flex justify-center items-center relative z-10">
                 <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                 </svg>
              </div>
              <h3 className="text-[20px] font-bold mb-3 relative z-10">Sell Property</h3>
              <p className="text-white/80 text-[14px] leading-relaxed relative z-10">Get the best value for your property with our expert selling strategies.</p>
           </div>

           {/* Card 4 */}
           <div className="bg-[var(--color-electric-mint-glow)] p-10 rounded-3xl text-[var(--color-near-black)] group shadow-[var(--shadow-ambient)] transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/0 hover:bg-black/5 hover:backdrop-blur-sm transition-all duration-300 pointer-events-none" />
              <div className="mb-6 h-[80px] flex justify-center items-center relative z-10">
                 <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                    <line x1="8" y1="2" x2="8" y2="18"></line>
                    <line x1="16" y1="6" x2="16" y2="22"></line>
                 </svg>
              </div>
              <h3 className="text-[20px] font-bold mb-3 relative z-10">Legal Assistance</h3>
              <p className="text-[var(--color-slate)] text-[14px] leading-relaxed relative z-10">Hassle-free documentation and legal assistance for all transactions.</p>
           </div>
        </div>
      </div>
    </section>
  );
}
