import { supabase } from "@/integrations/supabase/client";

// Player Types
export interface Player {
  id?: number;
  name: string;
  team: string;
  position: string;
  main_position?: string;
  category: string;
  evaluations?: string[];
  recommended_teams?: string[];
  year?: number;
  batting_hand?: string;
  throwing_hand?: string;
  height?: number;
  weight?: number;
  age?: number;
  memo?: string;
  hometown?: string;
  career_path?: {
    middle_school?: string;
    high_school?: string;
    university?: string;
    corporate?: string;
  };
  usage?: string;
  videos?: string[];
  is_favorite?: boolean;
  imported_from_public_player_id?: string;
  draft_status?: string;
  draft_team?: string;
  draft_rank?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DiaryEntry {
  id?: number;
  date: string;
  venue: string;
  category: string;
  match_card: string;
  score: string;
  tournament_name?: string;
  player_comments?: string;
  overall_impression?: string;
  videos?: string[];
}

export interface SocialLink {
  type: 'twitter' | 'youtube' | 'other';
  label?: string;
  url: string;
}

export interface Profile {
  user_id: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  social_links?: SocialLink[];
  last_active_at?: string;
}

export interface PublicPlayer {
  id: string;
  user_id: string;
  original_player_id?: number;
  name: string;
  team: string;
  position: string;
  category: string;
  evaluations?: string[];
  recommended_teams?: string[];
  year?: number;
  batting_hand?: string;
  throwing_hand?: string;
  height?: number;
  weight?: number;
  age?: number;
  memo?: string;
  hometown?: string;
  career_path?: {
    middle_school?: string;
    high_school?: string;
    university?: string;
    corporate?: string;
  };
  usage?: string;
  videos?: string[];
  main_position?: string;
  is_favorite?: boolean;
  draft_status?: string;
  draft_team?: string;
  draft_rank?: string;
  created_at: string;
  updated_at: string;
  profiles?: any;
}

export interface UserProfileWithStats {
  user_id: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  social_links?: SocialLink[];
  upload_count: number;
}

export interface PublicPlayerMemo {
  note_id: string;
  player_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// Player Functions
export const getPlayers = async (): Promise<Player[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('User not authenticated');
      return [];
    }

    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('user_id', user.id)
      .order('is_favorite', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(player => ({
      ...player,
      career_path: player.career_path as Player['career_path']
    }));
  } catch (error) {
    console.error('Failed to load players:', error);
    return [];
  }
};

export const addPlayer = async (playerData: Omit<Player, 'id'>): Promise<Player | null> => {
  try {
    console.log('[addPlayer] Starting player creation...');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[addPlayer] User not authenticated');
      throw new Error('User not authenticated');
    }
    
    console.log('[addPlayer] User authenticated, inserting player data...');

    const { data, error } = await supabase
      .from('players')
      .insert([{
        ...playerData,
        user_id: user.id,
        position: Array.isArray(playerData.position) ? playerData.position[0] : playerData.position
      }])
      .select()
      .single();
    
    if (error) {
      console.error('[addPlayer] Database error:', error);
      throw error;
    }
    
    console.log('[addPlayer] Player created successfully:', data?.id);
    
    return data ? {
      ...data,
      career_path: data.career_path as Player['career_path']
    } : null;
  } catch (error) {
    console.error('[addPlayer] Failed to add player:', error);
    throw error;
  }
};

export const updatePlayer = async (id: number, playerData: Omit<Player, 'id'>): Promise<Player | null> => {
  try {
    console.log('[updatePlayer] Starting player update for ID:', id);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[updatePlayer] User not authenticated');
      throw new Error('User not authenticated');
    }
    
    console.log('[updatePlayer] User authenticated, updating player data...');

    const { data, error } = await supabase
      .from('players')
      .update({
        ...playerData,
        position: Array.isArray(playerData.position) ? playerData.position[0] : playerData.position,
        main_position: playerData.main_position || null
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) {
      console.error('[updatePlayer] Database error:', error);
      throw error;
    }
    
    console.log('[updatePlayer] Player updated successfully');
    
    return data ? {
      ...data,
      career_path: data.career_path as Player['career_path']
    } : null;
  } catch (error) {
    console.error('[updatePlayer] Failed to update player:', error);
    throw error;
  }
};

