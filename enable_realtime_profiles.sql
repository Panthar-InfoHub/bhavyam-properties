-- Ensure Realtime is enabled for profiles table so the Navbar can instantly update!
BEGIN;
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
  END IF;
COMMIT;
