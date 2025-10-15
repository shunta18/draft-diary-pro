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
}

export interface DiaryEntry {
  id?: number;
  date: string;
  venue: string;
  category: string;
  match_card: string;
  score: string;
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
  view_count: number;
  import_count: number;
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
  total_views: number;
  total_imports: number;
}

// Player Functions
export const getPlayers = async (): Promise<Player[]> => {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
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
        position: Array.isArray(playerData.position) ? playerData.position[0] : playerData.position
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('[updatePlayer] Database error:', error);
      throw error;
    }
    
    console.log('[updatePlayer] Player updated successfully');
    
    // 公開選手データベースの同一選手も更新
    if (data) {
      console.log('[updatePlayer] Updating public player if exists...');
      const { error: publicUpdateError } = await supabase
        .from('public_players')
        .update({
          name: playerData.name,
          team: playerData.team,
          position: Array.isArray(playerData.position) ? playerData.position[0] : playerData.position,
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
          main_position: playerData.main_position,
          is_favorite: playerData.is_favorite,
        })
        .eq('user_id', user.id)
        .eq('original_player_id', id);
      
      if (publicUpdateError) {
        console.log('[updatePlayer] Public player update skipped or failed:', publicUpdateError);
      } else {
        console.log('[updatePlayer] Public player updated successfully');
      }
    }
    
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
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to delete player:', error);
    return false;
  }
};

export const getPlayerById = async (id: number): Promise<Player | null> => {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', id)
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
    const { data, error } = await supabase
      .from('diary_entries')
      .update(entryData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
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
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    return data?.data || {};
  } catch (error) {
    console.error('Failed to load draft data:', error);
    return {};
  }
};

export const saveDraftData = async (draftData: any): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 既存のデータがあるかチェック
    const { data: existingData } = await supabase
      .from('draft_data')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingData) {
      // 更新
      const { error } = await supabase
        .from('draft_data')
        .update({
          data: draftData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
    } else {
      // 新規作成
      const { error } = await supabase
        .from('draft_data')
        .insert({
          user_id: user.id,
          data: draftData
        });
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to save draft data:', error);
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
    const { data, error } = await supabase
      .from('public_players')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (!data) return [];
    
    // 各選手の投稿者情報を個別に取得
    const playersWithProfiles = await Promise.all(
      data.map(async (player) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url, bio, social_links')
          .eq('user_id', player.user_id)
          .maybeSingle();
        
        return {
          ...player,
          profiles: profile || null,
          career_path: player.career_path as PublicPlayer['career_path']
        };
      })
    );
    
    return playersWithProfiles;
  } catch (error) {
    console.error('Failed to load public players:', error);
    return [];
  }
};

export const getPublicPlayerById = async (id: string): Promise<PublicPlayer | null> => {
  try {
    const { data, error } = await supabase
      .from('public_players')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) return null;
    
    // 投稿者情報を個別に取得
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id, display_name, avatar_url, bio, social_links')
      .eq('user_id', data.user_id)
      .maybeSingle();
    
    return {
      ...data,
      profiles: profile || null,
      career_path: data.career_path as PublicPlayer['career_path']
    };
  } catch (error) {
    console.error('Failed to get public player by id:', error);
    return null;
  }
};

export const uploadPlayerToPublic = async (playerId: number): Promise<{ success: boolean; message?: string; data?: PublicPlayer }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'User not authenticated' };

    const player = await getPlayerById(playerId);
    if (!player) return { success: false, message: 'Player not found' };

    // インポートした選手かチェック
    if (player.imported_from_public_player_id) {
      return { success: false, message: 'インポートした選手はアップロードできません' };
    }

    // 既にアップロード済みかチェック（original_player_idとuser_idで）
    const { data: existing } = await supabase
      .from('public_players')
      .select('id')
      .eq('user_id', user.id)
      .eq('original_player_id', playerId)
      .maybeSingle();

    if (existing) {
      return { success: false, message: '既にアップロード済みの選手です' };
    }

    const { data, error } = await supabase
      .from('public_players')
      .insert([{
        user_id: user.id,
        original_player_id: playerId,
        name: player.name,
        team: player.team,
        position: player.position,
        category: player.category,
        evaluations: player.evaluations,
        recommended_teams: player.recommended_teams,
        year: player.year,
        batting_hand: player.batting_hand,
        throwing_hand: player.throwing_hand,
        height: player.height,
        weight: player.weight,
        age: player.age,
        memo: player.memo,
        hometown: player.hometown,
        career_path: player.career_path,
        usage: player.usage,
        videos: player.videos,
        main_position: player.main_position,
        is_favorite: player.is_favorite,
      }])
      .select()
      .single();
    
    if (error) return { success: false, message: error.message };
    
    return { 
      success: true, 
      data: data ? {
        ...data,
        career_path: data.career_path as PublicPlayer['career_path']
      } : undefined
    };
  } catch (error) {
    console.error('Failed to upload player to public:', error);
    return { success: false, message: 'アップロードに失敗しました' };
  }
};

