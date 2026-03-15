import { supabase } from './supabaseClient';

export const signUpUser = async (email: string, password: string, metadata: any = {}) => {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
};

export const signInUser = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signOutUser = async () => {
  return await supabase.auth.signOut();
};

// Get Current User Session (Client/Browser side)
export const getCurrentUser = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  
  if (!session?.user) return null;

  // Fetch the extended profile metadata which includes their assigned role
  // using our 'public.profiles' table mapping
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();

  if (profileError) {
    console.warn('Error getting user profile details:', profileError);
  }

  return {
    ...session.user,
    profile: profile || null, 
  };
};

/**
 * Standard utility to securely determine the dashboard route string
 * based on a given user's role from the database.
 * @param role ('admin' | 'agent' | 'seller' | 'user')
 */
export const getDashboardRouteForRole = (role?: string) => {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'agent':
      return '/agent';
    case 'seller':
      return '/seller';
    case 'buyer':
    case 'user':
    default:
      return '/user'; // Default fallback dashboard map
  }
};
