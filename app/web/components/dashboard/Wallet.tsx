"use client";

import Link from 'next/link';

interface WalletProps {
  credits: number;
  subscriptionPlan: string;
  subscriptionExpiresAt?: string;
}

export default function Wallet({ credits, subscriptionPlan, subscriptionExpiresAt }: WalletProps) {
  const isPremium = subscriptionPlan === 'premium' && 
                    (!subscriptionExpiresAt || new Date(subscriptionExpiresAt) > new Date());

  const expiryDate = subscriptionExpiresAt ? new Date(subscriptionExpiresAt).toLocaleDateString() : 'N/A';

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00b48f]/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
      
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#00b48f] rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-teal-500/20">
            💰
          </div>
          <div>
            <h3 className="text-xl font-black text-[#112743] tracking-tighter">Your Credit Wallet</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Available Balance</p>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          {isPremium ? (
            <span className="text-5xl font-black text-[#00b48f] tracking-tighter">∞</span>
          ) : (
            <span className="text-5xl font-black text-[#112743] tracking-tighter">{credits}</span>
          )}
          <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Credits</span>
        </div>

        {isPremium && (
          <div className="flex items-center gap-2 bg-teal-50 text-[#00b48f] px-3 py-1.5 rounded-full inline-flex border border-teal-100 animate-in fade-in slide-in-from-left-4">
            <span className="animate-pulse">✨</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Elite Membership Active</span>
          </div>
        )}
      </div>

      <div className="w-full md:w-auto flex flex-col gap-3 min-w-[200px]">
        {isPremium ? (
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Access Expires</p>
             <p className="text-sm font-bold text-[#112743]">{expiryDate}</p>
          </div>
        ) : (
          <Link 
            href="/membership" 
            className="w-full bg-[#112743] hover:bg-[#1a3a61] text-white text-center py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg active:scale-95"
          >
            Buy More Credits
          </Link>
        )}
        
        <Link 
          href="/membership" 
          className="w-full bg-white border border-gray-200 text-[#112743] hover:bg-gray-50 text-center py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
        >
          {isPremium ? 'Upgrade / Extend' : 'Go Unlimited'}
        </Link>
      </div>

      <p className="absolute bottom-4 left-8 text-[8px] font-bold text-gray-300 uppercase tracking-widest pointer-events-none">
        Bhavyam Secure Wallet System • ID: {Math.random().toString(36).substring(7).toUpperCase()}
      </p>
    </div>
  );
}
