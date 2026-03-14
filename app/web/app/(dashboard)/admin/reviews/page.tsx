'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchReviews = async () => {
    setIsLoading(true);
    const user = await getCurrentUser();
    
    // Safety generic backend validation (we assume higher security layer exists on dashboard route directly, but double checking for manual navigations)
    if (!user || user.profile?.role !== 'admin') {
       router.push('/dashboard');
       return;
    }

    const { data, error } = await supabase
      .from('reviews')
      .select(`
         id,
         rating,
         comment,
         status,
         created_at,
         property_id,
         user:profiles(first_name, last_name, email),
         property:properties(property_type, city)
      `)
      .order('created_at', { ascending: false });

    if (error) {
       console.error("Fetch reviews error:", error);
    } else if (data) {
       setReviews(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    // Optimistic UI toggle immediately
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));

    const { error } = await supabase
       .from('reviews')
       .update({ status: newStatus })
       .eq('id', id);

    if (error) {
       alert("Failed to update status: " + error.message);
       fetchReviews(); // Revert Optimistic UI
    }
  };

  return (
    <div className="flex-1 w-full bg-[#fbfcfa] py-10 px-4 sm:px-8 min-h-[80vh]">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#00579e] mb-2 tracking-tight">Review Moderation Console</h1>
        <p className="text-gray-500 mb-8 border-b border-gray-200 pb-4">Approve or reject public sentiment enforcing strict No-Contact Information compliance policies.</p>

        {isLoading ? (
           <div className="w-full flex justify-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
           </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center items-center">
             <h3 className="text-2xl font-bold text-gray-700 mb-2">Queue Empty</h3>
             <p className="text-gray-500 max-w-sm">There are no property reviews waiting inside the system table buffer.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {reviews.map((rev: any) => (
              <div key={rev.id} className={`bg-white rounded-2xl shadow-sm border p-6 flex flex-col md:flex-row gap-6 ${rev.status === 'pending' ? 'border-yellow-200 border-l-4 border-l-yellow-400' : rev.status === 'rejected' ? 'border-red-200 border-l-4 border-l-red-400 opacity-60' : 'border-green-200 border-l-4 border-l-[#00b48f]'}`}>
                
                {/* Moderation Details */}
                <div className="flex-1 border-r border-gray-100 pr-0 md:pr-6">
                  <div className="flex justify-between items-start mb-2">
                     <div>
                        <h3 className="text-lg font-bold text-gray-800 tracking-tight">{rev.user?.first_name} {rev.user?.last_name}</h3>
                        <p className="text-xs text-gray-400">{rev.user?.email}</p>
                     </div>
                     <span className="text-xs text-gray-400 font-medium">
                        {new Date(rev.created_at).toLocaleDateString()}
                     </span>
                  </div>
                  
                  <div className="flex text-yellow-400 mt-2 mb-4 drop-shadow-sm">
                     {Array.from({ length: 5 }).map((_, i) => (
                       <svg key={i} className={`w-4 h-4 ${i < rev.rating ? 'fill-current' : 'text-gray-200 fill-current'}`} viewBox="0 0 20 20">
                         <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                       </svg>
                     ))}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                     <p className="text-gray-700 italic border-l-2 border-teal-300 pl-3 leading-relaxed text-sm">"{rev.comment}"</p>
                  </div>
                </div>

                {/* Target & Approvals Column */}
                <div className="w-full md:w-64 pl-0 md:pl-2 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#00579e] uppercase tracking-wider bg-blue-50 px-2 py-1 rounded">Target Listing</span>
                    <h4 className="text-md font-bold text-gray-800 mt-2 line-clamp-1">{rev.property?.property_type}</h4>
                    <p className="text-sm text-gray-500 truncate">{rev.property?.city}</p>
                    
                    <div className="mt-4">
                       <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Current Status</span>
                       <div className={`mt-1 font-bold uppercase tracking-wider text-sm ${rev.status === 'pending' ? 'text-yellow-600' : rev.status === 'approved' ? 'text-[#00b48f]' : 'text-red-500'}`}>
                          {rev.status}
                       </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-2">
                     {rev.status !== 'approved' && (
                        <button 
                           onClick={() => handleUpdateStatus(rev.id, 'approved')}
                           className="w-full bg-[#00b48f] hover:bg-teal-600 text-white font-bold text-xs uppercase tracking-widest py-2 rounded shadow-sm transition-colors"
                        >
                           Approve Post
                        </button>
                     )}
                     {rev.status !== 'rejected' && (
                        <button 
                           onClick={() => handleUpdateStatus(rev.id, 'rejected')}
                           className="w-full bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-200 hover:border-red-500 font-bold text-xs uppercase tracking-widest py-2 rounded transition-colors"
                        >
                           Reject & Hide
                        </button>
                     )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
