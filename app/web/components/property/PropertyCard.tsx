'use client';

import Link from 'next/link';
import FavoriteButton from './FavoriteButton';

interface PropertyCardProps {
  property: {
    id: string;
    listing_type: string;
    property_type: string;
    price: number;
    city: string;
    area: string;
    owner?: { role: string } | null;
    media: { url: string; media_type?: string }[];
    map_url?: string | null;
    address?: string | null;
    unlocked?: boolean;
  };
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const mainImage = property.media && property.media.length > 0 
    ? property.media[0].url 
    : 'https://placehold.co/600x400/eeeeee/999999?text=Cover+Image';

  const formattedPrice = new Intl.NumberFormat('en-IN').format(property.price);
  
  const listingTag = property.listing_type?.toLowerCase() === 'rent' ? 'For Rent' : 'For Sell';

  const displayedAddress = property.unlocked && property.address ? property.address : property.city;

  return (
    <Link href={`/properties/${property.id}`} className="block h-full group relative focus:outline-none">
      <div className="bg-[var(--color-pure-white)] rounded-3xl shadow-[var(--shadow-ambient)] hover:shadow-[var(--shadow-ambient-hover)] transition-all duration-500 flex flex-col relative h-full overflow-hidden border border-gray-100">
        
        {/* Top Image Box Wrapper */}
        <div className="relative">
            {/* Main Image Container */}
            <div className="relative h-[260px] w-full bg-gray-100 overflow-hidden">
              <img 
                src={mainImage} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                alt={property.property_type} 
              />
              
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>

              <div className="absolute bottom-5 left-5 text-white font-bold text-2xl drop-shadow-md flex items-end gap-1">
                ₹ {formattedPrice} 
                <span className="text-[13px] font-medium text-white/90 mb-1 ml-1 tracking-wide">(Negotiable)</span>
              </div>
            </div>

            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              <div className="bg-[var(--color-emerald-heritage)] text-white px-4 py-1 font-bold text-xs tracking-[0.05em] uppercase rounded-full shadow-md w-fit">
                {listingTag}
              </div>
              {property.unlocked && (
                <div className="bg-blue-600/90 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg backdrop-blur-md flex items-center gap-1 w-fit">
                   <span className="animate-pulse">🔓</span> Full Access
                </div>
              )}
            </div>

            <div className="absolute -bottom-3 left-6 bg-[var(--color-pure-white)] text-[var(--color-emerald-heritage)] text-[12px] font-black uppercase tracking-[0.05em] px-4 py-1.5 rounded-full shadow-md z-20">
              {property.property_type || 'Plots'}
            </div>
            
            {property.owner?.role === 'seller' && !property.unlocked && (
              <div className="absolute bottom-16 left-5 bg-orange-500/90 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-lg">
                Unverified Seller
              </div>
            )}

            {/* Favorite Action Button - inside the image container so it looks right, click is stopped */}
            <div 
              className="absolute bottom-5 right-5 z-30"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              <FavoriteButton 
                propertyId={property.id} 
                className="text-white hover:text-red-500 transition-colors bg-white/10 backdrop-blur-sm border border-white/20 p-2 rounded-md hover:bg-white/30"
              />
            </div>
        </div>

        {/* Middle Content */}
        <div className="px-6 pt-8 pb-5 flex-1 bg-[var(--color-pure-white)] text-left">
            <h3 className="text-[22px] font-bold text-[var(--color-near-black)] group-hover:text-[var(--color-emerald-heritage)] transition-colors mb-2.5 line-clamp-1">
              {property.area ? `${property.area} ` : ''}{property.property_type || 'property'}
            </h3>
            <p className="text-[var(--color-slate)] text-[14px] flex items-center gap-1.5 font-medium">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="line-clamp-1">{displayedAddress}</span>
            </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 bg-[var(--color-pure-white)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-cloud)] overflow-hidden flex items-center justify-center shrink-0 text-gray-400">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
              </div>
              <div className="text-[12px] font-bold text-[var(--color-near-black)] leading-tight uppercase tracking-[0.05em]">
                  By Bhavyam<br/><span className="text-[var(--color-slate)] font-medium">Properties</span>
              </div>
            </div>
            <div className="bg-[var(--color-emerald-heritage)] text-white text-[12px] font-bold px-6 py-2.5 rounded-full group-hover:bg-[var(--color-electric-mint-glow)] group-hover:text-[var(--color-deep-navy)] transition-colors uppercase tracking-[0.1em]">
              Details
            </div>
        </div>

      </div>
    </Link>
  );
}
