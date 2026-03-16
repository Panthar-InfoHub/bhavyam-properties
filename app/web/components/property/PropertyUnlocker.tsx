"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import PhoneVerificationModal from '@/components/auth/PhoneVerificationModal';

export default function PropertyUnlocker({ propertyId }: { propertyId: string }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [pendingType, setPendingType] = useState<'single' | 'plan' | null>(null);
  const [isUnlocking, setIsUnlocking] = useState<string | null>(null); // 'single' or 'plan'
  const [securedData, setSecuredData] = useState<any>(null);
  const [accessType, setAccessType] = useState<'plan' | 'unlock' | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const router = useRouter();

  const fetchAccess = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      if (!currentUser) {
        setLoading(false);
        return;
      }

      // Check if phone number is missing
      if (!currentUser.profile?.phone_number && showPhoneModal === false) {
        // We don't force it immediately, only on interaction
      }

      // 1. Check RPC for access
      const { data: hasAccess, error: accessError } = await supabase.rpc('check_property_access', {
        p_property_id: propertyId
      });

      if (accessError) throw accessError;

      if (hasAccess) {
        // Fetch the data - EXCLUDING owner details per new privacy policy
        const { data: secureProp, error: fetchError } = await supabase
          .from('properties')
          .select(`
            address,
            media:property_media (url, media_type)
          `)
          .eq('id', propertyId)
          .single();
          
        if (fetchError) throw fetchError;
        setSecuredData(secureProp);

        // Determine if it's via plan or specific unlock
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
    } catch (err) {
      console.error("Error checking access:", err);
    } finally {
      setLoading(false);
    }
  }, [propertyId, showPhoneModal]);

  useEffect(() => {
    fetchAccess();
  }, [fetchAccess]);

  const handleUnlockRequest = (type: 'single' | 'plan') => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!user.profile?.phone_number) {
      setPendingType(type);
      setShowPhoneModal(true);
      return;
    }

    executeUnlock(type);
  };

  const executeUnlock = async (type: 'single' | 'plan') => {
    setIsUnlocking(type);
    try {
      // Simulate Payment Gateway
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (type === 'single') {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 7); // 1 week

        const { error } = await supabase.from('property_unlocks').upsert({
          user_id: user.id,
          property_id: propertyId,
          expires_at: expiry.toISOString()
        });
        if (error) throw error;

        // Also record payment
        await supabase.from('payments').insert({
          user_id: user.id,
          property_id: propertyId,
          amount: 49, 
          status: 'completed',
          currency: 'INR'
        });

      } else {
        // 30-day Pro Plan
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 30);

        const { error: profileError } = await supabase.from('profiles').update({
          subscription_plan: 'pro_499',
          subscription_expires_at: expiry.toISOString()
        }).eq('id', user.id);

        if (profileError) throw profileError;

        await supabase.from('payments').insert({
          user_id: user.id,
          amount: 499,
          status: 'completed',
          currency: 'INR'
        });
      }

      // Refresh data
      await fetchAccess();
      alert(type === 'single' ? "Property Unlocked for 7 Days!" : "Pro Plan Activated Successfully!");

    } catch (err: any) {
      alert("Transaction failed: " + err.message);
    } finally {
      setIsUnlocking(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-zinc-900 rounded-3xl p-8 shadow-2xl h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <>
      {showPhoneModal && user && (
        <PhoneVerificationModal 
          userId={user.id}
          onClose={() => setShowPhoneModal(false)}
          onSuccess={() => {
            setShowPhoneModal(false);
            if (pendingType) executeUnlock(pendingType);
            setPendingType(null);
          }}
        />
      )}

      {securedData ? (
        <div className="bg-zinc-900 rounded-3xl p-8 shadow-2xl flex flex-col h-full animate-in fade-in zoom-in duration-500 text-white text-left">
          <div className="flex justify-between items-start mb-6 border-b border-zinc-800 pb-4">
             <div>
                <h3 className="text-2xl font-bold text-[#00b48f] tracking-tight">Access Granted</h3>
                <p className="text-xs text-zinc-400 mt-1 uppercase tracking-widest font-bold">
                  Via {accessType === 'plan' ? 'Pro Monthly Plan' : 'Individual 7-Day Unlock'}
                </p>
             </div>
             {expiresAt && (
               <div className="text-right">
                  <p className="text-[10px] text-zinc-500 uppercase font-black">Valid Until</p>
                  <p className="text-xs font-bold text-teal-400">{new Date(expiresAt).toLocaleDateString()}</p>
               </div>
             )}
          </div>
          
          <div className="space-y-4">
            <div className="bg-zinc-800/40 p-5 rounded-2xl border border-zinc-700/50">
              <p className="text-zinc-500 text-[10px] uppercase font-black mb-2 flex items-center gap-1.5">
                 <span className="text-teal-500">📍</span> Exact Physical Address
              </p>
              <p className="font-bold text-white text-lg leading-relaxed">{securedData.address}</p>
            </div>

            <div className="bg-blue-500/10 p-5 rounded-2xl border border-blue-500/20">
              <p className="text-blue-400 text-[10px] uppercase font-black mb-2 flex items-center gap-1.5">
                 <span>ℹ️</span> Support Note
              </p>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Owner contact details are kept confidential. To schedule a visit or negotiate, please use the <strong>Interest Form</strong>. An admin will facilitate the connection.
              </p>
            </div>

            {/* Media list */}
            {(securedData.media?.length > 0) && (
              <div className="bg-zinc-800/40 p-5 rounded-2xl border border-zinc-700/50">
                <p className="text-zinc-500 text-[10px] uppercase font-black mb-4">Secured Media & Assets</p>
                <div className="flex flex-col gap-3">
                   {securedData.media?.map((m: any, i: number) => (
                     <a key={i} href={m.url} target="_blank" className={`flex items-center gap-3 p-3 bg-zinc-900/50 rounded-xl text-sm transition-all border group ${m.media_type === 'video' ? 'text-teal-400 border-teal-500/20 hover:bg-teal-500/10' : 'text-blue-400 border-blue-500/20 hover:bg-blue-500/10'}`}>
                       <span className="text-xl group-hover:scale-110 transition-transform">{m.media_type === 'video' ? '🎥' : '📄'}</span> 
                       {m.media_type === 'video' ? 'Watch Tour' : `Legal Photocopy ${i+1}`}
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
            <button 
              onClick={() => handleUnlockRequest('single')}
              disabled={!!isUnlocking}
              className="group w-full bg-zinc-800 hover:bg-zinc-700 p-5 rounded-2xl transition-all border border-zinc-700/50 text-left relative overflow-hidden active:scale-95"
            >
              <div className="flex justify-between items-center relative z-10">
                <div>
                  <p className="text-xs font-black text-teal-400 uppercase tracking-widest mb-1">Instant Access</p>
                  <h4 className="text-white font-bold text-lg">Unlock for 7 Days</h4>
                </div>
                <div className="text-right">
                  <p className="text-white font-black text-xl">₹49</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold uppercase tracking-tighter relative z-10">
                <span>✓ Map Coordinates</span>
                <span className="opacity-30">•</span>
                <span>✓ Direct Call</span>
              </div>
              {isUnlocking === 'single' && <div className="absolute inset-0 bg-teal-500/10 animate-pulse"></div>}
            </button>

            <button 
              onClick={() => handleUnlockRequest('plan')}
              disabled={!!isUnlocking}
              className="group w-full bg-[#00b48f] hover:bg-teal-400 p-5 rounded-2xl transition-all text-left relative overflow-hidden shadow-lg active:scale-95"
            >
              <div className="flex justify-between items-center relative z-10">
                <div>
                  <p className="text-xs font-black text-white/70 uppercase tracking-widest mb-1">Best Value</p>
                  <h4 className="text-white font-black text-lg">Monthly Pro Plan</h4>
                </div>
                <div className="text-right">
                  <p className="text-white font-black text-xl">₹499</p>
                </div>
              </div>
              <p className="text-[10px] text-white/80 font-bold uppercase mt-3 relative z-10">
                Unlock ALL properties for 30 days
              </p>
              {isUnlocking === 'plan' && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
            </button>
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
