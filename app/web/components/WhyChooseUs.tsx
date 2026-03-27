import Image from 'next/image';
import VideoPopup from './VideoPopup';

export default function WhyChooseUs() {
  return (
    <section className="py-24 px-4 md:px-8 bg-white relative overflow-hidden">
      
      {/* Background Graphic - video-bg-2.svg */}
      <div className="absolute bottom-0 right-0 z-0 opacity-40 md:opacity-80 pointer-events-none w-full md:w-auto h-auto md:h-full flex justify-end items-end">
        <Image 
          src="/images/video-bg-2.svg" 
          alt="City Building Pattern"
          width={500}
          height={300}
          className="w-full max-w-[450px] md:max-w-[550px] h-auto object-contain object-right-bottom translate-x-12 translate-y-6"
        />
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 md:gap-20 relative z-10 items-center">
        
        {/* Left Video Area */}
        <div className="flex-1 w-full relative pt-12 pl-8 pb-12">
           {/* Static Dot Pattern Top Left */}
           <div className="absolute top-4 left-0 z-0 grid grid-cols-4 gap-[6px] opacity-40">
             {Array.from({length: 40}).map((_, i) => (
                <div key={i} className="w-[3px] h-[3px] rounded-full bg-gray-500"></div>
             ))}
           </div>
           
           {/* Main Green Background Shape */}
           <div 
             className="absolute top-8 bottom-0 left-6 w-[80%] md:w-[75%] bg-[#00c194] z-0 shadow-lg" 
             style={{ clipPath: 'polygon(0 0, 85% 0, 100% 100%, 0% 100%)' }}
           >
           </div>

           {/* Wavy lines bottom left overlaying the green shape */}
           <div className="absolute bottom-6 left-10 z-20">
             <svg width="50" height="25" viewBox="0 0 60 30" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M0 5 Q 7.5 0, 15 5 T 30 5 T 45 5 T 60 5" />
                <path d="M0 15 Q 7.5 10, 15 15 T 30 15 T 45 15 T 60 15" />
                <path d="M0 25 Q 7.5 20, 15 25 T 30 25 T 45 25 T 60 25" />
             </svg>
           </div>
           
           {/* The Image Wrapper overlaying the green background */}
           {/* Using aspect-video dynamically prevents awkward cropping */}
           <div className="relative z-10 ml-8 md:ml-12 mt-4 mr-0 shadow-2xl overflow-hidden aspect-[16/10] bg-[#f8fcfb] rounded-sm flex items-center justify-center">
              <img 
                src="/images/image.png" 
                alt="Agents meeting clients" 
                className="w-full h-full object-contain p-4"
              />
              <VideoPopup videoId="4jnzf1yj48M" className="absolute inset-0 m-auto w-[72px] h-[72px]">
                <button className="w-full h-full bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all hover:scale-105 shadow-[0_8px_30px_rgb(0,0,0,0.12)] group border border-gray-100">
                   <div className="w-0 h-0 border-t-[9px] border-t-transparent border-l-[16px] border-l-[#00c194] border-b-[9px] border-b-transparent ml-2 group-hover:border-l-[#00a880] transition-colors"></div>
                </button>
              </VideoPopup>
           </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col justify-center text-left relative z-10 md:pr-4">
           
           {/* Cursive Watermark Text */}
           <div 
             className="absolute -top-10 left-0 text-[80px] md:text-[110px] leading-none font-black text-[#00c194]/[0.05] select-none z-[-1] pointer-events-none tracking-widest whitespace-nowrap" 
             style={{ fontFamily: "'Brush Script MT', 'Comic Sans MS', cursive" }}
           >
             Choose
           </div>

           <div className="relative z-10">
             <p className="text-[#00c194] font-bold text-[13px] tracking-widest uppercase mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00c194]"></span>
                Why Choose Our Properties
             </p>
             <h2 className="text-[32px] md:text-[40px] leading-[1.2] font-black text-[#1a1a1a] tracking-tight mb-5 md:mb-6">
               The experts in local and <br className="hidden lg:block" /> International property
             </h2>
             <p className="text-gray-500 text-[15px] md:text-[16px] leading-relaxed mb-8 max-w-[95%] font-medium">
               "Experienced agents in local and international property. Guiding you to the perfect investment, wherever it may be."
             </p>
             
             <ul className="space-y-4 mb-10 text-[#1a1a1a] font-semibold text-[15px]">
               {[
                 'Outstanding property', 
                 'Modern City Locations', 
                 'Specialist services', 
                 'Market-leading research'
               ].map((item, idx) => (
                 <li key={idx} className="flex items-center gap-3">
                   <svg className="w-[18px] h-[18px] text-[#00c194]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                   </svg>
                   {item}
                 </li>
               ))}
             </ul>

             <button className="bg-[#e4f8f4] text-[#00c194] font-bold text-[13px] uppercase tracking-wider px-9 py-[14px] hover:bg-[#00c194] hover:text-white transition-colors duration-300 shadow-sm">
                Read More
             </button>
           </div>
        </div>

      </div>
    </section>
  );
}
