import { useState, useEffect } from "react";
import { Search, Filter, Eye, Download, User, Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { getPublicPlayers, importPlayerFromPublic, incrementPublicPlayerViewCount, type PublicPlayer } from "@/lib/supabase-storage";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const evaluationColors = {
  "1位競合": "bg-red-500 text-white",
  "1位一本釣り": "bg-red-400 text-white",
  "外れ1位": "bg-orange-500 text-white",
  "2位": "bg-yellow-500 text-white",
  "3位": "bg-green-500 text-white",
  "4位": "bg-blue-500 text-white",
  "5位": "bg-indigo-500 text-white",
  "6位以下": "bg-gray-500 text-white",
  "育成": "bg-purple-500 text-white",
};

const evaluationOrder = [
  "1位競合", "1位一本釣り", "外れ1位", "2位", "3位", 
  "4位", "5位", "6位以下", "育成"
];

const sortEvaluations = (evaluations: string[]) => {
  return [...evaluations].sort((a, b) => {
    const indexA = evaluationOrder.indexOf(a);
    const indexB = evaluationOrder.indexOf(b);
    return indexA - indexB;
  });
};

const positionOrder = [
  "投手", "捕手", "一塁手", "二塁手", "三塁手", "遊撃手", "外野手", "指名打者"
];

const sortPositions = (positionsStr: string) => {
  const positions = positionsStr.split(/[,、]/).map(p => p.trim()).filter(p => p);
  return positions.sort((a, b) => {
    const indexA = positionOrder.indexOf(a);
    const indexB = positionOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  }).join("、");
};

const teamColors: { [key: string]: string } = {
  "読売ジャイアンツ": "bg-orange-500 text-white",
  "阪神タイガース": "bg-yellow-500 text-black",
  "中日ドラゴンズ": "bg-blue-500 text-white",
  "広島東洋カープ": "bg-red-500 text-white",
  "東京ヤクルトスワローズ": "bg-green-500 text-white",
  "横浜DeNAベイスターズ": "bg-blue-600 text-white",
  "福岡ソフトバンクホークス": "bg-yellow-400 text-black",
  "北海道日本ハムファイターズ": "bg-blue-700 text-white",
  "千葉ロッテマリーンズ": "bg-blue-400 text-white",
  "埼玉西武ライオンズ": "bg-blue-800 text-white",
  "東北楽天ゴールデンイーグルス": "bg-red-600 text-white",
  "オリックス・バファローズ": "bg-blue-900 text-white",
};

export default function PublicPlayers() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedEvaluations, setSelectedEvaluations] = useState<string[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<PublicPlayer | null>(null);
  const [players, setPlayers] = useState<PublicPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"latest" | "views" | "imports">("latest");

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    setLoading(true);
    try {
      const data = await getPublicPlayers();
      setPlayers(data);
    } catch (error) {
      console.error('Failed to load public players:', error);
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.team.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = selectedYear === "all" || player.year?.toString() === selectedYear;
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(player.category);
    
    const playerPositions = player.position.split(/[,、]/).map(p => p.trim());
    const matchesPosition = selectedPositions.length === 0 || 
      playerPositions.some(pos => selectedPositions.includes(pos));
    
    const matchesEvaluation = selectedEvaluations.length === 0 || 
      (player.evaluations && player.evaluations.some(evaluation => selectedEvaluations.includes(evaluation)));
    
    return matchesSearch && matchesYear && matchesCategory && matchesPosition && matchesEvaluation;
  });

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (sortBy === "views") {
      return b.view_count - a.view_count;
    } else if (sortBy === "imports") {
      return b.import_count - a.import_count;
    } else {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const handlePlayerClick = async (player: PublicPlayer) => {
    setSelectedPlayer(player);
    await incrementPublicPlayerViewCount(player.id);
    loadPlayers();
  };

  const handleImport = async (player: PublicPlayer) => {
    if (!user) {
      toast({
        title: "ログインが必要です",
        description: "選手をインポートするにはログインしてください。",
        variant: "destructive",
      });
      return;
    }

    const result = await importPlayerFromPublic(player.id);
    if (result) {
      toast({
        title: "選手をインポートしました",
        description: `${player.name}を自分の選手リストに追加しました。`,
      });
      loadPlayers();
    } else {
      toast({
        title: "エラー",
        description: "選手のインポートに失敗しました。",
        variant: "destructive",
      });
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedYear("all");
    setSelectedCategories([]);
    setSelectedPositions([]);
    setSelectedEvaluations([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Navigation />
      <SEO
        title="ドラフト候補データベース"
        description="全ユーザーが公開したドラフト候補選手を検索・閲覧できます。"
        keywords={["ドラフト候補", "選手データベース", "公開選手"]}
      />
      
      <div className="bg-card border-b shadow-soft">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-primary">ドラフト候補データベース</h1>
          <p className="text-muted-foreground mt-1">全ユーザーが公開した選手を検索</p>
        </div>
      </div>

      <Tabs defaultValue="players" className="p-4">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="players">選手を探す</TabsTrigger>
          <TabsTrigger value="users" onClick={() => navigate('/public-players/users')}>投稿者から探す</TabsTrigger>
        </TabsList>

        <TabsContent value="players" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="選手名、チーム名で検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      絞り込み
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      {/* Filters content */}
                      <div className="space-y-2">
                        <Label>年度</Label>
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                          <SelectTrigger>
                            <SelectValue placeholder="年度を選択" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">すべて</SelectItem>
                            <SelectItem value="2025">2025年</SelectItem>
                            <SelectItem value="2024">2024年</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>カテゴリ</Label>
                        {["高校", "大学", "社会人"].map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category}`}
                              checked={selectedCategories.includes(category)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedCategories([...selectedCategories, category]);
                                } else {
                                  setSelectedCategories(selectedCategories.filter(c => c !== category));
                                }
                              }}
                            />
                            <label htmlFor={`category-${category}`} className="text-sm">{category}</label>
                          </div>
                        ))}
                      </div>

                      <Button variant="outline" onClick={resetFilters} className="w-full">
                        フィルターをリセット
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-sm">並び替え:</Label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">投稿日順</SelectItem>
                    <SelectItem value="views">閲覧数順</SelectItem>
                    <SelectItem value="imports">インポート数順</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Player Cards */}
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">読み込み中...</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedPlayers.map((player) => (
                <Card key={player.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4" onClick={() => handlePlayerClick(player)}>
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-lg">{player.name}</h3>
                          <p className="text-sm text-muted-foreground">{player.team}</p>
                        </div>
                        <Badge variant="outline">{player.category}</Badge>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          {sortPositions(player.position)}
                        </p>
                        {player.evaluations && player.evaluations.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {sortEvaluations(player.evaluations).map((evaluation, index) => (
                              <Badge key={index} className={evaluationColors[evaluation as keyof typeof evaluationColors]}>
                                {evaluation}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{player.view_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          <span>{player.import_count}</span>
                        </div>
                        <div className="flex items-center gap-1 ml-auto">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={player.profiles?.avatar_url} />
                            <AvatarFallback><User className="h-3 w-3" /></AvatarFallback>
                          </Avatar>
                          <span>{player.profiles?.display_name || "名無し"}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Player Detail Dialog */}
      <Dialog open={!!selectedPlayer} onOpenChange={() => setSelectedPlayer(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPlayer?.name}</DialogTitle>
          </DialogHeader>
          {selectedPlayer && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedPlayer.profiles?.avatar_url} />
                  <AvatarFallback><User /></AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedPlayer.profiles?.display_name || "名無し"}</p>
                  <p className="text-sm text-muted-foreground">投稿者</p>
                </div>
              </div>

              <div className="grid gap-2">
                <div>
                  <Label>所属</Label>
                  <p>{selectedPlayer.team}</p>
                </div>
                <div>
                  <Label>ポジション</Label>
                  <p>{sortPositions(selectedPlayer.position)}</p>
                </div>
                <div>
                  <Label>カテゴリ</Label>
                  <p>{selectedPlayer.category}</p>
                </div>
                {selectedPlayer.year && (
                  <div>
                    <Label>年度</Label>
                    <p>{selectedPlayer.year}年</p>
                  </div>
                )}
                {selectedPlayer.evaluations && selectedPlayer.evaluations.length > 0 && (
                  <div>
                    <Label>評価</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {sortEvaluations(selectedPlayer.evaluations).map((evaluation, index) => (
                        <Badge key={index} className={evaluationColors[evaluation as keyof typeof evaluationColors]}>
                          {evaluation}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedPlayer.recommended_teams && selectedPlayer.recommended_teams.length > 0 && (
                  <div>
                    <Label>推奨球団</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedPlayer.recommended_teams.map((team, index) => (
                        <Badge key={index} className={teamColors[team as keyof typeof teamColors] || "bg-gray-500 text-white"}>
                          {team}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedPlayer.hometown && (
                  <div>
                    <Label>出身地</Label>
                    <p>{selectedPlayer.hometown}</p>
                  </div>
                )}
                {selectedPlayer.batting_hand && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>打席</Label>
                      <p>{selectedPlayer.batting_hand}</p>
                    </div>
                    {selectedPlayer.throwing_hand && (
                      <div>
                        <Label>投球</Label>
                        <p>{selectedPlayer.throwing_hand}</p>
                      </div>
                    )}
                  </div>
                )}
                {(selectedPlayer.height || selectedPlayer.weight) && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedPlayer.height && (
                      <div>
                        <Label>身長</Label>
                        <p>{selectedPlayer.height}cm</p>
                      </div>
                    )}
                    {selectedPlayer.weight && (
                      <div>
                        <Label>体重</Label>
                        <p>{selectedPlayer.weight}kg</p>
                      </div>
                    )}
                  </div>
                )}
                {selectedPlayer.age && (
                  <div>
                    <Label>年齢</Label>
                    <p>{selectedPlayer.age}歳</p>
                  </div>
                )}
                {selectedPlayer.career_path && (
                  <div>
                    <Label>経歴</Label>
                    <div className="space-y-1 mt-1 text-sm">
                      {selectedPlayer.career_path.middle_school && (
                        <p><span className="font-medium">中学:</span> {selectedPlayer.career_path.middle_school}</p>
                      )}
                      {selectedPlayer.career_path.high_school && (
                        <p><span className="font-medium">高校:</span> {selectedPlayer.career_path.high_school}</p>
                      )}
                      {selectedPlayer.career_path.university && (
                        <p><span className="font-medium">大学:</span> {selectedPlayer.career_path.university}</p>
                      )}
                      {selectedPlayer.career_path.corporate && (
                        <p><span className="font-medium">社会人:</span> {selectedPlayer.career_path.corporate}</p>
                      )}
                    </div>
                  </div>
                )}
                {selectedPlayer.usage && (
                  <div>
                    <Label>起用法</Label>
                    <p>{selectedPlayer.usage}</p>
                  </div>
                )}
                {selectedPlayer.memo && (
                  <div>
                    <Label>メモ</Label>
                    <p className="text-sm whitespace-pre-wrap">{selectedPlayer.memo}</p>
                  </div>
                )}
                {selectedPlayer.videos && selectedPlayer.videos.length > 0 && (
                  <div>
                    <Label>動画</Label>
                    <div className="space-y-1">
                      {selectedPlayer.videos.map((video, index) => (
                        <a
                          key={index}
                          href={video}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline block"
                        >
                          {video}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleImport(selectedPlayer)} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  インポート
                </Button>
                <Button variant="outline" onClick={() => setSelectedPlayer(null)}>
                  閉じる
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
