'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowRight, Briefcase, Award, CheckCircle2, CloudUpload, X, Users, Compass, HelpCircle } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

export default function CareersPage() {
  const [activeTab, setActiveTab] = useState<'agent' | 'employee'>('agent');
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [loadingVacancies, setLoadingVacancies] = useState(true);
  const [expandedVacancy, setExpandedVacancy] = useState<string | null>(null);

  // Application Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState<any>(null); // null means General Application
  const [user, setUser] = useState<any>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [experience, setExperience] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeDragActive, setResumeDragActive] = useState(false);
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);

  useEffect(() => {
    const fetchVacanciesAndUser = async () => {
      setLoadingVacancies(true);
      try {
        // Fetch current user to prefill fields
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setFullName(`${currentUser.profile?.first_name || ''} ${currentUser.profile?.last_name || ''}`.trim());
          setEmail(currentUser.email || '');
          setPhone(currentUser.profile?.phone_number || '');
        }

        // Fetch vacancies
        const { data, error } = await supabase
          .from('job_vacancies')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setVacancies(data);
        }
      } catch (err) {
        console.warn("Job vacancies may need migration:", err);
      } finally {
        setLoadingVacancies(false);
      }
    };

    fetchVacanciesAndUser();
  }, []);

  // Drag & Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setResumeDragActive(true);
    } else if (e.type === "dragleave") {
      setResumeDragActive(false);
    }
  };

  const uploadResume = async (file: File) => {
    if (!file) return;
    // Basic file validation
    const allowedExtensions = ['pdf', 'doc', 'docx'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      toast.error("Please upload only PDF, DOC or DOCX resumes");
      return;
    }

    setIsUploadingResume(true);
    try {
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `resumes/${fileName}`;

      const { error } = await supabase.storage
        .from('property-media') // Use existing bucket
        .upload(filePath, file);

      if (error) {
        toast.error("Resume upload failed: " + error.message);
      } else {
        const { data: publicData } = supabase.storage
          .from('property-media')
          .getPublicUrl(filePath);

        setResumeUrl(publicData.publicUrl);
        toast.success("Resume uploaded successfully!");
      }
    } catch (err) {
      toast.error("Error uploading resume doc");
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResumeDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadResume(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadResume(e.target.files[0]);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !experience || !resumeUrl) {
      toast.error("Please fill out all required fields and upload your resume");
      return;
    }

    setIsSubmittingApp(true);
    try {
      const { error } = await supabase.from('job_applications').insert({
        vacancy_id: selectedVacancy ? selectedVacancy.id : null,
        full_name: fullName,
        email,
        phone,
        experience,
        cover_letter: coverLetter || null,
        resume_url: resumeUrl,
        status: 'pending'
      } as any);

      if (error) {
        toast.error("Application submission failed: " + error.message);
      } else {
        toast.success("Application submitted successfully! Our talent team will contact you shortly.");
        // Clear non-prefilled fields
        setCoverLetter('');
        setResumeUrl('');
        setIsApplyModalOpen(false);
      }
    } catch (err) {
      toast.error("Database connection failure. Please try again.");
    } finally {
      setIsSubmittingApp(false);
    }
  };

  const openApplyModal = (vacancy: any = null) => {
    setSelectedVacancy(vacancy);
    setIsApplyModalOpen(true);
  };

  return (
    <main className="bg-[#e7f2db] min-h-screen pt-28 pb-16 px-4 md:px-12 flex flex-col text-gray-800">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Header Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-8xl md:text-[140px] font-black text-[var(--color-deep-navy)] opacity-5 select-none pointer-events-none tracking-widest whitespace-nowrap">
            CAREERS
          </div>
          <p className="text-[var(--color-emerald-heritage)] font-bold text-sm tracking-[0.22em] uppercase mb-3 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-emerald-heritage)] animate-pulse" />
            Grow With Bhavyam
          </p>
          <h1 className="text-4xl md:text-6xl font-black text-[#00579e] tracking-tight mb-4">
            Build the Future of Real Estate
          </h1>
          <p className="text-gray-600 text-base md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Join a forward-thinking talent community focused on transparency, innovation, and direct professional growth.
          </p>
        </div>

        {/* Culture & Values Spotlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            {
              icon: <Compass className="w-8 h-8 text-teal-600" />,
              title: "Trust & Transparency",
              desc: "We stand for authentic, direct relationships. No hidden barriers, no legacy complexities. Only true value."
            },
            {
              icon: <Award className="w-8 h-8 text-emerald-600" />,
              title: "Innovation First",
              desc: "We build systems and structures for modern real estate, utilizing cutting edge search tech, RLS architecture, and micro-flows."
            },
            {
              icon: <Users className="w-8 h-8 text-blue-600" />,
              title: "Direct Growth",
              desc: "Grow your pathway on your own terms. We support individual ownership and empower teams with active, real-time leads."
            }
          ].map((val, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col items-start text-left">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100">
                {val.icon}
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3">{val.title}</h3>
              <p className="text-gray-500 font-medium text-sm leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>

        {/* Options Portal Navigation */}
        <div className="flex bg-white/70 backdrop-blur rounded-full p-2 border border-gray-100 max-w-lg mx-auto mb-12 shadow-sm shrink-0">
          <button
            onClick={() => setActiveTab('agent')}
            className={`flex-1 py-4 text-sm font-black uppercase tracking-wider rounded-full transition-all cursor-pointer ${
              activeTab === 'agent' 
                ? 'bg-[#00579e] text-white shadow-md' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🤝 Partner Agent
          </button>
          <button
            onClick={() => setActiveTab('employee')}
            className={`flex-1 py-4 text-sm font-black uppercase tracking-wider rounded-full transition-all cursor-pointer ${
              activeTab === 'employee' 
                ? 'bg-[#00579e] text-white shadow-md' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🏢 Employee Vacancies
          </button>
        </div>

        {/* Tab 1 Content: Partner & Agent benefits */}
        {activeTab === 'agent' && (
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-[10px] font-black text-[var(--color-emerald-heritage)] uppercase tracking-[0.2em] mb-2 block">Onboard Program</span>
                <h2 className="text-3xl md:text-4xl font-black text-gray-950 leading-tight mb-6">
                  Join Bhavyam as a Verified Partner Agent
                </h2>
                <p className="text-gray-600 text-base leading-relaxed mb-8 font-medium">
                  We empower independent real estate agents with verified client leads, advanced transaction tracking, custom credit rewards, and a high-exposure brand trust badge.
                </p>
                
                <div className="space-y-4 mb-10">
                  {[
                    "Get premium Verified Agent badge to showcase trust",
                    "Direct real-time buyer lead notifications",
                    "List and highlight properties with low transaction fees",
                    "Unfettered access to credit wallet and platform tool suite"
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm font-bold text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-[#00b48f] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/user/apply-agent"
                  className="inline-flex items-center gap-3 bg-[var(--color-emerald-heritage)] hover:bg-[#112743] text-white font-bold px-10 py-5 rounded-full shadow-lg shadow-[#006B54]/15 transition-all uppercase tracking-wider text-xs cursor-pointer group"
                >
                  <span>Apply as Agent</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Graphical Showcase Card */}
              <div className="bg-[#fbfcfa] rounded-3xl p-8 border border-gray-100 shadow-inner flex flex-col gap-6 justify-center min-h-[350px]">
                <div className="text-center space-y-3">
                  <span className="text-5xl">🎖️</span>
                  <h3 className="text-2xl font-black text-gray-900">Bhavyam Broker Premium</h3>
                  <p className="text-gray-500 text-sm max-w-sm mx-auto font-medium">Earn high authority rankings and verified badge listing. Unlock maximum conversion rates.</p>
                </div>
                <div className="border-t border-dashed border-gray-200 pt-6 flex justify-around text-center">
                  <div>
                    <p className="text-3xl font-black text-[#00579e]">100%</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Verified Leads</p>
                  </div>
                  <div className="border-l border-gray-100" />
                  <div>
                    <p className="text-3xl font-black text-[#00b48f]">5.0★</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Client Trust</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2 Content: Employee vacancies */}
        {activeTab === 'employee' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
            {loadingVacancies ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-white h-24 rounded-2xl animate-pulse border border-gray-100" />
                ))}
              </div>
            ) : vacancies.length === 0 ? (
              <div className="bg-white rounded-[32px] p-12 text-center border border-gray-100 shadow-md max-w-3xl mx-auto flex flex-col items-center gap-4">
                <span className="text-5xl">🏢</span>
                <h3 className="text-2xl font-black text-gray-800">No Current Openings</h3>
                <p className="text-gray-500 max-w-md mx-auto font-medium">
                  We don't have any specific active roles posted right now, but we are always eager to meet talent! Submit a General Application below and we will review your profile.
                </p>
                <button
                  onClick={() => openApplyModal(null)}
                  className="bg-[#00579e] hover:bg-[#112743] text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-all uppercase tracking-wider text-xs cursor-pointer mt-2"
                >
                  Submit General Application
                </button>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto flex flex-col gap-5">
                <h2 className="text-xs font-black uppercase text-gray-400 tracking-widest px-2 mb-2">Live Job Vacancies ({vacancies.length})</h2>
                {vacancies.map((vac) => {
                  const isExpanded = expandedVacancy === vac.id;
                  return (
                    <div 
                      key={vac.id}
                      className={`bg-white rounded-3xl border shadow-sm transition-all overflow-hidden ${
                        isExpanded ? 'border-teal-100 shadow-md' : 'border-gray-100 hover:border-teal-50/50 hover:shadow'
                      }`}
                    >
                      {/* Summary Block */}
                      <div 
                        onClick={() => setExpandedVacancy(isExpanded ? null : vac.id)}
                        className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 shrink-0">
                            <Briefcase className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{vac.role}</h3>
                            <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-wider">
                              Exp: {vac.min_experience} &nbsp;·&nbsp; Last Date: {new Date(vac.last_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <button
                          className={`text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-full border transition-all shrink-0 ${
                            isExpanded 
                              ? 'bg-gray-100 text-gray-600 border-gray-200' 
                              : 'bg-teal-50 text-teal-600 border-teal-100 hover:bg-teal-600 hover:text-white'
                          }`}
                        >
                          {isExpanded ? 'Collapse Details' : 'View Details'}
                        </button>
                      </div>

                      {/* Expandable Body */}
                      {isExpanded && (
                        <div className="px-6 md:px-8 pb-8 border-t border-gray-50 pt-6 space-y-6 animate-in fade-in duration-300">
                          <div>
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Job Description & Requirements</h4>
                            <p className="text-sm text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">
                              {vac.description}
                            </p>
                          </div>

                          <div className="pt-6 border-t border-gray-100 flex flex-wrap justify-between items-center gap-4">
                            <span className="text-xs text-red-500 font-bold">
                              ⏳ Application Deadline: {new Date(vac.last_date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                            <button
                              onClick={() => openApplyModal(vac)}
                              className="bg-[var(--color-emerald-heritage)] hover:bg-[#112743] text-white font-black text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-md cursor-pointer transition-all"
                            >
                              Apply For This Role
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* General Application Banner */}
                <div className="bg-[#fbfcfa]/60 rounded-3xl p-6 border border-dashed border-gray-300 text-center mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-left">
                    <h4 className="font-bold text-gray-800 text-base">Don't see your profile listed above?</h4>
                    <p className="text-xs text-gray-500 font-medium">Submit a spontaneous general application and we will keep you in our talent records!</p>
                  </div>
                  <button
                    onClick={() => openApplyModal(null)}
                    className="bg-[#00579e] hover:bg-[#112743] text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl shadow transition-all cursor-pointer whitespace-nowrap"
                  >
                    Submit Spontaneous App
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* JOB APPLICATION MODAL OVERLAY */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            onClick={() => setIsApplyModalOpen(false)}
            className="absolute inset-0 bg-[#112743]/80 backdrop-blur-sm animate-in fade-in duration-300"
          />

          {/* Form Content */}
          <div className="relative bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 z-10 flex flex-col text-left">
            <button
              onClick={() => setIsApplyModalOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:text-black transition-colors cursor-pointer z-20"
            >
              ✕
            </button>

            {/* Header banner */}
            <div className="bg-[#00579e] p-6 text-white pb-8 shrink-0 relative overflow-hidden">
              <div className="absolute top-[-10%] right-[-10%] opacity-15">
                <Briefcase className="w-32 h-32" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-teal-300 mb-1">Talent Application</p>
              <h2 className="text-2xl font-black">
                {selectedVacancy ? `Apply for: ${selectedVacancy.role}` : 'General Application'}
              </h2>
              {selectedVacancy && (
                <p className="text-xs text-blue-100 mt-1 uppercase font-bold tracking-wider">Required Exp: {selectedVacancy.min_experience}</p>
              )}
            </div>

            {/* Form Scroll Container */}
            <form onSubmit={handleApplySubmit} className="p-6 overflow-y-auto max-h-[70vh] space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 text-gray-800 font-semibold"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 text-gray-800 font-semibold"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 text-gray-800 font-semibold"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Years of Experience *</label>
                  <input
                    type="text"
                    required
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 text-gray-800 font-semibold"
                    placeholder="e.g. 4 Years"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Describe your profile / Cover Note</label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 text-gray-700 font-medium resize-none"
                  placeholder="Share a short summary of your background, why you'd like to join us, or specify the role you are aiming for if self-applying..."
                  rows={3}
                />
              </div>

              {/* Resume Drag & Drop Uploader */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Resume Document *</label>
                
                {resumeUrl ? (
                  <div className="relative w-full bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-center justify-between shadow-inner animate-in fade-in duration-200">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📄</span>
                      <div>
                        <p className="text-xs font-black text-teal-800 uppercase tracking-wider">Resume Attached</p>
                        <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-600 hover:underline font-bold break-all">
                          Click to View Resume Document
                        </a>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setResumeUrl('')}
                      className="bg-red-50 text-red-500 border border-red-200 hover:bg-red-500 hover:text-white rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('resume-file-input')?.click()}
                    className={`w-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300 ${
                      resumeDragActive
                        ? 'border-[#00b48f] bg-teal-50/50 scale-[1.01]'
                        : 'border-gray-200 hover:border-[#00b48f] hover:bg-teal-50/10'
                    }`}
                  >
                    <input
                      id="resume-file-input"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {isUploadingResume ? (
                      <div className="flex flex-col items-center gap-2">
                        <span className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></span>
                        <span className="text-xs font-bold text-teal-600">Uploading Resume...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <CloudUpload className={`w-8 h-8 mb-2 ${resumeDragActive ? 'text-[#00b48f]' : 'text-gray-400'}`} />
                        <p className="text-xs font-black text-gray-700 uppercase tracking-wider mb-1">Drag & Drop Resume PDF Here</p>
                        <p className="text-[10px] text-gray-400 font-bold">Or click to browse (PDF, DOC, DOCX up to 5MB)</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <button
                type="submit"
                disabled={isSubmittingApp || isUploadingResume}
                className="w-full bg-[#00579e] hover:bg-[#1a3a61] text-white text-xs font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-blue-500/10 transition-all active:scale-95 disabled:opacity-50 mt-4 cursor-pointer text-center"
              >
                {isSubmittingApp ? 'Submitting Application...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
