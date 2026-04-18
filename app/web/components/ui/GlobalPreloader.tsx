'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import PremiumLoader from './PremiumLoader';

export default function GlobalPreloader() {
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Only show loader for 2 seconds on initial hit to homepage
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Condition: Only trigger this heavy global loader on the exact homepage
  if (!loading || pathname !== '/') return null;

  return (
    <PremiumLoader 
      messages={[
        "Initializing Bhavyam Ecosystem",
        "Loading premium assets",
        "Configuring secure gateway",
        "Welcome to the future of Estate"
      ]}
      duration={600}
    />
  );
}
