-- Create Job Vacancies Table
CREATE TABLE public.job_vacancies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role TEXT NOT NULL,
    min_experience TEXT NOT NULL,
    description TEXT NOT NULL,
    last_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security on job_vacancies
ALTER TABLE public.job_vacancies ENABLE ROW LEVEL SECURITY;

-- Anyone can select active job vacancies
CREATE POLICY "Anyone can view active job vacancies"
    ON public.job_vacancies FOR SELECT
    USING (is_active = true);

-- Admins have full access
CREATE POLICY "Admins can manage job vacancies"
    ON public.job_vacancies FOR ALL
    USING (public.is_admin());

-- Create Job Applications Table
CREATE TABLE public.job_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vacancy_id UUID REFERENCES public.job_vacancies(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    experience TEXT NOT NULL,
    cover_letter TEXT,
    resume_url TEXT,
    status TEXT DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security on job_applications
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit applications (guests or authenticated users)
CREATE POLICY "Anyone can submit job applications"
    ON public.job_applications FOR INSERT
    WITH CHECK (true);

-- Admins can view and update all applications
CREATE POLICY "Admins can manage job applications"
    ON public.job_applications FOR ALL
    USING (public.is_admin());
