-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create public_players table (shared player database)
CREATE TABLE public.public_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_player_id INTEGER,
  name TEXT NOT NULL,
  team TEXT NOT NULL,
  position TEXT NOT NULL,
  category TEXT NOT NULL,
  evaluations TEXT[] DEFAULT ARRAY[]::text[],
  recommended_teams TEXT[] DEFAULT ARRAY[]::text[],
  year INTEGER,
  batting_hand TEXT,
  throwing_hand TEXT,
  hometown TEXT,
  age INTEGER,
  usage TEXT,
  memo TEXT,
  videos TEXT[] DEFAULT ARRAY[]::text[],
  main_position TEXT,
  height INTEGER,
  weight INTEGER,
  career_path JSONB,
  view_count INTEGER NOT NULL DEFAULT 0,
  import_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on public_players
ALTER TABLE public.public_players ENABLE ROW LEVEL SECURITY;

-- RLS policies for public_players
CREATE POLICY "Anyone can view public players"
ON public.public_players
FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own public players"
ON public.public_players
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own public players"
ON public.public_players
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own public players"
ON public.public_players
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all public players"
ON public.public_players
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updating updated_at
CREATE TRIGGER update_public_players_updated_at
BEFORE UPDATE ON public.public_players
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create public_player_views table (view tracking)
CREATE TABLE public.public_player_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  public_player_id UUID NOT NULL REFERENCES public.public_players(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on public_player_views
ALTER TABLE public.public_player_views ENABLE ROW LEVEL SECURITY;

-- RLS policies for public_player_views
CREATE POLICY "Anyone can insert views"
ON public.public_player_views
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view public player views"
ON public.public_player_views
FOR SELECT
USING (true);

-- Create public_player_imports table (import tracking)
CREATE TABLE public.public_player_imports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  public_player_id UUID NOT NULL REFERENCES public.public_players(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on public_player_imports
ALTER TABLE public.public_player_imports ENABLE ROW LEVEL SECURITY;

-- RLS policies for public_player_imports
CREATE POLICY "Users can insert their own imports"
ON public.public_player_imports
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view imports"
ON public.public_player_imports
FOR SELECT
USING (true);

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_player_view_count(player_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.public_players
  SET view_count = view_count + 1
  WHERE id = player_id;
END;
$$;

-- Function to increment import count
CREATE OR REPLACE FUNCTION public.increment_player_import_count(player_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.public_players
  SET import_count = import_count + 1
  WHERE id = player_id;
END;
$$;