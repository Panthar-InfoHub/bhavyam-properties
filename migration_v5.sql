-- migration_v5.sql
-- Fix for Payment Tracking: Add missing columns to transactions table

DO $$ 
BEGIN
  -- 1. Add plan_id
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name='transactions' AND column_name='plan_id') THEN
    ALTER TABLE public.transactions ADD COLUMN plan_id uuid REFERENCES public.plans(id) ON DELETE SET NULL;
  END IF;

  -- 2. Add razorpay_order_id
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name='transactions' AND column_name='razorpay_order_id') THEN
    ALTER TABLE public.transactions ADD COLUMN razorpay_order_id text;
  END IF;

  -- 3. Add razorpay_payment_id
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name='transactions' AND column_name='razorpay_payment_id') THEN
    ALTER TABLE public.transactions ADD COLUMN razorpay_payment_id text;
  END IF;

  -- 4. Add updated_at
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name='transactions' AND column_name='updated_at') THEN
    ALTER TABLE public.transactions ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;
