/**
 * Dynamically loads the Razorpay checkout script and returns a promise.
 * Ensures window.Razorpay is available before opening.
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    // Check if script is already present in document
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      // Script is present but maybe not loaded yet, wait a bit or try to bind to its load event
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if ((window as any).Razorpay) {
          clearInterval(interval);
          resolve(true);
        } else if (attempts > 50) { // 5 seconds timeout
          clearInterval(interval);
          resolve(false);
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      resolve(!!(window as any).Razorpay);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};
