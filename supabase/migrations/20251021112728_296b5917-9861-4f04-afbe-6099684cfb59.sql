-- データベース最適化：インデックス追加

-- 1. public_playersテーブルの最適化
CREATE INDEX IF NOT EXISTS idx_public_players_user_id ON public.public_players(user_id);
CREATE INDEX IF NOT EXISTS idx_public_players_created_at ON public.public_players(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_public_players_category ON public.public_players(category);
CREATE INDEX IF NOT EXISTS idx_public_players_position ON public.public_players(position);

-- 2. playersテーブルの最適化
CREATE INDEX IF NOT EXISTS idx_players_user_id ON public.players(user_id);
CREATE INDEX IF NOT EXISTS idx_players_category ON public.players(category);
CREATE INDEX IF NOT EXISTS idx_players_position ON public.players(position);

-- 3. profilesテーブルの最適化
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- 4. diary_entriesテーブルの最適化
CREATE INDEX IF NOT EXISTS idx_diary_entries_user_id ON public.diary_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_diary_entries_created_at ON public.diary_entries(created_at DESC);

-- 5. public_diary_entriesテーブルの最適化
CREATE INDEX IF NOT EXISTS idx_public_diary_entries_user_id ON public.public_diary_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_public_diary_entries_created_at ON public.public_diary_entries(created_at DESC);

-- 6. draft_dataテーブルの最適化
CREATE INDEX IF NOT EXISTS idx_draft_data_user_id ON public.draft_data(user_id);

-- 7. public_player_viewsテーブルの最適化
CREATE INDEX IF NOT EXISTS idx_public_player_views_public_player_id ON public.public_player_views(public_player_id);
CREATE INDEX IF NOT EXISTS idx_public_player_views_user_id ON public.public_player_views(user_id);
CREATE INDEX IF NOT EXISTS idx_public_player_views_session_id ON public.public_player_views(session_id);

-- 8. public_player_importsテーブルの最適化
CREATE INDEX IF NOT EXISTS idx_public_player_imports_public_player_id ON public.public_player_imports(public_player_id);
CREATE INDEX IF NOT EXISTS idx_public_player_imports_user_id ON public.public_player_imports(user_id);

-- 9. user_followsテーブルの最適化
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON public.user_follows(following_id);

-- 10. draft_team_player_votesテーブルの複合インデックス最適化
CREATE INDEX IF NOT EXISTS idx_draft_player_votes_public_player_id ON public.draft_team_player_votes(public_player_id);