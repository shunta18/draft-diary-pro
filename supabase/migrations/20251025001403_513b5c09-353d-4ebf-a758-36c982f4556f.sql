-- Add team_name column to draft_data table
ALTER TABLE public.draft_data 
ADD COLUMN IF NOT EXISTS team_name TEXT;

-- Extract team names from existing JSONB data and create separate records for each team
DO $$
DECLARE
  record_data RECORD;
  team_key TEXT;
  team_data JSONB;
BEGIN
  -- Loop through existing draft_data records
  FOR record_data IN 
    SELECT id, user_id, data, created_at, updated_at 
    FROM public.draft_data 
    WHERE team_name IS NULL AND data IS NOT NULL
  LOOP
    -- Loop through each team in the JSONB data
    FOR team_key IN 
      SELECT jsonb_object_keys(record_data.data)
    LOOP
      -- Extract team-specific data
      team_data := record_data.data -> team_key;
      
      -- Check if a record already exists for this user_id + team_name
      IF NOT EXISTS (
        SELECT 1 FROM public.draft_data 
        WHERE user_id = record_data.user_id 
        AND team_name = team_key
      ) THEN
        -- Insert a new record for this team
        INSERT INTO public.draft_data (user_id, team_name, data, created_at, updated_at)
        VALUES (
          record_data.user_id,
          team_key,
          jsonb_build_object(team_key, team_data),
          record_data.created_at,
          record_data.updated_at
        );
      END IF;
    END LOOP;
    
    -- Delete the old record after migration
    DELETE FROM public.draft_data WHERE id = record_data.id;
  END LOOP;
END $$;

-- Remove duplicate records, keeping only the most recent one for each user_id + team_name combination
DELETE FROM public.draft_data a
USING public.draft_data b
WHERE a.id < b.id
  AND a.user_id = b.user_id
  AND a.team_name = b.team_name
  AND a.team_name IS NOT NULL;

-- Create unique constraint on user_id + team_name combination
ALTER TABLE public.draft_data
DROP CONSTRAINT IF EXISTS draft_data_user_team_unique;

ALTER TABLE public.draft_data
ADD CONSTRAINT draft_data_user_team_unique UNIQUE (user_id, team_name);

-- Create composite index for performance optimization
CREATE INDEX IF NOT EXISTS idx_draft_data_user_team 
ON public.draft_data (user_id, team_name);

-- Add comment to document the new structure
COMMENT ON COLUMN public.draft_data.team_name IS 'Team name extracted from JSONB data for efficient querying and UPSERT operations';