import { createClient } from '@/lib/supabaseServer';
import PropertyCard from '@/components/property/PropertyCard';
import PropertyFilters from '@/components/property/PropertyFilters';

export const revalidate = 0; // Disable ISR for personalized access view

export default async function PropertiesPage({ 
  searchParams 
}: { 
  searchParams: { 
    type?: string,
    q?: string,
    property_type?: string,
    price_range?: string,
    sort?: string,
    verified?: string
  } 
}) {
  const { type, q, property_type, price_range, sort, verified } = await searchParams;
  const supabase = await createClient();

  // 1. Get current user for access checks
  const { data: { user } } = await supabase.auth.getUser();
  
  // 2. Main properties query
  let userRole = 'buyer';
  let hasGlobalAccess = false;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, subscription_plan, subscription_expires_at')
      .eq('id', user.id)
      .single();

    if (profile) {
      userRole = profile.role;
      const isPro = profile.subscription_plan !== 'free';
      const isNotExpired = !profile.subscription_expires_at || new Date(profile.subscription_expires_at) > new Date();
      
      hasGlobalAccess = profile.role === 'admin' || (isPro && isNotExpired);
    }
  }

  let query = supabase
    .from('properties')
    .select(`
      id,
      listing_type,
      property_type,
      price,
      city,
      area,
      address,
      status,
      owner:profiles!properties_owner_id_fkey(role),
      media:property_media(url, media_type),
      map_url,
      created_at
    `)
    .eq('status', 'approved');

  // Apply filters
  if (type && type !== 'all') query = query.eq('listing_type', type);
  if (q) query = query.or(`city.ilike.%${q}%,area.ilike.%${q}%,property_type.ilike.%${q}%`);
  if (property_type) query = query.eq('property_type', property_type);
  if (price_range) {
    const [min, max] = price_range.split('-').map(Number);
    if (!isNaN(min)) query = query.gte('price', min);
    if (!isNaN(max)) query = query.lte('price', max);
  }
  if (verified === 'true') query = query.in('owner.role', ['agent', 'admin']);

  // Apply Sorting
  if (sort === 'price_low') query = query.order('price', { ascending: true });
  else if (sort === 'price_high') query = query.order('price', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  const { data: properties, error } = await query;

  // 3. If user is logged in, check which specific properties they've unlocked
  let unlockedIds: Set<string> = new Set();
  if (user && !hasGlobalAccess) {
    const { data: unlocks } = await supabase
      .from('property_unlocks')
      .select('property_id')
      .eq('user_id', user.id)
      .gt('expires_at', new Date().toISOString());
    
    if (unlocks) {
      unlockedIds = new Set(unlocks.map(u => u.property_id));
    }
  }

  // 4. Fetch alternative suggestions if no matches
  let alternatives: any[] = [];
  if (!properties || properties.length === 0) {
    const { data: altProps } = await supabase
      .from('properties')
      .select(`
        id,
        listing_type,
        property_type,
        price,
        city,
        area,
        address,
        status,
        owner:profiles!properties_owner_id_fkey(role),
        media:property_media(url, media_type),
        map_url,
        created_at
      `)
      .eq('status', 'approved')
      .limit(3)
      .order('created_at', { ascending: false });
    
    alternatives = altProps || [];
  }

  if (error) console.error('Fetch properties error:', error.message);

  return (
    <main className="bg-[#fbfcfa] min-h-screen pt-28 pb-16 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-10 border-b border-gray-100 pb-8">
          <div>
            <h1 className="text-5xl font-black text-[#00579e] mb-2 tracking-tighter">Bhavyam Properties</h1>
            <p className="text-gray-400 text-lg font-medium">Curated listings across the globe, verified and secure.</p>
          </div>
          
          <div className="hidden lg:flex items-center gap-4 mt-6 md:mt-0 text-xs font-black uppercase tracking-widest text-[#00b48f]">
             <span className="w-2 h-2 rounded-full bg-[#00b48f] animate-pulse"></span>
             {hasGlobalAccess ? 'UNLIMITED ACCESS ENABLED' : 'Direct Expert Access Available'}
          </div>
        </div>

        {/* Powerful Filter Suite */}
        <PropertyFilters />

        {/* Results Grid */}
        {(!properties || properties.length === 0) ? (
          <div className="flex flex-col gap-10">
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 border border-gray-200">🔍</div>
               <h3 className="text-2xl font-black text-gray-700 mb-2">No exact matches found</h3>
               <p className="text-gray-500 font-medium">We couldn't find any properties matching your exact search criteria.</p>
            </div>
            
            {alternatives.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xl font-black text-[#00579e] mb-6 tracking-tight border-b pb-4">Other users are also looking for these properties:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 gap-y-12">
                  {alternatives.map((prop: any) => {
                    const isUnlocked = hasGlobalAccess || unlockedIds.has(prop.id);
                    return (
                      <PropertyCard 
                        key={prop.id} 
                        property={{
                          ...prop,
                          unlocked: isUnlocked
                        }} 
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 gap-y-12">
            {properties.map((prop: any) => {
              const isUnlocked = hasGlobalAccess || unlockedIds.has(prop.id);
              return (
                <PropertyCard 
                  key={prop.id} 
                  property={{
                    ...prop,
                    unlocked: isUnlocked
                  }} 
                />
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}


