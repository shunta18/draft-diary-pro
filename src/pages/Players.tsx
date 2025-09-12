import { useState } from "react";
import { ArrowLeft, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";

// モックデータ
const mockPlayers = [
  {
    id: 1,
    name: "田中太郎",
    team: "○○高校",
    position: ["投手"],
    category: "高校",
    evaluation: "1位競合確実",
    draftYear: "2025",
  },
  {
    id: 2,
    name: "佐藤次郎",
    team: "△△大学",
    position: ["内野手"],
    category: "大学",
    evaluation: "2-3位",
    draftYear: "2025",
  },
  {
    id: 3,
    name: "鈴木三郎",
    team: "××社会人",
    position: ["外野手"],
    category: "社会人",
    evaluation: "4-5位",
    draftYear: "2025",
  },
];

const evaluationColors = {
  "1位競合確実": "bg-red-500 text-white",
  "一本釣り〜外れ1位": "bg-orange-500 text-white",
  "2-3位": "bg-yellow-500 text-white",
  "4-5位": "bg-blue-500 text-white",
  "6位以下": "bg-gray-500 text-white",
  "育成": "bg-purple-500 text-white",
};

export default function Players() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredPlayers = mockPlayers.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.team.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = player.draftYear === selectedYear;
    const matchesCategory = selectedCategory === "all" || player.category === selectedCategory;
    
    return matchesSearch && matchesYear && matchesCategory;
  });

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
            <h1 className="text-xl font-bold text-primary">選手リスト</h1>
            
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="年度選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025年</SelectItem>
                <SelectItem value="2026">2026年</SelectItem>
                <SelectItem value="2027">2027年</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Link to="/players/new">
            <Button className="gradient-accent border-0 shadow-soft hover:shadow-glow transition-smooth">
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
          
          <div className="flex space-x-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="所属別" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全て</SelectItem>
                <SelectItem value="高校">高校</SelectItem>
                <SelectItem value="大学">大学</SelectItem>
                <SelectItem value="社会人">社会人</SelectItem>
                <SelectItem value="独立リーグ">独立リーグ</SelectItem>
                <SelectItem value="その他">その他</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Players List */}
        <div className="space-y-3">
          {filteredPlayers.map((player) => (
            <Card key={player.id} className="gradient-card border-0 shadow-soft hover:shadow-elevated transition-smooth cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-bold text-lg text-primary">{player.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {player.category}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{player.team}</span>
                      <span>•</span>
                      <span>{player.position.join("・")}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge 
                      className={`${evaluationColors[player.evaluation as keyof typeof evaluationColors]} font-medium`}
                    >
                      {player.evaluation}
                    </Badge>
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
    </div>
  );
}