-- Drop user_follows table and related objects
DROP TABLE IF EXISTS public.user_follows CASCADE;

-- Drop view/import count tracking tables
DROP TABLE IF EXISTS public.public_player_views CASCADE;
DROP TABLE IF EXISTS public.public_player_imports CASCADE;
DROP TABLE IF EXISTS public.public_diary_views CASCADE;
DROP TABLE IF EXISTS public.public_diary_imports CASCADE;

-- Drop RPC functions for view/import counting
DROP FUNCTION IF EXISTS public.increment_player_view_count(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.increment_player_import_count(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.increment_diary_view_count(uuid) CASCADE;

-- Remove view_count and import_count columns from public_players
ALTER TABLE public.public_players 
DROP COLUMN IF EXISTS view_count,
DROP COLUMN IF EXISTS import_count;

-- Remove view_count and import_count columns from public_diary_entries
ALTER TABLE public.public_diary_entries
DROP COLUMN IF EXISTS view_count,
DROP COLUMN IF EXISTS import_count;

-- Drop indexes if they exist
DROP INDEX IF EXISTS idx_public_players_view_count;
DROP INDEX IF EXISTS idx_public_players_import_count;
DROP INDEX IF EXISTS idx_user_follows_follower;
DROP INDEX IF EXISTS idx_user_follows_following;