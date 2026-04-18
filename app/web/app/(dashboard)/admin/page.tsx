'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import PremiumLoader from '@/components/ui/PremiumLoader';

type Section = 'overview' | 'properties' | 'users' | 'transactions' | 'interests' | 'reviews' | 'agents' | 'plans';

export default function AdminDashboardPage() {
  const [section, setSection] = useState<Section>('overview');
  const [stats, setStats] = useState({ listings: 0, users: 0, revenue: 0, pending: 0, pendingAgents: 0 });
  const [properties, setProperties] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [agentApps, setAgentApps] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [selectedLead, setSelectedLead] = useState<any>(null);

  // Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All'); 
  const [sortBy, setSortBy] = useState('Time'); 
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  const router = useRouter();

  const filteredAndSortedProperties = properties
     .filter(p => filterType === 'All' || p.listing_type?.toLowerCase() === filterType.toLowerCase())
     .filter(p => {
        if (!searchQuery) return true;
        const s = searchQuery.toLowerCase();
        return p.property_type?.toLowerCase().includes(s) || p.city?.toLowerCase().includes(s);
     })
     .sort((a, b) => {
        if (sortBy === 'PriceDesc') {
           return (b.price || 0) - (a.price || 0);
        }
        if (sortBy === 'PriceAsc') {
           return (a.price || 0) - (b.price || 0);
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
     });

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
        { data: apps },
        { data: allPlans }
      ] = await Promise.all([
        supabase.from('properties').select('id, property_type, city, listing_type, status, price, created_at, admin_feedback, owner:profiles(first_name, last_name, role, agent_code), media:property_media(url, media_type)').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, first_name, last_name, email, phone_number, role, created_at').order('created_at', { ascending: false }),
        supabase.from('transactions').select('*, user:profiles(first_name, last_name, email), property:properties(id, property_type, city)').order('created_at', { ascending: false }),
        supabase.from('interest_requests').select('id, message, status, created_at, user:profiles(first_name, last_name, email, phone_number), property:properties(id, property_type, city, owner:profiles!properties_owner_id_fkey(first_name, last_name, phone_number, email))').order('created_at', { ascending: false }),
        supabase.from('reviews').select('id, rating, comment, status, created_at, user:profiles(first_name, last_name), property:properties(property_type, city)').order('created_at', { ascending: false }),
        supabase.from('agent_applications').select('id, status, notes, created_at, user:profiles(id, first_name, last_name, email, phone_number, role)').order('created_at', { ascending: false }),
        supabase.from('plans').select('*').order('type', { ascending: true })
      ]);

      const propList = props || [];
      const payList = pays || [];

      setProperties(propList);
      setUsers(allUsers || []);
      setTransactions(pays || []);
      setInterests(ints || []);
      setReviews(revs || []);
      setAgentApps(apps || []);
      setPlans(allPlans || []);

      const revenue = (pays || []).filter((p: any) => p.status === 'completed').reduce((acc: number, p: any) => acc + (p.amount || 0), 0);
      setStats({
        listings: propList.length,
        users: (allUsers || []).length,
        revenue,
        pending: propList.filter((p: any) => p.status === 'pending').length,
        pendingAgents: (apps || []).filter((a: any) => a.status === 'pending').length
      });

      setIsLoading(false);
    };
    init();
  }, [router]);

  const updatePropertyStatus = async (id: string, status: string, note?: string) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, status, admin_feedback: note } : p));
    await supabase.from('properties').update({ status, admin_feedback: note } as any).eq('id', id);
    setRejectingId(null);
    setFeedback('');
  };

  const updateReviewStatus = async (id: string, status: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    await supabase.from('reviews').update({ status }).eq('id', id);
  };

  const suspendUser = async (id: string) => {
    if (!confirm('Suspend this user?')) return;
    const { error } = await supabase.from('profiles').update({ role: 'buyer' } as any).eq('id', id);
    if (!error) setUsers(prev => prev.map(u => u.id === id ? { ...u, role: 'buyer' } : u));
  };

  const updateUserRole = async (id: string, newRole: string) => {
    if (newRole === 'admin' && !confirm('Promote this user to ADMIN? This will give them full control.')) return;
    const { error } = await supabase.from('profiles').update({ role: newRole } as any).eq('id', id);
    if (!error) {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
    } else {
      toast.error("Failed to update user role: " + error.message);
    }
  };

  const updateInterestStatus = async (id: string, status: string) => {
    setInterests(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    await supabase.from('interest_requests').update({ status }).eq('id', id);
  };

  const handleApproveAgent = async (appId: string, userName: string) => {
    const uniqueHash = Math.random().toString(36).substring(2, 6).toUpperCase();
    const cleanName = userName.substring(0, 3).toUpperCase();
    const newCode = `BHA-AGT-${cleanName}-${uniqueHash}`;

    const { error } = await supabase.rpc('approve_agent_application', {
       app_id: appId,
       generated_code: newCode
    });

    if (error) {
       toast.error("Failed to approve agent: " + error.message);
    } else {
       setAgentApps(prev => prev.map(a => a.id === appId ? { ...a, status: 'approved' } : a));
    }
  };

  const handleRejectAgent = async (appId: string) => {
    const { error } = await supabase.rpc('reject_agent_application', {
       app_id: appId
    });

    if (error) {
       toast.error("Failed to reject agent: " + error.message);
    } else {
       setAgentApps(prev => prev.map(a => a.id === appId ? { ...a, status: 'rejected' } : a));
    }
  };

  const updatePlan = async (id: string, updates: any) => {
    const { error } = await supabase.from('plans').update(updates).eq('id', id);
    if (error) {
      toast.error("Failed to update plan: " + error.message);
    } else {
      setPlans(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      toast.success("Plan updated successfully");
    }
  };

  const navItems: { key: Section; label: string; icon: string }[] = [
    { key: 'overview', label: 'Analytics', icon: '📊' },
    { key: 'properties', label: 'All Properties', icon: '🏠' },
    { key: 'users', label: 'Users', icon: '👥' },
    { key: 'agents', label: 'Agent Applications', icon: '🎖️' },
    { key: 'interests', label: 'Interests', icon: '📋' },
    { key: 'transactions', label: 'Transactions', icon: '💸' },
    { key: 'plans', label: 'Plan Settings', icon: '⚙️' },
    { key: 'reviews', label: 'Reviews', icon: '⭐' },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#fbfcfa] animate-pulse">
        <aside className="w-64 bg-white border-r border-gray-100 hidden md:block h-screen p-6 space-y-4">
           <div className="w-32 h-4 bg-gray-200 rounded" />
           {[1,2,3,4,5,6].map(i => <div key={i} className="w-full h-12 bg-gray-100 rounded-xl" />)}
        </aside>
        <main className="flex-1 p-8 space-y-8">
           <div className="w-64 h-10 bg-gray-200 rounded-xl" />
           <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[1,2,3,4,5].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl" />)}
           </div>
           <div className="grid grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-xl" />)}
           </div>
           <div className="w-full h-96 bg-gray-200 rounded-3xl" />
        </main>
      </div>
    );
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
            } cursor-pointer`}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </aside>

      {/* Main content */}
      <main className="flex-1 py-8 px-4 sm:px-8 overflow-x-hidden">
        {/* Top Actions */}
        <div className="flex justify-end mb-6">
          <Link href="/agent" className="bg-[#112743] hover:bg-[#1a3a61] text-white text-xs font-black uppercase tracking-widest px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 active:scale-95">
            <span>🎖️</span> Your Agent View
          </Link>
        </div>
        {/* Mobile nav */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 md:hidden">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setSection(item.key)}
              className={`shrink-0 text-xs font-bold px-4 py-2 rounded-full cursor-pointer ${section === item.key ? 'bg-[#00579e] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        {/* ─── ANALYTICS ─── */}
        {section === 'overview' && (
          <div>
            <h1 className="text-3xl font-extrabold text-[#00579e] mb-6">Analytics Overview</h1>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {[
                { label: 'Total Listings', value: stats.listings, color: 'blue', icon: '🏠' },
                { label: 'Pending Review', value: stats.pending, color: 'yellow', icon: '⏳' },
                { label: 'Active Users', value: stats.users, color: 'teal', icon: '👥' },
                { label: 'Pending Agents', value: stats.pendingAgents, color: 'purple', icon: '🎖️' },
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
                { label: 'Completed Transactions', value: transactions.filter(p => p.status === 'completed').length, sub: 'revenue generating' },
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
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <h1 className="text-3xl font-extrabold text-[#00579e]">
                {showPendingOnly ? 'Pending Property Requests' : 'All Properties'}
              </h1>
              <button
                onClick={() => setShowPendingOnly(!showPendingOnly)}
                className={`text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-sm transition-all focus:outline-none ${showPendingOnly ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border border-yellow-200'}`}
              >
                {showPendingOnly ? 'Show All Properties' : `Pending Property Requests (${stats.pending})`}
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6 md:items-center">
               <input 
                  type="text" 
                  placeholder="Search city, property type..." 
                  className="bg-white border text-sm text-gray-800 border-gray-200 outline-none px-4 py-2 rounded-lg flex-1 shadow-sm focus:border-teal-500 placeholder-gray-400 cursor-pointer"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
               />
               <select 
                  className="bg-white border text-sm text-gray-800 border-gray-200 outline-none px-4 py-2 rounded-lg shadow-sm focus:border-teal-500 cursor-pointer"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
               >
                  <option value="All">All Types</option>
                  <option value="Rent">Rent</option>
                  <option value="Sell">Sell</option>
               </select>
               <select 
                  className="bg-white border text-sm text-gray-800 border-gray-200 outline-none px-4 py-2 rounded-lg shadow-sm focus:border-teal-500 cursor-pointer"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
               >
                  <option value="Time">Sort by: Time (Newest)</option>
                  <option value="PriceDesc">Sort by: Price (High to Low)</option>
                  <option value="PriceAsc">Sort by: Price (Low to High)</option>
               </select>
            </div>

            <div className="flex flex-col gap-4">
              {filteredAndSortedProperties
                .filter(p => showPendingOnly ? p.status === 'pending' : p.status === 'approved')
                .map(p => (
                <div key={p.id} className={`bg-white rounded-xl border shadow-sm p-6 flex flex-col gap-4 border-l-4 ${p.status === 'pending' ? 'border-l-yellow-400' : p.status === 'approved' ? 'border-l-teal-400' : 'border-l-red-400'}`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <Link href={`/properties/${p.id}`} className="font-bold text-gray-800 text-lg hover:underline hover:text-teal-600 block transition-colors cursor-pointer">
                        {p.property_type} in {p.city}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-wider">
                        Owner: {p.owner?.first_name} {p.owner?.last_name} 
                        {p.owner?.role === 'agent' && (
                          <span className="ml-2 bg-blue-50 text-[#00579e] px-2 py-0.5 rounded text-[9px] font-black border border-blue-100">
                             ID: {p.owner?.agent_code || 'N/A'}
                          </span>
                        )}
                        <span className="mx-2">·</span> {p.listing_type} <span className="mx-2">·</span> ₹{p.price?.toLocaleString('en-IN')} <span className="mx-2">·</span> {new Date(p.created_at).toLocaleDateString()}
                      </p>
                      <span className={`mt-2 inline-block text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter ${p.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : p.status === 'approved' ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-600'}`}>{p.status}</span>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <div className="flex gap-2">
                        {p.status !== 'approved' && (
                          <button onClick={() => updatePropertyStatus(p.id, 'approved')} className="bg-[#00b48f] hover:bg-teal-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer">Approve</button>
                        )}
                        {p.status !== 'rejected' && (
                          <button 
                            onClick={() => {
                              if (rejectingId === p.id) {
                                if (!feedback) return toast.error('Please enter a reason for rejection');
                                updatePropertyStatus(p.id, 'rejected', feedback);
                              } else {
                                setRejectingId(p.id);
                              }
                            }} 
                            className="bg-red-50 text-red-500 border border-red-200 hover:bg-red-500 hover:text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
                          >
                            {rejectingId === p.id ? 'Confirm Reject' : 'Reject'}
                          </button>
                        )}
                        {p.status !== 'pending' && (
                          <button onClick={() => updatePropertyStatus(p.id, 'pending')} className="bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer">Reset</button>
                        )}
                      </div>
                      
                      {rejectingId === p.id && (
                        <div className="w-full max-w-xs animate-in slide-in-from-top-2 duration-300">
                           <textarea 
                             autoFocus
                             placeholder="Provide improvement notes for the agent..."
                             className="w-full bg-red-50/50 border border-red-100 p-2 rounded-lg text-xs outline-none focus:border-red-300 placeholder-red-300 text-red-900 font-medium"
                             value={feedback}
                             onChange={(e) => setFeedback(e.target.value)}
                           />
                           <button onClick={() => setRejectingId(null)} className="text-[10px] font-black text-gray-500 mt-1 uppercase tracking-widest hover:text-red-600 transition-colors cursor-pointer">Cancel Rejection</button>
                        </div>
                      )}
                    </div>
                  </div>

                  {p.admin_feedback && (
                    <div className="bg-yellow-50/50 border border-yellow-100 p-3 rounded-lg">
                      <p className="text-[10px] font-black text-yellow-600 uppercase mb-1">Previous Rejection Note</p>
                      <p className="text-sm text-yellow-800 italic">"{p.admin_feedback}"</p>
                    </div>
                  )}

                  {/* Media Preview */}
                  {p.media && p.media.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {p.media.slice(0, 8).map((m: any, idx: number) => (
                        <a key={idx} href={m.url} target="_blank" rel="noreferrer" className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:ring-2 hover:ring-teal-500 transition-all cursor-pointer">
                          {m.media_type === 'image' || m.url.match(/\.(jpg|jpeg|png)$/i) ? (
                            <img src={m.url} className="w-full h-full object-cover" alt="Property asset" />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">DOC</div>
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {filteredAndSortedProperties.length === 0 && (
                <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
                  No properties found for the selected filters.
                </div>
              )}
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
                          <select 
                            value={u.role} 
                            onChange={(e) => updateUserRole(u.id, e.target.value)}
                            disabled={u.role === 'admin' && users.filter(usr => usr.role === 'admin').length <= 1} // Prevent removing the last admin
                            className={`text-xs font-bold uppercase px-2 py-1 rounded tracking-wider border-none outline-none cursor-pointer ${
                              u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                              u.role === 'agent' ? 'bg-blue-100 text-blue-700' : 
                              u.role === 'seller' ? 'bg-orange-100 text-orange-700' : 
                              'bg-gray-100 text-gray-700'
                            }`}
                          >
                            <option value="admin">Admin</option>
                            <option value="agent">Agent</option>
                            <option value="seller">Seller</option>
                            <option value="buyer">Buyer</option>
                          </select>
                        </td>
                        <td className="p-4 text-sm text-gray-500 whitespace-nowrap">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="p-4">
                          {u.role !== 'admin' && u.role !== 'buyer' && (
                            <button onClick={() => suspendUser(u.id)} className="text-xs font-bold text-red-500 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-500 hover:text-white transition-colors cursor-pointer">
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

        {/* ─── TRANSACTIONS ─── */}
        {section === 'transactions' && (
          <div>
            <h1 className="text-3xl font-extrabold text-[#00579e] mb-6">Global Audit Logs</h1>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['User', 'Type', 'Property', 'Amount', 'Status', 'Date'].map(h => (
                        <th key={h} className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <Link href={`/admin/users/${tx.user?.id}`} className="font-bold text-[#00579e] hover:underline block">
                            {tx.user?.first_name} {tx.user?.last_name}
                          </Link>
                          <p className="text-[10px] text-gray-400 font-bold">{tx.user?.email}</p>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${tx.payment_type === 'subscription' ? 'bg-blue-50 text-blue-600' : 'bg-teal-50 text-teal-600'}`}>
                            {tx.payment_type}
                          </span>
                        </td>
                        <td className="p-4">
                          {tx.property ? (
                            <Link href={`/properties/${tx.property.id}`} className="text-sm text-blue-600 hover:underline font-bold">
                              {tx.property.property_type} in {tx.property.city}
                            </Link>
                          ) : (
                            <span className="text-sm text-gray-400 uppercase tracking-tighter font-bold font-mono">Platform Plan</span>
                          )}
                        </td>
                        <td className="p-4 font-bold text-gray-800">₹{tx.amount}</td>
                        <td className="p-4">
                          <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${tx.status === 'completed' ? 'bg-teal-50 text-teal-700' : 'bg-yellow-50 text-yellow-700'}`}>{tx.status}</span>
                        </td>
                        <td className="p-4 text-sm text-gray-500 whitespace-nowrap">{new Date(tx.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr><td colSpan={6} className="p-8 text-center text-gray-400">No transactions yet.</td></tr>
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
            <h1 className="text-3xl font-extrabold text-[#00579e] mb-6">Buyer Leads</h1>
            <div className="flex flex-col gap-4">
              {interests.map(req => (
                <div 
                   key={req.id} 
                   onClick={() => setSelectedLead(req)}
                   className={`bg-white rounded-xl border shadow-sm p-5 flex flex-col md:flex-row gap-6 border-l-4 cursor-pointer hover:shadow-md hover:translate-x-1 transition-all ${req.status === 'contacted' ? 'border-l-teal-400' : 'border-l-yellow-400'}`}
                >
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-lg">{req.user?.first_name} {req.user?.last_name}</p>
                    <p className="text-xs text-gray-500 font-bold mb-3 uppercase tracking-tighter">📞 {req.user?.phone_number} · ✉️ {req.user?.email}</p>
                    <div className="text-sm text-gray-700 italic border-l-2 border-teal-300 pl-3 leading-relaxed line-clamp-2">
                      "{req.message}"
                    </div>
                  </div>
                  <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Target Property</p>
                      <p className="font-bold text-gray-800 leading-tight">{req.property?.property_type}</p>
                      <p className="text-xs text-gray-500 mb-4">{req.property?.city}</p>
                    </div>

                    <div className="mt-2">
                       {req.status === 'pending' ? (
                         <span className="text-xs font-black uppercase text-yellow-600 bg-yellow-50 px-3 py-1 rounded">Pending Contact</span>
                       ) : (
                         <span className="text-xs font-black uppercase text-teal-600 bg-teal-50 px-3 py-1 rounded">Contacted</span>
                       )}
                    </div>
                  </div>
                </div>
              ))}
              {interests.length === 0 && <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center text-gray-400 shadow-sm">No buyer interest leads currently in the system.</div>}
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
              {reviews.length === 0 && <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center text-gray-400 font-bold">No reviews yet.</div>}
            </div>
          </div>
        )}

        {/* ─── AGENTS APPS ─── */}
        {section === 'agents' && (
          <div>
            <h1 className="text-3xl font-extrabold text-[#00579e] mb-6">Agent Applications</h1>
            <div className="flex flex-col gap-4">
              {agentApps.map(app => (
                <div key={app.id} className={`bg-white rounded-xl border shadow-sm p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 border-l-4 ${app.status === 'pending' ? 'border-l-yellow-400' : app.status === 'approved' ? 'border-l-teal-400' : 'border-l-red-400'}`}>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-lg">{app.user?.first_name} {app.user?.last_name}</p>
                    <p className="text-xs text-gray-500 mb-2">📞 {app.user?.phone_number} | ✉️ {app.user?.email}</p>
                    <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-100 mb-3">
                       <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 leading-none">Qualification Note</p>
                       <p className="text-sm text-gray-700 italic leading-snug">"{app.notes}"</p>
                    </div>
                    <div className="flex gap-2 items-center">
                       <span className="text-[10px] font-bold text-gray-400 uppercase">Status:</span>
                       <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${app.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : app.status === 'approved' ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-600'}`}>
                          {app.status}
                       </span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0 md:pt-2">
                    {app.status === 'pending' && (
                      <>
                        <button onClick={() => handleApproveAgent(app.id, app.user?.first_name || 'UNK')} className="bg-[#00b48f] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors shadow-sm">Gen ID & Approve</button>
                        <button onClick={() => handleRejectAgent(app.id)} className="bg-white text-red-500 border border-red-200 text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">Reject Application</button>
                      </>
                    )}
                    {app.status === 'approved' && (
                        <div className="text-teal-600 flex items-center gap-1 font-bold text-xs bg-teal-50 px-3 py-2 rounded-lg border border-teal-100">
                           <span>✅</span> Verified Agent
                        </div>
                    )}
                  </div>
                </div>
              ))}
              {agentApps.length === 0 && <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center text-gray-400 shadow-sm">No applications in system queue.</div>}
            </div>
          </div>
        )}

        {/* ─── PLANS MANAGEMENT ─── */}
        {section === 'plans' && (
          <div>
             <h1 className="text-3xl font-extrabold text-[#00579e] mb-6">Plan Control Center</h1>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map(p => (
                  <div key={p.id} className={`bg-white rounded-3xl p-8 border shadow-sm transition-all ${p.is_active ? 'border-teal-100 hover:shadow-xl' : 'opacity-60 bg-gray-50'}`}>
                    <div className="flex justify-between items-start mb-6">
                       <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter ${p.type === 'subscription' ? 'bg-blue-100 text-blue-700' : p.type === 'credit_pack' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                          {p.type.replace('_', ' ')}
                       </span>
                       <button 
                         onClick={() => updatePlan(p.id, { is_active: !p.is_active })}
                         className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${p.is_active ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white'}`}
                       >
                         {p.is_active ? 'Deactivate' : 'Activate'}
                       </button>
                    </div>

                    <h3 className="font-black text-gray-800 text-xl mb-1">{p.name}</h3>
                    <p className="text-xs text-gray-400 font-bold mb-6 italic">"{p.description}"</p>

                    <div className="space-y-4 pt-6 border-t border-gray-100">
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Price (INR)</span>
                          <input 
                            type="number" 
                            className="w-24 bg-gray-50 border-none text-right font-black text-[#112743] rounded-lg p-1 outline-none"
                            value={p.price}
                            onBlur={(e) => updatePlan(p.id, { price: parseFloat(e.target.value) })}
                            onChange={(e) => setPlans(prev => prev.map(plan => plan.id === p.id ? { ...plan, price: e.target.value } : plan))}
                          />
                       </div>
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Duration (Days)</span>
                          <input 
                            type="number" 
                            className="w-24 bg-gray-50 border-none text-right font-black text-[#112743] rounded-lg p-1 outline-none"
                            value={p.duration_days}
                            onBlur={(e) => updatePlan(p.id, { duration_days: parseInt(e.target.value) })}
                            onChange={(e) => setPlans(prev => prev.map(plan => plan.id === p.id ? { ...plan, duration_days: e.target.value } : plan))}
                          />
                       </div>
                       {p.type === 'credit_pack' && (
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Credits Awarded</span>
                            <input 
                              type="number" 
                              className="w-24 bg-gray-50 border-none text-right font-black text-[#112743] rounded-lg p-1 outline-none"
                              value={p.credits_awarded || 0}
                              onBlur={(e) => updatePlan(p.id, { credits_awarded: parseInt(e.target.value) })}
                              onChange={(e) => setPlans(prev => prev.map(plan => plan.id === p.id ? { ...plan, credits_awarded: e.target.value } : plan))}
                            />
                         </div>
                       )}
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

      </main>

      {/* LEAD MODAL POPUP */}
      {selectedLead && (
        <div className="fixed inset-0 bg-[#112743]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedLead(null)} 
              className="absolute top-4 right-4 h-8 w-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition-colors cursor-pointer z-[100]"
            >
              ✕
            </button>

            {/* Header */}
            <div className="bg-[#00579e] p-6 text-white pb-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 opacity-10">
                  <svg width="150" height="150" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                  </svg>
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-[#56bdfa] mb-1 relative z-10">Buyer Lead Details</p>
               <h2 className="text-2xl font-black relative z-10 mb-1">{selectedLead.user?.first_name} {selectedLead.user?.last_name}</h2>
               <p className="text-sm text-blue-100 font-bold relative z-10 uppercase tracking-wider">📞 {selectedLead.user?.phone_number} &nbsp;|&nbsp; ✉️ {selectedLead.user?.email}</p>
            </div>

            {/* Content Body */}
            <div className="p-6">
               <div className="mb-6 -mt-8 relative z-20">
                 <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Target Property</p>
                    <Link 
                       href={`/properties/${selectedLead.property?.id}`} 
                       target="_blank"
                       rel="noopener noreferrer"
                       className="text-xl font-bold text-[#00579e] hover:underline flex items-center gap-2 group"
                    >
                       {selectedLead.property?.property_type} in {selectedLead.property?.city}
                       <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                    </Link>
                 </div>
               </div>

               <div className="mb-6 pl-4 border-l-2 border-teal-200">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Buyer's Message</p>
                  <p className="text-sm text-gray-700 italic">"{selectedLead.message}"</p>
               </div>

               <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Assigned Agent / Owner</p>
                  <p className="text-sm font-bold text-gray-800">{selectedLead.property?.owner?.first_name} {selectedLead.property?.owner?.last_name}</p>
                  <p className="text-xs text-gray-600 font-bold">📞 {selectedLead.property?.owner?.phone_number || 'N/A'}</p>
                  <p className="text-xs text-gray-600 font-bold">✉️ {selectedLead.property?.owner?.email || 'N/A'}</p>
               </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-gray-50 p-4 px-6 border-t border-gray-100 flex justify-between items-center bg-gray-50 rounded-b-3xl">
               <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${selectedLead.status === 'contacted' ? 'bg-teal-100 text-teal-800' : 'bg-yellow-100 text-yellow-800'}`}>
                 Status: {selectedLead.status}
               </span>
               
               {selectedLead.status === 'pending' && (
                 <button 
                   onClick={() => {
                     updateInterestStatus(selectedLead.id, 'contacted');
                     setSelectedLead(null);
                   }}
                   className="bg-[#00579e] hover:bg-[#1a3a61] text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                 >
                   Mark as Contacted
                 </button>
               )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
