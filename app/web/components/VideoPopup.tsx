'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function VideoPopup({ 
  videoId = "4jnzf1yj48M",
  children,
  className = "",
  popupContent
}: { 
  videoId?: string; 
  children: React.ReactNode;
  className?: string;
  popupContent?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleClose = () => setIsOpen(false);

  const modal = isOpen && mounted ? createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4 md:p-8"
      style={{ zIndex: 99999 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Box */}
      <div
        className="relative z-10 w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ maxWidth: popupContent ? '900px' : '800px', maxHeight: '85vh' }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-20 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900 hover:shadow-lg transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className={`flex ${popupContent ? 'flex-col md:flex-row' : 'flex-col'} h-full`}>
          {/* Video Panel */}
          <div className={`${popupContent ? 'md:w-[55%] w-full' : 'w-full'} bg-black`} style={{ aspectRatio: '16/9' }}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              className="w-full h-full border-0 block"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Content Panel */}
          {popupContent && (
            <div className="md:w-[45%] w-full p-7 md:p-9 flex flex-col justify-center overflow-y-auto bg-white">
              {popupContent}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <div onClick={() => setIsOpen(true)} className={`cursor-pointer ${className}`}>
        {children}
      </div>
      {modal}
    </>
  );
}
