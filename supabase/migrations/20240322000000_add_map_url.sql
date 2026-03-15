-- Add map_url to properties table
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS map_url TEXT;

-- Update RLS policies (though existing ones for properties usually cover new columns)
-- No changes needed to policies if they use SELECT * or specific columns (we'll check)
