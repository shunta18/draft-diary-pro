-- Remove realism_weight column from draft_scoring_weights table
ALTER TABLE public.draft_scoring_weights DROP COLUMN IF EXISTS realism_weight;