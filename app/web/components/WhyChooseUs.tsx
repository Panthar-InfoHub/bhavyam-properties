'use client';

import Image from 'next/image';
import Link from 'next/link';
import VideoPopup from './VideoPopup';

const popupContent = (
  <div className="text-left">
    <p className="text-[var(--color-emerald-heritage)] font-semibold text-xs tracking-[0.2em] uppercase mb-3 flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-[var(--color-emerald-heritage)] animate-pulse" />
      About Us
    </p>
    <h2 className="text-2xl font-bold text-gray-900 leading-snug mb-4">
      Innovative Solutions for Modern Living With Bhavyam
    </h2>
    <p className="text-gray-500 text-sm leading-relaxed mb-4">
      At Bhavyam Properties, we are committed to turning your real estate dreams into reality. Specializing in residential and commercial property solutions, we pride ourselves on delivering excellence through integrity, innovation, and customer-centric service.
    </p>
    <p className="text-gray-500 text-sm leading-relaxed mb-7">
      From identifying prime properties to providing seamless transaction support, we&apos;re here every step of the way. Our goal is to create lasting value and trusted relationships.
    </p>
    <Link
      href="/about"
      className="inline-block bg-[var(--color-emerald-heritage)] text-white font-semibold text-xs uppercase tracking-widest px-7 py-3 rounded-full hover:opacity-90 transition-all shadow-md active:scale-95"
    >
      Discover More
    </Link>
  </div>
);

export default function WhyChooseUs() {
  return (
    <section className="py-24 px-4 md:px-8 bg-white relative overflow-hidden">

      {/* Background Graphic */}
      <div className="absolute bottom-0 right-0 z-0 opacity-30 pointer-events-none">
        <Image
          src="/images/video-bg-2.svg"
          alt="City Building Pattern"
          width={500}
          height={300}
          className="w-full max-w-[500px] h-auto object-contain"
        />
      </div>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 md:gap-16 relative z-10 items-center">

        {/* Left — Video Thumbnail */}
        <div className="flex-1 w-full relative pt-10 pl-6 pb-10">
          {/* Dot Pattern */}
          <div className="absolute top-2 left-0 z-0 grid grid-cols-5 gap-[6px] opacity-20">
            {Array.from({ length: 50 }).map((_, i) => (
              <div key={i} className="w-[3px] h-[3px] rounded-full bg-gray-400" />
            ))}
          </div>

          {/* Green background shape */}
          <div className="absolute top-6 bottom-0 left-4 right-4 md:right-0 bg-[var(--color-emerald-heritage)] z-0 rounded-2xl" />

          {/* Wavy accent */}
          <div className="absolute bottom-4 left-8 z-20">
            <svg width="50" height="24" viewBox="0 0 60 30" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M0 5 Q 7.5 0, 15 5 T 30 5 T 45 5 T 60 5" />
              <path d="M0 15 Q 7.5 10, 15 15 T 30 15 T 45 15 T 60 15" />
              <path d="M0 25 Q 7.5 20, 15 25 T 30 25 T 45 25 T 60 25" />
            </svg>
          </div>

          {/* Thumbnail + play button */}
          <div className="relative z-10 ml-6 md:ml-10 mt-4 shadow-xl overflow-hidden aspect-video bg-white rounded-2xl">
            <img
              src="/images/image.png"
              alt="Innovative Solutions"
              className="w-full h-full object-cover"
            />
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-black/20" />

            <VideoPopup
              videoId="4jnzf1yj48M"
              className="absolute inset-0 flex items-center justify-center"
              popupContent={popupContent}
            >
              <button className="w-[72px] h-[72px] bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-2xl border border-white/60 group">
                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-[var(--color-emerald-heritage)] border-b-[10px] border-b-transparent ml-1.5" />
              </button>
            </VideoPopup>
          </div>
        </div>

        {/* Right — Text Content */}
        <div className="flex-1 flex flex-col justify-center text-left relative z-10">
          {/* Watermark */}
          <div className="absolute -top-10 left-0 text-[120px] leading-none font-black text-[var(--color-emerald-heritage)] opacity-[0.04] select-none pointer-events-none tracking-tight whitespace-nowrap">
            About
          </div>

          <div className="relative z-10">
            <p className="text-[var(--color-emerald-heritage)] font-semibold text-xs tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-emerald-heritage)] animate-pulse" />
              About Us
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug tracking-tight mb-5">
              Innovative Solutions for Modern Living With Bhavyam
            </h2>
            <p className="text-gray-500 text-[15px] leading-relaxed mb-5">
              At Bhavyam Properties, we are committed to turning your real estate dreams into reality. Specializing in residential and commercial property solutions, we pride ourselves on delivering excellence through integrity, innovation, and customer-centric service.
            </p>
            <p className="text-gray-500 text-[15px] leading-relaxed mb-9">
              From identifying prime properties to providing seamless transaction support, we&apos;re here every step of the way. Our goal is to create lasting value and trusted relationships.
            </p>
            <Link
              href="/about"
              className="inline-block bg-[var(--color-emerald-heritage)] text-white font-semibold text-xs uppercase tracking-widest px-9 py-4 hover:opacity-90 transition-all rounded-full shadow-lg active:scale-95"
            >
              Read More
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
