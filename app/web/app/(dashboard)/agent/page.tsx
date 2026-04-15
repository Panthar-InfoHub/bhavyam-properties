'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import PremiumLoader from '@/components/ui/PremiumLoader';

export default function AgentDashboardPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [agentProfile, setAgentProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>('overview');
  const [transactions, setTransactions] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchAgentData = async () => {
      const user = await getCurrentUser();
      if (!user) {
         router.push('/login');
         return;
      }
      
      const p = user.profile;
      if (p?.role !== 'agent' && p?.role !== 'admin') {
         router.push('/dashboard/user/apply-agent');
         return;
      }
      
      setAgentProfile(p);

      const { data, error } = await supabase
        .from('properties')
        .select(`
           id,
           listing_type,
           property_type,
           city,
           price,
           status,
           created_at,
           admin_feedback,
           favorites(count),
           reviews(rating, comment, status)
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
         setProperties(data);
      }

      // Fetch agent's transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select(`
           *,
           property:properties(id, property_type, city)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setTransactions(txData || []);
      
      setIsLoading(false);
    };

    fetchAgentData();
  }, [router]);

  if (isLoading) {
    return (
      <PremiumLoader 
        messages={[
          "Fetching agent portfolio",
          "Analyzing listing performance",
          "Synchronizing client leads",
          "Preparing professional dashboard"
        ]}
        duration={1500}
      />
    );
  }

  const totalListings = properties.length;
  const approvedListings = properties.filter((r: any) => r.status === 'approved').length;
  const totalFavorites = properties.reduce((acc: number, curr: any) => acc + (curr.favorites[0]?.count || 0), 0);
  
  const allReviews = properties.flatMap((p: any) => p.reviews || []);
  const totalReviews = allReviews.length;
  const avgRating = totalReviews > 0 
    ? (allReviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / totalReviews).toFixed(1) 
    : '0.0';

  const propertyPerformance = properties
    .map((p: any) => {
       const reviews = p.reviews || [];
       const mean = reviews.length > 0 ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length : 0;
       return { 
         name: `${p.property_type} in ${p.city}`.substring(0, 20) + '...',
         rating: mean,
         reviewCount: reviews.length
       };
    })
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  return (
    <div className="flex-1 w-full bg-[#fbfcfa] py-10 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-gray-100 pb-8 gap-6">
           <div>
              <h1 className="text-4xl font-black text-[#00579e] mb-2 tracking-tight">Agent Command Center</h1>
              <p className="text-gray-500 font-medium">Welcome back, {agentProfile?.first_name}. Monitor your listing impact and performance metrics.</p>
           </div>
           
           <div className="bg-white border-2 border-dashed border-teal-100 p-4 rounded-2xl flex flex-col md:items-end w-full md:w-auto">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Official Licensed Agent ID</span>
              <span className="text-2xl font-black text-teal-600 font-mono tracking-widest">{agentProfile?.agent_code || 'AGT-PENDING'}</span>
           </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 w-fit mb-10 shadow-sm">
           <button 
             onClick={() => setActiveTab('overview')}
             className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-[#00579e] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
           >
             Overview
           </button>
           <button 
             onClick={() => setActiveTab('transactions')}
             className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'transactions' ? 'bg-[#00579e] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
           >
             Transactions
           </button>
        </div>

        {activeTab === 'overview' && (
          <div className="animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
               <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Properties</p>
                     <div className="bg-blue-50 p-2.5 rounded-xl text-blue-500">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                     </div>
                  </div>
                  <p className="text-4xl font-black text-gray-800">{totalListings}</p>
                  <p className="text-xs text-green-500 mt-2 font-black uppercase tracking-tighter">{approvedListings} Live</p>
               </div>

               <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Favs</p>
                     <div className="bg-red-50 p-2.5 rounded-xl text-red-500">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                     </div>
                  </div>
                  <p className="text-4xl font-black text-gray-800">{totalFavorites}</p>
                  <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-tighter">Hearts</p>
               </div>

               <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rating Avg</p>
                     <div className="bg-yellow-50 p-2.5 rounded-xl text-yellow-500">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                     </div>
                  </div>
                  <p className="text-4xl font-black text-gray-800">{avgRating}</p>
                  <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-tighter">{totalReviews} Reviews</p>
               </div>

               <button 
                 onClick={() => setActiveTab('transactions')}
                 className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow text-left group"
               >
                  <div className="flex items-center justify-between mb-4">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Tx</p>
                     <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-500 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                     </div>
                  </div>
                  <p className="text-4xl font-black text-gray-800">{transactions.length}</p>
                  <p className="text-xs text-teal-600 mt-2 font-black uppercase tracking-tighter hover:underline">View History →</p>
               </button>

               <Link href="/submit-property" className="bg-[#00579e] hover:bg-blue-800 transition-all p-6 rounded-3xl shadow-2xl shadow-blue-500/30 text-white flex flex-col justify-center items-center text-center group cursor-pointer">
                  <div className="bg-white/10 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  </div>
                  <h3 className="font-black text-lg text-white">Add Listing</h3>
                  <p className="text-blue-200 text-[10px] mt-1 uppercase font-black tracking-widest leading-none">New Asset</p>
               </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                    <div className="mb-10">
                       <h3 className="text-xl font-black text-gray-800">Performance Index</h3>
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Top rated properties</p>
                    </div>

                    <div className="space-y-8">
                       {propertyPerformance.map((p, idx) => (
                          <div key={idx}>
                             <div className="flex justify-between items-end mb-2.5">
                                <span className="text-xs font-black text-gray-700">{p.name}</span>
                                <span className="text-xs font-black text-teal-600 font-mono">{p.rating.toFixed(1)} ★</span>
                             </div>
                             <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden border border-gray-100">
                                <div 
                                   className="bg-teal-500 h-full rounded-full transition-all duration-1000 ease-out" 
                                   style={{ width: `${(p.rating / 5) * 100}%` }}
                                ></div>
                             </div>
                          </div>
                       ))}
                       {propertyPerformance.length === 0 && (
                          <div className="py-12 flex flex-col items-center justify-center opacity-40">
                             <p className="text-sm font-black text-gray-400 uppercase">No Data Yet</p>
                          </div>
                       )}
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="text-xl font-black text-gray-800 mb-1">Impact Feed</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Latest Feedback</p>
                    
                    <div className="flex-1 space-y-6 overflow-y-auto max-h-[400px]">
                       {allReviews.slice(0, 5).map((rev: any, idx: number) => (
                          <div key={idx} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                             <div className="flex justify-between items-center mb-2">
                                <div className="flex text-yellow-400">
                                   {Array.from({ length: 5 }).map((_, i) => (
                                     <svg key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-gray-200 fill-current'}`} viewBox="0 0 20 20">
                                       <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                     </svg>
                                   ))}
                                </div>
                                <span className="text-[10px] font-bold text-gray-300 uppercase">Verified</span>
                             </div>
                             <p className="text-sm text-gray-500 italic">"{rev.comment}"</p>
                          </div>
                       ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-12">
               <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                  <div>
                     <h3 className="text-xl font-black text-gray-800">Property Wise Performance</h3>
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Detailed review & rating breakdown per asset</p>
                  </div>
               </div>
               
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-gray-50/70 border-b border-gray-100">
                       <tr>
                          <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Property Asset</th>
                          <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                          <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Reviews</th>
                          <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Likes</th>
                           <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Avg Rating</th>
                          <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Quick Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       {properties.map((p: any) => {
                          const reviews = p.reviews || [];
                          const mean = reviews.length > 0 ? (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1) : '—';
                          
                          const handleQuickStatus = async (newStatus: string) => {
                             if (!confirm(`Mark this property as ${newStatus}? It will go into PENDING status for admin re-approval.`)) return;
                             const { error } = await supabase
                                .from('properties')
                                .update({ status: 'pending' } as any)
                                .eq('id', p.id);
                             
                             if (!error) {
                                setProperties(prev => prev.map(item => item.id === p.id ? { ...item, status: 'pending' } : item));
                                toast.success(`Success! Property is now ${newStatus} (Pending Admin Approval).`);
                             }
                          };

                          return (
                            <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                               <td className="p-6">
                                  <Link href={`/properties/${p.id}`} className="block hover:underline">
                                     <p className="font-black text-gray-800 group-hover:text-[#00579e] transition-colors">{p.property_type}</p>
                                  </Link>
                                  <p className="text-xs text-gray-400 font-bold">{p.city} · {p.listing_type} · ₹{p.price?.toLocaleString('en-IN')}</p>
                               </td>
                               <td className="p-6">
                                  <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${p.status === 'approved' ? 'bg-teal-50 text-teal-700' : p.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                                     {p.status}
                                  </span>
                                  {p.admin_feedback && (
                                    <div className="mt-2 group-relative">
                                       <div className="flex items-center gap-1 text-[11px] font-black text-red-600 uppercase bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 w-fit cursor-help shadow-sm hover:bg-red-100 transition-colors">
                                          <span>⚠️</span> Admin Rejection Note
                                       </div>
                                       <div className="absolute left-0 mt-2 w-80 bg-white border border-gray-100 p-4 rounded-2xl shadow-2xl z-50 text-sm font-semibold text-gray-800 leading-relaxed border-l-4 border-l-red-500 group-hover:block hidden animate-in fade-in slide-in-from-top-2">
                                          <p className="font-black text-red-600 mb-2 uppercase text-[10px] tracking-widest">Improvement Required:</p>
                                          "{p.admin_feedback}"
                                          <div className="mt-3 pt-3 border-t border-gray-50 text-[10px] text-gray-400 italic">
                                             Click "Edit" to address these points.
                                          </div>
                                       </div>
                                    </div>
                                  )}
                               </td>
                               <td className="p-6 text-center font-black text-gray-700">{reviews.length}</td>
                                <td className="p-6 text-center">
                                   <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-600 px-3 py-1 rounded-lg font-black">
                                      <span>❤️</span>
                                      {p.favorites?.[0]?.count || 0}
                                   </div>
                                </td>
                                <td className="p-6 text-center font-black">
                                  <span className={mean !== '—' ? 'text-teal-600 bg-teal-50 px-3 py-1 rounded-lg' : 'text-gray-300'}>{mean} {mean !== '—' && '★'}</span>
                               </td>
                               <td className="p-6 text-right font-black">
                                  <div className="flex justify-end gap-2">
                                     <Link 
                                        href={`/agent/edit-property/${p.id}`}
                                        className="bg-gray-50 text-gray-600 border border-gray-200 hover:bg-white text-[10px] font-black px-3 py-2 rounded-lg transition-all uppercase tracking-widest cursor-pointer"
                                     >
                                        Edit
                                     </Link>
                                     <button 
                                        onClick={() => handleQuickStatus('SOLD')}
                                        className="bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-600 hover:text-white text-[10px] font-black px-3 py-2 rounded-lg transition-all uppercase tracking-widest cursor-pointer"
                                     >
                                        Sold
                                     </button>
                                     <button 
                                        onClick={() => handleQuickStatus('OFFLINE')}
                                        className="bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white text-[10px] font-black px-3 py-2 rounded-lg transition-all uppercase tracking-widest cursor-pointer"
                                     >
                                        Offline
                                     </button>
                                     <button 
                                        onClick={async () => {
                                           if (!confirm('PERMANENTLY DELETE THIS PROPERTY? This cannot be undone and no admin approval is required to remove your own asset.')) return;
                                           if (!confirm('Are you absolutely sure? This will remove all associated reviews and media records.')) return;
                                           
                                           const { error } = await supabase.from('properties').delete().eq('id', p.id);
                                           if (!error) {
                                              setProperties(prev => prev.filter(item => item.id !== p.id));
                                              alert('Property permanently removed from the system.');
                                           } else {
                                              alert('Error deleting property: ' + error.message);
                                           }
                                        }}
                                        className="bg-gray-800 text-white hover:bg-black text-[10px] font-black px-3 py-2 rounded-lg transition-all uppercase tracking-widest shadow-lg shadow-black/10 cursor-pointer"
                                     >
                                        Delete
                                     </button>
                                  </div>
                               </td>
                            </tr>
                          );
                       })}
                    </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
           <div className="animate-in fade-in duration-500">
              <div className="mb-8">
                 <h3 className="text-xl font-black text-gray-800">Financial Records</h3>
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Audit your membership and property unlocking history</p>
              </div>

              <div className="grid gap-4">
                 {transactions.length > 0 ? (
                   transactions.map((tx) => (
                     <div key={tx.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-center hover:shadow-md transition-shadow">
                       <div className={`p-4 rounded-2xl ${tx.status === 'completed' ? 'bg-teal-50 text-teal-600' : 'bg-red-50 text-red-600'}`}>
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                       </div>

                       <div className="flex-1 text-center md:text-left">
                          <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start mb-1">
                             <span className="text-[10px] font-black uppercase tracking-widest text-teal-600">
                                {tx.payment_type?.replace('_', ' ')}
                             </span>
                             <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${tx.status === 'completed' ? 'bg-teal-100 text-teal-700' : 'bg-red-100 text-red-600'}`}>
                                {tx.status}
                             </span>
                          </div>
                          <h3 className="text-lg font-black text-gray-800">
                             {tx.property ? `Unlock: ${tx.property.property_type} in ${tx.property.city}` : 'Membership Plan Purchase'}
                          </h3>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                             {new Date(tx.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                       </div>

                       <div className="text-right">
                          <p className="text-2xl font-black text-gray-800 tracking-tighter">₹{tx.amount}</p>
                          {tx.property && (
                             <Link href={`/properties/${tx.property.id}`} className="text-[10px] font-black text-teal-600 uppercase hover:underline mt-1 block">
                                View Asset →
                             </Link>
                          )}
                       </div>
                     </div>
                   ))
                 ) : (
                   <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-20 text-center">
                      <p className="text-gray-400 font-bold uppercase tracking-widest">No transaction history found.</p>
                      <Link href="/membership" className="mt-4 inline-block bg-[#00579e] text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest">
                         Explore Plans
                      </Link>
                   </div>
                 )}
              </div>
           </div>
        )}

      </div>
    </div>
  );
}
