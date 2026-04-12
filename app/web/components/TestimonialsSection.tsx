'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function TestimonialsSection() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          user:profiles(first_name, last_name),
          property:properties(property_type, city)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(5);

      const staticReviews = [
        {
          id: 'static-1',
          user: { first_name: 'Rahul', last_name: 'Sharma' },
          property: { property_type: 'Apartment', city: 'Mumbai' },
          rating: 5,
          comment: "Bhavyam Properties made finding our dream home incredibly easy! Their verified listings and secure platform gave my family immense peace of mind."
        },
        {
          id: 'static-2',
          user: { first_name: 'Priya', last_name: 'Patel' },
          property: { property_type: 'Villa', city: 'Pune' },
          rating: 5,
          comment: "The direct expert access feature saved me so much time. I was able to connect directly with the owner without agent hurdles. A top-notch real estate experience."
        }
      ];

      const tableReviews = data || [];
      setReviews([...tableReviews, ...staticReviews]);
    };
    fetchReviews();
  }, []);

  if (reviews.length === 0) return null;

  const nextReview = () => setCurrentIndex((prev) => (prev + 1) % reviews.length);
  const prevReview = () => setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);

  const currentReview = reviews[currentIndex];

  return (
    <section className="py-24 px-4 md:px-8 bg-[var(--color-cloud)] relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10 text-center">
        
        {/* Header */}
        <div className="mb-16 relative">
           <div 
             className="absolute md:-top-16 left-1/2 -translate-x-1/2 text-[80px] md:text-[140px] leading-none font-black text-[var(--color-emerald-heritage)] opacity-5 select-none z-[-1] pointer-events-none tracking-[-0.04em] whitespace-nowrap" 
           >
             Testimonials
           </div>
           <p className="text-[var(--color-emerald-heritage)] font-bold text-[10px] md:text-sm tracking-[0.2em] uppercase mb-4 flex justify-center items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-emerald-heritage)]"></span>
              CUSTOMER REVIEWS
           </p>
           <h2 className="text-[32px] md:text-[40px] font-black text-[var(--color-near-black)] tracking-[-0.04em]">
             What Our Customers Say
           </h2>
        </div>

        {/* Testimonial Carousel Box */}
        <div className="relative max-w-5xl mx-auto flex items-center justify-center">
           
           {/* Left Arrow */}
           <button onClick={prevReview} className="absolute -left-5 md:-left-8 z-[100] w-[50px] h-[50px] bg-[var(--color-pure-white)] rounded-full flex items-center justify-center shadow-[var(--shadow-ambient)] hover:bg-[var(--color-emerald-heritage)] hover:text-white transition-colors text-[var(--color-slate)] border border-white/50 group cursor-pointer focus:outline-none">
             <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
             </svg>
           </button>

           {/* Main Card */}
           <div className="bg-[var(--color-pure-white)] rounded-3xl shadow-[var(--shadow-ambient)] w-full flex flex-col md:flex-row overflow-hidden relative z-10 animate-in fade-in zoom-in duration-300" key={currentReview.id}>
              
              {/* Image Side */}
              <div className="md:w-5/12 h-[300px] md:h-auto relative bg-[var(--color-slate)] flex items-center justify-center">
                 <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-emerald-heritage)] to-[#1a3a61] opacity-90"></div>
                 <div className="relative z-10 text-white text-center p-8">
                    <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-6 backdrop-blur-sm border border-white/30 flex items-center justify-center text-4xl font-black">
                       {(currentReview.user?.first_name?.[0] || 'U')}
                    </div>
                    <p className="font-bold text-xl mb-1 tracking-wide">{currentReview.user?.first_name} {currentReview.user?.last_name}</p>
                    <p className="text-white/70 text-sm font-medium uppercase tracking-widest">
                       {currentReview.property?.property_type || 'Platform'} User
                    </p>
                 </div>
              </div>

              {/* Content Side */}
              <div className="md:w-7/12 p-8 md:p-14 text-left flex flex-col justify-center bg-[var(--color-pure-white)] relative">
                 
                 {/* Quote Mark Watermark */}
                 <div className="absolute top-10 left-8 text-[120px] font-serif leading-none text-[var(--color-emerald-heritage)] opacity-10 select-none z-0">
                   "
                 </div>
                 <div className="absolute bottom-10 right-10 text-[120px] font-serif leading-none text-[var(--color-emerald-heritage)] opacity-10 select-none z-0 rotate-180">
                   "
                 </div>

                 <div className="relative z-10">
                    <div className="flex gap-1 mb-6">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <svg key={idx} className={`w-[22px] h-[22px] ${idx < currentReview.rating ? 'text-[#ffb600]' : 'text-gray-200'} fill-current`} viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>

                    <p className="text-[var(--color-slate)] text-[17px] md:text-[18px] leading-relaxed italic mb-8 font-medium line-clamp-4">
                      "{currentReview.comment}"
                    </p>

                    <div>
                      <h4 className="text-[22px] font-bold text-[var(--color-near-black)] mb-1 tracking-[-0.04em]">{currentReview.user?.first_name} {currentReview.user?.last_name}</h4>
                      <p className="text-[var(--color-emerald-heritage)] font-bold text-[14px] uppercase tracking-[0.1em]">
                        {currentReview.property ? `Purchased in ${currentReview.property.city}` : 'Verified Customer'}
                      </p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Right Arrow */}
           <button onClick={nextReview} className="absolute -right-5 md:-right-8 z-[100] w-[50px] h-[50px] bg-[var(--color-pure-white)] rounded-full flex items-center justify-center shadow-[var(--shadow-ambient)] hover:bg-[var(--color-emerald-heritage)] hover:text-white transition-colors text-[var(--color-slate)] border border-white/50 group cursor-pointer focus:outline-none">
             <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
             </svg>
           </button>

        </div>
      </div>
    </section>
  );
}
