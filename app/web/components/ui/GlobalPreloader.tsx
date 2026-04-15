'use client';

import { useState, useEffect } from 'react';
import PremiumLoader from './PremiumLoader';

export default function GlobalPreloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We show the loader for at least 2 seconds or until the DOM is ready
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

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
