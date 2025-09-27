-- Add videos column to players table
ALTER TABLE public.players ADD COLUMN videos TEXT[] DEFAULT ARRAY[]::TEXT[];