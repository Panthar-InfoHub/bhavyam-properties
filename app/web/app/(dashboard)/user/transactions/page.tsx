"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUser } from "@/lib/auth";
import { format } from "date-fns";
import { CreditCard, Receipt, ExternalLink, Calendar, MapPin } from "lucide-react";
import Link from "next/link";

export default function UserTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      const user = await getCurrentUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          property:properties(id, property_type, city)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setTransactions(data || []);
      }
      setLoading(false);
    }
    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ecbd]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-700">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-[#112743] tracking-tighter flex items-center gap-3">
          <Receipt className="w-8 h-8 text-[#00ecbd]" />
          Transaction History
        </h1>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">
            Audit your membership and property unlocking history
        </p>
      </div>

      <div className="grid gap-6">
        {transactions.length > 0 ? (
          transactions.map((tx) => (
            <div key={tx.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-center hover:shadow-md transition-shadow">
              
              <div className={`p-4 rounded-2xl ${tx.status === 'completed' ? 'bg-teal-50 text-teal-600' : 'bg-red-50 text-red-600'}`}>
                <CreditCard className="w-6 h-6" />
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start mb-1">
                  <span className="text-xs font-black uppercase tracking-widest text-[#00b48f]">
                    {tx.payment_type === 'subscription' ? 'Membership Plan' : 'Property Unlock'}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${tx.status === 'completed' ? 'bg-teal-100 text-[#00b48f]' : 'bg-red-100 text-red-600'}`}>
                    {tx.status}
                  </span>
                </div>
                
                <h3 className="text-lg font-black text-[#112743]">
                  {tx.property ? `Unlock for ${tx.property.property_type} in ${tx.property.city}` : 'Monthly Pro Subscription'}
                </h3>
                
                <div className="flex items-center gap-4 mt-2 justify-center md:justify-start">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold uppercase tracking-widest">
                    <Calendar className="w-3.5 h-3.5" />
                    {format(new Date(tx.created_at), "MMM dd, yyyy")}
                  </div>
                  <div className="text-xs text-gray-300 font-mono tracking-tighter line-clamp-1 max-w-[150px]">
                    ID: {tx.razorpay_payment_id || tx.id.slice(0, 8)}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center md:items-end gap-3">
                <div className="text-2xl font-black text-[#112743]">
                  ₹{tx.amount}
                </div>
                
                {tx.property && (
                  <Link 
                    href={`/properties/${tx.property.id}`}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-teal-500 hover:text-teal-600 transition-colors"
                  >
                    View Property
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200 p-20 text-center">
            <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-sm mb-4">You have no transactions yet.</p>
            <Link 
              href="/membership" 
              className="px-8 py-3 bg-[#112743] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#112743]/90 transition-all active:scale-95 inline-block"
            >
              Browse Plans
            </Link>
          </div>
        )}
      </div>
      
      <div className="mt-12 text-center pb-10">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] leading-loose">
            All transactions are secure and encrypted. <br/>
            Contact support for invoice queries.
          </p>
      </div>
    </div>
  );
}