export const deletePlayer = async (id: number): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated');
      return false;
    }

    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to delete player:', error);
    return false;
  }
};

export const getPlayerById = async (id: number): Promise<Player | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('User not authenticated');
      return null;
    }

    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();
    
    if (error) throw error;
    return data ? {
      ...data,
      career_path: data.career_path as Player['career_path']
    } : null;
  } catch (error) {
    console.error('Failed to get player by id:', error);
    return null;
  }
};

// Diary Functions
export const getDiaryEntries = async (): Promise<DiaryEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to load diary entries:', error);
    return [];
  }
};

export const addDiaryEntry = async (entryData: Omit<DiaryEntry, 'id'>): Promise<DiaryEntry | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('diary_entries')
      .insert([{
        ...entryData,
        user_id: user.id
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to add diary entry:', error);
    return null;
  }
};

export const updateDiaryEntry = async (id: number, entryData: Omit<DiaryEntry, 'id'>): Promise<DiaryEntry | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('diary_entries')
      .update(entryData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;

    // 公開日記も更新
    if (user && data) {
      const { error: publicUpdateError } = await supabase
        .from('public_diary_entries' as any)
        .update({
          match_card: entryData.match_card,
          date: entryData.date,
          venue: entryData.venue,
          score: entryData.score,
          category: entryData.category,
          tournament_name: entryData.tournament_name,
          player_comments: entryData.player_comments,
          overall_impression: entryData.overall_impression,
          videos: entryData.videos
        })
        .eq('user_id', user.id)
        .eq('original_diary_id', id);
      
      if (publicUpdateError) {
        console.log('[updateDiaryEntry] Public diary update skipped or failed:', publicUpdateError);
      }
    }
    
    return data;
  } catch (error) {
    console.error('Failed to update diary entry:', error);
    return null;
  }
};

export const deleteDiaryEntry = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('diary_entries')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to delete diary entry:', error);
    return false;
  }
};

export const getDiaryEntryById = async (id: number): Promise<DiaryEntry | null> => {
  try {
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to get diary entry by id:', error);
    return null;
  }
};

// Draft Data Functions
export const getDraftData = async (): Promise<any> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('draft_data')
      .select('*')
      .eq('user_id', user.id);
    
    if (error) throw error;
    
    // Combine all team data into a single object
    const combinedData: any = {};
    if (data) {
      data.forEach((record: any) => {
        if (record.team_name && record.data) {
          // Extract team data from JSONB (it's stored as {team_name: {...}})
          const teamData = record.data[record.team_name];
          if (teamData) {
            combinedData[record.team_name] = teamData;
          }
        }
      });
    }
    
    return combinedData;
  } catch (error) {
    console.error('Failed to load draft data:', error);
    return {};
  }
};

export const saveDraftData = async (draftData: any): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Save all team data (this is for backward compatibility)
    // In practice, saveTeamDraftData should be used for individual team saves
    const savePromises = Object.keys(draftData).map(teamName => 
      saveTeamDraftData(teamName, draftData[teamName])
    );
    
    await Promise.all(savePromises);
    return true;
  } catch (error) {
    console.error('Failed to save draft data:', error);
    return false;
  }
};

