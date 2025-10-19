-- Drop existing policy if exists and recreate it
DROP POLICY IF EXISTS "Anyone can view admin players" ON players;

-- Create policy to allow anyone to view admin's players for draft questionnaire
CREATE POLICY "Anyone can view admin players"
ON players
FOR SELECT
TO public
USING (user_id = '5cc66826-fb1d-4743-a18c-98265fbe55f4'::uuid);