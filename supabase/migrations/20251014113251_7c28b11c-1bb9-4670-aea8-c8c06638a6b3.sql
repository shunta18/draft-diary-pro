-- Add is_favorite column to public_players table
ALTER TABLE public.public_players 
ADD COLUMN is_favorite boolean NOT NULL DEFAULT false;

-- Create index for better query performance
CREATE INDEX idx_public_players_is_favorite ON public.public_players(is_favorite) WHERE is_favorite = true;