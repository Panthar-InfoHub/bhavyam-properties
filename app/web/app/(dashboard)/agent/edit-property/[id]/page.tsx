'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/lib/auth';
import { useRouter, useParams } from 'next/navigation';

export default function EditPropertyPage() {
  const { id } = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [existingMedia, setExistingMedia] = useState<any[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [adminFeedback, setAdminFeedback] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    property_type: '',
    listing_type: '',
    price: '',
    city: '',
    address: '',
    area: '',
    description: '',
    map_url: ''
  });

  const [newFiles, setNewFiles] = useState<{
    photos: File[],
    map: File | null,
    video: File | null
  }>({
    photos: [],
    map: null,
    video: null
  });

  useEffect(() => {
    const fetchPropertyData = async () => {
      const user = await getCurrentUser();
      if (!user || user.profile?.role !== 'agent') {
        router.push('/dashboard');
        return;
      }
      setCurrentUser(user);

      // Fetch Property
      const { data: prop, error: propErr } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .eq('owner_id', user.id)
        .single();

      if (propErr || !prop) {
        alert("Property not found or access denied.");
        router.push('/agent');
        return;
      }

      // Fetch Media
      const { data: media } = await supabase
        .from('property_media')
        .select('*')
        .eq('property_id', id);

      setExistingMedia(media || []);
      setAdminFeedback(prop.admin_feedback || null);
      setFormData({
        property_type: prop.property_type || '',
        listing_type: prop.listing_type || '',
        price: prop.price?.toString() || '',
        city: prop.city || '',
        address: prop.address || '',
        area: prop.area || '',
        description: prop.description || '',
        map_url: prop.map_url || ''
      });
      setIsLoading(false);
    };

    fetchPropertyData();
  }, [id, router]);

  const uploadFile = async (file: File, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${currentUser.id}/${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('property-media').upload(filePath, file);
    if (uploadError) throw uploadError;
    
    const { data } = supabase.storage.from('property-media').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const deleteMedia = async (mediaId: string) => {
    const { error: dbErr } = await supabase.from('property_media').delete().eq('id', mediaId);
    if (!dbErr) {
       setExistingMedia(prev => prev.filter(m => m.id !== mediaId));
       setNotification("Media removed correctly.");
       setTimeout(() => setNotification(null), 3000);
    }
  };

  const removeNewFile = (type: 'photos' | 'map' | 'video', index?: number) => {
    setNewFiles(prev => {
      if (type === 'photos' && typeof index === 'number') {
        return { ...prev, photos: prev.photos.filter((_, i) => i !== index) };
      }
      return { ...prev, [type]: null };
    });
  };

  const getMapEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('pb=') || url.includes('output=embed')) return url;
    const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) return `https://maps.google.com/maps?q=${match[1]},${match[2]}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    const placeMatch = url.match(/\/place\/([^\/]+)/);
    if (placeMatch) return `https://maps.google.com/maps?q=${encodeURIComponent(placeMatch[1].replace(/\+/g, ' '))}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    return url.includes('goo.gl') ? null : `https://maps.google.com/maps?q=${encodeURIComponent(url)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error: propErr } = await supabase
        .from('properties')
        .update({
          ...formData,
          price: parseFloat(formData.price) || 0,
          status: 'pending'
        })
        .eq('id', id);

      if (propErr) throw propErr;

      const mediaRecords = [];
      if (newFiles.map) {
        const url = await uploadFile(newFiles.map, 'maps');
        mediaRecords.push({ property_id: id, url, media_type: 'map' });
      }
      if (newFiles.video) {
        const url = await uploadFile(newFiles.video, 'videos');
        mediaRecords.push({ property_id: id, url, media_type: 'video' });
      }
      for (const file of newFiles.photos) {
        const url = await uploadFile(file, 'general');
        mediaRecords.push({ property_id: id, url, media_type: 'image' });
      }

      if (mediaRecords.length > 0) {
        const { error: mediaErr } = await supabase.from('property_media').insert(mediaRecords);
        if (mediaErr) throw mediaErr;
      }

      alert("Property updated and set to Pending for Admin approval.");
      router.push('/agent');
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-24 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div></div>;

  const embedUrl = formData.map_url ? getMapEmbedUrl(formData.map_url) : null;

  return (
    <div className="flex-1 w-full bg-[#fbfcfa] py-12 px-4 sm:px-8 relative">
      {notification && (
        <div className="fixed top-24 right-8 z-50 bg-black text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl animate-in slide-in-from-right-10">
          {notification}
        </div>
      )}

      <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-[#00579e] p-8 md:p-12 text-white">
          <h1 className="text-3xl font-black tracking-tight mb-2">Editor Mode: {formData.property_type}</h1>
          <p className="text-blue-100/70 font-bold uppercase text-[10px] tracking-[0.3em]">Asset Reference ID: {id}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12">
          {adminFeedback && (
            <div className="bg-red-50 border-2 border-red-100 p-6 rounded-3xl animate-in slide-in-from-top-4 duration-500">
               <div className="flex items-center gap-2 mb-3">
                  <span className="bg-red-500 text-white p-1 rounded-lg text-xs">⚠️</span>
                  <h3 className="text-red-700 font-black uppercase text-xs tracking-widest">Admin Improvement Request</h3>
               </div>
               <p className="text-red-800 text-sm font-bold leading-relaxed italic border-l-4 border-red-200 pl-4">
                  "{adminFeedback}"
               </p>
               <p className="text-[10px] text-red-400 mt-4 uppercase font-black tracking-tighter">Please address the points above before resubmitting for approval.</p>
            </div>
          )}

          {/* Description / Summary */}
          <section>
            <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
              <span className="bg-purple-50 text-purple-500 p-2 rounded-xl text-sm">00</span>
              Marketing Description
            </h3>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Property Summary</label>
              <textarea 
                rows={4} 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                placeholder="Tell buyers about the unique features, history, and surroundings..."
                className="w-full border-2 border-gray-100 p-4 rounded-xl font-bold bg-gray-50/30 text-gray-800 placeholder-gray-400 outline-none focus:border-blue-500 transition-all"
              ></textarea>
            </div>
          </section>

          {/* Core Info */}
          <section>
            <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
              <span className="bg-blue-50 text-blue-500 p-2 rounded-xl text-sm">01</span>
              Primary Asset Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Property Type</label>
                <select value={formData.property_type} onChange={e => setFormData({...formData, property_type: e.target.value})} className="w-full border-2 border-gray-100 p-4 rounded-xl font-bold bg-gray-50/30 text-gray-800 outline-none focus:border-blue-500 transition-all">
                  <option value="Flat">Flat / Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="House">House</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Plot">Plot</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Listing Category</label>
                <select value={formData.listing_type} onChange={e => setFormData({...formData, listing_type: e.target.value})} className="w-full border-2 border-gray-100 p-4 rounded-xl font-bold bg-gray-50/30 text-gray-800 outline-none focus:border-blue-500 transition-all">
                  <option value="Sell">For Sell</option>
                  <option value="Rent">For Rent</option>
                  <option value="Lease">For Lease</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Price (INR)</label>
                <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full border-2 border-gray-100 p-4 rounded-xl font-bold bg-gray-50/30 text-gray-800 placeholder-gray-400 outline-none focus:border-blue-500 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Carpet Area</label>
                <input type="text" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full border-2 border-gray-100 p-4 rounded-xl font-bold bg-gray-50/30 text-gray-800 placeholder-gray-400 outline-none focus:border-blue-500 transition-all" />
              </div>
            </div>
          </section>

          {/* Location */}
          <section>
            <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
              <span className="bg-teal-50 text-teal-500 p-2 rounded-xl text-sm">02</span>
              Location Intelligence
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">City / Region</label>
                <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full border-2 border-gray-100 p-4 rounded-xl font-bold bg-gray-50/30 text-gray-800 placeholder-gray-400 outline-none focus:border-blue-500 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Street Address</label>
                <textarea rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full border-2 border-gray-100 p-4 rounded-xl font-bold bg-gray-50/30 text-gray-800 placeholder-gray-400 outline-none focus:border-blue-500 transition-all"></textarea>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Google Maps Link</label>
                <input type="text" value={formData.map_url} onChange={e => setFormData({...formData, map_url: e.target.value})} className="w-full border-2 border-gray-100 p-4 rounded-xl font-bold bg-gray-50/30 text-gray-800 placeholder-gray-400 outline-none focus:border-blue-500 transition-all" />
                
                {embedUrl && (
                  <div className="mt-4 rounded-2xl overflow-hidden border-4 border-gray-50 shadow-inner h-64 bg-gray-100">
                    <iframe width="100%" height="100%" loading="lazy" src={embedUrl} className="border-0"></iframe>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Media Section */}
          <section>
            <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
              <span className="bg-orange-50 text-orange-500 p-2 rounded-xl text-sm">03</span>
              Universal Media Assets
            </h3>
            
            <div className="mb-10">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Existing Media Control</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {existingMedia.map(m => (
                  <div key={m.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
                    {m.media_type === 'video' ? (
                      <div className="text-center">
                        <span className="text-2xl">📽️</span>
                        <p className="text-[8px] font-black text-gray-400 uppercase mt-1">Video</p>
                      </div>
                    ) : m.media_type === 'map' ? (
                       <div className="text-center">
                        <span className="text-2xl">🗺️</span>
                        <p className="text-[8px] font-black text-gray-400 uppercase mt-1">Map</p>
                      </div>
                    ) : (
                      <img src={m.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    )}
                    <button 
                      type="button"
                      onClick={() => deleteMedia(m.id)}
                      className="absolute inset-0 bg-red-600/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-black uppercase tracking-widest"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* New Uploads List */}
            {(newFiles.photos.length > 0 || newFiles.map || newFiles.video) && (
               <div className="mb-10 p-6 bg-teal-50 border border-teal-100 rounded-4xl animate-in fade-in zoom-in duration-300">
                  <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-4">Pending New Uploads</p>
                  <div className="flex flex-wrap gap-3">
                     {newFiles.photos.map((f, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white border border-teal-200 pl-4 pr-1 py-1 rounded-full shadow-sm">
                           <span className="text-[10px] font-black text-teal-700 truncate max-w-[150px]">{f.name}</span>
                           <button type="button" onClick={() => removeNewFile('photos', i)} className="p-1 px-2.5 rounded-full bg-teal-50 text-teal-600 hover:bg-black hover:text-white transition-all text-[10px] font-black leading-none">×</button>
                        </div>
                     ))}
                     {newFiles.map && (
                        <div className="flex items-center gap-3 bg-white border border-yellow-200 pl-4 pr-1 py-1 rounded-full shadow-sm">
                           <span className="text-[10px] font-black text-yellow-700 truncate max-w-[150px]">Map: {newFiles.map.name}</span>
                           <button type="button" onClick={() => removeNewFile('map')} className="p-1 px-2.5 rounded-full bg-yellow-50 text-yellow-600 hover:bg-black hover:text-white transition-all text-[10px] font-black leading-none">×</button>
                        </div>
                     )}
                     {newFiles.video && (
                        <div className="flex items-center gap-3 bg-white border border-purple-200 pl-4 pr-1 py-1 rounded-full shadow-sm">
                           <span className="text-[10px] font-black text-purple-700 truncate max-w-[150px]">Vid: {newFiles.video.name}</span>
                           <button type="button" onClick={() => removeNewFile('video')} className="p-1 px-2.5 rounded-full bg-purple-50 text-purple-600 hover:bg-black hover:text-white transition-all text-[10px] font-black leading-none">×</button>
                        </div>
                     )}
                  </div>
               </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 border-2 border-dashed border-gray-100 rounded-4xl bg-gray-50/30 flex flex-col items-center text-center">
                <span className="text-2xl mb-2">📸</span>
                <label className="block text-[10px] font-black text-[#00579e] uppercase tracking-widest mb-4">Add Photos</label>
                <input type="file" multiple accept="image/*" onChange={e => setNewFiles({...newFiles, photos: [...newFiles.photos, ...Array.from(e.target.files || [])]})} className="text-[10px] w-full file:mr-0 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer" />
              </div>

              <div className="p-6 border-2 border-dashed border-gray-100 rounded-4xl bg-gray-50/30 flex flex-col items-center text-center">
                <span className="text-2xl mb-2">📍</span>
                <label className="block text-[10px] font-black text-[#00579e] uppercase tracking-widest mb-4">Update Map Photo</label>
                <input type="file" accept="image/*" onChange={e => setNewFiles({...newFiles, map: e.target.files?.[0] || null})} className="text-[10px] w-full file:mr-0 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-teal-100 file:text-teal-700 hover:file:bg-teal-200 cursor-pointer" />
              </div>

              <div className="p-6 border-2 border-dashed border-gray-100 rounded-4xl bg-gray-50/30 flex flex-col items-center text-center">
                <span className="text-2xl mb-2">🎞️</span>
                <label className="block text-[10px] font-black text-[#00579e] uppercase tracking-widest mb-4">Update Video</label>
                <input type="file" accept="video/*" onChange={e => setNewFiles({...newFiles, video: e.target.files?.[0] || null})} className="text-[10px] w-full file:mr-0 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer" />
              </div>
            </div>
          </section>

          <div className="pt-10 flex flex-col md:flex-row gap-4 border-t border-gray-100">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-teal-500 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl shadow-teal-500/20 hover:bg-teal-600 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Syncing Assets...' : 'Finalize & Update'}
            </button>
            <button 
              type="button" 
              onClick={() => router.push('/agent')}
              className="px-10 border-2 border-gray-100 text-gray-400 py-5 rounded-3xl font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
            >
              Cancel Edit
            </button>
          </div>
          
          <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100/50 flex items-start gap-4">
             <span className="text-xl">⚠️</span>
             <p className="text-[9px] text-orange-700 font-black leading-relaxed uppercase tracking-widest">
                Security Alert: This action will freeze your listing in the public domain. Our moderation team will re-validate all media and data points before reactivating your listing.
             </p>
          </div>
        </form>
      </div>
    </div>
  );
}
