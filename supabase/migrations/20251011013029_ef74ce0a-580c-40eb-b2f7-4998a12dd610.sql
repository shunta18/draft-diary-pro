-- Change career_path column from text to jsonb to store structured career history
ALTER TABLE public.players 
ALTER COLUMN career_path TYPE jsonb USING 
  CASE 
    WHEN career_path IS NULL OR career_path = '' THEN '{}'::jsonb
    ELSE jsonb_build_object('note', career_path)
  END;