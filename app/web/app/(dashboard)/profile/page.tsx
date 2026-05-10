'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProfileSettings from '@/components/dashboard/ProfileSettings';
import Wallet from '@/components/dashboard/Wallet';
import PremiumLoader from '@/components/ui/PremiumLoader';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';


export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session }, error: sessErr } = await supabase.auth.getSession();
      if (sessErr || !session) { router.replace('/login'); return; }

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!prof) { router.replace('/login'); return; }

      setProfile(prof);
      setIsLoading(false);
    };

    fetchProfile();
  }, [router]);

  if (isLoading) return <PremiumLoader />;

  const initials = [profile?.first_name?.[0], profile?.last_name?.[0]].filter(Boolean).join('').toUpperCase() || '?';
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'User';
  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  return (
    <div className="flex-1 w-full bg-[#fbfcfa] py-12 px-4 sm:px-8 min-h-screen">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 flex flex-col md:flex-row items-center gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
           <div className="relative group">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} className="w-32 h-32 rounded-full object-cover ring-8 ring-teal-50 shadow-2xl" alt="" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-linear-to-br from-[#00b48f] to-[#112743] flex items-center justify-center text-white text-4xl font-black ring-8 ring-teal-50 shadow-2xl">
                  {initials}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                 <span className="text-white text-[10px] font-black uppercase tracking-widest">Change</span>
              </div>
           </div>

           <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                 <h1 className="text-4xl font-black text-[#112743] tracking-tighter">{fullName}</h1>
                 <span className="bg-[#112743] text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest self-center md:self-auto">
                    {profile?.role}
                 </span>
              </div>
              <p className="text-gray-400 font-bold tracking-tight text-sm mb-4">@{profile?.username || 'no-username'}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-xs font-bold text-gray-500">
                 <div className="flex items-center gap-2">
                    <span className="text-lg">📧</span> {profile?.email}
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-lg">📞</span> {profile?.phone_number || 'Not provided'}
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-lg">📅</span> Joined {joinedDate}
                 </div>
              </div>
           </div>

           <div className="flex bg-gray-50 p-1.5 rounded-[2rem] border border-gray-100">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-[#112743] text-white shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Overview
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-[#112743] text-white shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Edit Profile
              </button>
           </div>
        </div>

        {activeTab === 'overview' ? (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Wallet & Plan */}
            <Wallet 
              credits={profile?.credits || 0}
              subscriptionPlan={profile?.subscription_plan || 'free'}
              subscriptionExpiresAt={profile?.subscription_expires_at}
            />

            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl">
               <h2 className="text-xl font-black text-[#112743] uppercase tracking-widest mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-sm">📝</span>
                  Bio / About
               </h2>
               <p className="text-gray-500 font-medium leading-relaxed italic">
                  {profile?.bio || "You haven't added a bio yet. Tell us a bit about yourself in the 'Edit Profile' section."}
               </p>
            </div>
            
            {profile?.role === 'agent' && profile?.agent_code && (
               <div className="bg-linear-to-r from-[#112743] to-[#1e3a5a] rounded-[2.5rem] p-10 text-white shadow-2xl">
                  <div className="flex items-center justify-between">
                     <div>
                        <h2 className="text-2xl font-black tracking-tighter mb-2">Agent ID: {profile.agent_code}</h2>
                        <p className="text-white/60 font-bold text-xs uppercase tracking-widest">Share this code with your clients</p>
                     </div>
                     <button className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl transition-all" onClick={() => {
                        navigator.clipboard.writeText(profile.agent_code);
                        toast.success('Agent code copied!');
                     }}>
                        📋
                     </button>
                  </div>
               </div>
            )}
          </div>
        ) : (
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
