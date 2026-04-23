
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  const { data, error } = await supabase.from('property_unlocks').select('*').limit(1);
  if (error) {
    console.error(error);
  } else {
    console.log('Columns in property_unlocks:', Object.keys(data[0] || {}));
  }
}

checkColumns();
