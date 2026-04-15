"use client";

import { Check } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  features: string[] | string;
  type: 'subscription' | 'single_unlock' | 'credit_pack';
}

export default function PlanCard({ 
  plan, 
  onPurchase, 
  isLoading 
}: { 
  plan: Plan; 
  onPurchase: (plan: Plan) => void;
  isLoading?: boolean;
}) {
  const features = typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features;

  return (
    <div className={`relative bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl flex flex-col h-full ${plan.type === 'subscription' ? 'border-[#00ecbd]/30 ring-4 ring-[#00ecbd]/5' : plan.type === 'credit_pack' ? 'border-purple-200' : ''}`}>
      {plan.type === 'subscription' && (
        <div className="absolute top-0 right-10 -translate-y-1/2 bg-[#00ecbd] text-[#112743] text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-lg">
          Best Value
        </div>
      )}
      {plan.type === 'credit_pack' && (
        <div className="absolute top-0 right-10 -translate-y-1/2 bg-purple-600 text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-lg">
          Credit Pack
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-2xl font-black text-[#112743] tracking-tighter mb-2">{plan.name}</h3>
        <p className="text-gray-400 text-sm font-bold leading-relaxed">{plan.description}</p>
      </div>

      <div className="mb-8 flex items-baseline gap-1">
        <span className="text-4xl font-black text-[#112743]">₹{plan.price}</span>
        <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">
          / {plan.type === 'subscription' ? `${plan.duration_days} Days` : plan.type === 'credit_pack' ? 'Pack' : 'Unlock'}
        </span>
      </div>

      <div className="space-y-4 mb-10 flex-1">
        {features.map((feature: string, idx: number) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="mt-1 w-5 h-5 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-[#00b48f]" strokeWidth={3} />
            </div>
            <span className="text-sm font-bold text-gray-600 leading-snug">{feature}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => onPurchase(plan)}
        disabled={isLoading}
        className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg ${
          plan.type === 'subscription' 
            ? 'bg-[#00ecbd] text-[#112743] hover:bg-[#00d4a9] shadow-[#00ecbd]/20' 
            : 'bg-[#112743] text-white hover:bg-[#1a3b63] shadow-[#112743]/10'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? 'Processing...' : `Get Start With ${plan.name}`}
      </button>

      {plan.type === 'subscription' && (
        <p className="text-center mt-6 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
          Instant activation after secure payment
        </p>
      )}
    </div>
  );
}
