-- Migration to support Property Unlocking and Subscription Plans

-- 1. Update Profiles with Subscription info
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- 2. Create Property Unlocks table (for individual 1-week access)
CREATE TABLE IF NOT EXISTS public.property_unlocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE(user_id, property_id)
);

-- Enable RLS
ALTER TABLE public.property_unlocks ENABLE ROW LEVEL SECURITY;

-- Policies for property_unlocks
CREATE POLICY "Users can view their own unlocks" 
ON public.property_unlocks FOR SELECT 
USING (auth.uid() = user_id);

-- Secure access check function
CREATE OR REPLACE FUNCTION public.check_property_access(p_property_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  has_active_plan BOOLEAN;
  has_active_unlock BOOLEAN;
BEGIN
  -- Check for active subscription plan (e.g. 499 plan)
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND subscription_plan != 'free'
    AND (subscription_expires_at IS NULL OR subscription_expires_at > now())
  ) INTO has_active_plan;

  IF has_active_plan THEN
    RETURN TRUE;
  END IF;

  -- Check for individual property unlock (1 week access)
  SELECT EXISTS (
    SELECT 1 FROM public.property_unlocks
    WHERE user_id = auth.uid()
    AND property_id = p_property_id
    AND expires_at > now()
  ) INTO has_active_unlock;

  RETURN has_active_unlock;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update Properties RLS to allow reading sensitive fields based on access
-- This is tricky because we already have a SELECT policy.
-- We might need a separate function for the sensitive fields or just handle it in the UI/API layer.
-- For now, let's allow admins and owners to always see everything.
-- For buyers/agents, we'll let the UI handle the "Locked" state, 
-- but we can tighten RLS for 'address' and 'owner_id' if needed.
