-- Add draft result columns to public_players table
ALTER TABLE public.public_players
ADD COLUMN IF NOT EXISTS draft_status TEXT,
ADD COLUMN IF NOT EXISTS draft_team TEXT,
ADD COLUMN IF NOT EXISTS draft_rank TEXT;

-- Set initial values for existing records
UPDATE public.public_players
SET 
  draft_status = '空欄',
  draft_team = NULL,
  draft_rank = NULL
WHERE draft_status IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.public_players.draft_status IS 'Draft status: 支配下, 育成, or 空欄 (not drafted)';
COMMENT ON COLUMN public.public_players.draft_team IS 'Draft team: one of 12 NPB teams';
COMMENT ON COLUMN public.public_players.draft_rank IS 'Draft rank: e.g., 1位, 育成1位';