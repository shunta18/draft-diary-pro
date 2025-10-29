-- Create public_players_memo table for anonymous shared memos
CREATE TABLE public.public_players_memo (
  note_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.public_players(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance optimization
CREATE INDEX idx_public_players_memo_player_id ON public.public_players_memo(player_id);
CREATE INDEX idx_public_players_memo_user_id ON public.public_players_memo(user_id);

-- Enable Row Level Security
ALTER TABLE public.public_players_memo ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can view all memos (anonymous display)
CREATE POLICY "Anyone can view memos"
ON public.public_players_memo
FOR SELECT
USING (true);

-- RLS Policy: Authenticated users can insert their own memos
CREATE POLICY "Authenticated users can insert memos"
ON public.public_players_memo
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own memos
CREATE POLICY "Users can update their own memos"
ON public.public_players_memo
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own memos
CREATE POLICY "Users can delete their own memos"
ON public.public_players_memo
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policy: Admins can manage all memos
CREATE POLICY "Admins can manage all memos"
ON public.public_players_memo
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_public_players_memo_updated_at
BEFORE UPDATE ON public.public_players_memo
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();