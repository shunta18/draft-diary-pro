-- Restore user_id for public_diary_entries from diary_entries table
UPDATE public.public_diary_entries pde
SET user_id = de.user_id
FROM public.diary_entries de
WHERE pde.original_diary_id = de.id
  AND pde.user_id = '00000000-0000-0000-0000-000000000000'::uuid;

-- Create function to increment diary view count
CREATE OR REPLACE FUNCTION public.increment_diary_view_count(diary_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.public_diary_entries
  SET view_count = view_count + 1
  WHERE id = diary_id;
END;
$$;