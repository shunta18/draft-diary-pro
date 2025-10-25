-- Create function to atomically increment diary view count
CREATE OR REPLACE FUNCTION public.increment_diary_view_count(diary_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.public_diary_entries
  SET view_count = view_count + 1
  WHERE id = diary_id;
END;
$function$;

-- Update existing view_count based on public_diary_views
UPDATE public.public_diary_entries
SET view_count = COALESCE((
  SELECT COUNT(*)
  FROM public.public_diary_views
  WHERE public_diary_views.public_diary_id = public_diary_entries.id
), 0);