const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://eyhzfduixvzlgrmaahry.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5aHpmZHVpeHZ6bGdybWFhaHJ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMwNzg4MywiZXhwIjoyMDg4ODgzODgzfQ.CLShAzNJM9-DgWKj1Bxw541IP4Rm8JGlVeQp5RiLnG8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    const { data, error } = await supabase.from('plans').select('*').limit(1);
    if (error) {
        console.error("Error:", error);
        return;
    }
    if (data && data.length > 0) {
        console.log("Columns in plans:", Object.keys(data[0]));
    } else {
        // If no data, try to get from introspection if possible or just use common sense
        console.log("No data in plans to check columns. I will insert a dummy and check or use a different method.");
        // Let's try to get one row even if it's inactive
        const { data: allData } = await supabase.from('plans').select('*').limit(1);
        if (allData && allData[0]) {
             console.log("Columns in plans:", Object.keys(allData[0]));
        }
    }
}

checkColumns();
