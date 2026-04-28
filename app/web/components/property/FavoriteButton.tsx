'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function FavoriteButton({ propertyId, className }: { propertyId: string; className?: string }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkFavorite = async () => {
      const user = await getCurrentUser();
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .eq('property_id', propertyId)
        .maybeSingle(); 
        
      if (data) {
        setIsFavorited(true);
      }
      setIsLoading(false);
    };
    checkFavorite();
  }, [propertyId]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault(); 
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please login to save properties.");
      router.push('/login');
      return;
    }

    setIsLoading(true);
    
    try {
      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', propertyId);
          
        if (error) throw error;
        setIsFavorited(false);
        toast.success("Removed from favorites", { icon: '💔' });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, property_id: propertyId });
          
        if (error) throw error;
        setIsFavorited(true);
        toast.success("Added to favorites!", { icon: '❤️' });
      }
    } catch (err: any) {
      console.error('Favorite Toggle Error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
       setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={isLoading}
      className={className || `absolute top-4 right-4 p-2 rounded-full backdrop-blur-md transition-all shadow-sm z-20 disabled:opacity-50 ${
        isFavorited 
          ? 'bg-red-50/90 text-red-500 hover:bg-red-100' 
          : 'bg-white/70 text-gray-500 hover:bg-white hover:text-red-500'
      }`}
      aria-label="Toggle Favorite"
    >
      <svg 
         className={`w-5 h-5 ${isFavorited ? 'fill-current text-red-500' : 'fill-none'}`} 
         viewBox="0 0 24 24" 
         stroke="currentColor" 
         strokeWidth={isFavorited ? 0 : 2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  );
}
