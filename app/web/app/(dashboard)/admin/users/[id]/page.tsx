'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';
import toast from 'react-hot-toast';
import PremiumLoader from '@/components/ui/PremiumLoader';

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const user = await getCurrentUser();
      
      // 1. Strict Admin Check
      if (!user || user.profile?.role !== 'admin') {
        toast.error("Unauthorized access");
        router.push('/dashboard');
        return;
      }

      // 2. Fetch Target User Profile
      const { data: targetProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) {
        toast.error("User not found");
        router.push('/admin');
        return;
      }
      setUserProfile(targetProfile);

      // 3. Fetch Properties by this User
      const { data: propData, error: propError } = await supabase
        .from('properties')
        .select(`
          id, listing_type, property_type, city, area, price, status, created_at,
          media:property_media(url, media_type),
          favorites(count)
        `)
        .eq('owner_id', id)
        .order('created_at', { ascending: false });

      if (!propError) {
        setProperties(propData || []);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [id, router]);

  if (isLoading) {
    return (
      <PremiumLoader 
        messages={[
          "Pulling comprehensive user profile",
          "fetching listed asset history",
          "Validating account status",
          "Synchronizing administrative data"
        ]}
        duration={1500}
      />
    );
  }

  const initials = [userProfile?.first_name?.[0], userProfile?.last_name?.[0]].filter(Boolean).join('').toUpperCase() || '?';

  return (
    <div className="flex-1 w-full bg-[#fbfcfa] py-12 px-4 sm:px-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        
        {/* Header/Back Link */}
        <Link href="/admin" className="inline-flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-[#00579e] transition-colors mb-8">
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
           Back to Admin Panel
        </Link>
        
        {/* Profile Card */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-10 mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
            {/* Avatar */}
            <div className="shrink-0">
              {userProfile?.avatar_url ? (
                <img src={userProfile.avatar_url} className="w-32 h-32 rounded-[2rem] object-cover ring-8 ring-teal-50 shadow-2xl" alt="Avatar"/>
              ) : (
                <div className="w-32 h-32 rounded-[2rem] bg-linear-to-br from-[#00579e] to-teal-400 flex items-center justify-center text-white text-5xl font-black shadow-2xl ring-8 ring-teal-50">
                  {initials}
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                <span className="bg-[#112743] text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                  Bhavyam {userProfile?.role}
                </span>
                {userProfile?.is_verified_seller && (
                  <span className="bg-teal-50 text-teal-600 border border-teal-100 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.24.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    Verified Partner
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">
                {userProfile?.first_name} {userProfile?.last_name}
              </h1>
              <p className="text-sm text-gray-400 font-medium">Contact details are kept confidential and not displayed here.</p>
            </div>
          </div>
        </div>

        {/* User's Properties Listing */}
        <div className="flex items-end justify-between mb-8">
           <div>
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">User Listed Assets</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Found {properties.length} Active listings under this profile</p>
           </div>
        </div>

        {properties.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-dashed border-gray-300 p-20 text-center text-gray-400">
             <p className="text-5xl mb-4">🏠</p>
             <p className="font-black text-xl text-gray-500 uppercase tracking-widest">No listings found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {properties.map((prop: any) => {
               const mainImg = prop?.media?.[0]?.url || 'https://placehold.co/600x400/eeeeee/999999?text=No+Image';
               const formattedP = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(prop.price);
               
               return (
                <div key={prop.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-500">
                  <div className="flex flex-col md:flex-row">
                    <div className="relative w-full md:w-80 h-56 md:h-auto shrink-0 overflow-hidden">
                      <img src={mainImg} alt={prop.property_type} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                         <span className="text-white text-[10px] font-black uppercase tracking-widest">View Detailed Specs</span>
                      </div>
                    </div>
                    <div className="p-8 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-2xl font-black text-gray-800 tracking-tight transition-colors uppercase">
                              {prop.property_type} <span className="text-gray-300 font-normal lowercase italic text-base">in {prop.city}</span>
                            </h3>
                            <p className="text-teal-600 text-xs font-black uppercase tracking-widest mt-1">{prop.area}</p>
                          </div>
                          <p className="text-3xl font-black text-[#00579e] tracking-tighter">{formattedP}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-sm ${
                            prop.status === 'approved' ? 'bg-teal-50 text-teal-700' : 
                            prop.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
                          }`}>
                            Status: {prop.status}
                          </span>
                          <span className="text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest bg-gray-50 text-gray-500 shadow-sm">
                            Type: {prop.listing_type}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-end mt-8">
                         <Link href={`/properties/${prop.id}`} className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-black/10">
                            Visit Public Site →
                         </Link>
                      </div>
                    </div>
                  </div>
                </div>
               );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
