import { calculateDraftScores, DraftScore, NormalizedPlayer, DraftPick, WeightConfig } from "./draftScoring";

export interface LostPick {
  teamId: number;
  playerId: number;
  playerName: string;
  round: number;
  pickLabel?: string;
}

export interface SimulationResult {
  picks: DraftPick[];
  lostPicks: LostPick[];
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

// スコアに基づいて確率的に選手を選択する関数
function selectPlayerProbabilistically(
  scores: DraftScore[], 
  topN: number = 10
): number {
  if (scores.length === 0) return scores[0]?.playerId || 0;
  
  // 上位N名を取得（利用可能な選手数がtopNより少ない場合は全員）
  const topScores = scores.slice(0, Math.min(topN, scores.length));
  
  // スコアを重みとして正規化
  const totalWeight = topScores.reduce((sum, s) => sum + s.totalScore, 0);
  
  // 重みが0の場合は最上位を返す
  if (totalWeight === 0) return topScores[0].playerId;
  
  // 0-totalWeight の乱数を生成
  const random = Math.random() * totalWeight;
  
  // 累積重みで選手を選択
  let cumulativeWeight = 0;
  for (const score of topScores) {
    cumulativeWeight += score.totalScore;
    if (random <= cumulativeWeight) {
      return score.playerId;
    }
  }
  
  // フォールバック（通常ここには到達しない）
  return topScores[0].playerId;
}

export async function runDraftSimulation(
  allPlayers: NormalizedPlayer[],
  maxRounds: number = 10,
  weightConfig: WeightConfig,
  draftYear: string = "2025",
  onRoundComplete?: (round: number, partialResult: SimulationResult | null) => void,
  userTeamIds?: number[],
  onUserTeamPick?: (round: number, teamId: number, availablePlayers: NormalizedPlayer[]) => Promise<number>,
  onLotteryFound?: (lotteries: Array<{ playerName: string; team: string; position: string; competingTeamIds: number[]; winnerId: number }>) => Promise<void>,
  onPicksComplete?: (pickRound: number, picks: Array<{teamId: number; playerId: number; playerName: string}>, availablePlayers: NormalizedPlayer[], hasContest: boolean) => Promise<void>
): Promise<SimulationResult> {
  const picks: DraftPick[] = [];
  const lostPicks: LostPick[] = [];
  const summary: SimulationResult["summary"] = [];
  let availablePlayers = [...allPlayers];
  
  for (let round = 1; round <= maxRounds; round++) {
    const waiverOrder = getWaiverOrder(round);
    
    // 1巡目は抽選制（全球団が全選手から選択可能）
    if (round === 1) {
      let remainingTeams = [...waiverOrder]; // 指名する球団リスト
      let pickRound = 1; // 1位、外れ1位、外れ2位...のカウンター
      
      // 外れ1位、外れ2位...を繰り返し処理
      while (remainingTeams.length > 0) {
        const currentRoundPicks: { teamId: number; playerId: number }[] = [];
        
        // 現在のラウンドで全球団が選手を選択（競合を許可）
        for (const teamId of remainingTeams) {
          if (availablePlayers.length === 0) break;
          
          let selectedPlayerId: number;
          
          // ユーザーが操作する球団の場合
          if (userTeamIds && userTeamIds.includes(teamId) && onUserTeamPick) {
            selectedPlayerId = await onUserTeamPick(round, teamId, availablePlayers);
          } else {
            // AI球団：全選手からスコアリングして選択
            const scores = await calculateDraftScores(
              round,
              teamId,
              availablePlayers,
              picks,
              weightConfig,
              draftYear
            );
            
            if (scores.length === 0) break;
            
            // スコアに基づいて確率的に選手を選択
            selectedPlayerId = selectPlayerProbabilistically(scores, 10);
          }
          
          currentRoundPicks.push({ teamId, playerId: selectedPlayerId });
        }
        
        // 競合処理：同じ選手を複数球団が指名した場合、抽選で決定
        const playerToTeams = new Map<number, number[]>();
        currentRoundPicks.forEach(pick => {
          if (!playerToTeams.has(pick.playerId)) {
            playerToTeams.set(pick.playerId, []);
          }
          playerToTeams.get(pick.playerId)!.push(pick.teamId);
        });
        
        // 当選した球団と外れた球団を記録
        const winningPicks = new Map<number, { teamId: number; isContested: boolean; contestedTeams: number[] }>();
        const losingTeams: number[] = [];
        const currentLotteries: Array<{ playerName: string; team: string; position: string; competingTeamIds: number[]; winnerId: number }> = [];
        
        playerToTeams.forEach((teams, playerId) => {
          if (teams.length === 1) {
            // 競合なし：そのまま決定
            winningPicks.set(playerId, { teamId: teams[0], isContested: false, contestedTeams: [] });
          } else {
            // 競合あり：抽選で決定
            const winnerIndex = Math.floor(Math.random() * teams.length);
            const winner = teams[winnerIndex];
            winningPicks.set(playerId, { teamId: winner, isContested: true, contestedTeams: teams });
            
            // 抽選情報を記録
            const player = availablePlayers.find(p => p.id === playerId);
            if (player) {
              const positionStr = Array.isArray(player.position) ? player.position.join("、") : player.position;
              currentLotteries.push({
                playerName: player.name,
                team: player.team,
                position: positionStr,
                competingTeamIds: teams,
                winnerId: winner
              });
            }
            
            // 外れた球団を記録（lostPicksに追加）
            teams.forEach((t, i) => {
              if (i !== winnerIndex) {
                losingTeams.push(t);
                // 外れた選手として記録
                const lostPlayer = availablePlayers.find(p => p.id === playerId);
                if (lostPlayer) {
                  const lostLabel = pickRound === 1 ? "1位" : `外れ${pickRound - 1}位`;
                  lostPicks.push({
                    teamId: t,
                    playerId,
                    playerName: lostPlayer.name,
                    round,
                    pickLabel: lostLabel
                  });
                }
              }
            });
          }
        });
        
        // 全球団の指名が完了したことを通知（競合情報も含める）
        if (onPicksComplete) {
          const picksWithNames = currentRoundPicks.map(pick => {
            const player = availablePlayers.find(p => p.id === pick.playerId);
            return {
              teamId: pick.teamId,
              playerId: pick.playerId,
              playerName: player?.name || ""
            };
          });
          await onPicksComplete(pickRound, picksWithNames, availablePlayers, currentLotteries.length > 0);
        }
        
        // 抽選アニメーションがある場合は表示
        if (currentLotteries.length > 0 && onLotteryFound) {
          await onLotteryFound(currentLotteries);
        }
        
        // 当選した指名をpicksに追加し、選手をavailablePlayersから除外
        for (const [playerId, pickInfo] of winningPicks) {
          const selectedPlayer = availablePlayers.find(p => p.id === playerId);
          if (!selectedPlayer) continue;
          
          const scores = await calculateDraftScores(
            round,
            pickInfo.teamId,
            availablePlayers,
            picks,
            weightConfig,
            draftYear
          );
          const topScore = scores.find(s => s.playerId === playerId) || scores[0];
          
          // ラベルを生成（1位、外れ1位、外れ2位...）
          let label = "";
          if (pickRound === 1) {
            label = "1位";
          } else {
            label = `外れ${pickRound - 1}位`;
          }
          
          const newPick: DraftPick = {
            teamId: pickInfo.teamId,
            playerId: selectedPlayer.id,
            playerName: selectedPlayer.name,
            round,
            isContested: pickInfo.isContested,
            contestedTeams: pickInfo.contestedTeams,
            pickLabel: label
          };
          
          picks.push(newPick);
          summary.push({
            round,
            teamId: pickInfo.teamId,
            playerId: selectedPlayer.id,
            playerName: selectedPlayer.name,
            score: topScore
          });
          
          // 指名済み選手を除外
          availablePlayers = availablePlayers.filter(p => p.id !== selectedPlayer.id);
        }
        
        // 次のラウンドは外れた球団のみ
        remainingTeams = losingTeams;
        pickRound++;
        
        // 選手がいなくなったら終了
        if (availablePlayers.length === 0) break;
      }
    } else {
      // 2巡目以降：ウェーバー方式（逐次処理）
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
          // AIが自動で選択（確率的選択）
          const scores = await calculateDraftScores(
            round,
            teamId,
            availablePlayers,
            picks,
            weightConfig,
            draftYear
          );
          
          if (scores.length === 0) break;
          
          // スコアに基づいて確率的に選手を選択
          selectedPlayerId = selectPlayerProbabilistically(scores, 10);
          
          // 選択された選手のスコア情報を取得
          topScore = scores.find(s => s.playerId === selectedPlayerId) || scores[0];
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
    }
    
    // ラウンド完了コールバック
    if (onRoundComplete) {
      onRoundComplete(round, { picks, lostPicks, summary });
    }
    
    if (availablePlayers.length === 0) break;
  }
  
  return { picks, lostPicks, summary };
}
