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

// モックデータ
const defaultDiaryEntries: DiaryEntry[] = [
  {
    id: 1,
    date: "2025/09/10",
    venue: "甲子園",
    category: "高校",
    matchCard: "○○高校 vs △△高校",
    score: "7-3",
    playerComments: "田中太郎の投球が素晴らしかった。球速150km/h台を連発し、コントロールも抜群。",
    overallImpression: "両チームとも好ゲームだった。特に△△高校の佐藤選手も注目したい。",
    videos: [],
  },
  {
    id: 2,
    date: "2025/09/05",
    venue: "東京ドーム",
    category: "大学",
    matchCard: "××大学 vs ◇◇大学",
    score: "5-2",
    playerComments: "佐藤次郎の打撃力が印象的。長打力もあり、ドラフト上位候補。",
    overallImpression: "大学野球のレベルの高さを感じた試合。投手陣の質も高い。",
    videos: [],
  },
  {
    id: 3,
    date: "2025/08/28",
    venue: "明治神宮球場",
    category: "社会人",
    matchCard: "▲▲社会人 vs ◆◆社会人",
    score: "4-1",
    playerComments: "鈴木三郎の守備力が光った。肩も強く、将来性を感じる。",
    overallImpression: "社会人野球の堅実な試合運び。選手の完成度が高い。",
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