'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/lib/auth';
import PropertyCard from '@/components/property/PropertyCard';
import { useRouter } from 'next/navigation';

export default function UserFavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFavorites = async () => {
      const user = await getCurrentUser();
      
      // Strict role bounce back redirect if not logged in
      if (!user) {
        router.push('/login');
        return;
      }

      // 1. Ask the favorites table for rows mapping EXACTLY to this user
      // 2. We use Supabase native Foreign Key inner-joins to expand the inner property
      // 3. We request nested property_media inside that property as well!
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          property_id,
          created_at,
          property:properties (
            id,
            listing_type,
            property_type,
            price,
            city,
            area,
            status,
            media:property_media(url, media_type)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching favorites:', error.message);
      } else if (data) {
        // Map nested inner joined relation records accurately into normal Property array UI
        const formattedProps = data
           .map((fav: any) => fav.property)
           .filter(prop => prop !== null); // safety check dropping dangling references
           
        setFavorites(formattedProps);
      }
      setIsLoading(false);
    };

    fetchFavorites();
  }, [router]);

  return (
    <div className="flex-1 w-full bg-[#fbfcfa] py-10 px-4 sm:px-8 min-h-[80vh]">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#00579e] mb-2 tracking-tight">My Favorites</h1>
        <p className="text-gray-500 mb-8 border-b border-gray-200 pb-4">View properties you instantly saved across Bhavyam Properties.</p>

        {isLoading ? (
           <div className="w-full flex justify-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
           </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center items-center">
            <svg className="w-20 h-20 text-gray-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Favorites Yet</h3>
            <p className="text-gray-500 max-w-sm">You haven't saved any properties to your dashboard favorites yet. Browse the public catalog and click the ❤️ icon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-10">
            {favorites.map((prop: any) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
