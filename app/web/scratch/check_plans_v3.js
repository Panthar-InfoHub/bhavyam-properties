
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://eyhzfduixvzlgrmaahry.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5aHpmZHVpeHZ6bGdybWFhaHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMDc4ODMsImV4cCI6MjA4ODg4Mzg4M30.Ri9lS5eDStwVzhFn-XjV3t8A-Us_N6mJcnmzzDz_bxo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPlans() {
  const { data, error } = await supabase.from('plans').select('*').eq('is_active', true);
  if (error) {
    console.error(error);
  } else {
    console.log('Active Plans in DB:');
    console.table(data.map(p => ({
      id: p.id,
      name: p.name,
      type: p.type,
      price: p.price,
      duration: p.duration_days,
      credits: p.credits_awarded
    })));
  }
}

checkPlans();
