const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Read environment variables from .env.local
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

console.log("🔗 Connecting to Supabase at:", supabaseUrl);
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function seedFees() {
  console.log("🌱 Starting database seed for dynamic fees...");

  // 1. Seed Property Verification Fee (₹499)
  const { data: existingVerification } = await supabase
    .from('plans')
    .select('id')
    .eq('name', 'Property Verification Fee')
    .maybeSingle();

  if (!existingVerification) {
    console.log("➕ Seeding Property Verification Fee...");
    const { error } = await supabase.from('plans').insert({
      name: 'Property Verification Fee',
      description: 'Fee required to verify and highlight a property listing. Manual document review and priority search placement.',
      price: 499,
      duration_days: 90,
      type: 'single_unlock', // Satisfies type check constraint
      is_active: true,
      features: [
        "Manual Document Verification",
        "Site Visit Coordination",
        "Trust Badge on Listing",
        "Priority Search Placement"
      ]
    });
    if (error) console.error("❌ Error seeding property_verification:", error.message);
    else console.log("✅ Seeded Property Verification Fee successfully!");
  } else {
    console.log("ℹ️ Property Verification Fee plan already exists.");
  }

  // 2. Seed Agent Application Fee (₹999)
  const { data: existingAgentApply } = await supabase
    .from('plans')
    .select('id')
    .eq('name', 'Agent Application Fee')
    .maybeSingle();

  if (!existingAgentApply) {
    console.log("➕ Seeding Agent Application Fee...");
    const { error } = await supabase.from('plans').insert({
      name: 'Agent Application Fee',
      description: 'Fee required to apply and onboarding as a verified partner agent with Bhavyam Properties.',
      price: 999,
      duration_days: 365,
      type: 'single_unlock', // Satisfies type check constraint
      is_active: true,
      features: [
        "Verified Agent Badge",
        "Priority Listing Visibility",
        "Advanced Analytics",
        "Exclusive Leads Access"
      ]
    });
    if (error) console.error("❌ Error seeding agent_apply:", error.message);
    else console.log("✅ Seeded Agent Application Fee successfully!");
  } else {
    console.log("ℹ️ Agent Application Fee plan already exists.");
  }

  console.log("🏁 Seeding complete!");
}

seedFees();
