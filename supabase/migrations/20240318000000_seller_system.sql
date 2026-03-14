-- Add seller_verified column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified_seller BOOLEAN DEFAULT FALSE;

-- Add edit/delete/document requests table for sellers
CREATE TABLE IF NOT EXISTS public.requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    request_type TEXT NOT NULL CHECK (request_type IN ('edit', 'delete', 'update_documents')),
    message TEXT,
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- Sellers can insert their own requests
CREATE POLICY "Sellers can insert own requests" ON public.requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Sellers can view their own requests
CREATE POLICY "Sellers can view own requests" ON public.requests
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can manage all requests
CREATE POLICY "Admins can manage all requests" ON public.requests
    FOR ALL USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );
