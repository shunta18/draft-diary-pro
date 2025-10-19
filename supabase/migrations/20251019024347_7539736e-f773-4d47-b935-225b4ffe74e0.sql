-- スコアリング重み設定を保存するテーブルを作成
CREATE TABLE public.draft_scoring_weights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vote_weight INTEGER NOT NULL DEFAULT 40,
  team_needs_weight INTEGER NOT NULL DEFAULT 30,
  player_rating_weight INTEGER NOT NULL DEFAULT 20,
  realism_weight INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT weights_sum_100 CHECK (vote_weight + team_needs_weight + player_rating_weight + realism_weight = 100),
  CONSTRAINT weights_positive CHECK (vote_weight >= 0 AND team_needs_weight >= 0 AND player_rating_weight >= 0 AND realism_weight >= 0)
);

-- RLS有効化
ALTER TABLE public.draft_scoring_weights ENABLE ROW LEVEL SECURITY;

-- 誰でも読み取り可能
CREATE POLICY "Anyone can view scoring weights"
ON public.draft_scoring_weights
FOR SELECT
USING (true);

-- 管理者のみ挿入可能
CREATE POLICY "Admins can insert scoring weights"
ON public.draft_scoring_weights
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 管理者のみ更新可能
CREATE POLICY "Admins can update scoring weights"
ON public.draft_scoring_weights
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 管理者のみ削除可能
CREATE POLICY "Admins can delete scoring weights"
ON public.draft_scoring_weights
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 更新日時を自動更新するトリガー
CREATE TRIGGER update_draft_scoring_weights_updated_at
BEFORE UPDATE ON public.draft_scoring_weights
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- デフォルトの重み設定を挿入
INSERT INTO public.draft_scoring_weights (vote_weight, team_needs_weight, player_rating_weight, realism_weight)
VALUES (40, 30, 20, 10);