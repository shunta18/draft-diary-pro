-- Allow everyone to view all profiles (for public player uploads attribution)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Anyone can view all profiles"
ON public.profiles
FOR SELECT
USING (true);
