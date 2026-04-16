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
    media: { url: string }[];
    map_url?: string | null;
    address?: string | null;
    unlocked?: boolean;
  };
}

export default function PropertyCard({ property }: PropertyCardProps) {
  // Try to grab the first image, or use a placeholder
  const mainImage = property.media && property.media.length > 0 
    ? property.media[0].url 
    : 'https://placehold.co/600x400/eeeeee/999999?text=No+Image';

  // Format currency
  const actualPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(property.price);

  const displayedPrice = actualPrice;
  const displayedAddress = property.unlocked && property.address ? property.address : property.city;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full group relative p-1">
      <Link href={`/properties/${property.id}`} className="flex flex-col h-full">
        {/* Image Header wrapper */}
        <div className="relative h-80 w-full overflow-hidden bg-gray-100 transition-all duration-500 group-hover:h-72 rounded-b-[3rem] z-10">
          <img 
            src={mainImage} 
            alt={`${property.property_type} in ${property.city}`} 
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <div className="bg-[#00b48f] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg backdrop-blur-md">
              {property.listing_type}
            </div>
            {property.unlocked && (
              <div className="bg-blue-600/90 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter shadow-lg backdrop-blur-md flex items-center gap-1 w-fit">
                 <span className="animate-pulse">🔓</span> Full Access
              </div>
            )}
          </div>

          {/* Price Overlay on Thumbnail */}
          <div className="absolute bottom-12 right-6 bg-white/95 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 flex flex-col items-end transform transition-all duration-500 group-hover:-translate-y-6">
             <span className="text-xl font-black text-[#022039] leading-tight tracking-tighter">{displayedPrice}</span>
          </div>

          {/* Unverified Seller badge */}
          {property.owner?.role === 'seller' && !property.unlocked && (
            <div className="absolute bottom-12 left-6 bg-orange-500/90 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-lg">
              Unverified Seller
            </div>
          )}
        </div>

        {/* Card Content container - Reduced upward shift for a more subtle feel */}
        <div className="px-6 pt-2 bg-white relative z-20 flex flex-col flex-1 transition-all duration-500 group-hover:-translate-y-8">
          <div className="mb-2">
            <h3 className="text-2xl font-black text-gray-800 line-clamp-1 group-hover:text-[#00579e] transition-colors uppercase tracking-tighter">
              {property.property_type}
            </h3>
          </div>
          
          <p className="text-gray-400 text-sm mb-6 flex items-center gap-1.5 font-medium">
            <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="line-clamp-1">{displayedAddress}</span>
          </p>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-6 bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
            <div className="flex flex-col">
               <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black mb-1">Area</span>
               <span className="font-bold text-gray-800">{property.area}</span>
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black mb-1">Pricing</span>
               <span className="font-bold text-gray-800 capitalize">{property.listing_type}</span>
            </div>
          </div>

          {/* View Details Slide Up Animation */}
          <div className="mt-auto opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 h-0 group-hover:h-14 overflow-hidden">
             <div className="w-full h-14 bg-[#00b48f] text-white flex items-center justify-center font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-[0_10px_30px_rgba(0,180,143,0.3)]">
                View Details
             </div>
          </div>
        </div>
      </Link>
      
      {/* Favorite Action Button - Moving it out of the main link to avoid nested interactive elements issues */}
      <div className="absolute top-0 right-0 p-4 z-10">
        <FavoriteButton propertyId={property.id} />
      </div>
    </div>
  );
}
