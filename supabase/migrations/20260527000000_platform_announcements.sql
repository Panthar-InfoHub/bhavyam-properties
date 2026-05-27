-- Create Platform Announcements Table
CREATE TABLE public.announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    image_url TEXT,
    url TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_by UUID REFERENCES public.profiles(id) DEFAULT auth.uid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security on announcements
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Select policy: Anyone (even guests) can select active announcements
CREATE POLICY "Anyone can view active announcements."
    ON public.announcements FOR SELECT
    USING (true);

-- Admin policy: Admins can do anything on announcements
CREATE POLICY "Admins can manage announcements"
    ON public.announcements FOR ALL
    USING (public.is_admin());

-- Create Table to track seen announcements for logged-in users
CREATE TABLE public.announcement_seen (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    announcement_id UUID REFERENCES public.announcements(id) ON DELETE CASCADE NOT NULL,
    seen_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, announcement_id)
);

-- Enable Row Level Security on announcement_seen
ALTER TABLE public.announcement_seen ENABLE ROW LEVEL SECURITY;

-- Select/Insert policies for users to manage their own seen records
CREATE POLICY "Users can view own seen records."
    ON public.announcement_seen FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own seen records."
    ON public.announcement_seen FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admin policy: Admins can view all seen records
CREATE POLICY "Admins can view all seen records."
    ON public.announcement_seen FOR SELECT
    USING (public.is_admin());
