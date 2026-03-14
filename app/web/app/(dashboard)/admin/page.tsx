'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Section = 'overview' | 'properties' | 'users' | 'payments' | 'interests' | 'reviews' | 'requests';

export default function AdminDashboardPage() {
  const [section, setSection] = useState<Section>('overview');
  const [stats, setStats] = useState({ listings: 0, users: 0, revenue: 0, pending: 0 });
  const [properties, setProperties] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [sellerRequests, setSellerRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const user = await getCurrentUser();
      if (!user || user.profile?.role !== 'admin') { router.push('/dashboard'); return; }

      // Parallel fetch everything needed
      const [
        { data: props },
        { data: allUsers },
        { data: pays },
        { data: ints },
        { data: revs },
        { data: reqs }
      ] = await Promise.all([
        supabase.from('properties').select('id, property_type, city, listing_type, status, price, created_at, owner:profiles(first_name, last_name)').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, first_name, last_name, email, phone_number, role, created_at').order('created_at', { ascending: false }),
        supabase.from('payments').select('id, amount, currency, status, created_at, user:profiles(first_name, last_name, email), property:properties(property_type, city)').order('created_at', { ascending: false }),
        supabase.from('interest_requests').select('id, message, status, created_at, user:profiles(first_name, last_name, email, phone_number), property:properties(property_type, city, owner:profiles!properties_owner_id_fkey(first_name, last_name, phone_number))').order('created_at', { ascending: false }),
        supabase.from('reviews').select('id, rating, comment, status, created_at, user:profiles(first_name, last_name), property:properties(property_type, city)').order('created_at', { ascending: false }),
        supabase.from('requests').select('id, request_type, message, status, created_at, user:profiles(first_name, last_name, email), property:properties(property_type, city)').order('created_at', { ascending: false })
      ]);

      const propList = props || [];
      const payList = pays || [];

      setProperties(propList);
      setUsers(allUsers || []);
      setPayments(payList);
      setInterests(ints || []);
      setReviews(revs || []);
      setSellerRequests(reqs || []);

      const revenue = payList.filter(p => p.status === 'completed').reduce((acc, p) => acc + (p.amount || 0), 0);
      setStats({
        listings: propList.length,
        users: (allUsers || []).length,
        revenue,
        pending: propList.filter(p => p.status === 'pending').length
      });

      setIsLoading(false);
    };
    init();
  }, [router]);

  const updatePropertyStatus = async (id: string, status: string) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    await supabase.from('properties').update({ status }).eq('id', id);
  };

  const updateReviewStatus = async (id: string, status: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    await supabase.from('reviews').update({ status }).eq('id', id);
  };

  const updateRequestStatus = async (id: string, status: string) => {
    setSellerRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    await supabase.from('requests').update({ status }).eq('id', id);
  };

  const suspendUser = async (id: string) => {
    if (!confirm('Suspend this user?')) return;
    const { error } = await supabase.from('profiles').update({ role: 'buyer' } as any).eq('id', id);
    if (!error) setUsers(prev => prev.map(u => u.id === id ? { ...u, role: 'buyer' } : u));
  };

  const navItems: { key: Section; label: string; icon: string }[] = [
    { key: 'overview', label: 'Analytics', icon: '📊' },
    { key: 'properties', label: 'Properties', icon: '🏠' },
    { key: 'users', label: 'Users', icon: '👥' },
    { key: 'payments', label: 'Payments', icon: '💳' },
    { key: 'interests', label: 'Interest Tickets', icon: '📋' },
    { key: 'reviews', label: 'Reviews', icon: '⭐' },
    { key: 'requests', label: 'Seller Requests', icon: '📝' },
  ];

  if (isLoading) {
    return <div className="p-24 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div></div>;
  }

  return (
    <div className="flex min-h-screen bg-[#fbfcfa]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 shadow-sm shrink-0 hidden md:flex flex-col py-8 px-4 gap-2">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 px-3 mb-4">Admin Panel</h2>
        {navItems.map(item => (
          <button
            key={item.key}
            onClick={() => setSection(item.key)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left w-full ${
              section === item.key 
                ? 'bg-[#00579e] text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </aside>

      {/* Main content */}
      <main className="flex-1 py-8 px-4 sm:px-8 overflow-x-hidden">
        {/* Mobile nav */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 md:hidden">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setSection(item.key)}
              className={`shrink-0 text-xs font-bold px-4 py-2 rounded-full ${section === item.key ? 'bg-[#00579e] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        {/* ─── ANALYTICS ─── */}
        {section === 'overview' && (
          <div>
            <h1 className="text-3xl font-extrabold text-[#00579e] mb-6">Analytics Overview</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Total Listings', value: stats.listings, color: 'blue', icon: '🏠' },
                { label: 'Pending Review', value: stats.pending, color: 'yellow', icon: '⏳' },
                { label: 'Active Users', value: stats.users, color: 'teal', icon: '👥' },
                { label: 'Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, color: 'green', icon: '💰' },
              ].map(card => (
                <div key={card.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="text-3xl mb-2">{card.icon}</div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{card.label}</p>
                  <p className="text-3xl font-black text-gray-800">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Properties Approved', value: properties.filter(p => p.status === 'approved').length, sub: 'of ' + stats.listings + ' total' },
                { label: 'Pending Interests', value: interests.filter(i => i.status === 'pending').length, sub: 'buyer leads awaiting' },
                { label: 'Pending Reviews', value: reviews.filter(r => r.status === 'pending').length, sub: 'awaiting moderation' },
                { label: 'Seller Requests', value: sellerRequests.filter(r => r.status === 'pending').length, sub: 'edit / delete / docs' },
                { label: 'Completed Payments', value: payments.filter(p => p.status === 'completed').length, sub: 'unlocked details' },
                { label: 'Agents Active', value: users.filter(u => u.role === 'agent').length, sub: 'of ' + stats.users + ' users' },
              ].map(item => (
                <div key={item.label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                  <p className="text-2xl font-black text-gray-800">{item.value}</p>
                  <p className="text-sm font-bold text-gray-600 mt-1">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-1">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── PROPERTIES ─── */}
        {section === 'properties' && (
          <div>
            <h1 className="text-3xl font-extrabold text-[#00579e] mb-6">Property Moderation</h1>
            <div className="flex flex-col gap-4">
              {properties.map(p => (
                <div key={p.id} className={`bg-white rounded-xl border shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 ${p.status === 'pending' ? 'border-l-yellow-400' : p.status === 'approved' ? 'border-l-teal-400' : 'border-l-red-400'}`}>
                  <div>
                    <h3 className="font-bold text-gray-800">{p.property_type} in {p.city}</h3>
                    <p className="text-xs text-gray-500 mt-1">Owner: {p.owner?.first_name} {p.owner?.last_name} · {p.listing_type} · {new Date(p.created_at).toLocaleDateString()}</p>
                    <span className={`mt-2 inline-block text-xs font-bold px-2 py-1 rounded uppercase ${p.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : p.status === 'approved' ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-600'}`}>{p.status}</span>
                  </div>
                  <div className="flex gap-2">
                    {p.status !== 'approved' && (
                      <button onClick={() => updatePropertyStatus(p.id, 'approved')} className="bg-[#00b48f] hover:bg-teal-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">Approve</button>
                    )}
                    {p.status !== 'rejected' && (
                      <button onClick={() => updatePropertyStatus(p.id, 'rejected')} className="bg-red-50 text-red-500 border border-red-200 hover:bg-red-500 hover:text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">Reject</button>
                    )}
                    {p.status !== 'pending' && (
                      <button onClick={() => updatePropertyStatus(p.id, 'pending')} className="bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 text-xs font-bold px-4 py-2 rounded-lg transition-colors">Reset</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── USERS ─── */}
        {section === 'users' && (
          <div>
            <h1 className="text-3xl font-extrabold text-[#00579e] mb-6">User Management</h1>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Name', 'Email', 'Phone', 'Role', 'Joined', 'Action'].map(h => (
                        <th key={h} className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-semibold text-gray-800">{u.first_name} {u.last_name}</td>
                        <td className="p-4 text-sm text-gray-500">{u.email}</td>
                        <td className="p-4 text-sm text-gray-500">{u.phone_number || '—'}</td>
                        <td className="p-4">
                          <span className={`text-xs font-bold uppercase px-2 py-1 rounded tracking-wider ${u.role === 'admin' ? 'bg-purple-50 text-purple-700' : u.role === 'agent' ? 'bg-blue-50 text-blue-700' : u.role === 'seller' ? 'bg-orange-50 text-orange-700' : 'bg-gray-50 text-gray-600'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-500 whitespace-nowrap">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="p-4">
                          {u.role !== 'admin' && (
                            <button onClick={() => suspendUser(u.id)} className="text-xs font-bold text-red-500 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                              Suspend
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── PAYMENTS ─── */}
        {section === 'payments' && (
          <div>
            <h1 className="text-3xl font-extrabold text-[#00579e] mb-6">Payment Transactions</h1>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['User', 'Property', 'Amount', 'Status', 'Date'].map(h => (
                        <th key={h} className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {payments.map(pay => (
                      <tr key={pay.id} className="hover:bg-gray-50">
                        <td className="p-4"><p className="font-semibold text-gray-800">{pay.user?.first_name} {pay.user?.last_name}</p><p className="text-xs text-gray-400">{pay.user?.email}</p></td>
                        <td className="p-4 text-sm text-gray-600">{pay.property?.property_type} in {pay.property?.city}</td>
                        <td className="p-4 font-bold text-gray-800">{pay.currency} {pay.amount}</td>
                        <td className="p-4">
                          <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${pay.status === 'completed' ? 'bg-teal-50 text-teal-700' : 'bg-yellow-50 text-yellow-700'}`}>{pay.status}</span>
                        </td>
                        <td className="p-4 text-sm text-gray-500 whitespace-nowrap">{new Date(pay.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {payments.length === 0 && (
                      <tr><td colSpan={5} className="p-8 text-center text-gray-400">No transactions yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── INTEREST TICKETS ─── */}
        {section === 'interests' && (
          <div>
            <h1 className="text-3xl font-extrabold text-[#00579e] mb-6">Buyer Interest Tickets</h1>
            <div className="flex flex-col gap-4">
              {interests.map(req => (
                <div key={req.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{req.user?.first_name} {req.user?.last_name}</p>
                    <p className="text-xs text-gray-500">📞 {req.user?.phone_number} · ✉️ {req.user?.email}</p>
                    <p className="text-sm text-gray-600 mt-2 italic border-l-2 border-teal-300 pl-3">"{req.message}"</p>
                  </div>
                  <div className="text-sm flex flex-col gap-1 text-gray-600">
                    <p className="font-semibold">{req.property?.property_type} in {req.property?.city}</p>
                    <p className="text-xs text-gray-400">Owner: {req.property?.owner?.first_name} {req.property?.owner?.last_name}</p>
                    <p className="text-xs text-gray-400">📞 {req.property?.owner?.phone_number || 'N/A'}</p>
                    <p className="text-xs text-gray-400 mt-2">{new Date(req.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {interests.length === 0 && <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center text-gray-400">No interest tickets yet.</div>}
            </div>
          </div>
        )}

        {/* ─── REVIEWS ─── */}
        {section === 'reviews' && (
          <div>
            <h1 className="text-3xl font-extrabold text-[#00579e] mb-6">Review Moderation</h1>
            <div className="flex flex-col gap-4">
              {reviews.map(rev => (
                <div key={rev.id} className={`bg-white rounded-xl border shadow-sm p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-l-4 ${rev.status === 'pending' ? 'border-l-yellow-400' : rev.status === 'approved' ? 'border-l-teal-400' : 'border-l-red-400'}`}>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-gray-800">{rev.user?.first_name} {rev.user?.last_name}</p>
                      <span className="text-xs text-gray-400">{new Date(rev.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{rev.property?.property_type} in {rev.property?.city}</p>
                    <div className="flex text-yellow-400 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} className={`w-4 h-4 ${i < rev.rating ? 'fill-current' : 'text-gray-200 fill-current'}`} viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 italic">"{rev.comment}"</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {rev.status !== 'approved' && <button onClick={() => updateReviewStatus(rev.id, 'approved')} className="bg-[#00b48f] text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-teal-600 transition-colors">Approve</button>}
                    {rev.status !== 'rejected' && <button onClick={() => updateReviewStatus(rev.id, 'rejected')} className="bg-red-50 text-red-500 border border-red-200 text-xs font-bold px-3 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors">Reject</button>}
                  </div>
                </div>
              ))}
              {reviews.length === 0 && <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center text-gray-400">No reviews yet.</div>}
            </div>
          </div>
        )}

        {/* ─── SELLER REQUESTS ─── */}
        {section === 'requests' && (
          <div>
            <h1 className="text-3xl font-extrabold text-[#00579e] mb-6">Seller Requests</h1>
            <div className="flex flex-col gap-4">
              {sellerRequests.map(req => (
                <div key={req.id} className={`bg-white rounded-xl border shadow-sm p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-l-4 ${req.status === 'pending' ? 'border-l-yellow-400' : req.status === 'approved' ? 'border-l-teal-400' : 'border-l-red-400'}`}>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{req.user?.first_name} {req.user?.last_name} <span className="text-gray-400 font-normal">— {req.user?.email}</span></p>
                    <p className="text-xs text-gray-500 mb-1">Property: {req.property?.property_type} in {req.property?.city}</p>
                    <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded uppercase tracking-wider">{req.request_type.replace('_', ' ')}</span>
                    <p className="text-sm text-gray-600 mt-2 italic">"{req.message}"</p>
                    <p className="text-xs text-gray-400 mt-2">{new Date(req.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {req.status === 'pending' && (
                      <>
                        <button onClick={() => updateRequestStatus(req.id, 'approved')} className="bg-[#00b48f] text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-teal-600 transition-colors">Approve</button>
                        <button onClick={() => updateRequestStatus(req.id, 'rejected')} className="bg-red-50 text-red-500 border border-red-200 text-xs font-bold px-3 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors">Reject</button>
                      </>
                    )}
                    {req.status !== 'pending' && (
                      <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${req.status === 'approved' ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-600'}`}>{req.status}</span>
                    )}
                  </div>
                </div>
              ))}
              {sellerRequests.length === 0 && <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center text-gray-400">No seller requests yet.</div>}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
