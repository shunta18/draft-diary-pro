-- Add recommended_teams column to players table
ALTER TABLE public.players 
ADD COLUMN recommended_teams text[] DEFAULT ARRAY[]::text[];