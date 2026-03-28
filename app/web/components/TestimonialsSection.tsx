'use client';

export default function TestimonialsSection() {
  return (
    <section className="py-24 px-4 md:px-8 bg-[#effbf8] relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10 text-center">
        
        {/* Header */}
        <div className="mb-16 relative">
           <div 
             className="absolute md:-top-16 left-1/2 -translate-x-1/2 text-[80px] md:text-[140px] leading-none font-black text-[#00c194]/5 select-none z-[-1] pointer-events-none tracking-widest whitespace-nowrap" 
             style={{ fontFamily: "'Brush Script MT', 'Comic Sans MS', cursive" }}
           >
             Testimonials
           </div>
           <p className="text-[#00c194] font-bold text-[13px] tracking-widest uppercase mb-4">
              CUSTOMER REVIEWS
           </p>
           <h2 className="text-[32px] md:text-[40px] font-black text-[#1a1a1a] tracking-tight">
             What Our Customer Say
           </h2>
        </div>

        {/* Testimonial Carousel Box */}
        <div className="relative max-w-5xl mx-auto flex items-center justify-center">
           
           {/* Left Arrow */}
           <button className="absolute -left-5 md:-left-8 z-20 w-[50px] h-[50px] bg-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:bg-[#00c194] hover:text-white transition-colors text-gray-600">
             <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
             </svg>
           </button>

           {/* Main Card */}
           <div className="bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] w-full flex flex-col md:flex-row overflow-hidden relative z-10 border border-gray-50">
              
              {/* Image Side */}
              <div className="md:w-5/12 h-[300px] md:h-auto relative">
                 <img 
                   src="https://placehold.co/800x800/eeeeee/999999?text=Customer+Meeting" 
                   alt="Customer" 
                   className="w-full h-full object-cover"
                 />
              </div>

              {/* Content Side */}
              <div className="md:w-7/12 p-8 md:p-14 text-left flex flex-col justify-center bg-white relative">
                 
                 {/* Quote Mark Watermark */}
                 <div className="absolute top-10 left-8 text-[120px] font-serif leading-none text-gray-100 select-none z-0">
                   "
                 </div>
                 <div className="absolute bottom-10 right-10 text-[120px] font-serif leading-none text-[#00c194]/10 select-none z-0 rotate-180">
                   "
                 </div>

                 <div className="relative z-10">
                    <div className="flex gap-1 mb-6">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="w-[22px] h-[22px] text-[#ffb600]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>

                    <p className="text-gray-500 text-[17px] md:text-[18px] leading-relaxed italic mb-8 font-medium">
                      Lorem, ipsum dolor sit amet consectetur adipisicing elit. Aliquid expedita recusandae ipsam quas fugit aperiam nihil nemo delectus laudantium? Enim est quibusdam dicta a.
                    </p>

                    <div>
                      <h4 className="text-[22px] font-bold text-[#1a1a1a] mb-1">John Doe</h4>
                      <p className="text-[#00c194] font-semibold text-[14px]">
                        • WordPress Developer
                      </p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Right Arrow */}
           <button className="absolute -right-5 md:-right-8 z-20 w-[50px] h-[50px] bg-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:bg-[#00c194] hover:text-white transition-colors text-gray-600">
             <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
             </svg>
           </button>

        </div>
      </div>
    </section>
  );
}
