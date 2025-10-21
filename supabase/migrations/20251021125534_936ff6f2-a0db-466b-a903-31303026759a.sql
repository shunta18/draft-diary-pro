-- 既存の外部キー制約を削除
ALTER TABLE draft_team_player_votes 
DROP CONSTRAINT IF EXISTS draft_team_player_votes_public_player_id_fkey;

-- 既存のデータを削除（データ型の変更のため）
DELETE FROM draft_team_player_votes WHERE public_player_id IS NOT NULL;

-- カラムの型をuuidに変更
ALTER TABLE draft_team_player_votes 
ALTER COLUMN public_player_id TYPE uuid USING NULL;

-- player_idカラムを削除（使用されていない場合）
ALTER TABLE draft_team_player_votes 
DROP COLUMN IF EXISTS player_id;

-- 新しい外部キー制約を追加（public_playersテーブルのid（UUID）を参照）
ALTER TABLE draft_team_player_votes
ADD CONSTRAINT draft_team_player_votes_public_player_id_fkey 
FOREIGN KEY (public_player_id) 
REFERENCES public_players(id) 
ON DELETE CASCADE;