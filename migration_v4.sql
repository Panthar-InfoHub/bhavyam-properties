-- migration_v4.sql
-- Fix for Profile Settings: Add missing columns to profiles table

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Ensure indexes for performance if needed
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone_number);

-- 6. Add Webhook Logs table for debugging Razorpay events
CREATE TABLE IF NOT EXISTS public.webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event TEXT,
    order_id TEXT,
    payload JSONB,
    status TEXT, -- 'received', 'verified', 'error', 'failed_signature'
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
