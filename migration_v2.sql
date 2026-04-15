-- Rename payments to transactions if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payments') THEN
    ALTER TABLE public.payments RENAME TO transactions;
  ELSE
    -- Create the table if it's new
    CREATE TABLE IF NOT EXISTS public.transactions (
      id uuid primary key default gen_random_uuid(),
      user_id uuid references public.profiles(id) on delete cascade,
      property_id uuid references public.properties(id) on delete set null,
      amount numeric not null,
      currency text default 'INR',
      status text default 'pending' check (status in ('pending', 'completed', 'failed')),
      payment_type text, -- 'subscription' or 'single_unlock'
      razorpay_order_id text,
      razorpay_payment_id text,
      created_at timestamptz default now()
    );
  END IF;
END $$;

-- Ensure payment_type exists if we renamed an old table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name='transactions' AND column_name='payment_type') THEN
    ALTER TABLE public.transactions ADD COLUMN payment_type text;
  END IF;
END $$;
