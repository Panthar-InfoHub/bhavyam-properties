
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://eyhzfduixvzlgrmaahry.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5aHpmZHVpeHZ6bGdybWFhaHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMDc4ODMsImV4cCI6MjA4ODg4Mzg4M30.Ri9lS5eDStwVzhFn-XjV3t8A-Us_N6mJcnmzzDz_bxo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function synchronizePlans() {
  console.log('🔄 Synchronizing plans with business logic...');

  // 1. Update Basic 3-Pack to 30 days
  const { error: err1 } = await supabase
    .from('plans')
    .update({ 
      duration_days: 30, 
      description: 'Unlock any 3 properties. Each unlock lasts 30 days.' 
    })
    .eq('name', 'Basic 3-Pack');
  
  if (err1) console.error('Error updating 3-Pack:', err1);
  else console.log('✅ Updated Basic 3-Pack to 30 days.');

  // 2. Ensure Single Unlock is correct
  const { error: err2 } = await supabase
    .from('plans')
    .update({ 
      type: 'single_unlock',
      description: 'Access all hidden details of ONE specific property for 7 days.'
    })
    .eq('name', '7-Day Single Unlock');
  
  if (err2) console.error('Error updating Single Unlock:', err2);
  else console.log('✅ Verified Single Unlock settings.');

  // 3. Create/Upsert Elite Membership
  const { data: existingMembership } = await supabase
    .from('plans')
    .select('id')
    .eq('type', 'subscription')
    .maybeSingle();

  if (!existingMembership) {
    const { error: err3 } = await supabase.from('plans').insert({
      name: 'Elite Membership',
      description: 'Unlimited access to ALL property details and direct owner contacts for one full year.',
      price: 9999,
      duration_days: 365,
      type: 'subscription',
      is_active: true,
      features: JSON.stringify([
        "Unlimited Property Unlocks",
        "Direct Owner Contact Info",
        "Priority Support",
        "Verified Agent Badge",
        "Unlimited Property Submissions"
      ])
    });
    if (err3) console.error('Error creating Membership plan:', err3);
    else console.log('✅ Created Elite Membership plan.');
  } else {
    await supabase.from('plans').update({ is_active: true }).eq('id', existingMembership.id);
    console.log('✅ Elite Membership plan is active.');
  }

  console.log('🏁 Synchronization complete.');
}

synchronizePlans();
