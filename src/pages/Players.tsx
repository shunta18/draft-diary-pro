import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Search, Filter, X, MapPin, Calendar, Users, Target, MapPin as LocationIcon, RotateCcw, ChevronDown, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { getPlayers, deletePlayer, addPlayer, type Player } from "@/lib/supabase-storage";
import { getDefaultPlayers } from "@/lib/playerStorage";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
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

// 評価の順序を定義
const evaluationOrder = [
  "1位競合", "1位一本釣り", "外れ1位", "2位", "3位", 
  "4位", "5位", "6位以下", "育成"
];

// 評価をソートする関数
const sortEvaluations = (evaluations: string[]) => {
  return [...evaluations].sort((a, b) => {
    const indexA = evaluationOrder.indexOf(a);
    const indexB = evaluationOrder.indexOf(b);
    return indexA - indexB;
  });
};

// ポジションの順序を定義
const positionOrder = [
  "投手", "捕手", "一塁手", "二塁手", "三塁手", "遊撃手", "外野手", "指名打者"
];

// ポジションをソートする関数
const sortPositions = (positionsStr: string) => {
  const positions = positionsStr.split(/[,、]/).map(p => p.trim()).filter(p => p);
  return positions.sort((a, b) => {
    const indexA = positionOrder.indexOf(a);
    const indexB = positionOrder.indexOf(b);
    // 未定義の場合は最後に配置
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  }).join("、");
};

// 球団の色設定
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

