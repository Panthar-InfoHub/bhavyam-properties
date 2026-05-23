const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://eyhzfduixvzlgrmaahry.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5aHpmZHVpeHZ6bGdybWFhaHJ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMwNzg4MywiZXhwIjoyMDg4ODgzODgzfQ.CLShAzNJM9-DgWKj1Bxw541IP4Rm8JGlVeQp5RiLnG8';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function inspectTransactions() {
  // Let's get the latest transactions
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error('Error fetching transactions:', error);
  } else {
    console.log('Latest transactions in DB:');
    console.log(JSON.stringify(data, null, 2));
  }
}

inspectTransactions();
