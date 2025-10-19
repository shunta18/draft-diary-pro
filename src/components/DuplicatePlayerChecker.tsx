import { useState } from "react";
import { Player, deletePlayer } from "@/lib/supabase-storage";
import { calculateSimilarity } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Trash2, AlertTriangle, CheckCircle2, Info } from "lucide-react";

interface DuplicateGroup {
  type: 'id_duplicate' | 'exact_match' | 'similar';
  players: Player[];
  similarity?: number;
  canAutoDelete: boolean;
}

interface DuplicatePlayerCheckerProps {
  players: Player[];
  onPlayersUpdated: () => void;
}

export function DuplicatePlayerChecker({ players, onPlayersUpdated }: DuplicatePlayerCheckerProps) {
  const { toast } = useToast();
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ playerId: number; playerName: string } | null>(null);
  const [deletingPlayerId, setDeletingPlayerId] = useState<number | null>(null);

  const scanForDuplicates = () => {
    setIsScanning(true);
    const groups: DuplicateGroup[] = [];
    const processed = new Set<number>();

    try {
      // 1. ID重複チェック（imported_from_public_player_idが同じ）
      const idGroups = new Map<string, Player[]>();
      players.forEach(player => {
        if (player.imported_from_public_player_id && player.id && !processed.has(player.id)) {
          const id = player.imported_from_public_player_id;
          if (!idGroups.has(id)) {
            idGroups.set(id, []);
          }
          idGroups.get(id)!.push(player);
        }
      });

      idGroups.forEach(group => {
        if (group.length > 1) {
          groups.push({
            type: 'id_duplicate',
            players: group.sort((a, b) => {
              const dateA = new Date(a.created_at || 0).getTime();
              const dateB = new Date(b.created_at || 0).getTime();
              return dateA - dateB;
            }),
            canAutoDelete: true
          });
          group.forEach(p => processed.add(p.id!));
        }
      });

      // 2. 完全一致チェック（名前とチームが同じ）
      const nameTeamMap = new Map<string, Player[]>();
      players.forEach(player => {
        if (player.id && !processed.has(player.id)) {
          const key = `${player.name.trim()}_${player.team.trim()}`;
          if (!nameTeamMap.has(key)) {
            nameTeamMap.set(key, []);
          }
          nameTeamMap.get(key)!.push(player);
        }
      });

      nameTeamMap.forEach(group => {
        if (group.length > 1) {
          groups.push({
            type: 'exact_match',
            players: group.sort((a, b) => {
              const dateA = new Date(a.created_at || 0).getTime();
              const dateB = new Date(b.created_at || 0).getTime();
              return dateA - dateB;
            }),
            canAutoDelete: true
          });
          group.forEach(p => processed.add(p.id!));
        }
      });

      // 3. 類似選手チェック（名前の類似度が80%以上または部分一致）
      const unprocessedPlayers = players.filter(p => p.id && !processed.has(p.id));
      const similarGroups: Player[][] = [];

      unprocessedPlayers.forEach((player, index) => {
        for (let i = index + 1; i < unprocessedPlayers.length; i++) {
          const other = unprocessedPlayers[i];
          const similarity = calculateSimilarity(player.name, other.name);
          const isPartialMatch = player.name.includes(other.name) || other.name.includes(player.name);

          if (similarity >= 80 || (isPartialMatch && similarity >= 60)) {
            // 既存のグループに追加するか、新しいグループを作成
            let addedToGroup = false;
            for (const group of similarGroups) {
              if (group.some(p => p.id === player.id || p.id === other.id)) {
                if (!group.some(p => p.id === player.id)) group.push(player);
                if (!group.some(p => p.id === other.id)) group.push(other);
                addedToGroup = true;
                break;
              }
            }
            if (!addedToGroup) {
              similarGroups.push([player, other]);
            }
          }
        }
      });

      similarGroups.forEach(group => {
        if (group.length > 1) {
          const sortedGroup = group.sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateA - dateB;
          });

          // グループ内の最大類似度を計算
          let maxSimilarity = 0;
          for (let i = 0; i < sortedGroup.length; i++) {
            for (let j = i + 1; j < sortedGroup.length; j++) {
              const sim = calculateSimilarity(sortedGroup[i].name, sortedGroup[j].name);
              maxSimilarity = Math.max(maxSimilarity, sim);
            }
          }

          groups.push({
            type: 'similar',
            players: sortedGroup,
            similarity: maxSimilarity,
            canAutoDelete: false
          });
        }
      });

      setDuplicateGroups(groups);
      
      const idDuplicates = groups.filter(g => g.type === 'id_duplicate').length;
      const exactMatches = groups.filter(g => g.type === 'exact_match').length;
      const similarPlayers = groups.filter(g => g.type === 'similar').length;

      toast({
        title: "スキャン完了",
        description: `ID重複: ${idDuplicates}件、完全一致: ${exactMatches}件、類似選手: ${similarPlayers}件`,
      });

      if (groups.length > 0) {
        setShowDetails(true);
      }
    } catch (error) {
      console.error('Failed to scan duplicates:', error);
      toast({
        title: "エラー",
        description: "重複チェック中にエラーが発生しました。",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleDeletePlayer = async (playerId: number, playerName: string) => {
    setDeleteTarget({ playerId, playerName });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeletingPlayerId(deleteTarget.playerId);
    try {
      const success = await deletePlayer(deleteTarget.playerId);
      if (success) {
        toast({
          title: "削除しました",
          description: `${deleteTarget.playerName}を削除しました。`,
        });
        await onPlayersUpdated();
        // 再スキャン
        scanForDuplicates();
      } else {
        toast({
          title: "削除に失敗しました",
          description: "選手の削除中にエラーが発生しました。",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to delete player:', error);
      toast({
        title: "エラー",
        description: "選手の削除中にエラーが発生しました。",
        variant: "destructive",
      });
    } finally {
      setDeletingPlayerId(null);
      setDeleteTarget(null);
    }
  };

  const handleDeleteOlder = async (group: DuplicateGroup) => {
    // 最新の選手以外を削除
    const playersToDelete = group.players.slice(0, -1);
    
    for (const player of playersToDelete) {
      if (player.id) {
        setDeletingPlayerId(player.id);
        try {
          await deletePlayer(player.id);
        } catch (error) {
          console.error('Failed to delete player:', error);
        }
      }
    }

    toast({
      title: "一括削除完了",
      description: `${playersToDelete.length}名の古い選手を削除しました。`,
    });

    setDeletingPlayerId(null);
    await onPlayersUpdated();
    scanForDuplicates();
  };

  const getTypeLabel = (type: DuplicateGroup['type']) => {
    switch (type) {
      case 'id_duplicate':
        return 'ID重複';
      case 'exact_match':
        return '完全一致';
      case 'similar':
        return '類似選手';
    }
  };

  const getTypeIcon = (type: DuplicateGroup['type']) => {
    switch (type) {
      case 'id_duplicate':
        return <AlertTriangle className="h-4 w-4" />;
      case 'exact_match':
        return <AlertTriangle className="h-4 w-4" />;
      case 'similar':
        return <Info className="h-4 w-4" />;
    }
  };

  const getTypeBadgeVariant = (type: DuplicateGroup['type']) => {
    switch (type) {
      case 'id_duplicate':
        return 'destructive';
      case 'exact_match':
        return 'destructive';
      case 'similar':
        return 'default';
    }
  };

  const idDuplicatesCount = duplicateGroups.filter(g => g.type === 'id_duplicate').length;
  const exactMatchesCount = duplicateGroups.filter(g => g.type === 'exact_match').length;
  const similarPlayersCount = duplicateGroups.filter(g => g.type === 'similar').length;

  return (
    <div className="w-full">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4" />
            重複チェック
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={scanForDuplicates}
            disabled={isScanning || players.length === 0}
            className="w-full"
            variant="outline"
          >
            {isScanning ? "スキャン中..." : "重複をスキャン"}
          </Button>

          {duplicateGroups.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm space-y-1">
                {idDuplicatesCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      ID重複: {idDuplicatesCount}件
                    </Badge>
                    <span className="text-xs text-muted-foreground">（自動削除可能）</span>
                  </div>
                )}
                {exactMatchesCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      完全一致: {exactMatchesCount}件
                    </Badge>
                  </div>
                )}
                {similarPlayersCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="gap-1">
                      <Info className="h-3 w-3" />
                      類似選手: {similarPlayersCount}件
                    </Badge>
                    <span className="text-xs text-muted-foreground">（要確認）</span>
                  </div>
                )}
              </div>

              <Button
                onClick={() => setShowDetails(!showDetails)}
                variant="ghost"
                size="sm"
                className="w-full"
              >
                {showDetails ? "詳細を非表示" : "詳細を表示"}
              </Button>

              {showDetails && (
                <Accordion type="single" collapsible className="w-full">
                  {duplicateGroups.map((group, groupIndex) => (
                    <AccordionItem key={groupIndex} value={`group-${groupIndex}`}>
                      <AccordionTrigger className="text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant={getTypeBadgeVariant(group.type)} className="gap-1">
                            {getTypeIcon(group.type)}
                            {getTypeLabel(group.type)}
                          </Badge>
                          <span>{group.players[0].name}</span>
                          {group.similarity && (
                            <span className="text-xs text-muted-foreground">
                              (類似度: {group.similarity}%)
                            </span>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {group.canAutoDelete && group.players.length > 1 && (
                            <Button
                              onClick={() => handleDeleteOlder(group)}
                              variant="destructive"
                              size="sm"
                              className="w-full mb-2"
                              disabled={deletingPlayerId !== null}
                            >
                              <Trash2 className="h-3 w-3 mr-2" />
                              古い{group.players.length - 1}件を削除
                            </Button>
                          )}
                          
                          {group.players.map((player, playerIndex) => (
                            <Card key={player.id} className="p-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{player.name}</span>
                                    {playerIndex === group.players.length - 1 && (
                                      <Badge variant="outline" className="text-xs gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        最新
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground space-y-0.5">
                                    <div>{player.team} - {player.position}</div>
                                    <div>{player.category}</div>
                                    {player.created_at && (
                                      <div>
                                        登録日: {new Date(player.created_at).toLocaleDateString('ja-JP')}
                                      </div>
                                    )}
                                    {player.imported_from_public_player_id && (
                                      <div className="text-blue-500">
                                        インポート元ID: {player.imported_from_public_player_id}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  onClick={() => handleDeletePlayer(player.id!, player.name)}
                                  variant="ghost"
                                  size="sm"
                                  disabled={deletingPlayerId === player.id}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          )}

          {duplicateGroups.length === 0 && !isScanning && (
            <p className="text-sm text-muted-foreground text-center py-2">
              スキャンボタンを押して重複をチェックしてください
            </p>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>選手を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.playerName}を削除します。この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
