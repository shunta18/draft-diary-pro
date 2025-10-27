-- Remove policies that allow non-admin users to modify public_players
DROP POLICY IF EXISTS "Users can insert their own public players" ON public.public_players;
DROP POLICY IF EXISTS "Authenticated users can update public players" ON public.public_players;

-- Remove policies that allow non-admin users to modify public_diary_entries
DROP POLICY IF EXISTS "Users can insert their own public diary entries" ON public.public_diary_entries;
DROP POLICY IF EXISTS "Users can update their own public diary entries" ON public.public_diary_entries;
DROP POLICY IF EXISTS "Users can delete their own public diary entries" ON public.public_diary_entries;

-- Create admin-only INSERT policy for public_players
CREATE POLICY "Admins can insert public players"
ON public.public_players
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Create admin-only UPDATE policy for public_players
CREATE POLICY "Admins can update public players"
ON public.public_players
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Create admin-only INSERT policy for public_diary_entries
CREATE POLICY "Admins can insert public diary entries"
ON public.public_diary_entries
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Create admin-only UPDATE policy for public_diary_entries
CREATE POLICY "Admins can update public diary entries"
ON public.public_diary_entries
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Create admin-only DELETE policy for public_diary_entries
CREATE POLICY "Admins can delete public diary entries"
ON public.public_diary_entries
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));