// Save draft data for a specific team (UPSERT based on user_id + team_name)
export const saveTeamDraftData = async (teamName: string, teamData: any): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // UPSERT: Insert or update based on user_id + team_name unique constraint
    const { error } = await supabase
      .from('draft_data')
      .upsert({
        user_id: user.id,
        team_name: teamName,
        data: { [teamName]: teamData }, // Store in same format as before
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,team_name'
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Failed to save draft data for team ${teamName}:`, error);
    return false;
  }
};

// Profile Functions
export const getProfile = async (): Promise<Profile | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error) throw error;
    
    // Convert the data to Profile type
    return {
      user_id: data.user_id,
      display_name: data.display_name,
      avatar_url: data.avatar_url,
      bio: data.bio,
      social_links: (data.social_links as any) || []
    };
  } catch (error) {
    console.error('Failed to load profile:', error);
    return null;
  }
};

export const updateProfile = async (profileData: Partial<Profile>): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: profileData.display_name,
        bio: profileData.bio,
        avatar_url: profileData.avatar_url,
        social_links: profileData.social_links as any
      })
      .eq('user_id', user.id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to update profile:', error);
    return false;
  }
};

export const uploadAvatar = async (file: File): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/avatar.${fileExt}`;
    
    // 既存のアバターを削除（あれば）
    await supabase.storage.from('avatars').remove([fileName]);

    // 新しいアバターをアップロード
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // 公開URLを取得
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error) {
    console.error('Failed to upload avatar:', error);
    return null;
  }
};

// Public Players Functions
export const getPublicPlayers = async (): Promise<PublicPlayer[]> => {
  try {
    // 選手データのみを取得（ユーザー情報は個別取得時のみ）
    const { data: players, error } = await supabase
      .from('public_players')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    if (!players) return [];
    
    // プロフィール情報なしで返す
    return players.map(player => ({
      ...player,
      profiles: undefined,
      career_path: player.career_path as PublicPlayer['career_path']
    }));
  } catch (error) {
    console.error('Failed to load public players:', error);
    return [];
  }
};

export const getPublicPlayerById = async (id: string): Promise<PublicPlayer | null> => {
  try {
    // 選手データを取得
    const { data: player, error } = await supabase
      .from('public_players')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    if (!player) return null;
    
    // プロフィールを取得
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id, display_name, avatar_url, bio, social_links')
      .eq('user_id', player.user_id)
      .maybeSingle();
    
    return {
      ...player,
      profiles: profile,
      career_path: player.career_path as PublicPlayer['career_path']
    };
  } catch (error) {
    console.error('Failed to get public player by id:', error);
    return null;
  }
};


