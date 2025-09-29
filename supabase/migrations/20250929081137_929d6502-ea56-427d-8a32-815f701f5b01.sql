-- Fix the delete_user function by removing the problematic auth.admin_delete_user call
-- This function should only delete user data, not the auth user itself
CREATE OR REPLACE FUNCTION public.delete_user()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    
    -- Note: We cannot delete from auth.users directly from a database function
    -- The auth user deletion should be handled separately
END;
$function$;