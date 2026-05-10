'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ShieldCheck, Mail, CheckCircle2, XCircle, ExternalLink, User, Phone, MapPin, Building2, Calendar, FileText, Image as ImageIcon, Video } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VerificationManager() {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<any>(null);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('property_verifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch verifications');
    } else {
      setVerifications(data || []);
    }
    setIsLoading(false);
  };

  const updateStatus = async (id: string, status: 'verified' | 'rejected') => {
    const { error } = await supabase
      .from('property_verifications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      toast.error(`Failed to mark as ${status}`);
    } else {
      toast.success(`Property marked as ${status}`);
      fetchVerifications();
      if (selectedVerification?.id === id) {
        setSelectedVerification({ ...selectedVerification, status });
      }
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) return <div className="p-12 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse">Loading Verifications...</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Left List */}
      <div className="w-full lg:w-1/3 space-y-4">
        <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase mb-6 flex items-center gap-3">
          <ShieldCheck className="text-[#00ecbd]" />
          Verification Requests
        </h2>
        
        <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-300px)] pr-2">
          {verifications.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVerification(v)}
              className={`w-full text-left p-6 rounded-[2rem] border transition-all duration-300 ${
                selectedVerification?.id === v.id 
                ? 'bg-[#112743] border-[#112743] text-white shadow-xl shadow-[#112743]/20 scale-[1.02]' 
                : 'bg-white border-gray-100 text-gray-900 hover:border-[#00ecbd] hover:shadow-lg'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${
                  v.status === 'verified' ? 'bg-emerald-500/20 text-emerald-400' :
                  v.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                  'bg-orange-500/20 text-orange-400'
                }`}>
                  {v.status}
                </span>
                <span className="text-[10px] font-bold opacity-60">{formatDate(v.created_at)}</span>
              </div>
              <h3 className="font-black text-lg leading-tight mb-1">{v.property_type} in {v.location}</h3>
              <p className={`text-xs font-medium truncate ${selectedVerification?.id === v.id ? 'text-white/60' : 'text-gray-400'}`}>
                Owner: {v.owner_name}
              </p>
            </button>
          ))}
          {verifications.length === 0 && (
            <div className="p-12 text-center bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
              <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No requests yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Detail View */}
      <div className="flex-1">
        {selectedVerification ? (
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="bg-[#112743] p-8 md:p-12 text-white relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ecbd]/10 rounded-full blur-[80px] -mr-32 -mt-32" />
              
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase mb-2">
                    {selectedVerification.property_type}
                  </h2>
                  <p className="text-[#00ecbd] font-bold tracking-widest uppercase text-xs flex items-center gap-2">
                    <MapPin size={14} />
                    {selectedVerification.address}, {selectedVerification.location}
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <a 
                    href={`mailto:${selectedVerification.email}?subject=Regarding Your Property Verification - Bhavyam Properties`}
                    className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl transition-colors backdrop-blur-md"
                    title="Send Email"
                  >
                    <Mail size={24} />
                  </a>
                  {selectedVerification.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => updateStatus(selectedVerification.id, 'rejected')}
                        className="bg-red-500 hover:bg-red-600 p-4 rounded-2xl transition-colors shadow-lg shadow-red-500/20"
                        title="Reject"
                      >
                        <XCircle size={24} />
                      </button>
                      <button 
                        onClick={() => updateStatus(selectedVerification.id, 'verified')}
                        className="bg-[#00ecbd] hover:bg-[#00d0a5] text-[#112743] p-4 rounded-2xl transition-colors shadow-lg shadow-[#00ecbd]/20"
                        title="Verify"
                      >
                        <CheckCircle2 size={24} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Details Content */}
            <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
              
              {/* Info Column */}
              <div className="space-y-8">
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Property Info</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><Building2 size={20} /></div>
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase">Area & Purpose</div>
                        <div className="text-sm font-black text-gray-900">{selectedVerification.areaSize} • For {selectedVerification.purpose}</div>
                      </div>
                    </div>
                    {selectedVerification.expected_price && (
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><span className="font-bold">₹</span></div>
                        <div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase">Expected Price</div>
                          <div className="text-sm font-black text-gray-900">₹ {selectedVerification.expected_price.toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                    )}
                    {selectedVerification.google_maps_url && (
                      <a 
                        href={selectedVerification.google_maps_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 group"
                      >
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all"><MapPin size={20} /></div>
                        <div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase">Location Link</div>
                          <div className="text-sm font-black text-gray-900 flex items-center gap-1 group-hover:text-blue-500">View on Maps <ExternalLink size={12} /></div>
                        </div>
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Contact Info</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><User size={20} /></div>
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase">Owner Name</div>
                        <div className="text-sm font-black text-gray-900">{selectedVerification.owner_name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><Phone size={20} /></div>
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase">Phone Number</div>
                        <div className="text-sm font-black text-gray-900">{selectedVerification.phone_number}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><Mail size={20} /></div>
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase">Email Address</div>
                        <div className="text-sm font-black text-gray-900">{selectedVerification.email}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents Column */}
              <div className="space-y-8">
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Documents & Media</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedVerification.floor_plan_url && (
                      <a href={selectedVerification.floor_plan_url} target="_blank" className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center gap-2 hover:border-[#00ecbd] transition-all group">
                        <FileText className="text-gray-400 group-hover:text-[#00ecbd]" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-800">Floor Plan</span>
                      </a>
                    )}
                    {selectedVerification.certificate_url && (
                      <a href={selectedVerification.certificate_url} target="_blank" className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center gap-2 hover:border-[#00ecbd] transition-all group">
                        <ShieldCheck className="text-gray-400 group-hover:text-[#00ecbd]" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-800">Certificate</span>
                      </a>
                    )}
                    {selectedVerification.id_proof_url && (
                      <a href={selectedVerification.id_proof_url} target="_blank" className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center gap-2 hover:border-[#00ecbd] transition-all group">
                        <User className="text-gray-400 group-hover:text-[#00ecbd]" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-800">ID Proof</span>
                      </a>
                    )}
                    {selectedVerification.video_url && (
                      <a href={selectedVerification.video_url} target="_blank" className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center gap-2 hover:border-[#00ecbd] transition-all group">
                        <Video className="text-gray-400 group-hover:text-[#00ecbd]" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-800">Video Tour</span>
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Property Images</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedVerification.images?.map((img: string, idx: number) => (
                      <a 
                        key={idx} 
                        href={img} 
                        target="_blank" 
                        className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200 hover:scale-105 transition-transform"
                      >
                        <img src={img} className="w-full h-full object-cover" />
                      </a>
                    ))}
                    {(!selectedVerification.images || selectedVerification.images.length === 0) && (
                      <div className="col-span-3 py-8 text-center text-gray-300 font-bold uppercase text-[10px] border-2 border-dashed border-gray-100 rounded-2xl">
                        No Images Provided
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="h-full min-h-[600px] bg-white rounded-[3rem] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center p-12">
            <div className="w-24 h-24 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mb-6">
              <ShieldCheck size={48} />
            </div>
            <h3 className="text-xl font-black text-gray-300 uppercase tracking-widest">Select a request to view details</h3>
          </div>
        )}
      </div>
    </div>
  );
}
