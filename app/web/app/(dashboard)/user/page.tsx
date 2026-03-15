'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ favorites: 0, interests: 0, reviews: 0 });
  const [recentInterests, setRecentInterests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
        { data: recentInts }
      ] = await Promise.all([
        supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id),
        supabase.from('interest_requests').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id),
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id),
        supabase
          .from('interest_requests')
          .select('id, status, message, created_at, property:properties(property_type, city)')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      setStats({
        favorites: favCount || 0,
        interests: intCount || 0,
        reviews:   revCount || 0,
      });
      setRecentInterests(recentInts || []);
      setIsLoading(false);
    };

    fetchData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent" />
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

        {/* ── Profile Header ── */}
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
                🗓 Member since {joinedDate}
              </span>
            </div>
          </div>

          {/* Upgrade CTA */}
          <Link
            href="/user/apply-agent"
            className="shrink-0 flex items-center gap-2 bg-linear-to-r from-[#00b48f] to-teal-400 hover:from-teal-400 hover:to-teal-300 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-md shadow-teal-500/20 transition-all hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Become an Agent
          </Link>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Saved Properties', value: stats.favorites, icon: '❤️', href: '/user/favorites', color: 'text-rose-500' },
            { label: 'Interest Requests', value: stats.interests, icon: '📋', href: null, color: 'text-blue-500' },
            { label: 'Reviews Written', value: stats.reviews, icon: '⭐', href: null, color: 'text-yellow-500' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-start">
              <span className="text-2xl mb-2">{stat.icon}</span>
              <p className="text-3xl font-black text-gray-800">{stat.value}</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
              {stat.href && (
                <Link href={stat.href} className="text-xs text-teal-600 font-semibold mt-2 hover:underline">
                  View all →
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* ── Quick Actions ── */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Browse Properties', icon: '🏠', href: '/properties' },
              { label: 'My Favorites',      icon: '❤️', href: '/user/favorites' },
              { label: 'Apply as Agent',    icon: '🏢', href: '/user/apply-agent' },
              { label: 'Submit Property',   icon: '➕', href: '/submit-property' },
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

        {/* ── Recent Interest Requests ── */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">Recent Interest Requests</h2>
          {recentInterests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center text-gray-400">
              <p className="text-4xl mb-3">📋</p>
              <p className="font-semibold">No interest requests yet.</p>
              <p className="text-sm mt-1">Browse properties and click "Express Interest" to get started.</p>
              <Link href="/properties" className="mt-4 inline-block text-teal-600 text-sm font-bold hover:underline">
                Browse Properties →
              </Link>
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

      </div>
    </div>
  );
}
