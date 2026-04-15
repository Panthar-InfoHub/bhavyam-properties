-- Create the plans table
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric not null,
  duration_days int not null,
  type text not null check (type in ('single_unlock', 'subscription')),
  features jsonb, -- Array of strings/features
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Seed initial records matches current hardcoded values
insert into public.plans (name, description, price, duration_days, type, features)
values 
  ('7-Day Single Unlock', 'Access all hidden details of ONE specific property for 7 days.', 49, 7, 'single_unlock', '["Map Coordinates", "Direct Owner Access", "Legal Document Photocopy"]'),
  ('Pro Monthly Plan', 'Unlock ALL properties on the platform for 30 days.', 499, 30, 'subscription', '["Unlimited Access", "Priority Support", "Legal Assistance"]');

-- Update profiles table for subscription_plan to be flexible (if not already)
-- Ensure subscription_expires_at exists
-- Ensure payments table is ready for plan-based logging
