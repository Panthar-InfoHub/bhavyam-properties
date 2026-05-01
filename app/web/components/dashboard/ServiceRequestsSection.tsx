'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

interface ServiceRequest {
  id: string;
  service_type: string;
  user_id: string | null;
  user_name: string;
  contact_info: string;
  business_name?: string;
  business_type?: string;
  property_type?: string;
  location?: string;
  budget?: string;
  expected_price?: string;
  assistance_type?: string;
  loan_amount?: string;
  employment_status?: string;
  query_description: string;
  status: string;
  created_at: string;
}

interface ServiceRequestsSectionProps {
  requests: ServiceRequest[];
  onStatusUpdate: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

export default function ServiceRequestsSection({ requests, onStatusUpdate, onDelete }: ServiceRequestsSectionProps) {
  const [filter, setFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const serviceTypes = ['All', 'Commercial Spaces', 'Rent Property', 'Sell Property', 'Legal Assistance', 'Property Loan'];
  const statusTypes = ['All', 'pending', 'contacted', 'rejected'];

  const filteredRequests = requests.filter(req => {
    const matchesCategory = filter === 'All' || req.service_type === filter;
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    return matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'contacted': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-yellow-50 text-yellow-700 border-yellow-100';
    }
  };

  const handleDelete = () => {
    if (deletingId) {
      onDelete(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#00579e]">Service Queries</h1>
            <p className="text-gray-500 text-sm font-medium mt-1">Manage general inquiries and service requests from users.</p>
          </div>

          {/* Category Slider/Filter */}
          <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto scrollbar-hide">
            {serviceTypes.map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  filter === type 
                    ? 'bg-[#00579e] text-white shadow-md' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Filter Status:</p>
          <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 overflow-x-auto">
            {statusTypes.map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  statusFilter === st 
                    ? 'bg-white text-[#00579e] shadow-sm ring-1 ring-gray-200' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredRequests.map(req => (
          <div 
            key={req.id} 
            className={`bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 relative overflow-hidden group`}
          >
            {/* Status Badge */}
            <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest border-l border-b ${getStatusColor(req.status)}`}>
              {req.status}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
                  req.service_type === 'Commercial Spaces' ? 'bg-indigo-50 text-indigo-600' :
                  req.service_type === 'Rent Property' ? 'bg-emerald-50 text-emerald-600' :
                  req.service_type === 'Sell Property' ? 'bg-orange-50 text-orange-600' :
                  req.service_type === 'Legal Assistance' ? 'bg-purple-50 text-purple-600' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  {req.service_type === 'Commercial Spaces' ? '🏢' :
                   req.service_type === 'Rent Property' ? '🏠' :
                   req.service_type === 'Sell Property' ? '💰' :
                   req.service_type === 'Legal Assistance' ? '⚖️' : '💳'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{req.service_type}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Received on {new Date(req.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-6">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">User Details</p>
                  <p className="text-sm font-bold text-gray-800">{req.user_name}</p>
                  <p className="text-xs text-gray-500 font-medium">{req.contact_info}</p>
                </div>

                {req.business_name && (
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Business</p>
                    <p className="text-sm font-bold text-gray-800">{req.business_name}</p>
                    <p className="text-xs text-gray-500 font-medium">{req.business_type}</p>
                  </div>
                )}
                {req.property_type && (
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Property Interest</p>
                    <p className="text-sm font-bold text-gray-800">{req.property_type}</p>
                    <p className="text-xs text-gray-500 font-medium">{req.location || 'Anywhere'}</p>
                  </div>
                )}
                {req.budget && (
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Budget/Price</p>
                    <p className="text-sm font-bold text-gray-800">{req.budget}</p>
                  </div>
                )}
                {req.expected_price && (
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Asking Price</p>
                    <p className="text-sm font-bold text-gray-800">{req.expected_price}</p>
                  </div>
                )}
                {req.assistance_type && (
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Legal Help</p>
                    <p className="text-sm font-bold text-gray-800">{req.assistance_type}</p>
                  </div>
                )}
                {req.loan_amount && (
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Loan Query</p>
                    <p className="text-sm font-bold text-gray-800">{req.loan_amount}</p>
                    <p className="text-xs text-gray-500 font-medium">{req.employment_status}</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Query Description</p>
                <p className="text-sm text-gray-700 italic border-l-2 border-[#00b48f] pl-3 leading-relaxed">
                  "{req.query_description}"
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 justify-center shrink-0 border-t md:border-t-0 md:border-l border-gray-50 pt-4 md:pt-0 md:pl-6 min-w-[150px]">
              {req.status === 'pending' ? (
                <>
                  <button 
                    onClick={() => onStatusUpdate(req.id, 'contacted')}
                    className="w-full bg-[#00b48f] hover:bg-teal-600 text-white text-[10px] font-black uppercase tracking-widest py-2 px-1 rounded-xl shadow-md transition-all active:scale-95"
                  >
                    Mark Contacted
                  </button>
                  <button 
                    onClick={() => setDeletingId(req.id)}
                    className="w-full bg-[#efe4e4] hover:bg-red-50 text-red-500 border border-red-100 text-[10px] font-black uppercase tracking-widest py-2 rounded-xl transition-all"
                  >
                    Delete Request
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => onStatusUpdate(req.id, 'pending')}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-all"
                  >
                    Move to Pending
                  </button>
                  <button 
                    onClick={() => setDeletingId(req.id)}
                    className="w-full bg-white hover:bg-red-50 text-red-500 border border-red-100 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-all"
                  >
                    Delete Request
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {filteredRequests.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center items-center">
             <div className="text-4xl mb-4">📭</div>
             <h3 className="text-2xl font-bold text-gray-700 mb-2">No Queries Found</h3>
             <p className="text-gray-500 max-w-sm">There are no service requests matching these filters.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto">
              ⚠️
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Request?</h3>
            <p className="text-gray-500 text-center text-sm mb-8">
              This action cannot be undone. Are you sure you want to delete this service query?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeletingId(null)}
                className="flex-1 px-6 py-3 rounded-xl bg-gray-100 text-gray-600 text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 px-6 py-3 rounded-xl bg-red-500 text-white text-xs font-black uppercase tracking-widest hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
