-- Create loan_inquiries table
CREATE TABLE public.loan_inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    company_id TEXT NOT NULL,
    loan_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.loan_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated users to insert
CREATE POLICY "Allow public inserts to loan_inquiries"
ON public.loan_inquiries FOR INSERT
TO public, authenticated
WITH CHECK (true);

-- Only admins can view/manage loan inquiries
CREATE POLICY "Allow admins to manage loan_inquiries"
ON public.loan_inquiries FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);
