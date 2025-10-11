import { supabase } from "@/integrations/supabase/client";

// Player Types
export interface Player {
  id?: number;
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
  
  usage?: string;
  videos?: string[];
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

// Player Functions
export const getPlayers = async (): Promise<Player[]> => {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to load players:', error);
    return [];
  }
};

export const addPlayer = async (playerData: Omit<Player, 'id'>): Promise<Player | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('players')
      .insert([{
        ...playerData,
        user_id: user.id,
        position: Array.isArray(playerData.position) ? playerData.position[0] : playerData.position
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to add player:', error);
    return null;
  }
};

export const updatePlayer = async (id: number, playerData: Omit<Player, 'id'>): Promise<Player | null> => {
  try {
    const { data, error } = await supabase
      .from('players')
      .update({
        ...playerData,
        position: Array.isArray(playerData.position) ? playerData.position[0] : playerData.position
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to update player:', error);
    return null;
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
    return data;
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