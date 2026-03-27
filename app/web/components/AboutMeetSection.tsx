import Image from 'next/image';

export default function AboutMeetSection() {
  const highlights = [
    {
      title: "RESIDENTIAL AND COMMERCIAL MARKETS.",
      desc: "Bhavyam Properties is dedicated to providing premier real estate solutions in both residential and commercial markets.",
      icon: (
        <svg className="w-12 h-12 text-[#00c194]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18M3 7v14M21 7v14M3 7l9-4 9 4M9 21v-6h6v6" />
          <rect x="7" y="10" width="2" height="2" />
          <rect x="15" y="10" width="2" height="2" />
        </svg>
      )
    },
    {
      title: "INNOVATION AND TRUSTED SERVICE.",
      desc: "With a customer-first approach, we are committed to delivering integrity, innovation, and trusted service.",
      icon: (
        <svg className="w-12 h-12 text-[#00c194]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          <circle cx="12" cy="12" r="5" />
        </svg>
      )
    },
    {
      title: "INTEGRITY & CUSTOMER SATISFACTION",
      desc: "Integrity & Customer Satisfaction",
      icon: (
        <svg className="w-12 h-12 text-[#00c194]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      )
    },
    {
      title: "LONG-TERM PARTNERSHIPS",
      desc: "Long-Term Partnerships",
      icon: (
        <svg className="w-12 h-12 text-[#00c194]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    }
  ];

  return (
    <section className="py-24 px-6 md:px-12 bg-white relative overflow-hidden">
      {/* Background Subtle City Pattern */}
      <div className="absolute top-0 right-0 opacity-[0.05] pointer-events-none">
        <svg width="400" height="400" viewBox="0 0 400 400" fill="none" stroke="#112743" strokeWidth="1">
          <rect x="50" y="50" width="40" height="100" />
          <rect x="100" y="30" width="40" height="120" />
          <rect x="150" y="70" width="40" height="80" />
          <rect x="200" y="20" width="40" height="130" />
          <circle cx="300" cy="100" r="30" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-16 items-center">
        
        {/* Left Grid of Highlights */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-16">
          {highlights.map((item, idx) => (
            <div key={idx} className="flex flex-col text-left group">
              <div className="mb-6 transform transition-transform group-hover:scale-110 duration-300">
                {item.icon}
              </div>
              <h3 className="text-xl font-black text-gray-800 mb-3 tracking-tight">
                {item.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Right Feature Image */}
        <div className="flex-1 w-full pl-0 xl:pl-8">
           <div className="relative rounded-[2rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-1000">
              <img 
                src="/images/about-meet.webp" 
                alt="Bhavyam Properties Meetup" 
                className="w-full h-full object-cover"
              />
              {/* Subtle Overlay */}
              <div className="absolute inset-0 bg-linear-to-tr from-[#112743]/10 to-transparent"></div>
           </div>
        </div>

      </div>
    </section>
  );
}
