-- Drop old constraints with player_id
ALTER TABLE public.draft_team_player_votes
DROP CONSTRAINT IF EXISTS draft_team_player_votes_user_unique;

ALTER TABLE public.draft_team_player_votes
DROP CONSTRAINT IF EXISTS draft_team_player_votes_session_unique;

-- Add new constraints with public_player_id
ALTER TABLE public.draft_team_player_votes
ADD CONSTRAINT draft_team_player_votes_user_unique 
UNIQUE (user_id, team_id, public_player_id, draft_year);

ALTER TABLE public.draft_team_player_votes
ADD CONSTRAINT draft_team_player_votes_session_unique 
UNIQUE (session_id, team_id, public_player_id, draft_year);