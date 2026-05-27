'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/lib/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import PremiumLoader from '@/components/ui/PremiumLoader';
import ServiceRequestsSection from '@/components/dashboard/ServiceRequestsSection';
import { RefreshCw, Briefcase } from 'lucide-react';
import VerificationManager from '@/components/admin/VerificationManager';

type Section = 'overview' | 'properties' | 'pending_properties' | 'users' | 'transactions' | 'interests' | 'service_requests' | 'reviews' | 'agents' | 'agents_list' | 'plans' | 'verifications' | 'loan_inquiries' | 'announcements' | 'careers' | 'platform_fees';

function AdminDashboardContent() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [section, setSection] = useState<Section>('overview');
  const [stats, setStats] = useState({ listings: 0, users: 0, revenue: 0, pending: 0, pendingAgents: 0 });
  const [properties, setProperties] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [agentApps, setAgentApps] = useState<any[]>([]);
  const [selectedAgentApp, setSelectedAgentApp] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loanInquiries, setLoanInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);

  // Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All'); 
  const [sortBy, setSortBy] = useState('Time'); 
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  // Users Section State
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSortBy, setUserSortBy] = useState('Newest');

  // Agent Apps Section State
  const [agentAppSearchQuery, setAgentAppSearchQuery] = useState('');
  const [agentAppSortBy, setAgentAppSortBy] = useState('Newest');

  // Active Agents Section State
  const [activeAgentSearchQuery, setActiveAgentSearchQuery] = useState('');
  const [activeAgentSortBy, setActiveAgentSortBy] = useState('Newest');

  // Create Plan State
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [newPlan, setNewPlan] = useState<any>({
    name: '',
    description: '',
    price: '',
    duration_days: '',
    type: 'subscription',
    features: [],
    credits_awarded: 0
  });
  const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isCreatingAnn, setIsCreatingAnn] = useState(false);
  const [newAnn, setNewAnn] = useState<any>({
    title: '',
    message: '',
    image_url: '',
    url: ''
  });
  const [isSubmittingAnn, setIsSubmittingAnn] = useState(false);
  const [annUploading, setAnnUploading] = useState(false);
  const [annDragActive, setAnnDragActive] = useState(false);

  // Careers States
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [jobApplications, setJobApplications] = useState<any[]>([]);
  const [isCreatingVacancy, setIsCreatingVacancy] = useState(false);
  const [isSubmittingVacancy, setIsSubmittingVacancy] = useState(false);
  const [newVacancy, setNewVacancy] = useState<any>({
    role: '',
    min_experience: '',
    description: '',
    last_date: ''
  });
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [careerFilterRole, setCareerFilterRole] = useState('all');
  const [careerFilterStatus, setCareerFilterStatus] = useState('all');

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const s = searchParams.get('section');
    if (s) setSection(s as Section);
  }, [searchParams]);

  const filteredAndSortedProperties = properties
     .filter(p => filterType === 'All' || p.listing_type?.toLowerCase() === filterType.toLowerCase())
     .filter(p => {
        if (!searchQuery) return true;
        const s = searchQuery.toLowerCase();
        return p.property_type?.toLowerCase().includes(s) || p.city?.toLowerCase().includes(s);
     })
     .sort((a, b) => {
        if (sortBy === 'PriceDesc') {
           return (b.price || 0) - (a.price || 0);
        }
        if (sortBy === 'PriceAsc') {
           return (a.price || 0) - (b.price || 0);
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
     });

  const fetchData = async (showToast = false) => {
    if (showToast) setIsRefreshing(true);
    const user = await getCurrentUser();
    if (!user || user.profile?.role !== 'admin') { router.push('/dashboard'); return; }

    // Parallel fetch everything needed
    const [
      { data: props },
      { data: allUsers },
      { data: pays },
      { data: ints },
      { data: srvReqs },
      { data: revs },
      { data: apps },
      { data: allPlans },
      { data: loans }
    ] = await Promise.all([
      supabase.from('properties').select('id, property_type, city, listing_type, status, price, created_at, admin_feedback, owner:profiles(first_name, last_name, role, agent_code), media:property_media(url, media_type)').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, first_name, last_name, email, phone_number, role, created_at').order('created_at', { ascending: false }),
      supabase.from('transactions').select('*, user:profiles(first_name, last_name, email), property:properties(id, property_type, city)').order('created_at', { ascending: false }),
      supabase.from('interest_requests').select('id, message, status, created_at, user:profiles(first_name, last_name, email, phone_number), property:properties(id, property_type, city, owner:profiles!properties_owner_id_fkey(first_name, last_name, phone_number, email))').order('created_at', { ascending: false }),
      supabase.from('service_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('reviews').select('id, rating, comment, status, created_at, user:profiles(first_name, last_name), property:properties(property_type, city)').order('created_at', { ascending: false }),
      supabase.from('agent_applications').select('id, user_id, status, notes, full_name, email, phone, experience, reason, skills, aadhaar_url, pan_url, certificate_url, resume_url, created_at, user:profiles(id, first_name, last_name, email, phone_number, role)').order('created_at', { ascending: false }),
      supabase.from('plans').select('*').order('type', { ascending: true }),
      supabase.from('loan_inquiries').select('*').order('created_at', { ascending: false })
    ]);

    const propList = props || [];
    setProperties(propList);
    setUsers(allUsers || []);
    setTransactions(pays || []);
    setInterests(ints || []);
    setServiceRequests(srvReqs || []);
    setReviews(revs || []);
    setAgentApps(apps || []);
    setPlans(allPlans || []);
    setLoanInquiries(loans || []);

    const revenue = (pays || []).filter((p: any) => p.status === 'completed').reduce((acc: number, p: any) => acc + (p.amount || 0), 0);
    setStats({
      listings: propList.length,
      users: (allUsers || []).length,
      revenue,
      pending: propList.filter((p: any) => p.status === 'pending').length,
      pendingAgents: (apps || []).filter((a: any) => a.status === 'pending').length
    });

    // Fetch announcements (separate try-catch to avoid breaking the dashboard if table is missing)
    try {
      const { data: anns } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
      setAnnouncements(anns || []);
    } catch (err) {
      console.warn("Announcements table might not exist yet:", err);
    }

    // Fetch Careers data (separate try-catch to avoid breaking the dashboard if tables are missing)
    try {
      const { data: vacs } = await supabase.from('job_vacancies').select('*').order('created_at', { ascending: false });
      setVacancies(vacs || []);

      const { data: jobApps } = await supabase.from('job_applications').select('*, vacancy:job_vacancies(role)').order('created_at', { ascending: false });
      setJobApplications(jobApps || []);
    } catch (err) {
      console.warn("Careers tables might not exist yet:", err);
    }

    setIsLoading(false);
    if (showToast) {
      setIsRefreshing(false);
      toast.success("Dashboard data synced");
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  const updatePropertyStatus = async (id: string, status: string, note?: string) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, status, admin_feedback: note } : p));
    await supabase.from('properties').update({ status, admin_feedback: note } as any).eq('id', id);
    setRejectingId(null);
    setFeedback('');
  };

  const updateReviewStatus = async (id: string, status: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    await supabase.from('reviews').update({ status }).eq('id', id);
  };

  const suspendUser = async (id: string) => {
    if (!confirm('Suspend this user?')) return;
    const { error } = await supabase.from('profiles').update({ role: 'buyer' } as any).eq('id', id);
    if (!error) setUsers(prev => prev.map(u => u.id === id ? { ...u, role: 'buyer' } : u));
  };

  const suspendAgent = async (userId: string) => {
    if (!confirm('Suspend this agent? Their role will be reset to Seller and they will need to reapply.')) return;
    // Reset role to seller
    const { error: roleError } = await supabase.from('profiles').update({ role: 'seller', agent_code: null } as any).eq('id', userId);
    if (roleError) { toast.error('Failed to suspend agent: ' + roleError.message); return; }
    // Mark their approved application as rejected so they can reapply
    await supabase.from('agent_applications').update({ status: 'rejected' } as any).eq('user_id', userId).eq('status', 'approved');
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: 'seller', agent_code: null } : u));
    setSelectedAgent(null);
    toast.success('Agent suspended. They must reapply.');
  };

  const updateUserRole = async (id: string, newRole: string) => {
    if (newRole === 'admin' && !confirm('Promote this user to ADMIN? This will give them full control.')) return;
    const { error } = await supabase.from('profiles').update({ role: newRole } as any).eq('id', id);
    if (!error) {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
    } else {
      toast.error("Failed to update user role: " + error.message);
    }
  };

  const updateInterestStatus = async (id: string, status: string) => {
    setInterests(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    await supabase.from('interest_requests').update({ status }).eq('id', id);
  };

  const updateServiceRequestStatus = async (id: string, status: string) => {
    setServiceRequests(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    await supabase.from('service_requests').update({ status }).eq('id', id);
  };

  const deleteServiceRequest = async (id: string) => {
    setServiceRequests(prev => prev.filter(req => req.id !== id));
    const { error } = await supabase.from('service_requests').delete().eq('id', id);
    if (error) toast.error("Failed to delete request");
    else toast.success("Request deleted successfully");
  };

  const updateLoanStatus = async (id: string, status: string) => {
    setLoanInquiries(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    const { error } = await supabase.from('loan_inquiries').update({ status }).eq('id', id);
    if (error) toast.error("Failed to update status");
    else toast.success("Loan inquiry status updated");
  };

  const deleteLoanInquiry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this loan inquiry?')) return;
    setLoanInquiries(prev => prev.filter(l => l.id !== id));
    const { error } = await supabase.from('loan_inquiries').delete().eq('id', id);
    if (error) toast.error("Failed to delete loan inquiry");
    else toast.success("Loan inquiry deleted successfully");
  };

  const handleApproveAgent = async (appId: string, userName: string) => {
    const uniqueHash = Math.random().toString(36).substring(2, 6).toUpperCase();
    const cleanName = userName.substring(0, 3).toUpperCase();
    const newCode = `BHA-AGT-${cleanName}-${uniqueHash}`;

    const { error } = await supabase.rpc('approve_agent_application', {
       app_id: appId,
       generated_code: newCode
    });

    if (error) {
       toast.error("Failed to approve agent: " + error.message);
    } else {
       setAgentApps(prev => prev.map(a => a.id === appId ? { ...a, status: 'approved' } : a));
    }
  };

  const handleRejectAgent = async (appId: string) => {
    const { error } = await supabase.rpc('reject_agent_application', {
       app_id: appId
    });

    if (error) {
       toast.error("Failed to reject agent: " + error.message);
    } else {
       setAgentApps(prev => prev.map(a => a.id === appId ? { ...a, status: 'rejected' } : a));
    }
  };

  const updatePlan = async (id: string, updates: any) => {
    const { error } = await supabase.from('plans').update(updates).eq('id', id);
    if (error) {
      toast.error("Failed to update plan: " + error.message);
    } else {
      setPlans(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      toast.success("Plan updated successfully");
    }
  };

  const handleCreatePlan = async () => {
    const isCreditPack = newPlan.type === 'credit_pack';
    if (!newPlan.name || newPlan.price === '' || (!isCreditPack && newPlan.duration_days === '')) {
      toast.error('Name, Price, and Duration are required');
      return;
    }
    
    setIsSubmittingPlan(true);
    
    const planData = {
      name: newPlan.name,
      description: newPlan.description,
      type: newPlan.type,
      price: parseFloat(newPlan.price),
      duration_days: isCreditPack ? 30 : parseInt(newPlan.duration_days),
      credits_awarded: isCreditPack ? parseInt(newPlan.credits_awarded) || 0 : null,
      features: Array.isArray(newPlan.features) ? newPlan.features.filter((f: string) => f.trim() !== '') : [],
      is_active: true
    };
    
    const { data, error } = await supabase.from('plans').insert(planData).select().single();
    
    setIsSubmittingPlan(false);
    
    if (error) {
      toast.error('Failed to create plan: ' + error.message);
    } else if (data) {
      setPlans(prev => [...prev, data]);
      toast.success('Plan created successfully');
      setIsCreatingPlan(false);
      setNewPlan({
        name: '',
        description: '',
        price: '',
        duration_days: '',
        type: 'subscription',
        features: [],
        credits_awarded: 0
      });
    }
  };

  // Announcements Image Drag, Drop, and Upload Helpers
  const handleAnnDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setAnnDragActive(true);
    } else if (e.type === "dragleave") {
      setAnnDragActive(false);
    }
  };

  const uploadAnnImage = async (file: File) => {
    if (!file) return;
    setAnnUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `announcements/${fileName}`;

      const { data, error } = await supabase.storage
        .from('property-media')
        .upload(filePath, file);

      if (error) {
        toast.error("Upload failed: " + error.message);
      } else {
        const { data: publicData } = supabase.storage
          .from('property-media')
          .getPublicUrl(filePath);

        setNewAnn(prev => ({ ...prev, image_url: publicData.publicUrl }));
        toast.success("Image uploaded successfully!");
      }
    } catch (err: any) {
      toast.error("Error uploading image");
    } finally {
      setAnnUploading(false);
    }
  };

  const handleAnnDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAnnDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadAnnImage(e.dataTransfer.files[0]);
    }
  };

  const handleAnnFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadAnnImage(e.target.files[0]);
    }
  };

  const navItems: { key: Section; label: string; icon: string }[] = [
    { key: 'overview', label: 'Analytics', icon: '📊' },
    { key: 'properties', label: 'All Properties', icon: '🏠' },
    { key: 'pending_properties', label: 'Pending Properties', icon: '⏳' },
    { key: 'users', label: 'Users', icon: '👥' },
    { key: 'agents', label: 'Agent Applications', icon: '📝' },
    { key: 'agents_list', label: 'Agents', icon: '🎖️' },
    { key: 'interests', label: 'Interests', icon: '📋' },
    { key: 'service_requests', label: 'Service Queries', icon: '📩' },
    { key: 'loan_inquiries', label: 'Loan Inquiries', icon: '🏦' },
    { key: 'transactions', label: 'Transactions', icon: '💸' },
    { key: 'verifications', label: 'Verifications', icon: '🛡️' },
    { key: 'plans', label: 'Plan Settings', icon: '⚙️' },
    { key: 'platform_fees', label: 'Platform Fees', icon: '🏷️' },
    { key: 'reviews', label: 'Reviews', icon: '⭐' },
    { key: 'announcements', label: 'Announcements', icon: '📢' },
    { key: 'careers', label: 'Careers Control', icon: '💼' },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#fbfcfa] animate-pulse">
        <aside className="w-64 bg-white border-r border-gray-100 hidden md:block h-screen p-6 space-y-4">
           <div className="w-32 h-4 bg-gray-200 rounded" />
           {[1,2,3,4,5,6].map(i => <div key={i} className="w-full h-12 bg-gray-100 rounded-xl" />)}
        </aside>
        <main className="flex-1 p-8 space-y-8">
           <div className="w-64 h-10 bg-gray-200 rounded-xl" />
           <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[1,2,3,4,5].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl" />)}
           </div>
           <div className="grid grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-xl" />)}
           </div>
           <div className="w-full h-96 bg-gray-200 rounded-3xl" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#fbfcfa]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 shadow-sm shrink-0 hidden md:flex flex-col py-8 px-4 gap-2">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 px-3 mb-4">Admin Panel</h2>
        {navItems.map(item => (
          <button
            key={item.key}
            onClick={() => setSection(item.key)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left w-full ${
              section === item.key 
                ? 'bg-[#00579e] text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-50'
            } cursor-pointer`}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </aside>

      {/* Main content */}
      <main className="flex-1 pt-24 pb-8 px-4 sm:px-8 overflow-x-hidden">
        {/* Top Actions */}
        <div className="flex justify-end items-center gap-4 mb-6">
          <button 
            onClick={() => fetchData(true)} 
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 text-gray-500 text-xs font-black uppercase tracking-widest rounded-full shadow-sm hover:bg-gray-50 hover:border-[#00ecbd] hover:text-[#00ecbd] transition-all group disabled:opacity-50"
          >
            <RefreshCw size={14} className={`${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            {isRefreshing ? 'Syncing...' : 'Sync Data'}
          </button>
          <Link href="/agent" className="bg-[#112743] hover:bg-[#1a3a61] text-white text-xs font-black uppercase tracking-widest px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 active:scale-95">
            <span>🎖️</span> Your Agent View
          </Link>
        </div>
        {/* Mobile nav - Improved modern style */}
        <div className="flex xl:hidden bg-white/80 backdrop-blur-md sticky top-[72px] z-[40] -mx-4 px-4 py-3 border-b border-gray-100 mb-6 overflow-x-auto no-scrollbar gap-2">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => {
                setSection(item.key);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex items-center gap-2 shrink-0 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                section === item.key 
                  ? 'bg-[#00579e] text-white shadow-lg shadow-blue-900/20 active:scale-95' 
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* ─── ANALYTICS ─── */}
        {section === 'overview' && (
          <div>
            <h1 className="text-3xl font-extrabold text-[#00579e] mb-6">Analytics Overview</h1>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {[
                { label: 'Total Listings', value: stats.listings, color: 'blue', icon: '🏠' },
                { label: 'Pending Review', value: stats.pending, color: 'yellow', icon: '⏳' },
                { label: 'Active Users', value: stats.users, color: 'teal', icon: '👥' },
                { label: 'Pending Agents', value: stats.pendingAgents, color: 'purple', icon: '🎖️' },
                { label: 'Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, color: 'green', icon: '💰' },
              ].map(card => (
                <div key={card.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="text-3xl mb-2">{card.icon}</div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{card.label}</p>
                  <p className="text-3xl font-black text-gray-800">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Properties Approved', value: properties.filter(p => p.status === 'approved').length, sub: 'of ' + stats.listings + ' total' },
                { label: 'Pending Interests', value: interests.filter(i => i.status === 'pending').length, sub: 'buyer leads awaiting' },
                { label: 'Pending Reviews', value: reviews.filter(r => r.status === 'pending').length, sub: 'awaiting moderation' },
                { label: 'Completed Transactions', value: transactions.filter(p => p.status === 'completed').length, sub: 'revenue generating' },
                { label: 'Agents Active', value: users.filter(u => u.role === 'agent').length, sub: 'of ' + stats.users + ' users' },
              ].map(item => (
                <div key={item.label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                  <p className="text-2xl font-black text-gray-800">{item.value}</p>
                  <p className="text-sm font-bold text-gray-600 mt-1">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-1">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── PROPERTIES & PENDING PROPERTIES ─── */}
        {(section === 'properties' || section === 'pending_properties') && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <h1 className="text-3xl font-extrabold text-[#00579e]">
                {section === 'pending_properties' ? 'Pending Property Requests' : 'All Properties'}
              </h1>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6 md:items-center">
               <input 
                  type="text" 
                  placeholder="Search city, property type..." 
                  className="bg-white border text-sm text-gray-800 border-gray-200 outline-none px-4 py-2 rounded-lg flex-1 shadow-sm focus:border-teal-500 placeholder-gray-400 cursor-pointer"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
               />
               <select 
                  className="bg-white border text-sm text-gray-800 border-gray-200 outline-none px-4 py-2 rounded-lg shadow-sm focus:border-teal-500 cursor-pointer"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
               >
                  <option value="All">All Types</option>
                  <option value="Rent">Rent</option>
                  <option value="Sell">Sell</option>
               </select>
               <select 
                  className="bg-white border text-sm text-gray-800 border-gray-200 outline-none px-4 py-2 rounded-lg shadow-sm focus:border-teal-500 cursor-pointer"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
               >
                  <option value="Time">Sort by: Time (Newest)</option>
                  <option value="PriceDesc">Sort by: Price (High to Low)</option>
                  <option value="PriceAsc">Sort by: Price (Low to High)</option>
               </select>
            </div>

            <div className="flex flex-col gap-4">
              {(() => {
                const displayProps = filteredAndSortedProperties.filter(p => section === 'pending_properties' ? p.status === 'pending' : p.status === 'approved');
                if (displayProps.length === 0) {
                  return (
                    <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
                      No properties found for the selected filters.
                    </div>
                  );
                }
                return displayProps.map(p => (
                  <div key={p.id} className={`bg-white rounded-xl border shadow-sm p-6 flex flex-col gap-4 border-l-4 ${p.status === 'pending' ? 'border-l-yellow-400' : p.status === 'approved' ? 'border-l-teal-400' : 'border-l-red-400'}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <Link href={`/properties/${p.id}`} className="font-bold text-gray-800 text-lg hover:underline hover:text-teal-600 block transition-colors cursor-pointer">
                          {p.property_type} in {p.city}
                        </Link>
                        <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-wider">
                          Owner: {p.owner?.first_name} {p.owner?.last_name} 
                          {p.owner?.role === 'agent' && (
                            <span className="ml-2 bg-blue-50 text-[#00579e] px-2 py-0.5 rounded text-[9px] font-black border border-blue-100">
                               ID: {p.owner?.agent_code || 'N/A'}
                            </span>
                          )}
                          <span className="mx-2">·</span> {p.listing_type} <span className="mx-2">·</span> ₹{p.price?.toLocaleString('en-IN')} <span className="mx-2">·</span> {new Date(p.created_at).toLocaleDateString()}
                        </p>
                        <span className={`mt-2 inline-block text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter ${p.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : p.status === 'approved' ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-600'}`}>{p.status}</span>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/edit-property/${p.id}`}
                            className="bg-blue-50 text-blue-600 border border-blue-100 hover:bg-[#00579e] hover:text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer flex items-center"
                          >
                            Edit
                          </Link>
                          {p.status !== 'approved' && (
                            <button onClick={() => updatePropertyStatus(p.id, 'approved')} className="bg-[#00b48f] hover:bg-teal-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer">Approve</button>
                          )}
                          {p.status !== 'rejected' && (
                            <button 
                              onClick={() => {
                                if (rejectingId === p.id) {
                                  if (!feedback) return toast.error('Please enter a reason for rejection');
                                  updatePropertyStatus(p.id, 'rejected', feedback);
                                } else {
                                  setRejectingId(p.id);
                                }
                              }} 
                              className="bg-red-50 text-red-500 border border-red-200 hover:bg-red-500 hover:text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
                            >
                              {rejectingId === p.id ? 'Confirm Reject' : 'Reject'}
                            </button>
                          )}
                          {p.status !== 'pending' && (
                            <button onClick={() => updatePropertyStatus(p.id, 'pending')} className="bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer">Reset</button>
                          )}
                        </div>
                        
                        {rejectingId === p.id && (
                          <div className="w-full max-w-xs animate-in slide-in-from-top-2 duration-300">
                             <textarea 
                               autoFocus
                               placeholder="Provide improvement notes for the agent..."
                               className="w-full bg-red-50/50 border border-red-100 p-2 rounded-lg text-xs outline-none focus:border-red-300 placeholder-red-300 text-red-900 font-medium"
                               value={feedback}
                               onChange={(e) => setFeedback(e.target.value)}
                             />
                             <button onClick={() => setRejectingId(null)} className="text-[10px] font-black text-gray-500 mt-1 uppercase tracking-widest hover:text-red-600 transition-colors cursor-pointer">Cancel Rejection</button>
                          </div>
                        )}
                      </div>
                    </div>

                    {p.admin_feedback && (
                      <div className="bg-yellow-50/50 border border-yellow-100 p-3 rounded-lg">
                        <p className="text-[10px] font-black text-yellow-600 uppercase mb-1">Previous Rejection Note</p>
                        <p className="text-sm text-yellow-800 italic">"{p.admin_feedback}"</p>
                      </div>
                    )}

                    {/* Media Preview */}
                    {p.media && p.media.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {p.media.slice(0, 8).map((m: any, idx: number) => (
                          <a key={idx} href={m.url} target="_blank" rel="noreferrer" className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:ring-2 hover:ring-teal-500 transition-all cursor-pointer">
                            {m.media_type === 'image' || m.url.match(/\.(jpg|jpeg|png)$/i) ? (
                              <img src={m.url} className="w-full h-full object-cover" alt="Property asset" />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">DOC</div>
                            )}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        {/* ─── USERS ─── */}
        {section === 'users' && (
          <div>
            <h1 className="text-3xl font-extrabold text-[#00579e] mb-6">User Management</h1>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6 md:items-center">
               <div className="relative flex-1">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                 <input 
                    type="text" 
                    placeholder="Search users by name, email, phone..." 
                    className="w-full bg-white border text-sm text-gray-800 border-gray-200 outline-none pl-11 pr-4 py-2.5 rounded-xl shadow-sm focus:border-teal-500 placeholder-gray-400 transition-all"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                 />
               </div>
               <select 
                  className="bg-white border text-sm text-gray-800 border-gray-200 outline-none px-4 py-2.5 rounded-xl shadow-sm focus:border-teal-500 cursor-pointer font-bold"
                  value={userSortBy}
                  onChange={(e) => setUserSortBy(e.target.value)}
               >
                  <option value="Newest">Joined: Newest First</option>
                  <option value="Oldest">Joined: Oldest First</option>
               </select>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Name', 'Email', 'Phone', 'Role', 'Joined', 'Action'].map(h => (
                        <th key={h} className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users
                      .filter(u => {
                        if (!userSearchQuery) return true;
                        const s = userSearchQuery.toLowerCase();
                        return (
                          u.first_name?.toLowerCase().includes(s) || 
                          u.last_name?.toLowerCase().includes(s) || 
                          u.email?.toLowerCase().includes(s) || 
                          u.phone_number?.toLowerCase().includes(s)
                        );
                      })
                      .sort((a, b) => {
                        const timeA = new Date(a.created_at).getTime();
                        const timeB = new Date(b.created_at).getTime();
                        return userSortBy === 'Newest' ? timeB - timeA : timeA - timeB;
                      })
                      .map(u => (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-semibold text-gray-800">{u.first_name} {u.last_name}</td>
                        <td className="p-4 text-sm text-gray-500">{u.email}</td>
                        <td className="p-4 text-sm text-gray-500">{u.phone_number || '—'}</td>
                        <td className="p-4">
                          <select 
                            value={u.role} 
                            onChange={(e) => updateUserRole(u.id, e.target.value)}
                            disabled={u.role === 'admin' && users.filter(usr => usr.role === 'admin').length <= 1} // Prevent removing the last admin
                            className={`text-xs font-bold uppercase px-2 py-1 rounded tracking-wider border-none outline-none cursor-pointer ${
                              u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                              u.role === 'agent' ? 'bg-blue-100 text-blue-700' : 
                              u.role === 'seller' ? 'bg-orange-100 text-orange-700' : 
                              'bg-gray-100 text-gray-700'
                            }`}
                          >
                            <option value="admin">Admin</option>
                            <option value="agent">Agent</option>
                            <option value="seller">Seller</option>
                            <option value="buyer">Buyer</option>
                          </select>
                        </td>
                        <td className="p-4 text-sm text-gray-500 whitespace-nowrap">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="p-4">
                          {u.role !== 'admin' && u.role !== 'buyer' && (
                            <button onClick={() => suspendUser(u.id)} className="text-xs font-bold text-red-500 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-500 hover:text-white transition-colors cursor-pointer">
                              Suspend
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── TRANSACTIONS ─── */}
        {section === 'transactions' && (
          <div>
            <h1 className="text-3xl font-extrabold text-[#00579e] mb-6">Global Audit Logs</h1>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['User', 'Type', 'Property', 'Amount', 'Status', 'Date'].map(h => (
                        <th key={h} className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <Link href={`/admin/users/${tx.user?.id}`} className="font-bold text-[#00579e] hover:underline block">
                            {tx.user?.first_name} {tx.user?.last_name}
                          </Link>
                          <p className="text-[10px] text-gray-400 font-bold">{tx.user?.email}</p>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${tx.payment_type === 'subscription' ? 'bg-blue-50 text-blue-600' : 'bg-teal-50 text-teal-600'}`}>
                            {tx.payment_type}
                          </span>
                        </td>
                        <td className="p-4">
                          {tx.property ? (
                            <Link href={`/properties/${tx.property.id}`} className="text-sm text-blue-600 hover:underline font-bold">
                              {tx.property.property_type} in {tx.property.city}
                            </Link>
                          ) : (
                            <span className="text-sm text-gray-400 uppercase tracking-tighter font-bold font-mono">Platform Plan</span>
                          )}
                        </td>
                        <td className="p-4 font-bold text-gray-800">₹{tx.amount}</td>
                        <td className="p-4">
                          <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${tx.status === 'completed' ? 'bg-teal-50 text-teal-700' : 'bg-yellow-50 text-yellow-700'}`}>{tx.status}</span>
                        </td>
                        <td className="p-4 text-sm text-gray-500 whitespace-nowrap">{new Date(tx.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr><td colSpan={6} className="p-8 text-center text-gray-400">No transactions yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── INTEREST TICKETS ─── */}
        {section === 'interests' && (
          <div>
            <h1 className="text-3xl font-extrabold text-[#00579e] mb-6">Buyer Leads</h1>
            <div className="flex flex-col gap-4">
              {interests.map(req => (
                <div 
                   key={req.id} 
                   onClick={() => setSelectedLead(req)}
                   className={`bg-white rounded-xl border shadow-sm p-5 flex flex-col md:flex-row gap-6 border-l-4 cursor-pointer hover:shadow-md hover:translate-x-1 transition-all ${req.status === 'contacted' ? 'border-l-teal-400' : 'border-l-yellow-400'}`}
                >
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-lg">{req.user?.first_name} {req.user?.last_name}</p>
                    <p className="text-xs text-gray-500 font-bold mb-3 uppercase tracking-tighter">📞 {req.user?.phone_number} · ✉️ {req.user?.email}</p>
                    <div className="text-sm text-gray-700 italic border-l-2 border-teal-300 pl-3 leading-relaxed line-clamp-2">
                      "{req.message}"
                    </div>
                  </div>
                  <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Target Property</p>
                      <p className="font-bold text-gray-800 leading-tight">{req.property?.property_type}</p>
                      <p className="text-xs text-gray-500 mb-4">{req.property?.city}</p>
                    </div>

                    <div className="mt-2">
                       {req.status === 'pending' ? (
                         <span className="text-xs font-black uppercase text-yellow-600 bg-yellow-50 px-3 py-1 rounded">Pending Contact</span>
                       ) : (
                         <span className="text-xs font-black uppercase text-teal-600 bg-teal-50 px-3 py-1 rounded">Contacted</span>
                       )}
                    </div>
                  </div>
                </div>
              ))}
              {interests.length === 0 && <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center text-gray-400 shadow-sm">No buyer interest leads currently in the system.</div>}
            </div>
          </div>
        )}

        {/* ─── SERVICE REQUESTS ─── */}
        {section === 'service_requests' && (
          <ServiceRequestsSection 
            requests={serviceRequests} 
            onStatusUpdate={updateServiceRequestStatus} 
            onDelete={deleteServiceRequest}
          />
        )}

        {/* ─── LOAN INQUIRIES ─── */}
        {section === 'loan_inquiries' && (
          <div>
            <h1 className="text-3xl font-extrabold text-[#00579e] mb-6">Home Loan Inquiries</h1>
            
            <div className="flex flex-col gap-4">
              {loanInquiries.map(loan => {
                const partnerName = 
                  loan.company_id === 'sbi' ? 'SBI Home Loans 🏦' :
                  loan.company_id === 'hdfc' ? 'HDFC Bank 💳' :
                  loan.company_id === 'icici' ? 'ICICI Bank 🏢' :
                  loan.company_id === 'bajaj' ? 'Bajaj Housing 🏠' :
                  loan.company_id;

                const formattedAmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(loan.loan_amount);

                const rate = 
                  loan.company_id === 'sbi' ? 8.4 :
                  loan.company_id === 'hdfc' ? 8.5 :
                  loan.company_id === 'icici' ? 8.65 :
                  loan.company_id === 'bajaj' ? 8.45 :
                  8.5;
                
                const P = loan.loan_amount;
                const R = rate / 12 / 100;
                const N = 20 * 12;
                const emi = P > 0 && R > 0 ? Math.round((P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1)) : 0;
                const formattedEmi = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(emi);

                return (
                  <div key={loan.id} className={`bg-white rounded-xl border shadow-sm p-6 flex flex-col md:flex-row gap-6 border-l-4 ${loan.status === 'contacted' ? 'border-l-teal-400' : 'border-l-yellow-400'}`}>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{loan.name}</h3>
                        <span className="text-xs text-gray-400 font-medium">{new Date(loan.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</p>
                          <a href={`tel:${loan.phone}`} className="text-sm font-bold text-[#00579e] hover:underline">📞 {loan.phone}</a>
                        </div>
                        {loan.email && (
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</p>
                            <a href={`mailto:${loan.email}`} className="text-sm font-bold text-[#00579e] hover:underline">✉️ {loan.email}</a>
                          </div>
                        )}
                      </div>

                      <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 flex flex-wrap gap-6">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Partner Bank</p>
                          <p className="text-sm font-bold text-gray-700">{partnerName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loan Amount</p>
                          <p className="text-sm font-bold text-gray-700">{formattedAmt}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Est. EMI (20 Yrs)</p>
                          <p className="text-sm font-bold text-gray-700">{formattedEmi} / mo</p>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-48 flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 shrink-0 gap-4">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Inquiry Status</p>
                        <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded ${loan.status === 'contacted' ? 'bg-teal-50 text-teal-700' : 'bg-yellow-50 text-yellow-700'}`}>
                          {loan.status || 'pending'}
                        </span>
                      </div>
                      
                      <div className="flex flex-col gap-2 w-full">
                        {loan.status !== 'contacted' ? (
                          <button 
                            onClick={() => updateLoanStatus(loan.id, 'contacted')}
                            className="w-full bg-[#00b48f] hover:bg-teal-600 text-white text-xs font-bold py-2 rounded-lg transition-all shadow-sm cursor-pointer text-center"
                          >
                            Mark Contacted
                          </button>
                        ) : (
                          <button 
                            onClick={() => updateLoanStatus(loan.id, 'pending')}
                            className="w-full bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border border-yellow-200 text-xs font-bold py-2 rounded-lg transition-all shadow-sm cursor-pointer text-center"
                          >
                            Mark Pending
                          </button>
                        )}
                        <button 
                          onClick={() => deleteLoanInquiry(loan.id)}
                          className="w-full bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white text-xs font-bold py-2 rounded-lg transition-all shadow-sm cursor-pointer text-center"
                        >
                          Delete Lead
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {loanInquiries.length === 0 && (
                <div className="bg-white p-16 rounded-3xl border border-gray-100 text-center text-gray-400 shadow-sm flex flex-col items-center justify-center gap-4">
                  <span className="text-5xl">🏦</span>
                  <p className="font-bold text-lg text-gray-500 uppercase tracking-widest">No Loan Inquiries Submitted Yet</p>
                  <p className="text-sm text-gray-400 max-w-sm">All leads collected via the Explore Loan Options calculator forms will be logged here in real-time.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── REVIEWS ─── */}
        {section === 'reviews' && (
          <div>
            <h1 className="text-3xl font-extrabold text-[#00579e] mb-6">Review Moderation</h1>
            <div className="flex flex-col gap-4">
              {reviews.map(rev => (
                <div key={rev.id} className={`bg-white rounded-xl border shadow-sm p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-l-4 ${rev.status === 'pending' ? 'border-l-yellow-400' : rev.status === 'approved' ? 'border-l-teal-400' : 'border-l-red-400'}`}>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-gray-800">{rev.user?.first_name} {rev.user?.last_name}</p>
                      <span className="text-xs text-gray-400">{new Date(rev.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{rev.property?.property_type} in {rev.property?.city}</p>
                    <div className="flex text-yellow-400 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} className={`w-4 h-4 ${i < rev.rating ? 'fill-current' : 'text-gray-200 fill-current'}`} viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 italic">"{rev.comment}"</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {rev.status !== 'approved' && <button onClick={() => updateReviewStatus(rev.id, 'approved')} className="bg-[#00b48f] text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-teal-600 transition-colors">Approve</button>}
                    {rev.status !== 'rejected' && <button onClick={() => updateReviewStatus(rev.id, 'rejected')} className="bg-red-50 text-red-500 border border-red-200 text-xs font-bold px-3 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors">Reject</button>}
                  </div>
                </div>
              ))}
              {reviews.length === 0 && <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center text-gray-400 font-bold">No reviews yet.</div>}
            </div>
          </div>
        )}

        {/* ─── PENDING AGENT APPLICATIONS ─── */}
        {section === 'agents' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-extrabold text-[#00579e]">Agent Applications</h1>
              <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-100">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-yellow-700 uppercase tracking-widest">{agentApps.filter(a => a.status === 'pending').length} Pending</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6 md:items-center">
               <div className="relative flex-1">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                 <input 
                    type="text" 
                    placeholder="Search applications..." 
                    className="w-full bg-white border text-sm text-gray-800 border-gray-200 outline-none pl-11 pr-4 py-2.5 rounded-xl shadow-sm focus:border-teal-500 placeholder-gray-400 transition-all"
                    value={agentAppSearchQuery}
                    onChange={(e) => setAgentAppSearchQuery(e.target.value)}
                 />
               </div>
               <select 
                  className="bg-white border text-sm text-gray-800 border-gray-200 outline-none px-4 py-2.5 rounded-xl shadow-sm focus:border-teal-500 cursor-pointer font-bold"
                  value={agentAppSortBy}
                  onChange={(e) => setAgentAppSortBy(e.target.value)}
               >
                  <option value="Newest">Applied: Newest First</option>
                  <option value="Oldest">Applied: Oldest First</option>
               </select>
            </div>
            <div className="flex flex-col gap-4">
              {agentApps
                .filter(a => a.status === 'pending')
                .filter(a => {
                  if (!agentAppSearchQuery) return true;
                  const s = agentAppSearchQuery.toLowerCase();
                  return (
                    a.user?.first_name?.toLowerCase().includes(s) || 
                    a.user?.last_name?.toLowerCase().includes(s) || 
                    a.user?.email?.toLowerCase().includes(s) || 
                    a.user?.phone_number?.toLowerCase().includes(s) ||
                    a.notes?.toLowerCase().includes(s)
                  );
                })
                .sort((a, b) => {
                  const timeA = new Date(a.created_at).getTime();
                  const timeB = new Date(b.created_at).getTime();
                  return agentAppSortBy === 'Newest' ? timeB - timeA : timeA - timeB;
                })
                .map(app => (
                <div 
                  key={app.id} 
                  onClick={() => setSelectedAgentApp(app)}
                  className="bg-white rounded-xl border border-yellow-200 border-l-4 border-l-yellow-400 shadow-sm p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-lg group-hover:text-[#00579e] transition-colors">{app.full_name || `${app.user?.first_name} ${app.user?.last_name}`}</p>
                    <p className="text-xs text-gray-500 mb-3 font-medium">📞 {app.phone || app.user?.phone_number} | ✉️ {app.email || app.user?.email}</p>
                    <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                       <p className="text-[10px] uppercase font-black text-gray-400 mb-2">Application Notes</p>
                       <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">{app.reason || app.notes || "No details provided."}</p>
                       <span className="text-[#00b48f] text-xs font-bold mt-2 inline-block">View Full Application & Docs →</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0 md:pt-2 min-w-[160px]" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleApproveAgent(app.id, app.user?.first_name || 'UNK')} className="bg-[#00b48f] text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-teal-600 transition-colors shadow-sm">✓ Approve Agent</button>
                    <button onClick={() => handleRejectAgent(app.id)} className="bg-white text-red-500 border border-red-200 text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-red-50 transition-colors">✗ Reject</button>
                    <p className="text-[10px] text-gray-400 text-center">{new Date(app.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {agentApps.filter(a => a.status === 'pending').length === 0 && (
                <div className="bg-white p-16 rounded-2xl border border-gray-100 text-center shadow-sm">
                  <p className="text-4xl mb-3">🎉</p>
                  <p className="text-gray-700 font-bold text-lg">All Clear!</p>
                  <p className="text-gray-400 text-sm mt-1">No pending agent applications.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── ACTIVE AGENTS LIST ─── */}
        {section === 'agents_list' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-extrabold text-[#00579e]">Active Agents</h1>
              <div className="flex items-center gap-2 bg-teal-50 px-4 py-2 rounded-full border border-teal-100">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">{users.filter(u => u.role === 'agent').length} Active</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6 md:items-center">
               <div className="relative flex-1">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                 <input 
                    type="text" 
                    placeholder="Search agents..." 
                    className="w-full bg-white border text-sm text-gray-800 border-gray-200 outline-none pl-11 pr-4 py-2.5 rounded-xl shadow-sm focus:border-teal-500 placeholder-gray-400 transition-all"
                    value={activeAgentSearchQuery}
                    onChange={(e) => setActiveAgentSearchQuery(e.target.value)}
                 />
               </div>
               <select 
                  className="bg-white border text-sm text-gray-800 border-gray-200 outline-none px-4 py-2.5 rounded-xl shadow-sm focus:border-teal-500 cursor-pointer font-bold"
                  value={activeAgentSortBy}
                  onChange={(e) => setActiveAgentSortBy(e.target.value)}
               >
                  <option value="Newest">Joined: Newest First</option>
                  <option value="Oldest">Joined: Oldest First</option>
               </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {users
                .filter(u => u.role === 'agent')
                .filter(u => {
                  if (!activeAgentSearchQuery) return true;
                  const s = activeAgentSearchQuery.toLowerCase();
                  return (
                    u.first_name?.toLowerCase().includes(s) || 
                    u.last_name?.toLowerCase().includes(s) || 
                    u.email?.toLowerCase().includes(s) || 
                    u.phone_number?.toLowerCase().includes(s)
                  );
                })
                .sort((a, b) => {
                  const timeA = new Date(a.created_at).getTime();
                  const timeB = new Date(b.created_at).getTime();
                  return activeAgentSortBy === 'Newest' ? timeB - timeA : timeA - timeB;
                })
                .map(agent => (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className="bg-white rounded-2xl border border-teal-100 border-l-4 border-l-[#00b48f] shadow-sm p-5 cursor-pointer hover:shadow-lg hover:border-teal-200 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 bg-[#00b48f] rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md">
                      {agent.first_name?.[0]}{agent.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 group-hover:text-[#00579e] transition-colors">{agent.first_name} {agent.last_name}</p>
                      <span className="text-[10px] font-black bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">✓ Verified Agent</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-gray-500">
                    <p>✉️ {agent.email}</p>
                    <p>📞 {agent.phone_number || 'N/A'}</p>
                    <p>📅 Joined {new Date(agent.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 text-[10px] text-gray-400 font-bold uppercase tracking-widest text-right">
                    Click to view details →
                  </div>
                </div>
              ))}
              {users.filter(u => u.role === 'agent').length === 0 && (
                <div className="col-span-3 bg-white p-16 rounded-2xl border border-gray-100 text-center shadow-sm">
                  <p className="text-4xl mb-3">🎖️</p>
                  <p className="text-gray-700 font-bold text-lg">No Active Agents</p>
                  <p className="text-gray-400 text-sm mt-1">Approve applications to onboard agents.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── PLANS MANAGEMENT ─── */}
        {section === 'plans' && (
          <div className="animate-in fade-in duration-300">
             <div className="flex justify-between items-center mb-6">
               <h1 className="text-3xl font-extrabold text-[#00579e]">Plan Control Center</h1>
               <button
                 onClick={() => setIsCreatingPlan(true)}
                 className="bg-[#00b48f] hover:bg-teal-600 text-white text-xs font-black uppercase tracking-widest px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
               >
                 <span className="text-lg leading-none">+</span> Create New Plan
               </button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.filter(p => p.name !== 'Agent Application Fee' && p.name !== 'Property Verification Fee').map(p => (
                  <div key={p.id} className={`bg-white rounded-3xl p-8 border shadow-sm transition-all flex flex-col ${p.is_active ? 'border-teal-100 hover:shadow-xl' : 'opacity-60 bg-gray-50'}`}>
                    <div className="flex justify-between items-start mb-6">
                       <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter ${p.type === 'subscription' ? 'bg-blue-100 text-blue-700' : p.type === 'credit_pack' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                          {p.type.replace('_', ' ')}
                       </span>
                       <button 
                         onClick={() => updatePlan(p.id, { is_active: !p.is_active })}
                         className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${p.is_active ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white'}`}
                       >
                         {p.is_active ? 'Deactivate' : 'Activate'}
                       </button>
                    </div>

                    <div className="space-y-3 mb-6">
                      <input 
                        type="text" 
                        className="w-full bg-gray-50 border-none font-black text-gray-800 text-xl outline-none focus:ring-2 focus:ring-teal-500/20 rounded-lg px-2 py-1"
                        value={p.name}
                        onChange={(e) => setPlans(prev => prev.map(plan => plan.id === p.id ? { ...plan, name: e.target.value } : plan))}
                        placeholder="Plan Name"
                      />
                      <textarea 
                        className="w-full bg-gray-50 border-none text-xs text-gray-500 font-bold italic outline-none focus:ring-2 focus:ring-teal-500/20 rounded-lg px-2 py-1 resize-none"
                        value={p.description || ''}
                        rows={2}
                        onChange={(e) => setPlans(prev => prev.map(plan => plan.id === p.id ? { ...plan, description: e.target.value } : plan))}
                        placeholder="Description"
                      />
                    </div>

                    <div className="space-y-4 pt-6 border-t border-gray-100 flex-1">
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Price (INR)</span>
                          <input 
                            type="number" 
                            min="0"
                            className="w-24 bg-gray-50 border-none text-right font-black text-[#112743] rounded-lg p-2 outline-none focus:ring-2 focus:ring-teal-500/20"
                            value={p.price}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val) && val >= 0) {
                                setPlans(prev => prev.map(plan => plan.id === p.id ? { ...plan, price: val } : plan));
                              } else if (e.target.value === '') {
                                setPlans(prev => prev.map(plan => plan.id === p.id ? { ...plan, price: '' } : plan));
                              }
                            }}
                          />
                       </div>
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Duration (Days)</span>
                          <input 
                            type="number" 
                            min="0"
                            className="w-24 bg-gray-50 border-none text-right font-black text-[#112743] rounded-lg p-2 outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                            value={p.type === 'credit_pack' ? 30 : p.duration_days}
                            disabled={p.type === 'credit_pack'}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val) && val >= 0) {
                                setPlans(prev => prev.map(plan => plan.id === p.id ? { ...plan, duration_days: val } : plan));
                              } else if (e.target.value === '') {
                                setPlans(prev => prev.map(plan => plan.id === p.id ? { ...plan, duration_days: '' } : plan));
                              }
                            }}
                          />
                       </div>
                       {p.type === 'credit_pack' && (
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Credits Awarded</span>
                            <input 
                              type="number" 
                              min="0"
                              className="w-24 bg-gray-50 border-none text-right font-black text-[#112743] rounded-lg p-2 outline-none focus:ring-2 focus:ring-teal-500/20"
                              value={p.credits_awarded || 0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val) && val >= 0) {
                                  setPlans(prev => prev.map(plan => plan.id === p.id ? { ...plan, credits_awarded: val } : plan));
                                } else if (e.target.value === '') {
                                  setPlans(prev => prev.map(plan => plan.id === p.id ? { ...plan, credits_awarded: '' } : plan));
                                }
                              }}
                            />
                         </div>
                       )}
                       
                       {/* Features Editor */}
                        <div className="pt-4 border-t border-gray-100 mt-4">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Display Features (One per line)</p>
                           <textarea 
                             className="w-full bg-gray-50 border-none text-xs text-gray-600 font-bold outline-none focus:ring-2 focus:ring-teal-500/20 rounded-xl px-3 py-2 resize-none"
                             value={Array.isArray(p.features) ? p.features.join('\n') : (typeof p.features === 'string' ? JSON.parse(p.features).join('\n') : '')}
                             rows={5}
                             onChange={(e) => {
                               const newFeatures = e.target.value.split('\n').filter(f => f.trim() !== '');
                               setPlans(prev => prev.map(plan => plan.id === p.id ? { ...plan, features: newFeatures } : plan));
                             }}
                             placeholder="e.g. Unlimited Property Unlocks"
                           />
                        </div>
                    </div>

                    <button 
                      onClick={() => {
                        const isCreditPack = p.type === 'credit_pack';
                        if (p.price === '' || (!isCreditPack && p.duration_days === '')) {
                          toast.error("Price and Duration are required");
                          return;
                        }
                        updatePlan(p.id, {
                          name: p.name,
                          description: p.description,
                          price: parseFloat(p.price as any),
                          duration_days: isCreditPack ? 30 : parseInt(p.duration_days as any),
                          features: p.features,
                          credits_awarded: isCreditPack ? parseInt(p.credits_awarded as any) : null
                        });
                      }}
                      className="mt-8 w-full bg-[#00579e] hover:bg-[#1a3a61] text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl shadow-lg shadow-blue-500/10 transition-all active:scale-95"
                    >
                      Save Plan Changes
                    </button>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* ─── UNIQUE PLATFORM FEES ─── */}
        {section === 'platform_fees' && (
          <div className="animate-in fade-in duration-300">
             <div className="mb-8">
               <h1 className="text-3xl font-extrabold text-[#00579e]">Platform Fees Control</h1>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Configure flat-rate fees for Verification & Onboarding (Read-only setup, Edit only)</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
                {plans.filter(p => p.name === 'Agent Application Fee' || p.name === 'Property Verification Fee').map(p => (
                  <div key={p.id} className={`bg-white rounded-3xl p-8 border shadow-sm transition-all flex flex-col ${p.is_active ? 'border-teal-100 hover:shadow-xl' : 'opacity-60 bg-gray-50'}`}>
                    <div className="flex justify-between items-start mb-6">
                       <span className="text-[10px] font-black px-2.5 py-1 rounded bg-amber-100 text-amber-700 uppercase tracking-widest">
                          🛡️ Platform Fee
                       </span>
                       <button 
                         onClick={() => updatePlan(p.id, { is_active: !p.is_active })}
                         className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${p.is_active ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white'}`}
                       >
                         {p.is_active ? 'Deactivate' : 'Activate'}
                       </button>
                    </div>

                    <div className="space-y-3 mb-6">
                      <input 
                        type="text" 
                        disabled
                        className="w-full bg-gray-100 border-none font-black text-gray-400 text-xl rounded-lg px-2 py-1 cursor-not-allowed"
                        value={p.name}
                        placeholder="Plan Name"
                      />
                      <textarea 
                        className="w-full bg-gray-50 border-none text-xs text-gray-500 font-bold italic outline-none focus:ring-2 focus:ring-teal-500/20 rounded-lg px-2 py-1 resize-none"
                        value={p.description || ''}
                        rows={2}
                        onChange={(e) => setPlans(prev => prev.map(plan => plan.id === p.id ? { ...plan, description: e.target.value } : plan))}
                        placeholder="Description"
                      />
                    </div>

                    <div className="space-y-4 pt-6 border-t border-gray-100 flex-1">
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Price (INR)</span>
                          <input 
                            type="number" 
                            min="0"
                            className="w-24 bg-gray-50 border-none text-right font-black text-[#112743] rounded-lg p-2 outline-none focus:ring-2 focus:ring-teal-500/20"
                            value={p.price}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val) && val >= 0) {
                                setPlans(prev => prev.map(plan => plan.id === p.id ? { ...plan, price: val } : plan));
                              } else if (e.target.value === '') {
                                setPlans(prev => prev.map(plan => plan.id === p.id ? { ...plan, price: '' } : plan));
                              }
                            }}
                          />
                       </div>
                       
                       {/* Features Editor */}
                        <div className="pt-4 border-t border-gray-100 mt-4">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Display Features (One per line)</p>
                           <textarea 
                             className="w-full bg-gray-50 border-none text-xs text-gray-600 font-bold outline-none focus:ring-2 focus:ring-teal-500/20 rounded-xl px-3 py-2 resize-none"
                             value={Array.isArray(p.features) ? p.features.join('\n') : (typeof p.features === 'string' ? JSON.parse(p.features).join('\n') : '')}
                             rows={5}
                             onChange={(e) => {
                               const newFeatures = e.target.value.split('\n').filter(f => f.trim() !== '');
                               setPlans(prev => prev.map(plan => plan.id === p.id ? { ...plan, features: newFeatures } : plan));
                             }}
                             placeholder="e.g. Dynamic features listing"
                           />
                        </div>
                    </div>

                    <button 
                      onClick={() => {
                        if (p.price === '') {
                          toast.error("Price is required");
                          return;
                        }
                        updatePlan(p.id, {
                          name: p.name,
                          description: p.description,
                          price: parseFloat(p.price as any),
                          features: p.features,
                        });
                      }}
                      className="mt-8 w-full bg-[#00579e] hover:bg-[#1a3a61] text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl shadow-lg shadow-blue-500/10 transition-all active:scale-95"
                    >
                      Save Fee Changes
                    </button>
                  </div>
                ))}
             </div>
          </div>
        )}

        {section === 'verifications' && (
          <VerificationManager />
        )}

        {/* ─── ANNOUNCEMENTS CONTROL CENTER ─── */}
        {section === 'announcements' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-extrabold text-[#00579e]">Announcements Manager</h1>
              <button
                onClick={() => setIsCreatingAnn(!isCreatingAnn)}
                className="bg-[#00b48f] hover:bg-teal-600 text-white text-xs font-black uppercase tracking-widest px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                {isCreatingAnn ? 'Close Form' : '+ Create Announcement'}
              </button>
            </div>

            {/* Creation Form */}
            {isCreatingAnn && (
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl mb-8 animate-in fade-in slide-in-from-top-4 duration-300 max-w-2xl">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span>📢</span> Draft Platform Announcement
                </h3>
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Announcement Title *</label>
                    <input 
                      type="text"
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 text-gray-800 font-bold"
                      value={newAnn.title}
                      onChange={(e) => setNewAnn({ ...newAnn, title: e.target.value })}
                      placeholder="e.g. Mega Summer Offer! ☀️"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Description Message *</label>
                    <textarea 
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 text-gray-700 font-medium resize-none"
                      value={newAnn.message}
                      onChange={(e) => setNewAnn({ ...newAnn, message: e.target.value })}
                      placeholder="Write a compelling description that users will read upon landing..."
                      rows={4}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Image Upload Area */}
                    <div className="flex flex-col">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Announcement Image</label>
                      
                      {newAnn.image_url ? (
                        <div className="relative w-full h-[160px] rounded-2xl overflow-hidden border border-teal-100 shadow-inner group">
                          <img src={newAnn.image_url} className="w-full h-full object-cover" alt="Announcement upload" />
                          <button
                            type="button"
                            onClick={() => setNewAnn(prev => ({ ...prev, image_url: '' }))}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2.5 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer z-10 font-bold"
                          >
                            🗑️ Delete Image
                          </button>
                        </div>
                      ) : (
                        <div 
                          onDragEnter={handleAnnDrag}
                          onDragOver={handleAnnDrag}
                          onDragLeave={handleAnnDrag}
                          onDrop={handleAnnDrop}
                          onClick={() => document.getElementById('ann-file-input')?.click()}
                          className={`w-full h-[160px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all duration-300 ${
                            annDragActive 
                              ? 'border-[#00b48f] bg-teal-50/50 scale-[1.01]' 
                              : 'border-gray-200 hover:border-[#00b48f] hover:bg-teal-50/10'
                          }`}
                        >
                          <input 
                            id="ann-file-input"
                            type="file" 
                            accept="image/*"
                            onChange={handleAnnFileChange}
                            className="hidden" 
                          />
                          {annUploading ? (
                            <div className="flex flex-col items-center gap-2">
                              <span className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></span>
                              <span className="text-xs font-bold text-teal-600">Uploading to Supabase...</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className="text-3xl mb-2">📸</span>
                              <p className="text-xs font-black text-gray-700 uppercase tracking-wider mb-1">Drag & Drop Image Here</p>
                              <p className="text-[10px] text-gray-400 font-bold">Or click to browse files (JPEG, PNG, WEBP)</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Links & Manual URL Option */}
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Target Action Link (Optional)</label>
                        <input 
                          type="url"
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 text-gray-700 font-medium"
                          value={newAnn.url}
                          onChange={(e) => setNewAnn({ ...newAnn, url: e.target.value })}
                          placeholder="https://bhavyamproperties.com/membership"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Or Paste Image URL Manually</label>
                        <input 
                          type="url"
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 text-gray-700 font-medium"
                          value={newAnn.image_url}
                          onChange={(e) => setNewAnn({ ...newAnn, image_url: e.target.value })}
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={async () => {
                      if (!newAnn.title || !newAnn.message) {
                        toast.error("Title and Message are required");
                        return;
                      }
                      setIsSubmittingAnn(true);
                      try {
                        // 1. Deactivate other active announcements
                        await supabase.from('announcements').update({ is_active: false } as any).eq('is_active', true);
                        
                        // 2. Insert new active announcement
                        const { data, error } = await supabase.from('announcements').insert({
                          title: newAnn.title,
                          message: newAnn.message,
                          image_url: newAnn.image_url || null,
                          url: newAnn.url || null,
                          is_active: true
                        } as any).select().single();

                        if (error) {
                          toast.error("Failed to publish: " + error.message);
                        } else if (data) {
                          setAnnouncements(prev => [data, ...prev.map(a => ({ ...a, is_active: false }))]);
                          toast.success("Announcement published successfully!");
                          setIsCreatingAnn(false);
                          setNewAnn({ title: '', message: '', image_url: '', url: '' });
                        }
                      } catch (err: any) {
                        toast.error("Database error. Ensure migrations have run.");
                      } finally {
                        setIsSubmittingAnn(false);
                      }
                    }}
                    disabled={isSubmittingAnn}
                    className="w-full bg-[#00579e] hover:bg-[#1a3a61] text-white text-xs font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-blue-500/10 transition-all active:scale-95 disabled:opacity-50 mt-4 cursor-pointer"
                  >
                    {isSubmittingAnn ? 'Publishing...' : 'Publish & Broadcast Live'}
                  </button>
                </div>
              </div>
            )}

            {/* Announcements List */}
            <div className="grid grid-cols-1 gap-6">
              {announcements.map((ann) => (
                <div key={ann.id} className={`bg-white rounded-3xl p-6 border shadow-sm transition-all flex flex-col md:flex-row gap-6 justify-between items-stretch ${ann.is_active ? 'border-teal-100 hover:shadow-md' : 'border-gray-100 opacity-75'}`}>
                  {ann.image_url && (
                    <div className="w-full md:w-44 h-28 rounded-2xl overflow-hidden shrink-0 border border-gray-100 relative bg-gray-50">
                      <img src={ann.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-black text-gray-800 tracking-tight">{ann.title}</h3>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${ann.is_active ? 'bg-teal-50 text-teal-600' : 'bg-gray-100 text-gray-400'}`}>
                          {ann.is_active ? 'Live Broadcast' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-2xl line-clamp-3">
                        {ann.message}
                      </p>
                    </div>
                    {ann.url && (
                      <p className="text-xs text-[#00b48f] font-bold mt-2 truncate">
                        🔗 Action Link: <a href={ann.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{ann.url}</a>
                      </p>
                    )}
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2 block">
                      Published {new Date(ann.created_at).toLocaleDateString()} at {new Date(ann.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex md:flex-col gap-2 justify-center shrink-0 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[150px]">
                    <button
                      onClick={async () => {
                        const targetStatus = !ann.is_active;
                        try {
                          if (targetStatus) {
                            // Deactivate others
                            await supabase.from('announcements').update({ is_active: false } as any).eq('is_active', true);
                          }
                          const { error } = await supabase.from('announcements').update({ is_active: targetStatus } as any).eq('id', ann.id);
                          if (error) {
                            toast.error("Failed to update: " + error.message);
                          } else {
                            setAnnouncements(prev => prev.map(a => {
                              if (a.id === ann.id) return { ...a, is_active: targetStatus };
                              if (targetStatus) return { ...a, is_active: false }; // deactivate others
                              return a;
                            }));
                            toast.success(targetStatus ? "Announcement broadcast is active!" : "Announcement deactivated.");
                          }
                        } catch (e) {
                          toast.error("Database connection failure");
                        }
                      }}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer text-center ${ann.is_active ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border border-yellow-200' : 'bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white border border-teal-100'}`}
                    >
                      {ann.is_active ? 'Deactivate' : 'Activate Live'}
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm('Are you sure you want to delete this announcement?')) return;
                        try {
                          const { error } = await supabase.from('announcements').delete().eq('id', ann.id);
                          if (error) {
                            toast.error("Failed to delete: " + error.message);
                          } else {
                            setAnnouncements(prev => prev.filter(a => a.id !== ann.id));
                            toast.success("Announcement deleted successfully.");
                          }
                        } catch (e) {
                          toast.error("Database deletion error");
                        }
                      }}
                      className="w-full bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm cursor-pointer text-center"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {announcements.length === 0 && (
                <div className="bg-white p-16 rounded-3xl border border-gray-100 text-center text-gray-400 shadow-sm flex flex-col items-center justify-center gap-4">
                  <span className="text-5xl">📢</span>
                  <p className="font-bold text-lg text-gray-500 uppercase tracking-widest">No Announcements Drafted</p>
                  <p className="text-sm text-gray-400 max-w-sm">Draft announcements above to communicate new deals, membership discounts, or platform updates to landing users.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── CAREERS CONTROL PANEL ─── */}
        {section === 'careers' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header & Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h1 className="text-3xl font-extrabold text-[#00579e]">Careers Control Center</h1>
              <button
                onClick={() => setIsCreatingVacancy(!isCreatingVacancy)}
                className="bg-[#00b48f] hover:bg-teal-600 text-white text-xs font-black uppercase tracking-widest px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 active:scale-95 cursor-pointer self-start sm:self-auto"
              >
                {isCreatingVacancy ? 'Close Form' : '+ Publish Job Vacancy'}
              </button>
            </div>

            {/* Creation Form */}
            {isCreatingVacancy && (
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl max-w-3xl animate-in fade-in slide-in-from-top-4 duration-300">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span>💼</span> Publish New Job Vacancy
                </h3>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Job Role / Title *</label>
                      <input 
                        type="text"
                        required
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 text-gray-800 font-bold"
                        value={newVacancy.role}
                        onChange={(e) => setNewVacancy({ ...newVacancy, role: e.target.value })}
                        placeholder="e.g. Senior Frontend Architect"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Required Experience *</label>
                      <input 
                        type="text"
                        required
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 text-gray-700 font-medium"
                        value={newVacancy.min_experience}
                        onChange={(e) => setNewVacancy({ ...newVacancy, min_experience: e.target.value })}
                        placeholder="e.g. 3+ Years"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Job Description & Responsibilities *</label>
                    <textarea 
                      required
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 text-gray-700 font-medium resize-none"
                      value={newVacancy.description}
                      onChange={(e) => setNewVacancy({ ...newVacancy, description: e.target.value })}
                      placeholder="Outline core requirements, duties, and technology stack..."
                      rows={5}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Application Deadline *</label>
                    <input 
                      type="date"
                      required
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 text-gray-700 font-medium cursor-pointer"
                      value={newVacancy.last_date}
                      onChange={(e) => setNewVacancy({ ...newVacancy, last_date: e.target.value })}
                    />
                  </div>

                  <button 
                    onClick={async () => {
                      if (!newVacancy.role || !newVacancy.min_experience || !newVacancy.description || !newVacancy.last_date) {
                        toast.error("Please fill out all required fields");
                        return;
                      }
                      setIsSubmittingVacancy(true);
                      try {
                        const { data, error } = await supabase.from('job_vacancies').insert({
                          role: newVacancy.role,
                          min_experience: newVacancy.min_experience,
                          description: newVacancy.description,
                          last_date: newVacancy.last_date,
                          is_active: true
                        } as any).select().single();

                        if (error) {
                          toast.error("Failed to publish vacancy: " + error.message);
                        } else if (data) {
                          setVacancies(prev => [data, ...prev]);
                          toast.success("Job vacancy published successfully!");
                          setIsCreatingVacancy(false);
                          setNewVacancy({ role: '', min_experience: '', description: '', last_date: '' });
                        }
                      } catch (err) {
                        toast.error("Database connection failure. Ensure migrations have run.");
                      } finally {
                        setIsSubmittingVacancy(false);
                      }
                    }}
                    disabled={isSubmittingVacancy}
                    className="w-full bg-[#00579e] hover:bg-[#1a3a61] text-white text-xs font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-blue-500/10 transition-all active:scale-95 disabled:opacity-50 mt-4 cursor-pointer text-center"
                  >
                    {isSubmittingVacancy ? 'Publishing...' : 'Publish & Make Live'}
                  </button>
                </div>
              </div>
            )}

            {/* Split Management Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Left Column: Vacancies List */}
              <div className="lg:col-span-1 space-y-4">
                <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest px-2">Job Vacancies Feed ({vacancies.length})</h3>
                <div className="flex flex-col gap-4">
                  {vacancies.map(vac => (
                    <div key={vac.id} className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col justify-between ${vac.is_active ? 'border-teal-100' : 'opacity-60 bg-gray-50'}`}>
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-800 text-base">{vac.role}</h4>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${vac.is_active ? 'bg-teal-50 text-teal-600' : 'bg-gray-100 text-gray-400'}`}>
                            {vac.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Exp: {vac.min_experience}</p>
                        <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed whitespace-pre-wrap">{vac.description}</p>
                      </div>

                      <div className="border-t border-gray-100 mt-4 pt-4 flex gap-2 justify-end">
                        <button
                          onClick={async () => {
                            const newStatus = !vac.is_active;
                            const { error } = await supabase.from('job_vacancies').update({ is_active: newStatus } as any).eq('id', vac.id);
                            if (error) {
                              toast.error("Failed to update status");
                            } else {
                              setVacancies(prev => prev.map(v => v.id === vac.id ? { ...v, is_active: newStatus } : v));
                              toast.success(newStatus ? "Vacancy activated." : "Vacancy deactivated.");
                            }
                          }}
                          className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${vac.is_active ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' : 'bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white border border-teal-100'}`}
                        >
                          {vac.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm('Are you sure you want to delete this vacancy?')) return;
                            const { error } = await supabase.from('job_vacancies').delete().eq('id', vac.id);
                            if (error) {
                              toast.error("Failed to delete vacancy");
                            } else {
                              setVacancies(prev => prev.filter(v => v.id !== vac.id));
                              toast.success("Vacancy deleted.");
                            }
                          }}
                          className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {vacancies.length === 0 && (
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center text-gray-400 font-medium shadow-sm">No vacancies published.</div>
                  )}
                </div>
              </div>

              {/* Right Column: Applications Auditor */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                  <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest">Candidate Applications</h3>
                  
                  {/* Filters */}
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={careerFilterRole}
                      onChange={(e) => setCareerFilterRole(e.target.value)}
                      className="bg-white border text-[11px] font-bold text-gray-600 border-gray-200 outline-none px-3 py-1.5 rounded-lg shadow-sm focus:border-teal-500 cursor-pointer"
                    >
                      <option value="all">All Profiles</option>
                      <option value="general">Self-Applied / General</option>
                      {vacancies.map(vac => (
                        <option key={vac.id} value={vac.id}>{vac.role}</option>
                      ))}
                    </select>

                    <select
                      value={careerFilterStatus}
                      onChange={(e) => setCareerFilterStatus(e.target.value)}
                      className="bg-white border text-[11px] font-bold text-gray-600 border-gray-200 outline-none px-3 py-1.5 rounded-lg shadow-sm focus:border-teal-500 cursor-pointer"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Audit Grid list */}
                <div className="flex flex-col gap-4">
                  {jobApplications
                    .filter(app => {
                      if (careerFilterRole === 'all') return true;
                      if (careerFilterRole === 'general') return app.vacancy_id === null;
                      return app.vacancy_id === careerFilterRole;
                    })
                    .filter(app => {
                      if (careerFilterStatus === 'all') return true;
                      return app.status === careerFilterStatus;
                    })
                    .map(app => (
                      <div
                        key={app.id}
                        onClick={() => setSelectedApp(app)}
                        className={`bg-white rounded-2xl border shadow-sm p-5 cursor-pointer hover:shadow-md hover:translate-x-0.5 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-l-4 ${
                          app.status === 'shortlisted' ? 'border-l-teal-400' : app.status === 'rejected' ? 'border-l-red-400' : 'border-l-yellow-400'
                        }`}
                      >
                        <div className="flex-1 min-w-0 text-left">
                          <h4 className="font-bold text-gray-800 text-base">{app.full_name}</h4>
                          <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-wider">
                            Role: <span className="text-[#00579e]">{app.vacancy?.role || 'Self-Applied / General'}</span> &nbsp;·&nbsp; Exp: {app.experience}
                          </p>
                          <p className="text-[10px] text-gray-400 font-medium mt-1 truncate">📞 {app.phone} &nbsp;·&nbsp; ✉️ {app.email} &nbsp;·&nbsp; Applied {new Date(app.created_at).toLocaleDateString()}</p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                            app.status === 'shortlisted' ? 'bg-teal-50 text-teal-700' : app.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-700'
                          }`}>
                            {app.status}
                          </span>
                          <div className="flex gap-1.5">
                            {app.status !== 'shortlisted' && (
                              <button
                                onClick={async () => {
                                  const { error } = await supabase.from('job_applications').update({ status: 'shortlisted' } as any).eq('id', app.id);
                                  if (error) toast.error("Failed to shortlist candidate");
                                  else {
                                    setJobApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: 'shortlisted' } : a));
                                    toast.success("Candidate Shortlisted");
                                  }
                                }}
                                className="bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white p-2 rounded-lg transition-colors text-xs font-bold cursor-pointer"
                                title="Shortlist Candidate"
                              >
                                ✓
                              </button>
                            )}
                            {app.status !== 'rejected' && (
                              <button
                                onClick={async () => {
                                  const { error } = await supabase.from('job_applications').update({ status: 'rejected' } as any).eq('id', app.id);
                                  if (error) toast.error("Failed to reject candidate");
                                  else {
                                    setJobApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: 'rejected' } : a));
                                    toast.success("Candidate Application Rejected");
                                  }
                                }}
                                className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded-lg transition-colors text-xs font-bold cursor-pointer"
                                title="Reject Application"
                              >
                                ✗
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  {jobApplications.filter(app => {
                    if (careerFilterRole === 'all') return true;
                    if (careerFilterRole === 'general') return app.vacancy_id === null;
                    return app.vacancy_id === careerFilterRole;
                  }).filter(app => {
                    if (careerFilterStatus === 'all') return true;
                    return app.status === careerFilterStatus;
                  }).length === 0 && (
                    <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center text-gray-400 font-medium shadow-sm">No candidate applications match this filter query.</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* LEAD MODAL POPUP */}
      {selectedLead && (
        <div className="fixed inset-0 bg-[#112743]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedLead(null)} 
              className="absolute top-4 right-4 h-8 w-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition-colors cursor-pointer z-[100]"
            >
              ✕
            </button>

            {/* Header */}
            <div className="bg-[#00579e] p-6 text-white pb-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 opacity-10">
                  <svg width="150" height="150" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                  </svg>
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-[#56bdfa] mb-1 relative z-10">Buyer Lead Details</p>
               <h2 className="text-2xl font-black relative z-10 mb-1">{selectedLead.user?.first_name} {selectedLead.user?.last_name}</h2>
               <p className="text-sm text-blue-100 font-bold relative z-10 uppercase tracking-wider">📞 {selectedLead.user?.phone_number} &nbsp;|&nbsp; ✉️ {selectedLead.user?.email}</p>
            </div>

            {/* Content Body */}
            <div className="p-6">
               <div className="mb-6 -mt-8 relative z-20">
                 <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Target Property</p>
                    <Link 
                       href={`/properties/${selectedLead.property?.id}`} 
                       target="_blank"
                       rel="noopener noreferrer"
                       className="text-xl font-bold text-[#00579e] hover:underline flex items-center gap-2 group"
                    >
                       {selectedLead.property?.property_type} in {selectedLead.property?.city}
                       <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                    </Link>
                 </div>
               </div>

               <div className="mb-6 pl-4 border-l-2 border-teal-200">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Buyer's Message</p>
                  <p className="text-sm text-gray-700 italic">"{selectedLead.message}"</p>
               </div>

               <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Assigned Agent / Owner</p>
                  <p className="text-sm font-bold text-gray-800">{selectedLead.property?.owner?.first_name} {selectedLead.property?.owner?.last_name}</p>
                  <p className="text-xs text-gray-600 font-bold">📞 {selectedLead.property?.owner?.phone_number || 'N/A'}</p>
                  <p className="text-xs text-gray-600 font-bold">✉️ {selectedLead.property?.owner?.email || 'N/A'}</p>
               </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-gray-50 p-4 px-6 border-t border-gray-100 flex justify-between items-center bg-gray-50 rounded-b-3xl">
               <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${selectedLead.status === 'contacted' ? 'bg-teal-100 text-teal-800' : 'bg-yellow-100 text-yellow-800'}`}>
                 Status: {selectedLead.status}
               </span>
               
               {selectedLead.status === 'pending' && (
                 <button 
                   onClick={() => {
                     updateInterestStatus(selectedLead.id, 'contacted');
                     setSelectedLead(null);
                   }}
                   className="bg-[#00579e] hover:bg-[#1a3a61] text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                 >
                   Mark as Contacted
                 </button>
               )}
            </div>
          </div>
        </div>
      )}

      {/* CANDIDATE APPLICATION DETAIL MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 bg-[#112743]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedApp(null)}>
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedApp(null)} className="absolute top-4 right-4 h-8 w-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-black transition-colors cursor-pointer z-[100]">✕</button>

            {/* Header */}
            <div className="bg-[#00579e] p-6 text-white pb-8 relative overflow-hidden text-left">
               <div className="absolute top-0 right-0 opacity-10">
                  <Briefcase className="w-32 h-32" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-[#56bdfa] mb-1 relative z-10">Candidate Application</p>
               <h2 className="text-2xl font-black relative z-10 mb-1">{selectedApp.full_name}</h2>
               <p className="text-xs text-blue-100 font-bold relative z-10 uppercase tracking-wider">📞 {selectedApp.phone} &nbsp;|&nbsp; ✉️ {selectedApp.email}</p>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6 text-left">
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                     <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Target Profile</p>
                     <p className="text-sm font-bold text-gray-800">{selectedApp.vacancy?.role || 'Self-Applied / General'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                     <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Applicant Experience</p>
                     <p className="text-sm font-bold text-gray-800">{selectedApp.experience}</p>
                  </div>
               </div>

               {selectedApp.cover_letter && (
                 <div className="pl-4 border-l-2 border-teal-300">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Cover Note / Experience Details</p>
                    <p className="text-sm text-gray-700 italic leading-relaxed">"{selectedApp.cover_letter}"</p>
                 </div>
               )}

               {/* Clickable Resume Link */}
               {selectedApp.resume_url && (
                 <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <span className="text-2xl">📄</span>
                       <div>
                          <p className="text-xs font-black text-teal-800 uppercase tracking-wider">Resume Document</p>
                          <p className="text-[10px] text-teal-600 font-bold">PDF / Word file attached by candidate</p>
                       </div>
                    </div>
                    <a 
                      href={selectedApp.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white text-teal-600 border border-teal-200 hover:bg-teal-600 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      View Resume Document ↗
                    </a>
                 </div>
               )}
            </div>

            {/* Footer Actions */}
            <div className="bg-gray-50 p-4 px-6 border-t border-gray-100 flex justify-between items-center bg-gray-50 rounded-b-3xl">
               <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${
                 selectedApp.status === 'shortlisted' ? 'bg-teal-100 text-teal-800' : selectedApp.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
               }`}>
                 Status: {selectedApp.status}
               </span>
               
               <div className="flex gap-2">
                 {selectedApp.status !== 'shortlisted' && (
                   <button 
                     onClick={async () => {
                       const { error } = await supabase.from('job_applications').update({ status: 'shortlisted' } as any).eq('id', selectedApp.id);
                       if (error) toast.error("Failed to update status");
                       else {
                         setJobApplications(prev => prev.map(a => a.id === selectedApp.id ? { ...a, status: 'shortlisted' } : a));
                         setSelectedApp(prev => ({ ...prev, status: 'shortlisted' }));
                         toast.success("Candidate Shortlisted");
                       }
                     }}
                     className="bg-[#00b48f] hover:bg-teal-600 text-white text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-lg transition-all shadow-md cursor-pointer"
                   >
                     Shortlist
                   </button>
                 )}
                 {selectedApp.status !== 'rejected' && (
                   <button 
                     onClick={async () => {
                       const { error } = await supabase.from('job_applications').update({ status: 'rejected' } as any).eq('id', selectedApp.id);
                       if (error) toast.error("Failed to update status");
                       else {
                         setJobApplications(prev => prev.map(a => a.id === selectedApp.id ? { ...a, status: 'rejected' } : a));
                         setSelectedApp(prev => ({ ...prev, status: 'rejected' }));
                         toast.success("Application Rejected");
                       }
                     }}
                     className="bg-red-50 text-red-500 border border-red-200 hover:bg-red-500 hover:text-white text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-lg transition-all shadow-md cursor-pointer"
                   >
                     Reject
                   </button>
                 )}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* AGENT DETAIL MODAL */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-[#112743]/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4" onClick={() => setSelectedAgent(null)}>
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedAgent(null)} className="absolute top-4 right-4 h-8 w-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition-colors cursor-pointer z-[100]">✕</button>

            {/* Header */}
            <div className="bg-gradient-to-r from-[#00b48f] to-[#00579e] p-6 text-white pb-10 relative overflow-hidden">
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-green-200 mb-2 relative z-10">Verified Agent Profile</p>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-white font-black text-2xl border border-white/30">
                  {selectedAgent.first_name?.[0]}{selectedAgent.last_name?.[0]}
                </div>
                <div>
                  <h2 className="text-2xl font-black mb-0.5">{selectedAgent.first_name} {selectedAgent.last_name}</h2>
                  <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-widest">🎖️ Active Agent</span>
                </div>
              </div>
            </div>

            {/* Content Split Layout */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 -mt-6 relative z-10">
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 space-y-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Core Contact Info</p>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</p>
                      <p className="text-sm font-bold text-gray-800 break-all">{selectedAgent.email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Phone</p>
                      <p className="text-sm font-bold text-gray-800">{selectedAgent.phone_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Role</p>
                      <span className="text-xs font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase">{selectedAgent.role}</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Joined</p>
                      <p className="text-sm font-bold text-gray-800">{new Date(selectedAgent.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
                  <p className="text-xs font-black text-red-700 uppercase tracking-widest mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    Account Control
                  </p>
                  <p className="text-[10px] text-red-500 mb-4 font-bold leading-relaxed uppercase tracking-tight">Suspending resets role to Seller and invalidates ID.</p>
                  <button
                    onClick={() => suspendAgent(selectedAgent.id)}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl transition-all active:scale-[0.98] shadow-md shadow-red-100"
                  >
                    Suspend Agent
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Application Details Integration */}
                {(() => {
                  const app = agentApps.find(a => a.user_id === selectedAgent.id && a.status === 'approved');
                  if (!app) return (
                    <div className="bg-gray-50 rounded-2xl p-8 border border-dashed border-gray-200 text-center flex flex-col items-center justify-center h-full">
                      <p className="text-4xl mb-3">📄</p>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No detailed application found</p>
                    </div>
                  );
                  return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-inner">
                        <p className="text-[10px] font-black text-[#00b48f] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#00b48f]"></span>
                          Verified Credentials
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          {app.experience && (
                            <div>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Exp.</p>
                              <p className="text-xs font-bold text-gray-800">{app.experience}</p>
                            </div>
                          )}
                          {app.skills && (
                            <div>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Top Skills</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {Array.isArray(app.skills) 
                                  ? app.skills.slice(0,2).map((s: string, i: number) => <span key={i} className="px-1.5 py-0.5 bg-white text-emerald-600 text-[8px] font-black uppercase rounded border border-emerald-100">{s}</span>)
                                  : null
                                }
                              </div>
                            </div>
                          )}
                        </div>

                        {(app.reason || app.notes) && (
                          <div className="mb-6">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Statement</p>
                            <p className="text-[11px] text-gray-600 italic leading-relaxed line-clamp-3">"{app.reason || app.notes}"</p>
                          </div>
                        )}

                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { label: 'ID', url: app.aadhaar_url, icon: '🆔' },
                            { label: 'PAN', url: app.pan_url, icon: '💳' },
                            { label: 'Cert', url: app.certificate_url, icon: '🎓' },
                            { label: 'CV', url: app.resume_url, icon: '💼' }
                          ].map((doc, idx) => doc.url ? (
                            <a key={idx} href={doc.url} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center py-3 px-1 rounded-2xl bg-white border border-gray-100 hover:border-[#00b48f] hover:shadow-lg transition-all group">
                               <span className="text-xl mb-1 group-hover:scale-110 transition-transform">{doc.icon}</span>
                               <span className="text-[8px] font-black text-gray-400 uppercase">{doc.label}</span>
                            </a>
                          ) : null)}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AGENT APPLICATION DETAILS MODAL */}
      {selectedAgentApp && (
        <div className="fixed inset-0 bg-[#112743]/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-6xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="bg-[#112743] px-8 py-6 flex items-center justify-between">
                <div>
                   <h3 className="text-white text-2xl font-black tracking-tight">Review Application</h3>
                   <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Submitted {new Date(selectedAgentApp.created_at).toLocaleString()}</p>
                </div>
                <button onClick={() => setSelectedAgentApp(null)} className="text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
             </div>
             
             <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[88vh] overflow-y-auto">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Applicant Name</p>
                        <p className="font-bold text-gray-900">{selectedAgentApp.full_name || `${selectedAgentApp.user?.first_name} ${selectedAgentApp.user?.last_name}`}</p>
                     </div>
                     <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</p>
                        <p className="font-bold text-gray-900 break-all text-xs">{selectedAgentApp.email || selectedAgentApp.user?.email}</p>
                     </div>
                  </div>

                  {(selectedAgentApp.reason || selectedAgentApp.notes) && (
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Professional Statement / Reason</p>
                       <p className="text-sm text-gray-700 leading-relaxed font-medium italic">
                         "{selectedAgentApp.reason || selectedAgentApp.notes}"
                       </p>
                    </div>
                  )}

                  {selectedAgentApp.skills && (
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                         <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                         Reported Skills
                       </p>
                       <div className="flex flex-wrap gap-1.5">
                          {Array.isArray(selectedAgentApp.skills) 
                             ? selectedAgentApp.skills.map((s: string, i: number) => <span key={i} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase rounded-lg border border-emerald-100">{s}</span>)
                             : typeof selectedAgentApp.skills === 'string' ? selectedAgentApp.skills.split(',').map((s: string, i: number) => <span key={i} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase rounded-lg border border-emerald-100">{s.trim()}</span>)
                             : null
                          }
                       </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                     Verification Documents
                   </p>
                   <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Aadhaar', url: selectedAgentApp.aadhaar_url, icon: '🆔' },
                        { label: 'PAN Card', url: selectedAgentApp.pan_url, icon: '💳' },
                        { label: 'Certificate', url: selectedAgentApp.certificate_url, icon: '🎓' },
                        { label: 'Resume', url: selectedAgentApp.resume_url, icon: '💼' }
                      ].map((doc, idx) => doc.url ? (
                        <a 
                          key={idx}
                          href={doc.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-[#00b48f] hover:bg-teal-50 transition-all duration-300 group hover:-translate-y-1"
                        >
                           <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{doc.icon}</span>
                           <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 group-hover:text-[#00b48f]">{doc.label}</span>
                        </a>
                      ) : (
                        <div key={idx} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 border border-dashed border-gray-200 opacity-40">
                           <span className="text-3xl mb-2 grayscale">{doc.icon}</span>
                           <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{doc.label}</span>
                        </div>
                      ))}
                   </div>

                   {selectedAgentApp.status === 'pending' && (
                     <div className="flex gap-3 pt-6 border-t border-gray-100">
                        <button onClick={() => { handleRejectAgent(selectedAgentApp.id); setSelectedAgentApp(null); }} className="flex-1 px-5 py-4 text-xs font-black uppercase tracking-widest bg-white text-red-500 border border-red-200 hover:bg-red-50 rounded-xl transition-colors">Reject</button>
                        <button onClick={() => { handleApproveAgent(selectedAgentApp.id, selectedAgentApp.user_id); setSelectedAgentApp(null); }} className="flex-[2] px-5 py-4 text-xs font-black uppercase tracking-widest bg-[#00b48f] text-white hover:bg-teal-600 rounded-xl transition-colors shadow-lg shadow-teal-500/20">Approve Agent</button>
                     </div>
                   )}
                </div>
             </div>

             <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50 rounded-b-3xl">
                <button onClick={() => setSelectedAgentApp(null)} className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">Close Review</button>
             </div>
          </div>
        </div>
      )}

      {/* CREATE PLAN MODAL */}
      {isCreatingPlan && (
        <div className="fixed inset-0 bg-[#112743]/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="bg-[#00579e] px-8 py-6 flex items-center justify-between">
                <div>
                   <h3 className="text-white text-2xl font-black tracking-tight">Create New Plan</h3>
                   <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Configure pricing and features</p>
                </div>
                <button onClick={() => setIsCreatingPlan(false)} className="text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
             </div>
             
             <div className="p-8 max-h-[85vh] overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-4">
                      <div>
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Plan Name</label>
                         <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 font-bold text-[#112743]" placeholder="e.g. Pro Membership" value={newPlan.name} onChange={e => setNewPlan({...newPlan, name: e.target.value})} />
                      </div>
                      <div>
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Description</label>
                         <textarea className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 font-medium text-[#112743] text-sm resize-none" rows={3} placeholder="Brief description..." value={newPlan.description} onChange={e => setNewPlan({...newPlan, description: e.target.value})} />
                      </div>
                      <div>
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Plan Type</label>
                         <select 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 font-bold text-[#112743] text-sm cursor-pointer" 
                            value={newPlan.type} 
                            onChange={e => {
                               const val = e.target.value;
                               setNewPlan({
                                  ...newPlan, 
                                  type: val,
                                  duration_days: val === 'credit_pack' ? '30' : newPlan.duration_days
                               });
                            }}
                         >
                            <option value="subscription">Subscription</option>
                            <option value="single_unlock">Single Unlock</option>
                            <option value="credit_pack">Credit Pack</option>
                         </select>
                      </div>
                   </div>
                   
                   <div className="space-y-4">
                      <div>
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Price (INR)</label>
                         <input type="number" min="0" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 font-black text-[#112743]" placeholder="e.g. 999" value={newPlan.price} onChange={e => setNewPlan({...newPlan, price: e.target.value})} />
                      </div>
                      <div>
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Duration (Days)</label>
                         <input 
                            type="number" 
                            min="0" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 font-black text-[#112743] disabled:opacity-60 disabled:cursor-not-allowed" 
                            placeholder="e.g. 30" 
                            value={newPlan.type === 'credit_pack' ? 30 : newPlan.duration_days} 
                            disabled={newPlan.type === 'credit_pack'}
                            onChange={e => setNewPlan({...newPlan, duration_days: e.target.value})} 
                         />
                      </div>
                      {newPlan.type === 'credit_pack' && (
                         <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Credits Awarded</label>
                            <input type="number" min="0" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 font-black text-[#112743]" placeholder="e.g. 50" value={newPlan.credits_awarded} onChange={e => setNewPlan({...newPlan, credits_awarded: e.target.value})} />
                         </div>
                      )}
                      <div>
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block flex items-center justify-between">
                            <span>Features (One per line)</span>
                         </label>
                         <textarea className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 font-medium text-[#112743] text-xs resize-none" rows={4} placeholder={"Feature 1\nFeature 2\nFeature 3"} value={Array.isArray(newPlan.features) ? newPlan.features.join('\n') : newPlan.features} onChange={e => setNewPlan({...newPlan, features: e.target.value.split('\n')})} />
                      </div>
                   </div>
                </div>
             </div>

             <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-3xl">
                <button onClick={() => setIsCreatingPlan(false)} className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-800 transition-colors cursor-pointer bg-white border border-gray-200 rounded-xl shadow-sm">Cancel</button>
                <button onClick={handleCreatePlan} disabled={isSubmittingPlan} className="px-8 py-2.5 text-xs font-black uppercase tracking-widest text-white bg-[#00b48f] hover:bg-teal-600 rounded-xl shadow-lg shadow-teal-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                   {isSubmittingPlan ? 'Creating...' : 'Create Plan'}
                </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<PremiumLoader />}>
      <AdminDashboardContent />
    </Suspense>
  );
}
