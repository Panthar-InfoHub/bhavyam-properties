import Razorpay from 'razorpay';

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

if (!key_id || !key_secret) {
  console.warn("Razorpay API keys are missing. Initializing mock client for simulation mode.");
}

// Lazy/Mock initialization to prevent build crash when keys are missing
export const razorpay = (key_id && key_secret) 
  ? new Razorpay({ key_id, key_secret }) 
  : { orders: { create: async () => { throw new Error("Razorpay keys missing. If testing, please use Simulation logic."); } } } as any;
