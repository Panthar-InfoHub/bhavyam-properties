-- Create the 'verification-docs' bucket for property verifications
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification-docs', 'verification-docs', true)
ON CONFLICT (id) DO NOTHING;

-- Create the 'property-media' bucket for general property uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-media', 'property-media', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for 'verification-docs'
CREATE POLICY "Public Access (Verification Docs)"
ON storage.objects FOR SELECT
USING ( bucket_id = 'verification-docs' );

CREATE POLICY "Authenticated users can upload (Verification Docs)"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'verification-docs' );

-- Set up storage policies for 'property-media'
CREATE POLICY "Public Access (Property Media)"
ON storage.objects FOR SELECT
USING ( bucket_id = 'property-media' );

CREATE POLICY "Authenticated users can upload (Property Media)"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'property-media' );

-- Generic management policies for owners
CREATE POLICY "Users can update their own media"
ON storage.objects FOR UPDATE
TO authenticated
USING ( owner = auth.uid() );

CREATE POLICY "Users can delete their own media"
ON storage.objects FOR DELETE
TO authenticated
USING ( owner = auth.uid() );
