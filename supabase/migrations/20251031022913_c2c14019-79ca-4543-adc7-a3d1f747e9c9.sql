-- RPC for getting player vote counts by team
-- This function aggregates vote counts on the database side for better performance
-- and consistent results across all users (authenticated and unauthenticated)

CREATE OR REPLACE FUNCTION public.get_player_vote_counts_by_team(
  p_draft_year TEXT DEFAULT '2025',
  p_team_id INTEGER DEFAULT NULL
)
RETURNS TABLE(
  team_id INTEGER,
  public_player_id UUID,
  vote_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    dtpv.team_id,
    dtpv.public_player_id,
    COUNT(*) as vote_count
  FROM draft_team_player_votes dtpv
  WHERE dtpv.draft_year = p_draft_year
    AND (p_team_id IS NULL OR dtpv.team_id = p_team_id)
  GROUP BY dtpv.team_id, dtpv.public_player_id
$$;