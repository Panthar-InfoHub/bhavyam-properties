export default function MissionVisionSection() {
  return (
    <section className="py-24 px-4 md:px-8 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10 text-center">
        
        {/* Header */}
        <div className="mb-16 relative">
           <div 
             className="absolute md:-top-16 left-1/2 -translate-x-1/2 text-[100px] md:text-[160px] leading-none font-black text-[#00c194]/[0.05] select-none z-[-1] pointer-events-none tracking-widest whitespace-nowrap" 
             style={{ fontFamily: "'Brush Script MT', 'Comic Sans MS', cursive" }}
           >
             Our Agents
           </div>
           <p className="text-[#00c194] font-bold text-[13px] tracking-widest uppercase mb-4">
              MISSION & VISION
           </p>
           <h2 className="text-[32px] md:text-[40px] font-black text-[#1a1a1a] tracking-tight">
             Excellence in Every Property Venture
           </h2>
        </div>

        {/* Features Container */}
        <div className="relative bg-[#f8fdfc] border border-[#e5f6f2] rounded-2xl p-8 md:p-14 max-w-5xl mx-auto flex flex-col md:flex-row items-stretch gap-12 overflow-hidden">
           
           {/* Dashed line background graphic */}
           <div className="absolute inset-0 z-0 opacity-20 pointer-events-none flex items-center justify-center">
             <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 80 Q 150 20, 300 80 T 600 80 T 900 80" fill="none" stroke="#00c194" strokeWidth="2" strokeDasharray="8 8" />
             </svg>
           </div>

           {/* Mission Card */}
           <div className="flex-1 relative z-10 flex flex-col md:flex-row items-start gap-6 text-left">
              <div className="w-[70px] h-[70px] bg-white rounded-full shrink-0 flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#e2f7f1]">
                 <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00c194" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v18z"></path>
                    <path d="M14 2v6h6"></path>
                    <path d="M12 18v-6"></path>
                    <path d="M9 15h6"></path>
                 </svg>
              </div>
              <div>
                 <h3 className="text-2xl font-black text-[#1a1a1a] mb-3">Mission</h3>
                 <p className="text-gray-500 font-medium leading-relaxed text-[15px]">
                   To redefine real estate experiences through unparalleled service, expert guidance, and personalized solutions.
                 </p>
              </div>
           </div>

           {/* Divider for desktop */}
           <div className="hidden md:block w-px bg-gradient-to-b from-transparent via-[#00c194]/20 to-transparent relative z-10"></div>

           {/* Vision Card */}
           <div className="flex-1 relative z-10 flex flex-col md:flex-row items-start gap-6 text-left">
              <div className="w-[70px] h-[70px] bg-white rounded-full shrink-0 flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#e2f7f1]">
                 <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00c194" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12h4l3-9 5 18 3-9h5"></path>
                 </svg>
              </div>
              <div>
                 <h3 className="text-2xl font-black text-[#1a1a1a] mb-3">Vision</h3>
                 <p className="text-gray-500 font-medium leading-relaxed text-[15px]">
                   To be a trusted name in real estate, known for quality, transparency, and strong customer relationships.
                 </p>
              </div>
           </div>

        </div>
      </div>
    </section>
  );
}
