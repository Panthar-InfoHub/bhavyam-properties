'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function ApplyAgentPage() {
  const [hasApplied, setHasApplied] = useState(false);
  const [appStatus, setAppStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const [currentUser, setCurrentUser] = useState<any>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [experience, setExperience] = useState('Fresher');
  const [reason, setReason] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [resume, setResume] = useState<File | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    const checkState = async () => {
       const user = await getCurrentUser();
       if (user) {
         setCurrentUser(user);
         setFullName([user.profile?.first_name, user.profile?.last_name].filter(Boolean).join(' '));
         setEmail(user.email || '');
         setPhone(user.profile?.phone_number || '');

         if (user.profile?.role === 'agent') {
           router.push('/dashboard/agent');
           return;
         }

         const { data, error } = await supabase
            .from('agent_applications')
            .select('status, notes')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

         if (data) {
            setHasApplied(true);
            setAppStatus(data.status);
         }
       }
       setIsLoading(false);
    };
    checkState();
  }, [router]);

  const handleSkillChange = (skill: string) => {
    setSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setIsSubmitting(true);
     try {
       if (!currentUser) {
         alert("Please login first to submit an application.");
         router.push('/login?redirect=/user/apply-agent');
         return;
       }

       const generatedNotes = `Full Name: ${fullName}
Email: ${email}
Phone Number: ${phone}
Experience: ${experience}
Reason for Joining Us: ${reason}
Skills: ${skills.length > 0 ? skills.join(', ') : 'None'}`;

       const { error } = await supabase.from('agent_applications').insert([
          { user_id: currentUser.id, notes: generatedNotes }
       ]);

       if (error) throw error;
       
       setHasApplied(true);
       setAppStatus('pending');
       setShowPopup(false);
       
     } catch (err: any) {
        alert("Error applying: " + err.message);
     } finally {
        setIsSubmitting(false);
     }
  };

  const skillOptions = [
    "Communication Skills",
    "Sales Skills",
    "Legal Knowledge",
    "Networking Skills",
    "Liaisoning With Property Owner",
    "Driving(Car & Bike)"
  ];

  return (
    <div className="flex-1 w-full py-10 px-4 sm:px-8 min-h-[80vh]">
      <div className="max-w-6xl mx-auto">
         <div className="text-sm text-gray-500 mb-8 font-medium">
             Home <span className="mx-2">{'>'}</span> <span className="text-[#00b48f]">Property Slider Elementor</span>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Become an Agent Card */}
            <div className="bg-[#f8f9ff] border border-blue-50 p-8 flex items-center justify-between relative overflow-hidden group">
               <div className="flex items-center gap-6 relative z-10">
                   <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-[#2563eb]">
                       <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                       <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 shadow-sm">
                           <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                       </div>
                   </div>
                   <div>
                       <h3 className="text-2xl font-bold text-[#1e3a8a] mb-2">Become an Agent</h3>
                       <p className="text-gray-500 text-sm">becoming a trusted and verified real estate agent with us.</p>
                   </div>
               </div>
               <button onClick={() => setShowPopup(true)} className="relative z-10 bg-[#3b82f6] hover:bg-blue-600 text-white px-6 py-2.5 rounded-md font-semibold text-sm transition-colors flex items-center gap-2">
                   Join Now
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M18.364 5.636l-8.485 8.485a2 2 0 01-2.828 0l-3.535-3.535M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/></svg>
               </button>
               {/* Decorative background dashed paths can go here */}
            </div>

            {/* Current Openings Card */}
            <div className="bg-[#f8f9ff] border border-blue-50 p-8 flex items-center justify-between relative overflow-hidden group">
               <div className="flex items-center gap-6 relative z-10">
                   <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-[#2563eb]">
                       <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                       <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 shadow-sm">
                           <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                       </div>
                   </div>
                   <div>
                       <h3 className="text-2xl font-bold text-[#1e3a8a] mb-2">Current Openings</h3>
                       <p className="text-gray-500 text-sm">becoming a trusted and verified real estate agent with us.</p>
                   </div>
               </div>
               <button onClick={() => alert("No current openings right now.")} className="relative z-10 bg-[#1e3a8a] hover:bg-blue-900 text-white px-6 py-2.5 rounded-md font-semibold text-sm transition-colors flex items-center gap-2">
                   Join Now
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M18.364 5.636l-8.485 8.485a2 2 0 01-2.828 0l-3.535-3.535M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/></svg>
               </button>
            </div>
         </div>

         {/* Status Message if already applied */}
         {hasApplied && (
            <div className={`mt-8 p-8 rounded-2xl shadow-sm border ${appStatus === 'pending' ? 'bg-yellow-50 border-yellow-200' : 'bg-teal-50 border-teal-200'}`}>
               <h3 className={`text-2xl font-bold mb-2 ${appStatus === 'pending' ? 'text-yellow-700' : 'text-teal-700'}`}>
                 Application {appStatus?.toUpperCase()}
               </h3>
               {appStatus === 'pending' && <p className="text-yellow-600">Your application is currently sitting in the Administration queue for review. You will be notified when it updates.</p>}
               {appStatus === 'approved' && <p className="text-teal-600">You are already approved! Refresh your browser to jump to your new dashboard.</p>}
            </div>
         )}
      </div>

      {/* POPUP FULL SCREEN (only navbar visible) */}
      {showPopup && (
         <div className="fixed inset-0 z-[60] pt-24 pb-8 overflow-y-auto bg-black/50 flex justify-center items-start">
             <div className="bg-white w-full max-w-4xl rounded-sm shadow-2xl relative flex flex-col mb-12 mx-4">
                 <button onClick={() => setShowPopup(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 transition-colors">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                 </button>

                 <div className="p-8 pb-4">
                     <h2 className="text-[26px] font-bold text-gray-800 mb-2">Agent Registration</h2>
                     <p className="text-gray-600 text-[15px] leading-relaxed mb-4">
                         Apply now to join our dynamic real estate team! Fill out this application form to share your qualifications, experience, and skills. We look forward to learning more about you and exploring how you can contribute to our success in the real estate industry.
                     </p>
                 </div>

                 <form onSubmit={handleSubmit} className="px-8 pb-8 flex flex-col gap-5">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                         <div>
                             <label className="block text-gray-500 text-[13px] font-bold mb-1">Full Name <span className="text-red-500">*</span></label>
                             <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-[#f4f4f4] text-gray-800 p-3 outline-none focus:ring-1 focus:ring-teal-500" />
                         </div>
                         <div>
                             <label className="block text-gray-500 text-[13px] font-bold mb-1">Email <span className="text-red-500">*</span></label>
                             <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#f4f4f4] text-gray-800 p-3 outline-none focus:ring-1 focus:ring-teal-500" />
                         </div>
                         <div>
                             <label className="block text-gray-500 text-[13px] font-bold mb-1">Phone Number <span className="text-red-500">*</span></label>
                             <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-[#f4f4f4] text-gray-800 p-3 outline-none focus:ring-1 focus:ring-teal-500" />
                         </div>
                         <div>
                             <label className="block text-gray-500 text-[13px] font-bold mb-1">Experience <span className="text-red-500">*</span></label>
                             <select value={experience} onChange={e => setExperience(e.target.value)} className="w-full bg-[#f4f4f4] text-gray-800 p-3 outline-none focus:ring-1 focus:ring-teal-500 appearance-none">
                                 <option>Fresher</option>
                                 <option>1-3 years</option>
                                 <option>3-5 years</option>
                                 <option>5+ years</option>
                             </select>
                         </div>
                     </div>

                     <div>
                         <label className="block text-gray-500 text-[13px] font-bold mb-1">Reason for Joining Us <span className="text-red-500">*</span></label>
                         <textarea required value={reason} onChange={e => setReason(e.target.value)} className="w-full bg-[#f4f4f4] text-gray-800 p-3 outline-none focus:ring-1 focus:ring-teal-500 min-h-[100px]"></textarea>
                     </div>

                     <div>
                         <label className="block text-gray-500 text-[13px] font-bold mb-2">Please mention your skills.</label>
                         <div className="flex flex-col gap-1.5 mb-2">
                             {skillOptions.map(skill => (
                                 <label key={skill} className="flex items-center gap-2 cursor-pointer text-gray-500 text-sm">
                                     <input type="checkbox" checked={skills.includes(skill)} onChange={() => handleSkillChange(skill)} className="w-[14px] h-[14px] rounded-sm text-gray-400 bg-white border border-gray-300 focus:ring-0" />
                                     {skill}
                                 </label>
                             ))}
                         </div>
                     </div>

                     <div>
                         <label className="block text-gray-500 text-[13px] font-bold mb-2">Submit your cover letter or resume <span className="text-red-500">*</span></label>
                         <div className="flex items-center">
                             <input type="file" required onChange={e => setResume(e.target.files?.[0] || null)} className="w-full bg-[#f4f4f4] text-gray-800 p-2.5 outline-none focus:ring-1 focus:ring-teal-500 file:mr-4 file:py-1 file:px-3 file:rounded file:border file:border-gray-300 file:text-sm file:bg-white file:text-gray-700 hover:file:bg-gray-50 cursor-pointer text-sm" />
                         </div>
                     </div>

                     <div className="flex justify-center mt-2">
                         <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#00c69d] hover:bg-[#00b48f] text-white font-medium py-2.5 px-8 rounded transition-colors shadow-sm disabled:opacity-50 text-[15px]"
                         >
                            {isSubmitting ? '...' : 'Submit'}
                         </button>
                     </div>
                 </form>
             </div>
         </div>
      )}
    </div>
  );
}
