import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getDefaultPlayers, Player as LocalPlayer } from "@/lib/playerStorage";
import { Play, ArrowLeft, Settings, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { runDraftSimulation, SimulationResult } from "@/lib/draftSimulation";
import { NormalizedPlayer, DraftPick, WeightConfig } from "@/lib/draftScoring";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, ChevronDown } from "lucide-react";
import { PlayerFormDialog } from "@/components/PlayerFormDialog";
import { Input } from "@/components/ui/input";
import { LotteryAnimation } from "@/components/LotteryAnimation";

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

const displayOrder = [8, 4, 12, 3, 10, 2, 7, 5, 9, 1, 11, 6];

// ポジションの順序を定義
const positionOrder = [
  "投手", "捕手", "一塁手", "二塁手", "三塁手", "遊撃手", "外野手", "指名打者"
];

// 評価の順序を定義
const evaluationOrder = [
  "1位競合", "1位一本釣り", "外れ1位", "2位", "3位", 
  "4位", "5位", "6位以下", "育成"
];

// カテゴリの選択肢（固定）
const categories = ["高校", "大学", "社会人", "独立リーグ", "その他"];

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

export default function AIDraft() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [players, setPlayers] = useState<NormalizedPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [currentSimulationRound, setCurrentSimulationRound] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [maxRounds, setMaxRounds] = useState(10);
  const [userTeamIds, setUserTeamIds] = useState<number[]>([]);
  const [showPlayerSelection, setShowPlayerSelection] = useState(false);
  const [availablePlayersForSelection, setAvailablePlayersForSelection] = useState<NormalizedPlayer[]>([]);
  const [pendingPickResolve, setPendingPickResolve] = useState<((playerId: number) => void) | null>(null);
  const [currentPickInfo, setCurrentPickInfo] = useState<{ round: number; teamId: number } | null>(null);
  const [isPlayerFormOpen, setIsPlayerFormOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // フィルター用のstate
  const [searchName, setSearchName] = useState("");
  const [filterPositions, setFilterPositions] = useState<string[]>([]);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterEvaluations, setFilterEvaluations] = useState<string[]>([]);
  
  // 抽選アニメーション用のstate
  const [lotteryQueue, setLotteryQueue] = useState<Array<Array<{
    playerName: string;
    team: string;
    position: string;
    competingTeamIds: number[];
    winnerId: number;
  }>>>([]);
  const [currentLotteryIndex, setCurrentLotteryIndex] = useState(0);
  const [showLottery, setShowLottery] = useState(false);
  const [animationEnabled, setAnimationEnabled] = useState(true);
  
  // スコアリング重み設定
  const [weights, setWeights] = useState<WeightConfig>({
    voteWeight: 40,
    teamNeedsWeight: 30,
    playerRatingWeight: 20,
    realismWeight: 10
  });
  const [weightId, setWeightId] = useState<string | null>(null);

  useEffect(() => {
    loadPlayers();
    loadWeights();
    checkAdmin();
  }, []);

  // リアルタイム更新の監視
  useEffect(() => {
    const channel = supabase
      .channel('draft-scoring-weights-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'draft_scoring_weights'
        },
        () => {
          // 重み設定が変更されたら再読み込み
          loadWeights();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkAdmin = async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      
      setIsAdmin(!!data);
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  };

  const loadWeights = async () => {
    try {
      // Supabaseから最新の設定を読み込み（全ユーザー対象）
      const { data, error } = await supabase
        .from("draft_scoring_weights")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        const dbWeights = {
          voteWeight: data.vote_weight,
          teamNeedsWeight: data.team_needs_weight,
          playerRatingWeight: data.player_rating_weight,
          realismWeight: data.realism_weight
        };
        setWeights(dbWeights);
        setWeightId(data.id);
        // LocalStorageにも保存（オフライン時用）
        localStorage.setItem('aiDraftWeights', JSON.stringify(dbWeights));
      } else {
        // データがない場合のみLocalStorageから読み込み
        const savedWeights = localStorage.getItem('aiDraftWeights');
        if (savedWeights) {
          const parsed = JSON.parse(savedWeights);
          setWeights(parsed);
        }
      }
    } catch (error) {
      console.error("Error loading weights:", error);
      // エラー時はLocalStorageから読み込み
      const savedWeights = localStorage.getItem('aiDraftWeights');
      if (savedWeights) {
        const parsed = JSON.parse(savedWeights);
        setWeights(parsed);
      }
    }
  };

  const loadPlayers = async () => {
    try {
      if (user) {
        const { data, error } = await supabase
          .from("players")
          .select("*")
          .eq("year", 2025)
          .order("name");
        
        if (error) throw error;
        const normalized = (data || []).map(normalizeSupabasePlayer);
        setPlayers(normalized);
      } else {
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

  const handlePlayerSelect = (playerId: number) => {
    if (pendingPickResolve) {
      pendingPickResolve(playerId);
      setPendingPickResolve(null);
      setShowPlayerSelection(false);
      setCurrentPickInfo(null);
      clearFilters();
    }
  };

  const clearFilters = () => {
    setSearchName("");
    setFilterPositions([]);
    setFilterCategories([]);
    setFilterEvaluations([]);
  };

  const getHighestEvaluationRank = (evaluations: string[] | undefined): number => {
    if (!evaluations || evaluations.length === 0) return 999;
    let highestRank = 999;
    evaluations.forEach(evaluation => {
      const rank = evaluationOrder.indexOf(evaluation);
      if (rank !== -1 && rank < highestRank) {
        highestRank = rank;
      }
    });
    return highestRank;
  };

  const filteredAvailablePlayers = availablePlayersForSelection.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchName.toLowerCase());
    const matchesCategory = filterCategories.length === 0 || filterCategories.includes(player.category);
    
    const positionStr = Array.isArray(player.position) ? player.position.join("、") : player.position;
    const playerPositions = positionStr.split(/[,、]/).map(p => p.trim()).filter(p => p);
    const matchesPosition = filterPositions.length === 0 || 
      playerPositions.some(pos => filterPositions.includes(pos));
    
    const matchesEvaluation = filterEvaluations.length === 0 || 
      (player.evaluations && player.evaluations.some(evaluation => filterEvaluations.includes(evaluation)));
    
    return matchesSearch && matchesCategory && matchesPosition && matchesEvaluation;
  }).sort((a, b) => {
    const rankA = getHighestEvaluationRank(a.evaluations);
    const rankB = getHighestEvaluationRank(b.evaluations);
    
    if (rankA !== rankB) {
      return rankA - rankB;
    }
    
    return a.name.localeCompare(b.name, 'ja');
  });

  const saveWeights = async (newWeights: WeightConfig) => {
    const sum = newWeights.voteWeight + newWeights.teamNeedsWeight + 
                newWeights.playerRatingWeight + newWeights.realismWeight;
    
    if (sum !== 100) {
      toast({
        title: "エラー",
        description: "重みの合計が100%になるように調整してください",
        variant: "destructive",
      });
      return;
    }
    
    // LocalStorageに保存（全ユーザー共通）
    localStorage.setItem('aiDraftWeights', JSON.stringify(newWeights));
    
    // 管理者の場合はSupabaseにも保存
    if (!isAdmin) {
      toast({
        title: "保存完了",
        description: "設定を保存しました（ローカルのみ）",
      });
      return;
    }
    
    try {
      if (weightId) {
        // 既存の重み設定を更新
        const { error } = await supabase
          .from("draft_scoring_weights")
          .update({
            vote_weight: newWeights.voteWeight,
            team_needs_weight: newWeights.teamNeedsWeight,
            player_rating_weight: newWeights.playerRatingWeight,
            realism_weight: newWeights.realismWeight
          })
          .eq("id", weightId);
        
        if (error) throw error;
      } else {
        // 新規作成
        const { data, error } = await supabase
          .from("draft_scoring_weights")
          .insert({
            vote_weight: newWeights.voteWeight,
            team_needs_weight: newWeights.teamNeedsWeight,
            player_rating_weight: newWeights.playerRatingWeight,
            realism_weight: newWeights.realismWeight,
            created_by: user?.id
          })
          .select()
          .single();
        
        if (error) throw error;
        if (data) setWeightId(data.id);
      }
      
      toast({
        title: "保存完了",
        description: "スコアリング重みを更新しました",
      });
    } catch (error) {
      console.error("Error saving weights:", error);
      toast({
        title: "エラー",
        description: "重みの保存に失敗しました（ローカルには保存されています）",
        variant: "destructive",
      });
    }
  };

  const handleStartSimulation = async () => {
    if (players.length === 0) {
      toast({
        title: "エラー",
        description: "選手データがありません",
        variant: "destructive",
      });
      return;
    }

    setSimulating(true);
    setCurrentSimulationRound(0);
    setSimulationResult(null);
    setLotteryQueue([]);
    setCurrentLotteryIndex(0);

    try {
      const result = await runDraftSimulation(
        players,
        maxRounds,
        weights,
        "2025",
        (round, partialResult) => {
          setCurrentSimulationRound(round);
          // 各ラウンド終了後に部分結果を更新
          if (partialResult) {
            setSimulationResult(partialResult);
          }
        },
        userTeamIds.length > 0 ? userTeamIds : undefined,
        userTeamIds.length > 0 ? async (round, teamId, availablePlayers) => {
          setCurrentPickInfo({ round, teamId });
          setAvailablePlayersForSelection(availablePlayers);
          setShowPlayerSelection(true);
          
          return new Promise<number>((resolve) => {
            setPendingPickResolve(() => resolve);
          });
        } : undefined
      );
      
      // 競合した抽選をキューに追加
      const lotteries: Array<Array<{
        playerName: string;
        team: string;
        position: string;
        competingTeamIds: number[];
        winnerId: number;
      }>> = [];
      
      // 同一ラウンドの競合をグループ化
      const roundGroups = new Map<number, typeof lotteries[0]>();
      
      result.picks.forEach(pick => {
        if (pick.isContested && pick.contestedTeams && pick.contestedTeams.length > 1) {
          const player = players.find(p => p.id === pick.playerId);
          if (player) {
            const positionStr = Array.isArray(player.position) ? player.position.join("、") : player.position;
            const lotteryItem = {
              playerName: player.name,
              team: player.team,
              position: positionStr,
              competingTeamIds: pick.contestedTeams,
              winnerId: pick.teamId
            };
            
            if (!roundGroups.has(pick.round)) {
              roundGroups.set(pick.round, []);
            }
            roundGroups.get(pick.round)!.push(lotteryItem);
          }
        }
      });
      
      // ラウンド順にソートして配列に変換
      const sortedRounds = Array.from(roundGroups.keys()).sort((a, b) => a - b);
      sortedRounds.forEach(round => {
        const group = roundGroups.get(round);
        if (group) {
          lotteries.push(group);
        }
      });
      
      // 結果を必ずセット
      setSimulationResult(result);
      
      // デバッグ情報
      console.log('Lotteries found:', lotteries.length);
      console.log('Animation enabled:', animationEnabled);
      console.log('Lottery data:', lotteries);
      
      if (lotteries.length > 0 && animationEnabled) {
        setLotteryQueue(lotteries);
        setCurrentLotteryIndex(0);
        setShowLottery(true);
      } else {
        toast({
          title: "シミュレーション完了",
          description: `${result.picks.length}名の指名が完了しました`,
        });
      }
    } catch (error) {
      console.error("Simulation error:", error);
      toast({
        title: "エラー",
        description: "シミュレーションに失敗しました",
        variant: "destructive",
      });
    } finally {
      setSimulating(false);
    }
  };

  const handleLotteryComplete = () => {
    if (currentLotteryIndex < lotteryQueue.length - 1) {
      // 次の抽選へ
      setCurrentLotteryIndex(prev => prev + 1);
    } else {
      // 全ての抽選が完了
      setShowLottery(false);
      if (simulationResult) {
        toast({
          title: "シミュレーション完了",
          description: `${simulationResult.picks.length}名の指名が完了しました`,
        });
      }
    }
  };

  const handleExportCSV = () => {
    if (!simulationResult) return;

    const csvRows = [
      ["ラウンド", "球団", "選手名", "総合スコア", "投票スコア", "ニーズスコア", "評価スコア", "現実性スコア", "理由"].join(",")
    ];

    simulationResult.summary.forEach(item => {
      const team = teams.find(t => t.id === item.teamId);
      csvRows.push([
        item.round,
        team?.name || "",
        item.playerName,
        item.score.totalScore.toFixed(2),
        item.score.breakdown.voteScore.toFixed(2),
        item.score.breakdown.teamNeedsScore.toFixed(2),
        item.score.breakdown.playerRating.toFixed(2),
        item.score.breakdown.realismScore.toFixed(2),
        `"${item.score.reason}"`
      ].join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `draft_simulation_${new Date().getTime()}.csv`;
    link.click();
  };

  const getTeamPicks = (teamId: number): DraftPick[] => {
    if (!simulationResult) return [];
    return simulationResult.picks
      .filter(pick => pick.teamId === teamId)
      .sort((a, b) => a.round - b.round);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <SEO 
        title="AIドラフト"
        description="多層スコアリングシステムによる自動ドラフトシミュレーション"
      />
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/virtual-draft")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">AIドラフト</h1>
              <p className="text-muted-foreground">多層スコアリングシステムによる自動シミュレーション</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4 mr-2" />
              設定
            </Button>
            {simulationResult && (
              <Button
                variant="outline"
                onClick={handleExportCSV}
              >
                <Download className="w-4 h-4 mr-2" />
                CSV出力
              </Button>
            )}
          </div>
        </div>

        {/* 操作球団選択 */}
        {!simulating && !simulationResult && (
          <Card>
            <CardHeader>
              <CardTitle>操作球団選択</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label>操作する球団を選択してください（複数選択可能）</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {teams.map(team => {
                    const isSelected = userTeamIds.includes(team.id);
                    return (
                      <div
                        key={team.id}
                        onClick={() => {
                          if (isSelected) {
                            setUserTeamIds(userTeamIds.filter(id => id !== team.id));
                          } else {
                            setUserTeamIds([...userTeamIds, team.id]);
                          }
                        }}
                        className={`
                          relative cursor-pointer rounded-lg border-2 transition-all duration-200
                          ${isSelected 
                            ? 'border-primary shadow-lg scale-[1.02]' 
                            : 'border-border hover:border-primary/50 hover:shadow-md'
                          }
                        `}
                      >
                        <div className={`
                          px-4 py-3 rounded-md text-center font-bold text-white
                          bg-gradient-to-r ${team.color}
                          ${isSelected ? 'shadow-inner' : ''}
                        `}>
                          {team.name}
                        </div>
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {userTeamIds.length > 0 && (
                  <div className="flex items-center gap-2 pt-2">
                    <Badge variant="secondary" className="text-sm">
                      {userTeamIds.length}球団を選択中
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 設定パネル */}
        {showSettings && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>スコアリング重み設定</CardTitle>
                {!isAdmin && (
                  <Badge variant="secondary">閲覧のみ</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>投票データスコア: {weights.voteWeight}%</Label>
                <Slider
                  value={[weights.voteWeight]}
                  onValueChange={([value]) => {
                    setWeights(prev => ({ ...prev, voteWeight: value }));
                  }}
                  max={100}
                  step={5}
                  disabled={!isAdmin}
                />
              </div>
              <div className="space-y-2">
                <Label>チームニーズスコア: {weights.teamNeedsWeight}%</Label>
                <Slider
                  value={[weights.teamNeedsWeight]}
                  onValueChange={([value]) => {
                    setWeights(prev => ({ ...prev, teamNeedsWeight: value }));
                  }}
                  max={100}
                  step={5}
                  disabled={!isAdmin}
                />
              </div>
              <div className="space-y-2">
                <Label>選手評価スコア: {weights.playerRatingWeight}%</Label>
                <Slider
                  value={[weights.playerRatingWeight]}
                  onValueChange={([value]) => {
                    setWeights(prev => ({ ...prev, playerRatingWeight: value }));
                  }}
                  max={100}
                  step={5}
                  disabled={!isAdmin}
                />
              </div>
              <div className="space-y-2">
                <Label>現実性調整スコア: {weights.realismWeight}%</Label>
                <Slider
                  value={[weights.realismWeight]}
                  onValueChange={([value]) => {
                    setWeights(prev => ({ ...prev, realismWeight: value }));
                  }}
                  max={100}
                  step={5}
                  disabled={!isAdmin}
                />
              </div>
              <div className="space-y-2">
                <Label>最大ラウンド数: {maxRounds}</Label>
                <Slider
                  value={[maxRounds]}
                  onValueChange={([value]) => setMaxRounds(value)}
                  min={1}
                  max={20}
                  step={1}
                />
              </div>
              <div className="pt-4 space-y-3">
                <div className="text-sm text-muted-foreground">
                  <p>合計: {weights.voteWeight + weights.teamNeedsWeight + weights.playerRatingWeight + weights.realismWeight}%</p>
                  <p className="text-xs mt-1">※ 合計が100%になるように調整してください</p>
                  {!isAdmin && (
                    <p className="text-xs mt-2 text-amber-600">※ スコアリング重みの変更は管理者のみ可能です</p>
                  )}
                </div>
                {isAdmin && (
                  <Button 
                    onClick={() => saveWeights(weights)} 
                    className="w-full"
                    disabled={weights.voteWeight + weights.teamNeedsWeight + weights.playerRatingWeight + weights.realismWeight !== 100}
                  >
                    設定を保存
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* シミュレーション開始ボタン */}
        {!simulationResult && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
              <p className="text-lg text-muted-foreground">
                {players.length}名の選手データを読み込みました
              </p>
              <Button
                size="lg"
                onClick={handleStartSimulation}
                disabled={simulating || players.length === 0}
              >
                {simulating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                    シミュレーション中... ({currentSimulationRound}/{maxRounds}ラウンド)
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    シミュレーション開始
                  </>
                )}
              </Button>
              {simulating && (
                <Progress value={(currentSimulationRound / maxRounds) * 100} className="w-64" />
              )}
              <div className="flex items-center justify-center gap-3 text-sm">
                <span className="text-muted-foreground">抽選アニメーション</span>
                <Switch
                  checked={animationEnabled}
                  onCheckedChange={setAnimationEnabled}
                  disabled={simulating}
                />
                <span className="text-muted-foreground">{animationEnabled ? 'ON' : 'OFF'}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* シミュレーション結果 */}
        {simulationResult && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">シミュレーション結果</h2>
              <Button onClick={handleStartSimulation} variant="outline">
                <Play className="w-4 h-4 mr-2" />
                再シミュレーション
              </Button>
            </div>

            <Card>
              <CardContent className="p-6 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap sticky left-0 bg-background z-10 w-20"></TableHead>
                      {displayOrder.map(teamId => {
                        const team = teams.find(t => t.id === teamId);
                        if (!team) return null;
                        return (
                          <TableHead 
                            key={team.id} 
                            className={`whitespace-nowrap text-center text-xs font-bold border-r bg-gradient-to-br ${team.color} text-white w-28`}
                          >
                            {team.shortName}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      // 1巡目の指名をpickLabelでグループ化し、各球団の抽選外れも取得
                      const firstRoundPicks = simulationResult.picks.filter(p => p.round === 1);
                      const firstRoundLostPicks = simulationResult.lostPicks?.filter(p => p.round === 1) || [];
                      
                      // 全てのラベルを取得（1位、外れ1位、外れ2位...）
                      const allLabels = [...new Set([
                        ...firstRoundPicks.map(p => p.pickLabel || "1位"),
                        ...firstRoundLostPicks.map(p => p.pickLabel || "1位")
                      ])];
                      
                      // 各ラベルについて、最大の試行回数（抽選外れ + 成功）を計算
                      const maxAttemptsPerLabel = new Map<string, number>();
                      allLabels.forEach(label => {
                        displayOrder.forEach(teamId => {
                          const lostForLabel = firstRoundLostPicks.filter(
                            lp => lp.teamId === teamId && (lp.pickLabel || "1位") === label
                          );
                          const successPick = firstRoundPicks.find(
                            p => p.teamId === teamId && (p.pickLabel || "1位") === label
                          );
                          const attempts = lostForLabel.length + (successPick ? 1 : 0);
                          maxAttemptsPerLabel.set(label, Math.max(maxAttemptsPerLabel.get(label) || 0, attempts));
                        });
                      });
                      
                      const maxRound = Math.max(...simulationResult.picks.map(p => p.round));
                      const rows = [];
                      
                      // 1巡目は特別処理（1位、外れ1位、外れ2位...を表示）
                      if (allLabels.length > 0) {
                        allLabels.forEach(label => {
                          const maxAttempts = maxAttemptsPerLabel.get(label) || 0;
                          const picksForLabel = firstRoundPicks.filter(p => (p.pickLabel || "1位") === label);
                          const lostPicksForLabel = firstRoundLostPicks.filter(p => (p.pickLabel || "1位") === label);
                          
                          // 各試行（抽選外れ + 成功）を行として追加
                          for (let attempt = 0; attempt < maxAttempts; attempt++) {
                            rows.push(
                              <TableRow key={`round-1-${label}-${attempt}`}>
                                {attempt === 0 ? (
                                  <TableCell 
                                    rowSpan={maxAttempts}
                                    className="font-medium whitespace-nowrap sticky left-0 bg-background z-10 text-xs align-middle border-r w-20"
                                  >
                                    {label}
                                  </TableCell>
                                ) : null}
                                {displayOrder.map(teamId => {
                                  const team = teams.find(t => t.id === teamId);
                                  if (!team) return null;
                                  
                                  const lostForTeam = lostPicksForLabel.filter(lp => lp.teamId === teamId);
                                  const successPick = picksForLabel.find(p => p.teamId === teamId);
                                  
                                  // この試行が抽選外れの場合
                                  if (attempt < lostForTeam.length) {
                                    return (
                                      <TableCell key={team.id} className="whitespace-nowrap text-center text-xs text-muted-foreground/50 border-r w-28">
                                        {lostForTeam[attempt].playerName}
                                      </TableCell>
                                    );
                                  }
                                  // 最後の試行（実際の指名）
                                  else if (attempt === lostForTeam.length && successPick) {
                                    const player = players.find(p => p.id === successPick.playerId);
                                    return (
                                      <TableCell key={team.id} className="whitespace-nowrap text-center text-xs border-r w-28">
                                        {player ? (
                                          <div className="flex flex-col items-center gap-1">
                                            <span>{player.name}</span>
                                            {successPick.isContested && (
                                              <Badge variant="destructive" className="text-[10px] px-1 py-0">
                                                ⚡️競合
                                              </Badge>
                                            )}
                                          </div>
                                        ) : "―"}
                                      </TableCell>
                                    );
                                  }
                                  // 抽選がなかった球団
                                  else {
                                    return (
                                      <TableCell key={team.id} className="whitespace-nowrap text-center text-xs border-r w-28">
                                        ―
                                      </TableCell>
                                    );
                                  }
                                })}
                              </TableRow>
                            );
                          }
                        });
                      }
                      
                      // 2巡目以降は通常表示
                      for (let round = 2; round <= maxRound; round++) {
                        rows.push(
                          <TableRow key={`round-${round}`}>
                            <TableCell className="font-medium whitespace-nowrap sticky left-0 bg-background z-10 text-xs align-middle border-r w-20">
                              {round}位
                            </TableCell>
                            {displayOrder.map(teamId => {
                              const team = teams.find(t => t.id === teamId);
                              if (!team) return null;
                              const pick = simulationResult.picks.find(p => p.teamId === teamId && p.round === round);
                              const player = pick ? players.find(p => p.id === pick.playerId) : null;
                              
                              return (
                                <TableCell key={team.id} className="whitespace-nowrap text-center text-xs border-r w-28">
                                  {player ? player.name : "―"}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      }
                      
                      return rows;
                    })()}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />

      {/* 抽選アニメーション */}
      {showLottery && lotteryQueue.length > 0 && currentLotteryIndex < lotteryQueue.length && (
        <LotteryAnimation
          lotteryData={lotteryQueue[currentLotteryIndex]}
          teams={teams}
          onComplete={handleLotteryComplete}
        />
      )}

      {/* 選手選択ダイアログ */}
      <Dialog open={showPlayerSelection} onOpenChange={setShowPlayerSelection}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {currentPickInfo && (
                <>
                  第{currentPickInfo.round}巡目 - {teams.find(t => t.id === currentPickInfo.teamId)?.name}の指名
                </>
              )}
            </DialogTitle>
            {currentPickInfo && currentPickInfo.round === 1 && (
              <p className="text-sm text-muted-foreground mt-2">
                ⚡️ 1巡目は抽選制です。他球団と競合する可能性があります。
              </p>
            )}
          </DialogHeader>
          
          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            {/* Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">選手名</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="選手名で検索"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">ポジション</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="truncate">
                        {filterPositions.length === 0 ? "全ポジション" : `ポジション(${filterPositions.length})`}
                      </span>
                      <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-3 bg-background z-50">
                    <div className="space-y-2">
                      {positionOrder.map((position) => (
                        <div key={position} className="flex items-center space-x-2">
                          <Checkbox
                            id={`ai-position-${position}`}
                            checked={filterPositions.includes(position)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFilterPositions([...filterPositions, position]);
                              } else {
                                setFilterPositions(filterPositions.filter(p => p !== position));
                              }
                            }}
                          />
                          <label
                            htmlFor={`ai-position-${position}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {position}
                          </label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">カテゴリ</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="truncate">
                        {filterCategories.length === 0 ? "全カテゴリ" : `カテゴリ(${filterCategories.length})`}
                      </span>
                      <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-3 bg-background z-50">
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`ai-category-${category}`}
                            checked={filterCategories.includes(category)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFilterCategories([...filterCategories, category]);
                              } else {
                                setFilterCategories(filterCategories.filter(c => c !== category));
                              }
                            }}
                          />
                          <label
                            htmlFor={`ai-category-${category}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">評価</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="truncate">
                        {filterEvaluations.length === 0 ? "全評価" : `評価(${filterEvaluations.length})`}
                      </span>
                      <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-3 bg-background z-50">
                    <div className="space-y-2">
                      {evaluationOrder.map((evaluation) => (
                        <div key={evaluation} className="flex items-center space-x-2">
                          <Checkbox
                            id={`ai-evaluation-${evaluation}`}
                            checked={filterEvaluations.includes(evaluation)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFilterEvaluations([...filterEvaluations, evaluation]);
                              } else {
                                setFilterEvaluations(filterEvaluations.filter(e => e !== evaluation));
                              }
                            }}
                          />
                          <label
                            htmlFor={`ai-evaluation-${evaluation}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {evaluation}
                          </label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {filteredAvailablePlayers.length}件の選手が見つかりました
              </span>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                フィルターをクリア
              </Button>
            </div>

            {/* Player List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start mb-2"
                onClick={() => setIsPlayerFormOpen(true)}
              >
                選手を追加する
              </Button>
              
              {filteredAvailablePlayers.map((player) => (
                <Card 
                  key={player.id}
                  className="cursor-pointer transition-colors hover:bg-accent"
                  onClick={() => handlePlayerSelect(player.id)}
                >
                  <CardContent className="p-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <div className="font-medium">{player.name}</div>
                        <div className="text-muted-foreground text-xs">{player.category}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">ポジション</div>
                        <div>{Array.isArray(player.position) ? player.position.join(", ") : player.position}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">所属</div>
                        <div>{player.team}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">評価</div>
                        <div>{player.evaluations?.join(", ")}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PlayerFormDialog 
        isOpen={isPlayerFormOpen}
        onOpenChange={setIsPlayerFormOpen}
        onSuccess={() => {
          loadPlayers();
        }}
      />
    </div>
  );
}
