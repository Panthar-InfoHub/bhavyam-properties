"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import PhoneVerificationModal from '@/components/auth/PhoneVerificationModal';

export default function InterestButton({ propertyId }: { propertyId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, [showPhoneModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert("Please log in to express interest in a property.");
      router.push('/login');
      return;
    }

    // Enforce phone number registration
    if (!user.profile?.phone_number) {
      setShowPhoneModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('interest_requests').insert({
        user_id: user.id,
        property_id: propertyId,
        message: message,
        status: 'pending'
      });
      
      if (error) throw error;
      
      setSubmitted(true);
      setIsOpen(false);
    } catch (err: any) {
      alert("Error sending request: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl flex items-center gap-3 w-full mt-6">
         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
         <div>
            <p className="font-bold">Interest Registered!</p>
            <p className="text-sm border-t border-green-200 pt-1 mt-1">An admin or agent will contact you shortly.</p>
         </div>
      </div>
    );
  }

  return (
    <>
      {showPhoneModal && user && (
        <PhoneVerificationModal 
          userId={user.id}
          onClose={() => setShowPhoneModal(false)}
          onSuccess={() => setShowPhoneModal(false)}
        />
      )}

      <div className="mt-8">
        {!isOpen ? (
          <button 
            onClick={() => setIsOpen(true)}
            className="w-full bg-[#00579e] hover:bg-blue-900 text-white py-5 px-6 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
          >
            <span>Express Professional Interest</span>
            <span className="text-xl">🤝</span>
          </button>
        ) : (
          <div className="bg-white border-2 text-left border-teal-500/20 p-8 rounded-3xl shadow-2xl mt-2 relative animate-in fade-in slide-in-from-top-4 duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
               <span className="bg-teal-50 text-teal-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-teal-100">
                 Secure Lead Portal
               </span>
            </div>
            
            <button onClick={() => setIsOpen(false)} className="absolute top-4 left-4 text-gray-300 hover:text-gray-500 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div className="mt-4 mb-8">
              <h3 className="text-2xl font-black text-gray-900 mb-2">Initialize Contact</h3>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">
                Expressing interest generates a high-priority lead for our <span className="text-[#00579e] font-bold">Concierge Team</span>. We will verify your intent and facilitate a formal introduction with the property representative.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
               <div className="relative group">
                 <textarea 
                   required
                   value={message}
                   onChange={(e) => setMessage(e.target.value)}
                   placeholder="How can we help? (e.g., 'I want to schedule a visit next Tuesday')" 
                   rows={4} 
                   className="w-full border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-[#00b48f] focus:ring-4 focus:ring-teal-500/5 text-gray-800 text-sm font-medium transition-all"
                 ></textarea>
                 <div className="absolute bottom-4 right-4 text-[10px] text-gray-300 font-bold uppercase pointer-events-none">
                   Required
                 </div>
               </div>
               
               <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#00b48f] hover:bg-teal-600 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2 group"
               >
                  {isSubmitting ? (
                    <span className="animate-pulse">Processing...</span>
                  ) : (
                    <>
                      SUBMIT INTEREST REQUEST
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
               </button>
               
               <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-tighter">
                  Lead will include your verified name, phone, and property ID.
               </p>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
