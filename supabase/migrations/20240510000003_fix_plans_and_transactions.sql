-- 1. Ensure plans table exists with all necessary columns
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    duration_days INTEGER NOT NULL,
    credits_awarded INTEGER DEFAULT 0,
    features JSONB DEFAULT '[]',
    type TEXT NOT NULL, -- 'subscription', 'single_unlock', 'credit_pack'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Update Profiles with essential columns for plans and credits
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES public.plans(id);

-- 3. Insert the three standard plans (using UPSERT logic via ON CONFLICT or NOT EXISTS)
-- Plan 1: Quick Unlock (₹99 for 7 days, 1 property)
INSERT INTO public.plans (name, description, price, duration_days, credits_awarded, features, type, is_active)
SELECT 
    'Quick Unlock', 
    'Instant access to address, maps, and documents for 7 days.', 
    99, 
    7, 
    0,
    '["Exact Address", "Google Maps Location", "Legal Documents", "Floor Plans", "7 Days Access"]'::jsonb, 
    'single_unlock', 
    true
WHERE NOT EXISTS (SELECT 1 FROM public.plans WHERE type = 'single_unlock');

-- Plan 2: Credit Pack (₹999 for 30 days, 12 properties)
INSERT INTO public.plans (name, description, price, duration_days, credits_awarded, features, type, is_active)
SELECT 
    'Credit Pack', 
    'Get 12 credits to unlock any 12 properties. Each unlock lasts 30 days.', 
    999, 
    30, 
    12,
    '["12 Property Credits", "30 Days Access per Property", "Priority Support", "Legal Document Access"]'::jsonb, 
    'credit_pack', 
    true
WHERE NOT EXISTS (SELECT 1 FROM public.plans WHERE type = 'credit_pack');

-- Plan 3: Elite Membership (₹9,999 for 1 year, unlimited)
INSERT INTO public.plans (name, description, price, duration_days, credits_awarded, features, type, is_active)
SELECT 
    'Elite Membership', 
    'The ultimate plan. Unlimited access to all properties and features for a full year.', 
    9999, 
    365, 
    0,
    '["Unlimited Property Unlocks", "Full Map & Address Access", "All Floor Plans & Docs", "Dedicated Support", "1 Year Validity"]'::jsonb, 
    'subscription', 
    true
WHERE NOT EXISTS (SELECT 1 FROM public.plans WHERE type = 'subscription');

-- Ensure transactions table exists (used by payments API)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'INR' NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    payment_type TEXT NOT NULL,
    razorpay_order_id TEXT UNIQUE,
    razorpay_payment_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view active plans' AND tablename = 'plans') THEN
        CREATE POLICY "Anyone can view active plans" ON public.plans FOR SELECT USING (is_active = true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own transactions' AND tablename = 'transactions') THEN
        CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- RPC: Spend Credit to unlock a property
CREATE OR REPLACE FUNCTION public.spend_credit(p_property_id UUID, p_duration_days INTEGER DEFAULT 30)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_credits INTEGER;
BEGIN
    -- 1. Check if user has credits
    SELECT credits INTO v_credits FROM public.profiles WHERE id = v_user_id;
    
    IF v_credits IS NULL OR v_credits < 1 THEN
        RETURN jsonb_build_object('error', 'Insufficient credits');
    END IF;

    -- 2. Deduct credit
    UPDATE public.profiles SET credits = credits - 1 WHERE id = v_user_id;

    -- 3. Upsert unlock record
    INSERT INTO public.property_unlocks (user_id, property_id, expires_at)
    VALUES (v_user_id, p_property_id, now() + (p_duration_days || ' days')::interval)
    ON CONFLICT (user_id, property_id) 
    DO UPDATE SET expires_at = now() + (p_duration_days || ' days')::interval;

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Increment credits (used by Admin/Payment Verify)
CREATE OR REPLACE FUNCTION public.increment_user_credits(p_user_id UUID, p_credits INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles 
    SET credits = COALESCE(credits, 0) + p_credits 
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

