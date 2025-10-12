export interface Player {
  id: number;
  name: string;
  team: string;
  position: string[];
  mainPosition?: string;
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

// ユーザーのデータベースから取得したデータ
const defaultPlayers: Player[] = [
  {
    id: 2,
    name: "立石 正広",
    team: "創価大学",
    position: ["三塁手", "二塁手"],
    mainPosition: "三塁手",
    category: "大学",
    evaluations: ["1位競合"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    usage: "",
    memo: "",
    videoLinks: []
  },
  {
    id: 3,
    name: "松下 歩叶",
    team: "法政大学",
    position: ["二塁手", "三塁手", "遊撃手"],
    mainPosition: "三塁手",
    category: "大学",
    evaluations: ["1位一本釣り", "外れ1位"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    usage: "",
    memo: "",
    videoLinks: []
  },
  {
    id: 4,
    name: "毛利 海大",
    team: "明治大学",
    position: ["投手"],
    category: "大学",
    evaluations: ["外れ1位", "2位"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "左投左打",
    hometown: "",
    usage: "先発",
    memo: "",
    videoLinks: []
  },
  {
    id: 7,
    name: "増居 翔太",
    team: "トヨタ",
    position: ["投手"],
    category: "社会人",
    evaluations: ["1位一本釣り", "外れ1位", "2位"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "左投左打",
    hometown: "",
    usage: "先発",
    memo: "",
    videoLinks: []
  },
  {
    id: 8,
    name: "竹丸 和幸",
    team: "鷺宮製作所",
    position: ["投手"],
    category: "社会人",
    evaluations: ["1位一本釣り", "外れ1位", "2位"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "左投左打",
    hometown: "",
    usage: "先発",
    memo: "",
    videoLinks: []
  },
  {
    id: 9,
    name: "谷端 将伍",
    team: "日本大学",
    position: ["二塁手", "三塁手"],
    category: "大学",
    evaluations: ["1位一本釣り", "外れ1位", "2位"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    usage: "",
    memo: "",
    videoLinks: []
  },
  {
    id: 10,
    name: "中西 聖輝",
    team: "青山学院大",
    position: ["投手"],
    category: "大学",
    evaluations: ["1位一本釣り", "外れ1位"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    usage: "先発",
    memo: "",
    videoLinks: []
  },
  {
    id: 11,
    name: "櫻井 頼之介",
    team: "東北福祉大",
    position: ["投手"],
    category: "大学",
    evaluations: ["2位", "3位"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    usage: "",
    memo: "",
    videoLinks: []
  },
  {
    id: 15,
    name: "藤原 聡大",
    team: "花園大学",
    position: ["投手"],
    category: "大学",
    evaluations: ["2位", "3位"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    usage: "",
    memo: "",
    videoLinks: []
  },
  {
    id: 16,
    name: "櫻井 ユウヤ",
    team: "昌平高校",
    position: ["三塁手"],
    category: "高校",
    evaluations: ["外れ1位", "2位"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    usage: "",
    memo: "",
    videoLinks: []
  },
  {
    id: 78,
    name: "石垣 元気",
    team: "健大高崎",
    position: ["投手"],
    category: "高校",
    evaluations: ["1位一本釣り"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投左打",
    hometown: "",
    usage: "",
    memo: "",
    videoLinks: []
  },
  {
    id: 79,
    name: "小島 大河",
    team: "明治大学",
    position: ["捕手", "一塁手", "指名打者"],
    category: "大学",
    evaluations: ["1位一本釣り", "外れ1位", "2位"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投左打",
    hometown: "",
    usage: "",
    memo: "",
    videoLinks: []
  },
  {
    id: 81,
    name: "エドポロ ケイン",
    team: "大阪学院大学",
    position: ["外野手", "指名打者"],
    category: "大学",
    evaluations: ["2位", "3位", "4位"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    usage: "",
    memo: "",
    videoLinks: []
  },
  {
    id: 83,
    name: "堀越 啓太",
    team: "東北福祉大",
    position: ["投手"],
    category: "大学",
    evaluations: ["2位", "3位"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    usage: "",
    memo: "",
    videoLinks: []
  },
  {
    id: 84,
    name: "伊藤 樹",
    team: "早稲田大学",
    position: ["投手"],
    category: "大学",
    evaluations: ["2位", "3位"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    usage: "",
    memo: "",
    videoLinks: []
  },
  {
    id: 85,
    name: "齊藤 汰直",
    team: "亜細亜大学",
    position: ["投手"],
    category: "大学",
    evaluations: ["1位一本釣り", "外れ1位", "2位"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    usage: "",
    memo: "",
    videoLinks: []
  },
  {
    id: 129,
    name: "山城 京平",
    team: "亜細亜大学",
    position: ["投手"],
    category: "大学",
    evaluations: ["外れ1位", "2位"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    usage: "",
    memo: "",
    videoLinks: []
  },
  {
    id: 132,
    name: "大塚 瑠晏",
    team: "東海大学",
    position: ["遊撃手"],
    category: "大学",
    evaluations: ["1位一本釣り", "外れ1位", "2位"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    usage: "",
    memo: "",
    videoLinks: []
  },
  {
    id: 136,
    name: "秋山 俊",
    team: "中京大学",
    position: ["外野手"],
    category: "大学",
    evaluations: ["2位", "3位"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    usage: "",
    memo: "",
    videoLinks: []
  },
  {
    id: 137,
    name: "森 陽樹",
    team: "大阪桐蔭高校",
    position: ["投手"],
    category: "高校",
    evaluations: ["3位", "4位", "5位", "6位以下", "育成"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    usage: "",
    memo: "",
    videoLinks: []
  },
  {
    id: 139,
    name: "藤井 健翔",
    team: "浦和学院",
    position: ["三塁手"],
    mainPosition: "三塁手",
    category: "高校",
    evaluations: ["3位", "4位"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    usage: "",
    memo: "",
    videoLinks: []
  },
  {
    id: 140,
    name: "谷脇 弘起",
    team: "日本生命",
    position: ["投手"],
    category: "社会人",
    evaluations: ["2位", "外れ1位", "3位"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "",
    usage: "",
    memo: "",
    videoLinks: []
  },
  {
    id: 142,
    name: "髙橋 隆慶",
    team: "JR東日本",
    position: ["三塁手", "外野手", "指名打者"],
    category: "社会人",
    evaluations: ["2位", "3位"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "左投左打",
    hometown: "",
    usage: "",
    memo: "",
    videoLinks: []
  },
  {
    id: 143,
    name: "冨重 英二郎",
    team: "神奈川FD",
    position: ["投手"],
    category: "社会人",
    evaluations: ["2位", "4位", "3位"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "左投左打",
    hometown: "",
    usage: "",
    memo: "",
    videoLinks: []
  }
];

// ゲストユーザー向け：常に最新のデフォルトデータを取得
export const getDefaultPlayers = (): Player[] => {
  return defaultPlayers;
};

// ログインユーザーまたは既存データがある場合用
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
