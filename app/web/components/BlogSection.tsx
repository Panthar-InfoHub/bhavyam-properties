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
    <section className="py-24 px-4 md:px-8 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 relative">
           
           <div className="relative">
             <div 
               className="absolute md:-top-16 left-0 text-[80px] md:text-[140px] leading-none font-black text-[#00c194]/5 select-none z-[-1] pointer-events-none tracking-widest whitespace-nowrap" 
               style={{ fontFamily: "'Brush Script MT', 'Comic Sans MS', cursive" }}
             >
               Blogs
             </div>
             <p className="text-[#00c194] font-bold text-[13px] tracking-widest uppercase mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00c194]"></span>
                WHAT'S NEW TRENDING
             </p>
             <h2 className="text-[32px] md:text-[40px] font-black text-[#1a1a1a] tracking-tight">
               Latest Blog & Posts
             </h2>
           </div>

           <button className="mt-6 md:mt-0 bg-[#e4f8f4] text-[#00c194] font-bold text-[14px] px-8 py-3.5 hover:bg-[#00c194] hover:text-white transition-colors duration-300">
              See All Blogs
           </button>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {blogs.map((blog, idx) => (
             <div key={idx} className="bg-white rounded-xl shadow-[0_4px_25px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                
                {/* Image Box */}
                <div className="relative h-[240px] w-full overflow-hidden p-4 pb-0">
                   <div className="w-full h-full relative rounded-t-lg overflow-hidden">
                     <img 
                       src={blog.image} 
                       alt={blog.title} 
                       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                     />
                   </div>
                   
                   {/* Date Badge */}
                   <div className="absolute bottom-[-10px] left-8 bg-[#00c194] text-white flex flex-col items-center justify-center w-[60px] h-[65px] rounded z-10 shadow-lg group-hover:bg-[#00a880] transition-colors">
                      <span className="text-[22px] font-bold leading-none mb-1">{blog.date}</span>
                      <span className="text-[14px] font-medium leading-none">{blog.month}</span>
                   </div>
                </div>

                {/* Content Box */}
                <div className="p-8 pt-10">
                   <p className="text-gray-400 text-[14px] font-medium mb-3 flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                     {blog.category} <span className="mx-1">•</span> {blog.time}
                   </p>
                   
                   <h3 className="text-[20px] font-bold text-[#1a1a1a] mb-6 leading-snug group-hover:text-[#00c194] transition-colors cursor-pointer">
                     {blog.title}
                   </h3>
                   
                   <a href="#" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#00c194] font-semibold text-[14px] transition-colors">
                     Read More 
                     <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
