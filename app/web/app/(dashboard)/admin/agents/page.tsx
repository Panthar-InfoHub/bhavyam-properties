'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function AdminAgentsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

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
         aadhaar_url,
         pan_url,
         certificate_url,
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

  const parseNotes = (notes: string) => {
    if (!notes) return null;
    const fields = ["Full Name", "Email", "Phone Number", "Experience", "Reason for Joining Us", "Skills"];
    const result: Record<string, string> = {};
    
    try {
      let lastIndex = 0;
      fields.forEach((field, index) => {
        const fieldMarker = `${field}:`;
        const startIdx = notes.indexOf(fieldMarker);
        
        if (startIdx !== -1) {
          // Find where the next field starts
          let endIdx = notes.length;
          for (let i = index + 1; i < fields.length; i++) {
            const nextMarker = `${fields[i]}:`;
            const nextIdx = notes.indexOf(nextMarker);
            if (nextIdx !== -1) {
              endIdx = nextIdx;
              break;
            }
          }
          
          const value = notes.substring(startIdx + fieldMarker.length, endIdx).trim();
          result[field] = value;
        }
      });

      if (Object.keys(result).length === 0) return null;
      return result;
    } catch (e) {
      return null;
    }
  };

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
       setShowModal(false);
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
       setShowModal(false);
       fetchApps();
    }
  };

  const QualificationCard = ({ notes, isCompact = false }: { notes: string, isCompact?: boolean }) => {
    const data = parseNotes(notes);
    if (!data) return <p className="text-gray-700 leading-relaxed text-sm">"{notes}"</p>;

    return (
      <div className={`grid ${isCompact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">{key}</p>
            <p className="text-sm font-bold text-gray-800 break-words">{value || 'N/A'}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 w-full bg-[#fbfcfa] py-10 px-4 sm:px-8 min-h-[80vh]">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-extrabold text-[#00579e] tracking-tight">Agent Applications</h1>
          <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
             <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
             <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">{apps.length} Total Applications</span>
          </div>
        </div>
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
              <div 
                key={app.id} 
                onClick={() => { setSelectedApp(app); setShowModal(true); }}
                className={`bg-white rounded-2xl shadow-sm border p-6 flex flex-col md:flex-row gap-6 cursor-pointer transition-all hover:shadow-md hover:border-blue-200 group relative ${app.status === 'pending' ? 'border-yellow-200 border-l-4 border-l-yellow-400' : app.status === 'rejected' ? 'border-red-200 border-l-4 border-l-red-400 opacity-60' : 'border-green-200 border-l-4 border-l-[#00b48f]'}`}
              >
                
                {/* User Details */}
                <div className="flex-1 border-r border-gray-100 pr-0 md:pr-6">
                  <div className="flex justify-between items-start mb-2">
                     <div>
                        <h3 className="text-lg font-bold text-gray-800 tracking-tight group-hover:text-blue-600 transition-colors">{app.user?.first_name} {app.user?.last_name}</h3>
                        <p className="text-xs text-gray-400 font-medium">📞 {app.user?.phone_number} | ✉️ {app.user?.email}</p>
                     </div>
                     <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded">
                        {new Date(app.created_at).toLocaleDateString()}
                     </span>
                  </div>
                  
                  <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 mt-4">
                     <div className="flex justify-between items-center mb-4">
                        <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Qualification Summary</p>
                        <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-widest">Click to View All</span>
                     </div>
                     <QualificationCard notes={app.notes} isCompact={true} />
                  </div>
                </div>

                {/* Targets & Approval State Action handlers */}
                <div className="w-full md:w-64 pl-0 md:pl-2 flex flex-col justify-between" onClick={(e) => e.stopPropagation()}>
                  <div>
                    <div className="mt-1">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Role</span>
                       <div className="mt-1 font-bold uppercase tracking-wider text-xs text-gray-700 bg-gray-100 px-3 py-1 rounded-full inline-block">
                          {app.user?.role}
                       </div>
                    </div>
                    <div className="mt-4">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</span>
                       <div className={`mt-1 font-black uppercase tracking-wider text-xs ${app.status === 'pending' ? 'text-yellow-600' : app.status === 'approved' ? 'text-[#00b48f]' : 'text-red-500'}`}>
                          {app.status}
                       </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-2">
                     {app.status === 'pending' && (
                        <>
                           <button 
                              onClick={() => handleApprove(app.id, app.user?.first_name || 'UNK')}
                              className="w-full bg-[#00b48f] hover:bg-teal-600 text-white font-bold text-[10px] uppercase tracking-widest py-3 rounded-xl shadow-lg shadow-teal-100 transition-all active:scale-95"
                           >
                              Approve Agent
                           </button>
                           <button 
                              onClick={() => handleReject(app.id)}
                              className="w-full bg-white hover:bg-red-50 text-red-400 hover:text-red-500 border border-red-100 font-bold text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all"
                           >
                              Reject
                           </button>
                        </>
                     )}
                     {app.status === 'approved' && (
                         <div className="flex flex-col items-center gap-2 p-3 bg-teal-50/50 rounded-2xl border border-teal-100">
                           <div className="w-8 h-8 bg-[#00b48f] text-white rounded-full flex items-center justify-center text-sm shadow-md">✓</div>
                           <span className="text-teal-700 font-black text-[10px] uppercase tracking-widest">Verified Agent</span>
                         </div>
                     )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selectedApp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="absolute inset-0" 
            onClick={() => setShowModal(false)}
          ></div>
          
          <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-200">
                  {selectedApp.user?.first_name?.[0]}{selectedApp.user?.last_name?.[0]}
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">
                    {selectedApp.user?.first_name} {selectedApp.user?.last_name}
                  </h3>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Agent Application Details</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Info & Docs */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Qualification Detail */}
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                      <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">Application Data</h4>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                      <QualificationCard notes={selectedApp.notes} />
                    </div>
                  </section>

                  {/* Documents Section */}
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1.5 h-6 bg-teal-500 rounded-full"></div>
                      <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">Submitted Documents</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <DocLink url={selectedApp.aadhaar_url} label="Aadhaar Card" icon="🆔" color="teal" />
                      <DocLink url={selectedApp.pan_url} label="PAN Card" icon="💳" color="blue" />
                      <DocLink url={selectedApp.certificate_url} label="Business Cert" icon="📜" color="purple" />
                    </div>
                    {(!selectedApp.aadhaar_url && !selectedApp.pan_url && !selectedApp.certificate_url) && (
                      <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 text-sm font-medium">
                        No documents were uploaded with this application.
                      </div>
                    )}
                  </section>
                </div>

                {/* Right Side: Status & Actions */}
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm sticky top-0">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Current Status</h4>
                    
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-3 h-3 rounded-full ${selectedApp.status === 'pending' ? 'bg-yellow-400 animate-pulse' : selectedApp.status === 'approved' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={`font-black uppercase tracking-widest text-sm ${selectedApp.status === 'pending' ? 'text-yellow-600' : selectedApp.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedApp.status}
                      </span>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-gray-100">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contact Email</p>
                        <p className="text-sm font-bold text-gray-800 break-all">{selectedApp.user?.email}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Phone Number</p>
                        <p className="text-sm font-bold text-gray-800">{selectedApp.user?.phone_number || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Submitted On</p>
                        <p className="text-sm font-bold text-gray-800">{new Date(selectedApp.created_at).toLocaleString()}</p>
                      </div>
                    </div>

                    {selectedApp.status === 'pending' && (
                      <div className="mt-8 space-y-3">
                        <button 
                          onClick={() => handleApprove(selectedApp.id, selectedApp.user?.first_name || 'UNK')}
                          className="w-full bg-[#00b48f] hover:bg-teal-600 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-teal-100 transition-all active:scale-[0.98]"
                        >
                          Approve & Issue ID
                        </button>
                        <button 
                          onClick={() => handleReject(selectedApp.id)}
                          className="w-full bg-white hover:bg-red-50 text-red-400 hover:text-red-500 border border-red-100 font-black text-xs uppercase tracking-widest py-4 rounded-xl transition-all"
                        >
                          Reject Application
                        </button>
                      </div>
                    )}

                    {selectedApp.status === 'approved' && (
                      <div className="mt-8 p-4 bg-teal-50 rounded-2xl border border-teal-100 text-center">
                        <p className="text-teal-700 font-black text-xs uppercase tracking-widest">✓ Verified Agent</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const DocLink = ({ url, label, icon, color }: { url?: string, label: string, icon: string, color: string }) => {
  if (!url) return null;
  
  const colors: any = {
    teal: "text-teal-600 bg-teal-50 border-teal-100 hover:bg-teal-100",
    blue: "text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100 hover:bg-purple-100"
  };

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noreferrer" 
      className={`flex flex-col items-center justify-center gap-2 p-4 border rounded-2xl transition-all group ${colors[color]}`}
    >
      <span className="text-2xl group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      <span className="text-[9px] font-bold opacity-60">View File ↗</span>
    </a>
  );
};
