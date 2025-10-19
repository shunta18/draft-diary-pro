import { calculateDraftScores, DraftScore, NormalizedPlayer, DraftPick, WeightConfig } from "./draftScoring";

export interface SimulationResult {
  picks: DraftPick[];
  summary: {
    round: number;
    teamId: number;
    playerId: number;
    playerName: string;
    score: DraftScore;
  }[];
}

const teams = [
  { id: 1, name: "北海道日本ハムファイターズ" },
  { id: 2, name: "東北楽天ゴールデンイーグルス" },
  { id: 3, name: "埼玉西武ライオンズ" },
  { id: 4, name: "千葉ロッテマリーンズ" },
  { id: 5, name: "オリックス・バファローズ" },
  { id: 6, name: "福岡ソフトバンクホークス" },
  { id: 7, name: "読売ジャイアンツ" },
  { id: 8, name: "東京ヤクルトスワローズ" },
  { id: 9, name: "横浜DeNAベイスターズ" },
  { id: 10, name: "中日ドラゴンズ" },
  { id: 11, name: "阪神タイガース" },
  { id: 12, name: "広島東洋カープ" },
];

// 1位指名順（抽選により決定されると仮定）
const firstRoundOrder = [6, 11, 1, 9, 5, 7, 2, 10, 3, 12, 4, 8];

// ウェーバー方式の指名順（2位以降）
const oddRoundOrder = [6, 11, 1, 9, 5, 7, 2, 10, 3, 12, 4, 8];
const evenRoundOrder = [8, 4, 12, 3, 10, 2, 7, 5, 9, 1, 11, 6];

const getWaiverOrder = (round: number) => {
  if (round === 1) return firstRoundOrder;
  return round % 2 === 1 ? oddRoundOrder : evenRoundOrder;
};

export async function runDraftSimulation(
  allPlayers: NormalizedPlayer[],
  maxRounds: number = 10,
  weightConfig: WeightConfig,
  draftYear: string = "2025",
  onRoundComplete?: (round: number, partialResult: SimulationResult | null) => void,
  userTeamIds?: number[],
  onUserTeamPick?: (round: number, teamId: number, availablePlayers: NormalizedPlayer[]) => Promise<number>
): Promise<SimulationResult> {
  const picks: DraftPick[] = [];
  const summary: SimulationResult["summary"] = [];
  let availablePlayers = [...allPlayers];
  
  for (let round = 1; round <= maxRounds; round++) {
    const waiverOrder = getWaiverOrder(round);
    
    for (const teamId of waiverOrder) {
      if (availablePlayers.length === 0) break;
      
      let selectedPlayerId: number;
      let topScore: any;
      
      // ユーザーが操作する球団の場合
      if (userTeamIds && userTeamIds.includes(teamId) && onUserTeamPick) {
        selectedPlayerId = await onUserTeamPick(round, teamId, availablePlayers);
        
        // スコアを計算（表示用）
        const scores = await calculateDraftScores(
          round,
          teamId,
          availablePlayers,
          picks,
          weightConfig,
          draftYear
        );
        topScore = scores.find(s => s.playerId === selectedPlayerId) || scores[0];
      } else {
        // AIが自動で選択
        const scores = await calculateDraftScores(
          round,
          teamId,
          availablePlayers,
          picks,
          weightConfig,
          draftYear
        );
        
        if (scores.length === 0) break;
        
        topScore = scores[0];
        selectedPlayerId = topScore.playerId;
      }
      
      const selectedPlayer = availablePlayers.find(p => p.id === selectedPlayerId);
      
      if (!selectedPlayer) break;
      
      const newPick: DraftPick = {
        teamId,
        playerId: selectedPlayer.id,
        playerName: selectedPlayer.name,
        round
      };
      
      picks.push(newPick);
      summary.push({
        round,
        teamId,
        playerId: selectedPlayer.id,
        playerName: selectedPlayer.name,
        score: topScore
      });
      
      // 指名済み選手を除外
      availablePlayers = availablePlayers.filter(p => p.id !== selectedPlayer.id);
    }
    
    // ラウンド完了コールバック
    if (onRoundComplete) {
      onRoundComplete(round, { picks, summary });
    }
    
    if (availablePlayers.length === 0) break;
  }
  
  return { picks, summary };
}
