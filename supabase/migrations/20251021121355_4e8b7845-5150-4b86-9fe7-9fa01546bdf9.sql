-- public_playersテーブルの名前重複データを削除（最も古いデータを残す）
DELETE FROM public.public_players
WHERE id NOT IN (
  SELECT DISTINCT ON (name) id
  FROM public.public_players
  ORDER BY name, created_at ASC
);