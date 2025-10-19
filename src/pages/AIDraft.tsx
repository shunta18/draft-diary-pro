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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

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
  
  // スコアリング重み設定
  const [weights, setWeights] = useState<WeightConfig>({
    voteWeight: 40,
    teamNeedsWeight: 30,
    playerRatingWeight: 20,
    realismWeight: 10
  });

  useEffect(() => {
    loadPlayers();
  }, [user]);

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

    try {
      const result = await runDraftSimulation(
        players,
        maxRounds,
        weights,
        "2025",
        (round) => {
          setCurrentSimulationRound(round);
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
      
      setSimulationResult(result);
      toast({
        title: "シミュレーション完了",
        description: `${result.picks.length}名の指名が完了しました`,
      });
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
        <Card>
          <CardHeader>
            <CardTitle>操作球団選択</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Label>操作する球団を選択してください（複数選択可能）</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {teams.map(team => (
                  <div 
                    key={team.id} 
                    className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      id={`team-${team.id}`}
                      checked={userTeamIds.includes(team.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setUserTeamIds([...userTeamIds, team.id]);
                        } else {
                          setUserTeamIds(userTeamIds.filter(id => id !== team.id));
                        }
                      }}
                    />
                    <label
                      htmlFor={`team-${team.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className={`px-3 py-1.5 rounded text-sm font-medium text-white bg-gradient-to-r ${team.color}`}>
                        {team.name}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
              {userTeamIds.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {userTeamIds.length}球団を選択中
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 設定パネル */}
        {showSettings && (
          <Card>
            <CardHeader>
              <CardTitle>スコアリング重み設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>投票データスコア: {weights.voteWeight}%</Label>
                <Slider
                  value={[weights.voteWeight]}
                  onValueChange={([value]) => setWeights(prev => ({ ...prev, voteWeight: value }))}
                  max={100}
                  step={5}
                />
              </div>
              <div className="space-y-2">
                <Label>チームニーズスコア: {weights.teamNeedsWeight}%</Label>
                <Slider
                  value={[weights.teamNeedsWeight]}
                  onValueChange={([value]) => setWeights(prev => ({ ...prev, teamNeedsWeight: value }))}
                  max={100}
                  step={5}
                />
              </div>
              <div className="space-y-2">
                <Label>選手評価スコア: {weights.playerRatingWeight}%</Label>
                <Slider
                  value={[weights.playerRatingWeight]}
                  onValueChange={([value]) => setWeights(prev => ({ ...prev, playerRatingWeight: value }))}
                  max={100}
                  step={5}
                />
              </div>
              <div className="space-y-2">
                <Label>現実性調整スコア: {weights.realismWeight}%</Label>
                <Slider
                  value={[weights.realismWeight]}
                  onValueChange={([value]) => setWeights(prev => ({ ...prev, realismWeight: value }))}
                  max={100}
                  step={5}
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
              <div className="pt-4 text-sm text-muted-foreground">
                <p>合計: {weights.voteWeight + weights.teamNeedsWeight + weights.playerRatingWeight + weights.realismWeight}%</p>
                <p className="text-xs mt-1">※ 合計が100%になるように調整してください</p>
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
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">球団</TableHead>
                      {Array.from({ length: maxRounds }, (_, i) => i + 1).map(round => (
                        <TableHead key={round} className="text-center min-w-[120px]">
                          {round}位
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayOrder.map(teamId => {
                      const team = teams.find(t => t.id === teamId);
                      const picks = getTeamPicks(teamId);
                      
                      return (
                        <TableRow key={teamId}>
                          <TableCell className="font-medium">
                            <div className={`text-xs px-2 py-1 rounded bg-gradient-to-r ${team?.color} text-white`}>
                              {team?.shortName}
                            </div>
                          </TableCell>
                          {Array.from({ length: maxRounds }, (_, i) => i + 1).map(round => {
                            const pick = picks.find(p => p.round === round);
                            const summaryItem = simulationResult.summary.find(
                              s => s.teamId === teamId && s.round === round
                            );
                            
                            return (
                              <TableCell key={round} className="text-center">
                                {pick ? (
                                  <div className="space-y-1">
                                    <div className="font-medium text-sm">{pick.playerName}</div>
                                    {summaryItem && (
                                      <>
                                        <Badge variant="secondary" className="text-xs">
                                          {summaryItem.score.totalScore.toFixed(1)}点
                                        </Badge>
                                        <div className="text-xs text-muted-foreground">
                                          {summaryItem.score.reason}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
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
          </div>
        )}
      </main>

      <Footer />

      {/* 選手選択ダイアログ */}
      <Dialog open={showPlayerSelection} onOpenChange={setShowPlayerSelection}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {currentPickInfo && (
                <>
                  第{currentPickInfo.round}巡目 - {teams.find(t => t.id === currentPickInfo.teamId)?.name}の指名
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-2 p-4">
              {availablePlayersForSelection.map((player) => (
                <Card 
                  key={player.id}
                  className="cursor-pointer transition-colors hover:bg-accent"
                  onClick={() => handlePlayerSelect(player.id)}
                >
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <div className="font-medium text-base">{player.name}</div>
                        <div className="text-muted-foreground text-xs">{player.category}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">ポジション</div>
                        <div>{Array.isArray(player.position) ? player.position.join(", ") : player.position}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">所属</div>
                        <div>{player.team}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">評価</div>
                        <div>{player.evaluations?.join(", ")}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
