import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Player } from "@/lib/playerStorage";
import { Search } from "lucide-react";

interface PlayerSelectionDialogProps {
  players: Player[];
  selectedPlayerId?: number;
  onSelect: (playerId: number | undefined) => void;
  children: React.ReactNode;
}

export function PlayerSelectionDialog({ players, selectedPlayerId, onSelect, children }: PlayerSelectionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [filterPosition, setFilterPosition] = useState("");
  const [filterTeam, setFilterTeam] = useState("");
  const [filterEvaluation, setFilterEvaluation] = useState("");

  // Get unique values for filters
  const positions = [...new Set(players.flatMap(p => p.position))];
  const teams = [...new Set(players.map(p => p.team))];
  const evaluations = [...new Set(players.map(p => p.evaluation))];

  // Filter players based on search criteria
  const filteredPlayers = players.filter(player => {
    return (
      player.name.toLowerCase().includes(searchName.toLowerCase()) &&
      (filterPosition === "" || filterPosition === "all" || player.position.includes(filterPosition)) &&
      (filterTeam === "" || filterTeam === "all" || player.team === filterTeam) &&
      (filterEvaluation === "" || filterEvaluation === "all" || player.evaluation === filterEvaluation)
    );
  });

  const handleSelect = (playerId?: number) => {
    onSelect(playerId);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setSearchName("");
    setFilterPosition("");
    setFilterTeam("");
    setFilterEvaluation("");
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
              <Select value={filterPosition} onValueChange={setFilterPosition}>
                <SelectTrigger>
                  <SelectValue placeholder="全ポジション" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全ポジション</SelectItem>
                  {positions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">所属</label>
              <Select value={filterTeam} onValueChange={setFilterTeam}>
                <SelectTrigger>
                  <SelectValue placeholder="全チーム" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全チーム</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team} value={team}>
                      {team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">評価</label>
              <Select value={filterEvaluation} onValueChange={setFilterEvaluation}>
                <SelectTrigger>
                  <SelectValue placeholder="全評価" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全評価</SelectItem>
                  {evaluations.map((evaluation) => (
                    <SelectItem key={evaluation} value={evaluation}>
                      {evaluation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <div className="mb-2">
              <Button 
                variant={selectedPlayerId === undefined ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => handleSelect(undefined)}
              >
                選択なし
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
                      <div>{player.position.join(', ')}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">所属</div>
                      <div>{player.team}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">評価</div>
                      <div>{player.evaluation}</div>
                    </div>
                  </div>
                  {player.memo && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {player.memo}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}