export default function Players() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedEvaluations, setSelectedEvaluations] = useState<string[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingSamplePlayers, setIsAddingSamplePlayers] = useState(false);

  useEffect(() => {
    loadPlayers();
  }, [user]);

  const loadPlayers = async () => {
    setLoading(true);
    try {
      if (user) {
        // ログインユーザーはSupabaseから取得
        const data = await getPlayers();
        setPlayers(data);
      } else {
        // ゲストユーザーは最新のサンプルデータを表示
        const samplePlayers = getDefaultPlayers();
        // Player型に変換（positionをstringに）
        const convertedPlayers = samplePlayers.map(p => ({
          ...p,
          position: Array.isArray(p.position) ? p.position.join("、") : p.position,
          year: p.draftYear ? parseInt(p.draftYear) : 2025
        }));
        setPlayers(convertedPlayers as any);
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
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(player.category);
    
    // ポジションフィルター：選手のポジションを分割してチェック
    const playerPositions = player.position.split(/[,、]/).map(p => p.trim());
    const matchesPosition = selectedPositions.length === 0 || 
      playerPositions.some(pos => selectedPositions.includes(pos));
    
    const matchesEvaluation = selectedEvaluations.length === 0 || 
      (player.evaluations && player.evaluations.some(evaluation => selectedEvaluations.includes(evaluation)));
    
    return matchesSearch && matchesYear && matchesCategory && matchesPosition && matchesEvaluation;
  });

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedYear(user ? "2025" : "all");
    setSelectedCategories([]);
    setSelectedPositions([]);
    setSelectedEvaluations([]);
  };

  // Set default year filter based on auth status
  useEffect(() => {
    setSelectedYear(user ? "2025" : "all");
  }, [user]);

  // サンプル選手を追加する関数
  const handleAddSamplePlayers = async () => {
    if (!user) {
      toast({
        title: "ログインが必要です",
        description: "サンプル選手を追加するにはログインしてください。",
        variant: "destructive",
      });
      return;
    }

    setIsAddingSamplePlayers(true);
    
    try {
      const samplePlayers = [
        { name: '立石 正広', team: '創価大学', position: '三塁手', category: '大学', evaluations: ['1位競合'], recommended_teams: [], year: 2025, batting_hand: '右打', throwing_hand: '右投', hometown: '', age: null, usage: '', memo: '', videos: [] },
        { name: '松下 歩叶', team: '法政大学', position: '二塁手', category: '大学', evaluations: ['1位一本釣り', '外れ1位'], recommended_teams: [], year: 2025, batting_hand: '右打', throwing_hand: '右投', hometown: '', age: null, usage: '', memo: '', videos: [] },
        { name: '毛利 海大', team: '明治大学', position: '投手', category: '大学', evaluations: ['外れ1位', '2位'], recommended_teams: [], year: 2025, batting_hand: '左打', throwing_hand: '左投', hometown: '', age: null, usage: '先発', memo: '', videos: [] },
        { name: '増居 翔太', team: 'トヨタ', position: '投手', category: '社会人', evaluations: ['1位一本釣り', '外れ1位', '2位'], recommended_teams: [], year: 2025, batting_hand: '左打', throwing_hand: '左投', hometown: '', age: null, usage: '先発', memo: '', videos: [] },
        { name: '竹丸 和幸', team: '鷺宮製作所', position: '投手', category: '社会人', evaluations: ['1位一本釣り', '外れ1位', '2位'], recommended_teams: [], year: 2025, batting_hand: '左打', throwing_hand: '左投', hometown: '', age: null, usage: '先発', memo: '', videos: [] },
        { name: '谷端 将伍', team: '日本大学', position: '二塁手', category: '大学', evaluations: ['1位一本釣り', '外れ1位', '2位'], recommended_teams: [], year: 2025, batting_hand: '右打', throwing_hand: '右投', hometown: '', age: null, usage: '', memo: '', videos: [] },
        { name: '中西 聖輝', team: '青山学院大', position: '投手', category: '大学', evaluations: ['1位一本釣り', '外れ1位'], recommended_teams: [], year: 2025, batting_hand: '右打', throwing_hand: '右投', hometown: '', age: null, usage: '先発', memo: '', videos: [] },
        { name: '櫻井 頼之介', team: '東北福祉大', position: '投手', category: '大学', evaluations: ['2位', '3位'], recommended_teams: [], year: 2025, batting_hand: '右打', throwing_hand: '右投', hometown: '', age: null, usage: '', memo: '', videos: [] },
        { name: '藤原 聡大', team: '花園大学', position: '投手', category: '大学', evaluations: ['2位', '3位'], recommended_teams: [], year: 2025, batting_hand: '右打', throwing_hand: '右投', hometown: '', age: null, usage: '', memo: '', videos: [] },
        { name: '櫻井 ユウヤ', team: '昌平高校', position: '三塁手', category: '高校', evaluations: ['外れ1位', '2位'], recommended_teams: [], year: 2025, batting_hand: '右打', throwing_hand: '右投', hometown: '', age: null, usage: '', memo: '', videos: [] },
        { name: '石垣 元気', team: '健大高崎', position: '投手', category: '高校', evaluations: ['1位一本釣り'], recommended_teams: [], year: 2025, batting_hand: '左打', throwing_hand: '右投', hometown: '', age: null, usage: '', memo: '', videos: [] },
        { name: '小島 大河', team: '明治大学', position: '捕手', category: '大学', evaluations: ['1位一本釣り', '外れ1位', '2位'], recommended_teams: [], year: 2025, batting_hand: '左打', throwing_hand: '右投', hometown: '', age: null, usage: '', memo: '', videos: [] },
        { name: 'エドポロ ケイン', team: '大阪学院大学', position: '外野手', category: '大学', evaluations: ['2位', '3位', '4位'], recommended_teams: [], year: 2025, batting_hand: '右打', throwing_hand: '右投', hometown: '', age: null, usage: '', memo: '', videos: [] },
        { name: '堀越 啓太', team: '東北福祉大', position: '投手', category: '大学', evaluations: ['2位', '3位'], recommended_teams: [], year: 2025, batting_hand: '右打', throwing_hand: '右投', hometown: '', age: null, usage: '', memo: '', videos: [] },
        { name: '伊藤 樹', team: '早稲田大学', position: '投手', category: '大学', evaluations: ['2位', '3位'], recommended_teams: [], year: 2025, batting_hand: '右打', throwing_hand: '右投', hometown: '', age: null, usage: '', memo: '', videos: [] },
        { name: '齊藤 汰直', team: '亜細亜大学', position: '投手', category: '大学', evaluations: ['1位一本釣り', '外れ1位', '2位'], recommended_teams: [], year: 2025, batting_hand: '右打', throwing_hand: '右投', hometown: '', age: null, usage: '', memo: '', videos: [] },
        { name: '山城 京平', team: '亜細亜大学', position: '投手', category: '大学', evaluations: ['外れ1位', '2位'], recommended_teams: [], year: 2025, batting_hand: '右打', throwing_hand: '右投', hometown: '', age: null, usage: '', memo: '', videos: [] },
        { name: '大塚 瑠晏', team: '東海大学', position: '遊撃手', category: '大学', evaluations: ['1位一本釣り', '外れ1位', '2位'], recommended_teams: [], year: 2025, batting_hand: '右打', throwing_hand: '右投', hometown: '', age: null, usage: '', memo: '', videos: [] },
        { name: '秋山 俊', team: '中京大学', position: '外野手', category: '大学', evaluations: ['2位', '3位'], recommended_teams: [], year: 2025, batting_hand: '右打', throwing_hand: '右投', hometown: '', age: null, usage: '', memo: '', videos: [] },
        { name: '森 陽樹', team: '大阪桐蔭高校', position: '投手', category: '高校', evaluations: ['3位', '4位', '5位', '6位以下', '育成'], recommended_teams: [], year: 2025, batting_hand: '右打', throwing_hand: '右投', hometown: '', age: null, usage: '', memo: '', videos: [] },
        { name: '藤井 健翔', team: '浦和学院', position: '外野手', category: '高校', evaluations: ['3位', '4位'], recommended_teams: [], year: 2025, batting_hand: '右打', throwing_hand: '右投', hometown: '', age: null, usage: '', memo: '', videos: [] },
        { name: '谷脇 弘起', team: '日本生命', position: '投手', category: '社会人', evaluations: ['2位', '外れ1位', '3位'], recommended_teams: [], year: 2025, batting_hand: '右打', throwing_hand: '右投', hometown: '', age: null, usage: '', memo: '', videos: [] },
        { name: '髙橋 隆慶', team: 'JR東日本', position: '三塁手', category: '社会人', evaluations: ['2位', '3位'], recommended_teams: [], year: 2025, batting_hand: '左打', throwing_hand: '左投', hometown: '', age: null, usage: '', memo: '', videos: [] },
        { name: '冨重 英二郎', team: '神奈川FD', position: '投手', category: '社会人', evaluations: ['2位', '4位', '3位'], recommended_teams: [], year: 2025, batting_hand: '左打', throwing_hand: '左投', hometown: '', age: null, usage: '', memo: '', videos: [] },
      ];

      // 既存の選手名を取得
      const existingPlayerNames = new Set(players.map(p => p.name));
      
      // 重複していない選手のみをフィルタリング
      const playersToAdd = samplePlayers.filter(p => !existingPlayerNames.has(p.name));
      
      if (playersToAdd.length === 0) {
        toast({
          title: "候補は既に追加済みです",
          description: "すべてのサンプル選手が既に存在しています。",
        });
        setIsAddingSamplePlayers(false);
        return;
      }

      // 選手を追加
      let addedCount = 0;
      for (const playerData of playersToAdd) {
        const result = await addPlayer(playerData);
        if (result) {
          addedCount++;
        }
      }

      if (addedCount > 0) {
        toast({
          title: "候補を追加しました",
          description: `${addedCount}名の選手を追加しました。`,
        });
        
        // リストを更新
        await loadPlayers();
      }
    } catch (error) {
      console.error('Failed to add sample players:', error);
      toast({
        title: "エラー",
        description: "候補の追加に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsAddingSamplePlayers(false);
    }
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
        "value": player.evaluations ? player.evaluations.join(", ") : ""
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
        <div className="p-4">
          <div className="flex items-center justify-between mb-3 md:mb-0">
            <div className="flex items-center space-x-2 md:space-x-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-lg md:text-xl font-bold text-primary whitespace-nowrap">選手リスト</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {user && (
              <Button 
                variant="outline"
                size="lg"
                onClick={handleAddSamplePlayers}
                disabled={isAddingSamplePlayers}
                className="shadow-soft flex-1 sm:flex-none"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                候補追加
              </Button>
            )}
            <Link to="/players/new" className="flex-1 sm:flex-none">
              <Button 
                variant="secondary"
                size="lg"
                className="gradient-accent text-white border-0 shadow-soft hover:shadow-glow transition-smooth w-full"
              >
                <Plus className="h-5 w-5 mr-2" />
                新規
              </Button>
            </Link>
          </div>
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
                <SelectItem value="2028">2028年度</SelectItem>
              </SelectContent>
            </Select>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-32 justify-between">
                  <span className="truncate">
                    {selectedCategories.length === 0 ? "全ての所属" : `所属(${selectedCategories.length})`}
                  </span>
                  <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3 bg-background z-50">
                <div className="space-y-2">
                  {["高校", "大学", "社会人", "独立リーグ", "その他"].map((category) => (
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
                      <label
                        htmlFor={`category-${category}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-32 justify-between">
                  <span className="truncate">
                    {selectedPositions.length === 0 ? "全てのポジション" : `ポジション(${selectedPositions.length})`}
                  </span>
                  <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3 bg-background z-50">
                <div className="space-y-2">
                  {positionOrder.map((position) => (
                    <div key={position} className="flex items-center space-x-2">
                      <Checkbox
                        id={`position-${position}`}
                        checked={selectedPositions.includes(position)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedPositions([...selectedPositions, position]);
                          } else {
                            setSelectedPositions(selectedPositions.filter(p => p !== position));
                          }
                        }}
                      />
                      <label
                        htmlFor={`position-${position}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {position}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-32 justify-between">
                  <span className="truncate">
                    {selectedEvaluations.length === 0 ? "全ての評価" : `評価(${selectedEvaluations.length})`}
                  </span>
                  <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3 bg-background z-50">
                <div className="space-y-2">
                  {evaluationOrder.map((evaluation) => (
                    <div key={evaluation} className="flex items-center space-x-2">
                      <Checkbox
                        id={`evaluation-${evaluation}`}
                        checked={selectedEvaluations.includes(evaluation)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedEvaluations([...selectedEvaluations, evaluation]);
                          } else {
                            setSelectedEvaluations(selectedEvaluations.filter(e => e !== evaluation));
                          }
                        }}
                      />
                      <label
                        htmlFor={`evaluation-${evaluation}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {evaluation}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
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
                    {player.id === 1 && (
                      <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                        サンプル
                      </Badge>
                    )}
                  </div>
                  
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{player.team}</span>
                      <span>•</span>
                      <span>{sortPositions(player.position)}</span>
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

        {/* About Section - SEO & AdSense対策（非ログイン時のみ表示） */}
        {!user && (
          <section className="bg-card/30 border border-border/30 rounded-lg p-6 space-y-4 mt-6">
            <h2 className="text-xl font-bold text-primary">選手リスト機能について</h2>
            
            <div className="space-y-3 text-sm text-foreground/90 leading-relaxed">
              <p>
                このページでは、ドラフト候補選手の詳細データを一覧で管理できます。高校野球、大学野球、社会人野球など、
                カテゴリー別に選手情報を整理し、効率的なスカウティング活動をサポートします。
              </p>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-primary">主な機能：</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>選手名、チーム名による高速検索</li>
                  <li>年度、カテゴリー、ポジション、評価による多角的なフィルタリング</li>
                  <li>詳細な選手プロフィール（身体データ、投打、出身地など）</li>
                  <li>ドラフト評価（1位競合、外れ1位、育成など）の管理</li>
                  <li>球団カラーによる視覚的な識別</li>
                  <li>打撃成績、投球成績の記録</li>
                  <li>スカウトメモの保存</li>
                  <li>動画リンクの管理</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-primary">こんな方におすすめ：</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>プロ野球ドラフト会議を楽しみにしている野球ファン</li>
                  <li>高校野球、大学野球、社会人野球の観戦が好きな方</li>
                  <li>有望選手の成長を追いかけたい方</li>
                  <li>自分なりのドラフト予想を楽しみたい方</li>
                  <li>複数年にわたる選手データを管理したい方</li>
                </ul>
              </div>
              
              <p className="text-xs text-muted-foreground pt-2 border-t">
                現在お試しモードでご利用中です。アカウント登録すると、すべてのデータがクラウドに保存され、
                どのデバイスからでもアクセスできるようになります。
              </p>
            </div>
          </section>
        )}
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
                  {selectedPlayer.evaluations && sortEvaluations(selectedPlayer.evaluations).map((evaluation, index) => (
                    <Badge 
                      key={index}
                      className={`${evaluationColors[evaluation as keyof typeof evaluationColors]} font-medium text-xs`}
                    >
                      {evaluation}
                    </Badge>
                  ))}
                  {selectedPlayer.recommended_teams && selectedPlayer.recommended_teams.map((team, index) => (
                    <Badge 
                      key={`team-${index}`}
                      className={`${teamColors[team as keyof typeof teamColors]} font-medium text-xs`}
                    >
                      {team === "オリックス・バファローズ" ? "オリックス" :
                       team.replace(/ジャイアンツ|タイガース|ドラゴンズ|カープ|スワローズ|ベイスターズ|ホークス|ファイターズ|マリーンズ|ライオンズ|ゴールデンイーグルス/, '').replace(/読売|阪神|中日|広島東洋|東京ヤクルト|横浜DeNA|福岡ソフトバンク|北海道日本ハム|千葉ロッテ|埼玉西武|東北楽天/, (match) => {
                        const teamMap: { [key: string]: string } = {
                          '読売': '巨人',
                          '阪神': '阪神',
                          '中日': '中日',
                          '広島東洋': '広島',
                          '東京ヤクルト': 'ヤクルト',
                          '横浜DeNA': 'DeNA',
                          '福岡ソフトバンク': 'ソフトバンク',
                          '北海道日本ハム': '日本ハム',
                          '千葉ロッテ': 'ロッテ',
                          '埼玉西武': '西武',
                          '東北楽天': '楽天',
                          'オリックス': 'オリックス'
                        };
                        return teamMap[match] || match;
                      })}
                    </Badge>
                  ))}
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
                    <span>{sortPositions(selectedPlayer.position)}</span>
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

                  {selectedPlayer.age && (
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground">年齢:</span>
                      <span>{selectedPlayer.age}歳</span>
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

              {/* 動画 */}
              {selectedPlayer.videos && selectedPlayer.videos.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">動画</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedPlayer.videos.map((video, index) => (
                      <div key={index} className="bg-muted/50 rounded-lg p-3">
                        <a 
                          href={video} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:text-blue-800 break-all text-sm"
                        >
                          {video}
                        </a>
                      </div>
                    ))}
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
      
      <Footer />
    </div>
  );
}