import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Search, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import DiaryDetailDialog from "@/components/DiaryDetailDialog";
import { DiaryEntry, getDiaryEntries } from "@/lib/diaryStorage";

const categoryColors = {
  "高校": "bg-blue-500 text-white",
  "大学": "bg-green-500 text-white",
  "社会人": "bg-orange-500 text-white",
  "独立リーグ": "bg-purple-500 text-white",
  "その他": "bg-gray-500 text-white",
};

export default function Diary() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    const entries = getDiaryEntries();
    console.log('All diary entries in Diary page:', entries);
    setDiaryEntries(entries);
  }, []);

  const handleEdit = (entry: DiaryEntry) => {
    setIsDetailOpen(false);
    navigate("/diary/form", { state: { editingEntryId: entry.id } });
  };

  const handleDelete = () => {
    setDiaryEntries(getDiaryEntries());
  };

  const filteredEntries = diaryEntries.filter((entry) => {
    const matchesSearch = entry.matchCard.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.venue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = selectedMonth === "all" || entry.date.startsWith(selectedMonth);
    const matchesCategory = selectedCategory === "all" || entry.category === selectedCategory;
    
    console.log('Filtering entry:', entry.date, 'selectedMonth:', selectedMonth, 'matchesMonth:', matchesMonth);
    
    return matchesSearch && matchesMonth && matchesCategory;
  });

  console.log('Filtered entries:', filteredEntries);

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
            <h1 className="text-xl font-bold text-primary">観戦日記</h1>
          </div>
          
          <Link to="/diary/form">
            <Button className="gradient-accent border-0 shadow-soft hover:shadow-glow transition-smooth">
              <Plus className="h-4 w-4 mr-2" />
              新規記録
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
              placeholder="対戦カード・会場名で検索"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 shadow-soft"
            />
          </div>
          
          <div className="flex space-x-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="年月選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全て</SelectItem>
                <SelectItem value="2025">2025年</SelectItem>
                <SelectItem value="2024">2024年</SelectItem>
                <SelectItem value="2023">2023年</SelectItem>
                <SelectItem value="2022">2022年</SelectItem>
                <SelectItem value="2021">2021年</SelectItem>
                <SelectItem value="2020">2020年</SelectItem>
                <SelectItem value="2019">2019年</SelectItem>
                <SelectItem value="2018">2018年</SelectItem>
                <SelectItem value="2017">2017年</SelectItem>
                <SelectItem value="2016">2016年</SelectItem>
                <SelectItem value="2015">2015年</SelectItem>
                <SelectItem value="2014">2014年</SelectItem>
                <SelectItem value="2013">2013年</SelectItem>
                <SelectItem value="2012">2012年</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="カテゴリ" />
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

        {/* Diary Entries */}
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <Card 
              key={entry.id} 
              className="gradient-card border-0 shadow-soft hover:shadow-elevated transition-smooth cursor-pointer"
              onClick={() => {
                setSelectedEntry(entry);
                setIsDetailOpen(true);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-primary truncate mb-2">{entry.matchCard}</h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{entry.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{entry.venue}</span>
                      </div>
                      {entry.score && (
                        <span className="font-medium text-primary">{entry.score}</span>
                      )}
                    </div>
                  </div>
                  
                  <Badge className={`${categoryColors[entry.category as keyof typeof categoryColors]} font-medium ml-2 shrink-0`}>
                    {entry.category}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {entry.playerComments}
                </p>
              </CardContent>
            </Card>
          ))}
          
          {filteredEntries.length === 0 && (
            <Card className="gradient-card border-0 shadow-soft">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">該当する観戦記録が見つかりません</p>
                <Link to="/diary/form">
                  <Button variant="outline" className="mt-4">
                    最初の観戦記録を作成
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <DiaryDetailDialog 
        entry={selectedEntry}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}