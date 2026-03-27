import { createClient } from '@/lib/supabaseServer';
import Link from 'next/link';

export default async function LatestListingsSidebar() {
  const supabase = await createClient();

  const { data: listings } = await supabase
    .from('properties')
    .select(`
      id,
      property_type,
      price,
      city,
      listing_type,
      media:property_media(url, media_type)
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(5);

  if (!listings || listings.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-5 sticky top-32">
      <h3 className="text-xl font-black text-gray-900 tracking-tight border-b border-gray-50 pb-4">
        Latest Listing
      </h3>
      
      <div className="flex flex-col gap-6">
        {listings.map((l: any, idx: number) => {
          const mainMedia = l.media && l.media.length > 0 ? l.media[0].url : null;
          
          // Mask Price Logic
          const pStr = l.price.toString();
          const fDigit = pStr.charAt(0);
          const dPriceStr = fDigit + '0'.repeat(pStr.length - 1);
          const fDummy = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(parseInt(dPriceStr));
          const maskedPrice = fDummy.replace(/0/g, 'x');

          if (idx === 0) {
            // First item is large (as seen in screenshot)
            return (
              <Link href={`/properties/${l.id}`} key={l.id} className="group flex flex-col gap-4 border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-gray-100">
                  <img 
                    src={mainMedia || 'https://placehold.co/600x400/eeeeee/999999?text=Property'} 
                    alt={l.property_type}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#00c194] text-white text-[10px] font-black px-3 py-1.5 rounded-md uppercase tracking-widest shadow-lg">
                    {l.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                  </div>
                </div>
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Open House</p>
                   <h4 className="text-lg font-black text-gray-900 leading-tight mb-1 group-hover:text-[#00c194] transition-colors">{l.property_type}</h4>
                   <p className="text-sm font-bold text-gray-400 flex items-center gap-1 mb-2 capitalize">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {l.city}
                   </p>
                   <p className="text-xl font-black text-[#00c194] tracking-tight">
                      {maskedPrice} <span className="text-[12px] font-bold text-gray-400 font-sans tracking-normal">(Negotiable)</span>
                   </p>
                </div>
              </Link>
            );
          }

          // Smaller items for the rest
          return (
            <Link href={`/properties/${l.id}`} key={l.id} className="group flex gap-4 items-center border-b border-gray-50 pb-5 last:border-0 last:pb-0">
               <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                  <img 
                    src={mainMedia || 'https://placehold.co/200x200/eeeeee/999999?text=Cover'} 
                    alt={l.property_type}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
               </div>
               <div className="flex flex-col gap-0.5">
                  <h4 className="text-sm font-black text-gray-900 group-hover:text-[#00c194] transition-colors line-clamp-1 capitalize">{l.property_type}</h4>
                  <p className="text-[11px] font-bold text-gray-400 flex items-center gap-1 capitalize">
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {l.city}
                  </p>
                  <p className="text-sm font-black text-[#00c194] tracking-tight mt-1">
                    {maskedPrice} <span className="text-[10px] font-bold text-gray-400 tracking-normal">(Negotiable)</span>
                  </p>
               </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
