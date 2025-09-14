import { useState } from "react";
import { ArrowLeft, Star, Edit, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";

// 球団データ
const teams = [
  { name: "読売ジャイアンツ", colors: { primary: "16 85% 50%", secondary: "0 0% 0%" } },
  { name: "阪神タイガース", colors: { primary: "45 100% 50%", secondary: "0 0% 0%" } },
  { name: "中日ドラゴンズ", colors: { primary: "220 100% 50%", secondary: "220 100% 50%" } },
  { name: "横浜DeNAベイスターズ", colors: { primary: "220 100% 50%", secondary: "0 0% 100%" } },
  { name: "広島東洋カープ", colors: { primary: "0 85% 55%", secondary: "0 85% 55%" } },
  { name: "東京ヤクルトスワローズ", colors: { primary: "220 100% 50%", secondary: "120 100% 25%" } },
  { name: "福岡ソフトバンクホークス", colors: { primary: "45 100% 50%", secondary: "0 0% 0%" } },
  { name: "千葉ロッテマリーンズ", colors: { primary: "220 100% 25%", secondary: "220 100% 50%" } },
  { name: "埼玉西武ライオンズ", colors: { primary: "220 100% 50%", secondary: "0 85% 55%" } },
  { name: "東北楽天ゴールデンイーグルス", colors: { primary: "0 85% 55%", secondary: "45 100% 50%" } },
  { name: "北海道日本ハムファイターズ", colors: { primary: "220 100% 50%", secondary: "0 0% 100%" } },
  { name: "オリックスバファローズ", colors: { primary: "220 100% 50%", secondary: "45 100% 50%" } },
];

export default function Draft() {
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [favorites] = useState<string[]>(["読売ジャイアンツ", "阪神タイガース"]);
  const [currentPlan, setCurrentPlan] = useState<string>("プランA");
  const [plans, setPlans] = useState<{[key: string]: string}>({
    "プランA": "プランA",
    "プランB": "プランB", 
    "プランC": "プランC"
  });
  const [editingPlan, setEditingPlan] = useState<string>("");
  const [draftRounds, setDraftRounds] = useState<number[]>([1, 2, 3, 4, 5]);
  const [devRounds, setDevRounds] = useState<number[]>([1, 2, 3]);

  const favoriteTeams = teams.filter(team => favorites.includes(team.name));
  const otherTeams = teams.filter(team => !favorites.includes(team.name));

  if (selectedTeam) {
    const team = teams.find(t => t.name === selectedTeam);
    if (!team) return null;

    return (
      <div 
        className="min-h-screen"
        style={{
          background: `linear-gradient(135deg, hsl(${team.colors.primary} / 0.1), hsl(${team.colors.secondary} / 0.05))`
        }}
      >
        {/* Header with team colors */}
        <div 
          className="border-b shadow-soft"
          style={{
            background: `linear-gradient(135deg, hsl(${team.colors.primary}), hsl(${team.colors.secondary}))`
          }}
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedTeam("")}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold text-white">{team.name}</h1>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Star className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Pattern Management */}
          <Card className="gradient-card border-0 shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-primary">構想パターン</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.keys(plans).map((planKey) => (
                  <div key={planKey} className="flex items-center">
                    {editingPlan === planKey ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={plans[planKey]}
                          onChange={(e) => setPlans({...plans, [planKey]: e.target.value})}
                          className="px-2 py-1 text-sm border rounded"
                          onBlur={() => setEditingPlan("")}
                          onKeyDown={(e) => e.key === 'Enter' && setEditingPlan("")}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <Button 
                        variant={currentPlan === planKey ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setCurrentPlan(planKey)}
                        onDoubleClick={() => setEditingPlan(planKey)}
                      >
                        {plans[planKey]}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Draft Positions */}
          <Card className="gradient-card border-0 shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-primary">ドラフト枠</CardTitle>
                {draftRounds.length > 5 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setDraftRounds(draftRounds.slice(0, -1))}
                  >
                    削除
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {draftRounds.map((round) => (
                <div key={round} className="border rounded-lg p-4 bg-card/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{round}位</h4>
                    {round > 5 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setDraftRounds(draftRounds.filter(r => r !== round))}
                      >
                        削除
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                    <div className="p-2 border border-dashed border-muted-foreground/50 rounded text-center text-sm text-muted-foreground">
                      本命
                    </div>
                    <div className="p-2 border border-dashed border-muted-foreground/50 rounded text-center text-sm text-muted-foreground">
                      候補1
                    </div>
                    <div className="p-2 border border-dashed border-muted-foreground/50 rounded text-center text-sm text-muted-foreground">
                      候補2
                    </div>
                    <div className="p-2 border border-dashed border-muted-foreground/50 rounded text-center text-sm text-muted-foreground">
                      候補3
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-muted-foreground">メモ:</label>
                    <input 
                      className="w-full mt-1 p-2 text-sm border rounded bg-background/50"
                      placeholder="戦略や狙いを記録"
                    />
                  </div>
                </div>
              ))}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setDraftRounds([...draftRounds, Math.max(...draftRounds) + 1])}
              >
                <Plus className="h-4 w-4 mr-2" />
                ドラフト枠を追加
              </Button>
            </CardContent>
          </Card>

          {/* Development Draft */}
          <Card className="gradient-card border-0 shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-primary">育成枠</CardTitle>
                {devRounds.length > 3 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setDevRounds(devRounds.slice(0, -1))}
                  >
                    削除
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {devRounds.map((round) => (
                <div key={round} className="border rounded-lg p-4 bg-card/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">育成{round}位</h4>
                    {round > 3 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setDevRounds(devRounds.filter(r => r !== round))}
                      >
                        削除
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                    <div className="p-2 border border-dashed border-muted-foreground/50 rounded text-center text-sm text-muted-foreground">
                      本命
                    </div>
                    <div className="p-2 border border-dashed border-muted-foreground/50 rounded text-center text-sm text-muted-foreground">
                      候補1
                    </div>
                    <div className="p-2 border border-dashed border-muted-foreground/50 rounded text-center text-sm text-muted-foreground">
                      候補2
                    </div>
                    <div className="p-2 border border-dashed border-muted-foreground/50 rounded text-center text-sm text-muted-foreground">
                      候補3
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-muted-foreground">メモ:</label>
                    <input 
                      className="w-full mt-1 p-2 text-sm border rounded bg-background/50"
                      placeholder="戦略や狙いを記録"
                    />
                  </div>
                </div>
              ))}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setDevRounds([...devRounds, Math.max(...devRounds) + 1])}
              >
                <Plus className="h-4 w-4 mr-2" />
                育成枠を追加
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <div className="bg-card border-b shadow-soft">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-primary">ドラフト構想</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <Card className="gradient-card border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="text-primary">球団を選択してください</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-full shadow-soft">
                <SelectValue placeholder="ドラフト構想球団を選択" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.name} value={team.name}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Favorite Teams */}
        {favoriteTeams.length > 0 && (
          <Card className="gradient-card border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-primary flex items-center space-x-2">
                <Star className="h-5 w-5 text-accent" />
                <span>お気に入り球団</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {favoriteTeams.map((team) => (
                <div
                  key={team.name}
                  className="relative overflow-hidden rounded-lg cursor-pointer transition-smooth hover:shadow-soft"
                  style={{
                    background: `linear-gradient(135deg, hsl(${team.colors.primary} / 0.8), hsl(${team.colors.secondary} / 0.6))`
                  }}
                  onClick={() => setSelectedTeam(team.name)}
                >
                  <div className="p-4 flex items-center justify-between text-white">
                    <div className="flex items-center space-x-3">
                      <Star className="h-4 w-4" />
                      <span className="font-medium">{team.name}</span>
                    </div>
                    <span>→</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}