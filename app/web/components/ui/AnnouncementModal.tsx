'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/lib/auth';
import { X, Megaphone, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

export default function AnnouncementModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [announcement, setAnnouncement] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAnnouncement = async () => {
      try {
        // 1. Fetch current user if logged in
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        // 2. Fetch the latest active announcement
        const { data: activeAnnouncements, error } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error || !activeAnnouncements || activeAnnouncements.length === 0) {
          return;
        }

        const latestAnn = activeAnnouncements[0];

        // 3. Check if seen in localStorage (covers guest and provides instant offline check)
        const isSeenLocal = localStorage.getItem(`seen_announcement_${latestAnn.id}`) === 'true';
        if (isSeenLocal) return;

        // 4. If logged in, check database if they have already seen it
        if (currentUser) {
          const { data: seenRecord } = await supabase
            .from('announcement_seen')
            .select('id')
            .eq('user_id', currentUser.id)
            .eq('announcement_id', latestAnn.id)
            .maybeSingle();

          if (seenRecord) {
            // Sync local storage if seen in database on another device
            localStorage.setItem(`seen_announcement_${latestAnn.id}`, 'true');
            return;
          }
        }

        // If not seen anywhere, display the beautiful modal!
        setAnnouncement(latestAnn);
        setIsOpen(true);
      } catch (err) {
        // Defensive coding: Catch table missing errors gracefully so the platform never crashes
        console.warn('Announcements system notice (may need migrations run):', err);
      }
    };

    checkAnnouncement();
  }, []);

  const handleClose = async () => {
    if (!announcement) return;

    // 1. Mark as seen in localStorage instantly
    localStorage.setItem(`seen_announcement_${announcement.id}`, 'true');
    setIsOpen(false);

    // 2. If logged in, record the seen status in the database for cross-device persistence
    if (user) {
      try {
        await supabase.from('announcement_seen').insert({
          user_id: user.id,
          announcement_id: announcement.id,
        });
      } catch (err) {
        console.error('Failed to sync seen state to DB:', err);
      }
    }
  };

  if (!isOpen || !announcement) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div 
        onClick={handleClose}
        className="absolute inset-0 bg-[#112743]/70 backdrop-blur-md animate-in fade-in duration-300"
      />

      {/* Modal Container */}
      <div 
        className="relative bg-white rounded-[32px] border border-gray-100 shadow-[0_32px_96px_rgba(0,18,41,0.25)] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-500 z-10 flex flex-col"
      >
        {/* Floating Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 h-10 w-10 bg-white/80 hover:bg-white text-gray-700 hover:text-black rounded-full flex items-center justify-center border border-gray-100/50 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Feature Image or Accent Header */}
        {announcement.image_url ? (
          <div className="relative w-full h-[220px] bg-gradient-to-r from-[var(--color-deep-navy)] to-[var(--color-deep-navy-light)] overflow-hidden shrink-0">
            <img 
              src={announcement.image_url} 
              alt={announcement.title}
              className="w-full h-full object-cover brightness-[0.95]"
              onError={(e) => {
                // Fallback if image URL fails to load
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            {/* Soft gradient bottom fade */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/10 pointer-events-none" />
          </div>
        ) : (
          <div className="w-full h-24 bg-gradient-to-r from-[var(--color-emerald-heritage)] to-[var(--color-emerald-mint)] flex items-center justify-center relative overflow-hidden shrink-0">
            <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-[-30%] left-[-10%] w-24 h-24 bg-white/10 rounded-full blur-xl" />
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/20 text-white shadow-inner relative z-10">
              <Megaphone className="w-6 h-6 animate-bounce" />
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-8 flex-1 flex flex-col text-left">
          {/* Tag */}
          <div className="flex items-center gap-1.5 text-[10px] font-black text-[var(--color-emerald-heritage)] uppercase tracking-[0.2em] mb-3">
            <span className="w-2 h-2 rounded-full bg-[var(--color-emerald-heritage)] animate-ping" />
            Platform Notice
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-4 tracking-tight">
            {announcement.title}
          </h2>

          {/* Message Description */}
          <p className="text-gray-600 font-medium text-sm md:text-base leading-relaxed mb-6 overflow-y-auto max-h-[160px] pr-2 scrollbar-thin">
            {announcement.message}
          </p>

          {/* Call to Action Button */}
          {announcement.url && (
            <a 
              href={announcement.url}
              onClick={handleClose} // Dismiss pop-up as they click through
              className="mt-auto w-full bg-[var(--color-emerald-heritage)] hover:bg-[var(--color-deep-navy)] text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-[#006B54]/10 hover:shadow-xl hover:shadow-[#001229]/15 flex items-center justify-center gap-2 group cursor-pointer text-center text-sm uppercase tracking-wider"
            >
              <span>Explore More</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
