import { supabase } from '@/lib/supabaseClient';
import PropertyCard from '@/components/property/PropertyCard';

export const revalidate = 60; // ISR cache regeneration

export default async function PropertiesPage({ searchParams }: { searchParams: { type?: string } }) {
  const { type } = await searchParams;
  
  // Directly pull 'approved' properties from the database safely
  let query = supabase
    .from('properties')
    .select(`
      id,
      listing_type,
      property_type,
      price,
      city,
      area,
      status,
      owner:profiles(role),
      media:property_media(url, media_type),
      map_url
    `)
    .eq('status', 'approved');

  if (type) {
    query = query.eq('listing_type', type);
  }

  const { data: properties, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch properties error:', error.message);
  }

  return (
    <main className="bg-[#fbfcfa] min-h-screen pt-28 pb-16 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-[#00579e] mb-2 tracking-tight">Active Listings</h1>
            <p className="text-gray-500 text-lg">Browse curated properties ready for you.</p>
          </div>
          
          <div className="mt-4 md:mt-0 bg-white shadow-sm p-1 rounded-full border border-gray-200 flex">
             <button className="bg-teal-50 text-teal-700 px-6 py-2 rounded-full font-semibold text-sm">All</button>
             <button className="text-gray-500 hover:text-gray-800 px-6 py-2 rounded-full font-semibold text-sm transition-colors">Rent</button>
             <button className="text-gray-500 hover:text-gray-800 px-6 py-2 rounded-full font-semibold text-sm transition-colors">Sell</button>
          </div>
        </div>

        {(!properties || properties.length === 0) ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Properties Listed Yet</h3>
            <p className="text-gray-500">Check back later or register to submit the first property!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-10">
            {properties.map((prop: any) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
