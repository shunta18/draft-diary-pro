-- Add is_favorite column to players table
ALTER TABLE public.players 
ADD COLUMN is_favorite boolean NOT NULL DEFAULT false;

-- Add index for better performance when filtering favorites
CREATE INDEX idx_players_is_favorite ON public.players(is_favorite);