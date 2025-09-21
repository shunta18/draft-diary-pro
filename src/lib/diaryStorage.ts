export interface DiaryEntry {
  id: number;
  date: string;
  venue: string;
  category: string;
  matchCard: string;
  score: string;
  playerComments: string;
  overallImpression: string;
  videos: string[];
}

const STORAGE_KEY = 'baseball_scout_diary';

// デフォルトデータは空配列に変更
const defaultDiaryEntries: DiaryEntry[] = [];

export const getDiaryEntries = (): DiaryEntry[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load diary entries from storage:', error);
  }
  
  // 空の配列を返す（デフォルトデータは自動保存しない）
  return defaultDiaryEntries;
};

export const saveDiaryEntries = (entries: DiaryEntry[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Failed to save diary entries to storage:', error);
  }
};

export const addDiaryEntry = (entryData: Omit<DiaryEntry, 'id'>): DiaryEntry => {
  const entries = getDiaryEntries();
  const newId = Math.max(0, ...entries.map(e => e.id)) + 1;
  const newEntry: DiaryEntry = {
    ...entryData,
    id: newId,
  };
  
  const updatedEntries = [...entries, newEntry];
  saveDiaryEntries(updatedEntries);
  return newEntry;
};

export const updateDiaryEntry = (id: number, entryData: Omit<DiaryEntry, 'id'>): DiaryEntry | null => {
  const entries = getDiaryEntries();
  const index = entries.findIndex(e => e.id === id);
  
  if (index === -1) return null;
  
  const updatedEntry: DiaryEntry = {
    ...entryData,
    id,
  };
  
  const updatedEntries = [...entries];
  updatedEntries[index] = updatedEntry;
  saveDiaryEntries(updatedEntries);
  return updatedEntry;
};

export const deleteDiaryEntry = (id: number): boolean => {
  const entries = getDiaryEntries();
  const updatedEntries = entries.filter(e => e.id !== id);
  
  if (updatedEntries.length === entries.length) return false;
  
  saveDiaryEntries(updatedEntries);
  return true;
};

export const getDiaryEntryById = (id: number): DiaryEntry | null => {
  const entries = getDiaryEntries();
  return entries.find(e => e.id === id) || null;
};