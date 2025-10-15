-- Add last_active_at column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create an index for efficient queries on last_active_at
CREATE INDEX idx_profiles_last_active_at ON public.profiles(last_active_at DESC);

-- Add a comment to document the column
COMMENT ON COLUMN public.profiles.last_active_at IS 'Tracks the last time the user was active (including token refreshes and page visits)';