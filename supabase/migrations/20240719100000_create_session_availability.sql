-- supabase/migrations/YYYYMMDDHHMMSS_create_session_availability.sql

-- Create session_availability table to store dates/times a session is offered
CREATE TABLE IF NOT EXISTS public.session_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  available_date DATE NOT NULL,
  start_time TIME WITHOUT TIME ZONE NOT NULL,
  end_time TIME WITHOUT TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add index for faster lookups by session_id and date
CREATE INDEX IF NOT EXISTS idx_session_availability_session_id_date ON public.session_availability(session_id, available_date);

-- Enable RLS
ALTER TABLE public.session_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Allow users to view availability for their own sessions
DROP POLICY IF EXISTS "Users can view availability for own sessions" ON public.session_availability;
CREATE POLICY "Users can view availability for own sessions"
  ON public.session_availability FOR SELECT
  USING (session_id IN (SELECT id FROM public.sessions WHERE user_id = auth.uid()));

-- Allow users to insert availability for their own sessions
DROP POLICY IF EXISTS "Users can insert availability for own sessions" ON public.session_availability;
CREATE POLICY "Users can insert availability for own sessions"
  ON public.session_availability FOR INSERT
  WITH CHECK (session_id IN (SELECT id FROM public.sessions WHERE user_id = auth.uid()));

-- Allow users to update availability for their own sessions
DROP POLICY IF EXISTS "Users can update availability for own sessions" ON public.session_availability;
CREATE POLICY "Users can update availability for own sessions"
  ON public.session_availability FOR UPDATE
  USING (session_id IN (SELECT id FROM public.sessions WHERE user_id = auth.uid()));

-- Allow users to delete availability for their own sessions
DROP POLICY IF EXISTS "Users can delete availability for own sessions" ON public.session_availability;
CREATE POLICY "Users can delete availability for own sessions"
  ON public.session_availability FOR DELETE
  USING (session_id IN (SELECT id FROM public.sessions WHERE user_id = auth.uid()));

-- Add table to realtime publications if needed (optional)
-- alter publication supabase_realtime add table public.session_availability; 