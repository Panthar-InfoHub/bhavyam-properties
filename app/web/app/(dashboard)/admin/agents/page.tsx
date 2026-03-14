'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function AdminAgentsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchApps = async () => {
    setIsLoading(true);
    const user = await getCurrentUser();
    
    if (!user || user.profile?.role !== 'admin') {
       router.push('/dashboard');
       return;
    }

    const { data, error } = await supabase
      .from('agent_applications')
      .select(`
         id,
         status,
         notes,
         created_at,
         user:profiles(id, first_name, last_name, email, phone_number, role)
      `)
      .order('created_at', { ascending: false });

    if (error) {
       console.error("Fetch apps error:", error);
    } else if (data) {
       setApps(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleApprove = async (appId: string, userName: string) => {
    // Generate unique AGT code
    const uniqueHash = Math.random().toString(36).substring(2, 6).toUpperCase();
    const cleanName = userName.substring(0, 3).toUpperCase();
    const newCode = `BHA-AGT-${cleanName}-${uniqueHash}`;

    // Use pure Secure RPC to upgrade users safely
    const { error } = await supabase.rpc('approve_agent_application', {
       app_id: appId,
       generated_code: newCode
    });

    if (error) {
       alert("Failed to approve agent: " + error.message);
    } else {
       // Refresh list
       fetchApps();
    }
  };

  const handleReject = async (appId: string) => {
    const { error } = await supabase.rpc('reject_agent_application', {
       app_id: appId
    });

    if (error) {
       alert("Failed to reject agent: " + error.message);
    } else {
       // Refresh list
       fetchApps();
    }
  };

  return (
    <div className="flex-1 w-full bg-[#fbfcfa] py-10 px-4 sm:px-8 min-h-[80vh]">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#00579e] mb-2 tracking-tight">Agent Applications</h1>
        <p className="text-gray-500 mb-8 border-b border-gray-200 pb-4">Onboard Sellers into the verified Agent tier.</p>

        {isLoading ? (
           <div className="w-full flex justify-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
           </div>
        ) : apps.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center items-center">
             <h3 className="text-2xl font-bold text-gray-700 mb-2">Queue Empty</h3>
             <p className="text-gray-500 max-w-sm">No agent applications are pending inside the system buffer.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {apps.map((app: any) => (
              <div key={app.id} className={`bg-white rounded-2xl shadow-sm border p-6 flex flex-col md:flex-row gap-6 ${app.status === 'pending' ? 'border-yellow-200 border-l-4 border-l-yellow-400' : app.status === 'rejected' ? 'border-red-200 border-l-4 border-l-red-400 opacity-60' : 'border-green-200 border-l-4 border-l-[#00b48f]'}`}>
                
                {/* User Details */}
                <div className="flex-1 border-r border-gray-100 pr-0 md:pr-6">
                  <div className="flex justify-between items-start mb-2">
                     <div>
                        <h3 className="text-lg font-bold text-gray-800 tracking-tight">{app.user?.first_name} {app.user?.last_name}</h3>
                        <p className="text-xs text-gray-400">📞 {app.user?.phone_number} | ✉️ {app.user?.email}</p>
                     </div>
                     <span className="text-xs text-gray-400 font-medium">
                        {new Date(app.created_at).toLocaleDateString()}
                     </span>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mt-4">
                     <p className="text-xs uppercase font-bold text-gray-400 mb-2">Application Notes / Qualifications</p>
                     <p className="text-gray-700 leading-relaxed text-sm">"{app.notes}"</p>
                  </div>
                </div>

                {/* Targets & Approval State Action handlers */}
                <div className="w-full md:w-64 pl-0 md:pl-2 flex flex-col justify-between">
                  <div>
                    <div className="mt-1">
                       <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Current System Role</span>
                       <div className="mt-1 font-bold uppercase tracking-wider text-sm text-gray-800">
                          {app.user?.role}
                       </div>
                    </div>
                    <div className="mt-4">
                       <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Application Status</span>
                       <div className={`mt-1 font-bold uppercase tracking-wider text-sm ${app.status === 'pending' ? 'text-yellow-600' : app.status === 'approved' ? 'text-[#00b48f]' : 'text-red-500'}`}>
                          {app.status}
                       </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-2">
                     {app.status === 'pending' && (
                        <>
                           <button 
                              onClick={() => handleApprove(app.id, app.user?.first_name || 'UNK')}
                              className="w-full bg-[#00b48f] hover:bg-teal-600 text-white font-bold text-xs uppercase tracking-widest py-3 rounded-lg shadow-sm transition-colors"
                           >
                              Generate ID & Approve
                           </button>
                           <button 
                              onClick={() => handleReject(app.id)}
                              className="w-full bg-white hover:bg-red-50 text-red-500 hover:text-red-600 border border-red-200 font-bold text-xs uppercase tracking-widest py-3 rounded-lg transition-colors mt-2"
                           >
                              Reject Tier
                           </button>
                        </>
                     )}
                     {app.status === 'approved' && (
                         <span className="bg-teal-50 text-teal-700 font-bold border border-teal-200 p-3 rounded-lg text-center text-xs uppercase tracking-widest">
                           Agent Actively Verified
                         </span>
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
