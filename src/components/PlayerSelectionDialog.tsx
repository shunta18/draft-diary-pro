import { useState, useMemo, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Player as LocalPlayer } from "@/lib/playerStorage";
import { Player as SupabasePlayer, PublicPlayer } from "@/lib/supabase-storage";
import { Search, ChevronDown } from "lucide-react";
import { PlayerFormDialog } from "@/components/PlayerFormDialog";
import { useDebounce } from "@/hooks/useDebounce";

// Union type to handle both data formats
type PlayerData = LocalPlayer | SupabasePlayer | PublicPlayer;

interface PlayerSelectionDialogProps {
  players: PlayerData[];
  selectedPlayerId?: number | string;
  onSelect: (playerId: number | string | undefined) => void;
  onPlayerAdded?: () => void;
  children: React.ReactNode;
  draftYear?: string;
}

// ポジションの順序を定義
const positionOrder = [
  "投手", "捕手", "一塁手", "二塁手", "三塁手", "遊撃手", "外野手", "指名打者"
];

// 評価の順序を定義
const evaluationOrder = [
  "1位競合", "1位一本釣り", "外れ1位", "2位", "3位", 
  "4位", "5位", "6位以下", "育成"
];

export function PlayerSelectionDialog({ players, selectedPlayerId, onSelect, onPlayerAdded, children, draftYear }: PlayerSelectionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlayerFormOpen, setIsPlayerFormOpen] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [filterPositions, setFilterPositions] = useState<string[]>([]);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterEvaluations, setFilterEvaluations] = useState<string[]>([]);

  // Helper function to normalize position data
  const normalizePosition = (position: string | string[]): string[] => {
    return Array.isArray(position) ? position : [position];
  };

  // Helper function to get position as string for display
  const getPositionDisplay = (position: string | string[]): string => {
    return Array.isArray(position) ? position.join(', ') : position;
  };

  // カテゴリの選択肢（固定）
  const categories = ["高校", "大学", "社会人", "独立リーグ", "その他"];

  // Helper function to get the highest evaluation rank
  const getHighestEvaluationRank = useCallback((evaluations: string[] | undefined): number => {
    if (!evaluations || evaluations.length === 0) return 999; // 評価なしは最後
    
    // 選手の評価の中で最も高い順位（evaluationOrderで最も早く出現する）を見つける
    let highestRank = 999;
    evaluations.forEach(evaluation => {
      const rank = evaluationOrder.indexOf(evaluation);
      if (rank !== -1 && rank < highestRank) {
        highestRank = rank;
      }
    });
    
    return highestRank;
  }, []);

  // デバウンス処理でINP改善
  const debouncedSearchName = useDebounce(searchName, 300);

  // Filter players based on search criteria - useMemoでメモ化してINP改善
  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(debouncedSearchName.toLowerCase());
      const matchesCategory = filterCategories.length === 0 || filterCategories.includes(player.category);
      
      // ポジションフィルター：選手のポジションを分割してチェック
      const positionStr = Array.isArray(player.position) ? player.position.join("、") : player.position;
      const playerPositions = positionStr.split(/[,、]/).map(p => p.trim()).filter(p => p);
      const matchesPosition = filterPositions.length === 0 || 
        playerPositions.some(pos => filterPositions.includes(pos));
      
      const matchesEvaluation = filterEvaluations.length === 0 || 
        (player.evaluations && player.evaluations.some(evaluation => filterEvaluations.includes(evaluation)));
      
      // 年度フィルター：draftYearが指定されている場合、その年度の選手のみ表示
      const matchesYear = !draftYear || (player as any).draftYear === draftYear;
      
      return matchesSearch && matchesCategory && matchesPosition && matchesEvaluation && matchesYear;
    }).sort((a, b) => {
      // 評価が高い順に並び替え（評価が同じ場合は名前順）
      const rankA = getHighestEvaluationRank(a.evaluations);
      const rankB = getHighestEvaluationRank(b.evaluations);
      
      if (rankA !== rankB) {
        return rankA - rankB;
      }
      
      // 評価が同じ場合は名前順
      return a.name.localeCompare(b.name, 'ja');
    });
  }, [players, debouncedSearchName, filterCategories, filterPositions, filterEvaluations, draftYear, getHighestEvaluationRank]);

  const handleSelect = (playerId?: number | string) => {
    onSelect(playerId);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setSearchName("");
    setFilterPositions([]);
    setFilterCategories([]);
    setFilterEvaluations([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>選手を選択</DialogTitle>
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
                          id={`dialog-position-${position}`}
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
                          htmlFor={`dialog-position-${position}`}
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
                          id={`dialog-category-${category}`}
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
                          htmlFor={`dialog-category-${category}`}
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
                          id={`dialog-evaluation-${evaluation}`}
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
                          htmlFor={`dialog-evaluation-${evaluation}`}
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
              {filteredPlayers.length}件の選手が見つかりました
            </span>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              フィルターをクリア
            </Button>
          </div>

          {/* Player List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            <div className="mb-2 space-y-2">
              <Button 
                variant={selectedPlayerId === undefined ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => handleSelect(undefined)}
              >
                選択なし
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setIsPlayerFormOpen(true)}
              >
                選手を追加する
              </Button>
            </div>
            
            {filteredPlayers.map((player) => (
              <Card 
                key={player.id} 
                className={`cursor-pointer transition-colors hover:bg-accent ${
                  selectedPlayerId === player.id ? 'bg-primary/10 border-primary' : ''
                }`}
                onClick={() => handleSelect(player.id)}
              >
                <CardContent className="p-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <div className="font-medium">{player.name}</div>
                      <div className="text-muted-foreground text-xs">{player.category}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">ポジション</div>
                      <div>{getPositionDisplay(player.position)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">所属</div>
                      <div>{player.team}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">評価</div>
                      <div>{player.evaluations ? player.evaluations.join(", ") : ""}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
      
      <PlayerFormDialog 
        isOpen={isPlayerFormOpen}
        onOpenChange={setIsPlayerFormOpen}
        onSuccess={() => {
          onPlayerAdded?.();
        }}
      />
    </Dialog>
  );
}