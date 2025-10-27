import { useState, useCallback, useMemo } from "react";
import { Search, Filter, Eye, Download, User, Calendar, ChevronDown, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { importPlayerFromPublic, deletePublicPlayer, type PublicPlayer, deletePublicDiaryEntry, incrementDiaryViewCount, type PublicDiaryEntry, type Player } from "@/lib/supabase-storage";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { calculateSimilarity } from "@/lib/utils";
import { usePublicPlayers, usePublicDiaryEntries, usePlayers, useInvalidateQueries } from "@/hooks/usePlayerQueries";
import { PublicPlayerCard } from "@/components/PublicPlayerCard";
import { DiaryCard } from "@/components/DiaryCard";
import { useDebounce } from "@/hooks/useDebounce";

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
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedEvaluations, setSelectedEvaluations] = useState<string[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<PublicPlayer | null>(null);
  const [selectedDiary, setSelectedDiary] = useState<PublicDiaryEntry | null>(null);
  const [sortBy, setSortBy] = useState<"evaluation" | "position">("evaluation");
  const [activeTab, setActiveTab] = useState("players");
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(new Set());
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);
  const [similarPlayers, setSimilarPlayers] = useState<Array<{ player: Player; similarity: number }>>([]);
  const [pendingImportPlayer, setPendingImportPlayer] = useState<PublicPlayer | null>(null);

  const { invalidatePublicPlayers, invalidatePublicDiaries, invalidatePlayers } = useInvalidateQueries();

  // React Queryでデータ取得
  const { data: players = [], isLoading: playersLoading } = usePublicPlayers(activeTab === "players");
  const { data: diaries = [], isLoading: diariesLoading } = usePublicDiaryEntries(activeTab === "diaries");
  const { data: myPlayers = [] } = usePlayers(!!user);

  const loading = activeTab === "players" ? playersLoading : diariesLoading;

  // デバウンス処理でINP改善
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const matchesSearch = player.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           player.team.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesYear = selectedYear === "all" || player.year?.toString() === selectedYear;
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(player.category);
      
      const playerPositions = player.position.split(/[,、]/).map(p => p.trim());
      const matchesPosition = selectedPositions.length === 0 || 
        playerPositions.some(pos => selectedPositions.includes(pos));
      
      const matchesEvaluation = selectedEvaluations.length === 0 || 
        (player.evaluations && player.evaluations.some(evaluation => selectedEvaluations.includes(evaluation)));
      
      return matchesSearch && matchesYear && matchesCategory && matchesPosition && matchesEvaluation;
    });
  }, [players, debouncedSearchTerm, selectedYear, selectedCategories, selectedPositions, selectedEvaluations]);

  const sortedPlayers = useMemo(() => {
    return [...filteredPlayers].sort((a, b) => {
      if (sortBy === "evaluation") {
        // 評価順でソート（評価が高い順）
        const aEval = a.evaluations && a.evaluations.length > 0 ? a.evaluations[0] : "";
        const bEval = b.evaluations && b.evaluations.length > 0 ? b.evaluations[0] : "";
        const aIndex = evaluationOrder.indexOf(aEval);
        const bIndex = evaluationOrder.indexOf(bEval);
        
        // 評価がない場合は最後に
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        
        return aIndex - bIndex;
      } else if (sortBy === "position") {
        // ポジション順でソート
        const aPos = a.position.split(/[,、]/)[0]?.trim() || "";
        const bPos = b.position.split(/[,、]/)[0]?.trim() || "";
        const aIndex = positionOrder.indexOf(aPos);
        const bIndex = positionOrder.indexOf(bPos);
        
        // ポジションが見つからない場合は最後に
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        
        return aIndex - bIndex;
      }
      return 0;
    });
  }, [filteredPlayers, sortBy]);

  const handlePlayerClick = useCallback((player: PublicPlayer) => {
    setSelectedPlayer(player);
  }, []);

  const handleDiaryClick = useCallback((diary: PublicDiaryEntry) => {
    setSelectedDiary(diary);
    // Increment view count when diary is clicked
    incrementDiaryViewCount(diary.id);
  }, []);


  const checkForDuplicates = async (playerToImport: PublicPlayer) => {
    try {
      const existingPlayers = myPlayers;
      
      // すでにインポート済みかチェック
      const alreadyImported = existingPlayers.find(
        player => player.imported_from_public_player_id === playerToImport.id
      );
      
      if (alreadyImported) {
        toast({
          title: "すでにインポート済みです",
          description: `${playerToImport.name}は既にあなたの選手リストに存在します。`,
          variant: "destructive",
        });
        return null;
      }
      
      const similar: Array<{ player: Player; similarity: number }> = [];

      for (const player of existingPlayers) {
        const nameSimilarity = calculateSimilarity(playerToImport.name, player.name);
        
        if (nameSimilarity >= 80) {
          const teamMatch = playerToImport.team === player.team;
          const yearMatch = playerToImport.year === player.year;
          
          let adjustedSimilarity = nameSimilarity;
          if (teamMatch) adjustedSimilarity += 10;
          if (yearMatch) adjustedSimilarity += 5;
          
          similar.push({ 
            player, 
            similarity: Math.min(adjustedSimilarity, 100) 
          });
        }
      }

      similar.sort((a, b) => b.similarity - a.similarity);
      return similar;
    } catch (error) {
      console.error("Failed to check for duplicates:", error);
      return [];
    }
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

    // 確認ダイアログを表示
    const confirmed = confirm(
      `「${player.name}（${player.team}）」を自分の選手リストに追加しますか？`
    );
    
    if (!confirmed) return;

    // 類似選手をチェック
    const similar = await checkForDuplicates(player);
    
    // nullの場合はすでにインポート済み
    if (similar === null) {
      return;
    }
    
    if (similar.length > 0) {
      setSimilarPlayers(similar);
      setPendingImportPlayer(player);
      setShowDuplicateAlert(true);
      return;
    }

    // 類似選手がいない場合は直接インポート
    await executeImport(player);
  };

  const executeImport = async (player: PublicPlayer) => {
    const result = await importPlayerFromPublic(player.id);
    if (result) {
      toast({
        title: "選手を追加しました",
        description: `「${player.name}（${player.team}）」があなたの選手リストに追加されました`,
        duration: 5000,
      });
      invalidatePlayers();
      invalidatePublicPlayers();
    } else {
      toast({
        title: "エラー",
        description: "選手のインポートに失敗しました。",
        variant: "destructive",
      });
    }
  };

  const handleConfirmImport = async () => {
    setShowDuplicateAlert(false);
    if (pendingImportPlayer) {
      await executeImport(pendingImportPlayer);
      setPendingImportPlayer(null);
      setSimilarPlayers([]);
    }
  };

  const handleCancelImport = () => {
    setShowDuplicateAlert(false);
    setPendingImportPlayer(null);
    setSimilarPlayers([]);
  };

  const handleBulkImport = async () => {
    if (!user) {
      toast({
        title: "ログインが必要です",
        description: "選手をインポートするにはログインしてください。",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlayerIds.size === 0) {
      toast({
        title: "選手が選択されていません",
        description: "インポートする選手を選択してください。",
        variant: "destructive",
      });
      return;
    }

    // 確認ダイアログ（より明確に）
    const confirmed = confirm(
      `選択した${selectedPlayerIds.size}名の選手を自分の選手リストに追加しますか？\n\n※この操作により、選手データがあなたのアカウントに永久に追加されます。`
    );
    
    if (!confirmed) {
      return;
    }

    // 並列処理でインポート
    const results = await Promise.all(
      Array.from(selectedPlayerIds).map(playerId => importPlayerFromPublic(playerId))
    );
    
    const successCount = results.filter(result => result).length;
    const failCount = results.length - successCount;

    if (successCount > 0) {
      toast({
        title: "インポート完了",
        description: `${successCount}名の選手をインポートしました${failCount > 0 ? `（${failCount}名失敗）` : ''}。`,
      });
    } else {
      toast({
        title: "エラー",
        description: "選手のインポートに失敗しました。",
        variant: "destructive",
      });
    }

    setSelectedPlayerIds(new Set());
    invalidatePlayers();
    invalidatePublicPlayers();
  };

  const togglePlayerSelection = useCallback((playerId: string) => {
    const newSelection = new Set(selectedPlayerIds);
    if (newSelection.has(playerId)) {
      newSelection.delete(playerId);
    } else {
      newSelection.add(playerId);
    }
    setSelectedPlayerIds(newSelection);
  }, [selectedPlayerIds]);

  const handleDelete = useCallback(async (player: PublicPlayer) => {
    // ログインしていない、または（自分の投稿でない かつ 管理者でもない）場合はエラー
    if (!user || (user.id !== player.user_id && !isAdmin)) {
      toast({
        title: "エラー",
        description: isAdmin ? "削除に失敗しました。" : "自分の投稿のみ削除できます。",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`${player.name}を削除しますか？この操作は取り消せません。`)) {
      return;
    }

    const success = await deletePublicPlayer(player.id);
    if (success) {
      toast({
        title: "削除しました",
        description: `${player.name}を削除しました。`,
      });
      setSelectedPlayer(null);
      invalidatePublicPlayers();
    } else {
      toast({
        title: "エラー",
        description: "削除に失敗しました。",
        variant: "destructive",
      });
    }
  }, [user, isAdmin, invalidatePublicPlayers, toast]);

  const handleDeleteDiary = useCallback(async (diary: PublicDiaryEntry) => {
    if (!confirm('この観戦日記を削除してもよろしいですか?')) {
      return;
    }

    try {
      await deletePublicDiaryEntry(diary.id);
      toast({
        title: "削除しました",
        description: "観戦日記を削除しました",
      });
      setSelectedDiary(null);
      invalidatePublicDiaries();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "削除に失敗しました",
      });
    }
  }, [invalidatePublicDiaries, toast]);


  const resetFilters = () => {
    setSearchTerm("");
    setSelectedYear("2025");
    setSelectedCategories([]);
    setSelectedPositions([]);
    setSelectedEvaluations([]);
    setSortBy("evaluation");
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-2">
          <TabsTrigger value="players">選手を探す</TabsTrigger>
          <TabsTrigger value="diaries">観戦日記</TabsTrigger>
        </TabsList>

        <TabsContent value="players" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* 検索バー */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="選手名・所属チーム名で検索"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* フィルターグリッド */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {/* 並び替え */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">並び替え</Label>
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border shadow-lg z-50">
                      <SelectItem value="evaluation">評価順</SelectItem>
                      <SelectItem value="position">ポジション順</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 年度 */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">年度</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border shadow-lg z-50">
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="2028">2028年度</SelectItem>
                      <SelectItem value="2027">2027年度</SelectItem>
                      <SelectItem value="2026">2026年度</SelectItem>
                      <SelectItem value="2025">2025年度</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* ポジション */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">ポジション</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="h-10 w-full justify-between font-normal">
                        <span className="truncate">
                          {selectedPositions.length === 0 ? "全てのポジション" : `${selectedPositions.length}件選択`}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-52 p-3 bg-card border shadow-lg z-50" align="start">
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
                            <label htmlFor={`position-${position}`} className="text-sm cursor-pointer flex-1">
                              {position}
                            </label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* 評価 */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">評価</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="h-10 w-full justify-between font-normal">
                        <span className="truncate">
                          {selectedEvaluations.length === 0 ? "全ての評価" : `${selectedEvaluations.length}件選択`}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-52 p-3 bg-card border shadow-lg z-50" align="start">
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
                            <label htmlFor={`evaluation-${evaluation}`} className="text-sm cursor-pointer flex-1">
                              {evaluation}
                            </label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* リセットボタン */}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="flex items-center gap-2"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                    <path d="M3 21v-5h5" />
                  </svg>
                  リセット
                </Button>
              </div>

              {/* 一括インポートボタン */}
              {selectedPlayerIds.size > 0 && (
                <div className="flex items-center gap-2 flex-wrap w-full pt-2 border-t">
                  <span className="text-sm text-muted-foreground">
                    {selectedPlayerIds.size}名選択中
                  </span>
                  <Button onClick={handleBulkImport} size="sm" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    一括インポート
                  </Button>
                </div>
              )}
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
                <PublicPlayerCard
                  key={player.id}
                  player={player}
                  isSelected={selectedPlayerIds.has(player.id)}
                  onPlayerClick={handlePlayerClick}
                  onSelectionToggle={togglePlayerSelection}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="diaries" className="space-y-4">
          {/* Diary Cards */}
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">読み込み中...</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {diaries.map((diary) => (
                <DiaryCard
                  key={diary.id}
                  diary={diary}
                  onDiaryClick={handleDiaryClick}
                />
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
                {selectedPlayer.draft_status && selectedPlayer.draft_status !== "空欄" && (
                  <div className="border-t pt-3 mt-3">
                    <Label className="text-base font-semibold mb-2 block">ドラフト指名結果</Label>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm text-muted-foreground">指名状況</Label>
                        <p className="font-medium">{selectedPlayer.draft_status}</p>
                      </div>
                      {selectedPlayer.draft_team && (
                        <div>
                          <Label className="text-sm text-muted-foreground">指名球団</Label>
                          <p className="font-medium">{selectedPlayer.draft_team}</p>
                        </div>
                      )}
                      {selectedPlayer.draft_rank && (
                        <div>
                          <Label className="text-sm text-muted-foreground">順位</Label>
                          <p className="font-medium">{selectedPlayer.draft_rank}</p>
                        </div>
                      )}
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
                {user ? (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSelectedPlayer(null);
                        navigate(`/public-players/${selectedPlayer.id}/edit`);
                      }}
                      className="flex-1"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      編集
                    </Button>
                    {isAdmin && (
                      <Button 
                        variant="destructive" 
                        onClick={() => handleDelete(selectedPlayer)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        削除
                      </Button>
                    )}
                  </>
                ) : (
                  <Button onClick={() => handleImport(selectedPlayer)} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    インポート
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedPlayer(null)}>
                  閉じる
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diary Detail Dialog */}
      <Dialog open={!!selectedDiary} onOpenChange={() => setSelectedDiary(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedDiary?.match_card}</DialogTitle>
          </DialogHeader>
          {selectedDiary && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                <Eye className="h-4 w-4" />
                <span>{selectedDiary.view_count || 0} 閲覧</span>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>日付</Label>
                  <p>{selectedDiary.date}</p>
                </div>
                <div>
                  <Label>会場</Label>
                  <p>{selectedDiary.venue}</p>
                </div>
                {selectedDiary.tournament_name && (
                  <div>
                    <Label>大会名</Label>
                    <p>{selectedDiary.tournament_name}</p>
                  </div>
                )}
                <div>
                  <Label>スコア</Label>
                  <p>{selectedDiary.score}</p>
                </div>
                <div>
                  <Label className="mb-2 block">カテゴリ</Label>
                  <div>
                    <Badge>{selectedDiary.category}</Badge>
                  </div>
                </div>
                {selectedDiary.player_comments && (
                  <div>
                    <Label>選手コメント</Label>
                    <p className="text-sm whitespace-pre-wrap">{selectedDiary.player_comments}</p>
                  </div>
                )}
                {selectedDiary.overall_impression && (
                  <div>
                    <Label>全体の感想</Label>
                    <p className="text-sm whitespace-pre-wrap">{selectedDiary.overall_impression}</p>
                  </div>
                )}
                {selectedDiary.videos && selectedDiary.videos.length > 0 && (
                  <div>
                    <Label>動画</Label>
                    <div className="space-y-1">
                      {selectedDiary.videos.map((video, index) => (
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
                {isAdmin && (
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDeleteDiary(selectedDiary)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    削除
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedDiary(null)} className="flex-1">
                  閉じる
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDuplicateAlert} onOpenChange={setShowDuplicateAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              似た選手が見つかりました
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>以下の選手と類似しています。同じ選手を重複登録しようとしていませんか？</p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {similarPlayers.slice(0, 5).map(({ player, similarity }) => (
                  <div key={player.id} className="p-3 border rounded-lg bg-muted/50">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium">{player.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        類似度 {similarity}%
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-0.5">
                      <div>所属: {player.team}</div>
                      {player.year && <div>ドラフト年度: {player.year}年</div>}
                      {player.position && <div>ポジション: {player.position}</div>}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium">それでもインポートを続けますか？</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelImport}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmImport}>
              それでもインポート
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
}
