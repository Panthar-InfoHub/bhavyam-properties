'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="w-full bg-white shadow-sm border-b border-gray-100 flex items-center justify-between px-8 py-4 sticky top-0 z-50">
      
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-2 group">
        <svg className="w-10 h-10 text-teal-500 transform group-hover:scale-105 transition-transform" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3L2 12h3v8h14v-8h3L12 3zm4 15h-8v-6h8v6z" />
          <path d="M11 13h2v4h-2z" fill="white" />
        </svg>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-[#00b48f] leading-none uppercase tracking-wider">
            Bhavyam
          </span>
          <span className="text-[0.6rem] font-semibold text-gray-500 uppercase tracking-[0.2em] leading-tight">
            Properties
          </span>
        </div>
      </Link>

      {/* Center Links */}
      <ul className="hidden md:flex gap-8 items-center text-sm font-medium text-gray-700">
        <li>
          <Link href="/" className="hover:text-teal-600 transition-colors">Home</Link>
        </li>
        <li>
          <Link href="/about" className="hover:text-teal-600 transition-colors">About</Link>
        </li>
        <li>
          <Link href="/properties" className="hover:text-teal-600 transition-colors">All Properties</Link>
        </li>
        <li>
          <Link href="/join" className="hover:text-teal-600 transition-colors">Join Us</Link>
        </li>
        <li>
          <Link href="/terms" className="hover:text-teal-600 transition-colors">Terms and Conditions</Link>
        </li>
      </ul>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        {/* Heart/Favorite Icon */}
        <button className="relative p-2 rounded-full border border-gray-200 text-teal-500 hover:bg-teal-50 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            0
          </span>
        </button>

        {/* Profile Icon */}
        <Link href="/login" className="p-2 rounded-full border border-gray-200 text-teal-500 hover:bg-teal-50 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </Link>

        {/* Add Property Button */}
        <Link href="/add-property" className="flex items-center gap-2 bg-[#00b48f] hover:bg-teal-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm ml-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Property
        </Link>
      </div>

    </nav>
  );
}
