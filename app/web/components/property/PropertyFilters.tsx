"use client";

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';

export default function PropertyFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state for immediate UI feedback
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Sync with URL when it changes elsewhere
  useEffect(() => {
    setSearch(searchParams.get('q') || '');
  }, [searchParams]);

  // Create update function for URL
  const updateQuery = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateQuery({ q: search });
  };

  const clearFilters = () => {
    setSearch('');
    router.push(pathname);
  };

  const listingType = searchParams.get('type') || 'all';
  const propertyType = searchParams.get('property_type') || '';
  const priceRange = searchParams.get('price_range') || '';
  const sort = searchParams.get('sort') || 'latest';
  const isVerified = searchParams.get('verified') === 'true';

  return (
    <div className="w-full mb-12 space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input Area */}
        <form onSubmit={handleSearch} className="relative flex-1 group">
          <input
            type="text"
            placeholder="Search by city, area or property type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-14 pr-6 text-gray-800 placeholder-gray-400 outline-none focus:border-[#00b48f] focus:ring-4 focus:ring-teal-50/50 shadow-sm transition-all text-lg"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00b48f] transition-colors w-6 h-6" />
        </form>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-6 py-4 rounded-2xl border transition-all font-bold ${
              isFilterOpen 
                ? 'bg-teal-50 border-teal-200 text-teal-700 shadow-inner' 
                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 shadow-sm'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span>Filters</span>
          </button>

          <div className="relative group min-w-[160px]">
            <select
              value={sort}
              onChange={(e) => updateQuery({ sort: e.target.value })}
              className="w-full h-full bg-white border border-gray-200 rounded-2xl px-6 py-4 text-gray-700 font-bold outline-none cursor-pointer appearance-none shadow-sm group-hover:border-gray-300 transition-all"
            >
              <option value="latest">Latest Props</option>
              <option value="demanding">Demanding</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
            <ArrowUpDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Expandable Filter Panel */}
      {isFilterOpen && (
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Listing Type */}
            <div className="space-y-3">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Listing Type</label>
              <div className="flex bg-gray-50 rounded-xl p-1 border border-gray-100">
                {['all', 'Rent', 'Sale'].map((t) => (
                  <button
                    key={t}
                    onClick={() => updateQuery({ type: t === 'all' ? null : t })}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                      listingType === t ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Property Type */}
            <div className="space-y-3">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Property Type</label>
              <select 
                value={propertyType}
                onChange={(e) => updateQuery({ property_type: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-gray-700 font-bold outline-none"
              >
                <option value="">All Types</option>
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa / Row House</option>
                <option value="Plots">Plot / Land</option>
                <option value="Office">Office Space</option>
                <option value="Agriculture Land">Agriculture Land</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Price Range</label>
              <select 
                value={priceRange}
                onChange={(e) => updateQuery({ price_range: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-gray-700 font-bold outline-none"
              >
                <option value="">Any Price</option>
                <option value="0-5000000">Under 50 Lakhs</option>
                <option value="5000000-10000000">50 Lakhs - 1 Cr</option>
                <option value="10000000-50000000">1 Cr - 5 Cr</option>
                <option value="50000000-999999999">5 Cr+</option>
              </select>
            </div>

            {/* Verified Agents Toggle */}
            <div className="space-y-3">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Trust Badge</label>
              <button
                onClick={() => updateQuery({ verified: isVerified ? null : 'true' })}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all font-bold ${
                  isVerified 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={isVerified ? 'text-blue-500' : 'text-gray-400'}>👮</span>
                  Verified Agents
                </span>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${isVerified ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isVerified ? 'left-4.5' : 'left-0.5'}`} />
                </div>
              </button>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
             <div className="flex gap-2">
                {[listingType !== 'all', propertyType, priceRange, isVerified, sort !== 'latest', search].some(Boolean) && (
                   <button 
                     onClick={clearFilters}
                     className="text-sm font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                   >
                     <X className="w-4 h-4" /> Reset All
                   </button>
                )}
             </div>
             <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                Bhavyam Search Protocol v1.0
             </p>
          </div>
        </div>
      )}
    </div>
  );
}
