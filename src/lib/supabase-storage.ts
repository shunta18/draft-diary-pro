import { supabase } from "@/integrations/supabase/client";

// Player Types
export interface Player {
  id?: number;
  name: string;
  team: string;
  position: string;
  category: string;
  evaluation?: string;
  year?: number;
  batting_hand?: string;
  throwing_hand?: string;
  height?: number;
  weight?: number;
  memo?: string;
  hometown?: string;
  career_path?: string;
  usage?: string;
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
    const { data, error } = await supabase
      .from('draft_data')
      .select('*')
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
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

    const { error } = await supabase
      .from('draft_data')
      .upsert({
        user_id: user.id,
        data: draftData
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to save draft data:', error);
    return false;
  }
};