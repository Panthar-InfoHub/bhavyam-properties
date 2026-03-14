'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function ReviewSystem({ propertyId }: { propertyId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState('');
  const [msgType, setMsgType] = useState<'error'|'success'>('error');
  
  const router = useRouter();

  // Load reviews on mount
  useEffect(() => {
    const initReviewSystem = async () => {
       const user = await getCurrentUser();
       setCurrentUser(user);

       // Safely fetch APPROVED reviews ONLY via API mapping
       const { data, error } = await supabase
         .from('reviews')
         .select(`
            id,
            rating,
            comment,
            created_at,
            user:profiles(first_name, last_name)
         `)
         .eq('property_id', propertyId)
         .eq('status', 'approved')
         .order('created_at', { ascending: false });
         
       if (!error && data) {
          setReviews(data);
       }
       setIsLoading(false);
    };
    initReviewSystem();
  }, [propertyId]);

  const validateComment = (text: string) => {
    // Basic regex checks to prevent 10-digit phone layouts or Emails
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/i;
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    return !emailRegex.test(text) && !phoneRegex.test(text);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg('');

    if (!currentUser) {
       router.push('/login');
       return;
    }
    
    if (comment.trim().length < 10) {
       setMsgType('error');
       setFormMsg('Review must be at least 10 characters long.');
       return;
    }

    // Explicit Rule Enforcement: No Contact Info allowed in reviews
    if (!validateComment(comment)) {
       setMsgType('error');
       setFormMsg('Security Violation: Reviews cannot contain Phone numbers or Email addresses.');
       return;
    }

    setIsSubmitting(true);
    
    try {
       const { error } = await supabase
         .from('reviews')
         .insert({
            user_id: currentUser.id,
            property_id: propertyId,
            rating,
            comment,
            status: 'pending' // Admin approval required explicitly
         });
         
       if (error) throw error;
       
       setComment('');
       setRating(5);
       setMsgType('success');
       setFormMsg('Thank you! Your verified review has been submitted to Administration for approval.');
       
    } catch (err: any) {
       console.error(err);
       setMsgType('error');
       setFormMsg('System error while posting review: ' + err.message);
    } finally {
       setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-16 border-t border-gray-100 pt-10">
      <h3 className="text-3xl font-extrabold text-[#00579e] mb-8">Property Reviews <span className="text-gray-400 text-lg font-medium inline-block ml-2">({reviews.length})</span></h3>
      
      {/* Existing Reviews List */}
      <div className="space-y-6 mb-12">
        {isLoading ? (
          <div className="flex justify-center p-8">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 p-8 rounded-2xl text-center">
            <p className="text-gray-500 font-medium">There are no approved reviews for this property yet.</p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="bg-white border border-gray-100 shadow-sm p-6 rounded-2xl flex flex-col items-start">
               <div className="flex justify-between w-full items-center mb-3">
                  <span className="font-bold text-gray-800">{rev.user?.first_name} {rev.user?.last_name}</span>
                  <span className="text-sm text-gray-400 font-medium">{new Date(rev.created_at).toLocaleDateString()}</span>
               </div>
               <div className="flex text-yellow-400 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className={`w-5 h-5 ${i < rev.rating ? 'fill-current' : 'text-gray-300 fill-current'}`} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
               </div>
               <p className="text-gray-600 leading-relaxed text-sm w-full">{rev.comment}</p>
            </div>
          ))
        )}
      </div>

      {/* Review Submission Form Container */}
      <div className="bg-zinc-900 rounded-3xl p-8 relative overflow-hidden shadow-xl">
         <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-3xl opacity-10 -mr-20 -mt-20"></div>

         <h4 className="text-2xl font-bold text-white mb-2">Leave a Verified Review</h4>
         <p className="text-zinc-400 text-sm mb-6">As per community guidelines, strict policy prohibits sharing raw emails or direct phone numbers within this space. All reviews are manually moderated before publishing.</p>
         
         {formMsg && (
            <div className={`p-4 rounded-xl mb-6 text-sm font-bold border ${msgType === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
               {formMsg}
            </div>
         )}
         
         <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4 relative z-10 w-full md:w-2/3">
            <div>
               <label className="block text-zinc-300 text-sm font-semibold uppercase tracking-widest mb-2">Rating</label>
               <select 
                 value={rating} 
                 onChange={(e) => setRating(Number(e.target.value))}
                 className="w-full bg-zinc-800 border border-zinc-700 text-white p-3 rounded-lg outline-none focus:border-teal-500"
               >
                 <option value="5">⭐⭐⭐⭐⭐ Excellent (5)</option>
                 <option value="4">⭐⭐⭐⭐ Great (4)</option>
                 <option value="3">⭐⭐⭐ Good (3)</option>
                 <option value="2">⭐⭐ Fair (2)</option>
                 <option value="1">⭐ Poor (1)</option>
               </select>
            </div>
            
            <div>
               <label className="block text-zinc-300 text-sm font-semibold uppercase tracking-widest mb-2">Secure Comment (No Contact Info)</label>
               <textarea 
                  required
                  rows={4} 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your structured insights or verified experiences..."
                  className="w-full bg-zinc-800 border border-zinc-700 text-white p-3 rounded-lg outline-none focus:border-teal-500 placeholder-zinc-500"
               ></textarea>
            </div>
            
            <button 
               type="submit"
               disabled={isSubmitting}
               className="w-auto bg-[#00b48f] hover:bg-teal-400 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-md self-start disabled:opacity-50 mt-2"
            >
               {isSubmitting ? 'Validating...' : 'Submit for Moderation'}
            </button>
         </form>
      </div>
    </div>
  );
}
