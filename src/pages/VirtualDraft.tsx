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
import { getPlayers, Player as LocalPlayer } from "@/lib/playerStorage";
import { Shuffle, Trophy, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  { id: 1, name: "北海道日本ハムファイターズ", color: "from-blue-600 to-blue-800" },
  { id: 2, name: "東北楽天ゴールデンイーグルス", color: "from-red-700 to-red-900" },
  { id: 3, name: "埼玉西武ライオンズ", color: "from-blue-500 to-blue-700" },
  { id: 4, name: "千葉ロッテマリーンズ", color: "from-gray-800 to-black" },
  { id: 5, name: "オリックス・バファローズ", color: "from-blue-600 to-gray-800" },
  { id: 6, name: "福岡ソフトバンクホークス", color: "from-yellow-500 to-yellow-700" },
  { id: 7, name: "読売ジャイアンツ", color: "from-orange-500 to-orange-700" },
  { id: 8, name: "東京ヤクルトスワローズ", color: "from-green-600 to-green-800" },
  { id: 9, name: "横浜DeNAベイスターズ", color: "from-blue-500 to-blue-700" },
  { id: 10, name: "中日ドラゴンズ", color: "from-blue-700 to-blue-900" },
  { id: 11, name: "阪神タイガース", color: "from-yellow-500 to-yellow-700" },
  { id: 12, name: "広島東洋カープ", color: "from-red-600 to-red-800" },
];

interface TeamSelection {
  teamId: number;
  playerId: number | null;
  playerName: string | null;
}

interface LotteryResult {
  playerId: number;
  playerName: string;
  competingTeams: number[];
  winner: number;
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
    teams.map(team => ({ teamId: team.id, playerId: null, playerName: null }))
  );
  const [lotteryResults, setLotteryResults] = useState<LotteryResult[]>([]);
  const [isLotteryComplete, setIsLotteryComplete] = useState(false);
  const [loading, setLoading] = useState(true);

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
        const localPlayers = getPlayers();
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
    setIsLotteryComplete(false);
    setLotteryResults([]);
  };

  const executeLottery = () => {
    // 被り選手を抽出
    const playerCounts = new Map<number, number[]>();
    
    selections.forEach(sel => {
      if (sel.playerId) {
        const teams = playerCounts.get(sel.playerId) || [];
        teams.push(sel.teamId);
        playerCounts.set(sel.playerId, teams);
      }
    });

    // 抽選実行
    const results: LotteryResult[] = [];
    
    playerCounts.forEach((competingTeams, playerId) => {
      if (competingTeams.length > 1) {
        const player = players.find(p => p.id === playerId);
        const winner = competingTeams[Math.floor(Math.random() * competingTeams.length)];
        
        results.push({
          playerId,
          playerName: player?.name || "不明",
          competingTeams,
          winner,
        });
      }
    });

    setLotteryResults(results);
    setIsLotteryComplete(true);

    toast({
      title: "抽選完了",
      description: `${results.length}名の選手について抽選を実施しました`,
    });
  };

  const getTeamName = (teamId: number) => {
    return teams.find(t => t.id === teamId)?.name || "";
  };

  const isTeamWinner = (teamId: number, playerId: number) => {
    const result = lotteryResults.find(r => r.playerId === playerId);
    return result?.winner === teamId;
  };

  const isTeamLoser = (teamId: number, playerId: number) => {
    const result = lotteryResults.find(r => r.playerId === playerId);
    return result && result.competingTeams.includes(teamId) && result.winner !== teamId;
  };

  const allTeamsSelected = selections.every(sel => sel.playerId !== null);

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
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">仮想ドラフト会議</h1>
          <p className="text-muted-foreground">
            12球団すべての1位指名を自分で決めて、実際のドラフト会議のように抽選をシミュレートできます。
          </p>
        </header>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              使い方
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>1. 各球団の1位指名選手を選択してください</p>
            <p>2. すべての球団で選択が完了したら「抽選実行」ボタンが表示されます</p>
            <p>3. 複数球団が同じ選手を指名した場合、ランダムで獲得球団が決まります</p>
            <p>4. 抽選結果は各球団のカードに表示されます</p>
          </CardContent>
        </Card>

        {allTeamsSelected && !isLotteryComplete && (
          <div className="mb-8 text-center">
            <Button 
              size="lg" 
              onClick={executeLottery}
              className="gap-2"
            >
              <Shuffle className="h-5 w-5" />
              抽選実行
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map(team => {
            const selection = selections.find(s => s.teamId === team.id);
            const isWinner = selection?.playerId && isTeamWinner(team.id, selection.playerId);
            const isLoser = selection?.playerId && isTeamLoser(team.id, selection.playerId);
            
            return (
              <Card key={team.id} className={`${isWinner ? 'ring-2 ring-green-500' : isLoser ? 'opacity-60' : ''}`}>
                <CardHeader className={`bg-gradient-to-r ${team.color} text-white rounded-t-lg`}>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{team.name}</span>
                    {isWinner && <Trophy className="h-5 w-5 text-yellow-300" />}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">1位指名</p>
                      {selection?.playerName ? (
                        <div className="space-y-2">
                          <p className="font-semibold text-lg">{selection.playerName}</p>
                          {isLotteryComplete && (
                            <div>
                              {isWinner && (
                                <Badge variant="default" className="bg-green-600">
                                  抽選獲得
                                </Badge>
                              )}
                              {isLoser && (
                                <Badge variant="secondary">
                                  抽選外れ
                                </Badge>
                              )}
                              {!isWinner && !isLoser && selection.playerId && (
                                <Badge variant="default">
                                  単独指名
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">未選択</p>
                      )}
                    </div>
                    
                    <PlayerSelectionDialog
                      players={players}
                      selectedPlayerId={selection?.playerId || null}
                      onSelect={(playerId) => handlePlayerSelect(team.id, playerId)}
                    >
                      <Button variant="outline" className="w-full">
                        選手を選択
                      </Button>
                    </PlayerSelectionDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {isLotteryComplete && lotteryResults.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shuffle className="h-5 w-5" />
                抽選結果
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lotteryResults.map(result => (
                  <div key={result.playerId} className="border-b pb-4 last:border-b-0">
                    <h3 className="font-semibold text-lg mb-2">{result.playerName}</h3>
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
            </CardContent>
          </Card>
        )}

        {!user && (
          <Card className="mt-8 border-yellow-500">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                ゲストモードでは、仮想ドラフトの結果を保存できません。
                結果を保存するには、
                <Button 
                  variant="link" 
                  className="px-1" 
                  onClick={() => navigate("/auth")}
                >
                  ログイン
                </Button>
                してください。
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default VirtualDraft;
