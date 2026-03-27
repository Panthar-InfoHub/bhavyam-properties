'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

export default function ProfileSettings({ profile, onUpdate }: { profile: any, onUpdate: (newProfile: any) => void }) {
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone_number: profile?.phone_number || '',
    bio: profile?.bio || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      phone_number: profile?.phone_number || '',
      bio: profile?.bio || '',
    });
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone_number,
          bio: formData.bio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;
      
      onUpdate(data);
      toast.success('Profile updated successfully!', { icon: '✅' });
    } catch (err: any) {
      console.error('Update Profile Error:', err);
      toast.error('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase mb-2">Profile Settings</h2>
        <p className="text-gray-500 font-medium">Manage your personal information and contact details.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* First Name */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">First Name</label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              placeholder="e.g. Nikhil"
              className="w-full bg-[#fbfcfa] border border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#00ecbd] focus:bg-white transition-all outline-none"
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Last Name</label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              placeholder="e.g. Raikwar"
              className="w-full bg-[#fbfcfa] border border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#00ecbd] focus:bg-white transition-all outline-none"
            />
          </div>
        </div>

        {/* Email (Read Only) */}
        <div className="space-y-2 opacity-60">
          <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Email Address (Primary)</label>
          <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-400 cursor-not-allowed">
            {profile?.email}
          </div>
          <p className="text-[10px] font-bold text-gray-400 ml-2">Email is linked to your Google Account and cannot be changed.</p>
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Phone Number</label>
          <div className="relative">
             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">+91</span>
             <input
               type="tel"
               value={formData.phone_number}
               onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
               placeholder="9876543210"
               className="w-full bg-[#fbfcfa] border border-gray-100 rounded-2xl p-4 pl-14 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#00ecbd] focus:bg-white transition-all outline-none"
             />
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">About Me / Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            rows={4}
            placeholder="Tell us a bit about yourself..."
            className="w-full bg-[#fbfcfa] border border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#00ecbd] focus:bg-white transition-all outline-none resize-none"
          />
        </div>

        {/* Action Button */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-[#112743] hover:bg-[#1e3a5a] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? 'Saving Changes...' : 'Save Profile Details'}
          </button>
        </div>
      </form>
    </div>
  );
}
