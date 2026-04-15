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

      {/* Background Image Overlay Gradient */}
      <div className="absolute inset-0 z-[5] bg-gradient-to-r from-[var(--color-deep-navy)]/80 to-transparent pointer-events-none" />

      {/* Background Overlay (Like in the image "Property For All") */}
      <div 
         className="absolute inset-0 z-10 flex items-center justify-center font-black text-white/10 select-none pointer-events-none tracking-tight text-[100px] md:text-[200px] opacity-20" 
      >
         Property For All
      </div>

      {/* Content Box */}
      <div className="relative z-20 max-w-7xl mx-auto w-full px-4 md:px-8">
         <div className="bg-[var(--color-pure-white)] p-10 md:p-14 md:w-[60%] lg:w-[45%] rounded-3xl shadow-[var(--shadow-ambient)] flex flex-col justify-center translate-y-8 md:translate-y-0 relative z-30">
            
            <p className="text-[var(--color-emerald-heritage)] font-bold text-[10px] md:text-sm tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-[var(--color-emerald-heritage)] animate-pulse"></span>
               LET'S TAKE A TOUR
            </p>
            
            <h2 className="text-[34px] md:text-[42px] leading-[1.15] font-black text-[var(--color-near-black)] tracking-[-0.04em] mb-8">
               Search Property Smarter,<br />Quicker & Anywhere
            </h2>
            
            <VideoPopup videoId="4jnzf1yj48M" className="group flex items-center gap-5 w-max">
               {/* Play Button Icon */}
               <div className="w-[60px] h-[60px] md:w-[70px] md:h-[70px] rounded-full border border-[var(--color-emerald-heritage)] flex items-center justify-center group-hover:bg-[var(--color-emerald-heritage)]/10 transition-colors relative">
                  <div className="w-[50px] h-[50px] md:w-[58px] md:h-[58px] bg-[var(--color-emerald-heritage)] group-hover:bg-[var(--color-electric-mint-glow)] rounded-full flex items-center justify-center shadow-lg transition-all duration-300">
                     <div className="w-0 h-0 border-t-[7px] border-t-transparent border-l-[12px] border-l-white group-hover:border-l-[var(--color-deep-navy)] border-b-[7px] border-b-transparent ml-1 transition-colors"></div>
                  </div>
               </div>
               <span className="font-bold text-[var(--color-near-black)] text-[15px] transition-colors">
                  Play Video
               </span>
            </VideoPopup>
            
         </div>
      </div>
    </section>
  );
}
