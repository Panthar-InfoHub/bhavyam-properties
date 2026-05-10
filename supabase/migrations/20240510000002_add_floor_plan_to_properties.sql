-- Add floor_plan_url to properties table
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS floor_plan_url TEXT;

-- Update RLS if needed (usually covered by existing ALL/UPDATE policies, but good to double check)
-- Existing policies on properties table:
-- "Owners can update own properties" ON public.properties FOR UPDATE USING (auth.uid() = owner_id);
-- This will automatically cover the new column.
