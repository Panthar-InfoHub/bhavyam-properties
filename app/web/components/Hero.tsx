'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { TreePine, Building2, Store, Briefcase, Home, Map, Search, ChevronDown } from 'lucide-react';

export default function Hero() {
  const [keyword, setKeyword] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [location, setLocation] = useState('');
  const [isLocDropdownOpen, setIsLocDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLocDropdownOpen(false);
      }
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (propertyType) params.append('property_type', propertyType);
    
    // Combine keyword and location for a unified fuzzy search string
    const combinedQuery = [keyword.trim(), location.trim()].filter(Boolean).join(' ');
    if (combinedQuery) params.append('q', combinedQuery);
    
    router.push(`/properties?${params.toString()}`);
  };

  const propertyTypeButtons = [
    { label: 'Apartment', value: 'Apartment', icon: <Building2 size={14} strokeWidth={2.5} /> },
    { label: 'Villa / Row House', value: 'Villa', icon: <Home size={14} strokeWidth={2.5} /> },
    { label: 'Plot / Land', value: 'Plot', icon: <Map size={14} strokeWidth={2.5} /> },
    { label: 'Office Space', value: 'Commercial', icon: <Briefcase size={14} strokeWidth={2.5} /> },
    { label: 'Agriculture Land', value: 'Agriculture', icon: <TreePine size={14} strokeWidth={2.5} /> },
  ];

  const handleQuickFilter = (type: string) => {
    router.push(`/properties?property_type=${encodeURIComponent(type)}`);
  };

  return (
    <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center py-24">
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero_bg.png"
          alt="Hero Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-deep-navy)]/90 via-[var(--color-deep-navy-light)]/70 to-black/40 backdrop-blur-[1px]" />
      </div>

      {/* Content */}
      <div className="relative z-20 w-full max-w-6xl px-6 flex flex-col items-center text-center text-white mt-8 md:mt-12">
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
          {propertyTypeButtons.map((btn) => (
            <button 
              key={btn.label} 
              onClick={() => handleQuickFilter(btn.value)}
              suppressHydrationWarning
              className="flex items-center gap-3 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-[var(--color-emerald-heritage)] hover:border-[var(--color-emerald-heritage)] transition-all group active:scale-95"
            >
              <div className="w-8 h-8 rounded-full bg-[var(--color-emerald-heritage)] flex items-center justify-center text-white group-hover:bg-white group-hover:text-[var(--color-emerald-heritage)] transition-colors">
                {btn.icon}
              </div>
              <span className="text-sm font-bold tracking-wide">{btn.label}</span>
            </button>
          ))}
        </div>

        {/* Search Bar Container */}
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="w-full max-w-4xl bg-white/80 backdrop-blur-xl border border-white/30 p-2 md:p-2 rounded-3xl lg:rounded-full shadow-[var(--shadow-ambient)] flex flex-col lg:flex-row items-stretch animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500 text-gray-800 relative z-30">
           {/* Keyword Input */}
           <div className="flex-1 flex items-center px-4 py-3 border-b lg:border-b-0 lg:border-r border-gray-200 group">
              <Search className="w-5 h-5 text-gray-400 group-focus-within:text-[var(--color-emerald-heritage)] transition-colors shrink-0" />
              <input 
                type="text" 
                placeholder="Enter Keyword here..." 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                suppressHydrationWarning
                className="w-full px-3 text-[var(--color-near-black)] bg-transparent font-medium placeholder-gray-500 outline-none text-sm md:text-base"
              />
           </div>

           {/* Type Searchable Dropdown */}
           <div ref={typeRef} className="flex-1 flex items-center px-4 py-3 border-b lg:border-b-0 lg:border-r border-gray-200">
              <div className="w-full relative group/type">
                <div className="flex items-center w-full">
                  <input 
                    type="text"
                    placeholder="All Types"
                    readOnly
                    value={propertyType}
                    onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                    className="w-full bg-transparent text-[var(--color-near-black)] font-medium outline-none cursor-pointer text-sm md:text-base placeholder-gray-500"
                  />
                  <ChevronDown 
                    className={`w-5 h-5 text-[var(--color-emerald-heritage)] ml-2 shrink-0 cursor-pointer transition-transform duration-300 ${isTypeDropdownOpen ? 'rotate-180' : ''}`} 
                    onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                  />
                </div>

                {/* Dropdown Menu */}
                {isTypeDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-[110] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2">
                      {[
                        { label: 'All Types', value: '' },
                        { label: 'Apartment', value: 'Apartment' },
                        { label: 'Villa / Row House', value: 'Villa' },
                        { label: 'Plot / Land', value: 'Plot' },
                        { label: 'Office Space', value: 'Commercial' },
                        { label: 'Agriculture Land', value: 'Agriculture' }
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            setPropertyType(item.value);
                            setIsTypeDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-teal-50 text-sm font-bold transition-colors rounded-xl flex items-center justify-between group/item ${propertyType === item.value ? 'bg-teal-50 text-teal-600' : 'text-gray-700'}`}
                        >
                          {item.label}
                          {propertyType === item.value && <span className="text-[10px] text-teal-500 font-black tracking-widest">SELECTED</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
           </div>

           {/* Location Searchable Dropdown */}
           <div ref={dropdownRef} className="flex-1 relative flex items-center px-4 py-3 min-w-[200px]">
              <div className="w-full relative group/loc">
                <div className="flex items-center w-full">
                  <input 
                    type="text"
                    placeholder="Search Location..."
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setIsLocDropdownOpen(true);
                    }}
                    onFocus={() => setIsLocDropdownOpen(true)}
                    className="w-full bg-transparent text-[var(--color-near-black)] font-medium outline-none cursor-text text-sm md:text-base placeholder-gray-400"
                  />
                  <ChevronDown 
                    className={`w-5 h-5 text-[var(--color-emerald-heritage)] ml-2 shrink-0 cursor-pointer transition-transform duration-300 ${isLocDropdownOpen ? 'rotate-180' : ''}`} 
                    onClick={() => setIsLocDropdownOpen(!isLocDropdownOpen)}
                  />
                </div>

                {/* Dropdown Menu */}
                {isLocDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200 max-h-[350px] overflow-y-auto">
                    <div className="p-2">
                      <p className="px-4 py-2 text-[10px] font-black text-gray-300 uppercase tracking-widest border-b border-gray-50 mb-2">Popular Cities</p>
                      {Array.from(new Set([
                        'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur', 
                        'Jhansi', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 
                        'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 
                        'Kalyan-Dombivli', 'Vasai-Virar', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 
                        'Navi Mumbai', 'Allahabad', 'Howrah', 'Ranchi', 'Gwalior', 'Jabalpur', 'Coimbatore', 'Vijayawada', 
                        'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Chandigarh', 'Guwahati', 'Solapur', 'Hubli-Dharwad', 'Bareilly', 
                        'Moradabad', 'Mysore', 'Gurgaon', 'Aligarh', 'Jalandhar', 'Tiruchirappalli', 'Bhubaneswar', 'Salem', 
                        'Mira-Bhayandar', 'Warangal', 'Guntur', 'Bhiwandi', 'Saharanpur', 'Gorakhpur', 'Bikaner', 'Amravati', 
                        'Noida', 'Jamshedpur', 'Bhilai', 'Cuttack', 'Firozabad', 'Kochi', 'Nellore', 'Bhavnagar', 'Dehradun', 
                        'Durgapur', 'Asansol', 'Rourkela', 'Nanded', 'Kolhapur', 'Ajmer', 'Akola', 'Gulbarga', 'Jamnagar', 
                        'Ujjain', 'Loni', 'Siliguri', 'Ulhasnagar', 'Jammu', 'Sangli-Miraj & Kupwad', 
                        'Belgaum', 'Mangalore', 'Ambattur', 'Tirunelveli', 'Malegaon', 'Gaya', 'Jalgaon', 'Udaipur', 'Maheshtala'
                      ]))
                      .filter(city => city.toLowerCase().includes(location.toLowerCase()))
                      .map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            setLocation(city);
                            setIsLocDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-teal-50 text-sm font-bold text-gray-700 transition-colors rounded-xl flex items-center justify-between group/item"
                        >
                          {city}
                          <span className="opacity-0 group-hover/item:opacity-100 text-[10px] text-teal-500 font-black tracking-widest">SELECT</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
           </div>

           {/* Search Submit */}
           <button 
             type="submit"
             suppressHydrationWarning
             className="bg-[var(--color-emerald-heritage)] hover:bg-[var(--color-electric-mint-glow)] hover:text-[var(--color-deep-navy)] text-white px-8 py-3 mt-2 lg:mt-0 rounded-2xl lg:rounded-full font-bold tracking-wide transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 text-sm md:text-base shrink-0"
           >
              Search <Search className="w-4 h-4 ml-1" />
           </button>
        </form>
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
