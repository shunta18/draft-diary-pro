import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getDefaultPlayers, Player as LocalPlayer } from "@/lib/playerStorage";
import {
  upsertPlayerVote,
  upsertPositionVote,
  getUserVotes,
  getPlayerVoteCounts,
  getPositionVoteCounts,
} from "@/lib/draftPredictions";
import { Vote, TrendingUp, Plus } from "lucide-react";
import { PlayerSelectionDialog } from "@/components/PlayerSelectionDialog";

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

const positions = ["投手", "捕手", "一塁手", "二塁手", "三塁手", "遊撃手", "外野手"];

interface RawSupabasePlayer {
  id: number;
  name: string;
  team: string;
  position: string;
  category: string;
  year?: number;
  evaluations: string[];
}

interface NormalizedPlayer {
  id: number;
  name: string;
  team: string;
  position: string[];
  category: string;
  evaluations: string[];
  draftYear: string;
  videoLinks: string[];
}

const normalizeSupabasePlayer = (player: RawSupabasePlayer): NormalizedPlayer => ({
  ...player,
  position: [player.position],
  draftYear: player.year ? String(player.year) : "2025",
  videoLinks: [],
});

const normalizeLocalPlayer = (player: LocalPlayer): NormalizedPlayer => ({
  id: player.id,
  name: player.name,
  team: player.team,
  position: player.position,
  category: player.category,
  evaluations: player.evaluations,
  draftYear: player.draftYear,
  videoLinks: player.videoLinks,
});

const ADMIN_USER_ID = "5cc66826-fb1d-4743-a18c-98265fbe55f4";

