'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AgentDashboardPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [agentProfile, setAgentProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAgentData = async () => {
      const user = await getCurrentUser();
      if (!user) {
         router.push('/login');
         return;
      }
      
      const p = user.profile;
      if (p?.role !== 'agent') {
         // Not an agent? Send to standard user dashboard or registration
         router.push('/dashboard/user/apply-agent');
         return;
      }
      
      setAgentProfile(p);

      // Grab all properties belonging to this agent + a live count of how many users have favorited it
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
           favorites(count)
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
         setProperties(data);
      }
      
      setIsLoading(false);
    };

    fetchAgentData();
  }, [router]);

  if (isLoading) {
     return <div className="p-24 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div></div>;
  }

  // Calculate totals
  const totalListings = properties.length;
  const approvedListings = properties.filter(r => r.status === 'approved').length;
  const totalFavorites = properties.reduce((acc, curr) => acc + (curr.favorites[0]?.count || 0), 0);

  return (
    <div className="flex-1 w-full bg-[#fbfcfa] py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-gray-200 pb-6 gap-4">
           <div>
              <h1 className="text-3xl font-extrabold text-[#00579e] mb-2 tracking-tight">Agent Command Center</h1>
              <p className="text-gray-500">Welcome back, {agentProfile?.first_name}. Manage your bulk listings and leads.</p>
           </div>
           
           <div className="bg-white border text-center border-gray-200 shadow-sm p-4 rounded-xl flex flex-col md:items-end w-full md:w-auto">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Official Licensed Agent Code</span>
              <span className="text-2xl font-mono text-teal-600 bg-teal-50 px-4 py-1 rounded-sm tracking-[0.2em]">{agentProfile?.agent_code || 'AGT-PENDING'}</span>
           </div>
        </div>

        {/* Action Highlights Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                 <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Properties</p>
                 <p className="text-4xl font-black text-gray-800 mt-2">{totalListings}</p>
                 <p className="text-xs text-green-500 mt-2 font-medium">({approvedListings} Live & Approved)</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-full text-blue-500">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
           </div>

           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                 <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Saved by Buyers</p>
                 <p className="text-4xl font-black text-gray-800 mt-2">{totalFavorites}</p>
                 <p className="text-xs text-gray-500 mt-2 font-medium">Total hearts collected</p>
              </div>
              <div className="bg-red-50 p-4 rounded-full text-red-500">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </div>
           </div>

           <Link href="/dashboard/submit-property" className="bg-linear-to-br from-[#00b48f] to-teal-400 hover:from-teal-400 hover:to-teal-300 transition-all p-6 rounded-2xl shadow-xl shadow-teal-500/20 text-white flex flex-col justify-center items-center text-center transform hover:-translate-y-1">
              <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              <h3 className="text-lg font-bold">Submit New Listing</h3>
              <p className="text-teal-100 text-xs mt-1 uppercase tracking-widest font-semibold">Bypass Max Limit</p>
           </Link>
        </div>

        {/* Listings Table */}
        <h3 className="text-xl font-bold text-gray-800 mb-6">Your Properties Directory</h3>
        
        {totalListings === 0 ? (
           <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center shadow-sm">
             <p className="text-gray-500">You haven't uploaded any properties to your agency yet.</p>
           </div>
        ) : (
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                     <tr>
                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Listing</th>
                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Type</th>
                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">❤️ Favs</th>
                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Added On</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                     {properties.map(p => (
                       <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                             <p className="font-bold text-gray-800">{p.property_type}</p>
                             <p className="text-sm text-gray-500">{p.city}</p>
                          </td>
                          <td className="p-4">
                             <span className="bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded text-xs uppercase tracking-wider">{p.listing_type}</span>
                          </td>
                          <td className="p-4">
                             {p.status === 'pending' && <span className="bg-yellow-50 text-yellow-700 font-bold px-2 py-1 rounded text-xs uppercase tracking-wider">Pending</span>}
                             {p.status === 'approved' && <span className="bg-teal-50 text-teal-700 font-bold px-2 py-1 rounded text-xs uppercase tracking-wider">Live & Approved</span>}
                             {p.status === 'rejected' && <span className="bg-red-50 text-red-700 font-bold px-2 py-1 rounded text-xs uppercase tracking-wider">Rejected</span>}
                          </td>
                          <td className="p-4 text-center font-bold text-gray-600">
                             {p.favorites[0]?.count || 0}
                          </td>
                          <td className="p-4 text-right text-sm text-gray-500 font-medium whitespace-nowrap">
                             {new Date(p.created_at).toLocaleDateString()}
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
             </div>
           </div>
        )}
        
      </div>
    </div>
  );
}
