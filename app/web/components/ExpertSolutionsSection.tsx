'use client';

import { useState } from 'react';
import ServiceRequestModal from './ServiceRequestModal';

export default function ExpertSolutionsSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');

  const handleCardClick = (card: any) => {
    setSelectedService(card.title);
    setSelectedColor(card.color);
    setIsModalOpen(true);
  };

  const cards = [
    {
      title: 'Commercial Spaces',
      desc: 'We deal in high-end commercial spaces tailored for your business needs.',
      color: 'bg-[var(--color-emerald-heritage)]',
      textColor: 'text-white',
      descColor: 'text-white/75',
      icon: (
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="15" rx="2"/>
          <path d="M16 22V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v17"/>
          <path d="M9 11h1m4 0h1M9 15h1m4 0h1"/>
        </svg>
      ),
    },
    {
      title: 'Rent Property',
      desc: 'Find your perfect rental space with our curated property listings.',
      color: 'bg-[var(--color-emerald-mint)]',
      textColor: 'text-white',
      descColor: 'text-white/75',
      icon: (
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      title: 'Sell Property',
      desc: 'Get the best value for your property with our expert selling strategies.',
      color: 'bg-[var(--color-emerald-heritage)]',
      textColor: 'text-white',
      descColor: 'text-white/75',
      icon: (
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l7 4v6c0 5-3.5 9.74-7 11-3.5-1.26-7-6-7-11V6l7-4z"/>
          <polyline points="9 12 11 14 15 10"/>
        </svg>
      ),
    },
    {
      title: 'Legal Assistance',
      desc: 'Hassle-free documentation and legal assistance for all transactions.',
      color: 'bg-[var(--color-electric-mint-glow)]',
      textColor: 'text-[var(--color-near-black)]',
      descColor: 'text-gray-600',
      icon: (
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
          <line x1="8" y1="2" x2="8" y2="18"/>
          <line x1="16" y1="6" x2="16" y2="22"/>
        </svg>
      ),
    },
    {
      title: 'Property Loan',
      desc: 'Get expert guidance and quick approvals for home and property loans.',
      color: 'bg-[var(--color-near-black)]',
      textColor: 'text-white',
      descColor: 'text-white/70',
      icon: (
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"/>
          <line x1="2" y1="10" x2="22" y2="10"/>
          <path d="M7 15h2m4 0h4"/>
        </svg>
      ),
    },
  ];

  return (
    <section className="py-20 px-4 md:px-8 bg-[var(--color-warm-ivory)] relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">

        {/* Section Header */}
        <div className="mb-14 relative">
          <div className="absolute -top-10 -left-4 text-8xl font-black text-[var(--color-deep-navy)] opacity-[0.04] select-none pointer-events-none tracking-widest">
            Work Type
          </div>
          <p className="text-[var(--color-emerald-heritage)] font-semibold text-xs tracking-[0.2em] uppercase mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-emerald-heritage)]" />
            WHAT WE DO
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-near-black)] tracking-tight">Expert Property Solutions</h2>
        </div>

        {/* Cards Grid — 5 columns on xl, 3 on lg, 2 on md */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {cards.map((card) => (
            <div
              key={card.title}
              onClick={() => handleCardClick(card)}
              className={`
                group relative ${card.color} p-8 rounded-2xl overflow-hidden cursor-pointer
                transition-all duration-300 ease-out
                hover:-translate-y-1.5 hover:shadow-2xl
              `}
            >
              {/* Hover shine overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-white/15 to-transparent rounded-2xl" />

              {/* Decorative circle */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/5 group-hover:bg-white/10 transition-all duration-500 group-hover:scale-125" />

              {/* Icon */}
              <div className={`${card.textColor} mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300 origin-left`}>
                {card.icon}
              </div>

              {/* Text */}
              <h3 className={`${card.textColor} text-[17px] font-bold mb-2 relative z-10`}>{card.title}</h3>
              <p className={`${card.descColor} text-[13px] leading-relaxed relative z-10`}>{card.desc}</p>

              {/* Bottom arrow that appears on hover */}
              <div className={`mt-5 relative z-10 flex items-center gap-1.5 ${card.textColor} opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300`}>
                <span className="text-xs font-semibold tracking-wide">Inquire Now</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <ServiceRequestModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          serviceType={selectedService} 
          color={selectedColor}
        />
      )}
    </section>
  );
}

