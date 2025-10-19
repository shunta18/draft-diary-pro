import { fetchDraftPredictions } from "./draftPredictions";

export interface ScoringWeights {
  voteScore: number;      // 投票データスコア (0-100)
  teamNeedsScore: number; // チームニーズマッチングスコア (0-100)
  playerRating: number;   // 選手評価スコア (0-100)
  realismScore: number;   // 現実性調整スコア (0-100)
}

export interface WeightConfig {
  voteWeight: number;      // デフォルト 40%
  teamNeedsWeight: number; // デフォルト 30%
  playerRatingWeight: number; // デフォルト 20%
  realismWeight: number;   // デフォルト 10%
}

export interface DraftScore {
  playerId: number;
  playerName: string;
  teamId: number;
  round: number;
  totalScore: number;
  breakdown: ScoringWeights;
  reason: string;
}

export interface NormalizedPlayer {
  id: number;
  name: string;
  team: string;
  position: string[];
  category: string;
  evaluations: string[];
  year?: number;
  draftYear: string;
  batting_hand?: string;
  throwing_hand?: string;
  battingThrowing?: string;
  hometown?: string;
  age?: number;
  usage?: string;
  memo?: string;
  videoLinks: string[];
}

export interface DraftPick {
  teamId: number;
  playerId: number;
  playerName: string;
  round: number;
  isDevelopment?: boolean;
  isContested?: boolean; // 競合指名かどうか
  contestedTeams?: number[]; // 競合した球団のリスト
  pickLabel?: string; // "1位", "外れ1位", "外れ2位" などのラベル
}

interface VoteData {
  playerVotes: Map<string, number>; // key: "teamId_playerId"
  positionVotes: Map<string, number>; // key: "teamId_round_position"
}

// 評価文字列からスコアを計算
const evaluatePlayerRating = (evaluations: string[]): number => {
  if (!evaluations || evaluations.length === 0) return 50;
  
  // 順位評価の点数マッピング
  const rankScores: { [key: string]: number } = {
    '1位競合': 100,
    '1位一本釣り': 95,
    '外れ1位': 90,
    '2位': 80,
    '3位': 70,
    '4位': 60,
    '5位': 50,
    '6位以下': 40,
    '育成': 30
  };
  
  const foundScores: number[] = [];
  
  // 各評価文字列から順位評価を探す
  evaluations.forEach(evaluation => {
    for (const [rank, score] of Object.entries(rankScores)) {
      if (evaluation.includes(rank)) {
        foundScores.push(score);
        break; // 1つの評価文字列につき1つの順位評価のみ
      }
    }
  });
  
  // 順位評価が見つからない場合はデフォルト50点
  if (foundScores.length === 0) return 50;
  
  // 複数の順位評価がある場合は平均値を計算
  const averageScore = foundScores.reduce((sum, score) => sum + score, 0) / foundScores.length;
  
  // 30-100の範囲を0-100に正規化
  const normalizedScore = ((averageScore - 30) / (100 - 30)) * 100;
  
  return Math.round(Math.max(0, Math.min(100, normalizedScore)));
};

// ポジションマッチングスコアを計算
const calculatePositionMatch = (playerPositions: string[], requestedPosition: string): number => {
  if (requestedPosition === "全ポジション" || requestedPosition === "指定なし") return 50;
  
  // 投手・野手の大分類マッチング
  const isPitcher = playerPositions.some(p => p === "投手" || p === "P");
  const isFielder = playerPositions.some(p => p !== "投手" && p !== "P");
  
  if (requestedPosition === "投手" && isPitcher) return 100;
  if (requestedPosition === "野手" && isFielder) return 100;
  
  // 具体的なポジションマッチング
  if (playerPositions.includes(requestedPosition)) return 100;
  
  // 部分マッチング
  const partialMatch = playerPositions.some(p => 
    p.includes(requestedPosition) || requestedPosition.includes(p)
  );
  if (partialMatch) return 70;
  
  return 30;
};

