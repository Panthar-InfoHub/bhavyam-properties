ALTER TABLE public.agent_applications
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS experience TEXT,
ADD COLUMN IF NOT EXISTS reason TEXT,
ADD COLUMN IF NOT EXISTS skills JSONB,
ADD COLUMN IF NOT EXISTS resume_url TEXT;

-- Create the agent-docs storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('agent-docs', 'agent-docs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their documents
CREATE POLICY "Allow authenticated uploads" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'agent-docs');

-- Allow public access to view the uploaded documents (needed for getPublicUrl)
CREATE POLICY "Allow public viewing" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'agent-docs');
