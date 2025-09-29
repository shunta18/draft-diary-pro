import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create a regular Supabase client to verify the user
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    })

    // Get the current user to verify authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('Authentication failed:', userError)
      throw new Error('User not authenticated')
    }

    console.log('Deleting user account for:', user.id)

    // Create admin Supabase client for user deletion
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // First, delete user data from custom tables using admin client
    console.log('Deleting user data from custom tables...')
    
    // Delete user data directly using admin client
    const { error: deletePlayersError } = await supabaseAdmin
      .from('players')
      .delete()
      .eq('user_id', user.id)
    if (deletePlayersError) {
      console.error('Error deleting players:', deletePlayersError)
    }

    const { error: deleteDiaryError } = await supabaseAdmin
      .from('diary_entries')
      .delete()
      .eq('user_id', user.id)
    if (deleteDiaryError) {
      console.error('Error deleting diary entries:', deleteDiaryError)
    }

    const { error: deleteDraftError } = await supabaseAdmin
      .from('draft_data')
      .delete()
      .eq('user_id', user.id)
    if (deleteDraftError) {
      console.error('Error deleting draft data:', deleteDraftError)
    }

    const { error: deleteProfileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('user_id', user.id)
    if (deleteProfileError) {
      console.error('Error deleting profile:', deleteProfileError)
    }

    // Then delete the user from auth.users
    console.log('Deleting user from auth.users...')
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    if (deleteUserError) {
      console.error('Error deleting auth user:', deleteUserError)
      throw new Error(`Failed to delete user account: ${deleteUserError.message}`)
    }

    console.log('User account successfully deleted')

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Delete user error:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})