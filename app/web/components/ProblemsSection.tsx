export default function ProblemsSection() {
  const rows = [
    {
      problem: {
        title: "Limited Market Transparency",
        desc: "Smaller markets lack readily available data, making informed decisions nearly impossible without extensive research.",
      },
      solution: {
        title: "100% Verified Listings",
        desc: "Every property on Bhavyam is manually verified by our team. You get accurate data, real photos, and honest pricing — always.",
      },
    },
    {
      problem: {
        title: "Trust Issues in Sale, Rent & Purchase",
        desc: "No transparency in property transactions leads to distrust between buyers, sellers, and agents.",
      },
      solution: {
        title: "Verified Agent Network",
        desc: "Our agents carry a unique Bhavyam Agent ID and are background-checked. Every deal is documented and supported by our platform.",
      },
    },
    {
      problem: {
        title: "Infrastructure Gaps in Tier 2 & 3 Cities",
        desc: "Growing cities struggle to keep up with infrastructure needs, affecting property quality and valuations.",
      },
      solution: {
        title: "Curated Locality Insights",
        desc: "We provide detailed locality reports — connectivity, infrastructure status, and future development plans — so you invest with clarity.",
      },
    },
    {
      problem: {
        title: "Difficulty Finding Rental Properties",
        desc: "People relocating for work find it extremely hard to find trustworthy houses, shops, or rooms on rent.",
      },
      solution: {
        title: "Trusted Rental Marketplace",
        desc: "Browse verified rental listings with real contact details. No fake listings, no middlemen — connect directly with verified owners.",
      },
    },
    {
      problem: {
        title: "Owners Selling Below Market Value",
        desc: "Landowners in smaller cities often sell far below the government circle rate, losing their hard-earned money.",
      },
      solution: {
        title: "Free Market Valuation Reports",
        desc: "We provide free property valuation for all sellers so they know the true market worth before listing. Get what you deserve.",
      },
    },
    {
      problem: {
        title: "Wrong Paperwork & Fraud",
        desc: "Fraudulent documents, double registrations, and fake properties are rampant — causing massive financial losses.",
      },
      solution: {
        title: "Document Verification & Legal Support",
        desc: "Our team reviews all submitted documents. We flag suspicious listings and connect buyers to certified legal experts for safe transactions.",
      },
    },
  ];

  return (
    <section className="py-24 px-6 md:px-12 bg-white flex flex-col items-center">
      <div className="max-w-6xl w-full">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#00c194] bg-[#00c194]/10 px-4 py-2 rounded-full mb-4">
            <span className="w-2 h-2 rounded-full bg-[#00c194] animate-pulse"></span>
            Bhavyam — The Verified Solution
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mt-3 mb-4">
            Problems <span className="text-gray-300">&</span> Our Solutions
          </h2>
          <p className="text-gray-400 font-medium max-w-2xl mx-auto">
            Real challenges faced by home buyers, sellers & renters in Tier 2 &amp; 3 cities in India — and how Bhavyam Properties solves every one of them.
          </p>
        </div>

        {/* Column Headers */}
        <div className="grid grid-cols-[1fr_56px_1fr] mb-4 px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <span className="text-sm font-semibold uppercase tracking-widest text-red-500">The Problem</span>
          </div>
          <div />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#00c194]/15 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#00c194]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-semibold uppercase tracking-widest text-[#00c194]">Bhavyam's Solution</span>
          </div>
        </div>

        {/* Table Rows */}
        <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
          {rows.map((row, idx) => (
            <div
              key={idx}
              className={`grid grid-cols-[1fr_56px_1fr] items-stretch transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'} ${idx !== rows.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              {/* Problem Cell */}
              <div className="p-6 md:p-8 flex items-start gap-4 group">
                <div className="shrink-0 w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-1.5 leading-snug">{row.problem.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed font-normal">{row.problem.desc}</p>
                </div>
              </div>

              {/* Center Arrow Divider */}
              <div className="flex items-center justify-center border-x border-gray-100 bg-gradient-to-b from-gray-50/0 via-gray-100/80 to-gray-50/0">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-[#00c194]/30 flex items-center justify-center shadow-sm">
                  <svg className="w-3.5 h-3.5 text-[#00c194]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Solution Cell */}
              <div className="p-6 md:p-8 flex items-start gap-4 bg-[#00c194]/[0.03]">
                <div className="shrink-0 w-9 h-9 rounded-xl bg-[#00c194]/10 border border-[#00c194]/20 flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4 text-[#00c194]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="text-base md:text-lg font-semibold text-gray-800 leading-snug">{row.solution.title}</h3>
                    <span className="hidden md:inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-widest text-[#00c194] bg-[#00c194]/10 px-2 py-0.5 rounded-full shrink-0">
                      ✓ Verified
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed font-normal">{row.solution.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm font-medium mb-4">Ready to experience verified real estate?</p>
          <a
            href="/properties"
            className="inline-flex items-center gap-2 bg-[#00c194] hover:bg-[#009475] text-white font-black text-sm uppercase tracking-widest px-8 py-4 rounded-2xl shadow-lg shadow-[#00c194]/25 transition-all active:scale-95 hover:shadow-xl hover:shadow-[#00c194]/30"
          >
            Explore Verified Properties
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>

      </div>
    </section>
  );
}
