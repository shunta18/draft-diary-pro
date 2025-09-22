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

// デフォルトデータ
const defaultDiaryEntries: DiaryEntry[] = [
  {
    id: 1,
    date: "2012-08-09",
    venue: "甲子園",
    category: "高校",
    matchCard: "今治西(愛媛代表)対桐光学園(神奈川代表)",
    score: "今治西0-7桐光",
    playerComments: "桐光学園の2年生、松井裕樹。県予選で強豪横浜高校相手に9回3安打3失点で完投。準決勝、決勝も完投。",
    overallImpression: "注目選手の松井裕樹が9回2安打完封。奪三振22で大会記録。まだ2年生だが、来年のドラフト1位候補。",
    videos: [],
  },
];

export const getDiaryEntries = (): DiaryEntry[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load diary entries from storage:', error);
  }
  
  // 初回のみデフォルトデータを保存
  saveDiaryEntries(defaultDiaryEntries);
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