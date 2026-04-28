const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://eyhzfduixvzlgrmaahry.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5aHpmZHVpeHZ6bGdybWFhaHJ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMwNzg4MywiZXhwIjoyMDg4ODgzODgzfQ.CLShAzNJM9-DgWKj1Bxw541IP4Rm8JGlVeQp5RiLnG8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMedia() {
    const { data, error } = await supabase.from('property_media').select('*').limit(1);
    if (error) {
        console.error("Error:", error);
        return;
    }
    if (data && data.length > 0) {
        console.log("Columns in property_media:", Object.keys(data[0]));
    } else {
        console.log("No data in property_media to check columns.");
    }
}

checkMedia();
