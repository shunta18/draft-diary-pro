-- Create draft_team_player_votes table
CREATE TABLE public.draft_team_player_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  team_id INTEGER NOT NULL,
  player_id INTEGER NOT NULL,
  draft_year TEXT NOT NULL DEFAULT '2025',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT draft_team_player_votes_user_unique UNIQUE (user_id, team_id, player_id, draft_year),
  CONSTRAINT draft_team_player_votes_session_unique UNIQUE (session_id, team_id, player_id, draft_year)
);

-- Create index for faster queries
CREATE INDEX idx_draft_team_player_votes_team ON public.draft_team_player_votes(team_id);
CREATE INDEX idx_draft_team_player_votes_player ON public.draft_team_player_votes(player_id);
CREATE INDEX idx_draft_team_player_votes_year ON public.draft_team_player_votes(draft_year);

-- Enable RLS
ALTER TABLE public.draft_team_player_votes ENABLE ROW LEVEL SECURITY;

-- RLS policies for draft_team_player_votes
CREATE POLICY "Anyone can view player votes"
ON public.draft_team_player_votes
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage their own player votes"
ON public.draft_team_player_votes
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert player votes"
ON public.draft_team_player_votes
FOR INSERT
WITH CHECK (true);

-- Create draft_team_position_votes table
CREATE TABLE public.draft_team_position_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  team_id INTEGER NOT NULL,
  position TEXT NOT NULL,
  draft_year TEXT NOT NULL DEFAULT '2025',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT draft_team_position_votes_user_unique UNIQUE (user_id, team_id, position, draft_year),
  CONSTRAINT draft_team_position_votes_session_unique UNIQUE (session_id, team_id, position, draft_year)
);

-- Create index for faster queries
CREATE INDEX idx_draft_team_position_votes_team ON public.draft_team_position_votes(team_id);
CREATE INDEX idx_draft_team_position_votes_position ON public.draft_team_position_votes(position);
CREATE INDEX idx_draft_team_position_votes_year ON public.draft_team_position_votes(draft_year);

-- Enable RLS
ALTER TABLE public.draft_team_position_votes ENABLE ROW LEVEL SECURITY;

-- RLS policies for draft_team_position_votes
CREATE POLICY "Anyone can view position votes"
ON public.draft_team_position_votes
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage their own position votes"
ON public.draft_team_position_votes
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert position votes"
ON public.draft_team_position_votes
FOR INSERT
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_draft_team_player_votes_updated_at
BEFORE UPDATE ON public.draft_team_player_votes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_draft_team_position_votes_updated_at
BEFORE UPDATE ON public.draft_team_position_votes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();