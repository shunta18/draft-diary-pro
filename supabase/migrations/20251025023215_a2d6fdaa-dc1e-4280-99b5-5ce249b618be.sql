-- Recreate public_diary_views table for unique view tracking
CREATE TABLE IF NOT EXISTS public.public_diary_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  diary_id uuid NOT NULL REFERENCES public.public_diary_entries(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(diary_id, user_id),
  UNIQUE(diary_id, session_id)
);

-- Enable RLS
ALTER TABLE public.public_diary_views ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public_diary_views
CREATE POLICY "Anyone can insert diary views"
  ON public.public_diary_views
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view diary views"
  ON public.public_diary_views
  FOR SELECT
  USING (true);

-- Update increment_diary_view_count function to check for unique views
CREATE OR REPLACE FUNCTION public.increment_diary_view_count(
  diary_id uuid,
  p_user_id uuid DEFAULT NULL,
  p_session_id text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  view_exists boolean;
BEGIN
  -- Check if this user/session has already viewed this diary
  IF p_user_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM public.public_diary_views 
      WHERE public_diary_views.diary_id = increment_diary_view_count.diary_id 
        AND public_diary_views.user_id = p_user_id
    ) INTO view_exists;
  ELSIF p_session_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM public.public_diary_views 
      WHERE public_diary_views.diary_id = increment_diary_view_count.diary_id 
        AND public_diary_views.session_id = p_session_id
    ) INTO view_exists;
  ELSE
    -- If no identifier provided, don't track and don't increment
    RETURN;
  END IF;

  -- Only increment if this is a new view
  IF NOT view_exists THEN
    -- Insert the view record
    INSERT INTO public.public_diary_views (diary_id, user_id, session_id)
    VALUES (increment_diary_view_count.diary_id, p_user_id, p_session_id)
    ON CONFLICT DO NOTHING;
    
    -- Increment the count
    UPDATE public.public_diary_entries
    SET view_count = view_count + 1
    WHERE id = increment_diary_view_count.diary_id;
  END IF;
END;
$$;