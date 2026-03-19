-- 1. Create a function to securely check if the current user is an admin without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- 2. Add admin access to properties
CREATE POLICY "Admins can manage all properties" 
  ON public.properties FOR ALL 
  USING (public.is_admin());

-- 3. Add admin access to property media
CREATE POLICY "Admins can manage all property media" 
  ON public.property_media FOR ALL 
  USING (public.is_admin());

-- 4. Add admin access to reviews
CREATE POLICY "Admins can manage all reviews" 
  ON public.reviews FOR ALL 
  USING (public.is_admin());

-- 5. Add admin access to user profiles so they can see all users
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles FOR SELECT 
  USING (public.is_admin());

-- 6. Add admin access to interest requests
CREATE POLICY "Admins can view all interest requests" 
  ON public.interest_requests FOR ALL 
  USING (public.is_admin());

-- 7. Add admin access to seller/general requests
CREATE POLICY "Admins can view all requests" 
  ON public.requests FOR ALL 
  USING (public.is_admin());

-- 8. Add admin access to payments
CREATE POLICY "Admins can view all payments" 
  ON public.payments FOR ALL 
  USING (public.is_admin());

-- 9. Fix unlocking system unlocks table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'property_unlocks') THEN
    CREATE POLICY "Admins have access to property unlocks" ON public.property_unlocks FOR ALL USING (public.is_admin());
  END IF;
END $$;