export const importPlayerFromPublic = async (publicPlayerId: string): Promise<Player | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const publicPlayer = await getPublicPlayerById(publicPlayerId);
    if (!publicPlayer) throw new Error('Public player not found');


    // 自分の選手リストに追加
    const { data, error } = await supabase
      .from('players')
      .insert([{
        user_id: user.id,
        name: publicPlayer.name,
        team: publicPlayer.team,
        position: publicPlayer.position,
        category: publicPlayer.category,
        evaluations: publicPlayer.evaluations,
        recommended_teams: publicPlayer.recommended_teams,
        year: publicPlayer.year,
        batting_hand: publicPlayer.batting_hand,
        throwing_hand: publicPlayer.throwing_hand,
        height: publicPlayer.height,
        weight: publicPlayer.weight,
        age: publicPlayer.age,
        memo: publicPlayer.memo,
        hometown: publicPlayer.hometown,
        career_path: publicPlayer.career_path,
        usage: publicPlayer.usage,
        videos: publicPlayer.videos,
        main_position: publicPlayer.main_position,
        imported_from_public_player_id: publicPlayerId,
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data ? {
      ...data,
      career_path: data.career_path as Player['career_path']
    } : null;
  } catch (error) {
    console.error('Failed to import player from public:', error);
    return null;
  }
};

export const updatePublicPlayer = async (id: string, playerData: Partial<PublicPlayer>): Promise<PublicPlayer | null> => {
  try {
    const { data, error } = await supabase
      .from('public_players')
      .update({
        name: playerData.name,
        team: playerData.team,
        position: playerData.position,
        category: playerData.category,
        evaluations: playerData.evaluations,
        recommended_teams: playerData.recommended_teams,
        year: playerData.year,
        batting_hand: playerData.batting_hand,
        throwing_hand: playerData.throwing_hand,
        height: playerData.height,
        weight: playerData.weight,
        age: playerData.age,
        memo: playerData.memo,
        hometown: playerData.hometown,
        career_path: playerData.career_path,
        usage: playerData.usage,
        videos: playerData.videos,
        main_position: playerData.main_position || null,
        is_favorite: playerData.is_favorite,
        draft_status: playerData.draft_status,
        draft_team: playerData.draft_team,
        draft_rank: playerData.draft_rank,
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data ? {
      ...data,
      career_path: data.career_path as PublicPlayer['career_path']
    } : null;
  } catch (error) {
    console.error('Failed to update public player:', error);
    return null;
  }
};

export const deletePublicPlayer = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('public_players')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to delete public player:', error);
    return false;
  }
};


export const getPublicPlayersByUserId = async (userId: string): Promise<PublicPlayer[]> => {
  try {
    // 選手データを取得
    const { data: players, error } = await supabase
      .from('public_players')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    if (!players) return [];
    
    // プロフィールを取得
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id, display_name, avatar_url, bio, social_links')
      .eq('user_id', userId)
      .maybeSingle();
    
    // すべての選手に同じプロフィールを追加
    return players.map(player => ({
      ...player,
      profiles: profile,
      career_path: player.career_path as PublicPlayer['career_path']
    }));
  } catch (error) {
    console.error('Failed to load public players by user id:', error);
    return [];
  }
};

export const getUserProfiles = async (): Promise<UserProfileWithStats[]> => {
  try {
    // プロフィールと統計を1つのクエリで取得
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        user_id,
        display_name,
        avatar_url,
        bio,
        social_links
      `);
    
    if (profilesError) throw profilesError;
    
    // 全ユーザーのpublic_playersを一括取得（必要な列のみ）
    const { data: allPublicPlayers, error: playersError } = await supabase
      .from('public_players' as any)
      .select('user_id');
    
    if (playersError) throw playersError;
    
    // user_idごとにグルーピング
    const playersByUser = new Map<string, number>();
    (allPublicPlayers || []).forEach((player: any) => {
      const currentCount = playersByUser.get(player.user_id) || 0;
      playersByUser.set(player.user_id, currentCount + 1);
    });
    
    // 統計を計算
    const profilesWithStats = (profiles || []).map(profile => {
      const upload_count = playersByUser.get(profile.user_id) || 0;
      
      return {
        user_id: profile.user_id,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        social_links: (profile.social_links as any) || [],
        upload_count
      };
    });
    
    // 投稿がないユーザーを除外
    return profilesWithStats.filter(p => p.upload_count > 0);
  } catch (error) {
    console.error('Failed to load user profiles:', error);
    return [];
  }
};

export const getUserProfileById = async (userId: string): Promise<Profile | null> => {
  try {
    // 必要な列のみを取得
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, display_name, avatar_url, bio, social_links')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return {
      user_id: data.user_id,
      display_name: data.display_name,
      avatar_url: data.avatar_url,
      bio: data.bio,
      social_links: (data.social_links as any) || []
    };
  } catch (error) {
    console.error('Failed to load user profile by id:', error);
    return null;
  }
};

// ============= Last Active Tracking =============

export async function updateLastActive() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ last_active_at: new Date().toISOString() })
    .eq('user_id', user.id);

  if (error) {
    console.error('Error updating last active:', error);
    return { success: false, error };
  }

  return { success: true };
}


// ============= Public Diary Entries =============

export interface PublicDiaryEntry {
  id: string;
  user_id: string;
  original_diary_id?: number;
  match_card: string;
  date: string;
  venue: string;
  score: string;
  category: string;
  tournament_name?: string;
  player_comments?: string;
  overall_impression?: string;
  videos?: string[];
  view_count?: number;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export const getPublicDiaryEntries = async (): Promise<PublicDiaryEntry[]> => {
  try {
    const { data: entries, error } = await supabase
      .from('public_diary_entries' as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch profiles separately
    const userIds = [...new Set(((entries as any) || []).map((e: any) => e.user_id).filter(Boolean) as string[])];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name, avatar_url, bio, social_links')
      .in('user_id', userIds);

    const profileMap = new Map(profiles?.map(p => [
      p.user_id,
      {
        user_id: p.user_id,
        display_name: p.display_name,
        avatar_url: p.avatar_url,
        bio: p.bio,
        social_links: (p.social_links as any as SocialLink[]) || []
      }
    ]));

    return ((entries as any) || []).map((entry: any) => ({
      ...entry,
      profile: profileMap.get(entry.user_id)
    })) as PublicDiaryEntry[];
  } catch (error) {
    console.error('Failed to load public diary entries:', error);
    return [];
  }
};


export const deletePublicDiaryEntry = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('public_diary_entries' as any)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete public diary entry:', error);
    throw error;
  }
};


export const incrementDiaryViewCount = async (diaryId: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get or create session ID for anonymous users
    let sessionId: string | null = null;
    if (!user) {
      sessionId = localStorage.getItem('diary_session_id');
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem('diary_session_id', sessionId);
      }
    }

    const { error } = await supabase.rpc('increment_diary_view_count', {
      diary_id: diaryId,
      p_user_id: user?.id || null,
      p_session_id: sessionId
    });

    if (error) {
      console.error('Failed to increment diary view count:', error);
    }
  } catch (error) {
    console.error('Failed to increment diary view count:', error);
  }
};

export const importDiaryFromPublic = async (publicDiaryId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('ログインが必要です');
  }

  // Get the public diary entry
  const { data: publicDiary, error: fetchError } = await supabase
    .from('public_diary_entries' as any)
    .select('*')
    .eq('id', publicDiaryId)
    .single();

  if (fetchError || !publicDiary) {
    throw new Error('観戦日記が見つかりません');
  }

  // Add to user's diary
  const { error: insertError } = await supabase
    .from('diary_entries')
    .insert({
      user_id: user.id,
      match_card: (publicDiary as any).match_card,
      date: (publicDiary as any).date,
      venue: (publicDiary as any).venue,
      score: (publicDiary as any).score,
      category: (publicDiary as any).category,
      tournament_name: (publicDiary as any).tournament_name,
      player_comments: (publicDiary as any).player_comments,
      overall_impression: (publicDiary as any).overall_impression,
      videos: (publicDiary as any).videos
    });

  if (insertError) {
    console.error('Failed to import diary:', insertError);
    throw insertError;
  }

};

// ============= Public Player Memos =============

export const getPublicPlayerMemos = async (playerId: string): Promise<PublicPlayerMemo[]> => {
  try {
    const { data, error } = await supabase
      .from('public_players_memo')
      .select('*')
      .eq('player_id', playerId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data as any) || [];
  } catch (error) {
    console.error('Failed to load public player memos:', error);
    return [];
  }
};

export const addPublicPlayerMemo = async (playerId: string, content: string): Promise<PublicPlayerMemo> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('ログインが必要です');
  }

  const { data, error } = await supabase
    .from('public_players_memo')
    .insert({
      player_id: playerId,
      user_id: user.id,
      content: content
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to add memo:', error);
    throw error;
  }

  return data as any;
};

export const updatePublicPlayerMemo = async (noteId: string, content: string): Promise<PublicPlayerMemo> => {
  const { data, error } = await supabase
    .from('public_players_memo')
    .update({ content: content })
    .eq('note_id', noteId)
    .select()
    .single();

  if (error) {
    console.error('Failed to update memo:', error);
    throw error;
  }

  return data as any;
};

export const deletePublicPlayerMemo = async (noteId: string): Promise<void> => {
  const { error } = await supabase
    .from('public_players_memo')
    .delete()
    .eq('note_id', noteId);

  if (error) {
    console.error('Failed to delete memo:', error);
    throw error;
  }
};