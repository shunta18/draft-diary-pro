export interface Player {
  id: number;
  name: string;
  team: string;
  position: string[];
  category: string;
  evaluations: string[];
  recommended_teams?: string[];
  draftYear: string;
  battingThrowing?: string;
  hometown?: string;
  age?: number;
  
  usage?: string;
  memo?: string;
  videoLinks: string[];
}

const STORAGE_KEY = 'baseball_scout_players';

// モックデータ
const defaultPlayers: Player[] = [
  {
    id: 1,
    name: "齊藤 汰直",
    team: "日本通運",
    position: ["投手"],
    category: "社会人",
    evaluations: ["1位一本釣り", "外れ1位", "2位"],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    usage: "先発",
    memo: "",
    videoLinks: [],
  },
  {
    id: 2,
    name: "伊藤 樹",
    team: "早稲田大学",
    position: ["投手"],
    category: "大学",
    evaluations: ["2位", "3位"],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    memo: "",
    videoLinks: [],
  },
  {
    id: 3,
    name: "堀越 啓太",
    team: "東北福祉大",
    position: ["投手"],
    category: "大学",
    evaluations: ["2位", "3位"],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    memo: "",
    videoLinks: [],
  },
  {
    id: 4,
    name: "中西 聖輝",
    team: "青山学院大",
    position: ["投手"],
    category: "大学",
    evaluations: ["1位一本釣り", "外れ1位"],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    usage: "先発",
    memo: "",
    videoLinks: [],
  },
  {
    id: 5,
    name: "髙木 快大",
    team: "青山学院大学",
    position: ["投手"],
    category: "大学",
    evaluations: ["1位一本釣り", "外れ1位", "2位"],
    draftYear: "2025",
    battingThrowing: "左投左打",
    hometown: "",
    usage: "先発",
    memo: "",
    videoLinks: [],
  },
  {
    id: 6,
    name: "渡邉 一生",
    team: "立教大学",
    position: ["投手"],
    category: "大学",
    evaluations: ["外れ1位", "2位"],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    memo: "",
    videoLinks: [],
  },
  {
    id: 7,
    name: "櫻井 頼之介",
    team: "東京ガス",
    position: ["投手"],
    category: "社会人",
    evaluations: ["外れ1位", "2位"],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    usage: "先発",
    memo: "",
    videoLinks: [],
  },
  {
    id: 8,
    name: "藤原 聡大",
    team: "大阪ガス",
    position: ["投手"],
    category: "社会人",
    evaluations: ["外れ1位", "2位"],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    usage: "先発",
    memo: "",
    videoLinks: [],
  },
  {
    id: 9,
    name: "毛利 海大",
    team: "東洋大学",
    position: ["投手"],
    category: "大学",
    evaluations: ["1位一本釣り", "外れ1位", "2位"],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    usage: "先発",
    memo: "",
    videoLinks: [],
  },
  {
    id: 10,
    name: "山城 京平",
    team: "亜細亜大学",
    position: ["投手"],
    category: "大学",
    evaluations: ["外れ1位", "2位"],
    draftYear: "2025",
    battingThrowing: "左投左打",
    hometown: "",
    memo: "",
    videoLinks: [],
  },
  {
    id: 11,
    name: "小島 大河",
    team: "明治大学",
    position: ["捕手", "一塁手", "指名打者"],
    category: "大学",
    evaluations: ["1位一本釣り", "外れ1位", "2位"],
    draftYear: "2025",
    battingThrowing: "右投左打",
    hometown: "",
    memo: "",
    videoLinks: [],
  },
  {
    id: 12,
    name: "松下 歩叶",
    team: "法政大学",
    position: ["二塁手", "三塁手", "遊撃手"],
    category: "大学",
    evaluations: ["1位一本釣り", "外れ1位"],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    memo: "",
    videoLinks: [],
  },
  {
    id: 13,
    name: "大塚 瑠晏",
    team: "東海大学",
    position: ["二塁手", "遊撃手"],
    category: "大学",
    evaluations: ["1位一本釣り", "外れ1位", "2位"],
    draftYear: "2025",
    battingThrowing: "右投左打",
    hometown: "",
    memo: "",
    videoLinks: [],
  },
  {
    id: 14,
    name: "松川 玲央",
    team: "JR東海",
    position: ["捕手"],
    category: "社会人",
    evaluations: ["1位一本釣り", "外れ1位", "2位"],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    usage: "",
    memo: "",
    videoLinks: [],
  },
  {
    id: 15,
    name: "立石 正広",
    team: "日本生命",
    position: ["外野手"],
    category: "社会人",
    evaluations: ["外れ1位", "2位"],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    usage: "",
    memo: "",
    videoLinks: [],
  },
  {
    id: 16,
    name: "小田 康一郎",
    team: "青山学院大学",
    position: ["一塁手", "三塁手", "指名打者"],
    category: "大学",
    evaluations: ["2位", "3位"],
    draftYear: "2025",
    battingThrowing: "右投左打",
    hometown: "",
    memo: "",
    videoLinks: [],
  },
  {
    id: 17,
    name: "谷端 将伍",
    team: "日本通運",
    position: ["外野手"],
    category: "社会人",
    evaluations: ["2位", "3位"],
    draftYear: "2025",
    battingThrowing: "右投左打",
    hometown: "",
    usage: "",
    memo: "",
    videoLinks: [],
  },
  {
    id: 18,
    name: "平川 蓮",
    team: "仙台大学",
    position: ["外野手"],
    category: "大学",
    evaluations: ["2位", "3位"],
    draftYear: "2025",
    battingThrowing: "右投",
    hometown: "",
    memo: "",
    videoLinks: [],
  },
  {
    id: 19,
    name: "秋山 俊",
    team: "立教大学",
    position: ["外野手"],
    category: "大学",
    evaluations: ["2位", "3位"],
    draftYear: "2025",
    battingThrowing: "左投左打",
    hometown: "",
    memo: "",
    videoLinks: [],
  },
  {
    id: 20,
    name: "エドポロ ケイン",
    team: "大阪学院大学",
    position: ["外野手", "指名打者"],
    category: "大学",
    evaluations: ["2位", "3位", "4位"],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    memo: "",
    videoLinks: [],
  },
  {
    id: 21,
    name: "石垣 元気",
    team: "立教大学",
    position: ["三塁手", "遊撃手"],
    category: "大学",
    evaluations: ["外れ1位", "2位"],
    draftYear: "2025",
    battingThrowing: "右投左打",
    hometown: "",
    memo: "",
    videoLinks: [],
  },
  {
    id: 22,
    name: "森 陽樹",
    team: "明治大学",
    position: ["投手"],
    category: "大学",
    evaluations: ["2位", "3位", "4位"],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    usage: "先発",
    memo: "",
    videoLinks: [],
  },
  {
    id: 23,
    name: "藤井 健翔",
    team: "亜細亜大学",
    position: ["投手"],
    category: "大学",
    evaluations: ["2位", "3位"],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    usage: "先発",
    memo: "",
    videoLinks: [],
  },
  {
    id: 24,
    name: "櫻井 ユウヤ",
    team: "日本製鉄鹿島",
    position: ["投手"],
    category: "社会人",
    evaluations: ["2位", "3位"],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    usage: "先発",
    memo: "",
    videoLinks: [],
  },
  {
    id: 25,
    name: "竹丸 和幸",
    team: "東北福祉大学",
    position: ["投手"],
    category: "大学",
    evaluations: ["2位", "3位", "4位"],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    usage: "先発",
    memo: "",
    videoLinks: [],
  },
  {
    id: 26,
    name: "増居 翔太",
    team: "トヨタ",
    position: ["投手"],
    category: "社会人",
    evaluations: ["1位一本釣り", "外れ1位", "2位"],
    draftYear: "2025",
    battingThrowing: "左投左打",
    hometown: "",
    usage: "先発",
    memo: "",
    videoLinks: [],
  },
  {
    id: 27,
    name: "谷脇 弘起",
    team: "天理大学",
    position: ["投手"],
    category: "大学",
    evaluations: ["1位一本釣り", "外れ1位", "2位"],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    usage: "先発",
    memo: "",
    videoLinks: [],
  },
  {
    id: 28,
    name: "萩原 義輝",
    team: "東海大学",
    position: ["投手"],
    category: "大学",
    evaluations: ["2位", "3位"],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    usage: "先発",
    memo: "",
    videoLinks: [],
  },
  {
    id: 29,
    name: "髙橋 隆慶",
    team: "法政大学",
    position: ["投手"],
    category: "大学",
    evaluations: ["外れ1位", "2位"],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    usage: "先発",
    memo: "",
    videoLinks: [],
  },
  {
    id: 30,
    name: "冨重 英二郎",
    team: "神奈川FD",
    position: ["投手"],
    category: "独立リーグ",
    evaluations: ["2位", "4位", "3位"],
    draftYear: "2025",
    battingThrowing: "左投左打",
    hometown: "",
    memo: "",
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