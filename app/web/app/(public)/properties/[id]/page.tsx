'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import PropertyUnlocker from '@/components/property/PropertyUnlocker';
import InterestButton from '@/components/property/InterestButton';
import ReviewSystem from '@/components/property/ReviewSystem';
import MortgageCalculator from '@/components/property/MortgageCalculator';
import PremiumLoader from '@/components/ui/PremiumLoader';

export default function PropertyDetailsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [property, setProperty] = useState<any>(null);
  const [latestListings, setLatestListings] = useState<any[]>([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState<number | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      // 1. Fetch Property details
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
          address,
          description,
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

      // 2. Access Check
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role, subscription_plan, subscription_expires_at').eq('id', user.id).single();
        if (profile?.role === 'admin' || (profile?.subscription_plan !== 'free' && (!profile?.subscription_expires_at || new Date(profile.subscription_expires_at) > new Date()))) {
           setIsUnlocked(true);
        } else {
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
    return (
      <main className="bg-white min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Skeleton Left Column */}
          <div className="flex-1 w-full lg:w-[60%] flex flex-col gap-6">
             <div className="w-full aspect-[4/3] rounded-3xl bg-gray-200 animate-pulse"></div>
             <div className="w-3/4 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
             <div className="w-1/2 h-6 bg-gray-200 rounded-lg animate-pulse"></div>
             <div className="space-y-3 mt-4">
                <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-5/6 h-4 bg-gray-200 rounded animate-pulse"></div>
             </div>
          </div>
          {/* Skeleton Right Column */}
          <div className="w-full lg:w-[40%] flex flex-col gap-6">
             <div className="grid grid-cols-2 gap-3">
               <div className="aspect-[4/5] rounded-2xl bg-gray-200 animate-pulse"></div>
               <div className="aspect-[4/5] rounded-2xl bg-gray-200 animate-pulse"></div>
             </div>
             <div className="w-full h-64 bg-gray-200 rounded-3xl animate-pulse mt-4"></div>
             <div className="w-full h-80 bg-gray-100 rounded-3xl animate-pulse mt-4"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!property) return notFound();

  const images = property.media?.filter((m: any) => m.media_type === 'image') || [];
  const videos = property.media?.filter((m: any) => m.media_type === 'video') || [];
  const allMedia = [...images, ...videos];

  const hasMainVideo = videos.length > 0;
  const mainMediaUrl = hasMainVideo ? videos[0].url : (images.length > 0 ? images[0].url : 'https://placehold.co/1200x600/eeeeee/999999?text=Unavailable');
  
  const displayImages = images.slice(1, 6); // Up to 5 thumb images for the right sidebar

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
  };
  const actualPrice = formatPrice(property.price);
  const displayedPrice = actualPrice;

  const factFeatures = [
    { icon: '🏠', label: property.property_type },
    { icon: '📏', label: property.area },
    { icon: '🏷️', label: property.pricing_type },
    { icon: '✨', label: property.status },
    { icon: '📍', label: property.city }
  ];

  return (
    <main className="bg-white min-h-screen pt-24 pb-20 font-sans text-gray-900">
      
      {/* Lightbox / Fullscreen Carousel */}
      {carouselIndex !== null && allMedia.length > 0 && (
         <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300" onClick={() => setCarouselIndex(null)}>
           <button onClick={() => setCarouselIndex(null)} className="absolute top-8 right-8 text-white w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition cursor-pointer z-50">
             ✕
           </button>
           
           <button onClick={(e) => { e.stopPropagation(); setCarouselIndex(prev => prev !== null && prev > 0 ? prev - 1 : allMedia.length - 1); }} className="absolute left-4 md:left-10 text-white/30 hover:text-white transition-all p-4 z-[1100] hidden sm:block cursor-pointer">
             <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
           </button>

           {allMedia[carouselIndex].media_type === 'image' ? (
             <img src={allMedia[carouselIndex].url} className="max-w-[90vw] max-h-[85vh] object-contain" alt="Gallery View"/>
           ) : (
             <video src={allMedia[carouselIndex].url} autoPlay controls className="max-w-[90vw] max-h-[85vh]" />
           )}

           <button onClick={(e) => { e.stopPropagation(); setCarouselIndex(prev => prev !== null && prev < allMedia.length - 1 ? prev + 1 : 0); }} className="absolute right-4 md:right-10 text-white/30 hover:text-white transition-all p-4 z-[1100] hidden sm:block cursor-pointer">
             <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
           </button>
         </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column (Main Content) */}
          <div className="flex-1 w-full lg:w-[60%] flex flex-col">
            
            {/* Main Image Banner */}
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden mb-6 group cursor-pointer" onClick={() => setCarouselIndex(hasMainVideo ? allMedia.indexOf(videos[0]) : 0)}>
              {hasMainVideo ? (
                <video src={mainMediaUrl} muted loop playsInline className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              ) : (
                <img src={mainMediaUrl} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" alt="Main Property" />
              )}
              
              {/* Overlay Top Right actions */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition">
                  <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </button>
                <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition">
                  <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                </button>
              </div>

              {/* Play Button Overlay (Only for Video) */}
              {hasMainVideo && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <div className="w-16 h-16 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 pointer-events-auto shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-110 hover:bg-white/40 transition cursor-pointer">
                      <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                   </div>
                </div>
              )}

              {/* Discover Story Float */}
              {videos.length > 0 && (
                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md p-2 rounded-xl flex items-center gap-3 shadow-xl pr-6 cursor-pointer" onClick={() => setCarouselIndex(allMedia.indexOf(videos[0]))}>
                   <div className="w-16 h-12 rounded-lg overflow-hidden relative">
                      <video src={videos[0].url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20"><div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-white border-b-[4px] border-b-transparent"></div></div>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-xs text-gray-500 font-medium">Discover Our</span>
                      <span className="text-sm font-bold text-gray-900 leading-tight">Villas <span className="italic font-normal">Story</span></span>
                   </div>
                </div>
              )}
            </div>

            {/* Title & Price Row */}
            <div className="flex flex-wrap items-start justify-between gap-4 py-4 border-b border-gray-100">
               <div>
                 <div className="flex items-center gap-2 mb-2">
                    <span className="bg-teal-50 text-teal-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-teal-100 shadow-sm">
                      For {property.listing_type}
                    </span>
                 </div>
                 <h1 className="text-4xl font-semibold tracking-tight text-gray-900 mb-2 capitalize">
                   {property.property_type} in {property.city}
                 </h1>
                 <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                   <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg> {property.area}, {property.city}</span>
                   <span className="flex items-center gap-1 text-orange-400"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg> 5.0</span>
                 </div>
               </div>
               <div className="text-right">
                 <div className="flex items-baseline gap-1">
                   <h2 className="text-3xl font-bold tracking-tight text-gray-900">{displayedPrice}</h2>
                   <span className="text-sm font-semibold text-gray-500 uppercase">INR</span>
                 </div>
               </div>
            </div>

            {/* Description */}
            <div className="py-8 border-b border-gray-100">
              <h3 className="text-xl font-medium text-gray-900 mb-4">Property Description</h3>
              <p className="text-gray-500 leading-relaxed text-[15px] whitespace-pre-wrap">
                {property.description || "Crafted to inspire, this beautiful property blends modern curves, warm lighting, and natural textures to create a living experience like no other. Every detail from the flowing architecture to the curated materials has been designed to elevate comfort, beauty, and functionality.\n\nThe expansive living area catches natural sunlight throughout the day, while the panoramic views transform each moment into a living work of art."}
              </p>
            </div>

            {/* Fact & Features */}
            <div className="py-8">
              <h3 className="text-xl font-medium text-gray-900 mb-6">Fact & Features</h3>
              <div className="flex flex-wrap gap-3">
                {factFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition cursor-default">
                    <span>{feature.icon}</span>
                    <span className="capitalize">{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Property Unlocker (Custom Integration Below Grid) */}
            <div className="py-8 border-t border-gray-100 mt-4">
               <h3 className="text-xl font-medium text-gray-900 mb-4">Secure Assets & Map</h3>
               <div className="bg-gray-50 rounded-3xl overflow-hidden border border-gray-200">
                 <PropertyUnlocker propertyId={property.id} />
               </div>
            </div>

          </div>

          {/* Right Column (Sidebar: Images, Agent, Form) */}
          <div className="w-full lg:w-[40%] flex flex-col gap-6 lg:pl-4">
            
            {/* 1. Masonry Image Grid Sidebar */}
            <div className="grid grid-cols-2 gap-3 mb-2">
               {/* Top 2 large columns */}
               {displayImages.slice(0, 2).map((img: any, i: number) => (
                  <div key={`l-${i}`} className="aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer group" onClick={() => setCarouselIndex(i + 1)}>
                     <img src={img.url} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="Detail" />
                  </div>
               ))}
            </div>
            {/* Bottom tiny thumbnails row */}
            {displayImages.length > 2 && (
              <div className="grid grid-cols-4 gap-2 mb-2">
                {displayImages.slice(2, 6).map((img: any, i: number) => (
                  <div key={`s-${i}`} className="aspect-square rounded-xl overflow-hidden cursor-pointer group relative" onClick={() => setCarouselIndex(i + 3)}>
                    <img src={img.url} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt="Thumb" />
                    {i === 3 && allMedia.length > 6 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">+{allMedia.length - 6}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

             {/* 2. Meet Your Agent Card */}
            <div className="bg-[#f0f0f0] p-6 rounded-3xl mt-4">
               <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Gateway</h3>
               <div className="flex items-center gap-4 mb-5">
                 <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-gray-300">
                    <svg className="w-8 h-8 text-white mt-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                 </div>
                 <div>
                   <h4 className="font-semibold text-gray-900 text-sm">Bhavyam Properties</h4>
                   <p className="text-[#00b48f] text-xs font-semibold">Official Representation</p>
                 </div>
               </div>
               {/* Phone + Email side by side */}
               <div className="flex gap-2 mb-4">
                 <a href="tel:+919876543210" className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium text-gray-700 hover:border-[#00b48f] hover:text-[#00b48f] transition">
                   <span className="text-base">📞</span>
                   <span>+91 98765 43210</span>
                 </a>
                 <a href="mailto:admin@bhavyamproperties.com" className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium text-gray-700 hover:border-[#00b48f] hover:text-[#00b48f] transition">
                   <span className="text-base">✉️</span>
                   <span className="truncate">admin@...</span>
                 </a>
               </div>
               <div className="flex flex-col gap-3">
                 <div className="w-full">
                   <style dangerouslySetInnerHTML={{__html: `
                     .custom-interest-btn > div > button {
                       background-color: #e4e4e4 !important;
                       color: #1f2937 !important;
                       box-shadow: none !important;
                       border-radius: 0.75rem !important;
                       padding: 0.75rem !important;
                     }
                     .custom-interest-btn > div > button:hover {
                       background-color: #d8d8d8 !important;
                     }
                   `}} />
                   <div className="custom-interest-btn -mt-8">
                     <InterestButton propertyId={property.id} />
                   </div>
                 </div>
                 <button onClick={() => setShowAdminModal(true)} className="w-full py-3 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl text-sm transition shadow-md">Contact Admin</button>
               </div>
            </div>

            {/* Admin Popup Modal */}
            {showAdminModal && (
              <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowAdminModal(false)}>
                 <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 text-center relative" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setShowAdminModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
                    <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-teal-100 text-2xl">
                      👑
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">Bhavyam Admin</h3>
                    <p className="text-sm text-gray-400 mb-6 font-normal">Please quote the Property ID when contacting directly.</p>
                    
                    <div className="flex gap-3">
                       <a href="mailto:admin@bhavyamproperties.com" className="flex-1 bg-gray-50 p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-gray-100 transition border border-gray-100 group">
                         <span className="text-2xl group-hover:scale-110 transition-transform">✉️</span>
                         <span className="text-xs font-medium text-gray-700 text-center leading-tight">admin@bhavyam<br/>properties.com</span>
                       </a>
                       <a href="tel:+919876543210" className="flex-1 bg-gray-50 p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-gray-100 transition border border-gray-100 group">
                         <span className="text-2xl group-hover:scale-110 transition-transform">📞</span>
                         <span className="text-xs font-medium text-gray-700 text-center">+91 98765<br/>43210</span>
                       </a>
                    </div>
                 </div>
              </div>
            )}

            {/* Mortgage Calculator */}
            <div className="mt-4">
              <MortgageCalculator />
            </div>

            {/* Property Loan Card */}
            <div className="mt-4 bg-[#1a1a1a] rounded-3xl p-6 relative overflow-hidden group cursor-pointer hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
              <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/5 group-hover:bg-white/10 transition-all duration-500 group-hover:scale-125" />
              <div className="text-white mb-5 relative z-10">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <line x1="2" y1="10" x2="22" y2="10"/>
                  <path d="M7 15h2m4 0h4"/>
                </svg>
              </div>
              <h3 className="text-white text-lg font-semibold mb-1.5 relative z-10">Property Loan</h3>
              <p className="text-white/60 text-sm leading-relaxed relative z-10 mb-5">Get expert guidance and quick approvals for home and property loans.</p>
              <a href="/contact" className="relative z-10 inline-flex items-center gap-1.5 text-white/80 hover:text-white text-xs font-semibold tracking-wide transition-all">
                Inquire Now
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>

          </div>
        </div>

        {/* Explore Similar Properties (Bottom Grid) */}
        {latestListings.length > 0 && (
          <div className="mt-24 border-t border-gray-100 pt-16">
            <h2 className="text-3xl font-semibold mb-1 text-gray-900 tracking-tight">Explore Similar</h2>
            <h2 className="text-3xl italic font-serif text-gray-900 mb-10">Properties</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {latestListings.map((l: any) => {
                 const lImg = l.media?.find((x:any) => x.media_type==='image')?.url || 'https://placehold.co/600x800/eeeeee/999999?text=Cover';
                 return (
                   <Link href={`/properties/${l.id}`} key={l.id} className="relative aspect-[3/4] md:aspect-[3/4.5] lg:aspect-[3/4] rounded-3xl overflow-hidden group">
                     {/* Background Image */}
                     <img src={lImg} className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-105" alt="similar" />
                     {/* Bottom Gradient overlay */}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-8">
                       <div className="flex justify-between items-end mb-2">
                         <h3 className="text-white font-semibold text-lg md:text-xl line-clamp-1">{l.property_type}</h3>
                         <span className="text-white font-bold text-sm bg-black/40 backdrop-blur-md px-2 py-1 rounded-md ml-2 shrink-0">
                           {formatPrice(l.price)}
                         </span>
                       </div>
                       <p className="text-gray-300 text-xs font-medium flex items-center gap-1.5 line-clamp-1">
                         <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                         {l.city}
                       </p>
                     </div>
                   </Link>
                 )
               })}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-24 border-t border-gray-100 pt-16">
            <h2 className="text-3xl font-semibold mb-1 text-gray-900 tracking-tight">Our Clients</h2>
            <h2 className="text-3xl italic font-serif text-gray-900 mb-10">Speak Boldly.</h2>
            <ReviewSystem propertyId={property.id} />
        </div>

      </div>
    </main>
  );
}
