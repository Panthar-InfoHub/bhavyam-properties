-- Add document columns to agent_applications
ALTER TABLE public.agent_applications 
ADD COLUMN IF NOT EXISTS aadhaar_url TEXT,
ADD COLUMN IF NOT EXISTS pan_url TEXT,
ADD COLUMN IF NOT EXISTS certificate_url TEXT;

-- Create storage bucket for agent documents if it doesn't exist
-- Note: In Supabase, bucket creation is usually done via dashboard or API, 
-- but we can insert into storage.buckets if we have permissions.
-- However, standard practice in migrations is just to assume the bucket exists 
-- or create it via a script.
-- For now, we will add columns to the table.

-- Policy to allow users to upload to their own folder in agent-docs bucket
-- (Assuming bucket 'agent-docs' exists)
-- This SQL is for the storage schema.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('agent-docs', 'agent-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for agent-docs bucket
CREATE POLICY "Users can upload their own agent docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'agent-docs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own agent docs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'agent-docs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admins can view all agent docs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'agent-docs' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
