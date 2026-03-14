'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser, getDashboardRouteForRole } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Supabase email/password registration
      // Additional user metadata can be stored in user_metadata
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone_number: formData.phoneNumber,
            username: formData.username,
          },
        },
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
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col pt-4">
      <h2 className="text-3xl font-semibold text-blue-900 mb-8">
        Register
      </h2>
      <form onSubmit={handleRegister} className="flex flex-col gap-6">
        
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-100 rounded-md p-3 outline-none focus:ring-1 focus:ring-blue-500 transition-shadow"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-100 rounded-md p-3 outline-none focus:ring-1 focus:ring-blue-500 transition-shadow"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full bg-gray-50 border border-gray-100 rounded-md p-3 outline-none focus:ring-1 focus:ring-blue-500 transition-shadow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="username"
            required
            value={formData.username}
            onChange={handleChange}
            className="w-full bg-gray-50 border border-gray-100 rounded-md p-3 outline-none focus:ring-1 focus:ring-blue-500 transition-shadow mb-1"
          />
          <p className="text-xs text-gray-500 mt-1">Username cannot be changed.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-gray-50 border border-gray-100 rounded-md p-3 outline-none focus:ring-1 focus:ring-blue-500 transition-shadow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-gray-50 border border-gray-100 rounded-md p-3 outline-none focus:ring-1 focus:ring-blue-500 transition-shadow"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 bg-[#00579e] hover:bg-[#00427a] text-white px-8 py-2 rounded-md font-medium transition-colors w-max disabled:opacity-50"
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>

      </form>
    </div>
  );
}
