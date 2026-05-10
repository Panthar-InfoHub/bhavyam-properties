-- Function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create property_verifications table
CREATE TABLE IF NOT EXISTS property_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    agent_id UUID REFERENCES auth.users(id),
    
    owner_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    
    property_type TEXT NOT NULL,
    area_size TEXT NOT NULL,
    location TEXT NOT NULL,
    address TEXT NOT NULL,
    google_maps_url TEXT,
    purpose TEXT NOT NULL CHECK (purpose IN ('selling', 'renting')),
    expected_price NUMERIC,
    
    floor_plan_url TEXT,
    images TEXT[] DEFAULT '{}',
    video_url TEXT,
    certificate_url TEXT,
    id_proof_url TEXT,
    
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    admin_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE property_verifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own verifications" ON property_verifications
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = agent_id);

CREATE POLICY "Admins can view all verifications" ON property_verifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Users/Agents can insert verifications" ON property_verifications
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() = agent_id);

CREATE POLICY "Admins can update verifications" ON property_verifications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Trigger for updated_at
CREATE TRIGGER set_updated_at_property_verifications
    BEFORE UPDATE ON property_verifications
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();
