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

// ユーザーのデータベースから取得したデータ
const defaultPlayers: Player[] = [
  {
    id: 1,
    name: "櫻井 ユウヤ",
    team: "昌平高校",
    position: ["三塁手"],
    category: "高校",
    evaluations: ["上位候補"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "埼玉県",
    usage: "投打に力強さがある好選手。\n一塁コンバート案があるが、今のところ体格の割に守備力が高く、本職のサードをそのまま守らせるべき。\n打撃はロングティーで140m以上飛ばせるパワーが魅力。\n特に投手のインコースを上手く捌く技術がある一方で、アウトコースの対応を鍛えたい。",
    memo: "",
    videoLinks: []
  },
  {
    id: 2,
    name: "常田 琉生",
    team: "明治大学",
    position: ["三塁手"],
    category: "大学",
    evaluations: ["1位競合"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "山口県",
    usage: "強打が魅力。\n今年からサードに加え、セカンドも守る。",
    memo: "",
    videoLinks: []
  },
  {
    id: 3,
    name: "松川 玲央",
    team: "星槎道都大学",
    position: ["投手"],
    category: "大学",
    evaluations: ["上位候補"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "神奈川県",
    usage: "ストレートの質が良い。\nアマ球界屈指の本格派右腕。",
    memo: "",
    videoLinks: []
  },
  {
    id: 4,
    name: "森 陽樹",
    team: "星槎道都大学",
    position: ["捕手"],
    category: "大学",
    evaluations: ["育成候補"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "北海道",
    usage: "大学球界でもトップレベルの身体能力。\n地方のキャッチャーの中ではナンバーワン。",
    memo: "",
    videoLinks: []
  },
  {
    id: 5,
    name: "石垣 元気",
    team: "星槎道都大学",
    position: ["外野手"],
    category: "大学",
    evaluations: ["育成候補"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "左投左打",
    hometown: "沖縄県",
    usage: "プロのスカウトが集まるチームで、4番を打つバッター。\n左のスラッガータイプ。",
    memo: "",
    videoLinks: []
  },
  {
    id: 6,
    name: "石田 充冴",
    team: "新潟医療福祉大学",
    position: ["投手"],
    category: "大学",
    evaluations: ["育成候補"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "新潟県",
    usage: "ストレートはMAX148km/h。\n今年は特にコントロールが良くなっている。",
    memo: "",
    videoLinks: []
  },
  {
    id: 7,
    name: "藤田 大成",
    team: "新潟医療福祉大学",
    position: ["外野手"],
    category: "大学",
    evaluations: ["育成候補"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "新潟県",
    usage: "1年生から4番を打つバッター。\n昨秋は右肩を負傷していたが、今春は完治。\n5月の神宮では力強さが戻ってきた。",
    memo: "",
    videoLinks: []
  },
  {
    id: 8,
    name: "坂本 達也",
    team: "中央大学",
    position: ["投手"],
    category: "大学",
    evaluations: ["1位競合"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "左投右打",
    hometown: "神奈川県",
    usage: "ストレートはMAX154km/h。\n今年は特にコントロールが良くなっている。",
    memo: "",
    videoLinks: []
  },
  {
    id: 9,
    name: "度会 隆輝",
    team: "横浜DeNAベイスターズ",
    position: ["外野手"],
    category: "プロ",
    evaluations: ["1位競合"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "神奈川県",
    usage: "超高校級のバッター。\n今年は特に打撃が良くなっている。",
    memo: "",
    videoLinks: []
  },
  {
    id: 10,
    name: "西舘 勇陽",
    team: "創価大学",
    position: ["投手"],
    category: "大学",
    evaluations: ["上位候補"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "左投右打",
    hometown: "北海道",
    usage: "ストレートはMAX152km/h。\n今年は特にコントロールが良くなっている。",
    memo: "",
    videoLinks: []
  },
  {
    id: 11,
    name: "佐々木 麟太郎",
    team: "スタンフォード大学",
    position: ["一塁手"],
    category: "大学",
    evaluations: ["1位競合"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "岩手県",
    usage: "超高校級のバッター。\n今年は特に打撃が良くなっている。",
    memo: "",
    videoLinks: []
  },
  {
    id: 12,
    name: "伊藤 櫂人",
    team: "福岡大学",
    position: ["投手"],
    category: "大学",
    evaluations: ["育成候補"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "福岡県",
    usage: "ストレートはMAX147km/h。\n今年は特にコントロールが良くなっている。",
    memo: "",
    videoLinks: []
  },
  {
    id: 13,
    name: "宗山 塁",
    team: "智辯和歌山高校",
    position: ["外野手"],
    category: "高校",
    evaluations: ["上位候補"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "和歌山県",
    usage: "超高校級のバッター。\n今年は特に打撃が良くなっている。",
    memo: "",
    videoLinks: []
  },
  {
    id: 14,
    name: "竹村 塁",
    team: "明治大学",
    position: ["遊撃手"],
    category: "大学",
    evaluations: ["上位候補"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "大阪府",
    usage: "リーグ屈指の遊撃手。\n今年は特に守備が良くなっている。",
    memo: "",
    videoLinks: []
  },
  {
    id: 15,
    name: "小川 哲平",
    team: "東京ガス",
    position: ["外野手"],
    category: "社会人",
    evaluations: ["上位候補"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "千葉県",
    usage: "超高校級のバッター。\n今年は特に打撃が良くなっている。",
    memo: "",
    videoLinks: []
  },
  {
    id: 16,
    name: "阿部 剣友",
    team: "明治大学",
    position: ["投手"],
    category: "大学",
    evaluations: ["上位候補"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "千葉県",
    usage: "ストレートはMAX149km/h。\n今年は特にコントロールが良くなっている。",
    memo: "",
    videoLinks: []
  },
  {
    id: 17,
    name: "高橋 純平",
    team: "福岡ソフトバンクホークス",
    position: ["投手"],
    category: "プロ",
    evaluations: ["1位競合"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "福岡県",
    usage: "ストレートはMAX155km/h。\n今年は特にコントロールが良くなっている。",
    memo: "",
    videoLinks: []
  },
  {
    id: 18,
    name: "中山 礼都",
    team: "立正大学",
    position: ["遊撃手"],
    category: "大学",
    evaluations: ["育成候補"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "東京都",
    usage: "リーグ屈指の遊撃手。\n今年は特に守備が良くなっている。",
    memo: "",
    videoLinks: []
  },
  {
    id: 19,
    name: "浅野 翔吾",
    team: "高松商業高校",
    position: ["外野手"],
    category: "高校",
    evaluations: ["1位競合"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "香川県",
    usage: "超高校級のバッター。\n今年は特に打撃が良くなっている。",
    memo: "",
    videoLinks: []
  },
  {
    id: 20,
    name: "前田 悠伍",
    team: "大阪桐蔭高校",
    position: ["投手"],
    category: "高校",
    evaluations: ["1位競合"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "左投右打",
    hometown: "大阪府",
    usage: "ストレートはMAX150km/h。\n今年は特にコントロールが良くなっている。",
    memo: "",
    videoLinks: []
  },
  {
    id: 21,
    name: "細野 晴希",
    team: "東洋大学",
    position: ["投手"],
    category: "大学",
    evaluations: ["上位候補"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "千葉県",
    usage: "ストレートはMAX153km/h。\n今年は特にコントロールが良くなっている。",
    memo: "",
    videoLinks: []
  },
  {
    id: 22,
    name: "金丸 夢斗",
    team: "立教大学",
    position: ["捕手"],
    category: "大学",
    evaluations: ["上位候補"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "神奈川県",
    usage: "大学球界でもトップレベルの身体能力。\n地方のキャッチャーの中ではナンバーワン。",
    memo: "",
    videoLinks: []
  },
  {
    id: 23,
    name: "菅野 秀哉",
    team: "明治大学",
    position: ["二塁手"],
    category: "大学",
    evaluations: ["上位候補"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "神奈川県",
    usage: "リーグ屈指のセカンド。\n今年は特に守備が良くなっている。",
    memo: "",
    videoLinks: []
  },
  {
    id: 24,
    name: "青柳 博文",
    team: "上武大学",
    position: ["投手"],
    category: "大学",
    evaluations: ["育成候補"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "左投右打",
    hometown: "群馬県",
    usage: "ストレートはMAX146km/h。\n今年は特にコントロールが良くなっている。",
    memo: "",
    videoLinks: []
  },
  {
    id: 25,
    name: "真鍋 慧",
    team: "広陵高校",
    position: ["遊撃手"],
    category: "高校",
    evaluations: ["1位競合"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "広島県",
    usage: "リーグ屈指の遊撃手。\n今年は特に守備が良くなっている。",
    memo: "",
    videoLinks: []
  },
  {
    id: 26,
    name: "宮國 凌空",
    team: "興南高校",
    position: ["投手"],
    category: "高校",
    evaluations: ["上位候補"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "沖縄県",
    usage: "ストレートはMAX149km/h。\n今年は特にコントロールが良くなっている。",
    memo: "",
    videoLinks: []
  },
  {
    id: 27,
    name: "中崎 琉生",
    team: "九州国際大付高校",
    position: ["投手"],
    category: "高校",
    evaluations: ["上位候補"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "左投右打",
    hometown: "福岡県",
    usage: "ストレートはMAX148km/h。\n今年は特にコントロールが良くなっている。",
    memo: "",
    videoLinks: []
  },
  {
    id: 28,
    name: "西谷 礼生",
    team: "上武大学",
    position: ["二塁手"],
    category: "大学",
    evaluations: ["育成候補"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "群馬県",
    usage: "リーグ屈指のセカンド。\n今年は特に守備が良くなっている。",
    memo: "",
    videoLinks: []
  },
  {
    id: 29,
    name: "中村 恵吾",
    team: "明治大学",
    position: ["二塁手"],
    category: "大学",
    evaluations: ["上位候補"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "右投右打",
    hometown: "埼玉県",
    usage: "リーグ屈指のセカンド。\n今年は特に守備が良くなっている。",
    memo: "",
    videoLinks: []
  },
  {
    id: 30,
    name: "伊東 寛太",
    team: "国士舘大学",
    position: ["外野手"],
    category: "大学",
    evaluations: ["育成候補"],
    recommended_teams: [],
    draftYear: "2025",
    battingThrowing: "左投左打",
    hometown: "東京都",
    usage: "超高校級のバッター。\n今年は特に打撃が良くなっている。",
    memo: "",
    videoLinks: []
  }
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
