import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Search, Filter, X, MapPin, Calendar, Users, Target, MapPin as LocationIcon, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Link, useNavigate } from "react-router-dom";
import { getPlayers, deletePlayer, type Player } from "@/lib/supabase-storage";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";


const evaluationColors = {
  "1位競合確実": "bg-red-500 text-white",
  "一本釣り〜外れ1位": "bg-orange-500 text-white",
  "2-3位": "bg-yellow-500 text-white",
  "4-5位": "bg-blue-500 text-white",
  "6位以下": "bg-gray-500 text-white",
  "育成": "bg-purple-500 text-white",
};

export default function Players() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPosition, setSelectedPosition] = useState("all");
  const [selectedEvaluation, setSelectedEvaluation] = useState("all");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlayers();
  }, [user]);

  const loadPlayers = async () => {
    setLoading(true);
    try {
      if (user) {
        const data = await getPlayers();
        setPlayers(data);
      } else {
        // ゲストユーザーの場合はサンプルデータを表示
        const samplePlayer = {
          id: 1,
          name: "松井裕樹",
          team: "桐光学園",
          position: "投手",
          category: "高校",
          evaluation: "1位競合確実",
          year: 2013,
          batting_hand: "左",
          throwing_hand: "左",
          hometown: "神奈川県",
          career_path: "プロ志望",
          usage: "抑え",
          memo: "高校2年時に甲子園で1試合の奪三振記録を更新。消えるスライダーが武器のドクターK"
        };
        setPlayers([samplePlayer]);
      }
    } catch (error) {
      console.error('Failed to load players:', error);
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  // ページ表示時にも最新データを取得するようにする
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        loadPlayers();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', () => {
      if (user) loadPlayers();
    });
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', () => {
        if (user) loadPlayers();
      });
    };
  }, [user]);

  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.team.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = selectedYear === "all" || player.year?.toString() === selectedYear;
    const matchesCategory = selectedCategory === "all" || player.category === selectedCategory;
    const matchesPosition = selectedPosition === "all" || player.position === selectedPosition;
    const matchesEvaluation = selectedEvaluation === "all" || player.evaluation === selectedEvaluation;
    
    return matchesSearch && matchesYear && matchesCategory && matchesPosition && matchesEvaluation;
  });

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedYear("all");
    setSelectedCategory("all");
    setSelectedPosition("all");
    setSelectedEvaluation("all");
  };

  const playersStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "ドラフト候補選手一覧",
    "description": "プロ野球ドラフト候補選手の詳細データベース",
    "numberOfItems": filteredPlayers.length,
    "itemListElement": filteredPlayers.slice(0, 10).map((player, index) => ({
      "@type": "Person",
      "position": index + 1,
      "name": player.name,
      "description": `${player.team} - ${player.position}`,
      "additionalProperty": {
        "@type": "PropertyValue",
        "name": "評価",
        "value": player.evaluation
      }
    }))
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <SEO 
        title="選手一覧"
        description={`ドラフト候補選手${filteredPlayers.length}名の詳細データベース。高校生、大学生、社会人野球の有望選手情報を完全網羅。`}
        keywords={[
          "ドラフト候補選手", "野球選手データベース", "高校野球", "大学野球", 
          "社会人野球", "選手評価", "スカウティング", "プロ野球"
        ]}
        structuredData={playersStructuredData}
      />
      {/* Header */}
      <div className="bg-card border-b shadow-soft">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-primary">選手リスト</h1>
          </div>
          
          <Link to="/players/new">
            <Button 
              variant="secondary"
              className="gradient-accent text-white border-0 shadow-soft hover:shadow-glow transition-smooth"
            >
              <Plus className="h-4 w-4 mr-2" />
              新規追加
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="選手名・所属チーム名で検索"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 shadow-soft"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 sm:flex sm:space-x-2 sm:grid-cols-none">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="年度" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全ての年度</SelectItem>
                <SelectItem value="2025">2025年度</SelectItem>
                <SelectItem value="2026">2026年度</SelectItem>
                <SelectItem value="2027">2027年度</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="所属" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全ての所属</SelectItem>
                <SelectItem value="高校">高校生</SelectItem>
                <SelectItem value="大学">大学生</SelectItem>
                <SelectItem value="社会人">社会人</SelectItem>
                <SelectItem value="独立リーグ">独立リーグ</SelectItem>
                <SelectItem value="その他">その他</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="ポジション" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全てのポジション</SelectItem>
                <SelectItem value="投手">投手</SelectItem>
                <SelectItem value="捕手">捕手</SelectItem>
                <SelectItem value="内野手">内野手</SelectItem>
                <SelectItem value="外野手">外野手</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedEvaluation} onValueChange={setSelectedEvaluation}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="評価" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全ての評価</SelectItem>
                <SelectItem value="1位競合確実">1位競合確実</SelectItem>
                <SelectItem value="一本釣り〜外れ1位">一本釣り〜外れ1位</SelectItem>
                <SelectItem value="2-3位">2-3位</SelectItem>
                <SelectItem value="4-5位">4-5位</SelectItem>
                <SelectItem value="6位以下">6位以下</SelectItem>
                <SelectItem value="育成">育成</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              onClick={resetFilters}
              className="w-full sm:w-auto px-3"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              リセット
            </Button>
          </div>
        </div>

        {/* Players List */}
        <div className="space-y-3">
          {filteredPlayers.map((player) => (
            <Card 
              key={player.id} 
              className="gradient-card border-0 shadow-soft hover:shadow-elevated transition-smooth cursor-pointer"
              onClick={() => setSelectedPlayer(player)}
            >
              <CardContent className="p-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2 flex-wrap gap-2">
                    <h3 className="font-bold text-lg text-primary">{player.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {player.category}
                    </Badge>
                    <Badge 
                      className={`${evaluationColors[player.evaluation as keyof typeof evaluationColors]} font-medium text-xs`}
                    >
                      {player.evaluation}
                    </Badge>
                    {player.id === 1 && (
                      <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                        サンプル
                      </Badge>
                    )}
                  </div>
                  
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{player.team}</span>
                      <span>•</span>
                      <span>{player.position}</span>
                      <span>•</span>
                      <span>{player.year || 2025}年</span>
                    </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredPlayers.length === 0 && (
            <Card className="gradient-card border-0 shadow-soft">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">該当する選手が見つかりません</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Player Detail Dialog */}
      <Dialog open={!!selectedPlayer} onOpenChange={() => setSelectedPlayer(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary font-bold">{selectedPlayer?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedPlayer && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {selectedPlayer.category}
                  </Badge>
                  <Badge 
                    className={`${evaluationColors[selectedPlayer.evaluation as keyof typeof evaluationColors]} font-medium text-xs`}
                  >
                    {selectedPlayer.evaluation}
                  </Badge>
                  {selectedPlayer.id === 1 && (
                    <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                      サンプル
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">所属:</span>
                    <span>{selectedPlayer.team}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">ドラフト年度:</span>
                    <span>{selectedPlayer.year || 2025}年</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">ポジション:</span>
                    <span>{selectedPlayer.position}</span>
                  </div>

                  {selectedPlayer.batting_hand && selectedPlayer.throwing_hand && (
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">投打:</span>
                      <span>{selectedPlayer.throwing_hand}投{selectedPlayer.batting_hand}打</span>
                    </div>
                  )}

                  {selectedPlayer.height && selectedPlayer.weight && (
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground">身長・体重:</span>
                      <span>{selectedPlayer.height}cm / {selectedPlayer.weight}kg</span>
                    </div>
                  )}

                  {selectedPlayer.hometown && (
                    <div className="flex items-center space-x-2">
                      <LocationIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">出身地:</span>
                      <span>{selectedPlayer.hometown}</span>
                    </div>
                  )}

                  {selectedPlayer.career_path && (
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground">進路先:</span>
                      <span>{selectedPlayer.career_path}</span>
                    </div>
                  )}

                  {selectedPlayer.usage && (
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground">起用法:</span>
                      <span>{selectedPlayer.usage}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* メモ欄 */}
              {selectedPlayer.memo && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">メモ</h4>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm leading-relaxed">{selectedPlayer.memo}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    navigate(`/players/${selectedPlayer.id}/edit`);
                    setSelectedPlayer(null);
                  }}
                >
                  編集
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex-1">
                      削除
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>選手を削除しますか？</AlertDialogTitle>
                      <AlertDialogDescription>
                        {selectedPlayer.name}を削除します。この操作は取り消せません。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>キャンセル</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          if (selectedPlayer && await deletePlayer(selectedPlayer.id!)) {
                            const updatedPlayers = await getPlayers();
                            setPlayers(updatedPlayers);
                          }
                          setSelectedPlayer(null);
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        削除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}