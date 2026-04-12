'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function LatestProperties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'Sell' | 'Buy' | 'Rent'>('Sell');

  useEffect(() => {
    const fetchProps = async () => {
      setLoading(true);
      
      const { data } = await supabase
        .from('properties')
        .select(`
          id,
          property_type,
          listing_type,
          price,
          city,
          area,
          media:property_media(url, media_type)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (data) setProperties(data);
      setLoading(false);
    };

    fetchProps();
  }, [filter]);

  return (
    <section className="py-24 px-4 md:px-8 bg-[var(--color-warm-ivory)] relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 relative gap-8">
           <div className="relative z-10 text-center md:text-left">
              {/* Subtle Label Text */}
              <div 
                className="absolute -top-14 left-1/2 md:-left-8 -translate-x-1/2 md:translate-x-0 text-7xl md:text-9xl font-black text-[var(--color-deep-navy)] opacity-5 select-none z-[-1] pointer-events-none tracking-widest whitespace-nowrap" 
              >
                Properties
              </div>
              
              <div className="relative z-10 flex flex-col items-center md:items-start">
                <p className="text-[var(--color-emerald-heritage)] font-bold text-[10px] md:text-sm tracking-[0.2em] uppercase mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-emerald-heritage)]"></span>
                  Our Properties
                </p>
                <h2 className="text-3xl md:text-[42px] font-black tracking-[-0.04em] text-[var(--color-near-black)]">Latest Properties</h2>
              </div>
           </div>

           {/* Filters */}
           <div className="flex flex-wrap justify-center gap-3 md:gap-4 relative z-10">
             {['Sell', 'Buy', 'Rent'].map((type) => (
                <button 
                  key={type}
                  onClick={() => setFilter(type as any)}
                  className={`px-6 md:px-8 py-2 md:py-2.5 rounded-full font-semibold transition-all duration-300 border text-xs md:text-base ${
                    filter === type 
                      ? 'bg-[var(--color-emerald-heritage)] text-white border-[var(--color-emerald-heritage)] shadow-lg shadow-[#006B54]/20' 
                      : 'bg-transparent text-[var(--color-slate)] border-[var(--color-ghost)] hover:bg-[var(--color-emerald-heritage)]/10 text-[var(--color-near-black)] border-opacity-30'
                  }`}
                >
                  {type}
                </button>
             ))}
           </div>
        </div>

        {/* Content Grid */}
        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[1,2,3].map(i => <div key={i} className="bg-white h-[450px] animate-pulse rounded-lg border border-gray-100"></div>)}
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {properties.map(prop => {
               const mainImage = prop.media && prop.media.length > 0 && prop.media[0].media_type === 'image'
                 ? prop.media[0].url 
                 : 'https://placehold.co/600x400/eeeeee/999999?text=Cover+Image';

               const formattedPrice = new Intl.NumberFormat('en-IN').format(prop.price);
               
               // Try to match display type for For Sell vs For Rent
               const listingTag = prop.listing_type?.toLowerCase() === 'rent' ? 'For Rent' : 'For Sell';

               return (
                 <div key={prop.id} className="bg-[var(--color-pure-white)] rounded-3xl shadow-[var(--shadow-ambient)] hover:shadow-[var(--shadow-ambient-hover)] transition-all duration-500 flex flex-col group relative h-full overflow-hidden">
                    
                    {/* Top Image Box Wrapper */}
                    <div className="relative">
                       
                       {/* Main Image Container */}
                       <div className="relative h-[260px] w-full bg-gray-100 overflow-hidden">
                         <img 
                           src={mainImage} 
                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                           alt={prop.property_type} 
                         />
                         
                         {/* Dark overlay at bottom for price visibility */}
                         <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>

                         {/* Price Overlaid Bottom Left */}
                         <div className="absolute bottom-5 left-5 text-white font-bold text-2xl drop-shadow-md flex items-end gap-1">
                           ₹ {formattedPrice} 
                           <span className="text-[13px] font-medium text-white/90 mb-1 ml-1 tracking-wide">(Negotiable)</span>
                         </div>

                         {/* Heart Icon Bottom Right */}
                         <button className="absolute bottom-5 right-5 text-white hover:text-red-500 transition-colors bg-white/10 backdrop-blur-sm border border-white/20 p-2 rounded-md hover:bg-white/30 text-xs">
                           <svg className="w-5 h-5 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                           </svg>
                         </button>
                       </div>

                     {/* Hanging badge - position absolute relative to wrapper */}
                       <div className="absolute top-4 left-4 z-10">
                          <div className="bg-[var(--color-emerald-heritage)] text-white px-4 py-1 font-bold text-xs tracking-[0.05em] uppercase rounded-full shadow-md">
                            {listingTag}
                          </div>
                       </div>

                       {/* Property type badge overlapping the bottom edge */}
                       <div className="absolute -bottom-3 left-6 bg-[var(--color-pure-white)] text-[var(--color-emerald-heritage)] text-[12px] font-black uppercase tracking-[0.05em] px-4 py-1.5 rounded-full shadow-md z-20">
                         {prop.property_type || 'Plots'}
                       </div>

                    </div>

                    {/* Middle Content */}
                    <div className="px-6 pt-8 pb-5 flex-1 bg-[var(--color-pure-white)] text-left">
                       <Link href={`/properties/${prop.id}`}>
                         <h3 className="text-[22px] font-bold text-[var(--color-near-black)] hover:text-[var(--color-emerald-heritage)] transition-colors mb-2.5">
                            {prop.area ? `${prop.area} ` : ''}{prop.property_type || 'property'}
                         </h3>
                       </Link>
                       <p className="text-[var(--color-slate)] text-[14px] flex items-center gap-1.5 font-medium">
                         <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                         </svg>
                         {prop.city}
                       </p>
                    </div>

                    {/* Footer */}
                    <div className="px-6 pb-6 pt-2 bg-[var(--color-pure-white)] flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[var(--color-cloud)] overflow-hidden flex items-center justify-center shrink-0 text-gray-400">
                             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                             </svg>
                          </div>
                          <div className="text-[12px] font-bold text-[var(--color-near-black)] leading-tight uppercase tracking-[0.05em]">
                             By Bhavyam<br/><span className="text-[var(--color-slate)] font-medium">Properties</span>
                          </div>
                       </div>
                       <Link 
                         href={`/properties/${prop.id}`} 
                         className="bg-[var(--color-emerald-heritage)] text-white text-[12px] font-bold px-6 py-2.5 rounded-full hover:bg-[var(--color-electric-mint-glow)] hover:text-[var(--color-deep-navy)] transition-colors uppercase tracking-[0.1em]"
                       >
                          Details
                       </Link>
                    </div>

                 </div>
               );
             })}
           </div>
        )}

      </div>
    </section>
  );
}
