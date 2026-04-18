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
  const [accessType, setAccessType] = useState<'plan' | 'unlock' | 'admin' | 'membership' | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [showUnlockOptions, setShowUnlockOptions] = useState(false);
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
          // Check for individual unlock first
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
          } else if (currentUser.profile?.subscription_plan === 'premium' && 
                     (!currentUser.profile?.subscription_expires_at || new Date(currentUser.profile.subscription_expires_at) > new Date())) {
            setAccessType('membership');
            setExpiresAt(currentUser.profile?.subscription_expires_at);
          } else {
            setAccessType(null); // No access
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
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error("User session not found");

      // 1. Create order on backend
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          planId: plan.id, 
          amount: plan.price, 
          propertyId: propertyId,
          payment_type: plan.type 
        }),
      });

      const order = await response.json();
      if (!response.ok) throw new Error(order.error || 'Failed to create order');

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Bhavyam Properties",
        description: plan.type === 'subscription' ? `Upgrade to ${plan.name}` : `Unlock ${securedData?.property_type || 'Property'}`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            toast.success("Payment received. Unlocking details...");
            
            // Verify payment on our backend to trigger immediate fulfillment
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId: plan.id,
                propertyId: propertyId
              })
            });

            if (!verifyRes.ok) {
              console.error("Instant Verification failed");
            } else {
              toast.success("Property unlocked successfully!");
              window.dispatchEvent(new Event('wallet-updated'));
            }
          } catch (err) {
             console.error("Verification error:", err);
          } finally {
            // Wait a moment then refresh access
            setTimeout(() => {
                fetchAccess();
                window.dispatchEvent(new Event('wallet-updated'));
            }, 1000);
          }
        },
        prefill: {
          email: authUser.email,
          contact: user.profile?.phone_number || "",
        },
        theme: {
          color: "#00b48f",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err: any) {
      toast.error(err.message || "Transaction failed");
    } finally {
      setIsUnlocking(null);
    }
  };

  const handleCreditUnlock = async () => {
    if (!user) return router.push('/login');
    if ((user.profile?.credits || 0) < 1) {
      toast.error("Insufficient credits. Please buy a credit pack.");
      return;
    }

    setIsUnlocking('spend_credit');
    try {
      // Find the "Standard" single unlock duration - usually from a plan or default to 7
      const singlePlan = plans.find(p => p.type === 'single_unlock');
      const duration = singlePlan?.duration_days || 7;

      const { data, error } = await supabase.rpc('spend_credit', {
        p_property_id: propertyId,
        p_duration_days: duration
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success("Credit spent successfully! Property unlocked.");
      fetchAccess();
      // Force Navbar to update wallet instantly
      window.dispatchEvent(new Event('wallet-updated'));
    } catch (err: any) {
      toast.error(err.message || "Failed to spend credit");
    } finally {
      setIsUnlocking(null);
    }
  };

  const otherMedia = securedData?.media?.filter((m: any) => m.media_type !== 'image' && m.media_type !== 'video') || [];

  if (loading) {
    return (
      <div className="bg-[#fbfbf8] border border-[#eeeae0] rounded-3xl p-8 shadow-sm h-full flex items-center justify-center">
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


      {securedData ? (
        <div className="bg-[#fbfbf8] border border-[#eeeae0] rounded-3xl p-8 shadow-sm flex flex-col h-full animate-in fade-in zoom-in duration-500 text-[#2d2a26] text-left">
          <div className="flex justify-between items-start mb-6 border-b border-[#eeeae0] pb-4">
              <div>
                <h3 className="text-2xl font-bold text-[#00b48f] tracking-tight">Access Granted</h3>
                <p className="text-xs text-[#8a8479] mt-1 uppercase tracking-widest font-bold">
                  Via {accessType === 'admin' ? 'Admin Privileges' : accessType === 'membership' ? 'Elite Membership (∞ Access)' : accessType === 'unlock' ? 'Property Unlock' : 'Active Plan'}
                </p>
              </div>
              {accessType !== 'admin' && accessType !== 'membership' && expiresAt && (
                <div className="text-right">
                   <p className="text-[10px] text-[#8a8479] uppercase font-black">Valid Until</p>
                   <p className="text-xs font-bold text-teal-600">{new Date(expiresAt).toLocaleDateString()}</p>
                </div>
              )}
              {accessType === 'membership' && (
                <div className="text-right">
                   <span className="text-[10px] bg-teal-500/10 text-teal-600 px-2 py-0.5 rounded font-black uppercase tracking-widest">Unlimited</span>
                </div>
              )}
          </div>
          
          <div className="space-y-4">
            
            <div className="bg-teal-500/5 p-5 rounded-2xl border border-teal-500/10">
              <p className="text-teal-600 text-[10px] uppercase font-black mb-2 flex items-center gap-1.5">
                 <span>💰</span> Actual Asking Price
              </p>
              <p className="font-black text-[#2d2a26] text-3xl">
                 {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(securedData.price)}
              </p>
            </div>


            <div className="bg-[#f3f0e6] p-5 rounded-2xl border border-[#eeeae0]">
              <p className="text-[#8a8479] text-[10px] uppercase font-black mb-2 flex items-center gap-1.5">
                 <span className="text-teal-500">📍</span> Exact Physical Address
              </p>
              <p className="font-bold text-[#2d2a26] text-lg leading-relaxed mb-4">{securedData.address}</p>
              
              {securedData.map_url && (
                <div className="w-full">
                  {mapEmbedUrl ? (
                    <div className="rounded-xl overflow-hidden border border-[#eeeae0] h-48 mb-3">
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
                  <a href={securedData.map_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full bg-[#eeeae0] hover:bg-[#e4e0d4] text-[#2d2a26] font-bold py-3 rounded-xl transition-colors text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Open in Google Maps
                  </a>
                </div>
              )}
            </div>

            <div className="bg-blue-500/5 p-5 rounded-2xl border border-blue-500/10">
              <p className="text-blue-600 text-[10px] uppercase font-black mb-2 flex items-center gap-1.5">
                 <span>ℹ️</span> Support Note
              </p>
              {accessType === 'admin' ? (
                <div className="space-y-3">
                  <p className="text-sm text-[#4a453e] leading-relaxed">
                    You are viewing this as an <strong>Admin</strong>. Direct contact and ownership data is visible.
                  </p>
                  <div className="bg-white p-4 rounded-xl border border-[#eeeae0] flex flex-col gap-2 shadow-sm">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#8a8479] font-bold uppercase tracking-widest">Listed By</span>
                      <span className="bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded uppercase font-black tracking-tighter text-[9px]">
                        {securedData.owner?.role || 'User'}
                      </span>
                    </div>
                    <Link 
                      href={`/admin/users/${securedData.owner?.id}`}
                      className="text-[#2d2a26] font-black text-lg hover:text-teal-600 transition-colors flex items-center gap-2"
                    >
                      {securedData.owner?.first_name} {securedData.owner?.last_name}
                      <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-[#4a453e]">
                      <span className="text-teal-600">📞</span>
                      <span className="font-mono">{securedData.owner?.phone_number || 'No contact provided'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#4a453e] leading-relaxed">
                  Owner contact details are kept confidential. To schedule a visit or negotiate, please use the <strong>Interest Form</strong>. An admin will facilitate the connection.
                </p>
              )}
            </div>

            {/* Other Media list (Docs, Video Links) */}
            {otherMedia.length > 0 && (
              <div className="bg-[#f3f0e6] p-5 rounded-2xl border border-[#eeeae0]">
                <p className="text-[#8a8479] text-[10px] uppercase font-black mb-4 flex items-center gap-1.5">
                   <span className="text-teal-500">📄</span> Secured Legal Assets
                </p>
                <div className="flex flex-col gap-3">
                   {otherMedia.map((m: any, i: number) => (
                     <a key={i} href={m.url} target="_blank" className={`flex items-center gap-3 p-3 bg-white rounded-xl text-sm transition-all border group ${m.media_type === 'video' ? 'text-teal-600 border-teal-500/20 hover:bg-teal-500/5' : 'text-blue-600 border-blue-500/20 hover:bg-blue-500/5'}`}>
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
        <div className="flex flex-col gap-8">
          {/* User Credits Status Bar */}
          {user && (
            <div className="bg-[#fbfbf8] border border-[#eeeae0] p-6 rounded-3xl flex items-center justify-between shadow-sm animate-in slide-in-from-top-4 duration-500">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-500/5 rounded-2xl flex items-center justify-center border border-teal-500/10">
                     <span className="text-2xl">💳</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#8a8479] font-black uppercase tracking-widest mb-0.5">Your Account Balance</p>
                    <p className="text-xl font-bold text-[#2d2a26] tracking-tight">{user.profile?.credits || 0} Credits Available</p>
                  </div>
               </div>
               <Link href="/membership" className="bg-[#00b48f] hover:bg-teal-400 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95">
                  Get More Credits
               </Link>
            </div>
          )}

          {/* Blurred Map Preview */}
          <div 
            onClick={() => setShowUnlockOptions(true)}
            className="group relative h-48 bg-white/50 rounded-3xl overflow-hidden border border-[#eeeae0] cursor-pointer shadow-sm"
          >
             {/* Map Content (More visible but blurred) */}
             <div className="absolute inset-0 grayscale blur-[8px] opacity-40 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=40.712776,-74.005974&zoom=14&size=600x300&key=AIza...')] bg-cover"></div>
             
             {/* Centered Lock Overlay with Glass effect */}
             <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-[2px] bg-white/30 group-hover:bg-white/10 transition-all">
                <div className="w-14 h-14 bg-white/80 rounded-full flex items-center justify-center mb-3 backdrop-blur-xl border border-white shadow-lg group-hover:scale-110 transition-transform">
                   <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <p className="text-[#2d2a26] font-black text-xs uppercase tracking-[0.2em] drop-shadow-sm">Unlock Property Map</p>
             </div>
          </div>

          {/* Blurred Documents Preview */}
          <div 
            onClick={() => setShowUnlockOptions(true)}
            className="group relative p-8 bg-white/50 rounded-3xl border border-[#eeeae0] cursor-pointer overflow-hidden shadow-sm"
          >
             {/* Document Content (More visible but blurred) */}
             <div className="flex flex-col gap-4 blur-[6px] opacity-30 select-none">
                <div className="h-4 bg-[#8a8479] rounded w-full"></div>
                <div className="h-4 bg-[#8a8479] rounded w-3/4"></div>
                <div className="h-4 bg-[#8a8479] rounded w-1/2"></div>
                <div className="h-4 bg-[#8a8479] rounded w-2/3"></div>
                <div className="h-4 bg-[#8a8479] rounded w-full"></div>
             </div>
             
             {/* Centered Lock Overlay with Glass effect */}
             <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-[2px] bg-white/30 group-hover:bg-white/10 transition-all">
                <div className="w-14 h-14 bg-white/80 rounded-full flex items-center justify-center mb-3 backdrop-blur-xl border border-white shadow-lg group-hover:scale-110 transition-transform">
                   <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <p className="text-[#2d2a26] font-black text-[10px] uppercase tracking-[0.2em] drop-shadow-sm">Unlock Legal Documents</p>
             </div>
          </div>

          {/* Unlock Modal/Overlay */}
          {showUnlockOptions && (
            <div className="fixed inset-0 z-9999 bg-[#2d2a26]/20 backdrop-blur-md flex items-center justify-center p-4">
               <div className="bg-[#fbfbf8] border border-[#eeeae0] rounded-4xl w-full max-w-lg p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
                  <button 
                    onClick={() => setShowUnlockOptions(false)}
                    className="absolute top-6 right-6 text-[#8a8479] hover:text-[#2d2a26] transition-colors"
                  >
                    ✕
                  </button>

                  <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 bg-[#00b48f]/5 rounded-2xl flex items-center justify-center mb-6">
                       <svg className="w-8 h-8 text-[#00b48f]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <h3 className="text-2xl font-black text-[#2d2a26] mb-2 uppercase tracking-tighter">Unlock Premium details</h3>
                    <p className="text-[#8a8479] text-sm leading-relaxed max-w-[300px]">
                      Access exact maps, direct owner contact and legal photocopies instantly.
                    </p>
                  </div>

                  {user && (
                    <div className="w-full bg-[#f3f0e6] border border-[#eeeae0] p-5 rounded-2xl flex items-center justify-between mb-6">
                      <div>
                        <p className="text-[10px] text-[#8a8479] font-black uppercase tracking-widest mb-1">Your Wallet Balance</p>
                        <p className="text-xl font-bold text-[#2d2a26]">{user.profile?.credits || 0} Credits</p>
                      </div>
                      {user.profile?.credits > 0 ? (
                        <button 
                          onClick={() => { handleCreditUnlock(); setShowUnlockOptions(false); }}
                          disabled={!!isUnlocking}
                          className="bg-[#00b48f] hover:bg-teal-400 text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95"
                        >
                          Unlock (1 Credit)
                        </button>
                      ) : (
                        <Link href="/membership" className="text-xs text-teal-600 font-bold uppercase tracking-widest hover:underline flex items-center gap-2">
                           Buy Credits <span className="text-lg">→</span>
                        </Link>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    {plans.filter(p => p.type !== 'subscription').map((plan) => (
                      <button 
                        key={plan.id}
                        onClick={() => { handleUnlockRequest(plan); setShowUnlockOptions(false); }}
                        className="w-full bg-[#f3f0e6] hover:bg-[#eeeae0] border border-[#eeeae0] p-5 rounded-2xl transition-all flex justify-between items-center group active:scale-95"
                      >
                        <div className="text-left">
                          <p className="text-teal-600 text-[10px] font-black uppercase tracking-widest mb-1">{plan.name}</p>
                          <p className="text-[#8a8479] text-[10px] font-bold uppercase">{plan.description}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[#2d2a26] font-black text-xl">₹{plan.price}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <p className="text-[9px] text-[#8a8479] mt-8 text-center font-bold uppercase tracking-widest leading-loose">
                    Secure Payment processed via Razorpay <br/>
                    100% Secure Transaction
                  </p>
               </div>
            </div>
          )}
        </div>

      )}
    </>
  );
}
