'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser, getDashboardRouteForRole } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import GoogleButton from '@/components/auth/GoogleButton';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Supabase email/password login
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Check User Profile for their exact Role mapping
      const user = await getCurrentUser();
      if (user?.profile?.role) {
         router.push(`/dashboard${getDashboardRouteForRole(user.profile.role)}`);
      } else {
         router.push('/dashboard/user'); // Fallback route
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col pt-4">
      <h2 className="text-3xl font-semibold text-blue-900 mb-8">Login</h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username or E-mail <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-md p-3 outline-none focus:ring-1 focus:ring-blue-500 transition-shadow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-md p-3 pr-10 outline-none focus:ring-1 focus:ring-blue-500 transition-shadow"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#00579e] hover:bg-[#00427a] text-white px-8 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600" />
            Remember Me
          </label>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="mt-2">
          <a href="#" className="text-[#00b48f] text-sm hover:underline font-medium">
            Forgot your password?
          </a>
        </div>
      </form>
      
      <div className="mt-8 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>
      
      <div className="mt-6">
        <GoogleButton />
      </div>
    </div>
  );
}
