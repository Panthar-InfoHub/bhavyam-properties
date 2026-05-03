'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';

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
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  
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

         const { data } = await supabase
            .from('agent_applications')
            .select('status, notes, full_name, email, phone, experience, reason, skills')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

         if (data) {
            setHasApplied(true);
            setAppStatus(data.status);
            if (data.full_name) setFullName(data.full_name);
            if (data.email) setEmail(data.email);
            if (data.phone) setPhone(data.phone);
            if (data.experience) setExperience(data.experience);
            if (data.reason || data.notes) setReason(data.reason || data.notes);
            if (data.skills) setSkills(Array.isArray(data.skills) ? data.skills : []);
         }
       }
       setIsLoading(false);
    };
    checkState();
  }, [router]);

  const handleSkillChange = (skill: string) => {
    setSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const uploadFile = async (file: File, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUser.id}/${folder}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const { data, error } = await supabase.storage.from('agent-docs').upload(fileName, file);
    if (error) throw error;
    
    // Create a signed URL valid for 10 years instead of a public URL
    const { data: signedData, error: signError } = await supabase.storage.from('agent-docs').createSignedUrl(data.path, 60 * 60 * 24 * 365 * 10);
    if (signError) throw signError;
    
    return signedData.signedUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!aadhaarFile) {
        toast.error("Aadhaar Card is compulsory for registration.");
        return;
      }

      setIsSubmitting(true);
      try {
        if (!currentUser) {
          toast.error("Please login first to submit an application.");
          router.push('/login?redirect=/user/apply-agent');
          return;
        }

        // Upload documents
        let aadhaarUrl = '';
        let panUrl = '';
        let certUrl = '';
        let resumeUrl = '';

        toast.loading("Uploading documents...", { id: 'uploading' });
        
        aadhaarUrl = await uploadFile(aadhaarFile, 'aadhaar');
        if (panFile) panUrl = await uploadFile(panFile, 'pan');
        if (certificateFile) certUrl = await uploadFile(certificateFile, 'certificate');
        if (resume) resumeUrl = await uploadFile(resume, 'resume');

        toast.dismiss('uploading');

        const generatedNotes = `Full Name: ${fullName}
Email: ${email}
Phone Number: ${phone}
Experience: ${experience}
Reason for Joining Us: ${reason}
Skills: ${skills.length > 0 ? skills.join(', ') : 'None'}`;

        // Delete any existing pending application to avoid duplicates when updating
        if (appStatus === 'pending') {
          await supabase
            .from('agent_applications')
            .delete()
            .eq('user_id', currentUser.id)
            .eq('status', 'pending');
        }

        const { error } = await supabase.from('agent_applications').insert([
           { 
             user_id: currentUser.id, 
             notes: reason, // Store only the reason in notes or keep reason separate
             full_name: fullName,
             email: email,
             phone: phone,
             experience: experience,
             reason: reason,
             skills: skills,
             aadhaar_url: aadhaarUrl,
             pan_url: panUrl,
             certificate_url: certUrl,
             resume_url: resumeUrl
           }
        ]);

        if (error) throw error;
        
        toast.success("Application submitted successfully!");
        setHasApplied(true);
        setAppStatus('pending');
        setShowPopup(false);
        
      } catch (err: any) {
         toast.dismiss('uploading');
         console.error("Error applying:", err);
         alert("Error applying: " + err.message);
      } finally {
         setIsSubmitting(false);
      }
  };

  const handleRemoveApplication = async () => {
    if (!confirm("Are you sure you want to withdraw your pending application?")) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('agent_applications')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('status', 'pending');
        
      if (error) throw error;
      
      toast.success("Application withdrawn successfully.");
      setHasApplied(false);
      setAppStatus(null);
    } catch (err: any) {
      toast.error("Error withdrawing application: " + err.message);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
         <div className="w-12 h-12 border-4 border-[#00c69d] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-[#fbfcfa] min-h-screen">
      
      {/* Hero Section */}
      <section className="relative h-[450px] overflow-hidden">
         <Image 
            src="/agent_recruitment_hero.png" 
            alt="Agent Career" 
            fill 
            className="object-cover brightness-[0.4]"
            priority
         />
         <div className="absolute inset-0 bg-linear-to-r from-[#112743]/90 to-transparent z-10"></div>
         <div className="max-w-7xl mx-auto px-6 h-full flex flex-col justify-center relative z-20">
            <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-widest mb-6">
               <span>Dashboard</span>
               <span className="opacity-50">/</span>
               <span className="text-[#00ecbd]">Become an Agent</span>
            </div>
            <h1 className="text-white text-4xl md:text-6xl font-black tracking-tighter mb-4 animate-in fade-in slide-in-from-left-8 duration-700">
               Join the <span className="text-[#00ecbd]">Elite</span> <br/>Real Estate Team
            </h1>
            <p className="text-white/80 text-base md:text-lg max-w-xl font-medium leading-relaxed mb-8 animate-in fade-in slide-in-from-left-10 duration-1000">
               Become a verified partner at Bhavyam Properties. Speed up your sales, build trust, and gain access to exclusive leads and management tools.
            </p>
         </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-30 pb-24">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Action Column */}
            <div className="lg:col-span-8 flex flex-col gap-8">
               
               {/* Main Application Entry */}
               <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">
                  <div className="md:w-[45%] bg-[#112743] p-10 flex flex-col justify-center text-white">
                     <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center text-3xl mb-6 shadow-inner">🤝</div>
                     <h2 className="text-3xl font-black mb-4 leading-tight">Apply for <br/>Agent Verification</h2>
                     <p className="text-white/60 text-sm font-medium leading-relaxed mb-8">
                        Our verified agents close properties 3x faster than standard users. Start your journey today.
                     </p>
                     
                     <div className="space-y-4">
                        {[
                          "Verified 'Agent' Badge",
                          "Priority Listing Visibility",
                          "Dedicated Support Line",
                          "Advanced Analytics Dashboard"
                        ].map(benefit => (
                          <div key={benefit} className="flex items-center gap-3 text-xs font-bold uppercase tracking-wide">
                             <div className="w-4 h-4 bg-[#00ecbd] rounded-sm flex items-center justify-center text-[#112743]">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7"/></svg>
                             </div>
                             {benefit}
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="flex-1 p-10 flex flex-col justify-center items-center text-center">
                     {hasApplied ? (
                        <div className="w-full">
                           <div className={`p-8 rounded-2xl border-2 mb-6 ${appStatus === 'pending' ? 'bg-yellow-50 border-yellow-100' : appStatus === 'rejected' ? 'bg-red-50 border-red-100' : 'bg-teal-50 border-teal-100'}`}>
                              <div className="text-4xl mb-4">
                                {appStatus === 'pending' ? '⏳' : appStatus === 'rejected' ? (
                                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto border-2 border-red-200">
                                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12"/></svg>
                                  </div>
                                ) : '✅'}
                              </div>
                              <h3 className={`text-2xl font-black mb-2 tracking-tight ${appStatus === 'pending' ? 'text-yellow-700' : appStatus === 'rejected' ? 'text-red-700' : 'text-teal-700'}`}>
                                 {appStatus === 'pending' ? 'Application Under Review' : appStatus === 'rejected' ? 'Application Rejected' : 'Verification Success'}
                              </h3>
                              <p className={`text-sm font-medium ${appStatus === 'pending' ? 'text-yellow-600' : appStatus === 'rejected' ? 'text-red-600' : 'text-teal-600'}`}>
                                 {appStatus === 'pending' 
                                    ? "We've received your application! Our team typically reviews submissions within 24-48 business hours." 
                                    : appStatus === 'rejected'
                                    ? "Apply again to become a member of the family."
                                    : "You are already a part of our team! If you need to re-apply, please contact support."}
                              </p>
                           </div>
                           {appStatus === 'rejected' && (
                              <button onClick={() => setShowPopup(true)} className="w-full bg-[#112743] hover:bg-[#1e3a5a] text-white py-4 px-8 rounded-lg font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95">
                                 Re-Apply Now
                              </button>
                           )}
                           {appStatus === 'pending' && (
                              <div className="flex flex-col gap-3">
                                <button onClick={() => setShowPopup(true)} className="w-full bg-[#112743] hover:bg-[#1e3a5a] text-white py-4 px-8 rounded-lg font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95">
                                   Update Application
                                </button>
                                <button onClick={handleRemoveApplication} disabled={isSubmitting} className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-3 px-8 rounded-lg font-black text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50">
                                   Withdraw Application
                                </button>
                              </div>
                           )}
                        </div>
                     ) : (
                        <>
                           <h3 className="text-2xl font-black text-gray-800 mb-2 tracking-tight">Ready to Level Up?</h3>
                           <p className="text-gray-400 text-sm font-medium mb-8 max-w-sm mx-auto">
                              Click the button below to fill out your details and upload required documentation.
                           </p>
                           <button 
                              onClick={() => setShowPopup(true)} 
                              className="bg-[#112743] hover:bg-[#1e3a5a] text-white py-5 px-12 rounded-lg font-black text-sm uppercase tracking-widest transition-all shadow-[0_15px_30px_rgba(17,39,67,0.2)] hover:shadow-[0_20px_40px_rgba(17,39,67,0.3)] active:scale-95 group"
                           >
                              Join Now <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
                           </button>
                        </>
                     )}
                  </div>
               </div>

               {/* Features / Requirements Info */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 group hover:border-[#00ecbd]/30 transition-all">
                     <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-[#00c69d] text-2xl mb-6 group-hover:scale-110 transition-transform">📄</div>
                     <h3 className="text-xl font-bold text-gray-800 mb-3 tracking-tight">Required Documents</h3>
                     <ul className="text-sm text-gray-500 font-medium space-y-3">
                        <li className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-[#00c69d]"></div>
                           Aadhaar Card (Compulsory)
                        </li>
                        <li className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                           PAN Card (Highly Recommended)
                        </li>
                        <li className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                           Agent/RERA Certificate (Optional)
                        </li>
                     </ul>
                  </div>

                  <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 group hover:border-blue-500/30 transition-all">
                     <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 text-2xl mb-6 group-hover:scale-110 transition-transform">✅</div>
                     <h3 className="text-xl font-bold text-gray-800 mb-3 tracking-tight">Trust & Verification</h3>
                     <p className="text-sm text-gray-500 font-medium leading-relaxed">
                        We verify every agent to maintain platform integrity. This process helps us ensure that buyers interact with only the most professional partners.
                     </p>
                  </div>
               </div>
            </div>

            {/* Right Info Column */}
            <div className="lg:col-span-4 flex flex-col gap-6">
               <div className="bg-linear-to-br from-[#112743] to-[#1e3a5a] p-10 rounded-3xl shadow-2xl text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                  <h3 className="text-2xl font-black mb-6 leading-tight">Need Help?</h3>
                  <p className="text-white/60 text-sm font-medium mb-8 leading-relaxed">
                     Have questions about the application process or documentation? Our agent support team is here to guide you.
                  </p>
                  <a href="mailto:info@bhavyamproperties.in" className="inline-block bg-white text-[#112743] py-4 px-8 rounded-lg font-black text-sm uppercase tracking-widest shadow-lg hover:shadow-xl transition-all active:scale-95">
                     Contact Support
                  </a>
               </div>

               <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 border-b border-gray-100 pb-4">Our Statistics</p>
                  <div className="space-y-6">
                     {[
                        { label: 'Verified Agents', value: '50+', color: 'text-teal-500' },
                        { label: 'Cities Covered', value: '12+', color: 'text-blue-500' },
                        { label: 'Daily Leads', value: '200+', color: 'text-[#00ecbd]' }
                     ].map(stat => (
                        <div key={stat.label}>
                           <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                           <p className="text-xs font-bold text-gray-500 uppercase tracking-tight">{stat.label}</p>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

         </div>
      </div>

      {/* MODAL / POPUP FORM */}
      {showPopup && (
         <div className="fixed inset-0 z-[100] pt-24 pb-8 overflow-y-auto bg-[#112743]/90 flex justify-center items-start backdrop-blur-md animate-in fade-in duration-300">
             <div className="bg-white w-full max-w-4xl rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.4)] relative flex flex-col mb-12 mx-4 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
                 
                 {/* Modal Header */}
                 <div className="bg-[#112743] p-10 relative">
                    <button onClick={() => setShowPopup(false)} className="absolute top-6 right-6 text-white/50 hover:text-white p-2 transition-colors cursor-pointer bg-white/10 rounded-full">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                    <h2 className="text-4xl font-black text-white tracking-tighter mb-2">Agent Registration</h2>
                    <p className="text-white/60 text-sm font-medium max-w-2xl">
                        Take the first step towards a professional career with Bhavyam Properties. All fields marked with (*) are mandatory.
                    </p>
                 </div>

                 <form onSubmit={handleSubmit} className="p-10 flex flex-col gap-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div>
                             <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Full Name <span className="text-red-500">*</span></label>
                             <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-gray-50 border-none text-gray-800 p-4 outline-none focus:ring-2 focus:ring-teal-500/20 rounded-xl font-bold transition-all" placeholder="John Doe" />
                         </div>
                         <div>
                             <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Email Address <span className="text-red-500">*</span></label>
                             <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-50 border-none text-gray-800 p-4 outline-none focus:ring-2 focus:ring-teal-500/20 rounded-xl font-bold transition-all" placeholder="john@example.com" />
                         </div>
                         <div>
                             <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Phone Number <span className="text-red-500">*</span></label>
                             <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-gray-50 border-none text-gray-800 p-4 outline-none focus:ring-2 focus:ring-teal-500/20 rounded-xl font-bold transition-all" placeholder="+91 0000000000" />
                         </div>
                         <div>
                             <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Professional Experience <span className="text-red-500">*</span></label>
                             <select value={experience} onChange={e => setExperience(e.target.value)} className="w-full bg-gray-50 border-none text-gray-800 p-4 outline-none focus:ring-2 focus:ring-teal-500/20 rounded-xl font-bold transition-all cursor-pointer">
                                 <option>Fresher</option>
                                 <option>1-3 years</option>
                                 <option>3-5 years</option>
                                 <option>5+ years</option>
                             </select>
                         </div>
                     </div>

                     <div>
                         <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Reason for Joining Us <span className="text-red-500">*</span></label>
                         <textarea required value={reason} onChange={e => setReason(e.target.value)} className="w-full bg-gray-50 border-none text-gray-800 p-4 outline-none focus:ring-2 focus:ring-teal-500/20 rounded-xl font-bold transition-all min-h-[120px] resize-none" placeholder="Briefly describe your motivation..."></textarea>
                     </div>

                     <div>
                         <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4">Select your core skills</label>
                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                             {skillOptions.map(skill => (
                                 <label key={skill} className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border-2 ${skills.includes(skill) ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'}`}>
                                     <input type="checkbox" checked={skills.includes(skill)} onChange={() => handleSkillChange(skill)} className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-0" />
                                     <span className="text-xs font-black uppercase tracking-tight">{skill}</span>
                                 </label>
                             ))}
                         </div>
                     </div>

                      <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 text-xl">ℹ️</div>
                          <p className="text-blue-700 text-sm font-bold leading-relaxed">
                              Submitting a PAN card or Professional Certificate significantly increases your verification priority.
                          </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 pt-8">
                          <div>
                              <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">Aadhaar Card (PDF/Image) <span className="text-red-500">*</span></label>
                              <input type="file" required onChange={e => setAadhaarFile(e.target.files?.[0] || null)} className="w-full text-xs font-bold text-gray-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-none file:bg-[#112743] file:text-white file:font-black file:uppercase file:tracking-widest hover:file:bg-[#1e3a5a] transition-all cursor-pointer" />
                          </div>
                          <div>
                              <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">PAN Card (Optional)</label>
                              <input type="file" onChange={e => setPanFile(e.target.files?.[0] || null)} className="w-full text-xs font-bold text-gray-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-none file:bg-gray-100 file:text-gray-700 file:font-black file:uppercase file:tracking-widest hover:file:bg-gray-200 transition-all cursor-pointer" />
                          </div>
                          <div>
                              <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">RERA / Agent Certificate (Optional)</label>
                              <input type="file" onChange={e => setCertificateFile(e.target.files?.[0] || null)} className="w-full text-xs font-bold text-gray-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-none file:bg-gray-100 file:text-gray-700 file:font-black file:uppercase file:tracking-widest hover:file:bg-gray-200 transition-all cursor-pointer" />
                          </div>
                          <div>
                              <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">Resume / Cover Letter <span className="text-red-500">*</span></label>
                              <input type="file" required onChange={e => setResume(e.target.files?.[0] || null)} className="w-full text-xs font-bold text-gray-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-none file:bg-[#112743] file:text-white file:font-black file:uppercase file:tracking-widest hover:file:bg-[#1e3a5a] transition-all cursor-pointer" />
                          </div>
                      </div>

                     <div className="flex justify-center pt-4">
                         <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#00c69d] hover:bg-[#00b48f] text-white font-black py-5 px-16 rounded-xl transition-all shadow-[0_15px_30px_rgba(0,198,157,0.2)] hover:shadow-[0_20px_40px_rgba(0,198,157,0.3)] disabled:opacity-50 text-sm uppercase tracking-widest active:scale-95"
                         >
                            {isSubmitting ? 'Processing Submission...' : 'Submit Application'}
                         </button>
                     </div>
                 </form>
             </div>
         </div>
      )}
    </div>
  );
}
