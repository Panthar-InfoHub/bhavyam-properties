'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const redirect = async () => {
      const { supabase } = await import('@/lib/supabaseClient');

      // Supabase JS SDK auto-parses the #access_token hash on OAuth callback
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) { router.replace('/login'); return; }

      const u = session.user;
      const meta = u.user_metadata || {};

      // Try fetching the profile — use maybeSingle() to avoid 406 on missing rows
      let { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', u.id)
        .maybeSingle();

      // ── Profile missing (Google OAuth user whose trigger didn't fire) ──
      // Upsert a profile row derived from OAuth metadata so the user isn't
      // stuck in a redirect loop forever.
      if (!profile) {
        // Split full_name ("Nikhil Raikwar") → first + last
        const fullName: string = meta.full_name || meta.name || '';
        const parts = fullName.trim().split(' ');
        const firstName = parts[0] || null;
        const lastName = parts.length > 1 ? parts.slice(1).join(' ') : null;

        const { data: upserted } = await supabase
          .from('profiles')
          .upsert({
            id:          u.id,
            email:       u.email ?? meta.email,
            first_name:  firstName,
            last_name:   lastName,
            avatar_url:  meta.avatar_url || meta.picture || null,
            role:        'buyer',
          }, { onConflict: 'id' })
          .select('role')
          .maybeSingle();

        profile = upserted;
      }

      // Role → route
      const role = profile?.role;
      let route = '/user';
      if (role === 'admin')       route = '/admin';
      else if (role === 'agent')  route = '/agent';
      else if (role === 'seller') route = '/seller';

      router.replace(route);
    };

    redirect();
  }, [router]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] gap-6">
      <div className="animate-spin rounded-full h-14 w-14 border-4 border-teal-500 border-t-transparent" />
      <div className="text-center">
        <p className="text-lg font-bold text-gray-700">Signing you in…</p>
        <p className="text-sm text-gray-400 mt-1">Redirecting to your dashboard</p>
      </div>
    </div>
  );
}
