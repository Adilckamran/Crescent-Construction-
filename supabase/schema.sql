-- ==============================================================================
-- Crescent Construction — Production Supabase PostgreSQL Schema & Storage Setup
-- ==============================================================================

-- 1. Create tables
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Completed',
  short_desc TEXT NOT NULL,
  full_desc TEXT NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT false,
  completion_year TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  project_type TEXT,
  location TEXT,
  budget TEXT,
  message TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL,
  title TEXT NOT NULL,
  "desc" TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'Building2',
  cta TEXT,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.testimonials (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  type TEXT,
  location TEXT,
  quote TEXT NOT NULL,
  is_sample BOOLEAN NOT NULL DEFAULT false,
  rating INT NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.login_activity (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  email TEXT NOT NULL,
  status TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Indexes for search and query performance
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects(featured);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_inquiries_read ON public.inquiries(is_read);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON public.inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_created ON public.login_activity(created_at DESC);

-- 3. Supabase Storage Bucket Setup
-- Create 'projects' public storage bucket if not already present
INSERT INTO storage.buckets (id, name, public)
VALUES ('projects', 'projects', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public read access policy for the 'projects' bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public Access to Project Images' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Public Access to Project Images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'projects');
  END IF;
END $$;

-- 4. Row Level Security (RLS) Configuration
-- Enable RLS on tables for security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_activity ENABLE ROW LEVEL SECURITY;

-- Allow public read of published projects, services, and testimonials
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read on projects' AND tablename = 'projects') THEN
    CREATE POLICY "Allow public read on projects" ON public.projects FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read on services' AND tablename = 'services') THEN
    CREATE POLICY "Allow public read on services" ON public.services FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read on testimonials' AND tablename = 'testimonials') THEN
    CREATE POLICY "Allow public read on testimonials" ON public.testimonials FOR SELECT USING (true);
  END IF;
END $$;

-- Notice: All administrative and mutation operations are executed from the secure backend
-- using the Supabase service_role key, which safely bypasses RLS on the server side.
