-- Allow authenticated users to insert their own profile row.
-- This is needed for the client-side OAuth fallback upsert in app/dashboard/page.tsx
-- which creates a profile when the database trigger fails to (e.g. Google OAuth users).
-- The WITH CHECK (auth.uid() = id) ensures users can only insert a row for themselves.

CREATE POLICY "Users can insert own profile."
    ON public.profiles FOR INSERT
    WITH CHECK ( auth.uid() = id );
