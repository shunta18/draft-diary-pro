-- Create RPC for position vote counts with team filtering
CREATE OR REPLACE FUNCTION public.get_position_vote_counts_by_team(
  p_draft_year TEXT DEFAULT '2025',
  p_team_id INTEGER DEFAULT NULL
)
RETURNS TABLE(
  team_id INTEGER,
  draft_round INTEGER,
  "position" TEXT,
  vote_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    dtpv.team_id,
    dtpv.draft_round,
    dtpv."position",
    COUNT(*) as vote_count
  FROM draft_team_position_votes dtpv
  WHERE dtpv.draft_year = p_draft_year
    AND (p_team_id IS NULL OR dtpv.team_id = p_team_id)
  GROUP BY dtpv.team_id, dtpv.draft_round, dtpv."position"
$$;