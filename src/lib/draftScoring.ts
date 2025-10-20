import { fetchDraftPredictions } from "./draftPredictions";

export interface ScoringWeights {
  voteScore: number;      // 投票データスコア (0-100)
  teamNeedsScore: number; // チームニーズマッチングスコア (0-100)
  playerRating: number;   // 選手評価スコア (0-100)
  realismAdjustment: number;   // 現実性調整 (-50 ~ +20)
}

export interface WeightConfig {
  voteWeight: number;      // デフォルト 50%
  teamNeedsWeight: number; // デフォルト 30%
  playerRatingWeight: number; // デフォルト 20%
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
  playerVotes: Map<string, number>; // key: "teamId_playerName_playerTeam_playerCategory"
  positionVotes: Map<string, number>; // key: "teamId_round_position"
}

// 評価文字列からスコアを計算
const evaluatePlayerRating = (evaluations: string[]): number => {
  if (!evaluations || evaluations.length === 0) return 50;
  
  // 順位評価の点数マッピング
  const rankScores: { [key: string]: number } = {
    '1位競合': 100,
    '1位一本釣り': 90,
    '外れ1位': 85,
    '2位': 80,
    '3位': 70,
    '4位': 60,
    '5位': 50,
    '6位以下': 45,
    '育成': 40
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
  
  // 40-100の範囲を0-100に正規化
  const normalizedScore = ((averageScore - 40) / (100 - 40)) * 100;
  
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
    voteWeight: 50,
    teamNeedsWeight: 30,
    playerRatingWeight: 20
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
  
  // 選手投票データを変換（選手名+チーム+カテゴリベースのキーに変更）
  predictions.playerVotes.forEach((teamVotes, playerId) => {
    teamVotes.forEach(({ teamId, count, playerName, playerTeam, playerCategory }) => {
      const key = `${teamId}_${playerName}_${playerTeam}_${playerCategory}`;
      voteData.playerVotes.set(key, count);
    });
  });
  
  // ポジション投票データを変換
  predictions.positionVotes.forEach((teamVotes, position) => {
    teamVotes.forEach(({ teamId, count, draftRound }) => {
      const key = `${teamId}_${draftRound}_${position}`;
      voteData.positionVotes.set(key, count);
    });
  });
  
  // 最大投票数を計算
  const maxPlayerVotes = Math.max(...Array.from(voteData.playerVotes.values()), 1);
  const maxPositionVotes = Math.max(...Array.from(voteData.positionVotes.values()), 1);
  
  // スコア計算
  const scores: DraftScore[] = availablePlayers.map(player => {
    // レイヤー1: 投票データスコア（選手名+チーム+カテゴリでマッチング）
    const playerVoteKey = `${teamId}_${player.name}_${player.team}_${player.category}`;
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
    
    // 現実性調整ルール（スコアに直接加算/減算）
    let realismAdjustment = 0;
    
    // 現在の選手が投手かどうかを判定
    const isCurrentPitcher = player.position.some(p => p === "投手" || p === "P");
    
    // このチームの全指名履歴を取得
    const teamPicks = draftHistory.filter(pick => pick.teamId === teamId);
    
    // 1. 同ポジション連続指名ペナルティ②（直近1指名）
    if (!isCurrentPitcher && teamPicks.length >= 1) {
      const lastPick = teamPicks[teamPicks.length - 1];
      const lastPlayer = availablePlayers.find(p => p.id === lastPick.playerId);
      
      if (lastPlayer) {
        const lastPositions = lastPlayer.position.filter(p => p !== "投手" && p !== "P");
        const hasDirectSamePosition = player.position.some(pos => 
          pos !== "投手" && pos !== "P" && lastPositions.includes(pos)
        );
        
        if (hasDirectSamePosition) {
          realismAdjustment -= 20; // 直前と同ポジションでペナルティ
        }
      }
    }
    
    // 2. 同ポジション連続指名ペナルティ（直近2指名）
    if (!isCurrentPitcher && teamPicks.length >= 2) {
      const recent2Picks = teamPicks.slice(-2);
      const recentPositions = recent2Picks
        .map(pick => availablePlayers.find(p => p.id === pick.playerId))
        .filter(p => p !== undefined)
        .flatMap(p => p!.position.filter(pos => pos !== "投手" && pos !== "P"));
      
      const hasRecent2SamePosition = player.position.some(pos => 
        pos !== "投手" && pos !== "P" && recentPositions.includes(pos)
      );
      
      if (hasRecent2SamePosition) {
        realismAdjustment -= 50; // 直近2指名で同ポジションがある場合の大きなペナルティ
      }
    }
    
    // 3. 投手・野手バランス調整（1位から3位のみ）
    if (round >= 1 && round <= 3) {
      const top3Picks = teamPicks.filter(pick => pick.round >= 1 && pick.round <= 3);
      
      if (top3Picks.length === 2) {
        // 既に2指名済みの場合、タイプをチェック
        const pickedTypes = top3Picks.map(pick => {
          const p = availablePlayers.find(pl => pl.id === pick.playerId);
          if (!p) return null;
          const isPitcher = p.position.some(pos => pos === "投手" || pos === "P");
          return isPitcher ? 'pitcher' : 'fielder';
        }).filter(t => t !== null);
        
        // 既に2人が同じタイプかチェック
        if (pickedTypes.length === 2 && pickedTypes[0] === pickedTypes[1]) {
          const currentType = isCurrentPitcher ? 'pitcher' : 'fielder';
          if (currentType === pickedTypes[0]) {
            realismAdjustment -= 50; // 3連続同じタイプでペナルティ
          }
        }
      }
    }
    
    // 4. カテゴリ調整（4位以降で高校生未指名の場合）
    if (round >= 4) {
      const top3Picks = teamPicks.filter(pick => pick.round >= 1 && pick.round <= 3);
      const hasHighSchoolInTop3 = top3Picks.some(pick => {
        const p = availablePlayers.find(pl => pl.id === pick.playerId);
        return p && p.category === "高校";
      });
      
      if (!hasHighSchoolInTop3 && player.category === "高校") {
        realismAdjustment += 20; // 高校生未指名の場合、高校生に加点
      }
    }
    
    // 総合スコア計算（重み付け + 現実性調整）
    const weightedScore = 
      (voteScore * weightConfig.voteWeight / 100) +
      (teamNeedsScore * weightConfig.teamNeedsWeight / 100) +
      (playerRatingScore * weightConfig.playerRatingWeight / 100);
    
    const totalScore = Math.max(0, Math.min(100, weightedScore + realismAdjustment));
    
    // 理由生成
    const reasons: string[] = [];
    if (voteScore > 60) reasons.push("高い投票支持");
    if (teamNeedsScore > 70) reasons.push("チームニーズと一致");
    if (playerRatingScore > 70) reasons.push("高評価選手");
    if (realismAdjustment < 0) reasons.push("現実性調整あり");
    
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
        realismAdjustment
      },
      reason
    };
  });
  
  // スコアの高い順にソート
  return scores.sort((a, b) => b.totalScore - a.totalScore);
}
