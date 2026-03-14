-- 1. Add agent_code to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS agent_code TEXT UNIQUE;

-- 2. Create agent_applications table
CREATE TABLE public.agent_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.agent_applications ENABLE ROW LEVEL SECURITY;

-- Users can insert their own application
CREATE POLICY "Users can insert own application" ON public.agent_applications 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own application
CREATE POLICY "Users can view own application" ON public.agent_applications 
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all applications
CREATE POLICY "Admins can view all components" ON public.agent_applications 
    FOR ALL USING (
       (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- 3. Secure RPC to safely upgrade a user role from pure Anon client without massive RLS hacks
CREATE OR REPLACE FUNCTION public.approve_agent_application(app_id UUID, generated_code TEXT)
RETURNS void AS $$
DECLARE
  target_user_id UUID;
  caller_role public.user_role;
BEGIN
  -- Validate caller is Admin
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
  IF caller_role != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized: Only administrators can approve agents.';
  END IF;

  -- Get the target user ID
  SELECT user_id INTO target_user_id FROM public.agent_applications WHERE id = app_id;
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Application not found.';
  END IF;

  -- Update application status
  UPDATE public.agent_applications SET status = 'approved' WHERE id = app_id;

  -- Upgrade profile role and set standard agent code
  UPDATE public.profiles 
    SET role = 'agent', 
        agent_code = generated_code 
    WHERE id = target_user_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Secure RPC to safely reject application
CREATE OR REPLACE FUNCTION public.reject_agent_application(app_id UUID)
RETURNS void AS $$
DECLARE
  caller_role public.user_role;
BEGIN
  -- Validate caller is Admin
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
  IF caller_role != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized: Only administrators can reject agents.';
  END IF;

  -- Update application status
  UPDATE public.agent_applications SET status = 'rejected' WHERE id = app_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