// メイン関数: 各チーム・各ラウンドごとに最適な選手を計算
export async function calculateDraftScores(
  round: number,
  teamId: number,
  availablePlayers: NormalizedPlayer[],
  draftHistory: DraftPick[],
  weightConfig: WeightConfig = {
    voteWeight: 40,
    teamNeedsWeight: 30,
    playerRatingWeight: 20,
    realismWeight: 10
  },
  draftYear: string = "2025",
  unfulfilled1stRoundNeeds?: Map<number, string[]>
): Promise<DraftScore[]> {
  // 投票データを取得
  const predictions = await fetchDraftPredictions(draftYear);
  
  const voteData: VoteData = {
    playerVotes: new Map(),
    positionVotes: new Map()
  };
  
  // 選手投票データを変換
  Object.entries(predictions.playerVotes).forEach(([key, votes]) => {
    voteData.playerVotes.set(key, votes.length);
  });
  
  // ポジション投票データを変換
  Object.entries(predictions.positionVotes).forEach(([key, votes]) => {
    voteData.positionVotes.set(key, votes.length);
  });
  
  // 最大投票数を計算
  const maxPlayerVotes = Math.max(...Array.from(voteData.playerVotes.values()), 1);
  const maxPositionVotes = Math.max(...Array.from(voteData.positionVotes.values()), 1);
  
  // スコア計算
  const scores: DraftScore[] = availablePlayers.map(player => {
    // レイヤー1: 投票データスコア
    const playerVoteKey = `${teamId}_${player.id}`;
    const playerVoteCount = voteData.playerVotes.get(playerVoteKey) || 0;
    const voteScore = (playerVoteCount / maxPlayerVotes) * 100;
    
    // レイヤー2: チームニーズマッチングスコア
    let teamNeedsScore = 0;
    const positionVoteKeys = Array.from(voteData.positionVotes.keys())
      .filter(key => key.startsWith(`${teamId}_${round}_`));
    
    if (positionVoteKeys.length > 0) {
      const positionScores = positionVoteKeys.map(key => {
        const position = key.split('_')[2];
        const votes = voteData.positionVotes.get(key) || 0;
        const matchScore = calculatePositionMatch(player.position, position);
        return (votes / maxPositionVotes) * matchScore;
      });
      teamNeedsScore = Math.max(...positionScores, 0);
    } else {
      // 投票データがない場合はデフォルト値
      teamNeedsScore = 50;
    }
    
    // 2位以降で、1位で取れなかったポジションを優先
    if (round === 2 && unfulfilled1stRoundNeeds && unfulfilled1stRoundNeeds.has(teamId)) {
      const unfulfilledPositions = unfulfilled1stRoundNeeds.get(teamId)!;
      for (const position of unfulfilledPositions) {
        const matchScore = calculatePositionMatch(player.position, position);
        if (matchScore === 100) {
          // 完全マッチの場合は+30点ボーナス
          teamNeedsScore = Math.min(100, teamNeedsScore + 30);
          break;
        } else if (matchScore >= 70) {
          // 部分マッチの場合は+15点ボーナス
          teamNeedsScore = Math.min(100, teamNeedsScore + 15);
          break;
        }
      }
    }
    
    // 0-100の範囲に正規化
    teamNeedsScore = Math.max(0, Math.min(100, teamNeedsScore));
    
    // レイヤー3: 選手評価スコア
    const playerRatingScore = evaluatePlayerRating(player.evaluations);
    
    // レイヤー4: 現実性調整スコア
    let rawRealismScore = 100;
    
    // 同じチームが最近同じポジションを指名していないかチェック
    const recentPicks = draftHistory
      .filter(pick => pick.teamId === teamId)
      .slice(-2); // 直近2指名をチェック
    
    const recentPositions = recentPicks
      .map(pick => availablePlayers.find(p => p.id === pick.playerId))
      .filter(p => p !== undefined)
      .flatMap(p => p!.position);
    
    const hasRecentSamePosition = player.position.some(pos => 
      recentPositions.includes(pos)
    );
    
    if (hasRecentSamePosition && recentPicks.length >= 2) {
      rawRealismScore -= 30; // 同じポジション連続指名でペナルティ
    }
    
    // 投手・野手バランス調整（1位から3位のみ）
    if (round >= 1 && round <= 3) {
      const top3Picks = draftHistory
        .filter(pick => pick.teamId === teamId && pick.round >= 1 && pick.round <= 3)
        .map(pick => {
          const p = availablePlayers.find(pl => pl.id === pick.playerId);
          return p;
        })
        .filter(p => p !== undefined);
      
      // 現在の選手が投手か野手かを判定
      const isCurrentPitcher = player.position.some(p => p === "投手" || p === "P");
      
      // 既に指名された選手のタイプをチェック
      const pickedTypes = top3Picks.map(p => {
        const isPitcher = p!.position.some(pos => pos === "投手" || pos === "P");
        return isPitcher ? 'pitcher' : 'fielder';
      });
      
      // 3連続同じタイプになるかチェック
      if (pickedTypes.length === 2) {
        const allSameType = pickedTypes.every(t => t === pickedTypes[0]);
        if (allSameType) {
          const currentType = isCurrentPitcher ? 'pitcher' : 'fielder';
          if (currentType === pickedTypes[0]) {
            rawRealismScore -= 40; // 3連続同じタイプでペナルティ
          }
        }
      }
    }
    
    // 70-100の範囲を0-100に正規化
    const realismScore = ((rawRealismScore - 70) / (100 - 70)) * 100;
    const normalizedRealismScore = Math.max(0, Math.min(100, realismScore));
    
    // 総合スコア計算（重み付け）
    const totalScore = 
      (voteScore * weightConfig.voteWeight / 100) +
      (teamNeedsScore * weightConfig.teamNeedsWeight / 100) +
      (playerRatingScore * weightConfig.playerRatingWeight / 100) +
      (normalizedRealismScore * weightConfig.realismWeight / 100);
    
    // 理由生成
    const reasons: string[] = [];
    if (voteScore > 60) reasons.push("高い投票支持");
    if (teamNeedsScore > 70) reasons.push("チームニーズと一致");
    if (playerRatingScore > 70) reasons.push("高評価選手");
    if (hasRecentSamePosition) reasons.push("同ポジション連続");
    
    const reason = reasons.length > 0 
      ? reasons.join("、") 
      : "バランス型選手";
    
    return {
      playerId: player.id,
      playerName: player.name,
      teamId,
      round,
      totalScore,
      breakdown: {
        voteScore,
        teamNeedsScore,
        playerRating: playerRatingScore,
        realismScore: normalizedRealismScore
      },
      reason
    };
  });
  
  // スコアの高い順にソート
  return scores.sort((a, b) => b.totalScore - a.totalScore);
}
