"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

function CountdownBadge({ expiresAt }: { expiresAt: string }) {
  const expiry = new Date(expiresAt);
  const now    = Date.now();
  const diff   = expiry.getTime() - now;
  const days   = Math.max(0, Math.floor(diff / 86400000));
  const hours  = Math.max(0, Math.floor((diff % 86400000) / 3600000));

  const urgent = days < 2;

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
      urgent
        ? 'bg-red-50 text-red-600 border border-red-100'
        : 'bg-teal-50 text-teal-700 border border-teal-100'
    }`}>
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      {days > 0 ? `${days}d ${hours}h left` : `${hours}h left`}
    </span>
  );
}

export default function UnlockedPropertiesSection({ userId }: { userId: string }) {
  const [unlocks, setUnlocks]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function fetchUnlocked() {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('property_unlocks')
        .select(`
          id, expires_at, unlocked_at,
          property:properties (
            id, property_type, city, listing_type, price, status,
            media:property_media (url, media_type)
          )
        `)
        .eq('user_id', userId)
        .gt('expires_at', now)
        .order('expires_at', { ascending: true });

      if (error) {
        console.error("Error fetching unlocked properties:", error);
      } else {
        // filter out unlocked properties that have been removed/not approved
        setUnlocks((data || []).filter((u: any) => u.property && u.property.status === 'approved'));
      }
      setLoading(false);
    }

    fetchUnlocked();
  }, [userId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
        {[1, 2].map(i => (
          <div key={i} className="bg-gray-100 rounded-2xl h-40" />
        ))}
      </div>
    );
  }

  if (unlocks.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
        <p className="text-4xl mb-3">🔒</p>
        <p className="font-semibold text-gray-700 mb-1">No unlocked properties yet</p>
        <p className="text-sm text-gray-400 mb-6">
          Unlock a property from its detail page for ₹99 to see contact & address details here.
        </p>
        <Link
          href="/properties"
          className="inline-block bg-[#00b48f] hover:bg-teal-400 text-white font-bold text-xs uppercase tracking-widest px-8 py-3 rounded-full transition-all shadow-md active:scale-95"
        >
          Browse Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {unlocks.map((unlock) => {
        const prop      = unlock.property;
        const coverImg  = prop?.media?.find((m: any) => m.media_type === 'image')?.url;
        const price     = prop?.price
          ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(prop.price)
          : '—';

        return (
          <Link
            key={unlock.id}
            href={`/properties/${prop.id}`}
            className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col"
          >
            {/* Image */}
            <div className="relative h-36 bg-gray-100 shrink-0 overflow-hidden">
              {coverImg ? (
                <img src={coverImg} alt={prop.property_type} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  </svg>
                </div>
              )}
              {/* Listing type badge */}
              <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest text-[#2d2a26] px-2.5 py-1 rounded-lg shadow-sm">
                {prop.listing_type}
              </span>
              {/* Unlock badge */}
              <div className="absolute top-3 right-3">
                <CountdownBadge expiresAt={unlock.expires_at} />
              </div>
            </div>

            {/* Info */}
            <div className="p-4 flex flex-col gap-1">
              <p className="font-bold text-gray-800 leading-snug group-hover:text-teal-600 transition-colors">
                {prop.property_type}
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {prop.city}
              </p>
              <p className="text-base font-black text-[#2d2a26] mt-1">{price}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
