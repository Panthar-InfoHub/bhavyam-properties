-- Add missing columns to properties table for better agent-admin communication
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS admin_feedback TEXT;
