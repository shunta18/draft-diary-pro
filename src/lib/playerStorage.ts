export interface Player {
  id: number;
  name: string;
  team: string;
  position: string[];
  category: string;
  evaluation: string;
  draftYear: string;
  battingThrowing?: string;
  hometown?: string;
  careerPath?: string;
  memo?: string;
  videoLinks: string[];
}

const STORAGE_KEY = 'baseball_scout_players';

// モックデータ
const defaultPlayers: Player[] = [
  {
    id: 1,
    name: "田中太郎",
    team: "○○高校",
    position: ["投手"],
    category: "高校",
    evaluation: "1位競合確実",
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "東京都",
    careerPath: "プロ志望",
    memo: "球速150km/h超、変化球のキレが抜群",
    videoLinks: ["https://youtube.com/watch?v=example1"],
  },
  {
    id: 2,
    name: "佐藤次郎",
    team: "△△大学",
    position: ["内野手"],
    category: "大学",
    evaluation: "2-3位",
    draftYear: "2025",
    battingThrowing: "右投左打",
    hometown: "大阪府",
    careerPath: "プロ志望",
    memo: "守備範囲が広く、打撃センスも良好",
    videoLinks: ["https://youtube.com/watch?v=example2"],
  },
  {
    id: 3,
    name: "鈴木三郎",
    team: "××社会人",
    position: ["外野手"],
    category: "社会人",
    evaluation: "4-5位",
    draftYear: "2025",
    battingThrowing: "左投左打",
    hometown: "愛知県",
    careerPath: "プロ志望",
    memo: "長打力があり、走力も申し分ない",
    videoLinks: [],
  },
];

export const getPlayers = (): Player[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load players from storage:', error);
  }
  
  // 初回のみデフォルトデータを保存
  savePlayers(defaultPlayers);
  return defaultPlayers;
};

export const savePlayers = (players: Player[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
  } catch (error) {
    console.error('Failed to save players to storage:', error);
  }
};

export const addPlayer = (playerData: Omit<Player, 'id'>): Player => {
  const players = getPlayers();
  const newId = Math.max(0, ...players.map(p => p.id)) + 1;
  const newPlayer: Player = {
    ...playerData,
    id: newId,
  };
  
  const updatedPlayers = [...players, newPlayer];
  savePlayers(updatedPlayers);
  return newPlayer;
};

export const updatePlayer = (id: number, playerData: Omit<Player, 'id'>): Player | null => {
  const players = getPlayers();
  const index = players.findIndex(p => p.id === id);
  
  if (index === -1) return null;
  
  const updatedPlayer: Player = {
    ...playerData,
    id,
  };
  
  const updatedPlayers = [...players];
  updatedPlayers[index] = updatedPlayer;
  savePlayers(updatedPlayers);
  return updatedPlayer;
};

export const deletePlayer = (id: number): boolean => {
  const players = getPlayers();
  const updatedPlayers = players.filter(p => p.id !== id);
  
  if (updatedPlayers.length === players.length) return false;
  
  savePlayers(updatedPlayers);
  return true;
};

export const getPlayerById = (id: number): Player | null => {
  const players = getPlayers();
  return players.find(p => p.id === id) || null;
};