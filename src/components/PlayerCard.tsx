import { memo } from "react";
import { ThumbsUp, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Player } from "@/lib/supabase-storage";

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

interface PlayerCardProps {
  player: Player;
  isSelected: boolean;
  isAuthenticated: boolean;
  onPlayerClick: (player: Player) => void;
  onToggleFavorite: (player: Player) => void;
  onSelectionToggle: (playerId: number) => void;
}

export const PlayerCard = memo(function PlayerCard({
  player,
  isSelected,
  isAuthenticated,
  onPlayerClick,
  onToggleFavorite,
  onSelectionToggle,
}: PlayerCardProps) {
  return (
    <Card className="gradient-card border-0 shadow-soft hover:shadow-elevated transition-smooth">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {isAuthenticated && (
            <div className="flex items-center pt-1">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onSelectionToggle(player.id!)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div 
            className="flex-1 cursor-pointer" 
            onClick={() => onPlayerClick(player)}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center flex-wrap gap-2 min-w-0">
                <h3 className="font-bold text-base sm:text-lg text-primary break-words">{player.name}</h3>
                {player.is_favorite && (
                  <Badge className="bg-yellow-500 text-white text-xs flex-shrink-0">
                    <ThumbsUp className="h-3 w-3 mr-1 fill-current" />
                    イチオシ
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  {player.category}
                </Badge>
                {(player as any).is_public && (
                  <Badge className="bg-green-500 text-white text-xs flex-shrink-0">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    公開中
                  </Badge>
                )}
                {player.imported_from_public_player_id && (
                  <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-300 flex-shrink-0">
                    インポート
                  </Badge>
                )}
                {player.id === 1 && (
                  <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300 flex-shrink-0">
                    サンプル
                  </Badge>
                )}
              </div>
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(player);
                  }}
                >
                  <ThumbsUp 
                    className={`h-5 w-5 ${player.is_favorite ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`}
                  />
                </Button>
              )}
            </div>
          
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs sm:text-sm text-muted-foreground">
              <span className="break-all">{player.team}</span>
              <span className="hidden sm:inline">•</span>
              <span className="break-all">{(player as any).main_position || (player as any).mainPosition || sortPositions(player.position).split('、')[0]}</span>
              <span className="hidden sm:inline">•</span>
              <span className="whitespace-nowrap">{player.year || 2025}年</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
