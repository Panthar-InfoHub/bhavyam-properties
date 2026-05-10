-- Update Profiles table to match the specified schema
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS agent_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS is_verified_seller BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Ensure plan_id foreign key exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_plan_id_fkey') THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_plan_id_fkey 
        FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE SET DEFAULT;
    END IF;
END $$;

-- Create index on phone_number if not exists
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles USING btree (phone_number);
