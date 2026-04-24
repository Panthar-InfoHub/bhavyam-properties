
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
