-- Add column to track imported players
ALTER TABLE public.players 
ADD COLUMN imported_from_public_player_id uuid REFERENCES public.public_players(id) ON DELETE SET NULL;