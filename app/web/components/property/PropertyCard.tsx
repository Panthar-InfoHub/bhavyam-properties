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

  // Masked price logic
  const priceStr = property.price.toString();
  const firstDigit = priceStr.charAt(0);
  const dummyPriceStr = firstDigit + '0'.repeat(priceStr.length - 1);
  const formattedDummy = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(parseInt(dummyPriceStr));
  const maskedPrice = formattedDummy.replace(/0/g, 'x');

  const displayedPrice = property.unlocked ? actualPrice : maskedPrice;
  const displayedAddress = property.unlocked && property.address ? property.address : property.city;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      {/* Image Header wrapper */}
      <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-gray-100">
        <img 
          src={mainImage} 
          alt={`${property.property_type} in ${property.city}`} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <div className="bg-[#00b48f] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
            {property.listing_type}
          </div>
          {property.unlocked && (
            <div className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter shadow-sm flex items-center gap-1">
               <span className="animate-pulse">🔓</span> Full Access
            </div>
          )}
        </div>

        {/* Unverified Seller badge */}
        {property.owner?.role === 'seller' && !property.unlocked && (
          <div className="absolute bottom-3 left-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider shadow">
            Unverified Seller
          </div>
        )}

        {/* Favorite Action Button component */}
        <FavoriteButton propertyId={property.id} />
      </div>

      {/* Card Content container */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-800 line-clamp-1">{property.property_type}</h3>
          <span className="text-xl font-bold text-[#00579e]">{displayedPrice}</span>
        </div>
        
        <p className="text-gray-500 text-sm mb-4 flex items-center gap-1">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="line-clamp-1">{displayedAddress}</span>
        </p>

        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-100">
          <div className="flex flex-col">
             <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Area</span>
             <span className="font-medium">{property.area}</span>
          </div>
          <div className="flex flex-col">
             <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Pricing</span>
             <span className="font-medium capitalize">{property.listing_type}</span>
          </div>
        </div>

        {/* View Details Push Button */}
        <div className="mt-auto">
          <Link 
            href={`/properties/${property.id}`}
             className="block w-full text-center bg-gray-50 hover:bg-[#00b48f] hover:text-white text-gray-700 hover:border-[#00b48f] border border-gray-200 py-3 rounded-lg font-semibold transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
