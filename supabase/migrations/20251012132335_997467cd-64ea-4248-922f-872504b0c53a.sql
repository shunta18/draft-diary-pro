-- Create table for blog post likes
CREATE TABLE IF NOT EXISTS public.blog_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_slug text NOT NULL,
  likes_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read likes
CREATE POLICY "Anyone can view blog likes"
ON public.blog_likes
FOR SELECT
USING (true);

-- Allow anyone to update likes (we'll use upsert)
CREATE POLICY "Anyone can update blog likes"
ON public.blog_likes
FOR UPDATE
USING (true);

-- Allow anyone to insert likes
CREATE POLICY "Anyone can insert blog likes"
ON public.blog_likes
FOR INSERT
WITH CHECK (true);

-- Create unique index on blog_slug
CREATE UNIQUE INDEX IF NOT EXISTS blog_likes_slug_idx ON public.blog_likes(blog_slug);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_blog_likes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_blog_likes_updated_at_trigger
BEFORE UPDATE ON public.blog_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_blog_likes_updated_at();