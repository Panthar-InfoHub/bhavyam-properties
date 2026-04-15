export default function ServicesSection() {
  return (
    <section className="py-24 px-4 md:px-8 bg-[var(--color-cloud)] relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10 text-center">
        
        {/* Header */}
        <div className="mb-16 relative">
           <div 
             className="absolute -top-10 md:-top-16 left-1/2 -translate-x-1/2 text-[60px] md:text-[160px] leading-none font-black text-[var(--color-emerald-heritage)] opacity-5 select-none z-[-1] pointer-events-none tracking-tight whitespace-nowrap" 
           >
             Our Service
           </div>
           <p className="text-[var(--color-emerald-heritage)] font-bold text-[10px] md:text-sm tracking-[0.2em] uppercase mb-4">
              OUR SERVICES
           </p>
           <h2 className="text-[32px] md:text-[40px] font-black text-[var(--color-near-black)] tracking-[-0.04em]">
             Our Exclusive Properties Solutions
           </h2>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
           {/* Card 1 */}
           <div className="bg-[var(--color-pure-white)] p-10 md:p-12 rounded-3xl hover:shadow-[var(--shadow-ambient)] transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center group">
              <div className="mb-6 opacity-80 group-hover:opacity-100 transition-opacity bg-[var(--color-emerald-heritage)]/10 p-5 rounded-3xl group-hover:bg-[var(--color-emerald-heritage)]/20">
                 {/* Building outline icon */}
                 <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--color-emerald-heritage)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                    <path d="M9 22v-4h6v4"></path>
                    <path d="M8 6h.01"></path>
                    <path d="M16 6h.01"></path>
                    <path d="M12 6h.01"></path>
                    <path d="M12 10h.01"></path>
                    <path d="M12 14h.01"></path>
                    <path d="M16 10h.01"></path>
                    <path d="M16 14h.01"></path>
                    <path d="M8 10h.01"></path>
                    <path d="M8 14h.01"></path>
                 </svg>
              </div>
              <h3 className="text-[20px] font-bold text-[var(--color-near-black)] mb-3">Residential Sales and Leasing</h3>
              <p className="text-[var(--color-slate)] text-[15px] font-medium leading-relaxed">Helping individuals and families find their dream homes.</p>
           </div>

           {/* Card 2 */}
           <div className="bg-[var(--color-pure-white)] p-10 md:p-12 rounded-3xl hover:shadow-[var(--shadow-ambient)] transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center group">
              <div className="mb-6 opacity-80 group-hover:opacity-100 transition-opacity bg-[var(--color-emerald-heritage)]/10 p-5 rounded-3xl group-hover:bg-[var(--color-emerald-heritage)]/20">
                 {/* Tall building outline */}
                 <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--color-emerald-heritage)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"></path>
                    <path d="M4 22V10a2 2 0 0 1 2-2h2"></path>
                    <path d="M12 6h.01"></path>
                    <path d="M16 6h.01"></path>
                    <path d="M12 10h.01"></path>
                    <path d="M16 10h.01"></path>
                    <path d="M12 14h.01"></path>
                    <path d="M16 14h.01"></path>
                    <path d="M12 18h.01"></path>
                    <path d="M16 18h.01"></path>
                    <path d="M8 14h.01"></path>
                    <path d="M8 18h.01"></path>
                    <path d="M4 22h16"></path>
                 </svg>
              </div>
              <h3 className="text-[20px] font-bold text-[var(--color-near-black)] mb-3">Commercial Property Solutions</h3>
              <p className="text-[var(--color-slate)] text-[15px] font-medium leading-relaxed">Tailoring spaces that meet business needs and growth.</p>
           </div>

           {/* Card 3 */}
           <div className="bg-[var(--color-pure-white)] p-10 md:p-12 rounded-3xl hover:shadow-[var(--shadow-ambient)] transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center group">
              <div className="mb-6 opacity-80 group-hover:opacity-100 transition-opacity bg-[var(--color-emerald-heritage)]/10 p-5 rounded-3xl group-hover:bg-[var(--color-emerald-heritage)]/20">
                 {/* Person coin outline */}
                 <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--color-emerald-heritage)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <circle cx="19" cy="11" r="3"></circle>
                    <path d="M19 14v6"></path>
                    <path d="M17 18h4"></path>
                    <path d="M18 11h2"></path>
                 </svg>
              </div>
              <h3 className="text-[20px] font-bold text-[var(--color-near-black)] mb-3">Investment Advisory</h3>
              <p className="text-[var(--color-slate)] text-[15px] font-medium leading-relaxed">Offering insights and guidance to maximize real estate investments.</p>
           </div>

           {/* Card 4 */}
           <div className="bg-[var(--color-pure-white)] p-10 md:p-12 rounded-3xl hover:shadow-[var(--shadow-ambient)] transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center group">
              <div className="mb-6 opacity-80 group-hover:opacity-100 transition-opacity bg-[var(--color-emerald-heritage)]/10 p-5 rounded-3xl group-hover:bg-[var(--color-emerald-heritage)]/20">
                 {/* Management gears */}
                 <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--color-emerald-heritage)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M12 9v1"></path>
                    <path d="M12 14v1"></path>
                    <path d="M9 12h1"></path>
                    <path d="M14 12h1"></path>
                    <path d="M10 10l.7.7"></path>
                    <path d="M13.3 13.3l.7.7"></path>
                 </svg>
              </div>
              <h3 className="text-[20px] font-bold text-[var(--color-near-black)] mb-3">Property Management</h3>
              <p className="text-[var(--color-slate)] text-[15px] font-medium leading-relaxed">Ensuring properties are well-maintained and generating value.</p>
           </div>
        </div>
      </div>
    </section>
  );
}
