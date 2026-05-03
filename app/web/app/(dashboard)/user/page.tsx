'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProfileSettings from '@/components/dashboard/ProfileSettings';
import Wallet from '@/components/dashboard/Wallet';
import UnlockedPropertiesSection from '@/components/dashboard/UnlockedPropertiesSection';
import PremiumLoader from '@/components/ui/PremiumLoader';

export default function UserDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ favorites: 0, interests: 0, reviews: 0, transactions: 0 });
  const [recentInterests, setRecentInterests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [agentApp, setAgentApp] = useState<{ status: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { supabase } = await import('@/lib/supabaseClient');

      const { data: { session }, error: sessErr } = await supabase.auth.getSession();
      if (sessErr || !session) { router.replace('/login'); return; }

      // Fetch profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!prof) { router.replace('/login'); return; }

      // If not a buyer, redirect to the correct dashboard
      if (prof.role === 'admin')  { router.replace('/admin');  return; }
      if (prof.role === 'agent')  { router.replace('/agent');  return; }
      if (prof.role === 'seller') { router.replace('/seller'); return; }

      setProfile(prof);

      // Parallel data fetch
      const [
        { count: favCount },
        { count: intCount },
        { count: revCount },
        { count: txCount },
        { data: recentInts },
        { data: appData }
      ] = await Promise.all([
        supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id),
        supabase.from('interest_requests').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id),
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id),
        supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id),
        supabase
          .from('interest_requests')
          .select('id, status, message, created_at, property:properties(property_type, city)')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('agent_applications')
          .select('status')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      ]);

      setAgentApp(appData);

      setStats({
        favorites: favCount || 0,
        interests: intCount || 0,
        reviews:   revCount || 0,
        transactions: txCount || 0,
      });
      setRecentInterests(recentInts || []);
      setIsLoading(false);
    };

    fetchData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex-1 w-full bg-[#fbfcfa] py-12 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex flex-col gap-8 animate-pulse">
          {/* Header Skeleton */}
          <div className="bg-white rounded-3xl p-6 flex items-center gap-5 border border-gray-100 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-3">
              <div className="w-48 h-8 bg-gray-200 rounded-lg" />
              <div className="w-32 h-4 bg-gray-100 rounded" />
            </div>
            <div className="w-40 h-10 bg-gray-100 rounded-2xl" />
          </div>
          {/* Main Card Skeleton */}
          <div className="w-full h-40 bg-gray-200 rounded-3xl" />
          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="h-32 bg-gray-200 rounded-3xl" />
            <div className="h-32 bg-gray-200 rounded-3xl" />
            <div className="h-32 bg-gray-200 rounded-3xl" />
          </div>
           {/* Section Skeleton */}
           <div className="space-y-4">
              <div className="w-32 h-6 bg-gray-200 rounded" />
              <div className="grid grid-cols-4 gap-4">
                 <div className="h-20 bg-gray-100 rounded-2xl" />
                 <div className="h-20 bg-gray-100 rounded-2xl" />
                 <div className="h-20 bg-gray-100 rounded-2xl" />
                 <div className="h-20 bg-gray-100 rounded-2xl" />
              </div>
           </div>
        </div>
      </div>
    );
  }

  const initials = [profile?.first_name?.[0], profile?.last_name?.[0]].filter(Boolean).join('').toUpperCase() || '?';
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'User';
  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  return (
    <div className="flex-1 w-full bg-[#fbfcfa] py-8 px-4 sm:px-8 min-h-[80vh]">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">

        {/* -- Profile Header -- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="shrink-0">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={fullName}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-teal-100"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-teal-400 to-[#00579e] flex items-center justify-center text-white text-2xl font-black ring-4 ring-teal-100">
                {initials}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">{fullName}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{profile?.email}</p>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className="bg-blue-50 text-[#00579e] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {profile?.role}
              </span>
              {profile?.phone_number && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  📞 {profile.phone_number}
                </span>
              )}
              <span className="text-xs text-gray-400 flex items-center gap-1">
                📅 Member since {joinedDate}
              </span>
            </div>
          </div>

          {/* Navigation Tabs (Overview / Settings) */}
          <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100 self-center">
             <button 
               onClick={() => setActiveTab('overview')}
               className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-[#112743] text-white shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
             >
               Overview
             </button>
             <button 
               onClick={() => setActiveTab('settings')}
               className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-[#112743] text-white shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
             >
               Profile Info
             </button>
          </div>
        </div>

        {/* -- Agent Application Status / Call to Action -- */}
        {profile?.role === 'buyer' && (
          <div className={`rounded-2xl p-6 border flex flex-col md:flex-row items-center justify-between gap-6 transition-all ${
            agentApp?.status === 'pending' ? 'bg-yellow-50 border-yellow-100' : 
            agentApp?.status === 'rejected' ? 'bg-red-50 border-red-100' :
            'bg-linear-to-r from-[#00579e] to-[#00c69d] border-none shadow-lg'
          }`}>
             <div className="flex items-center gap-5 text-center md:text-left">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-sm ${
                  agentApp?.status === 'pending' ? 'bg-white text-yellow-500' : 
                  agentApp?.status === 'rejected' ? 'bg-white text-red-500' :
                  'bg-white/20 text-white'
                }`}>
                   {agentApp?.status === 'pending' ? '⏳' : agentApp?.status === 'rejected' ? '❌' : '🎖️'}
                </div>
                <div>
                   <h3 className={`text-lg font-black tracking-tight ${agentApp?.status === 'pending' || agentApp?.status === 'rejected' ? 'text-gray-800' : 'text-white'}`}>
                      {agentApp?.status === 'pending' ? 'Agent Application Pending' : 
                       agentApp?.status === 'rejected' ? 'Application Rejected' :
                       'Become a Verified Agent'}
                   </h3>
                   <p className={`text-sm font-medium ${agentApp?.status === 'pending' || agentApp?.status === 'rejected' ? 'text-gray-600' : 'text-white/80'}`}>
                      {agentApp?.status === 'pending' ? 'Your application is being reviewed by our team.' : 
                       agentApp?.status === 'rejected' ? 'You can update your profile and re-apply anytime.' :
                       'Become verified to speed up and increase the chances of selling your properties.'}
                   </p>
                </div>
             </div>
             
             {!agentApp || agentApp.status === 'rejected' ? (
                <Link href="/user/apply-agent" className="bg-white text-[#112743] hover:bg-gray-50 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-md transition-all active:scale-95 whitespace-nowrap">
                   Apply Now
                </Link>
             ) : (
                <div className="bg-white/50 px-6 py-2 rounded-full text-xs font-black uppercase tracking-tighter text-gray-800">
                   Status: {agentApp.status}
                </div>
             )}
          </div>
        )}

        {/* -- Conditional Render Content -- */}
        {activeTab === 'overview' ? (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* -- Wallet Row -- */}
            <Wallet 
              credits={profile?.credits || 0}
              subscriptionPlan={profile?.subscription_plan || 'free'}
              subscriptionExpiresAt={profile?.subscription_expires_at}
            />

            {/* -- Stats Row -- */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Saved Properties', value: stats.favorites, icon: '❤️', href: '/user/favorites', color: 'text-rose-500' },
                { label: 'Interest Requests', value: stats.interests, icon: '📋', href: null, color: 'text-blue-500' },
                { label: 'Total Transactions', value: stats.transactions, icon: '💸', href: '/user/transactions', color: 'text-emerald-500' },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-start transition-all hover:shadow-md">
                  <span className="text-2xl mb-2">{stat.icon}</span>
                  <p className={`text-3xl font-black ${stat.color || 'text-gray-800'}`}>{stat.value}</p>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
                  {stat.href && (
                    <Link href={stat.href} className="text-xs text-teal-600 font-bold mt-4 hover:text-[#112743] flex items-center gap-1 transition-colors group">
                      View all <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* -- Quick Actions -- */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Browse Properties', icon: '🏠', href: '/properties' },
                  { label: 'My Favorites',      icon: '❤️', href: '/user/favorites' },
                  { label: 'My Transactions',   icon: '💸', href: '/user/transactions' },
                  { label: 'Submit Property',   icon: '➕', href: '/submit-property' },
                  { label: 'Apply as Agent',    icon: '🎖️', href: '/user/apply-agent' },
                ].map(action => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="bg-white hover:bg-gray-50 border border-gray-100 shadow-sm rounded-xl p-4 flex flex-col items-center text-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <span className="text-2xl">{action.icon}</span>
                    <span className="text-xs font-bold text-gray-700 leading-tight">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* -- Recent Interest Requests -- */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">Recent Interest Requests</h2>
              {recentInterests.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center text-gray-400">
                  <p className="text-4xl mb-3">📋</p>
                  <p className="font-semibold">No interest requests yet.</p>
                  <p className="text-sm mt-1">Browse properties and click "Express Interest" to get started.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {recentInterests.map(req => (
                    <div key={req.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-gray-800">
                          {(req.property as any)?.property_type} in {(req.property as any)?.city}
                        </p>
                        <p className="text-sm text-gray-500 italic mt-1">"{req.message}"</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(req.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <span className={`shrink-0 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${
                        req.status === 'pending'  ? 'bg-yellow-50 text-yellow-700' :
                        req.status === 'approved' ? 'bg-teal-50 text-teal-700'    :
                                                    'bg-red-50 text-red-600'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* -- Unlocked Properties -- */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">🔓 My Unlocked Properties</h2>
                <Link href="/properties" className="text-xs text-teal-600 font-bold hover:text-[#112743] transition-colors">
                  Find more {">"}
                </Link>
              </div>
              <UnlockedPropertiesSection userId={profile.id} />
            </div>
          </div>
        ) : (
          /* Profile Settings Component */
          <ProfileSettings 
            profile={profile} 
            onUpdate={(updated) => {
              setProfile(updated);
              setActiveTab('overview');
            }} 
          />
        )}

      </div>
    </div>
  );
}
