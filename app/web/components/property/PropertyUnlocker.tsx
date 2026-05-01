"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PhoneVerificationModal from '@/components/auth/PhoneVerificationModal';
import toast from 'react-hot-toast';
import Script from 'next/script';

type AccessType = 'plan' | 'unlock' | 'credit' | 'admin' | 'membership' | null;

export default function PropertyUnlocker({ propertyId }: { propertyId: string }) {
  const [loading, setLoading]           = useState(true);
  const [user, setUser]                 = useState<any>(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [isUnlocking, setIsUnlocking]   = useState(false);
  const [securedData, setSecuredData]   = useState<any>(null);
  const [accessType, setAccessType]     = useState<AccessType>(null);
  const [expiresAt, setExpiresAt]       = useState<string | null>(null);
  const router = useRouter();

  /* ─── Fetch Access ─────────────────────────────────────────────── */
  const fetchAccess = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (!currentUser) { setLoading(false); return; }

      const isAdmin = currentUser.profile?.role === 'admin';

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
        const { data: secureProp, error: fetchError } = await supabase
          .from('properties')
          .select(`
            address, map_url, price, owner_id,
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
          // Check individual unlock
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
          } else if (
            currentUser.profile?.subscription_plan === 'premium' &&
            (!currentUser.profile?.subscription_expires_at ||
              new Date(currentUser.profile.subscription_expires_at) > new Date())
          ) {
            setAccessType('membership');
            setExpiresAt(currentUser.profile?.subscription_expires_at);
          } else {
            setAccessType(null);
          }
        }
      }
    } catch (err) {
      console.error("Error checking access:", err);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => { fetchAccess(); }, [fetchAccess]);

  /* ─── Direct ₹99 Unlock ────────────────────────────────────────── */
  const handleDirectUnlock = async () => {
    if (!user) { router.push('/login'); return; }
    if (!user.profile?.phone_number) { setShowPhoneModal(true); return; }

    setIsUnlocking(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error("Session not found");

      // Fetch the single_unlock plan
      const { data: plan, error: planErr } = await supabase
        .from('plans')
        .select('*')
        .eq('type', 'single_unlock')
        .eq('is_active', true)
        .single();

      if (planErr || !plan) throw new Error("Unlock plan not available. Please try again later.");

      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, amount: plan.price, propertyId, payment_type: 'single_unlock' }),
      });
      const order = await response.json();
      if (!response.ok) throw new Error(order.error || 'Failed to create order');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Bhavyam Properties",
        description: `Unlock property for ${plan.duration_days} days`,
        order_id: order.id,
        handler: async (rzpResponse: any) => {
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                razorpay_order_id:   rzpResponse.razorpay_order_id,
                razorpay_payment_id: rzpResponse.razorpay_payment_id,
                razorpay_signature:  rzpResponse.razorpay_signature,
                planId: plan.id,
                propertyId,
              }),
            });
            if (verifyRes.ok) {
              toast.success("Property unlocked! Contact details are now visible.");
              setTimeout(() => fetchAccess(), 800);
            } else {
              toast.error("Verification failed. Contact support if charged.");
            }
          } catch (e) {
            console.error("Verification error:", e);
          } finally {
            setIsUnlocking(false);
          }
        },
        prefill: { email: authUser.email, contact: user.profile?.phone_number || "" },
        theme: { color: "#00b48f" },
        modal: {
          ondismiss: () => setIsUnlocking(false),
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (r: any) => {
        toast.error(`Payment failed: ${r.error.description}`);
        setIsUnlocking(false);
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
      setIsUnlocking(false);
    }
  };

  /* ─── Spend Credit ──────────────────────────────────────────────── */
  const handleCreditUnlock = async () => {
    if (!user) return router.push('/login');
    if ((user.profile?.credits || 0) < 1) {
      toast.error("Insufficient credits.");
      return;
    }

    setIsUnlocking(true);
    try {
      // Fetch duration from the standard credit pack plan (defaulting to 30 if not found)
      const { data: creditPlan } = await supabase
        .from('plans')
        .select('duration_days')
        .eq('type', 'credit_pack')
        .order('duration_days', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      const duration = creditPlan?.duration_days || 30;

      const { data, error } = await supabase.rpc('spend_credit', { p_property_id: propertyId, p_duration_days: duration });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Credit spent! Property unlocked.");
      window.dispatchEvent(new Event('wallet-updated'));
      setTimeout(() => {
        fetchAccess();
        // Force state to 'credit' for immediate UI feedback
        setAccessType('credit');
      }, 800);
    } catch (err: any) {
      toast.error(err.message || "Failed to spend credit");
    } finally {
      setIsUnlocking(false);
    }
  };

  /* ─── Map helper ────────────────────────────────────────────────── */
  const getMapEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('pb=') || url.includes('output=embed')) return url;
    const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) return `https://maps.google.com/maps?q=${match[1]},${match[2]}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    const placeMatch = url.match(/\/place\/([^\/]+)/);
    if (placeMatch) return `https://maps.google.com/maps?q=${encodeURIComponent(placeMatch[1].replace(/\+/g, ' '))}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    return url.includes('goo.gl') ? null : `https://maps.google.com/maps?q=${encodeURIComponent(url)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  /* ─── Helpers ───────────────────────────────────────────────────── */
  const daysLeft = (iso: string) => {
    const diff = new Date(iso).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86400000));
  };

  /* ─── Loading ───────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="bg-[#fbfbf8] border border-[#eeeae0] rounded-3xl p-8 shadow-sm h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
      </div>
    );
  }

  const mapEmbedUrl = securedData?.map_url ? getMapEmbedUrl(securedData.map_url) : null;
  const otherMedia  = securedData?.media?.filter((m: any) => m.media_type !== 'image' && m.media_type !== 'video') || [];
  const hasCredits  = (user?.profile?.credits || 0) > 0;
  const hasSubscription = user?.profile?.subscription_plan === 'premium' &&
    (!user?.profile?.subscription_expires_at || new Date(user.profile.subscription_expires_at) > new Date());

  /* ═══════════════════════════════════════════════════════════════════
     UNLOCKED STATE — show secured data
  ═══════════════════════════════════════════════════════════════════ */
  if (securedData) {
    return (
      <>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        {showPhoneModal && user && (
          <PhoneVerificationModal
            userId={user.id}
            onClose={() => setShowPhoneModal(false)}
            onSuccess={() => { setShowPhoneModal(false); handleDirectUnlock(); }}
          />
        )}

        <div className="bg-[#fbfbf8] border border-[#eeeae0] rounded-3xl p-8 shadow-sm flex flex-col h-full animate-in fade-in zoom-in duration-500 text-[#2d2a26] text-left gap-5">
          {/* Access header */}
          <div className="flex justify-between items-start pb-4 border-b border-[#eeeae0]">
            <div>
              <h3 className="text-xl font-bold text-[#00b48f]">Access Granted</h3>
              <p className="text-[10px] text-[#8a8479] mt-0.5 uppercase tracking-widest font-bold">
                Via {
                  accessType === 'admin' ? 'Admin' : 
                  accessType === 'membership' ? 'Elite Membership' : 
                  accessType === 'credit' ? 'Credit Unlock' : 
                  'Property Unlock'
                }
              </p>
            </div>
            {accessType !== 'admin' && accessType !== 'membership' && expiresAt && (
              <div className="text-right bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-xl">
                <p className="text-[10px] text-[#8a8479] uppercase font-black">Expires in</p>
                <p className="text-sm font-bold text-teal-600">{daysLeft(expiresAt)} days</p>
              </div>
            )}
            {(accessType === 'membership' || accessType === 'admin') && (
              <span className="text-[10px] bg-teal-500/10 text-teal-600 px-3 py-1.5 rounded-xl font-black uppercase tracking-widest">
                Unlimited
              </span>
            )}
          </div>

          {/* Price */}
          <div className="bg-teal-500/5 p-5 rounded-2xl border border-teal-500/10">
            <p className="text-teal-600 text-[10px] uppercase font-black mb-1 flex items-center gap-1.5">💰 Asking Price</p>
            <p className="font-black text-[#2d2a26] text-3xl">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(securedData.price)}
            </p>
          </div>

          {/* Address + Map */}
          <div className="bg-[#f3f0e6] p-5 rounded-2xl border border-[#eeeae0]">
            <p className="text-[#8a8479] text-[10px] uppercase font-black mb-2 flex items-center gap-1.5">
              <span className="text-teal-500">📍</span> Exact Address
            </p>
            <p className="font-bold text-[#2d2a26] text-lg leading-relaxed mb-4">{securedData.address}</p>
            {securedData.map_url && mapEmbedUrl && (
              <div className="rounded-xl overflow-hidden border border-[#eeeae0] h-40 mb-3">
                <iframe width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen src={mapEmbedUrl} className="grayscale hover:grayscale-0 transition-all duration-700" />
              </div>
            )}
            {securedData.map_url && (
              <a href={securedData.map_url} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#eeeae0] hover:bg-[#e4e0d4] text-[#2d2a26] font-bold py-3 rounded-xl transition-colors text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                Open in Google Maps
              </a>
            )}
          </div>

          {/* Admin contact info */}
          {accessType === 'admin' && (
            <div className="bg-blue-500/5 p-5 rounded-2xl border border-blue-500/10">
              <p className="text-blue-600 text-[10px] uppercase font-black mb-3">Owner Contact (Admin)</p>
              <div className="bg-white p-4 rounded-xl border border-[#eeeae0] shadow-sm">
                <Link href={`/admin/users/${securedData.owner?.id}`} className="text-[#2d2a26] font-semibold text-lg hover:text-teal-600 transition-colors flex items-center gap-2">
                  {securedData.owner?.first_name} {securedData.owner?.last_name}
                  <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                </Link>
                <p className="text-xs text-[#8a8479] mt-1 font-medium">Contact details are kept confidential. Use admin panel to reach out.</p>
              </div>
            </div>
          )}
          {accessType !== 'admin' && (
            <div className="bg-blue-500/5 p-5 rounded-2xl border border-blue-500/10">
              <p className="text-blue-600 text-[10px] uppercase font-black mb-2">ℹ️ Support Note</p>
              <p className="text-sm text-[#4a453e] leading-relaxed">
                Owner contact details are kept confidential. Use the <strong>Interest Form</strong> to schedule a visit. An admin will facilitate the connection.
              </p>
            </div>
          )}

          {/* Legal docs */}
          {otherMedia.length > 0 && (
            <div className="bg-[#f3f0e6] p-5 rounded-2xl border border-[#eeeae0]">
              <p className="text-[#8a8479] text-[10px] uppercase font-black mb-4 flex items-center gap-1.5">
                <span className="text-teal-500">📄</span> Legal Assets
              </p>
              <div className="flex flex-col gap-3">
                {otherMedia.map((m: any, i: number) => (
                  <a key={i} href={m.url} target="_blank"
                    className={`flex items-center gap-3 p-3 bg-white rounded-xl text-sm transition-all border group ${m.media_type === 'video' ? 'text-teal-600 border-teal-500/20 hover:bg-teal-500/5' : 'text-blue-600 border-blue-500/20 hover:bg-blue-500/5'}`}>
                    <span className="text-xl group-hover:scale-110 transition-transform">{m.media_type === 'video' ? '🎥' : '📄'}</span>
                    {m.media_type === 'video' ? 'Watch Video Tour' : `Legal Document ${i + 1}`}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════
     LOCKED STATE — show unlock options
  ═══════════════════════════════════════════════════════════════════ */
  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      {showPhoneModal && user && (
        <PhoneVerificationModal
          userId={user.id}
          onClose={() => setShowPhoneModal(false)}
          onSuccess={() => { setShowPhoneModal(false); handleDirectUnlock(); }}
        />
      )}

      <div className="bg-[#fbfbf8] border border-[#eeeae0] rounded-3xl overflow-hidden shadow-sm flex flex-col">

        {/* Lock preview */}
        <div className="relative h-44 bg-gradient-to-br from-[#eeeae0] to-[#f3f0e6] flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-[#eeeae0]">
            <svg className="w-7 h-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <p className="text-[#2d2a26] font-bold text-sm">Premium Details Locked</p>
          <p className="text-[#8a8479] text-xs text-center max-w-[220px] leading-relaxed">
            Unlock to view exact address, maps & legal documents
          </p>
        </div>

        <div className="p-6 flex flex-col gap-4">

          {/* ── Primary: Direct ₹99 unlock ── */}
          <div className="bg-[#2d2a26] rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-white/60 mb-0.5">Quick View</p>
                <p className="text-2xl font-black">₹99</p>
                <p className="text-white/70 text-xs mt-0.5">7-day access to this property</p>
              </div>
              <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                </svg>
              </div>
            </div>
            <button
              onClick={handleDirectUnlock}
              disabled={isUnlocking}
              className="w-full bg-[#00b48f] hover:bg-teal-400 active:scale-95 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUnlocking ? (
                <><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> Processing...</>
              ) : (
                <>🔓 Unlock for ₹99</>
              )}
            </button>
          </div>

          {/* ── Use existing credits ── */}
          {user && hasCredits && (
            <button
              onClick={handleCreditUnlock}
              disabled={isUnlocking}
              className="w-full bg-white border border-[#eeeae0] hover:border-teal-400 hover:bg-teal-50 active:scale-95 text-[#2d2a26] font-semibold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              💳 Use 1 Credit <span className="text-[#8a8479] text-xs font-normal">({user.profile.credits} remaining)</span>
            </button>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#eeeae0]" />
            <span className="text-[10px] text-[#8a8479] font-bold uppercase tracking-widest">Or choose a plan</span>
            <div className="flex-1 h-px bg-[#eeeae0]" />
          </div>

          {/* ── Secondary: Credit pack ── */}
          <Link href="/membership"
            className="group flex items-center justify-between p-4 bg-white border border-[#eeeae0] hover:border-purple-300 hover:bg-purple-50/40 rounded-2xl transition-all">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-purple-500 mb-0.5">Credit Pack</p>
              <p className="text-lg font-black text-[#2d2a26]">₹999</p>
              <p className="text-[#8a8479] text-xs">12 credits — each unlocks 1 property for 30 days</p>
            </div>
            <svg className="w-5 h-5 text-[#8a8479] group-hover:text-purple-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </Link>

          {/* ── Tertiary: Subscription ── */}
          <Link href="/membership"
            className="group flex items-center justify-between p-4 bg-gradient-to-r from-[#112743]/5 to-[#00b48f]/5 border border-teal-200/60 hover:border-teal-400 rounded-2xl transition-all">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-teal-600 mb-0.5">Elite Membership</p>
              <p className="text-lg font-black text-[#2d2a26]">₹9,999<span className="text-[#8a8479] font-normal text-xs"> / year</span></p>
              <p className="text-[#8a8479] text-xs">All properties unlocked for 1 full year</p>
            </div>
            <svg className="w-5 h-5 text-teal-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </Link>

          {/* Login prompt */}
          {!user && (
            <div className="text-center pt-2">
              <Link href="/login" className="text-teal-600 hover:text-[#2d2a26] font-semibold text-sm transition-colors">
                Sign in to unlock →
              </Link>
            </div>
          )}

          <p className="text-center text-[9px] text-[#8a8479] font-bold uppercase tracking-widest mt-1">
            Secure payment via Razorpay · 100% Safe
          </p>
        </div>
      </div>
    </>
  );
}
