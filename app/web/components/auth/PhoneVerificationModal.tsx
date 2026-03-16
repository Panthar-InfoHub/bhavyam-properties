'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface PhoneVerificationModalProps {
  userId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function PhoneVerificationModal({ userId, onSuccess, onClose }: PhoneVerificationModalProps) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simple validation
    if (!/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number.");
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ phone_number: phone })
        .eq('id', userId);

      if (updateError) throw updateError;

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in slide-in-from-bottom-8 duration-500">
        {/* Header Decoration */}
        <div className="h-2 bg-linear-to-r from-[#00b48f] to-[#00579e]"></div>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#00b48f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>

          <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Verify Your Number</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            To prevent spam and ensure secure communication, we require a verified phone number before purchasing plans or submitting leads.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">+91</span>
              <input 
                type="tel" 
                maxLength={10}
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 10-digit number"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-14 pr-4 outline-none focus:border-[#00b48f] focus:bg-white transition-all text-gray-800 font-bold tracking-widest"
              />
            </div>

            {error && (
              <p className="text-red-500 text-xs font-bold bg-red-50 py-2 rounded-lg">{error}</p>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#00b48f] hover:bg-teal-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-teal-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "SAVING..." : "UPDATE & PROCEED"}
            </button>
          </form>

          <p className="text-[10px] text-gray-400 font-bold uppercase mt-6 tracking-widest">
            Privacy Guaranteed • Encrypted Storage
          </p>
        </div>
      </div>
    </div>
  );
}
