-- Fix the security warning by setting the search_path for the delete_user function
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Get the current user's ID
    user_uuid := auth.uid();
    
    -- Check if user is authenticated
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;
    
    -- Delete user's data from all tables
    DELETE FROM public.diary_entries WHERE user_id = user_uuid;
    DELETE FROM public.draft_data WHERE user_id = user_uuid;
    DELETE FROM public.players WHERE user_id = user_uuid;
    DELETE FROM public.profiles WHERE user_id = user_uuid;
    
    -- Delete the user from auth.users (this requires admin privileges)
    DELETE FROM auth.users WHERE id = user_uuid;
END;
$$;