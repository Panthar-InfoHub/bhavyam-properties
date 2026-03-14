'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function InterestButton({ propertyId }: { propertyId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
         alert("Please log in to express interest in a property.");
         router.push('/login');
         return;
      }
      
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
    <div className="mt-8">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-full bg-white border-2 border-[#00579e] text-[#00579e] hover:bg-blue-50 py-3 px-6 rounded-xl font-bold uppercase tracking-widest text-sm transition-all shadow-sm block text-center"
        >
          Contact & Express Interest
        </button>
      ) : (
        <div className="bg-white border text-left border-gray-200 p-6 rounded-xl shadow-lg mt-2 relative animate-in fade-in zoom-in duration-300">
          <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          
          <h3 className="text-xl font-bold text-gray-800 mb-2">Express Interest</h3>
          <p className="text-sm text-gray-500 mb-4">Send a direct request. Our team will verify your intent and connect you with the owner or responsible agent.</p>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
             <textarea 
               required
               value={message}
               onChange={(e) => setMessage(e.target.value)}
               placeholder="I would like to schedule a viewing... (required)" 
               rows={3} 
               className="w-full border p-3 rounded-lg outline-none focus:ring-1 focus:ring-[#00b48f] text-sm"
             ></textarea>
             <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-[#00b48f] hover:bg-teal-600 text-white font-bold py-3 rounded-lg transition-colors shadow-md disabled:opacity-50"
             >
                {isSubmitting ? 'Sending...' : 'Confirm Interest'}
             </button>
          </form>
        </div>
      )}
    </div>
  );
}
