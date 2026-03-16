-- Fix RLS for property_unlocks table
-- The previous migration only allowed SELECT, but users need to INSERT their own unlocks.

CREATE POLICY "Users can insert their own property unlocks" 
ON public.property_unlocks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Also allow updates (e.g. renewing an expired unlock)
CREATE POLICY "Users can update their own property unlocks" 
ON public.property_unlocks FOR UPDATE
USING (auth.uid() = user_id);
