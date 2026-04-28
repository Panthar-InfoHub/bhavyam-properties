'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import PropertyCard from '@/components/property/PropertyCard';
export default function LatestProperties() {
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

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
                  onClick={async () => {
                    if (type === 'Buy') {
                      router.push('/properties');
                      return;
                    }
                    
                    const user = await getCurrentUser();
                    if (!user) {
                      toast.error("Please sign up first");
                      return;
                    }
                    
                    router.push('/dashboard');
                  }}
                  className={`px-6 md:px-8 py-2 md:py-2.5 rounded-full font-semibold transition-all duration-300 border text-xs md:text-base ${
                    type === 'Buy' 
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
               return (
                 <div key={prop.id} className="h-full">
                    <PropertyCard property={prop} />
                 </div>
               );
             })}
           </div>
        )}

      </div>
    </section>
  );
}
