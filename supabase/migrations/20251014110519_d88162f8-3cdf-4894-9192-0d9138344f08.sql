-- Fix function search path mutable issue for update_blog_likes_updated_at
-- This prevents potential security issues by ensuring the function operates in a fixed schema

-- Drop the trigger first
DROP TRIGGER IF EXISTS update_blog_likes_updated_at_trigger ON public.blog_likes;

-- Drop and recreate the function with SET search_path
DROP FUNCTION IF EXISTS public.update_blog_likes_updated_at();

CREATE OR REPLACE FUNCTION public.update_blog_likes_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER update_blog_likes_updated_at_trigger
  BEFORE UPDATE ON public.blog_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_blog_likes_updated_at();