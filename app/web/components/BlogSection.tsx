export default function BlogSection() {
  const blogs = [
    {
      date: '13',
      month: 'Aug',
      category: 'Real-estate',
      time: '1 Min',
      title: 'Develop Relationships With Human Resource',
      image: 'https://placehold.co/600x400/eeeeee/999999?text=Blog+1'
    },
    {
      date: '13',
      month: 'Aug',
      category: 'Building',
      time: '1 Min',
      title: 'Connect With Corporate Recruiters',
      image: 'https://placehold.co/600x400/eeeeee/999999?text=Blog+2'
    },
    {
      date: '13',
      month: 'Aug',
      category: 'Entertainment',
      time: '1 Min',
      title: 'Unique Real Estate Marketing: Have A Tent Business Card',
      image: 'https://placehold.co/600x400/eeeeee/999999?text=Blog+3'
    }
  ];

  return (
    <section className="py-24 px-4 md:px-8 bg-[var(--color-warm-ivory)] relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 relative">
           
           <div className="relative">
             <div 
               className="absolute md:-top-16 left-0 text-[80px] md:text-[140px] leading-none font-black text-[var(--color-emerald-heritage)] opacity-5 select-none z-[-1] pointer-events-none tracking-[-0.04em] whitespace-nowrap" 
             >
               Blogs
             </div>
             <p className="text-[var(--color-emerald-heritage)] font-bold text-[10px] md:text-sm tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-emerald-heritage)]"></span>
                WHAT'S NEW TRENDING
             </p>
             <h2 className="text-[32px] md:text-[40px] font-black text-[var(--color-near-black)] tracking-[-0.04em]">
               Latest Blog & Posts
             </h2>
           </div>

           <button className="mt-6 md:mt-0 bg-[var(--color-emerald-heritage)]/10 text-[var(--color-emerald-heritage)] font-bold text-[13px] uppercase tracking-[0.1em] px-8 py-3.5 rounded-full hover:bg-[var(--color-emerald-heritage)] hover:text-white transition-colors duration-300">
              See All Blogs
           </button>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {blogs.map((blog, idx) => (
             <div key={idx} className="bg-[var(--color-pure-white)] rounded-3xl shadow-[var(--shadow-ambient)] overflow-hidden group hover:-translate-y-2 hover:shadow-[var(--shadow-ambient-hover)] transition-all duration-300">
                
                {/* Image Box */}
                <div className="relative h-[240px] w-full overflow-hidden p-4 pb-0">
                   <div className="w-full h-full relative rounded-t-2xl overflow-hidden">
                     <img 
                       src={blog.image} 
                       alt={blog.title} 
                       className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                     />
                   </div>
                   
                   {/* Date Badge */}
                   <div className="absolute bottom-[-10px] left-8 bg-[var(--color-emerald-heritage)] text-white flex flex-col items-center justify-center w-[60px] h-[65px] rounded-xl z-10 shadow-lg group-hover:bg-[var(--color-emerald-mint)] transition-colors">
                      <span className="text-[22px] font-black leading-none mb-1 tracking-[-0.04em]">{blog.date}</span>
                      <span className="text-[14px] font-bold leading-none uppercase tracking-[0.1em]">{blog.month}</span>
                   </div>
                </div>

                {/* Content Box */}
                <div className="p-8 pt-10">
                   <p className="text-[var(--color-slate)] text-[14px] font-medium mb-4 flex items-center gap-2 uppercase tracking-[0.05em]">
                     <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-ghost)]"></span>
                     {blog.category} <span className="mx-1 text-[var(--color-ghost)]">•</span> {blog.time}
                   </p>
                   
                   <h3 className="text-[22px] font-bold text-[var(--color-near-black)] mb-8 leading-snug group-hover:text-[var(--color-emerald-heritage)] transition-colors cursor-pointer tracking-[-0.02em]">
                     {blog.title}
                   </h3>
                   
                   <a href="#" className="inline-flex items-center gap-2 text-[var(--color-slate)] hover:text-[var(--color-electric-mint-glow)] font-bold text-[13px] uppercase tracking-[0.1em] transition-colors group/link">
                     Read More 
                     <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="group-hover/link:translate-x-1 transition-transform">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                     </svg>
                   </a>
                </div>

             </div>
           ))}
        </div>

      </div>
    </section>
  );
}
