"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import PlanCard from "@/components/membership/PlanCard";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Script from "next/script";
import PremiumLoader from "@/components/ui/PremiumLoader";


export default function MembershipPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchPlans() {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true });

      if (error) {
        toast.error("Failed to load plans");
        console.error(error);
      } else {
        setPlans(data || []);
      }
      setIsLoading(false);
    }
    fetchPlans();
  }, []);

  const handlePurchase = async (plan: any) => {
    try {
      setIsProcessing(plan.id);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to continue");
        router.push("/login?redirect=/membership");
        return;
      }

      // Fetch precise user profile for prefilling
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      // 1. Create order on backend
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          planId: plan.id, 
          amount: plan.price, 
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
        description: `Upgrade to ${plan.name}`,
        order_id: order.id,
        handler: async (response: any) => {
          toast.success("Payment successful! Processing your purchase...");
          setTimeout(() => router.push("/dashboard"), 2000);
        },
        prefill: {
          name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : "",
          email: user.email,
          contact: profile?.phone_number || "",
        },
        theme: {
          color: "#00b48f",
        },
        modal: {
          ondismiss: () => {
            toast('Payment cancelled.', { icon: 'ℹ️' });
            setIsProcessing(null);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        toast.error(`Payment Failed: ${response.error.description}`);
        setIsProcessing(null);
      });

      rzp.open();

    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsProcessing(null);
    }
  };

  if (isLoading) {
    return (
      <PremiumLoader 
        messages={[
          "Fetching exclusive plans",
          "Synchronizing market prices",
          "Preparing secure checkout",
          "Almost ready"
        ]}
        duration={1500}
      />
    );
  }

  return (
    <main className="min-h-screen pt-32 pb-24 bg-[#fbfcfa] relative overflow-hidden">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />


      {/* Background blobs for premium feel */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#00ecbd]/5 rounded-full blur-[120px] -mr-[400px] -mt-[400px]"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#112743]/5 rounded-full blur-[100px] -ml-[300px] -mb-[300px]"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20 animate-in fade-in slide-in-from-top-10 duration-1000">
          <span className="text-[#00b48f] text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">
            Membership Plans
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-[#112743] tracking-tighter mb-6 leading-tight">
            Unlock the Real <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00b48f] to-[#00ecbd]">Potential</span> of Property
          </h1>
          <p className="text-gray-400 font-bold max-w-2xl mx-auto text-lg leading-relaxed uppercase tracking-widest text-[11px]">
            Simple transparent pricing for everyone. Choose the plan that works for you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {plans.map((plan, idx) => (
            <div 
              key={plan.id}
              className="animate-in fade-in zoom-in duration-700"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <PlanCard 
                plan={plan} 
                onPurchase={handlePurchase}
                isLoading={isProcessing === plan.id}
              />
            </div>
          ))}

          {/* Fallback/Informative Card if few plans exist */}
          {plans.length === 0 && (
            <div className="col-span-full text-center p-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
              <p className="text-gray-400 font-bold uppercase tracking-widest">No plans are currently active.</p>
            </div>
          )}
        </div>

        <div className="mt-24 text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-loose">
                Instant Access • 256-bit Secure Encryption <br/>
                No hidden charges • Cancel anytime • 24/7 Priority Support
            </p>
        </div>
      </div>
    </main>
  );
}
