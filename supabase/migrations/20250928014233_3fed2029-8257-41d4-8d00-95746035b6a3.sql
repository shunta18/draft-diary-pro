-- Update players table to support multiple evaluations
ALTER TABLE public.players 
DROP COLUMN IF EXISTS evaluation;

ALTER TABLE public.players 
ADD COLUMN evaluations TEXT[] DEFAULT ARRAY[]::TEXT[];