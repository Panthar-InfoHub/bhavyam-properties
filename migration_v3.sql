-- 1. Update Profiles with Credits
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS credits INT DEFAULT 0;

-- 2. Update Plans table
-- First, handle the check constraint for plan types
ALTER TABLE public.plans DROP CONSTRAINT IF EXISTS plans_type_check;
ALTER TABLE public.plans ADD CONSTRAINT plans_type_check CHECK (type IN ('single_unlock', 'subscription', 'credit_pack'));

-- Add credits_awarded column
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS credits_awarded INT DEFAULT 0;

-- 3. Create RPC for spending credits
CREATE OR REPLACE FUNCTION public.spend_credit(p_property_id UUID, p_duration_days INT)
RETURNS JSON AS $$
DECLARE
    v_credits INT;
    v_user_id UUID;
    v_expiry TIMESTAMP WITH TIME ZONE;
BEGIN
    v_user_id := auth.uid();
    
    -- Get current credits
    SELECT credits INTO v_credits FROM public.profiles WHERE id = v_user_id;
    
    IF v_credits IS NULL OR v_credits < 1 THEN
        RETURN json_build_object('error', 'Insufficient credits');
    END IF;

    -- Calculate expiry
    v_expiry := now() + (p_duration_days || ' days')::INTERVAL;

    -- 1. Deduct Credit
    UPDATE public.profiles 
    SET credits = credits - 1 
    WHERE id = v_user_id;

    -- 2. Create Unlock record
    INSERT INTO public.property_unlocks (user_id, property_id, expires_at)
    VALUES (v_user_id, p_property_id, v_expiry)
    ON CONFLICT (user_id, property_id) 
    DO UPDATE SET expires_at = GREATEST(property_unlocks.expires_at, v_expiry);

    -- 3. Log a "System" Transaction (Free unlock using credit)
    INSERT INTO public.transactions (user_id, property_id, amount, status, payment_type, created_at)
    VALUES (v_user_id, p_property_id, 0, 'completed', 'credit_spend', now());

    RETURN json_build_object('success', true, 'new_balance', v_credits - 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create RPC for awarding credits
CREATE OR REPLACE FUNCTION public.increment_user_credits(p_user_id UUID, p_credits INT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles 
    SET credits = COALESCE(credits, 0) + p_credits 
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Seed Credit Pack Plans
INSERT INTO public.plans (name, description, price, duration_days, type, credits_awarded, features)
VALUES 
  ('12 Credit Pack', 'Unlock any 12 properties. Each unlock lasts 30 days.', 1200, 30, 'credit_pack', 12, '["12 Priority Unlocks", "30-Day Visibility Per Property", "Cheaper than Single Unlocks"]'),
  ('Basic 3-Pack', 'Try it out with 3 property unlocks. Each lasts 15 days.', 450, 15, 'credit_pack', 3, '["3 Property Unlocks", "15-Day Visibility", "Instant Activation"]');
