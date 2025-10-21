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

// 固定指名（実際に指名を公表している球団）
const FIXED_FIRST_ROUND_PICKS: Record<number, string> = {
  3: "小島大河",  // 西武ライオンズ
  12: "立石正広"  // 広島カープ
};

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
  round: number,
  topN: number = 10
): number {
  if (scores.length === 0) return scores[0]?.playerId || 0;
  
  // ドラフト1位の場合は上位5名に絞る
  const effectiveTopN = round === 1 ? Math.min(5, topN) : topN;
  
  // 上位N名を取得（利用可能な選手数がtopNより少ない場合は全員）
  let topScores = scores.slice(0, Math.min(effectiveTopN, scores.length));
  
  // トップスコアの80%以下の選手を除外
  if (topScores.length > 0) {
    const topScore = topScores[0].totalScore;
    const threshold = topScore * 0.8;
    topScores = topScores.filter(s => s.totalScore >= threshold);
    
    // フィルタ後に選手がいない場合は最上位を返す
    if (topScores.length === 0) return scores[0].playerId;
  }
  
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
  onPicksComplete?: (pickRound: number, picks: Array<{teamId: number; playerId: number; playerName: string}>, lostPicks: Array<{teamId: number; playerId: number; playerName: string}>, availablePlayers: NormalizedPlayer[], hasContest: boolean) => Promise<void>,
  onSinglePickComplete?: (round: number, teamId: number, pick: { playerId: number; playerName: string; playerTeam: string; playerPosition: string }, partialResult: SimulationResult) => Promise<{ shouldContinue: boolean }>,
  startFromRound: number = 1,
  existingPicks: DraftPick[] = [],
  existingLostPicks: LostPick[] = [],
  startFromTeamIndex: number = 0
): Promise<SimulationResult> {
  const picks: DraftPick[] = [...existingPicks];
  const lostPicks: LostPick[] = [...existingLostPicks];
  const summary: SimulationResult["summary"] = [];
  
  const pickedPlayerIds = new Set(existingPicks.map(p => p.playerId));
  let availablePlayers = allPlayers.filter(p => !pickedPlayerIds.has(p.id));
  let unfulfilled1stRoundNeeds = new Map<number, string[]>();
  
  for (let round = startFromRound; round <= maxRounds; round++) {
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
            // 固定指名のチェック（第1ラウンド（1位指名）のみ、外れ1位以降は通常スコアリング）
            const fixedPlayerName = pickRound === 1 ? FIXED_FIRST_ROUND_PICKS[teamId] : undefined;
            let fixedPlayer: NormalizedPlayer | undefined;
            
            if (fixedPlayerName) {
              // 名前のスペースを除去して比較（表記揺れ対策）
              const normalizedFixedName = fixedPlayerName.replace(/\s+/g, '');
              fixedPlayer = availablePlayers.find(p => p.name.replace(/\s+/g, '') === normalizedFixedName);
              if (fixedPlayer) {
                selectedPlayerId = fixedPlayer.id;
              } else {
                console.warn(`固定指名の選手 ${fixedPlayerName} が見つかりません（球団ID: ${teamId}）`);
              }
            }
            
            // 固定指名がない、または選手が見つからない場合は通常のAI指名
            if (!fixedPlayer) {
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
              selectedPlayerId = selectPlayerProbabilistically(scores, round, 10);
            }
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
        
        // picksへの追加が完了した後にシミュレーション結果を表示
        if (onPicksComplete) {
          const confirmedPicks = picks
            .filter(p => p.round === round && p.pickLabel === (pickRound === 1 ? "1位" : `外れ${pickRound - 1}位`))
            .map(p => ({
              teamId: p.teamId,
              playerId: p.playerId,
              playerName: p.playerName
            }));
          
          const confirmedLostPicks = lostPicks
            .filter(p => p.round === round && p.pickLabel === (pickRound === 1 ? "1位" : `外れ${pickRound - 1}位`))
            .map(p => ({
              teamId: p.teamId,
              playerId: p.playerId,
              playerName: p.playerName
            }));
          
          await onPicksComplete(pickRound, confirmedPicks, confirmedLostPicks, availablePlayers, currentLotteries.length > 0);
        }
        
        // 次のラウンドは外れた球団のみ
        remainingTeams = losingTeams;
        pickRound++;
        
        // 選手がいなくなったら終了
        if (availablePlayers.length === 0) break;
      }
      
      // 1位指名完了後、各球団の未充足ニーズを計算
      const unfulfilled1stRoundNeeds = new Map<number, string[]>();
      
      for (const teamId of teams.map(t => t.id)) {
        // 1位指名時のポジション投票データを取得
        const predictions = await import("./draftPredictions").then(m => m.fetchDraftPredictions(draftYear));
        const positionVotes = predictions.positionVotes;
        
        const teamPositionVotes: { position: string; votes: number }[] = [];
        Object.entries(positionVotes).forEach(([key, votes]) => {
          const [voteTeamId, voteRound, position] = key.split('_');
          if (parseInt(voteTeamId) === teamId && voteRound === "1") {
            teamPositionVotes.push({ position, votes: votes.length });
          }
        });
        
        // 投票数でソートし、スコアが70以上相当のポジションを取得
        teamPositionVotes.sort((a, b) => b.votes - a.votes);
        const maxVotes = Math.max(...teamPositionVotes.map(v => v.votes), 1);
        const highNeedPositions = teamPositionVotes
          .filter(v => (v.votes / maxVotes) * 100 >= 70)
          .map(v => v.position);
        
        // 1位で指名した選手のポジションを取得
        const firstRoundPick = picks.find(p => p.teamId === teamId && p.round === 1);
        if (firstRoundPick) {
          const pickedPlayer = allPlayers.find(p => p.id === firstRoundPick.playerId);
          const pickedPositions = pickedPlayer?.position || [];
          
          // 高ニーズポジションのうち、指名した選手のポジションと一致しないものを記録
          const unfulfilled = highNeedPositions.filter(needPos => {
            // 完全マッチまたは部分マッチをチェック
            const isMatched = pickedPositions.some(pickedPos => {
              if (needPos === "投手" && (pickedPos === "投手" || pickedPos === "P")) return true;
              if (needPos === "野手" && pickedPos !== "投手" && pickedPos !== "P") return true;
              if (pickedPos === needPos) return true;
              if (pickedPos.includes(needPos) || needPos.includes(pickedPos)) return true;
              return false;
            });
            return !isMatched;
          });
          
          if (unfulfilled.length > 0) {
            unfulfilled1stRoundNeeds.set(teamId, unfulfilled);
          }
        }
      }
    } else {
      // 2巡目以降：ウェーバー方式（逐次処理）
      const startIndex = round === startFromRound ? startFromTeamIndex : 0;
      for (let i = startIndex; i < waiverOrder.length; i++) {
        const teamId = waiverOrder[i];
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
            draftYear,
            unfulfilled1stRoundNeeds
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
            draftYear,
            unfulfilled1stRoundNeeds
          );
          
          if (scores.length === 0) break;
          
          // スコアに基づいて確率的に選手を選択
          selectedPlayerId = selectPlayerProbabilistically(scores, round, 10);
          
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
        
        // 2巡目以降の各指名後にコールバックを呼び出し
        if (onSinglePickComplete) {
          const result = await onSinglePickComplete(round, teamId, {
            playerId: selectedPlayer.id,
            playerName: selectedPlayer.name,
            playerTeam: selectedPlayer.team,
            playerPosition: Array.isArray(selectedPlayer.position) ? selectedPlayer.position[0] : selectedPlayer.position
          }, { picks, lostPicks, summary });
          
          // shouldContinueがfalseの場合、シミュレーションを中断
          if (result && !result.shouldContinue) {
            return { picks, lostPicks, summary };
          }
        }
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
