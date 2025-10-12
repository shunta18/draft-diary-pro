-- Create table for user-specific blog likes
CREATE TABLE IF NOT EXISTS public.blog_user_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_slug text NOT NULL,
  user_id uuid,
  session_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT blog_user_likes_unique_user UNIQUE (blog_slug, user_id),
  CONSTRAINT blog_user_likes_unique_session UNIQUE (blog_slug, session_id),
  CONSTRAINT blog_user_likes_check CHECK (
    (user_id IS NOT NULL AND session_id IS NULL) OR 
    (user_id IS NULL AND session_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE public.blog_user_likes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read
CREATE POLICY "Anyone can view blog user likes"
ON public.blog_user_likes
FOR SELECT
USING (true);

-- Allow anyone to insert (for liking)
CREATE POLICY "Anyone can insert blog user likes"
ON public.blog_user_likes
FOR INSERT
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS blog_user_likes_slug_idx ON public.blog_user_likes(blog_slug);
CREATE INDEX IF NOT EXISTS blog_user_likes_user_id_idx ON public.blog_user_likes(user_id);
CREATE INDEX IF NOT EXISTS blog_user_likes_session_id_idx ON public.blog_user_likes(session_id);