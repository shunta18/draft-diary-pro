-- Add missing columns to players table
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS hometown text,
ADD COLUMN IF NOT EXISTS career_path text,
ADD COLUMN IF NOT EXISTS usage text,
ADD COLUMN IF NOT EXISTS evaluation text,
ADD COLUMN IF NOT EXISTS memo text;