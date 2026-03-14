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
  const [notes, setNotes] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    const checkState = async () => {
       const user = await getCurrentUser();
       if (!user) {
         router.push('/login');
         return;
       }

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
       setIsLoading(false);
    };
    checkState();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setIsSubmitting(true);
     try {
       const user = await getCurrentUser();
       if (!user) throw new Error("Authentication failed");

       const { error } = await supabase.from('agent_applications').insert([
          { user_id: user.id, notes }
       ]);

       if (error) throw error;
       
       setHasApplied(true);
       setAppStatus('pending');
       
     } catch (err: any) {
        alert("Error applying: " + err.message);
     } finally {
        setIsSubmitting(false);
     }
  };

  return (
    <div className="flex-1 w-full bg-[#fbfcfa] py-10 px-4 sm:px-8 min-h-[80vh]">
      <div className="max-w-3xl mx-auto">
         <h1 className="text-3xl font-extrabold text-[#00579e] mb-2 tracking-tight">Become an Agent</h1>
         <p className="text-gray-500 mb-8 border-b border-gray-200 pb-4">Unlock unlimited listings, bulk lead management, and verified profile badging.</p>

         {isLoading ? (
            <div className="flex justify-center p-12">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            </div>
         ) : hasApplied ? (
            <div className={`p-8 rounded-2xl shadow-sm border ${appStatus === 'pending' ? 'bg-yellow-50 border-yellow-200' : appStatus === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-teal-50 border-teal-200'}`}>
               <h3 className={`text-2xl font-bold mb-2 ${appStatus === 'pending' ? 'text-yellow-700' : appStatus === 'rejected' ? 'text-red-700' : 'text-teal-700'}`}>
                 Application {appStatus?.toUpperCase()}
               </h3>
               {appStatus === 'pending' && <p className="text-yellow-600">Your application is currently sitting in the Administration queue for review. You will be notified when it updates.</p>}
               {appStatus === 'rejected' && <p className="text-red-600">Your application was not approved. You must remain a standard Seller/Buyer at this time. Contact support for more info.</p>}
               {appStatus === 'approved' && <p className="text-teal-600">You are already approved! Refresh your browser to jump to your new dashboard.</p>}
            </div>
         ) : (
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
               <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="bg-teal-100 p-4 rounded-full text-teal-600">
                     <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                     <h3 className="text-xl font-bold text-gray-800">Agent Registration</h3>
                     <p className="text-gray-500 text-sm">Join the Bhavyam Properties network officially.</p>
                  </div>
               </div>
               
               <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div>
                     <label className="block text-gray-700 text-sm font-bold uppercase tracking-widest mb-2">Qualifications / Notes</label>
                     <textarea 
                        required
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Please explain your real estate experience and why you'd like to list bulk properties on our network..."
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 p-4 rounded-xl outline-none focus:border-teal-500 min-h-[150px]"
                     ></textarea>
                  </div>

                  <button 
                     type="submit"
                     disabled={isSubmitting}
                     className="w-full bg-[#00579e] hover:bg-blue-800 text-white font-bold py-4 rounded-xl transition-colors shadow-md disabled:opacity-50 text-lg uppercase tracking-wider"
                  >
                     {isSubmitting ? 'Uploading Application...' : 'Submit Application'}
                  </button>
               </form>
            </div>
         )}
      </div>
    </div>
  );
}
