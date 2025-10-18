import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
import { Vote, TrendingUp } from "lucide-react";

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
  evaluations: string[];
}

interface NormalizedPlayer {
  id: number;
  name: string;
  team: string;
  position: string[];
  category: string;
  evaluations: string[];
}

const normalizeSupabasePlayer = (player: RawSupabasePlayer): NormalizedPlayer => ({
  ...player,
  position: [player.position],
});

const normalizeLocalPlayer = (player: LocalPlayer): NormalizedPlayer => ({
  id: player.id,
  name: player.name,
  team: player.team,
  position: player.position,
  category: player.category,
  evaluations: player.evaluations,
});

export default function DraftPredictions() {
  const [selectedTeam, setSelectedTeam] = useState(1);
  const [players, setPlayers] = useState<NormalizedPlayer[]>([]);
  const [userPlayerVotes, setUserPlayerVotes] = useState<{ team_id: number; player_id: number }[]>([]);
  const [userPositionVotes, setUserPositionVotes] = useState<{ team_id: number; position: string }[]>([]);
  const [playerVoteCounts, setPlayerVoteCounts] = useState<Record<string, number>>({});
  const [positionVoteCounts, setPositionVoteCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // データ読み込み
  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);

    // 選手データの読み込み
    if (user) {
      const { data, error } = await supabase
        .from("players")
        .select("id, name, team, position, category, evaluations")
        .eq("user_id", user.id);

      if (!error && data && data.length > 0) {
        setPlayers(data.map(normalizeSupabasePlayer));
      } else {
        setPlayers(getDefaultPlayers().map(normalizeLocalPlayer));
      }
    } else {
      setPlayers(getDefaultPlayers().map(normalizeLocalPlayer));
    }

    // ユーザーの投票状態を読み込み
    const { playerVotes, positionVotes } = await getUserVotes();
    setUserPlayerVotes(playerVotes);
    setUserPositionVotes(positionVotes);

    // 全体の投票数を読み込み
    const { voteCounts: playerCounts } = await getPlayerVoteCounts();
    setPlayerVoteCounts(playerCounts);

    const { voteCounts: positionCounts } = await getPositionVoteCounts();
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
          const { voteCounts } = await getPlayerVoteCounts();
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
    const { error } = await upsertPlayerVote(selectedTeam, playerId, isChecked);

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
      setUserPlayerVotes([...userPlayerVotes, { team_id: selectedTeam, player_id: playerId }]);
    } else {
      setUserPlayerVotes(
        userPlayerVotes.filter((v) => !(v.team_id === selectedTeam && v.player_id === playerId))
      );
    }

    // 投票数を再読み込み
    const { voteCounts } = await getPlayerVoteCounts();
    setPlayerVoteCounts(voteCounts);
  };

  const handlePositionVoteToggle = async (position: string, isChecked: boolean) => {
    const { error } = await upsertPositionVote(selectedTeam, position, isChecked);

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
      setUserPositionVotes([...userPositionVotes, { team_id: selectedTeam, position }]);
    } else {
      setUserPositionVotes(
        userPositionVotes.filter((v) => !(v.team_id === selectedTeam && v.position === position))
      );
    }

    // 投票数を再読み込み
    const { voteCounts } = await getPositionVoteCounts();
    setPositionVoteCounts(voteCounts);
  };

  const isPlayerVoted = (playerId: number) => {
    return userPlayerVotes.some((v) => v.team_id === selectedTeam && v.player_id === playerId);
  };

  const isPositionVoted = (position: string) => {
    return userPositionVotes.some((v) => v.team_id === selectedTeam && v.position === position);
  };

  const getPlayerVoteCount = (playerId: number) => {
    return playerVoteCounts[`${selectedTeam}_${playerId}`] || 0;
  };

  const getPositionVoteCount = (position: string) => {
    return positionVoteCounts[`${selectedTeam}_${position}`] || 0;
  };

  // ソート: 投票数の多い順
  const sortedPlayers = [...players].sort((a, b) => {
    const countA = getPlayerVoteCount(a.id);
    const countB = getPlayerVoteCount(b.id);
    return countB - countA;
  });

  const maxPlayerVotes = Math.max(...sortedPlayers.map((p) => getPlayerVoteCount(p.id)), 1);

  const sortedPositions = [...positions].sort((a, b) => {
    const countA = getPositionVoteCount(a);
    const countB = getPositionVoteCount(b);
    return countB - countA;
  });

  const maxPositionVotes = Math.max(...sortedPositions.map((p) => getPositionVoteCount(p)), 1);

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
              <h1 className="text-4xl font-bold">2025年ドラフトアンケート</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              各球団が注目する選手や補強ポジションを予測して投票しよう！<br />
              投票結果はAI仮想ドラフトに反映されます。
            </p>
          </div>

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
                        : `bg-gradient-to-r ${team.color} border-transparent opacity-70 hover:opacity-100 hover:scale-105`
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
                    この球団が指名しそうな選手にチェックを入れてください（複数選択可）
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p className="text-muted-foreground text-center py-8">読み込み中...</p>
                  ) : (
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                      {sortedPlayers.map((player) => {
                        const voteCount = getPlayerVoteCount(player.id);
                        const votePercentage = (voteCount / maxPlayerVotes) * 100;

                        return (
                          <div
                            key={player.id}
                            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                          >
                            <Checkbox
                              checked={isPlayerVoted(player.id)}
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
                    {teams.find((t) => t.id === selectedTeam)?.name}の補強ポジション
                  </CardTitle>
                  <CardDescription>
                    この球団が補強したいポジションにチェックを入れてください（複数選択可）
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {sortedPositions.map((position) => {
                      const voteCount = getPositionVoteCount(position);
                      const votePercentage = (voteCount / maxPositionVotes) * 100;

                      return (
                        <div
                          key={position}
                          className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                        >
                          <Checkbox
                            checked={isPositionVoted(position)}
                            onCheckedChange={(checked) =>
                              handlePositionVoteToggle(position, checked as boolean)
                            }
                          />
                          <div className="flex-1">
                            <p className="font-semibold mb-2">{position}</p>
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
