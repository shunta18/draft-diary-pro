import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { PublicPlayer } from "@/lib/supabase-storage";

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

interface PublicPlayerCardProps {
  player: PublicPlayer;
  isSelected: boolean;
  onPlayerClick: (player: PublicPlayer) => void;
  onSelectionToggle: (playerId: string) => void;
}

export const PublicPlayerCard = memo(function PublicPlayerCard({
  player,
  isSelected,
  onPlayerClick,
  onSelectionToggle,
}: PublicPlayerCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer relative">
      <div 
        className="absolute top-3 left-3 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelectionToggle(player.id)}
        />
      </div>
      <CardContent className="p-4 pl-12" onClick={() => onPlayerClick(player)}>
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
              {player.main_position || sortPositions(player.position)}
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
            {player.draft_status && player.draft_status !== "空欄" && player.draft_team && player.draft_rank && (
              <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {player.draft_team} {player.draft_rank}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