export default function DraftPredictions() {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedTeam, setSelectedTeam] = useState(1);
  const [players, setPlayers] = useState<NormalizedPlayer[]>([]);
  const [userPlayerVotes, setUserPlayerVotes] = useState<{ team_id: number; public_player_id: number }[]>([]);
  const [userPositionVotes, setUserPositionVotes] = useState<{ team_id: number; position: string; draft_round: number }[]>([]);
  const [playerVoteCounts, setPlayerVoteCounts] = useState<Record<string, number>>({});
  const [positionVoteCounts, setPositionVoteCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [tempPositionSelections, setTempPositionSelections] = useState<Record<number, string>>({});
  const { toast } = useToast();
  const { user } = useAuth();

  // データ読み込み
  useEffect(() => {
    loadData();
  }, [user, selectedYear]);

  const loadData = async () => {
    setIsLoading(true);

    // AdminのデータからS選手データを読み込み
    const { data, error } = await supabase
      .from("players")
      .select("id, name, team, position, category, year, evaluations")
      .eq("user_id", ADMIN_USER_ID);

    let allPlayers: NormalizedPlayer[] = [];
    if (!error && data && data.length > 0) {
      allPlayers = data.map(normalizeSupabasePlayer);
    } else {
      allPlayers = getDefaultPlayers().map(normalizeLocalPlayer);
    }

    // 選択された年度の選手のみをフィルタリング
    const filteredPlayers = allPlayers.filter(
      (player) => player.draftYear === selectedYear
    );
    setPlayers(filteredPlayers);

    // ユーザーの投票状態を読み込み
    const { playerVotes, positionVotes } = await getUserVotes(selectedYear);
    setUserPlayerVotes(playerVotes);
    setUserPositionVotes(positionVotes);

    // 全体の投票数を読み込み
    const { voteCounts: playerCounts } = await getPlayerVoteCounts(selectedYear);
    setPlayerVoteCounts(playerCounts);

    const { voteCounts: positionCounts } = await getPositionVoteCounts(selectedYear);
    setPositionVoteCounts(positionCounts);

    setIsLoading(false);
  };

  // Realtime更新のリスナー設定
  useEffect(() => {
    const playerChannel = supabase
      .channel("draft_team_player_votes_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "draft_team_player_votes",
        },
        async () => {
          const { voteCounts } = await getPlayerVoteCounts(selectedYear);
          setPlayerVoteCounts(voteCounts);
        }
      )
      .subscribe();

    const positionChannel = supabase
      .channel("draft_team_position_votes_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "draft_team_position_votes",
        },
        async () => {
          const { voteCounts } = await getPositionVoteCounts();
          setPositionVoteCounts(voteCounts);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(playerChannel);
      supabase.removeChannel(positionChannel);
    };
  }, []);

  const handlePlayerVoteToggle = async (playerId: number, isChecked: boolean) => {
    const { error } = await upsertPlayerVote(selectedTeam, playerId, isChecked, selectedYear);

    if (error) {
      toast({
        title: "エラー",
        description: "投票の更新に失敗しました",
        variant: "destructive",
      });
      return;
    }

    // ローカル状態を更新
    if (isChecked) {
      setUserPlayerVotes([...userPlayerVotes, { team_id: selectedTeam, public_player_id: playerId }]);
    } else {
      setUserPlayerVotes(
        userPlayerVotes.filter((v) => !(v.team_id === selectedTeam && v.public_player_id === playerId))
      );
    }

    // 投票数を再読み込み
    const { voteCounts } = await getPlayerVoteCounts(selectedYear);
    setPlayerVoteCounts(voteCounts);
  };

  const handlePositionVoteChange = async (draftRound: number, position: string | null) => {
    const { error } = await upsertPositionVote(selectedTeam, draftRound, position, selectedYear);

    if (error) {
      toast({
        title: "エラー",
        description: "投票の更新に失敗しました",
        variant: "destructive",
      });
      return;
    }

    // ローカル状態を更新
    if (position) {
      const existingIndex = userPositionVotes.findIndex(
        (v) => v.team_id === selectedTeam && v.draft_round === draftRound
      );
      
      if (existingIndex >= 0) {
        const newVotes = [...userPositionVotes];
        newVotes[existingIndex] = { team_id: selectedTeam, position, draft_round: draftRound };
        setUserPositionVotes(newVotes);
      } else {
        setUserPositionVotes([...userPositionVotes, { team_id: selectedTeam, position, draft_round: draftRound }]);
      }
      
      // 投票完了のフィードバック
      toast({
        title: "投票完了",
        description: `${draftRound}位: ${position}に投票しました`,
      });
    } else {
      setUserPositionVotes(
        userPositionVotes.filter((v) => !(v.team_id === selectedTeam && v.draft_round === draftRound))
      );
      
      toast({
        title: "投票取消",
        description: `${draftRound}位の投票を取り消しました`,
      });
    }

    // 投票数を再読み込み
    const { voteCounts } = await getPositionVoteCounts(selectedYear);
    setPositionVoteCounts(voteCounts);
  };

  const isPlayerVoted = (playerId: number) => {
    return userPlayerVotes.some((v) => v.team_id === selectedTeam && v.public_player_id === playerId);
  };

  const getSelectedPosition = (draftRound: number): string | undefined => {
    return userPositionVotes.find((v) => v.team_id === selectedTeam && v.draft_round === draftRound)?.position;
  };

  const getPlayerVoteCount = (playerId: number) => {
    return playerVoteCounts[`${selectedTeam}_${playerId}`] || 0;
  };

  const getPositionVoteCount = (draftRound: number, position: string) => {
    return positionVoteCounts[`${selectedTeam}_${draftRound}_${position}`] || 0;
  };

  // ソート: 投票数の多い順
  const sortedPlayers = [...players].sort((a, b) => {
    const countA = getPlayerVoteCount(a.id);
    const countB = getPlayerVoteCount(b.id);
    return countB - countA;
  });

  const maxPlayerVotes = Math.max(...sortedPlayers.map((p) => getPlayerVoteCount(p.id)), 1);

  // ドラフト順位ごとのソート済みポジション
  const getSortedPositionsForRound = (draftRound: number) => {
    return [...positions].sort((a, b) => {
      const countA = getPositionVoteCount(draftRound, a);
      const countB = getPositionVoteCount(draftRound, b);
      return countB - countA;
    });
  };

  const getMaxPositionVotesForRound = (draftRound: number) => {
    return Math.max(...positions.map((p) => getPositionVoteCount(draftRound, p)), 1);
  };

  const handleBulkPositionVote = async () => {
    const selections = Object.entries(tempPositionSelections);
    
    if (selections.length === 0) {
      toast({
        title: "エラー",
        description: "少なくとも1つのポジションを選択してください",
        variant: "destructive",
      });
      return;
    }

    let hasError = false;
    for (const [round, position] of selections) {
      const { error } = await upsertPositionVote(selectedTeam, parseInt(round), position, selectedYear);
      if (error) {
        hasError = true;
        break;
      }
    }

    if (hasError) {
      toast({
        title: "エラー",
        description: "投票の更新に失敗しました",
        variant: "destructive",
      });
      return;
    }

    // ローカル状態を更新
    const newVotes = selections.map(([round, position]) => ({
      team_id: selectedTeam,
      position,
      draft_round: parseInt(round),
    }));
    
    setUserPositionVotes([
      ...userPositionVotes.filter((v) => v.team_id !== selectedTeam),
      ...newVotes,
    ]);

    setTempPositionSelections({});

    toast({
      title: "投票完了",
      description: "補強ポジションの投票が完了しました",
    });

    // 投票数を再読み込み
    const { voteCounts } = await getPositionVoteCounts(selectedYear);
    setPositionVoteCounts(voteCounts);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted/20">
      <SEO
        title="ドラフトアンケート - みんなで予想する2025年プロ野球ドラフト"
        description="各球団が注目する選手や補強ポジションに投票して、2025年プロ野球ドラフトの行方を予測しましょう。投票結果はAI仮想ドラフトに反映されます。"
        keywords={["プロ野球ドラフト", "ドラフトアンケート", "投票", "2025年ドラフト", "注目選手", "補強ポジション"]}
      />
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* ヘッダー */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Vote className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">ドラフトアンケート</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              各球団が注目する選手や補強ポジションを予測して投票しよう！<br />
              投票結果はAI仮想ドラフトに反映されます。
            </p>
          </div>

          {/* 年度選択 */}
          <Card>
            <CardHeader>
              <CardTitle>年度を選択</CardTitle>
              <CardDescription>投票する年度を選んでください</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {["2025"].map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                      selectedYear === year
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {year}年
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 球団選択 */}
          <Card>
            <CardHeader>
              <CardTitle>球団を選択</CardTitle>
              <CardDescription>投票したい球団を選んでください</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {teams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeam(team.id)}
                    className={`p-3 rounded-lg border-2 transition-all font-semibold text-white ${
                      selectedTeam === team.id
                        ? `bg-gradient-to-r ${team.color} border-white shadow-lg scale-105`
                        : `bg-gradient-to-r ${team.color} border-transparent opacity-30 hover:opacity-100 hover:scale-105`
                    }`}
                  >
                    {team.shortName}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 投票セクション */}
          <Tabs defaultValue="players" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="players">注目選手投票</TabsTrigger>
              <TabsTrigger value="positions">補強ポジション投票</TabsTrigger>
            </TabsList>

            {/* 選手投票 */}
            <TabsContent value="players" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {teams.find((t) => t.id === selectedTeam)?.name}が注目する選手
                  </CardTitle>
                  <CardDescription>
                    この球団が注目しそうな選手を選択してください（複数選択可）
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p className="text-muted-foreground text-center py-8">読み込み中...</p>
                  ) : (
                    <div className="space-y-4">
                      {/* 選手を追加ボタン */}
                      <PlayerSelectionDialog
                        players={players}
                        draftYear={selectedYear}
                        onSelect={(playerId) => {
                          if (playerId !== undefined) {
                            handlePlayerVoteToggle(playerId, true);
                          }
                        }}
                        onPlayerAdded={() => loadData()}
                      >
                        <Button variant="outline" className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          選手を検索して追加
                        </Button>
                      </PlayerSelectionDialog>

                      {/* 投票済みの選手一覧 */}
                      <div className="space-y-2 max-h-[500px] overflow-y-auto">
                      {userPlayerVotes
                          .filter((v) => v.team_id === selectedTeam)
                          .map((vote) => {
                            const player = players.find((p) => p.id === vote.public_player_id);
                            if (!player) return null;
                            
                            const voteCount = getPlayerVoteCount(player.id);
                            const votePercentage = (voteCount / maxPlayerVotes) * 100;

                            return (
                              <div
                                key={player.id}
                                className="flex items-center gap-3 p-3 rounded-lg border bg-accent/30"
                              >
                                <Checkbox
                                  checked={true}
                                  onCheckedChange={(checked) =>
                                    handlePlayerVoteToggle(player.id, checked as boolean)
                                  }
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-semibold">{player.name}</p>
                                    <Badge variant="outline" className="text-xs">
                                      {player.team}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      {Array.isArray(player.position) ? player.position.join("/") : player.position}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Progress value={votePercentage} className="h-2 flex-1" />
                                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                                      {voteCount}票
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        
                        {userPlayerVotes.filter((v) => v.team_id === selectedTeam).length === 0 && (
                          <p className="text-center text-muted-foreground py-8">
                            まだ選手が選択されていません。<br />
                            上のボタンから選手を検索して追加してください。
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ポジション投票 */}
            <TabsContent value="positions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {teams.find((t) => t.id === selectedTeam)?.name}のドラフト指名予想
                  </CardTitle>
                  <CardDescription>
                    各順位で指名したいポジションを選択してから、投票ボタンを押してください
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* 投票ボタン */}
                    <Button 
                      onClick={handleBulkPositionVote}
                      size="lg"
                      className="w-full"
                      disabled={Object.keys(tempPositionSelections).length === 0}
                    >
                      <Vote className="h-5 w-5 mr-2" />
                      投票する
                    </Button>

                    {[1, 2, 3, 4, 5].map((round) => {
                      const selectedPosition = tempPositionSelections[round] || getSelectedPosition(round);
                      const sortedPositions = getSortedPositionsForRound(round);
                      const maxVotes = getMaxPositionVotesForRound(round);

                      return (
                        <div key={round} className="space-y-3">
                          <div className="space-y-2">
                            <div className="font-bold text-lg">ドラフト{round}位</div>
                            <Select
                              value={selectedPosition}
                              onValueChange={(value) => {
                                setTempPositionSelections({
                                  ...tempPositionSelections,
                                  [round]: value,
                                });
                              }}
                            >
                              <SelectTrigger className={selectedPosition ? "bg-accent/50 border-primary" : ""}>
                                <SelectValue placeholder="ポジションを選択" />
                              </SelectTrigger>
                              <SelectContent>
                                {positions.map((position) => (
                                  <SelectItem key={position} value={position}>
                                    {position}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* トップ3のポジション投票数を表示 */}
                          <div className="space-y-2">
                            {sortedPositions.slice(0, 3).map((position) => {
                              const voteCount = getPositionVoteCount(round, position);
                              const votePercentage = maxVotes > 0 ? (voteCount / maxVotes) * 100 : 0;
                              
                              if (voteCount === 0) return null;

                              return (
                                <div key={position} className="flex items-center gap-2">
                                  <span className="text-sm font-medium w-20">{position}</span>
                                  <Progress value={votePercentage} className="h-2 flex-1" />
                                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                                    {voteCount}票
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
