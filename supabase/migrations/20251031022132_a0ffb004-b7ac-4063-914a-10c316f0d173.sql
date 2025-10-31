
-- draft_team_player_votes テーブルのSELECTポリシーを修正
-- 既存のRESTRICTIVEポリシーを削除し、PERMISSIVEポリシーに置き換え

DROP POLICY IF EXISTS "Anyone can view player votes" ON public.draft_team_player_votes;

-- すべてのユーザー（認証済み・未認証問わず）がすべての投票を閲覧可能なPERMISSIVEポリシーを作成
CREATE POLICY "Anyone can view all player votes"
ON public.draft_team_player_votes
FOR SELECT
USING (true);

-- draft_team_position_votes テーブルも同様に修正
DROP POLICY IF EXISTS "Anyone can view position votes" ON public.draft_team_position_votes;

CREATE POLICY "Anyone can view all position votes"
ON public.draft_team_position_votes
FOR SELECT
USING (true);
