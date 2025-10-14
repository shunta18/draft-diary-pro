import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayerSelectionDialog } from "@/components/PlayerSelectionDialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getDefaultPlayers, Player as LocalPlayer } from "@/lib/playerStorage";
import { Shuffle, Trophy, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Footer } from "@/components/Footer";

// Supabaseから取得した生データの型
interface RawSupabasePlayer {
  id: number;
  name: string;
  team: string;
  position: string;
  category: string;
  evaluations: string[];
  year?: number;
  batting_hand?: string;
  throwing_hand?: string;
  hometown?: string;
  age?: number;
}

// 正規化後の型（LocalPlayerと互換性を持たせる）
interface NormalizedPlayer {
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

type PlayerData = NormalizedPlayer;

const teams = [
  { id: 1, name: "北海道日本ハムファイターズ", shortName: "日本ハム", color: "from-blue-600 to-blue-800" },
  { id: 2, name: "東北楽天ゴールデンイーグルス", shortName: "楽天", color: "from-red-700 to-red-900" },
  { id: 3, name: "埼玉西武ライオンズ", shortName: "西武", color: "from-blue-500 to-blue-700" },
  { id: 4, name: "千葉ロッテマリーンズ", shortName: "ロッテ", color: "from-gray-800 to-black" },
  { id: 5, name: "オリックス・バファローズ", shortName: "オリックス", color: "from-blue-600 to-gray-800" },
  { id: 6, name: "福岡ソフトバンクホークス", shortName: "ソフトバンク", color: "from-yellow-500 to-yellow-700" },
  { id: 7, name: "読売ジャイアンツ", shortName: "巨人", color: "from-orange-500 to-orange-700" },
  { id: 8, name: "東京ヤクルトスワローズ", shortName: "ヤクルト", color: "from-green-600 to-green-800" },
  { id: 9, name: "横浜DeNAベイスターズ", shortName: "DeNA", color: "from-blue-500 to-blue-700" },
  { id: 10, name: "中日ドラゴンズ", shortName: "中日", color: "from-blue-700 to-blue-900" },
  { id: 11, name: "阪神タイガース", shortName: "阪神", color: "from-yellow-500 to-yellow-700" },
  { id: 12, name: "広島東洋カープ", shortName: "広島", color: "from-red-600 to-red-800" },
];

// ウェーバー方式の指名順（2位以降）
// 支配下ドラフト指名順
// 奇数ラウンド（1位、3位、5位...）: ソフトバンク、阪神、日ハム、DeNA、オリックス、巨人、楽天、中日、西武、広島、ロッテ、ヤクルト
const oddRoundOrder = [6, 11, 1, 9, 5, 7, 2, 10, 3, 12, 4, 8];
// 偶数ラウンド（2位、4位...）: ヤクルト、ロッテ、広島、西武、中日、楽天、巨人、オリックス、DeNA、日ハム、阪神、ソフトバンク
const evenRoundOrder = [8, 4, 12, 3, 10, 2, 7, 5, 9, 1, 11, 6];

// 育成ドラフト指名順
// 育成奇数ラウンド（育成1位、育成3位...）: ヤクルト、ロッテ、広島、西武、中日、楽天、巨人、オリックス、DeNA、日ハム、阪神、ソフトバンク
const devOddRoundOrder = [8, 4, 12, 3, 10, 2, 7, 5, 9, 1, 11, 6];
// 育成偶数ラウンド（育成2位、育成4位...）: ソフトバンク、阪神、日ハム、DeNA、オリックス、巨人、楽天、中日、西武、広島、ロッテ、ヤクルト
const devEvenRoundOrder = [6, 11, 1, 9, 5, 7, 2, 10, 3, 12, 4, 8];

// 指名順を取得する関数
const getWaiverOrder = (round: number, isDev: boolean = false) => {
  if (isDev) {
    return round % 2 === 1 ? devOddRoundOrder : devEvenRoundOrder;
  }
  return round % 2 === 1 ? oddRoundOrder : evenRoundOrder;
};

// 表示順（固定）: 阪神、DeNA、巨人、中日、広島、ヤクルト、ソフトバンク、日ハム、オリックス、楽天、西武、ロッテ
const displayOrder = [11, 9, 7, 10, 12, 8, 6, 1, 5, 2, 3, 4];

interface TeamSelection {
  teamId: number;
  playerId: number | null;
  playerName: string | null;
}

interface RoundSelection {
  teamId: number;
  playerId: number | null;
  playerName: string | null;
}

interface LotteryResult {
  playerId: number;
  playerName: string;
  competingTeams: number[];
  winner: number;
  losers: number[];
}

interface FinalSelection {
  teamId: number;
  playerId: number;
  playerName: string;
  round: number;
}

interface DraftPick {
  teamId: number;
  playerId: number;
  playerName: string;
  round: number;
}

// データ正規化関数
const normalizeSupabasePlayer = (player: RawSupabasePlayer): NormalizedPlayer => ({
  ...player,
  position: [player.position],
  draftYear: player.year?.toString() || "",
  videoLinks: [],
});

const normalizeLocalPlayer = (player: LocalPlayer): NormalizedPlayer => ({
  id: player.id,
  name: player.name,
  team: player.team,
  position: player.position,
  category: player.category,
  evaluations: player.evaluations,
  year: player.draftYear ? parseInt(player.draftYear) : undefined,
  draftYear: player.draftYear,
  batting_hand: player.battingThrowing?.split('投')[1]?.replace('打', ''),
  throwing_hand: player.battingThrowing?.split('投')[0],
  hometown: player.hometown,
  age: player.age,
  memo: player.memo,
  videoLinks: player.videoLinks,
});

const VirtualDraft = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [players, setPlayers] = useState<NormalizedPlayer[]>([]);
  const [selections, setSelections] = useState<TeamSelection[]>(
    teams.map(team => ({ 
      teamId: team.id, 
      playerId: team.id === 12 ? 2 : null, // 広島カープ(12)は立石選手(2)をデフォルト選択
      playerName: team.id === 12 ? "立石 正広" : null
    }))
  );
  const [currentRound, setCurrentRound] = useState(1);
  const [roundSelections, setRoundSelections] = useState<RoundSelection[]>([]);
  const [allRoundResults, setAllRoundResults] = useState<LotteryResult[][]>([]);
  const [finalSelections, setFinalSelections] = useState<FinalSelection[]>([]);
  const [allDraftPicks, setAllDraftPicks] = useState<DraftPick[]>([]);
  const [currentWaiverIndex, setCurrentWaiverIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [maxRounds, setMaxRounds] = useState(10); // 各球団の基本指名人数
  const [isDevelopmentDraft, setIsDevelopmentDraft] = useState(false); // 育成ドラフトフラグ
  const [finishedTeams, setFinishedTeams] = useState<Set<number>>(new Set()); // 選択終了した球団
  const MAX_TOTAL_PICKS = 120; // 全体の上限

  useEffect(() => {
    loadPlayers();
  }, [user]);

  const loadPlayers = async () => {
    try {
      if (user) {
        // ログインユーザーはSupabaseから取得
        const { data, error } = await supabase
          .from("players")
          .select("*")
          .eq("year", 2025)
          .order("name");
        
        if (error) throw error;
        const normalized = (data || []).map(normalizeSupabasePlayer);
        setPlayers(normalized);
      } else {
        // ゲストユーザーは最新のサンプルデータを表示
        const localPlayers = getDefaultPlayers();
        const normalized = localPlayers
          .map(normalizeLocalPlayer)
          .filter(p => p.draftYear === "2025");
        setPlayers(normalized);
      }
    } catch (error) {
      console.error("Failed to load players:", error);
      toast({
        title: "エラー",
        description: "選手データの読み込みに失敗しました",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerSelect = (teamId: number, playerId: number | null) => {
    // 1位指名の抽選フェーズ（全球団が確定するまで）- 支配下ドラフトのみ
    if (finalSelections.length < teams.length && !isDevelopmentDraft) {
      // 第1次選択
      if (currentRound === 1) {
        setSelections(prev => 
          prev.map(sel => 
            sel.teamId === teamId 
              ? { 
                  ...sel, 
                  playerId, 
                  playerName: playerId ? players.find(p => p.id === playerId)?.name || null : null 
                }
              : sel
          )
        );
      } else {
        // 第2次以降の選択（抽選外れた球団のみ）
        setRoundSelections(prev => {
          const existing = prev.find(s => s.teamId === teamId);
          if (existing) {
            return prev.map(s => 
              s.teamId === teamId 
                ? { ...s, playerId, playerName: playerId ? players.find(p => p.id === playerId)?.name || null : null }
                : s
            );
          } else {
            return [...prev, { 
              teamId, 
              playerId, 
              playerName: playerId ? players.find(p => p.id === playerId)?.name || null : null 
            }];
          }
        });
      }
    } else {
      // 2位以降（または育成ドラフト）はウェーバー方式なので、現在指名中の球団のみ選択可能
      const waiverOrder = getWaiverOrder(currentRound, isDevelopmentDraft);
      const currentPickingTeamId = waiverOrder[currentWaiverIndex];
      if (teamId === currentPickingTeamId && playerId) {
        const player = players.find(p => p.id === playerId);
        if (player) {
          const newPick: DraftPick = {
            teamId,
            playerId,
            playerName: player.name,
            round: currentRound,
          };
          setAllDraftPicks(prev => [...prev, newPick]);
          
          // 次の指名へ（選択終了していない球団のみスキップ）
          let nextIndex = currentWaiverIndex + 1;
          const updatedFinished = new Set(finishedTeams);
          while (nextIndex < waiverOrder.length && updatedFinished.has(waiverOrder[nextIndex])) {
            nextIndex++;
          }
          
          if (nextIndex < waiverOrder.length) {
            setCurrentWaiverIndex(nextIndex);
          } else {
            // ラウンド終了
            const updatedPicks = [...allDraftPicks, newPick];
            const actualCount = updatedPicks.filter(p => {
              const pl = players.find(plr => plr.id === p.playerId);
              return pl?.category !== "独立リーグ";
            }).length;
            
            // 各球団の指名数チェック
            const teamPickCounts = new Map<number, number>();
            updatedPicks.forEach(pick => {
              teamPickCounts.set(pick.teamId, (teamPickCounts.get(pick.teamId) || 0) + 1);
            });
            
            // 全球団が選択終了したかチェック
            const allFinished = teams.every(t => updatedFinished.has(t.id));
            
            if (allFinished || actualCount >= MAX_TOTAL_PICKS) {
              // ドラフト終了
              if (actualCount < MAX_TOTAL_PICKS && !isDevelopmentDraft) {
                setIsDevelopmentDraft(true);
                setFinishedTeams(new Set()); // 育成ドラフト用にリセット（全球団が再び選択可能に）
                setCurrentRound(1);
                setCurrentWaiverIndex(0);
                toast({
                  title: "新人選手選択会議終了",
                  description: `育成選手選択会議を開始します（残り枠: ${MAX_TOTAL_PICKS - actualCount}名）`,
                });
              } else {
                toast({
                  title: "ドラフト終了",
                  description: "すべての指名が完了しました",
                });
              }
            } else {
              // 次のラウンドへ
              const nextRound = currentRound + 1;
              setCurrentRound(nextRound);
              
              // 次のラウンドの指名順を取得
              const nextWaiverOrder = getWaiverOrder(nextRound, isDevelopmentDraft);
              
              // 選択終了していない最初のチームを探す（updatedFinishedを使用）
              let nextStartIndex = 0;
              while (nextStartIndex < nextWaiverOrder.length && 
                     updatedFinished.has(nextWaiverOrder[nextStartIndex])) {
                nextStartIndex++;
              }
              
              setCurrentWaiverIndex(nextStartIndex);
              
              toast({
                title: `${currentRound}位指名終了`,
                description: `${nextRound}位指名を開始します`,
              });
            }
          }
        }
      }
    }
  };

  const executeLottery = () => {
    const selectionsToUse = currentRound === 1 ? selections : roundSelections;
    const playerCounts = new Map<number, number[]>();
    
    // 未確定の球団の選択のみを抽出
    const undecidedTeams = teams.map(t => t.id).filter(teamId => 
      !finalSelections.find(fs => fs.teamId === teamId)
    );
    
    selectionsToUse.forEach(sel => {
      if (sel.playerId && undecidedTeams.includes(sel.teamId)) {
        const teams = playerCounts.get(sel.playerId) || [];
        teams.push(sel.teamId);
        playerCounts.set(sel.playerId, teams);
      }
    });

    const results: LotteryResult[] = [];
    const newFinalSelections: FinalSelection[] = [...finalSelections];
    
    playerCounts.forEach((competingTeams, playerId) => {
      const player = players.find(p => p.id === playerId);
      
      if (competingTeams.length > 1) {
        const winner = competingTeams[Math.floor(Math.random() * competingTeams.length)];
        const losers = competingTeams.filter(t => t !== winner);
        results.push({
          playerId,
          playerName: player?.name || "不明",
          competingTeams,
          winner,
          losers,
        });
        
        newFinalSelections.push({
          teamId: winner,
          playerId,
          playerName: player?.name || "不明",
          round: currentRound,
        });
      } else {
        // 単独指名
        newFinalSelections.push({
          teamId: competingTeams[0],
          playerId,
          playerName: player?.name || "不明",
          round: currentRound,
        });
      }
    });

    setAllRoundResults(prev => [...prev, results]);
    setFinalSelections(newFinalSelections);

    // 全12球団の1位指名が確定したかチェック
    if (newFinalSelections.length === teams.length) {
      // 1位指名の全選手をallDraftPicksに追加
      const firstRoundPicks: DraftPick[] = newFinalSelections.map(sel => ({
        teamId: sel.teamId,
        playerId: sel.playerId,
        playerName: sel.playerName,
        round: 1,
      }));
      setAllDraftPicks(firstRoundPicks);

      // 2位指名へ進む
      setCurrentRound(2);
      setCurrentWaiverIndex(0);
      setRoundSelections([]);
      toast({
        title: `1位指名完了`,
        description: `全球団の1位指名が確定しました。2位指名をウェーバー方式で開始します。`,
      });
    } else {
      // まだ確定していない球団がある場合は次の選択へ
      setCurrentRound(prev => prev + 1);
      setRoundSelections([]);
      toast({
        title: `第${currentRound}次選択抽選完了`,
        description: `${results.length > 0 ? `${results.length}名の選手について抽選を実施しました。` : ''}第${currentRound + 1}次選択を開始してください。`,
      });
    }
  };

  const getTeamName = (teamId: number) => {
    return teams.find(t => t.id === teamId)?.name || "";
  };

  const getTeamStatus = (teamId: number) => {
    const finalSelection = finalSelections.find(fs => fs.teamId === teamId);
    if (finalSelection) {
      return { decided: true, playerName: finalSelection.playerName, round: finalSelection.round };
    }
    return { decided: false, playerName: null, round: currentRound };
  };

  const getUndecidedTeams = () => {
    return teams.filter(team => !finalSelections.find(fs => fs.teamId === team.id));
  };

  const getSelectedPlayerIds = () => {
    // 1位指名の抽選フェーズ中は finalSelections から取得
    if (finalSelections.length < teams.length) {
      return finalSelections.map(fs => fs.playerId);
    }
    // 2位以降は allDraftPicks から取得
    return allDraftPicks.map(pick => pick.playerId);
  };

  // 120名カウント（独立リーグ選手を除外）
  const getActualPickCount = () => {
    return allDraftPicks.filter(pick => {
      const player = players.find(p => p.id === pick.playerId);
      return player?.category !== "独立リーグ";
    }).length;
  };
  
  const getTeamPicks = (teamId: number) => {
    return allDraftPicks.filter(pick => pick.teamId === teamId).sort((a, b) => a.round - b.round);
  };
  
  const getCurrentPickingTeam = () => {
    if (currentRound === 1 && !isDevelopmentDraft) return null;
    const waiverOrder = getWaiverOrder(currentRound, isDevelopmentDraft);
    return waiverOrder[currentWaiverIndex];
  };

  const getCurrentRoundSelection = (teamId: number) => {
    if (currentRound === 1) {
      return selections.find(s => s.teamId === teamId);
    } else {
      return roundSelections.find(s => s.teamId === teamId);
    }
  };

  const getLostPlayers = (teamId: number) => {
    const lostPlayers: { playerName: string; round: number }[] = [];
    allRoundResults.forEach((roundResults, roundIndex) => {
      roundResults.forEach(result => {
        if (result.losers.includes(teamId)) {
          lostPlayers.push({
            playerName: result.playerName,
            round: roundIndex + 1,
          });
        }
      });
    });
    return lostPlayers;
  };

  const canExecuteLottery = () => {
    // 1位指名が全球団確定するまでは抽選可能
    if (finalSelections.length >= teams.length) return false;
    
    const undecidedTeams = teams.filter(team => !finalSelections.find(fs => fs.teamId === team.id));
    
    if (currentRound === 1) {
      return selections.every(sel => sel.playerId !== null);
    } else {
      return undecidedTeams.every(team => 
        roundSelections.find(rs => rs.teamId === team.id && rs.playerId !== null)
      );
    }
  };

  const isDraftComplete = getActualPickCount() >= MAX_TOTAL_PICKS || teams.every(t => finishedTeams.has(t.id));
  
  const handleTeamFinish = (teamId: number) => {
    if (window.confirm(`${teams.find(t => t.id === teamId)?.name}は選択終了しますか？`)) {
      setFinishedTeams(prev => new Set([...prev, teamId]));
      
      // 現在指名中の球団が選択終了した場合、次の球団へ
      if (getCurrentPickingTeam() === teamId) {
        const waiverOrder = getWaiverOrder(currentRound, isDevelopmentDraft);
        const updatedFinished = new Set([...finishedTeams, teamId]);
        let nextIndex = currentWaiverIndex + 1;
        while (nextIndex < waiverOrder.length && updatedFinished.has(waiverOrder[nextIndex])) {
          nextIndex++;
        }
        
        if (nextIndex < waiverOrder.length) {
          setCurrentWaiverIndex(nextIndex);
        } else {
          // ラウンド終了
          const actualCount = getActualPickCount();
          const allFinished = teams.every(t => updatedFinished.has(t.id) || t.id === teamId);
          
          if (allFinished || actualCount >= MAX_TOTAL_PICKS) {
            if (actualCount < MAX_TOTAL_PICKS && !isDevelopmentDraft) {
              setIsDevelopmentDraft(true);
              setFinishedTeams(new Set()); // 育成ドラフト用にリセット（全球団が再び選択可能に）
              setCurrentRound(1);
              setCurrentWaiverIndex(0);
              toast({
                title: "新人選手選択会議終了",
                description: `育成選手選択会議を開始します（残り枠: ${MAX_TOTAL_PICKS - actualCount}名）`,
              });
            } else {
              toast({
                title: "ドラフト終了",
                description: "すべての指名が完了しました",
              });
            }
          } else {
            // 次のラウンドへ
            const nextRound = currentRound + 1;
            setCurrentRound(nextRound);
            
            // 次のラウンドの指名順を取得
            const nextWaiverOrder = getWaiverOrder(nextRound, isDevelopmentDraft);
            
            // 選択終了していない最初のチームを探す（updatedFinishedを使用）
            let nextStartIndex = 0;
            while (nextStartIndex < nextWaiverOrder.length && 
                   updatedFinished.has(nextWaiverOrder[nextStartIndex])) {
              nextStartIndex++;
            }
            
            setCurrentWaiverIndex(nextStartIndex);
            
            toast({
              title: `${currentRound}位指名終了`,
              description: `${nextRound}位指名を開始します`,
            });
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <p className="text-center">読み込み中...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="仮想ドラフト会議"
        description="プロ野球ドラフト会議のシミュレーション。12球団の1位指名を自分で決めて、被った場合は抽選を行います。ドラフト戦略の検討にご活用ください。"
        keywords={["仮想ドラフト", "ドラフト会議", "シミュレーション", "プロ野球", "指名", "抽選"]}
      />
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {!user && (
          <Card className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  ゲストモードでは、仮想ドラフトの結果を保存できません。
                  結果を保存するには、
                  <Button 
                    variant="link" 
                    className="px-1 h-auto py-0" 
                    onClick={() => navigate("/auth")}
                  >
                    ログイン
                  </Button>
                  してください。
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">仮想ドラフト会議</h1>
          <div className="space-y-3">
            <p className="text-muted-foreground">
              12球団すべての1位指名を自分で決めて、実際のドラフト会議のように抽選をシミュレートできます。
            </p>
            <Card className="bg-muted/50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      <strong>選択できる選手について：</strong>選手リストに登録した選手のみが選択可能です。
                    </p>
                    {!user && (
                      <p>
                        ゲストモードでご利用の場合は、サンプル選手でしかご利用いただけません。
                        <Button 
                          variant="link" 
                          className="px-1 h-auto py-0 text-sm" 
                          onClick={() => navigate("/auth")}
                        >
                          アカウント登録
                        </Button>
                        して選手リストに選手を追加することで、仮想ドラフト機能をご利用いただけます。
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </header>

        {/* Lipovitan D Affiliate Section - Top of Page */}
        <Card className="mb-8 bg-gradient-to-r from-yellow-50/50 to-amber-50/50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="text-center text-lg">
              大正製薬 リポビタンD - ドラフト会議公式スポンサー
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              {/* Product Image */}
              <div className="flex-shrink-0">
                <a 
                  href="https://hb.afl.rakuten.co.jp/ichiba/4d43813e.d3f5e4c3.4d43813f.8ae3c061/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fmatsukiyo%2F4987306007352%2F&link_type=picttext&ut=eyJwYWdlIjoiaXRlbSIsInR5cGUiOiJwaWN0dGV4dCIsInNpemUiOiIyNDB4MjQwIiwibmFtIjoxLCJuYW1wIjoicmlnaHQiLCJjb20iOjEsImNvbXAiOiJkb3duIiwicHJpY2UiOjEsImJvciI6MSwiY29sIjoxLCJiYnRuIjoxLCJwcm9kIjowLCJhbXAiOmZhbHNlfQ%3D%3D"
                  target="_blank"
                  rel="nofollow sponsored noopener"
                  className="block"
                >
                  <img
                    src="https://hbb.afl.rakuten.co.jp/hgb/4d43813e.d3f5e4c3.4d43813f.8ae3c061/?me_id=1294451&item_id=10479281&pc=https%3A%2F%2Fthumbnail.image.rakuten.co.jp%2F%400_mall%2Fmatsukiyo%2Fcabinet%2Fd0004%2F4987306007352_1.jpg%3F_ex%3D240x240&s=240x240&t=picttext"
                    alt="大正製薬 リポビタンD 100ml×3本"
                    className="w-48 h-48 object-contain"
                  />
                </a>
              </div>

              {/* Product Info and Purchase Buttons */}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">大正製薬 リポビタンD 100ml×3本</h3>
                  <p className="text-sm text-muted-foreground">指定医薬部外品</p>
                  <p className="text-xs text-muted-foreground mt-3">
                    ※このページでは、Amazonアソシエイトプログラムおよび楽天アフィリエイトプログラムを利用しています。
                  </p>
                </div>

                {/* Purchase Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="https://a.r10.to/hNkLlq"
                    target="_blank"
                    rel="nofollow sponsored noopener"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#bf0000] hover:bg-[#a00000] text-white font-medium px-6 py-3 transition-all hover:scale-105"
                  >
                    🛒 楽天で購入
                  </a>
                  <a
                    href="https://amzn.to/471TsIK"
                    target="_blank"
                    rel="nofollow sponsored noopener"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF9900] hover:bg-[#e88b00] text-white font-medium px-6 py-3 transition-all hover:scale-105"
                  >
                    🛒 Amazonで購入
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {allDraftPicks.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                各球団の指名状況
                <Badge variant="outline">
                  {isDevelopmentDraft ? '育成選手選択会議' : `${currentRound}位指名`}
                  {currentRound > 1 && !isDevelopmentDraft ? `（${teams.find(t => t.id === getCurrentPickingTeam())?.shortName || ''}指名中）` : ''}
                </Badge>
                <Badge variant="secondary">{getActualPickCount()} / {MAX_TOTAL_PICKS}名</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>球団</TableHead>
                    <TableHead>1位</TableHead>
                    <TableHead>2位</TableHead>
                    <TableHead>3位</TableHead>
                    <TableHead>4位</TableHead>
                    <TableHead>5位</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayOrder.map(teamId => {
                    const team = teams.find(t => t.id === teamId);
                    if (!team) return null;
                    const picks = getTeamPicks(team.id);
                    const isCurrentPicking = currentRound > 1 && getCurrentPickingTeam() === team.id;
                    return (
                      <TableRow key={team.id} className={isCurrentPicking ? "bg-primary/10" : ""}>
                        <TableCell className="font-medium">
                          {team.shortName}
                          {isCurrentPicking && <Badge className="ml-2" variant="default">指名中</Badge>}
                        </TableCell>
                        {[1, 2, 3, 4, 5].map(round => {
                          const pick = picks.find(p => p.round === round);
                          return (
                            <TableCell key={round}>
                              {pick ? pick.playerName : "―"}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {allRoundResults.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shuffle className="h-5 w-5" />
                抽選結果
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {allRoundResults.map((roundResults, roundIndex) => (
                  <div key={roundIndex}>
                    {roundResults.length > 0 && (
                      <>
                        <h3 className="font-semibold mb-3">第{roundIndex + 1}次選択抽選</h3>
                        <div className="space-y-4">
                          {roundResults.map(result => (
                            <div key={result.playerId} className="border-b pb-4 last:border-b-0">
                              <h4 className="font-semibold text-lg mb-2">
                                {result.playerName} 
                                <Badge variant="outline" className="ml-2">{result.competingTeams.length}球団競合</Badge>
                              </h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                競合: {result.competingTeams.map(id => getTeamName(id)).join(", ")}
                              </p>
                              <p className="text-sm">
                                <span className="font-semibold text-green-600">
                                  獲得: {getTeamName(result.winner)}
                                </span>
                              </p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {canExecuteLottery() && (
          <div className="mb-8 text-center">
            <Button 
              size="lg" 
              onClick={executeLottery}
              className="gap-2"
            >
              <Shuffle className="h-5 w-5" />
              第{currentRound}次選択抽選実行
            </Button>
          </div>
        )}
        
        {((finalSelections.length === teams.length && currentRound > 1) || isDevelopmentDraft) && !isDraftComplete && (
          <div className="mb-8">
            <Card className="bg-primary/5">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-lg font-semibold mb-2">
                    {isDevelopmentDraft ? `育成${currentRound}位` : `${currentRound}位`}指名 - {teams.find(t => t.id === getCurrentPickingTeam())?.name}の番です
                  </p>
                  <p className="text-sm text-muted-foreground">
                    指名順 {currentWaiverIndex + 1} / {getWaiverOrder(currentRound, isDevelopmentDraft).length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(() => {
            // 1位指名の抽選フェーズでは1位の順番、2位以降は各ラウンドの指名順
            let teamOrder: number[];
            if (finalSelections.length < teams.length && !isDevelopmentDraft) {
              // 1位指名の抽選フェーズ（支配下ドラフトのみ）
              teamOrder = oddRoundOrder;
            } else {
              // 2位以降（または育成ドラフト）のウェーバー方式：現在のラウンドに応じた指名順
              teamOrder = getWaiverOrder(currentRound, isDevelopmentDraft);
            }
            
            return teamOrder.map(teamId => {
              const team = teams.find(t => t.id === teamId);
              if (!team) return null;
              
              const teamStatus = getTeamStatus(team.id);
              const currentSelection = getCurrentRoundSelection(team.id);
              const selectedPlayerIds = getSelectedPlayerIds();
              const availablePlayers = players.filter(p => !selectedPlayerIds.includes(p.id));
              const lostPlayers = getLostPlayers(team.id);
              const isCurrentPickingTeam = ((finalSelections.length === teams.length && currentRound > 1) || isDevelopmentDraft) && getCurrentPickingTeam() === team.id;
              
              // 1位指名フェーズで確定済みの球団、または2位以降で指名済みの球団
              if (teamStatus.decided && finalSelections.length < teams.length) {
                // 確定済みの球団
                return (
                  <Card key={team.id} className="ring-2 ring-green-500">
                    <CardHeader className={`bg-gradient-to-r ${team.color} text-white rounded-t-lg`}>
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>{team.name}</span>
                        <Trophy className="h-5 w-5 text-yellow-300" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">確定選手</p>
                          <p className="font-semibold text-lg">{teamStatus.playerName}</p>
                          <Badge variant="default" className="bg-green-600 mt-2">
                            第{teamStatus.round}次選択確定
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }
              
              // 1位指名フェーズで未確定の球団、または2位以降で選択可能な球団
              if (finalSelections.length < teams.length && !isDevelopmentDraft) {
                // 1位指名の抽選フェーズ（支配下ドラフトのみ）
                return (
                  <>
                    <Card key={team.id}>
                      <CardHeader className={`bg-gradient-to-r ${team.color} text-white rounded-t-lg`}>
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span>{team.name}</span>
                          <Badge variant="secondary" className="bg-white/20">第{currentRound}次</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {currentRound === 1 ? "1位指名" : `第${currentRound}次選択`}
                            </p>
                            {currentSelection?.playerName ? (
                              <div className="space-y-2">
                                <p className="font-semibold text-lg">{currentSelection.playerName}</p>
                              </div>
                            ) : (
                              <p className="text-muted-foreground">未選択</p>
                            )}
                          </div>
                          
                          {lostPlayers.length > 0 && (
                            <div className="bg-muted/50 p-3 rounded-lg">
                              <p className="text-xs font-medium text-muted-foreground mb-2">抽選外れ選手</p>
                              <div className="space-y-1">
                                {lostPlayers.map((lostPlayer, idx) => (
                                  <p key={idx} className="text-sm">
                                    {lostPlayer.playerName} <span className="text-xs text-muted-foreground">(第{lostPlayer.round}次)</span>
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <PlayerSelectionDialog
                            players={availablePlayers}
                            selectedPlayerId={currentSelection?.playerId || null}
                            onSelect={(playerId) => handlePlayerSelect(team.id, playerId)}
                          >
                            <Button variant="outline" className="w-full">
                              選手を選択
                            </Button>
                          </PlayerSelectionDialog>
                        </div>
                      </CardContent>
                    </Card>
                    {/* ヤクルトスワローズの下に抽選ボタンを中央表示 */}
                    {team.id === 8 && canExecuteLottery() && (
                      <div className="col-span-full flex justify-center mt-6">
                        <Button 
                          size="lg" 
                          onClick={executeLottery}
                          className="gap-2"
                        >
                          <Shuffle className="h-5 w-5" />
                          第{currentRound}次選択抽選実行
                        </Button>
                      </div>
                    )}
                  </>
                );
              } else {
                // 2位以降のウェーバー方式フェーズ（または育成ドラフト）
                const teamPicks = getTeamPicks(team.id);
                return (
                  <Card key={team.id} className={isCurrentPickingTeam ? "ring-2 ring-primary" : ""}>
                    <CardHeader className={`bg-gradient-to-r ${team.color} text-white rounded-t-lg`}>
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>{team.name}</span>
                        {isCurrentPickingTeam && <Badge variant="secondary" className="bg-white/20">指名中</Badge>}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">指名選手</p>
                          {teamPicks.map(pick => (
                            <p key={pick.round} className="text-sm">
                              {pick.round}位: {pick.playerName}
                            </p>
                          ))}
                        </div>
                        
                        {isCurrentPickingTeam && !finishedTeams.has(team.id) && (
                          <div className="space-y-2">
                            <PlayerSelectionDialog
                              players={availablePlayers}
                              selectedPlayerId={null}
                              onSelect={(playerId) => handlePlayerSelect(team.id, playerId)}
                            >
                              <Button variant="default" className="w-full">
                                {isDevelopmentDraft ? `育成${currentRound}位` : `${currentRound}位`}指名する
                              </Button>
                            </PlayerSelectionDialog>
                            {(currentRound > 1 || isDevelopmentDraft) && (
                              <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={() => handleTeamFinish(team.id)}
                              >
                                選択終了
                              </Button>
                            )}
                          </div>
                        )}
                        {finishedTeams.has(team.id) && (
                          <Badge variant="secondary" className="w-full justify-center py-2">
                            選択終了
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              }
            });
          })()}
        </div>

        {/* Lipovitan D Affiliate Section */}
        <Card className="mt-8 bg-gradient-to-r from-yellow-50/50 to-amber-50/50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="text-center text-lg">
              大正製薬 リポビタンD - ドラフト会議公式スポンサー
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              {/* Product Image */}
              <div className="flex-shrink-0">
                <a 
                  href="https://hb.afl.rakuten.co.jp/ichiba/4d43813e.d3f5e4c3.4d43813f.8ae3c061/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fmatsukiyo%2F4987306007352%2F&link_type=picttext&ut=eyJwYWdlIjoiaXRlbSIsInR5cGUiOiJwaWN0dGV4dCIsInNpemUiOiIyNDB4MjQwIiwibmFtIjoxLCJuYW1wIjoicmlnaHQiLCJjb20iOjEsImNvbXAiOiJkb3duIiwicHJpY2UiOjEsImJvciI6MSwiY29sIjoxLCJiYnRuIjoxLCJwcm9kIjowLCJhbXAiOmZhbHNlfQ%3D%3D"
                  target="_blank"
                  rel="nofollow sponsored noopener"
                  className="block"
                >
                  <img
                    src="https://hbb.afl.rakuten.co.jp/hgb/4d43813e.d3f5e4c3.4d43813f.8ae3c061/?me_id=1294451&item_id=10479281&pc=https%3A%2F%2Fthumbnail.image.rakuten.co.jp%2F%400_mall%2Fmatsukiyo%2Fcabinet%2Fd0004%2F4987306007352_1.jpg%3F_ex%3D240x240&s=240x240&t=picttext"
                    alt="大正製薬 リポビタンD 100ml×3本"
                    className="w-48 h-48 object-contain"
                  />
                </a>
              </div>

              {/* Product Info and Purchase Buttons */}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">大正製薬 リポビタンD 100ml×3本</h3>
                  <p className="text-sm text-muted-foreground">指定医薬部外品</p>
                  <p className="text-xs text-muted-foreground mt-3">
                    ※このページでは、Amazonアソシエイトプログラムおよび楽天アフィリエイトプログラムを利用しています。
                  </p>
                </div>

                {/* Purchase Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="https://a.r10.to/hNkLlq"
                    target="_blank"
                    rel="nofollow sponsored noopener"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#bf0000] hover:bg-[#a00000] text-white font-medium px-6 py-3 transition-all hover:scale-105"
                  >
                    🛒 楽天で購入
                  </a>
                  <a
                    href="https://amzn.to/471TsIK"
                    target="_blank"
                    rel="nofollow sponsored noopener"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF9900] hover:bg-[#e88b00] text-white font-medium px-6 py-3 transition-all hover:scale-105"
                  >
                    🛒 Amazonで購入
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              使い方
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>ドラフト会議のルール：</strong></p>
            <p>・各球団は原則として10名まで指名できます</p>
            <p>・全体で120名が上限です（独立リーグ所属選手はカウント外）</p>
            <p>・全球団が「選択終了」となるか、120名に達したところで終了します</p>
            <p>・全体で120名に達していない場合は、11人目以降も指名可能です</p>
            
            <p className="mt-4"><strong>1位指名：</strong></p>
            <p>・各球団の1位指名選手を選択してください</p>
            <p>・すべての球団で選択が完了したら「抽選実行」ボタンが表示されます</p>
            <p>・複数球団が同じ選手を指名した場合、ランダムで獲得球団が決まります</p>
            
            <p className="mt-4"><strong>2位以降：</strong></p>
            <p>・ウェーバー方式で順番に指名します</p>
            <p>・1巡目以外は「選択終了」ボタンで指名を終了できます</p>
            <p>・奇数指名（1位、3位、5位...）：ソフトバンク→阪神→日ハム→DeNA→オリックス→巨人→楽天→中日→西武→広島→ロッテ→ヤクルト</p>
            <p>・偶数指名（2位、4位...）：ヤクルト→ロッテ→広島→西武→中日→楽天→巨人→オリックス→DeNA→日ハム→阪神→ソフトバンク</p>
            <p>・既に指名された選手は選択できません</p>
            
            <p className="mt-4"><strong>育成選手選択会議：</strong></p>
            <p>・新人選手選択会議終了時点で120名未満の場合に開催されます</p>
            <p>・支配下登録ではない育成選手として獲得を希望する選手を指名できます</p>
          </CardContent>
        </Card>

      </main>
      
      <Footer />
    </div>
  );
};

export default VirtualDraft;
