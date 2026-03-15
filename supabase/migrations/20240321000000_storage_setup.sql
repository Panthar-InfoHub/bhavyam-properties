-- 1. Create the bucket for property media
-- This bucket will store photos, videos, and legal documents for properties.
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-media', 'property-media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up RLS Policies for the bucket

-- Allow Public Access to view any file in the property-media bucket
-- (Important so the website can display the property images to everyone)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'property-media' );

-- Allow Authenticated Users to upload files
-- We restrict this to logged-in users. 
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'property-media' );

-- Allow Users to delete their own media
-- This works by checking if the owner (auth.uid()) matches the metadata
CREATE POLICY "Users can delete own media"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'property-media' AND (storage.foldername(name))[1] = auth.uid()::text );
