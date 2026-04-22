'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { TreePine, Building2, Store, Briefcase, Home, Map, Search, ChevronDown, SlidersHorizontal } from 'lucide-react';
export default function Hero() {
  const [keyword, setKeyword] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [location, setLocation] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword) params.append('q', keyword);
    if (propertyType) params.append('property_type', propertyType);
    if (location) params.append('q', location); // append location to q for city search
    
    router.push(`/properties?${params.toString()}`);
  };

  const propertyTypes = ['Agriculture Land', 'Apartments', 'Commercial', 'Office', 'Open House', 'Plots'];
  
  const getIcon = (idx: number) => {
    switch (idx) {
      case 0: return <TreePine size={14} strokeWidth={2.5} />;
      case 1: return <Building2 size={14} strokeWidth={2.5} />;
      case 2: return <Store size={14} strokeWidth={2.5} />;
      case 3: return <Briefcase size={14} strokeWidth={2.5} />;
      case 4: return <Home size={14} strokeWidth={2.5} />;
      case 5: return <Map size={14} strokeWidth={2.5} />;
      default: return <Home size={14} strokeWidth={2.5} />;
    }
  };

  return (
    <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden py-24">
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero.png"
          alt="Luxury Living Room"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-deep-navy)]/90 via-[var(--color-deep-navy-light)]/70 to-black/40 backdrop-blur-[2px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl px-6 flex flex-col items-center text-center text-white mt-8 md:mt-12">
        <p className="text-sm md:text-base font-medium tracking-wider mb-4 opacity-90 animate-in fade-in slide-in-from-bottom-4 duration-700">
          Your Real Estate Partner For Life
        </p>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-1000">
          Bhavyam Properties
        </h1>

        <p className="text-base md:text-xl font-normal max-w-2xl mb-10 opacity-90 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
          We have more than <span className="text-[var(--color-electric-mint)] font-semibold">54,000</span> apartments, place & plot for rent, sale and purchase
        </p>

        {/* Property Type Icons */}
        <div className="hidden md:flex flex-wrap justify-center gap-6 mb-12 animate-in fade-in zoom-in duration-1000 delay-300">
          {propertyTypes.map((type, idx) => (
            <button key={type} className="flex items-center gap-3 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-[var(--color-emerald-heritage)] hover:border-[var(--color-emerald-heritage)] transition-all group active:scale-95">
              <div className="w-8 h-8 rounded-full bg-[var(--color-emerald-heritage)] flex items-center justify-center text-white group-hover:bg-white group-hover:text-[var(--color-emerald-heritage)] transition-colors">
                {getIcon(idx)}
              </div>
              <span className="text-sm font-bold tracking-wide">{type}</span>
            </button>
          ))}
        </div>

        {/* Search Bar Container */}
        <div className="w-full max-w-4xl bg-white/80 backdrop-blur-xl border border-white/30 p-2 md:p-2 rounded-3xl lg:rounded-full shadow-[var(--shadow-ambient)] flex flex-col lg:flex-row items-stretch animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500 text-gray-800">
           {/* Keyword Input */}
           <div className="flex-1 flex items-center px-4 py-3 border-b lg:border-b-0 lg:border-r border-gray-200 group">
              <Search className="w-5 h-5 text-gray-400 group-focus-within:text-[var(--color-emerald-heritage)] transition-colors shrink-0" />
              <input 
                type="text" 
                placeholder="Enter Keyword here..." 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full px-3 text-[var(--color-near-black)] bg-transparent font-medium placeholder-gray-500 outline-none text-sm md:text-base"
              />
           </div>

           {/* Type Select */}
           <div className="flex-1 flex items-center px-4 py-3 border-b lg:border-b-0 lg:border-r border-gray-200">
              <select 
                title="Property Type"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full bg-transparent text-[var(--color-near-black)] font-medium outline-none cursor-pointer appearance-none text-sm md:text-base"
              >
                <option value="">Select Type</option>
                <option value="flat">Apartment / Flat</option>
                <option value="villa">Independent Villa</option>
                <option value="plot">Plot / Land</option>
              </select>
              <ChevronDown className="w-5 h-5 text-[var(--color-emerald-heritage)] ml-2 shrink-0" />
           </div>

           {/* Location Select */}
           <div className="flex-1 flex items-center px-4 py-3">
              <select 
                title="Select Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent text-[var(--color-near-black)] font-medium outline-none cursor-pointer appearance-none text-sm md:text-base"
              >
                <option value="">Select Location</option>
                <option value="mumbai">Mumbai</option>
                <option value="pune">Pune</option>
                <option value="bangalore">Bangalore</option>
              </select>
              <ChevronDown className="w-5 h-5 text-[var(--color-emerald-heritage)] ml-2 shrink-0" />
           </div>

           {/* Search Submit */}
           <button 
             onClick={handleSearch}
             className="bg-[var(--color-emerald-heritage)] hover:bg-[var(--color-electric-mint-glow)] hover:text-[var(--color-deep-navy)] text-white px-8 py-3 mt-2 lg:mt-0 rounded-2xl lg:rounded-full font-bold tracking-wide transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 text-sm md:text-base shrink-0"
           >
              Search <Search className="w-4 h-4 ml-1" />
           </button>
        </div>
      </div>

      {/* Curved Bottom Divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-[100px] fill-[var(--color-warm-ivory)] transform rotate-180">
              <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
              <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.16,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
              <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
          </svg>
      </div>
    </section>
  );
}
