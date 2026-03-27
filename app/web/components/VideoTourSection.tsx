import VideoPopup from './VideoPopup';

export default function VideoTourSection() {
  return (
    <section className="relative w-full h-[600px] flex items-center justify-start overflow-hidden">
      
      {/* Parallax Background Image */}
      <div 
         className="absolute inset-0 z-0 bg-fixed bg-cover bg-center filter brightness-[0.85]"
         style={{ backgroundImage: 'url("/images/hero.png")' }}
      >
      </div>

      {/* Cursive Background Overlay (Like in the image "Property For All") */}
      <div 
         className="absolute inset-0 z-10 flex items-center justify-center font-black text-white/50 select-none pointer-events-none drop-shadow-md tracking-wider text-[80px] md:text-[140px]" 
         style={{ fontFamily: "'Brush Script MT', 'Comic Sans MS', cursive" }}
      >
         Property For All
      </div>

      {/* Content Box */}
      <div className="relative z-20 max-w-7xl mx-auto w-full px-4 md:px-8">
         <div className="bg-white p-10 md:p-14 md:w-[60%] lg:w-[45%] rounded-sm shadow-2xl flex flex-col justify-center translate-y-8 md:translate-y-0 relative z-30">
            
            <p className="text-[#00c194] font-bold text-[13px] tracking-widest uppercase mb-4 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-[#00c194]"></span>
               LET'S TAKE A TOUR
            </p>
            
            <h2 className="text-[34px] md:text-[42px] leading-tight font-black text-[#1a1a1a] tracking-tight mb-8">
               Search Property Smarter,<br />Quicker & Anywhere
            </h2>
            
            <VideoPopup videoId="4jnzf1yj48M" className="group flex items-center gap-5 w-max">
               {/* Play Button Icon */}
               <div className="w-[60px] h-[60px] md:w-[70px] md:h-[70px] rounded-full border border-[#00c194] flex items-center justify-center group-hover:bg-[#f0fbf8] transition-colors relative">
                  <div className="w-[50px] h-[50px] md:w-[58px] md:h-[58px] bg-[#00c194] rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                     <div className="w-0 h-0 border-t-[7px] border-t-transparent border-l-[12px] border-l-white border-b-[7px] border-b-transparent ml-1"></div>
                  </div>
               </div>
               <span className="font-bold text-[#3a4454] text-[15px] group-hover:text-[#00c194] transition-colors">
                  Play Video
               </span>
            </VideoPopup>
            
         </div>
      </div>
    </section>
  );
}
