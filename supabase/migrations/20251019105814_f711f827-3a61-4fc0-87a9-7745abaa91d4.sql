-- Drop the old unique constraint
ALTER TABLE public.draft_team_position_votes
DROP CONSTRAINT IF EXISTS draft_team_position_votes_user_unique;

-- Add the correct unique constraint that includes draft_round
ALTER TABLE public.draft_team_position_votes
ADD CONSTRAINT draft_team_position_votes_user_round_unique 
UNIQUE (user_id, team_id, draft_round, draft_year);

-- Also add a unique constraint for anonymous session users
ALTER TABLE public.draft_team_position_votes
ADD CONSTRAINT draft_team_position_votes_session_round_unique 
UNIQUE (session_id, team_id, draft_round, draft_year);