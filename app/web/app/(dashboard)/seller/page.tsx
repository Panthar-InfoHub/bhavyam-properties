'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SellerDashboardPage() {
  const [property, setProperty] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestType, setRequestType] = useState<'edit' | 'delete' | 'update_documents'>('edit');
  const [requestMessage, setRequestMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const user = await getCurrentUser();
      if (!user) { router.push('/login'); return; }
      if (user.profile?.role !== 'seller') { router.push('/dashboard'); return; }

      setProfile(user.profile);

      // A seller can only have ONE property — fetch it
      const { data: propData } = await supabase
        .from('properties')
        .select(`
          id, listing_type, property_type, city, area, price, status, created_at,
          media:property_media(url, media_type)
        `)
        .eq('owner_id', user.id)
        .limit(1)
        .maybeSingle();

      setProperty(propData);

      // Fetch their requests
      const { data: reqData } = await supabase
        .from('requests')
        .select('id, request_type, message, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setRequests(reqData || []);
      setIsLoading(false);
    };
    fetchData();
  }, [router]);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    setIsSubmitting(true);
    setSuccessMsg('');
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('requests').insert({
        user_id: user.id,
        property_id: property.id,
        request_type: requestType,
        message: requestMessage,
        status: 'pending'
      });
      if (error) throw error;

      // Optimistically update local list
      setRequests(prev => [{
        id: crypto.randomUUID(),
        request_type: requestType,
        message: requestMessage,
        status: 'pending',
        created_at: new Date().toISOString()
      }, ...prev]);

      setSuccessMsg('Request submitted! Admin will review it shortly.');
      setRequestMessage('');
      setShowRequestForm(false);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-24 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div></div>;
  }

  const mainImage = property?.media?.[0]?.url || 'https://placehold.co/600x400/eeeeee/999999?text=No+Image';
  const formattedPrice = property ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumSignificantDigits: 3 }).format(property.price) : '';

  return (
    <div className="flex-1 w-full bg-[#fbfcfa] py-8 px-4 sm:px-8 min-h-[80vh]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-200 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#00579e] mb-1 tracking-tight">Seller Dashboard</h1>
            <p className="text-gray-500 text-sm">Hello, {profile?.first_name}. Manage your single active property listing.</p>
          </div>
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-600 px-4 py-2 rounded-full">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span className="text-xs font-bold uppercase tracking-widest">Unverified Seller</span>
          </div>
        </div>

        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl mb-6 flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            <p className="font-medium text-sm">{successMsg}</p>
          </div>
        )}

        {/* My Property section */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">My Property</h2>
        {!property ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center mb-10">
            <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            <h3 className="text-xl font-bold text-gray-600 mb-2">No Property Listed Yet</h3>
            <p className="text-gray-400 mb-6 text-sm">As a seller, you may submit one property for admin review.</p>
            <Link href="/submit-property" className="bg-[#00b48f] hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md">
              Submit My Property
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-10">
            <div className="flex flex-col md:flex-row">
              <div className="relative w-full md:w-64 h-48 md:h-auto shrink-0">
                <img src={mainImage} alt={property.property_type} className="w-full h-full object-cover" />
                {/* Unverified Seller badge on the listing card too */}
                <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-widest shadow">
                  Unverified Seller
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{property.property_type} in {property.city}</h3>
                      <p className="text-gray-500 text-sm">{property.area}</p>
                    </div>
                    <span className="text-2xl font-black text-[#00579e]">{formattedPrice}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <span className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wider bg-blue-50 text-blue-700">{property.listing_type}</span>
                    {property.status === 'pending' && <span className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wider bg-yellow-50 text-yellow-700">Pending Approval</span>}
                    {property.status === 'approved' && <span className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wider bg-teal-50 text-teal-700">Live & Approved</span>}
                    {property.status === 'rejected' && <span className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wider bg-red-50 text-red-700">Rejected</span>}
                  </div>
                </div>
                <div className="flex gap-3 mt-6 flex-wrap">
                  {(['edit', 'update_documents', 'delete'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => { setRequestType(type); setShowRequestForm(true); }}
                      className={`text-xs font-bold uppercase tracking-widest py-2 px-4 rounded-lg border transition-colors ${
                        type === 'delete'
                          ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-500 hover:text-white'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      Request {type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Request form */}
        {showRequestForm && property && (
          <div className="bg-zinc-900 rounded-2xl p-6 mb-10 relative shadow-xl animate-in fade-in zoom-in duration-200">
            <button onClick={() => setShowRequestForm(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-xl font-bold text-white mb-1 capitalize">Request: {requestType.replace('_', ' ')}</h3>
            <p className="text-zinc-400 text-sm mb-5">Admin will be notified and process your request manually.</p>
            <form onSubmit={handleRequestSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-zinc-300 text-xs font-bold uppercase tracking-widest mb-2">Request Type</label>
                <select
                  value={requestType}
                  onChange={e => setRequestType(e.target.value as any)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white p-3 rounded-lg outline-none focus:border-teal-500"
                >
                  <option value="edit">Edit Property Details</option>
                  <option value="delete">Delete Property Listing</option>
                  <option value="update_documents">Update Documents</option>
                </select>
              </div>
              <div>
                <label className="block text-zinc-300 text-xs font-bold uppercase tracking-widest mb-2">Your Message / Reason</label>
                <textarea
                  required
                  rows={4}
                  value={requestMessage}
                  onChange={e => setRequestMessage(e.target.value)}
                  placeholder="Explain what changes you need or why you want to delete this listing..."
                  className="w-full bg-zinc-800 border border-zinc-700 text-white p-3 rounded-lg outline-none focus:border-teal-500 placeholder-zinc-500"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="self-start bg-[#00b48f] hover:bg-teal-400 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-md disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Send Request'}
              </button>
            </form>
          </div>
        )}

        {/* Requests History */}
        {requests.length > 0 && (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-4">My Requests</h2>
            <div className="flex flex-col gap-3">
              {requests.map(req => (
                <div key={req.id} className={`bg-white border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${req.status === 'pending' ? 'border-yellow-200' : req.status === 'approved' ? 'border-teal-200' : 'border-red-200'}`}>
                  <div>
                    <span className="font-bold text-gray-800 capitalize">{req.request_type.replace('_', ' ')}</span>
                    <p className="text-sm text-gray-500 mt-1 italic">"{req.message}"</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-xs text-gray-400">{new Date(req.created_at).toLocaleDateString()}</span>
                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${req.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : req.status === 'approved' ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-600'}`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
