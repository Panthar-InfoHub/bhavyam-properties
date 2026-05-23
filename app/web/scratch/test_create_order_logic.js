const fs = require('fs');
const Razorpay = require('razorpay');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envPath = 'c:/PantharInfoHub2nd/bhavyam-properties/app/web/.env.local';
const envFile = fs.readFileSync(envPath, 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.trim().split('=');
  if (parts.length >= 2 && !parts[0].startsWith('#')) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const key_id = env.RAZORPAY_KEY_ID;
const key_secret = env.RAZORPAY_KEY_SECRET;
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

console.log("ENV CHECK:", {
  key_id,
  key_secret: key_secret ? "EXISTS" : "MISSING",
  supabaseUrl,
  supabaseKey: supabaseKey ? "EXISTS" : "MISSING"
});

async function runTest() {
  const rzp = new Razorpay({ key_id, key_secret });
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Get a test user ID and plan ID and property ID
  const testUserId = 'c55b67eb-15ac-4ee1-b114-a533c1f84cb7'; // from inspect_transactions.js success list
  const testPlanId = '70a02020-cfef-4e93-b4b7-e9961bd93afa';
  const testPropertyId = 'a57fb53b-d1ef-4271-9057-2c3950f3b8ec';
  
  console.log("\n--- Testing Razorpay Order Creation ---");
  let order;
  try {
    order = await rzp.orders.create({
      amount: 9900, // ₹99
      currency: 'INR',
      receipt: `rcpt_test_${Date.now()}`,
      notes: { userId: testUserId, planId: testPlanId, propertyId: testPropertyId }
    });
    console.log("✅ Razorpay Order Created:", order.id);
  } catch (err) {
    console.error("❌ Razorpay Error:", err);
  }

  if (order) {
    console.log("\n--- Testing Profiles Check/Upsert ---");
    try {
      const { data: profile, error: profErr } = await supabase.from('profiles').select('id').eq('id', testUserId).maybeSingle();
      if (profErr) {
        console.error("❌ Profile Select Error:", profErr);
      } else {
        console.log("✅ Profile found:", profile);
      }
    } catch (err) {
      console.error("❌ Profiles Exception:", err);
    }

    console.log("\n--- Testing Transactions Table Insert ---");
    try {
      const insertPayload = {
        user_id: testUserId,
        plan_id: testPlanId,
        property_id: testPropertyId,
        amount: 99,
        currency: 'INR',
        status: 'pending',
        payment_type: 'single_unlock',
        razorpay_order_id: order.id
      };
      console.log("Inserting:", insertPayload);
      const { data, error } = await supabase.from('transactions').insert(insertPayload).select();
      if (error) {
        console.error("❌ Transactions Insert Error:", error);
      } else {
        console.log("✅ Transactions Insert Success:", data);
      }
    } catch (err) {
      console.error("❌ Transactions Exception:", err);
    }
  }
}

runTest();
