const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './app/web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUnlocks() {
    console.log("Checking property unlocks...");
    
    const { data: unlocks, error } = await supabase
        .from('property_unlocks')
        .select(`
            id, 
            user_id, 
            property_id, 
            expires_at, 
            created_at,
            property:properties (id, property_type, city, status)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log("Total Unlocks found:", unlocks.length);
    unlocks.forEach(u => {
        const now = new Date();
        const expiry = new Date(u.expires_at);
        const isExpired = expiry < now;
        console.log(`- Unlock ID: ${u.id}`);
        console.log(`  User: ${u.user_id}`);
        console.log(`  Property: ${u.property?.id} (${u.property?.property_type} in ${u.property?.city})`);
        console.log(`  Status: ${u.property?.status}`);
        console.log(`  Expires At: ${u.expires_at} ${isExpired ? '(EXPIRED)' : '(ACTIVE)'}`);
        console.log(`  Created At: ${u.created_at}`);
        console.log('---');
    });
}

checkUnlocks();
