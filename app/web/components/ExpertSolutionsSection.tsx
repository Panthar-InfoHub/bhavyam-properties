export default function ExpertSolutionsSection() {
  return (
    <section className="py-24 px-4 md:px-8 bg-[#effbf8] relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10 text-center">
        
        {/* Header */}
        <div className="mb-16 relative">
           <div 
             className="absolute md:-top-16 left-1/2 -translate-x-1/2 text-[100px] md:text-[160px] leading-none font-black text-[#00c194]/[0.05] select-none z-[-1] pointer-events-none tracking-widest whitespace-nowrap" 
             style={{ fontFamily: "'Brush Script MT', 'Comic Sans MS', cursive" }}
           >
             Solutions
           </div>
           <p className="text-[#00c194] font-bold text-[13px] tracking-widest uppercase mb-4">
              SOLUTION
           </p>
           <h2 className="text-[32px] md:text-[40px] font-black text-[#1a1a1a] tracking-tight">
             Expert Solutions for Every Property
           </h2>
        </div>

        {/* 4 Green Block Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
           
           {/* Block 1 */}
           <div className="bg-[#00d09c] hover:bg-[#00b48f] transition-colors duration-300 rounded-lg p-10 flex flex-col items-center text-center text-white shadow-md hover:-translate-y-1 transform">
              <div className="mb-6 h-[80px] flex justify-center items-center">
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
              <h3 className="text-[17px] font-black uppercase tracking-wider">99acres</h3>
           </div>

           {/* Block 2 */}
           <div className="bg-[#00c194] hover:bg-[#00a67f] transition-colors duration-300 rounded-lg p-10 flex flex-col items-center text-center text-white shadow-md hover:-translate-y-1 transform">
              <div className="mb-6 h-[80px] flex justify-center items-center">
                 <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    <circle cx="15" cy="8" r="3"></circle>
                 </svg>
              </div>
              <h3 className="text-[17px] font-black uppercase tracking-wider">Rent</h3>
           </div>

           {/* Block 3 */}
           <div className="bg-[#00b288] hover:bg-[#009b77] transition-colors duration-300 rounded-lg p-10 flex flex-col items-center text-center text-white shadow-md hover:-translate-y-1 transform">
              <div className="mb-6 h-[80px] flex justify-center items-center">
                 <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                 </svg>
              </div>
              <h3 className="text-[17px] font-black uppercase tracking-wider">Consultancy</h3>
           </div>

           {/* Block 4 */}
           <div className="bg-[#00a37c] hover:bg-[#008f6c] transition-colors duration-300 rounded-lg p-10 flex flex-col items-center text-center text-white shadow-md hover:-translate-y-1 transform">
              <div className="mb-6 h-[80px] flex justify-center items-center">
                 <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                    <line x1="8" y1="2" x2="8" y2="18"></line>
                    <line x1="16" y1="6" x2="16" y2="22"></line>
                 </svg>
              </div>
              <h3 className="text-[17px] font-black uppercase tracking-wider">Purchase</h3>
           </div>

        </div>
      </div>
    </section>
  );
}
