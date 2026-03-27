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
  const [isUnlocked, setIsUnlocked] = useState(false);
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

      // 2. Performance Access Check
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check for Admin or Pro Plan
        const { data: profile } = await supabase.from('profiles').select('role, subscription_plan, subscription_expires_at').eq('id', user.id).single();
        if (profile?.role === 'admin' || (profile?.subscription_plan !== 'free' && (!profile?.subscription_expires_at || new Date(profile.subscription_expires_at) > new Date()))) {
           setIsUnlocked(true);
        } else {
           // Check for specific unlock
           const { data: rpcAccess } = await supabase.rpc('check_property_access', { p_property_id: id });
           if (rpcAccess) setIsUnlocked(true);
        }
      }

      // 3. Fetch Latest Listings
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

  // Format Prices
  const actualPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(property.price);

  const priceStr = property.price?.toString() || '0';
  const firstDigit = priceStr.charAt(0);
  const remainingLen = priceStr.length - 1;
  const dummyPriceStr = firstDigit + '0'.repeat(remainingLen);
  const formattedDummy = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(parseInt(dummyPriceStr));
  const maskedPrice = formattedDummy.replace(/0/g, 'x');

  const displayedPrice = isUnlocked ? actualPrice : maskedPrice;

  return (
    <main className="bg-[#fbfcfa] min-h-screen pt-20">
      {/* Hero Section with Immersive Backdrop */}
      <div className="relative w-full h-[70vh] bg-zinc-900 group">
        <img 
           src={mainImage}
           alt={property.property_type} 
           className="w-full h-full object-cover opacity-60 transition-transform duration-10000 group-hover:scale-110"
        />
        
        {/* Complex Gradient Overlays for Readability */}
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-[#fbfcfa]"></div>
        <div className="absolute inset-0 bg-linear-to-r from-black/60 via-transparent to-transparent"></div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="max-w-[1400px] xl:max-w-7xl w-full px-6 md:px-16 flex flex-col md:flex-row justify-between items-end gap-12 pointer-events-auto">
              
              {/* Left Title Area */}
              <div className="text-white text-left animate-in slide-in-from-left-8 duration-700">
                 <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className="bg-[#00b48f] text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                       {property.listing_type}
                    </span>
                    <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">
                       {property.property_type}
                    </span>
                    <span className="bg-blue-500/20 backdrop-blur-md text-blue-200 border border-blue-400/30 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] flex items-center gap-1.5">
                       <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                       Verified
                    </span>
                 </div>
                 
                 <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-4 leading-tight drop-shadow-2xl">
                    <span className="block text-[#00ecbd] opacity-40 text-2xl font-black tracking-[0.3em] uppercase mb-2">Available in {property.city}</span>
                    {property.property_type.split(' ')[0]} <br/>
                    <span className="text-white/40">{property.property_type.split(' ').slice(1).join(' ') || 'Estate'}</span>
                 </h1>
                 
                 <div className="flex items-center gap-6 mt-8">
                    <div className="flex flex-col">
                       <span className="text-gray-400 text-[10px] uppercase font-black tracking-widest mb-1">Region</span>
                       <span className="text-white font-bold text-lg">{property.city}</span>
                    </div>
                    <div className="w-px h-10 bg-white/20"></div>
                    <div className="flex flex-col">
                       <span className="text-gray-400 text-[10px] uppercase font-black tracking-widest mb-1">Total Scale</span>
                       <span className="text-white font-bold text-lg">{property.area}</span>
                    </div>
                 </div>
              </div>

              {/* Right Price Highlight Card */}
              <div className="relative group/price animate-in slide-in-from-right-8 duration-700 delay-200">
                 <div className="absolute -inset-1 bg-[#00b48f] rounded-4xl blur opacity-25 group-hover/price:opacity-50 transition duration-1000"></div>
                 <div className="relative bg-zinc-950/80 backdrop-blur-2xl border border-white/10 p-8 md:p-10 rounded-4xl shadow-2xl flex flex-col items-end min-w-[300px]">
                    <p className="text-[#00ecbd] text-[10px] uppercase tracking-[0.4em] font-black mb-4 w-full text-right opacity-80 underline decoration-[#00b48f] decoration-2 underline-offset-8">Asking Price</p>
                    <div className="flex items-baseline gap-2">
                       <span className="text-6xl md:text-7xl font-black text-white tracking-tighter">{displayedPrice}</span>
                    </div>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-6 bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800">
                       Negotiable Payment Plan Available
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Modern Floating Header Bar for Mobile Actions */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-gray-100 p-4 z-50 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
         <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pricing</span>
            <span className="text-lg font-black text-[#00579e]">{displayedPrice}</span>
         </div>
         <Link href="#interest-form" className="bg-[#00b48f] text-white px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest shadow-lg active:scale-95">
            Express Interest
         </Link>
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
                              {(() => {
                                if (isUnlocked) {
                                  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(l.price);
                                }
                                const pStr = l.price.toString();
                                const fDigit = pStr.charAt(0);
                                const dPriceStr = fDigit + '0'.repeat(pStr.length - 1);
                                const fDummy = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(parseInt(dPriceStr));
                                return fDummy.replace(/0/g, 'x');
                              })()}
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
