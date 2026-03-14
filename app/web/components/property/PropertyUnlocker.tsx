'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function PropertyUnlocker({ propertyId }: { propertyId: string }) {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [securedData, setSecuredData] = useState<any>(null);
  const router = useRouter();

  const handleUnlock = async () => {
    setIsUnlocking(true);
    try {
      const user = await getCurrentUser();
      
      // Enforce Authentication
      if (!user) {
        alert("You must be logged in to process this secure transaction.");
        router.push('/login');
        return;
      }

      // Simulate Payment Gateway Delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 1. Process payment record
      const { error: paymentError } = await supabase.from('payments').insert({
        user_id: user.id,
        property_id: propertyId,
        amount: 49.99, // Mock unlock fee
        status: 'completed',
        currency: 'USD'
      });
      if (paymentError) throw paymentError;

      // 2. Fetch the locked details directly via API strictly on-demand
      const { data: secureProp, error: fetchError } = await supabase
        .from('properties')
        .select(`
          address,
          owner:profiles (first_name, last_name, email, phone_number),
          media:property_media (url, media_type)
        `)
        .eq('id', propertyId)
        .single();
        
      if (fetchError) throw fetchError;

      // Swap UI state to display
      setSecuredData(secureProp);

    } catch (err: any) {
      console.error(err);
      alert("Error unlocking property: " + err.message);
    } finally {
      setIsUnlocking(false);
    }
  };

  // After Successful Payment View
  if (securedData) {
    const documents = securedData.media?.filter((m: any) => m.media_type === 'document') || [];
    const maps = securedData.media?.filter((m: any) => m.media_type === 'map') || [];
    const videos = securedData.media?.filter((m: any) => m.media_type === 'video') || [];
    
    return (
      <div className="bg-zinc-900 rounded-3xl p-8 shadow-2xl overflow-hidden flex flex-col h-full animate-in fade-in zoom-in duration-500 text-white text-left">
        <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
           <svg className="w-8 h-8 text-[#00b48f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
           <h3 className="text-2xl font-bold text-[#00b48f] tracking-tight">Unlocked Successfully</h3>
        </div>
        
        <div className="mb-5 bg-zinc-800/50 p-4 rounded-xl">
          <p className="text-zinc-400 text-xs uppercase tracking-widest font-semibold mb-1 flex items-center gap-2">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             Exact Address
          </p>
          <p className="font-semibold text-lg">{securedData.address}</p>
        </div>

        <div className="mb-5 flex flex-col gap-1 bg-zinc-800/50 p-4 rounded-xl">
          <p className="text-zinc-400 text-xs uppercase tracking-widest font-semibold mb-2 flex items-center gap-2">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
             Owner Verified Profile
          </p>
          <p className="font-bold text-lg text-white mb-1">{securedData.owner?.first_name} {securedData.owner?.last_name}</p>
          <p className="text-sm text-zinc-300 font-medium">📞 {securedData.owner?.phone_number || 'No Phone on Record'}</p>
          <p className="text-sm text-zinc-300 font-medium">✉️ {securedData.owner?.email || 'N/A'}</p>
        </div>

        {(maps.length > 0 || documents.length > 0 || videos.length > 0) && (
          <div className="bg-zinc-800/50 p-4 rounded-xl">
            <p className="text-zinc-400 text-xs uppercase tracking-widest font-semibold mb-3">Secured Attachments</p>
            <div className="flex flex-col gap-2">
               {maps.map((m: any, i: number) => (
                 <a key={i} href={m.url} target="_blank" className="text-teal-400 text-sm hover:text-teal-300 transition-colors flex items-center gap-2 font-medium">
                   📍 View Map Coordinates
                 </a>
               ))}
               {videos.map((m: any, i: number) => (
                 <a key={i} href={m.url} target="_blank" className="text-teal-400 text-sm hover:text-teal-300 transition-colors flex items-center gap-2 font-medium">
                   🎥 Watch Encrypted Video Walkthrough
                 </a>
               ))}
               {documents.map((doc: any, i: number) => (
                 <a key={i} href={doc.url} target="_blank" className="text-blue-400 text-sm hover:text-blue-300 transition-colors flex items-center gap-2 font-medium">
                   📄 Download Legal Document Photocopy {i+1}
                 </a>
               ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Pre-Payment Locked View
  return (
    <div className="bg-zinc-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center h-full">
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-teal-500 rounded-full blur-3xl opacity-20"></div>
      
      <svg className="w-16 h-16 text-teal-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      
      <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Secured Data</h3>
      <p className="text-zinc-400 mb-8 font-light text-sm">
        Exact coordinates, legal documents, owner details, and video walkthroughs have been successfully hidden by Administration.
      </p>

      <button 
        onClick={handleUnlock}
        disabled={isUnlocking}
        className="w-full bg-[#00b48f] hover:bg-teal-400 text-white hover:text-white py-4 px-6 rounded-xl font-bold uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(0,180,143,0.3)] hover:shadow-[0_0_30px_rgba(0,180,143,0.5)] transform hover:-translate-y-1 block text-center disabled:opacity-50 disabled:transform-none"
      >
         {isUnlocking ? 'Processing Payment...' : 'Unlock Property Details'}
      </button>

      <p className="text-xs text-zinc-500 mt-6">
        Requires verified payment + dashboard access.
      </p>
   </div>
  );
}
