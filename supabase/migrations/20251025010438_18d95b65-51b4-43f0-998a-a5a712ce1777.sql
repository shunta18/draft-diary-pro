-- Add view_count and import_count columns to public_players table
ALTER TABLE public.public_players 
ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS import_count integer NOT NULL DEFAULT 0;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_public_players_view_count ON public.public_players(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_public_players_import_count ON public.public_players(import_count DESC);

COMMENT ON COLUMN public.public_players.view_count IS 'Number of times this player has been viewed';
COMMENT ON COLUMN public.public_players.import_count IS 'Number of times this player has been imported';

-- Create user_follows table for following functionality
CREATE TABLE IF NOT EXISTS public.user_follows (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Enable RLS
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all follows" ON public.user_follows;
DROP POLICY IF EXISTS "Users can manage their own follows" ON public.user_follows;

-- Create policies for user_follows
CREATE POLICY "Users can view all follows"
ON public.user_follows
FOR SELECT
USING (true);

CREATE POLICY "Users can manage their own follows"
ON public.user_follows
FOR ALL
USING (auth.uid() = follower_id)
WITH CHECK (auth.uid() = follower_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON public.user_follows(following_id);