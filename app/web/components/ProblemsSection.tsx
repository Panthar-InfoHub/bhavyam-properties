export default function ProblemsSection() {
  const problems = [
    {
      title: "Limited Market Transparency",
      desc: "Smaller markets often lack readily available data, making it difficult for buyers to make informed decisions. Thorough research and due diligence are required before investing.",
      icon: (
        <svg className="w-6 h-6 text-[#00c194]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
      )
    },
    {
      title: "Difficulties to sale, rent and purchasing process with trust",
      desc: "There is no Transparency in Different properties for sale, purchase and rent with proper documentation and trust.",
      icon: (
        <svg className="w-6 h-6 text-[#00c194]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
      )
    },
    {
      title: "Infrastructure Gaps",
      desc: "While there have been improvements Infrastructure in these cities is still catching up to the needs of a growing population. This can affect the overall quality of life and property values.",
      icon: (
        <svg className="w-6 h-6 text-[#00c194]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
      )
    },
    {
      title: "Rent properties issues",
      desc: "Most of the people switch their city due to job and other work It's very challenging for them to find a proper house, shop, room on rent.",
      icon: (
        <svg className="w-6 h-6 text-[#00c194]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
      )
    },
    {
      title: "Property Values",
      desc: "While property prices are generally lower compared to tier 1 cities, and most of the landowners sell their properties at a very low cost than government circle rate They didn't get the real value of that property.",
      icon: (
        <svg className="w-6 h-6 text-[#00c194]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
      )
    },
    {
      title: "Wrong Paperwork & fraud issues",
      desc: "We con see in all cities normal people will not understand the poperwork in real estate Mast people have expenenced froud papers fraud properties Double and triple registry cases are Increasing and money loss",
      icon: (
        <svg className="w-6 h-6 text-[#00c194]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
      )
    }
  ];

  return (
    <section className="py-24 px-6 md:px-12 bg-white flex flex-col items-center">
      <div className="max-w-7xl w-full">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-x-8 gap-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">Problems</h2>
          <div className="hidden md:block w-px h-12 bg-gray-200"></div>
          <p className="text-gray-500 font-medium max-w-none text-center md:text-left">
            For normal people in tier 2 and tier 3 cities in India, the real estate sector presents several challenges
          </p>
        </div>

        {/* Dynamic Grid Layout matching screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
          {problems.map((prob, idx) => (
            <div key={idx} className={`relative p-8 rounded-2xl transition-all duration-300 group hover:shadow-2xl ${idx === 0 ? 'bg-[#f0e4e4]' : 'bg-transparent hover:bg-gray-50'}`}>
              
              <div className="flex items-start gap-4">
                 {/* Icon in specific circular container as per screenshot */}
                 <div className="w-12 h-12 shrink-0 bg-white rounded-full shadow-lg flex items-center justify-center mb-4">
                   {prob.icon}
                 </div>
                 
                 <div className="flex-1">
                    <h3 className="text-2xl font-black text-gray-900 mb-4 leading-tight group-hover:text-[#00c194] transition-colors">
                      {prob.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed font-medium">
                      {prob.desc}
                    </p>
                 </div>
              </div>

              {/* Decorative separator line seen in screenshot layout */}
              {idx % 3 !== 2 && (
                <div className="hidden lg:block absolute -right-6 top-1/2 -translate-y-1/2 w-px h-24 bg-gray-100"></div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
