-- Drop the old unique constraint that's causing issues
ALTER TABLE public.draft_team_position_votes
DROP CONSTRAINT IF EXISTS unique_position_vote_per_round;