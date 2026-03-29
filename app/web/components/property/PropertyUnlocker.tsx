"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PhoneVerificationModal from '@/components/auth/PhoneVerificationModal';
import toast from 'react-hot-toast';
import Script from 'next/script';

export default function PropertyUnlocker({ propertyId }: { propertyId: string }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [pendingPlan, setPendingPlan] = useState<any | null>(null);
  const [isUnlocking, setIsUnlocking] = useState<string | null>(null); // planId
  const [securedData, setSecuredData] = useState<any>(null);
  const [accessType, setAccessType] = useState<'plan' | 'unlock' | 'admin' | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchPlans() {
      const { data } = await supabase.from('plans').select('*').eq('is_active', true);
      setPlans(data || []);
    }
    fetchPlans();
  }, []);

  const fetchAccess = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      if (!currentUser) {
        setLoading(false);
        return;
      }

      const isAdmin = currentUser.profile?.role === 'admin';

      // 1. Check RPC for access (or bypass if Admin)
      let hasAccess = false;
      if (isAdmin) {
        hasAccess = true;
      } else {
        const { data: rpcAccess, error: accessError } = await supabase.rpc('check_property_access', {
          p_property_id: propertyId
        });
        if (accessError) throw accessError;
        hasAccess = rpcAccess;
      }

      if (hasAccess) {
        // Fetch the data
        const { data: secureProp, error: fetchError } = await supabase
          .from('properties')
          .select(`
            address,
            map_url,
            price,
            owner_id,
            owner:profiles (id, first_name, last_name, phone_number, role),
            media:property_media (url, media_type)
          `)
          .eq('id', propertyId)
          .single();
          
        if (fetchError) throw fetchError;
        setSecuredData(secureProp);

        if (isAdmin) {
          setAccessType('admin');
          setExpiresAt('2099-12-31T23:59:59Z');
        } else {
          const { data: unlock } = await supabase
            .from('property_unlocks')
            .select('expires_at')
            .eq('user_id', currentUser.id)
            .eq('property_id', propertyId)
            .gt('expires_at', new Date().toISOString())
            .maybeSingle();

          if (unlock) {
            setAccessType('unlock');
            setExpiresAt(unlock.expires_at);
          } else {
            setAccessType('plan');
            setExpiresAt(currentUser.profile?.subscription_expires_at);
          }
        }
      }
    } catch (err) {
      console.error("Error checking access:", err);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchAccess();
  }, [fetchAccess]);

  const handleUnlockRequest = (plan: any) => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!user.profile?.phone_number) {
      setPendingPlan(plan);
      setShowPhoneModal(true);
      return;
    }

    executeUnlock(plan);
  };

  const executeUnlock = async (plan: any) => {
    setIsUnlocking(plan.id);
    try {
      // Direct Simulation: Artificial delay for premium feel
      await new Promise(resolve => setTimeout(resolve, 1500));

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User session not found");

      // 1. Log Transaction
      const { error: txError } = await supabase.from('transactions').insert({
        user_id: user.id,
        property_id: propertyId,
        amount: plan.price,
        currency: 'INR',
        status: 'completed',
        payment_type: plan.type,
      });
      if (txError) throw txError;

      // 2. Update Access
      if (plan.type === 'subscription') {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + (plan.duration_days || 30));

        const { error: profError } = await supabase.from('profiles').update({
          subscription_plan: plan.name,
          subscription_expires_at: expiry.toISOString(),
          plan_id: plan.id
        }).eq('id', user.id);
        if (profError) throw profError;
      } else if (plan.type === 'single_unlock' && propertyId) {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + (plan.duration_days || 7));

        const { error: unlockError } = await supabase.from('property_unlocks').upsert({
          user_id: user.id,
          property_id: propertyId,
          expires_at: expiry.toISOString()
        });
        if (unlockError) throw unlockError;
      }

      toast.success(plan.type === 'subscription' ? "Subscription Active!" : "Property Details Unlocked!");
      fetchAccess();

    } catch (err: any) {
      toast.error(err.message || "Transaction failed");
    } finally {
      setIsUnlocking(null);
    }
  };

  const [carouselIndex, setCarouselIndex] = useState<number | null>(null);
  const images = securedData?.media?.filter((m: any) => m.media_type === 'image') || [];
  const otherMedia = securedData?.media?.filter((m: any) => m.media_type !== 'image') || [];

  const handlePrevImage = useCallback(() => {
    setCarouselIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);
  
  const handleNextImage = useCallback(() => {
    setCarouselIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  // Keyboard navigation for carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (carouselIndex === null) return;
      if (e.key === 'Escape') setCarouselIndex(null);
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'ArrowRight') handleNextImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [carouselIndex, handlePrevImage, handleNextImage]);

  if (loading) {
    return (
      <div className="bg-zinc-900 rounded-3xl p-8 shadow-2xl h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  const getMapEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('pb=') || url.includes('output=embed')) return url;
    const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) return `https://maps.google.com/maps?q=${match[1]},${match[2]}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    const placeMatch = url.match(/\/place\/([^\/]+)/);
    if (placeMatch) return `https://maps.google.com/maps?q=${encodeURIComponent(placeMatch[1].replace(/\+/g, ' '))}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    return url.includes('goo.gl') ? null : `https://maps.google.com/maps?q=${encodeURIComponent(url)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  const mapEmbedUrl = securedData?.map_url ? getMapEmbedUrl(securedData.map_url) : null;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      {showPhoneModal && user && (
        <PhoneVerificationModal 
          userId={user.id}
          onClose={() => setShowPhoneModal(false)}
          onSuccess={() => {
            setShowPhoneModal(false);
            if (pendingPlan) executeUnlock(pendingPlan);
            setPendingPlan(null);
          }}
        />
      )}

      {/* Full Screen Carousel Modal */}
      {carouselIndex !== null && images.length > 0 && (
        <div 
          className="fixed inset-0 z-9999 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300"
          onClick={() => setCarouselIndex(null)}
        >
           <div 
             className="relative w-full h-full flex flex-col items-center justify-center px-4 md:px-20"
             onClick={(e) => e.stopPropagation()}
           >
             <div className="w-full max-w-5xl flex justify-end mb-4 z-[10000]">
               <button 
                 onClick={(e) => { e.stopPropagation(); setCarouselIndex(null); }} 
                 className="flex items-center gap-2 bg-black/50 hover:bg-black/80 text-white/70 hover:text-white px-4 py-2 rounded-full transition-all border border-white/20 shadow-xl"
               >
                 <span className="text-xs font-bold uppercase tracking-widest">Close Gallery</span>
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
             </div>
             
             <button onClick={handlePrevImage} className="absolute left-4 md:left-10 text-white/50 hover:text-white hover:scale-110 transition-all p-4 z-[10000] hidden sm:block">
               <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
             </button>
             
             <div className="w-full flex justify-center items-center">
               <img 
                 src={images[carouselIndex].url} 
                 className="w-full max-w-5xl h-[60vh] md:h-[80vh] object-contain bg-black/30 rounded-xl shadow-2xl animate-in zoom-in-95 duration-200"
                 alt="Property view"
                 key={carouselIndex}
               />
             </div>
             
             <button onClick={handleNextImage} className="absolute right-4 md:right-10 text-white/50 hover:text-white hover:scale-110 transition-all p-4 z-[10000] hidden sm:block">
               <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
             </button>
           </div>
           
           <div 
             className="absolute bottom-6 w-full flex justify-center items-center gap-2 px-4 z-[10000]"
             onClick={(e) => e.stopPropagation()}
           >
             {images.length > 1 && images.map((_: any, idx: number) => (
                <button 
                  key={idx} 
                  onClick={() => setCarouselIndex(idx)}
                  className={`transition-all duration-300 rounded-full ${idx === carouselIndex ? 'w-8 h-2 bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`}
                />
             ))}
           </div>
        </div>
      )}

      {securedData ? (
        <div className="bg-zinc-900 rounded-3xl p-8 shadow-2xl flex flex-col h-full animate-in fade-in zoom-in duration-500 text-white text-left">
          <div className="flex justify-between items-start mb-6 border-b border-zinc-800 pb-4">
             <div>
                <h3 className="text-2xl font-bold text-[#00b48f] tracking-tight">Access Granted</h3>
                <p className="text-xs text-zinc-400 mt-1 uppercase tracking-widest font-bold">
                  Via {accessType === 'admin' ? 'Admin Privileges' : accessType === 'plan' ? 'Pro Monthly Plan' : 'Individual 7-Day Unlock'}
                </p>
             </div>
             {accessType !== 'admin' && expiresAt && (
               <div className="text-right">
                  <p className="text-[10px] text-zinc-500 uppercase font-black">Valid Until</p>
                  <p className="text-xs font-bold text-teal-400">{new Date(expiresAt).toLocaleDateString()}</p>
               </div>
             )}
          </div>
          
          <div className="space-y-4">
            
            <div className="bg-teal-500/10 p-5 rounded-2xl border border-teal-500/20">
              <p className="text-teal-400 text-[10px] uppercase font-black mb-2 flex items-center gap-1.5">
                 <span>💰</span> Actual Asking Price
              </p>
              <p className="font-black text-white text-3xl">
                 {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(securedData.price)}
              </p>
            </div>

            {/* Premium Photo Grid for Carousel */}
            {images.length > 0 && (
              <div className="bg-zinc-800/40 p-5 rounded-2xl border border-zinc-700/50">
                <p className="text-zinc-500 text-[10px] uppercase font-black mb-4 flex items-center gap-1.5">
                   <span className="text-teal-500">📸</span> Premium Photo Gallery
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {images.map((img: any, i: number) => (
                    <div 
                      key={i} 
                      onClick={() => setCarouselIndex(i)}
                      className={`relative rounded-xl overflow-hidden cursor-pointer group bg-zinc-800 ${i === 0 && images.length % 2 !== 0 ? 'col-span-2 aspect-video' : 'aspect-square'}`}
                    >
                      <img src={img.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100" alt="Thumbnail" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                         <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-zinc-800/40 p-5 rounded-2xl border border-zinc-700/50">
              <p className="text-zinc-500 text-[10px] uppercase font-black mb-2 flex items-center gap-1.5">
                 <span className="text-teal-500">📍</span> Exact Physical Address
              </p>
              <p className="font-bold text-white text-lg leading-relaxed mb-4">{securedData.address}</p>
              
              {securedData.map_url && (
                <div className="w-full">
                  {mapEmbedUrl ? (
                    <div className="rounded-xl overflow-hidden border border-zinc-700 h-48 mb-3">
                      <iframe
                         width="100%"
                         height="100%"
                         style={{ border: 0 }}
                         loading="lazy"
                         allowFullScreen
                         src={mapEmbedUrl}
                         className="grayscale hover:grayscale-0 transition-all duration-700"
                      ></iframe>
                    </div>
                  ) : null}
                  <a href={securedData.map_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 rounded-xl transition-colors text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Open in Google Maps
                  </a>
                </div>
              )}
            </div>

            <div className="bg-blue-500/10 p-5 rounded-2xl border border-blue-500/20">
              <p className="text-blue-400 text-[10px] uppercase font-black mb-2 flex items-center gap-1.5">
                 <span>ℹ️</span> Support Note
              </p>
              {accessType === 'admin' ? (
                <div className="space-y-3">
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    You are viewing this as an <strong>Admin</strong>. Direct contact and ownership data is visible.
                  </p>
                  <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-700/50 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 font-bold uppercase tracking-widest">Listed By</span>
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded uppercase font-black tracking-tighter text-[9px]">
                        {securedData.owner?.role || 'User'}
                      </span>
                    </div>
                    <Link 
                      href={`/admin/users/${securedData.owner?.id}`}
                      className="text-white font-black text-lg hover:text-teal-400 transition-colors flex items-center gap-2"
                    >
                      {securedData.owner?.first_name} {securedData.owner?.last_name}
                      <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-zinc-300">
                      <span className="text-teal-500">📞</span>
                      <span className="font-mono">{securedData.owner?.phone_number || 'No contact provided'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Owner contact details are kept confidential. To schedule a visit or negotiate, please use the <strong>Interest Form</strong>. An admin will facilitate the connection.
                </p>
              )}
            </div>

            {/* Other Media list (Docs, Video Links) */}
            {otherMedia.length > 0 && (
              <div className="bg-zinc-800/40 p-5 rounded-2xl border border-zinc-700/50">
                <p className="text-zinc-500 text-[10px] uppercase font-black mb-4 flex items-center gap-1.5">
                   <span className="text-teal-500">📄</span> Secured Legal Assets
                </p>
                <div className="flex flex-col gap-3">
                   {otherMedia.map((m: any, i: number) => (
                     <a key={i} href={m.url} target="_blank" className={`flex items-center gap-3 p-3 bg-zinc-900/50 rounded-xl text-sm transition-all border group ${m.media_type === 'video' ? 'text-teal-400 border-teal-500/20 hover:bg-teal-500/10' : 'text-blue-400 border-blue-500/20 hover:bg-blue-500/10'}`}>
                       <span className="text-xl group-hover:scale-110 transition-transform">{m.media_type === 'video' ? '🎥' : '📄'}</span> 
                       {m.media_type === 'video' ? 'Watch Video Tour' : `Legal Photocopy ${i+1}`}
                     </a>
                   ))}
                </div>
              </div>
            )}

          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col h-full border border-zinc-800">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00b48f] rounded-full blur-[80px] opacity-10 -mr-16 -mt-16"></div>
          
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-xl border border-zinc-700">
              <svg className="w-8 h-8 text-[#00b48f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Secured Details</h3>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-[250px]">
              Granular location data, direct owner contact, and legal documents are encrypted.
            </p>
          </div>

          <div className="space-y-4">
            {plans.map((plan) => (
              <button 
                key={plan.id}
                onClick={() => handleUnlockRequest(plan)}
                disabled={!!isUnlocking}
                className={`group w-full p-5 rounded-2xl transition-all text-left relative overflow-hidden active:scale-95 shadow-lg ${
                  plan.type === 'subscription' 
                    ? 'bg-[#00b48f] hover:bg-teal-400 border-none' 
                    : 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50'
                }`}
              >
                <div className="flex justify-between items-center relative z-10">
                  <div>
                    <p className={`text-xs font-black uppercase tracking-widest mb-1 ${plan.type === 'subscription' ? 'text-white/70' : 'text-teal-400'}`}>
                      {plan.type === 'subscription' ? 'Best Value' : 'Instant Access'}
                    </p>
                    <h4 className="text-white font-bold text-lg">{plan.name}</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-black text-xl">₹{plan.price}</p>
                  </div>
                </div>
                <p className={`text-[10px] font-bold uppercase mt-3 relative z-10 ${plan.type === 'subscription' ? 'text-white/80' : 'text-zinc-400'}`}>
                  {plan.description}
                </p>
                {isUnlocking === plan.id && (
                  <div className={`absolute inset-0 animate-pulse ${plan.type === 'subscription' ? 'bg-white/20' : 'bg-teal-500/10'}`}></div>
                )}
              </button>
            ))}
          </div>

          <p className="text-[9px] text-zinc-600 mt-8 text-center font-bold uppercase tracking-widest leading-loose">
            Secure Transaction via Bhavyam Gateway<br/>
            100% Refundable if documents are invalid
          </p>
       </div>
      )}
    </>
  );
}
