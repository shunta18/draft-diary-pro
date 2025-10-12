-- Add main_position column to players table
ALTER TABLE public.players
ADD COLUMN main_position text;

-- Add a comment to explain the column
COMMENT ON COLUMN public.players.main_position IS 'Primary position for the player, displayed in list views';