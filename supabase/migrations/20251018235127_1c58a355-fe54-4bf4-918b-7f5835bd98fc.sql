-- Add public_player_id column to draft_team_player_votes table to reference admin's players
ALTER TABLE draft_team_player_votes 
ADD COLUMN public_player_id integer REFERENCES players(id);

-- Make existing player_id nullable for migration purposes
ALTER TABLE draft_team_player_votes 
ALTER COLUMN player_id DROP NOT NULL;