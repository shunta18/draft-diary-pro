
-- 重複する選手データを削除（最新のレコードを1つ残す）
WITH duplicates AS (
  SELECT id,
    ROW_NUMBER() OVER (
      PARTITION BY name, team, category 
      ORDER BY created_at DESC
    ) as rn
  FROM public.public_players
)
DELETE FROM public.public_players
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);
