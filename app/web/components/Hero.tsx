'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Hero() {
  const [keyword, setKeyword] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [location, setLocation] = useState('');

  const propertyTypes = ['Agriculture Land', 'Apartments', 'Commercial', 'Office', 'Open House', 'Plots'];

  return (
    <section className="relative w-full h-[95vh] flex flex-col items-center justify-center overflow-hidden">
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero.png"
          alt="Luxury Living Room"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl px-6 flex flex-col items-center text-center text-white mt-12">
        <p className="text-sm md:text-base font-bold uppercase tracking-[0.3em] mb-4 opacity-90 animate-in fade-in slide-in-from-bottom-4 duration-700">
          Your Real Estate Partner For Life
        </p>
        
        <h1 className="text-5xl md:text-8xl font-black mb-6 leading-tight tracking-tighter animate-in fade-in slide-in-from-bottom-6 duration-1000">
          Bhavyam Properties
        </h1>

        <p className="text-lg md:text-2xl font-medium max-w-3xl mb-12 opacity-80 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
          We have more than <span className="text-[#00ecbd] font-black">54,000</span> apartments, place & plot for rent, sale and purchase
        </p>

        {/* Property Type Icons */}
        <div className="hidden md:flex flex-wrap justify-center gap-6 mb-12 animate-in fade-in zoom-in duration-1000 delay-300">
          {propertyTypes.map((type, idx) => (
            <button key={type} className="flex items-center gap-3 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-[#00b48f] transition-all group active:scale-95">
              <div className="w-8 h-8 rounded-full bg-[#00b48f] flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#00b48f] transition-colors">
                {/* Simplified dynamic icons */}
                {idx === 0 && <span className="text-xs">🌱</span>}
                {idx === 1 && <span className="text-xs">🏢</span>}
                {idx === 2 && <span className="text-xs">🏪</span>}
                {idx === 3 && <span className="text-xs">💼</span>}
                {idx === 4 && <span className="text-xs">🏠</span>}
                {idx === 5 && <span className="text-xs">🗺️</span>}
              </div>
              <span className="text-sm font-bold tracking-wide">{type}</span>
            </button>
          ))}
        </div>

        {/* Search Bar Container */}
        <div className="w-full max-w-5xl bg-white p-2 md:p-1.5 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-stretch animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
           {/* Keyword Input */}
           <div className="flex-1 flex items-center px-6 py-4 border-b md:border-b-0 md:border-r border-gray-100 group">
              <svg className="w-5 h-5 text-gray-400 group-focus-within:text-[#00b48f] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Enter Keyword here ..." 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full px-4 text-gray-800 font-medium placeholder-gray-400 outline-none"
              />
           </div>

           {/* Type Select */}
           <div className="flex-1 flex items-center px-6 py-4 border-b md:border-b-0 md:border-r border-gray-100">
              <select 
                title="Property Type"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full bg-transparent text-gray-800 font-medium outline-none cursor-pointer appearance-none"
              >
                <option value="">Select Type</option>
                <option value="flat">Apartment / Flat</option>
                <option value="villa">Independent Villa</option>
                <option value="plot">Plot / Land</option>
              </select>
              <svg className="w-4 h-4 text-teal-500 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
           </div>

           {/* Location Select */}
           <div className="flex-1 flex items-center px-6 py-4">
              <select 
                title="Select Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent text-gray-800 font-medium outline-none cursor-pointer appearance-none"
              >
                <option value="">Select Location</option>
                <option value="mumbai">Mumbai</option>
                <option value="pune">Pune</option>
                <option value="bangalore">Bangalore</option>
              </select>
              <svg className="w-4 h-4 text-teal-500 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
           </div>

           {/* Filter Button */}
           <button className="p-4 md:px-6 hidden md:flex items-center justify-center text-[#00b48f] hover:bg-teal-50 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
           </button>

           {/* Search Submit */}
           <button className="bg-[#00b48f] hover:bg-teal-600 text-white px-10 py-5 rounded-xl md:rounded-full font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2">
              SEARCH <span className="text-xl">🔍</span>
           </button>
        </div>
      </div>

      {/* Curved Bottom Divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-[100px] fill-white transform rotate-180">
              <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
              <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.16,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
              <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
          </svg>
      </div>
    </section>
  );
}
