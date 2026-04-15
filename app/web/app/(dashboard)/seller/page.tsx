'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import PremiumLoader from '@/components/ui/PremiumLoader';

export default function SellerDashboardPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [requestType, setRequestType] = useState<'edit' | 'delete' | 'update_documents'>('edit');
  const [requestMessage, setRequestMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>('overview');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const user = await getCurrentUser();
      if (!user) { router.push('/login'); return; }
      if (user.profile?.role !== 'seller') { router.push('/dashboard'); return; }

      setProfile(user.profile);

      // Fetch ALL properties owned by this seller
      const { data: propData } = await supabase
        .from('properties')
        .select(`
          id, listing_type, property_type, city, area, price, status, created_at,
          media:property_media(url, media_type),
          favorites(count)
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      setProperties(propData || []);

      // Fetch their requests
      const { data: reqData } = await supabase
        .from('requests')
        .select('id, request_type, message, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setRequests(reqData || []);

      // Fetch seller's transactions
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
    fetchData();
  }, [router]);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) return;
    setIsSubmitting(true);
    setSuccessMsg('');
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('requests').insert({
        user_id: user.id,
        property_id: selectedProperty.id,
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

      setSuccessMsg(`Request for ${selectedProperty.property_type} submitted! Admin will review it shortly.`);
      setRequestMessage('');
      setShowRequestForm(false);
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PremiumLoader 
        messages={[
          "Fetching seller profile",
          "Loading your asset list",
          "Synchronizing market activity",
          "Preparing your dashboard"
        ]}
        duration={1500}
      />
    );
  }

  return (
    <div className="flex-1 w-full bg-[#fbfcfa] py-8 px-4 sm:px-8 min-h-[80vh]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-200 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#00579e] mb-1 tracking-tight">Seller Dashboard</h1>
            <p className="text-gray-500 text-sm">Hello, {profile?.first_name}. Manage your property listings and monitor performance.</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-600 px-4 py-2 rounded-full">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span className="text-xs font-bold uppercase tracking-widest">Unverified Seller</span>
            </div>
            <Link href="/submit-property" className="text-[10px] font-black uppercase text-teal-600 hover:underline tracking-widest px-2">
               + List New Property
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 w-fit mb-10 shadow-sm">
           <button 
             onClick={() => setActiveTab('overview')}
             className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-[#00579e] text-white shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
           >
             My Account
           </button>
           <button 
             onClick={() => setActiveTab('transactions')}
             className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'transactions' ? 'bg-[#00579e] text-white shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
           >
             Transactions
           </button>
        </div>

        {activeTab === 'overview' && (
          <div className="animate-in fade-in duration-500">
            {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl mb-6 flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            <p className="font-medium text-sm">{successMsg}</p>
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                 My Listings
              </p>
              <p className="text-4xl font-black text-gray-800 tracking-tighter">{properties.length}</p>
              <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest mt-2">{properties.filter(p => p.status === 'approved').length} Active Assets</p>
           </div>
           
           <button 
             onClick={() => setActiveTab('transactions')}
             className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 transition-all hover:shadow-md text-left group"
           >
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-[#00579e]"></span>
                 Total Transactions
              </p>
              <div className="flex items-end justify-between">
                 <p className="text-4xl font-black text-gray-800 tracking-tighter">{transactions.length}</p>
                 <span className="text-[10px] font-black text-[#00579e] uppercase tracking-widest group-hover:translate-x-1 transition-transform">Audit →</span>
              </div>
           </button>

           <div className="bg-[#112743] p-6 rounded-3xl shadow-2xl shadow-blue-900/20 text-white relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                 <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
              </div>
              <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-3 relative z-10">Verification Status</p>
              <p className="text-xl font-black text-white tracking-tight relative z-10">{profile?.is_verified_seller ? 'Verified Partner' : 'Identity Unverified'}</p>
              <Link href="/user/apply-agent" className="text-[9px] font-black text-blue-200 hover:text-white uppercase tracking-[0.2em] mt-3 block relative z-10">Request Badge →</Link>
           </div>
        </div>

        {/* My Properties section */}
        <div className="flex justify-between items-end mb-6">
           <h2 className="text-xl font-bold text-gray-800 uppercase tracking-tight">System Managed Assets</h2>
        </div>

        {properties.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center mb-10">
            <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            <h3 className="text-xl font-bold text-gray-600 mb-2">No Property Listed Yet</h3>
            <p className="text-gray-400 mb-6 text-sm">As a seller, you can submit your properties for admin review.</p>
            <Link href="/submit-property" className="bg-[#00b48f] hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md">
              Submit My First Property
            </Link>
          </div>
        ) : (
          <div className="space-y-6 mb-12">
            {properties.map((prop: any) => {
               const mainImg = prop?.media?.[0]?.url || 'https://placehold.co/600x400/eeeeee/999999?text=No+Image';
               const formattedP = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumSignificantDigits: 3 }).format(prop.price);
               
               return (
                <div key={prop.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row">
                    <div className="relative w-full md:w-64 h-48 md:h-auto shrink-0">
                      <img src={mainImg} alt={prop.property_type} className="w-full h-full object-cover" />
                      <span className="absolute top-3 left-3 bg-teal-500 text-white text-[9px] font-black px-2 py-1 rounded uppercase tracking-[0.2em] shadow-lg">
                        BHAVYAM ASSET
                      </span>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-black text-gray-800 tracking-tight group-hover:text-teal-600 transition-colors uppercase">
                               {prop.property_type} <span className="text-gray-300 font-normal lowercase italic text-sm">in {prop.city}</span>
                            </h3>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">{prop.area}</p>
                          </div>
                          <span className="text-2xl font-black text-[#00579e] tracking-tighter">{formattedP}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-4">
                          <span className="text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest bg-blue-50 text-blue-700">{prop.listing_type}</span>
                          {prop.status === 'pending' && <span className="text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest bg-yellow-50 text-yellow-700">Pending Review</span>}
                          {prop.status === 'approved' && <span className="text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest bg-teal-50 text-teal-700">Live & Public</span>}
                          {prop.status === 'rejected' && <span className="text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest bg-red-50 text-red-700">Action Required</span>}
                          
                          <div className="flex items-center gap-1.5 bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-[11px] font-black shadow-sm ring-1 ring-rose-100">
                            <span>❤️</span>
                            <span>{prop.favorites?.[0]?.count || 0} Impressions</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-8 flex-wrap">
                        {(['edit', 'update_documents', 'delete'] as const).map(type => (
                          <button
                            key={type}
                            onClick={() => { 
                               setSelectedProperty(prop); 
                               setRequestType(type); 
                               setShowRequestForm(true); 
                            }}
                            className={`text-[10px] font-black uppercase tracking-[0.15em] py-2.5 px-5 rounded-xl border transition-all ${
                              type === 'delete'
                                ? 'bg-red-50 text-red-500 border-red-100 hover:bg-red-600 hover:text-white shadow-sm hover:shadow-red-200'
                                : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-white hover:text-gray-900 hover:border-gray-300'
                            }`}
                          >
                            Request {type.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
               );
            })}
          </div>
        )}

        {/* Request form */}
        {showRequestForm && selectedProperty && (
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
        )}

        {activeTab === 'transactions' && (
           <div className="animate-in fade-in duration-500">
              <div className="mb-8">
                 <h3 className="text-2xl font-black text-gray-800 tracking-tight">Financial Audit</h3>
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Transaction history and subscription records</p>
              </div>

              <div className="grid gap-4">
                 {transactions.length > 0 ? (
                   transactions.map((tx) => (
                     <div key={tx.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 flex flex-col md:flex-row gap-6 items-center hover:shadow-md transition-all">
                       <div className={`p-4 rounded-2xl ${tx.status === 'completed' ? 'bg-teal-50 text-teal-600' : 'bg-red-50 text-red-600'}`}>
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                       </div>

                       <div className="flex-1 text-center md:text-left">
                          <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start mb-0.5">
                             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00b48f]">
                                {tx.payment_type?.replace('_', ' ')}
                             </span>
                             <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${tx.status === 'completed' ? 'bg-teal-100 text-teal-800' : 'bg-red-100 text-red-600'}`}>
                                {tx.status}
                             </span>
                          </div>
                          <h3 className="text-lg font-black text-gray-800">
                             {tx.property ? `Unlock: ${tx.property.property_type}` : 'Membership Extension'}
                          </h3>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                             {new Date(tx.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                       </div>

                       <div className="text-center md:text-right">
                          <p className="text-3xl font-black text-gray-900 tracking-tighter">₹{tx.amount}</p>
                          <p className="text-[10px] text-gray-400 font-mono tracking-tighter mt-1 truncate max-w-[150px]">ID: {tx.razorpay_payment_id || tx.id.substring(0,8)}</p>
                       </div>
                     </div>
                   ))
                 ) : (
                   <div className="bg-white rounded-[3rem] border border-dashed border-gray-200 p-20 text-center">
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-4">You have no recorded transactions.</p>
                      <Link href="/membership" className="inline-block bg-[#112743] hover:bg-black text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all">
                         Upgrade Business Plan
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
