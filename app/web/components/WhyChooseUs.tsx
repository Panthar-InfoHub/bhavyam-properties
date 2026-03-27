'use client';

import Image from 'next/image';
import Link from 'next/link';
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
             className="absolute top-8 bottom-0 left-6 w-[85%] md:w-[80%] bg-[#00c194] z-0 shadow-lg" 
             style={{ clipPath: 'polygon(0 0, 85% 0, 100% 100%, 0% 100%)' }}
           >
           </div>

           {/* Wavy lines bottom left overlaying the green shape */}
           <div className="absolute bottom-6 left-10 z-20">
             <svg width="60" height="30" viewBox="0 0 60 30" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M0 5 Q 7.5 0, 15 5 T 30 5 T 45 5 T 60 5" />
                <path d="M0 15 Q 7.5 10, 15 15 T 30 15 T 45 15 T 60 15" />
                <path d="M0 25 Q 7.5 20, 15 25 T 30 25 T 45 25 T 60 25" />
             </svg>
           </div>
           
           {/* The Image Wrapper overlaying the green background */}
           <div className="relative z-10 ml-8 md:ml-12 mt-4 mr-0 shadow-2xl overflow-hidden aspect-video bg-white rounded-lg flex items-center justify-center border border-white/50">
              <img 
                src="/images/image.png" 
                alt="Innovative Solutions" 
                className="w-full h-full object-cover"
              />
              <VideoPopup videoId="4jnzf1yj48M" className="absolute inset-0 m-auto w-[80px] h-[80px]">
                <button className="w-full h-full bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white transition-all hover:scale-110 shadow-2xl group">
                   <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-[#00c194] border-b-[10px] border-b-transparent ml-2"></div>
                </button>
              </VideoPopup>
           </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col justify-center text-left relative z-10 md:pr-4">
           
           {/* Cursive Watermark Text */}
           <div 
             className="absolute -top-14 left-0 text-[100px] md:text-[140px] leading-none font-black text-[#00c194]/[0.08] select-none z-[-1] pointer-events-none tracking-tight whitespace-nowrap" 
             style={{ fontFamily: "'Brush Script MT', 'Comic Sans MS', cursive" }}
           >
             About
           </div>

           <div className="relative z-10">
              <p className="text-[#00c194] font-black text-[14px] tracking-[0.3em] uppercase mb-4 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-[#00c194] animate-pulse"></span>
                 About Us
              </p>
              <h2 className="text-[34px] md:text-[44px] leading-[1.15] font-black text-[#1a1a1a] tracking-tighter mb-6">
                Innovative Solutions for Modern <br className="hidden lg:block" /> Living With Bhavyam
              </h2>
              <p className="text-gray-500 text-[15px] md:text-[16px] leading-relaxed mb-6 font-medium">
                At Bhavyam Properties, we are committed to turning your real estate dreams into reality. Specializing in residential and commercial property solutions, we pride ourselves on delivering excellence through integrity, innovation, and customer-centric service.
              </p>
              <p className="text-gray-500 text-[15px] md:text-[16px] leading-relaxed mb-10 font-medium">
                From identifying prime properties to providing seamless transaction support, we're here every step of the way. Our goal is to create lasting value and trusted relationships.
              </p>
              
              <Link href="/about" className="bg-[#e4f8f4] text-[#00c194] font-black text-[13px] uppercase tracking-widest px-10 py-5 hover:bg-[#00c194] hover:text-white transition-all shadow-sm rounded-sm">
                 Read More
              </Link>
           </div>
        </div>

      </div>
    </section>
  );
}
