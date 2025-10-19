-- Add draft_round column to draft_team_position_votes
ALTER TABLE public.draft_team_position_votes 
ADD COLUMN draft_round integer NOT NULL DEFAULT 1;

-- Drop existing unique constraint if it exists
DROP INDEX IF EXISTS unique_position_vote_per_user_session;

-- Create new unique constraint including draft_round
-- Each user/session can vote for one position per team, year, and round
CREATE UNIQUE INDEX unique_position_vote_per_round 
ON public.draft_team_position_votes(team_id, draft_year, draft_round, COALESCE(user_id::text, session_id));