export const importPlayerFromPublic = async (publicPlayerId: string): Promise<Player | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const publicPlayer = await getPublicPlayerById(publicPlayerId);
    if (!publicPlayer) throw new Error('Public player not found');

    // インポート記録を追加
    await supabase
      .from('public_player_imports')
      .insert([{
        user_id: user.id,
        public_player_id: publicPlayerId
      }]);

    // インポート数をインクリメント
    await supabase.rpc('increment_player_import_count', { player_id: publicPlayerId });

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
        main_position: playerData.main_position,
        is_favorite: playerData.is_favorite,
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

export const incrementPublicPlayerViewCount = async (publicPlayerId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const sessionId = sessionStorage.getItem('session_id') || Math.random().toString(36);
    
    if (!sessionStorage.getItem('session_id')) {
      sessionStorage.setItem('session_id', sessionId);
    }

    // 既に閲覧済みかチェック
    const { data: existingView } = await supabase
      .from('public_player_views')
      .select('id')
      .eq('public_player_id', publicPlayerId)
      .or(user ? `user_id.eq.${user.id}` : `session_id.eq.${sessionId}`)
      .maybeSingle();

    if (existingView) {
      return true; // 既に閲覧済み
    }

    // 閲覧記録を追加
    await supabase
      .from('public_player_views')
      .insert([{
        public_player_id: publicPlayerId,
        user_id: user?.id,
        session_id: sessionId
      }]);

    // 閲覧数をインクリメント
    await supabase.rpc('increment_player_view_count', { player_id: publicPlayerId });

    return true;
  } catch (error) {
    console.error('Failed to increment view count:', error);
    return false;
  }
};

export const getPublicPlayersByUserId = async (userId: string): Promise<PublicPlayer[]> => {
  try {
    const { data, error } = await supabase
      .from('public_players')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (!data) return [];
    
    // 投稿者情報を個別に取得
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id, display_name, avatar_url, bio, social_links')
      .eq('user_id', userId)
      .maybeSingle();
    
    return data.map(player => ({
      ...player,
      profiles: profile || null,
      career_path: player.career_path as PublicPlayer['career_path']
    }));
  } catch (error) {
    console.error('Failed to load public players by user id:', error);
    return [];
  }
};

export const getUserProfiles = async (): Promise<UserProfileWithStats[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        user_id,
        display_name,
        avatar_url,
        bio,
        social_links
      `);
    
    if (error) throw error;
    
    // 各ユーザーの統計情報を取得
    const profilesWithStats = await Promise.all(
      (data || []).map(async (profile) => {
        const { data: publicPlayers } = await supabase
          .from('public_players')
          .select('view_count, import_count')
          .eq('user_id', profile.user_id);
        
        const upload_count = publicPlayers?.length || 0;
        const total_views = publicPlayers?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0;
        const total_imports = publicPlayers?.reduce((sum, p) => sum + (p.import_count || 0), 0) || 0;
        
        return {
          user_id: profile.user_id,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          social_links: (profile.social_links as any) || [],
          upload_count,
          total_views,
          total_imports
        };
      })
    );
    
    return profilesWithStats.filter(p => p.upload_count > 0);
  } catch (error) {
    console.error('Failed to load user profiles:', error);
    return [];
  }
};

export const getUserProfileById = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
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

// Follow/Unfollow functions
export const followUser = async (followingId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be logged in to follow');
  }

  const { error } = await supabase
    .from('user_follows')
    .insert({
      follower_id: user.id,
      following_id: followingId
    });

  if (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

export const unfollowUser = async (followingId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be logged in to unfollow');
  }

  const { error } = await supabase
    .from('user_follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', followingId);

  if (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

export const getFollowedUsers = async (): Promise<string[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('user_follows')
    .select('following_id')
    .eq('follower_id', user.id);

  if (error) {
    console.error('Error fetching followed users:', error);
    throw error;
  }

  return data?.map(f => f.following_id) || [];
};

export const isFollowing = async (followingId: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return false;
  }

  const { data, error } = await supabase
    .from('user_follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', followingId)
    .maybeSingle();

  if (error) {
    console.error('Error checking follow status:', error);
    return false;
  }

  return !!data;
};