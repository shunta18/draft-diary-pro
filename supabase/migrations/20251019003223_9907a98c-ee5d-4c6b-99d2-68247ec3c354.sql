-- Drop the old unique constraint properly
ALTER TABLE public.draft_team_position_votes 
DROP CONSTRAINT IF EXISTS draft_team_position_votes_session_unique;

-- The unique_position_vote_per_round index already exists and allows
-- multiple positions across different rounds for the same team/user/session