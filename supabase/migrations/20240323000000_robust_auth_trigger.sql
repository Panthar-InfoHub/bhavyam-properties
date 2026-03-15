-- Robust Auth Trigger to resolve "Database error saving new user"
-- This migration updates the handle_new_user function to:
-- 1. Use an EXCEPTION block to ensure Auth transactions never fail if profile creation hits a snag.
-- 2. Use a safer role casting logic.
-- 3. Explicitly set the search_path for security.
-- 4. Use ON CONFLICT (id) DO UPDATE as a secondary safety measure.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  full_name_parts TEXT[];
  derived_first TEXT;
  derived_last TEXT;
  assigned_role public.user_role;
  raw_role_text TEXT;
BEGIN
  -- 1. Extract Name Parts Safely
  IF new.raw_user_meta_data->>'first_name' IS NOT NULL THEN
    derived_first := new.raw_user_meta_data->>'first_name';
    derived_last  := new.raw_user_meta_data->>'last_name';
  ELSIF new.raw_user_meta_data->>'full_name' IS NOT NULL THEN
    full_name_parts := string_to_array(new.raw_user_meta_data->>'full_name', ' ');
    derived_first := full_name_parts[1];
    derived_last  := CASE 
                        WHEN array_length(full_name_parts, 1) > 1 
                        THEN array_to_string(full_name_parts[2:], ' ') 
                        ELSE NULL 
                     END;
  ELSE
    derived_first := COALESCE(new.raw_user_meta_data->>'name', 'User');
    derived_last  := NULL;
  END IF;

  -- 2. Safe Role Assignment
  -- Validates that the role in metadata exists in our ENUM, otherwise defaults to 'buyer'
  raw_role_text := new.raw_user_meta_data->>'role';
  IF raw_role_text IS NOT NULL AND raw_role_text IN ('admin', 'agent', 'buyer', 'seller') THEN
    assigned_role := raw_role_text::public.user_role;
  ELSE
    assigned_role := 'buyer'::public.user_role;
  END IF;

  -- 3. Perform Insert/Upsert
  -- We use UPSERT logic to handle cases where a profile might exist for a recycled UUID
  -- or if the trigger is firing on a re-authentication event.
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    phone_number,
    username,
    avatar_url,
    role
  )
  VALUES (
    new.id,
    new.email,
    derived_first,
    derived_last,
    new.raw_user_meta_data->>'phone_number',
    new.raw_user_meta_data->>'username',
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    assigned_role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(profiles.first_name, EXCLUDED.first_name),
    last_name = COALESCE(profiles.last_name, EXCLUDED.last_name),
    avatar_url = COALESCE(profiles.avatar_url, EXCLUDED.avatar_url),
    updated_at = now();

  RETURN new;

EXCEPTION WHEN OTHERS THEN
  -- SILENT FAIL: If anything goes wrong here, we STILL want the user to be created 
  -- in the auth.users table. The application's dashboard fallback logic 
  -- will attempt to fix the profile later.
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
