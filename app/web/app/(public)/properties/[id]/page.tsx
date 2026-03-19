import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PropertyUnlocker from '@/components/property/PropertyUnlocker';
import InterestButton from '@/components/property/InterestButton';
import ReviewSystem from '@/components/property/ReviewSystem';

export default async function PropertyDetailsPage({ params }: { params: { id: string } }) {
  // Wait to extract the ID natively from Next 15 props format
  const { id } = await params;

  // We request exactly what we need, intentionally EXCLUDING owner details, address
  // Note: Since this is Server-side, RLS policies dictate that ONLY approved 
  // properties will ever be successfully fetched via `public.properties` for anonymous readers.
  const { data: property, error } = await supabase
    .from('properties')
    .select(`
      id,
      listing_type,
      property_type,
      pricing_type,
      price,
      city,
      area,
      status,
      media:property_media(url, media_type),
      map_url
    `)
    .eq('id', id)
    .single();

  if (error || !property) {
    notFound();
  }

  const mainImage = property.media && property.media.length > 0
    ? property.media[0].url
    : 'https://placehold.co/1200x600/eeeeee/999999?text=Image+Unavailable';

  const priceStr = property.price.toString();
  const firstDigit = priceStr.charAt(0);
  const remainingLen = priceStr.length - 1;
  const dummyPriceStr = firstDigit + '0'.repeat(remainingLen);
  
  const formattedDummy = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(parseInt(dummyPriceStr));
  
  const formattedPrice = formattedDummy.replace(/0/g, 'x');

  return (
    <main className="bg-white min-h-screen pt-20">
      {/* Dynamic Header Layout */}
      <div className="relative w-full h-[60vh] bg-gray-100 flex items-center justify-center overflow-hidden">
        <img 
           src={mainImage}
           alt={property.property_type} 
           className="w-full h-full object-cover filter brightness-75"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
        
        <div className="absolute bottom-12 left-0 w-full px-6 md:px-16">
           <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
              <div className="text-white">
                 <div className="flex items-center gap-3 mb-4">
                   <span className="bg-[#00b48f] text-white text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-widest shadow-md">
                    {property.listing_type}
                   </span>
                   <span className="bg-white/20 backdrop-blur-sm text-white border border-white/30 text-xs font-semibold px-3 py-1 rounded-sm uppercase tracking-widest">
                    {property.property_type}
                   </span>
                 </div>
                 <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-2 drop-shadow-md">
                   {property.property_type} in {property.city}
                 </h1>
                 <p className="text-xl md:text-2xl font-light text-gray-200">
                   General Location Overview
                 </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-2xl flex flex-col items-end">
                 <p className="text-gray-200 text-sm uppercase tracking-widest font-semibold mb-1 w-full text-right">Asking Price</p>
                 <span className="text-4xl font-black text-white">{formattedPrice}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Main Body Details Container */}
      <div className="relative -mt-6 max-w-6xl mx-auto px-6 md:px-16 pb-24 z-10">
         <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 mb-12 flex flex-col md:flex-row gap-12">
            
            {/* Left Content column */}
            <div className="flex-2 w-full md:w-2/3">
              <h2 className="text-3xl font-extrabold text-[#00579e] mb-6 border-b border-gray-100 pb-4">
                Public Overview
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 text-gray-700">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">Pricing Format</p>
                  <p className="text-lg font-bold capitalize">{property.pricing_type}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">Total Area</p>
                  <p className="text-lg font-bold capitalize">{property.area}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-lg font-bold uppercase text-teal-600 tracking-wider">Available</p>
                </div>
              </div>

              <div className="prose max-w-none text-gray-600 leading-relaxed text-lg">
                 <p>
                    This is a beautifully positioned `{property.property_type}` available explicitly for `{property.listing_type}`. 
                    Due to the highly secure nature of Bhavyam Properties policy, detailed exact physical addresses, documentation files, and the seller's direct communications are securely locked and require direct authorization and active negotiation to obtain.
                 </p>
                 <p className="mt-4">
                    For an extensive 3D walkthrough, granular amenity reviews, blueprint analysis and direct legal contact, you must formally proceed deeper into the system.
                 </p>
              </div>

              {/* Lead Generation Button block */}
              <InterestButton propertyId={property.id} />
              
              {/* Dynamic Approved Public Reviews Panel */}
              <ReviewSystem propertyId={property.id} />
            </div>

            {/* Right Locked Gate Action Card */}
            <div className="flex-1 w-full md:w-1/3">
               <PropertyUnlocker propertyId={property.id} />
            </div>

         </div>
      </div>
    </main>
  );
}
