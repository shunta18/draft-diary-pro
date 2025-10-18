-- Add tournament_name column to diary_entries table
ALTER TABLE public.diary_entries 
ADD COLUMN tournament_name text;

-- Add tournament_name column to public_diary_entries table
ALTER TABLE public.public_diary_entries 
ADD COLUMN tournament_name text;