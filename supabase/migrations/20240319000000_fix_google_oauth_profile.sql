-- Fix handle_new_user trigger to correctly support both:
-- 1. Email/Password signups (sends first_name, last_name, phone_number, username via metadata)
-- 2. Google OAuth signups (sends full_name, name, avatar_url, email_verified via metadata)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  full_name_parts TEXT[];
  derived_first TEXT;
  derived_last TEXT;
BEGIN
  -- For Google OAuth, metadata has 'full_name'; for email signup it has 'first_name'/'last_name'
  IF new.raw_user_meta_data->>'first_name' IS NOT NULL THEN
    -- Email/password signup path
    derived_first := new.raw_user_meta_data->>'first_name';
    derived_last  := new.raw_user_meta_data->>'last_name';
  ELSIF new.raw_user_meta_data->>'full_name' IS NOT NULL THEN
    -- Google OAuth path — split full_name on first space
    full_name_parts := string_to_array(new.raw_user_meta_data->>'full_name', ' ');
    derived_first := full_name_parts[1];
    derived_last  := CASE WHEN array_length(full_name_parts, 1) > 1
                          THEN array_to_string(full_name_parts[2:], ' ')
                          ELSE NULL END;
  ELSE
    -- Fallback: use 'name' field or null
    derived_first := new.raw_user_meta_data->>'name';
    derived_last  := NULL;
  END IF;

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
    -- Google sends 'avatar_url' or 'picture'
    COALESCE(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    ),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'buyer'::user_role)
  )
  ON CONFLICT (id) DO NOTHING; -- safe re-run guard

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
