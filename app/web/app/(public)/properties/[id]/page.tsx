'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import PropertyUnlocker from '@/components/property/PropertyUnlocker';
import InterestButton from '@/components/property/InterestButton';
import ReviewSystem from '@/components/property/ReviewSystem';
import MortgageCalculator from '@/components/property/MortgageCalculator';

export default function PropertyDetailsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [property, setProperty] = useState<any>(null);
  const [latestListings, setLatestListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      // 1. Fetch Property details (using client-side supabase which has auth session)
      const { data: prop, error } = await supabase
        .from('properties')
        .select(`
          id,
          listing_type,
          property_type,
          pricing_type,
          price,
          city,
          area,
          status,
          media:property_media(url, media_type),
          map_url
        `)
        .eq('id', id)
        .single();

      if (error || !prop) {
        setIsLoading(false);
        return;
      }
      setProperty(prop);

      // 2. Fetch Latest Listings
      const { data: latest } = await supabase
        .from('properties')
        .select('id, property_type, listing_type, price, city, media:property_media(url, media_type)')
        .eq('status', 'approved')
        .neq('id', id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      setLatestListings(latest || []);
      setIsLoading(false);
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return <div className="p-24 flex justify-center pt-40"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div></div>;
  }

  if (!property) {
    notFound();
  }

  const mainImage = property.media && property.media.length > 0
    ? property.media[0].url
    : 'https://placehold.co/1200x600/eeeeee/999999?text=Image+Unavailable';

  const priceStr = property.price?.toString() || '0';
  const firstDigit = priceStr.charAt(0);
  const remainingLen = priceStr.length - 1;
  const dummyPriceStr = firstDigit + '0'.repeat(remainingLen);
  
  const formattedDummy = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(parseInt(dummyPriceStr));
  
  const formattedPrice = formattedDummy.replace(/0/g, 'x');

  return (
    <main className="bg-[#fbfcfa] min-h-screen pt-20">
      {/* Dynamic Header Layout */}
      <div className="relative w-full h-[60vh] bg-gray-100 flex items-center justify-center overflow-hidden">
        <img 
           src={mainImage}
           alt={property.property_type} 
           className="w-full h-full object-cover filter brightness-75"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
        
        <div className="absolute bottom-12 left-0 w-full px-6 md:px-16">
           <div className="max-w-[1400px] xl:max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
              <div className="text-white text-left">
                 <div className="flex items-center gap-3 mb-4">
                   <span className="bg-[#00b48f] text-white text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-widest shadow-md">
                    {property.listing_type}
                   </span>
                   <span className="bg-white/20 backdrop-blur-sm text-white border border-white/30 text-xs font-semibold px-3 py-1 rounded-sm uppercase tracking-widest">
                    {property.property_type}
                   </span>
                 </div>
                 <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-2 drop-shadow-md">
                   {property.property_type} in {property.city}
                 </h1>
                 <p className="text-xl md:text-2xl font-light text-gray-200">
                   General Location Overview
                 </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-2xl flex flex-col items-end">
                 <p className="text-gray-200 text-sm uppercase tracking-widest font-semibold mb-1 w-full text-right">Asking Price</p>
                 <span className="text-4xl font-black text-white">{formattedPrice}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Main Body Details Container */}
      <div className="relative -mt-6 max-w-[1400px] xl:max-w-7xl mx-auto px-4 md:px-8 xl:px-0 pb-24 z-10 block">
         <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-10 mb-12 flex flex-col lg:flex-row gap-10">
            
            {/* Left Content column */}
            <div className="flex-2 w-full lg:w-[65%] text-left">
              <h2 className="text-3xl font-extrabold text-[#00579e] mb-6 border-b border-gray-100 pb-4">
                Public Overview
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12 text-gray-700">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">Pricing Format</p>
                  <p className="text-lg font-bold capitalize">{property.pricing_type}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">Total Area</p>
                  <p className="text-lg font-bold capitalize">{property.area}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-lg font-bold uppercase text-teal-600 tracking-wider">
                    {property.status === 'approved' ? 'Available' : property.status}
                  </p>
                </div>
              </div>

              {/* Property Unlocker (Secure Details) */}
              <div className="mt-8 mb-8">
                <PropertyUnlocker propertyId={property.id} />
              </div>

              {/* Dynamic Approved Public Reviews Panel */}
              <ReviewSystem propertyId={property.id} />
            </div>

            {/* Right Locked Gate Action Card */}
            <div className="flex-1 w-full lg:w-[35%] flex flex-col gap-6 text-left">

               {/* Spam-Free Ideology Notice */}
               <div className="bg-teal-50 p-6 rounded-2xl border border-teal-100 text-sm text-teal-900 leading-relaxed shadow-sm">
                 <p className="font-black text-teal-800 mb-2 uppercase tracking-widest text-xs flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    Bhavyam Anti-Spam Promise
                 </p>
                 <p className="font-semibold mb-3">
                    We believe in a completely spam-free buying experience.
                 </p>
                 <p className="text-teal-800/80 mb-4">
                    Instead of having your number distributed openly, you can directly show your interest below. Our dedicated team will process your request and securely connect you with the seller, keeping your data completely private.
                 </p>
              </div>

              {/* Lead Generation Button block */}
              <InterestButton propertyId={property.id} />
              
              {/* Mortgage Calculator */}
              <MortgageCalculator />

              {/* Latest Listings */}
              {latestListings.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
                  <h3 className="text-xl font-bold text-gray-800">Latest Listings</h3>
                  <div className="flex flex-col gap-4">
                    {latestListings.map((l: any) => (
                      <Link href={`/properties/${l.id}`} key={l.id} className="group flex gap-3 items-center p-2 -mx-2 rounded-xl transition-all hover:bg-gray-50 cursor-pointer">
                        <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                           <img 
                             src={l.media && l.media.length > 0 && l.media[0].media_type === 'image' ? l.media[0].url : 'https://placehold.co/200x200/eeeeee/999999?text=Cover'} 
                             alt={l.property_type}
                             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                           />
                        </div>
                        <div className="flex-1">
                           <h4 className="font-bold text-gray-800 text-sm group-hover:text-[#00579e] transition-colors line-clamp-1">{l.property_type}</h4>
                           <p className="text-xs text-gray-500 font-semibold mb-1 line-clamp-1">{l.city}</p>
                           <p className="text-sm font-black text-[#00b48f]">
                             {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(l.price)}
                           </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

         </div>
      </div>
    </main>
  );
}
