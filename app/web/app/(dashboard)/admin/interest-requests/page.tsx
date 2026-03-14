import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const revalidate = 0; // Force dynamic to always show latest requests

export default async function AdminInterestRequestsPage() {
  const user = await getCurrentUser();
  if (!user || user.profile?.role !== 'admin') {
     redirect('/dashboard');
  }

  // Fetch all requests, explicitly map foreign keys directly
  // Note: We use !inner or explicitly map the relation names based on our schema setup
  const { data: requests, error } = await supabase
    .from('interest_requests')
    .select(`
      id,
      message,
      status,
      created_at,
      user_id,
      property_id,
      user:profiles!interest_requests_user_id_fkey(first_name, last_name, email, phone_number),
      property:properties!inner(property_type, city, listing_type, owner:profiles!properties_owner_id_fkey(first_name, last_name, phone_number))
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Admin error fetching requests:", error);
  }

  return (
    <div className="flex-1 w-full bg-[#fbfcfa] py-10 px-4 sm:px-8 min-h-[80vh]">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#00579e] mb-2 tracking-tight">Interest Requests</h1>
        <p className="text-gray-500 mb-8 border-b border-gray-200 pb-4">Manage leads and connect prospective buyers with sellers/agents.</p>

        {(!requests || requests.length === 0) ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center items-center">
             <h3 className="text-2xl font-bold text-gray-700 mb-2">No Requests</h3>
             <p className="text-gray-500 max-w-sm">No one has expressed interest in any properties yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {requests.map((req: any) => (
              <div key={req.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-6">
                
                {/* Lead Details */}
                <div className="flex-1 border-r border-gray-100 pr-0 md:pr-6">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <span className="text-xs font-bold text-[#00b48f] uppercase tracking-wider bg-teal-50 px-2 py-1 rounded">Lead</span>
                        <h3 className="text-xl font-bold text-gray-800 mt-2">{req.user?.first_name} {req.user?.last_name}</h3>
                     </div>
                     <span className="text-xs text-gray-400 font-medium">
                        {new Date(req.created_at).toLocaleDateString()}
                     </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1 mb-4">
                     <p>📞 {req.user?.phone_number || 'N/A'}</p>
                     <p>✉️ {req.user?.email || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 relative">
                     <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Message</p>
                     <p className="text-gray-700 italic border-l-2 border-teal-300 pl-3">"{req.message}"</p>
                  </div>
                </div>

                {/* Target Property & Owner Details */}
                <div className="flex-1 pl-0 md:pl-2 flex flex-col justify-between">
                  <div>
                    <div className="mb-4 pb-4 border-b border-gray-100">
                      <span className="text-xs font-bold text-[#00579e] uppercase tracking-wider bg-blue-50 px-2 py-1 rounded">Target Property</span>
                      <h4 className="text-lg font-bold text-gray-800 mt-2 line-clamp-1">{req.property?.property_type} in {req.property?.city}</h4>
                      <p className="text-sm text-gray-500">{req.property?.listing_type}</p>
                    </div>

                    <div>
                       <span className="text-xs font-bold text-orange-500 uppercase tracking-wider bg-orange-50 px-2 py-1 rounded">Property Owner/Agent</span>
                       <h4 className="text-md font-bold text-gray-800 mt-2">{req.property?.owner?.first_name} {req.property?.owner?.last_name}</h4>
                       <p className="text-sm text-gray-600 mt-1">📞 {req.property?.owner?.phone_number || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                     <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 text-sm font-semibold rounded-lg transition-colors shadow-sm">
                        Mark Contacted
                     </button>
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
