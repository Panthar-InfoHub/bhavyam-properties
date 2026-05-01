"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on dashboard/admin routes which are typically full-app views
  if (
    (pathname?.startsWith("/dashboard") || 
     pathname?.startsWith("/admin") || 
     pathname?.startsWith("/user") || 
     pathname?.startsWith("/seller")) &&
    pathname !== "/user/apply-agent"
  ) {
    return null;
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#0f2336] text-gray-300 relative">
      {/* Background overlay if we wanted one, currently solid color */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-bold">Quick Links</h3>
            <div className="w-6 h-0.5 bg-[#00b48f] mt-3 mb-6"></div>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#" className="hover:text-white transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-white transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white text-lg font-bold">Newsletter</h3>
            <div className="w-6 h-0.5 bg-[#00b48f] mt-3 mb-6"></div>
            <p className="text-sm">We never spam you!</p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-lg font-bold">Contact</h3>
            <div className="w-6 h-0.5 bg-[#00b48f] mt-3 mb-6"></div>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>63 kisan bazar, Jhansi Uttar Pradesh</span>
              </li>
              <li className="flex gap-3 items-center">
                <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>info@bhavyamproperties.in</span>
              </li>
              <li className="flex gap-3 items-center">
                <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>9451567034</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sub-footer */}
      <div className="bg-[#0b1a29] py-5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <Link href="#" className="hover:text-white transition-colors text-[11px] uppercase tracking-wider">About Us</Link>
            <span className="text-gray-600">.</span>
            <Link href="/terms-and-conditions" className="hover:text-white transition-colors text-[11px] uppercase tracking-wider">Terms and Conditions</Link>
            <span className="text-gray-600">.</span>
            <Link href="/privacy-policy" className="hover:text-white transition-colors text-[11px] uppercase tracking-wider">Privacy Policy</Link>
            <span className="text-gray-600">.</span>
            <Link href="#" className="hover:text-white transition-colors text-[11px] uppercase tracking-wider">Contact Us</Link>
          </div>
          <div className="text-[11px] uppercase tracking-wider">
            2022© All right reserved by Bhavyam Properties
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button 
        onClick={scrollToTop}
        className="absolute bottom-6 right-6 p-2 bg-[#00ecbd] hover:bg-[#00b48f] text-white rounded shadow-lg transition-colors z-50 flex items-center justify-center"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 11l7-7 7 7M5 19l7-7 7 7" />
        </svg>
      </button>
    </footer>
  );
}
