-- Add approval status to reviews table
ALTER TABLE public.reviews ADD COLUMN status TEXT DEFAULT 'pending' NOT NULL;

-- Drop previous open policy
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;

-- Replace with strict approval-only policy for public viewing
CREATE POLICY "Anyone can view approved reviews" ON public.reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Users can view their own reviews regardless of status" ON public.reviews FOR SELECT USING (auth.uid() = user_id);
