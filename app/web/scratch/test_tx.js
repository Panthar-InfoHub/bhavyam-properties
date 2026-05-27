const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env.local');
let supabaseUrl = '';
let serviceRoleKey = '';

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      if (key === 'NEXT_PUBLIC_SUPABASE_URL') {
        supabaseUrl = val;
      } else if (key === 'SUPABASE_SERVICE_ROLE_KEY') {
        serviceRoleKey = val;
      }
    }
  }
} catch (e) {
  console.error("❌ Failed to parse .env.local:", e.message);
  process.exit(1);
}

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing Supabase keys in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function testQuery() {
  console.log("🔍 Fetching recent transactions...");
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error("❌ Error fetching transactions:", error.message);
  } else {
    console.log("📋 Recent transactions count:", data.length);
    data.forEach((tx, idx) => {
      console.log(`\n--- Transaction #${idx + 1} ---`);
      console.log(`ID: ${tx.id}`);
      console.log(`User ID: ${tx.user_id}`);
      console.log(`Plan ID: ${tx.plan_id}`);
      console.log(`Property ID: ${tx.property_id}`);
      console.log(`Amount: ${tx.amount}`);
      console.log(`Status: ${tx.status}`);
      console.log(`Payment Type: ${tx.payment_type}`);
      console.log(`Order ID: ${tx.razorpay_order_id}`);
      console.log(`Created At: ${tx.created_at}`);
    });
  }
}

testQuery();
