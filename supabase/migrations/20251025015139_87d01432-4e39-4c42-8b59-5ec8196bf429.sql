-- Add user_id column to public_diary_entries (critical for diary ownership)
ALTER TABLE public.public_diary_entries
ADD COLUMN user_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid;

-- Add view_count column to public_diary_entries (for tracking diary views)
ALTER TABLE public.public_diary_entries
ADD COLUMN view_count integer NOT NULL DEFAULT 0;

-- Create index on user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_public_diary_entries_user_id ON public.public_diary_entries(user_id);

-- Update RLS policies to allow users to view their own public diary entries
DROP POLICY IF EXISTS "Anyone can view public diary entries" ON public.public_diary_entries;

CREATE POLICY "Anyone can view public diary entries"
ON public.public_diary_entries
FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own public diary entries"
ON public.public_diary_entries
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own public diary entries"
ON public.public_diary_entries
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own public diary entries"
ON public.public_diary_entries
FOR DELETE
USING (auth.uid() = user_id);