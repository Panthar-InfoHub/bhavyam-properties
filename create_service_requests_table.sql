-- Create service_requests table
CREATE TABLE IF NOT EXISTS service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    service_type TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    user_name TEXT NOT NULL,
    contact_info TEXT NOT NULL,
    business_name TEXT,
    business_type TEXT,
    property_type TEXT,
    location TEXT,
    budget TEXT,
    expected_price TEXT,
    assistance_type TEXT,
    loan_amount TEXT,
    employment_status TEXT,
    query_description TEXT NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

-- Allow public inserts
CREATE POLICY "Allow public inserts for service_requests" ON service_requests
    FOR INSERT WITH CHECK (true);

-- Allow admins to view all requests
-- Assuming you have a way to identify admins, e.g., via a profiles table or role
-- For now, allowing authenticated users to view (should be restricted further in production)
CREATE POLICY "Allow users to view their own requests" ON service_requests
    FOR SELECT USING (auth.uid() = user_id);

-- Create a trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_service_requests_updated_at
    BEFORE UPDATE ON service_requests
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
