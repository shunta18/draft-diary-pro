-- 選手投票の複数投票を許可するため、ユニーク制約を削除
ALTER TABLE draft_team_player_votes 
DROP CONSTRAINT IF EXISTS draft_team_player_votes_user_unique;

ALTER TABLE draft_team_player_votes 
DROP CONSTRAINT IF EXISTS draft_team_player_votes_session_unique;

-- ポジション投票の複数投票を許可するため、ユニーク制約を削除
ALTER TABLE draft_team_position_votes 
DROP CONSTRAINT IF EXISTS draft_team_position_votes_user_unique;

ALTER TABLE draft_team_position_votes 
DROP CONSTRAINT IF EXISTS draft_team_position_votes_session_unique;