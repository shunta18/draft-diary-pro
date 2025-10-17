import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Search, Calendar, MapPin, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import DiaryDetailDialog from "@/components/DiaryDetailDialog";
import { DiaryEntry, getDiaryEntries as getLocalDiaryEntries } from "@/lib/diaryStorage";
import { getDiaryEntries, uploadDiaryToPublic, DiaryEntry as SupabaseDiaryEntry } from "@/lib/supabase-storage";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const categoryColors = {
  "高校": "bg-blue-500 text-white",
  "大学": "bg-green-500 text-white",
  "社会人": "bg-orange-500 text-white",
  "独立リーグ": "bg-purple-500 text-white",
  "その他": "bg-gray-500 text-white",
};

export default function Diary() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | SupabaseDiaryEntry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [diaryEntries, setDiaryEntries] = useState<(DiaryEntry | SupabaseDiaryEntry)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDiaries, setSelectedDiaries] = useState<number[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const loadDiaryEntries = async () => {
      setIsLoading(true);
      try {
        if (user) {
          // ログイン済みユーザーはSupabaseから取得
          const entries = await getDiaryEntries();
          setDiaryEntries(entries);
        } else {
          // 未ログインユーザーはローカルストレージから取得
          const entries = getLocalDiaryEntries();
          setDiaryEntries(entries);
        }
      } catch (error) {
        console.error('Failed to load diary entries:', error);
        // エラー時はローカルストレージから取得
        const entries = getLocalDiaryEntries();
        setDiaryEntries(entries);
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading) {
      loadDiaryEntries();
    }
  }, [user, loading]);

  const handleEdit = (entry: DiaryEntry | SupabaseDiaryEntry) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setIsDetailOpen(false);
    navigate("/diary/form", { state: { editingEntryId: entry.id } });
  };

  const handleNewRecord = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    navigate("/diary/form");
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      if (user) {
        const entries = await getDiaryEntries();
        setDiaryEntries(entries);
      } else {
        const entries = getLocalDiaryEntries();
        setDiaryEntries(entries);
      }
    } catch (error) {
      console.error('Failed to reload diary entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDiary = (diaryId: number) => {
    setSelectedDiaries(prev => 
      prev.includes(diaryId) 
        ? prev.filter(id => id !== diaryId)
        : [...prev, diaryId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDiaries.length === filteredEntries.length) {
      setSelectedDiaries([]);
    } else {
      setSelectedDiaries(filteredEntries.map(entry => entry.id as number));
    }
  };

  const handleUploadToPublic = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "ログインが必要です",
        description: "データベースに共有するにはログインしてください",
      });
      navigate('/auth');
      return;
    }

    if (selectedDiaries.length === 0) {
      toast({
        variant: "destructive",
        title: "観戦日記が選択されていません",
        description: "共有する観戦日記を選択してください",
      });
      return;
    }

    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const diaryId of selectedDiaries) {
      try {
        await uploadDiaryToPublic(diaryId);
        successCount++;
      } catch (error: any) {
        console.error(`Failed to upload diary ${diaryId}:`, error);
        errorCount++;
      }
    }

    setIsUploading(false);
    setSelectedDiaries([]);

    if (successCount > 0) {
      toast({
        title: "アップロード完了",
        description: `${successCount}件の観戦日記をデータベースに共有しました${errorCount > 0 ? `（${errorCount}件は既に共有済みまたはエラー）` : ''}`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "アップロード失敗",
        description: "選択した観戦日記は既に共有されているか、エラーが発生しました",
      });
    }
  };

  const filteredEntries = diaryEntries.filter((entry) => {
    const matchCard = 'match_card' in entry ? entry.match_card : entry.matchCard;
    const matchesSearch = matchCard.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.venue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = selectedMonth === "all" || entry.date.startsWith(selectedMonth);
    const matchesCategory = selectedCategory === "all" || entry.category === selectedCategory;
    
    console.log('Filtering entry:', entry.date, 'selectedMonth:', selectedMonth, 'matchesMonth:', matchesMonth);
    
    return matchesSearch && matchesMonth && matchesCategory;
  });

  console.log('Filtered entries:', filteredEntries);

  const diaryStructuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "野球観戦日記",
    "description": "高校野球、大学野球、社会人野球の観戦記録",
    "blogPost": filteredEntries.slice(0, 5).map(entry => {
      const matchCard = 'match_card' in entry ? entry.match_card : entry.matchCard;
      const overallImpression = 'overall_impression' in entry ? entry.overall_impression : (entry as any).overallImpression;
      return {
        "@type": "BlogPosting",
        "headline": matchCard,
        "dateCreated": entry.date,
        "description": overallImpression,
        "location": entry.venue,
        "author": {
          "@type": "Person",
          "name": "野球ファン"
        }
      };
    })
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Navigation />
      <SEO
        title="観戦日記"
        description={`野球観戦記録${filteredEntries.length}件を管理。高校野球、大学野球、社会人野球の詳細な観戦レポートと選手評価。`}
        keywords={[
          "野球観戦日記", "観戦記録", "高校野球観戦", "大学野球観戦", 
          "社会人野球観戦", "野球レポート", "選手観察"
        ]}
        structuredData={diaryStructuredData}
      />
      {/* Header */}
      <div className="bg-card border-b shadow-soft">
        <div className="p-4">
          <div className="flex items-center space-x-2 md:space-x-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-lg md:text-xl font-bold text-primary">観戦日記</h1>
          </div>
        </div>
        
        {!user && !loading && (
          <div className="px-4 pb-2">
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-3">
                <p className="text-sm text-yellow-800">
                  <strong>注意:</strong> ログインしていないため、記録はこのブラウザにのみ保存されます。
                  アカウント間での同期をご希望の場合は、<Link to="/auth" className="underline font-medium">ログイン</Link>してください。
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* New Record Button */}
        <Button 
          onClick={handleNewRecord}
          className="w-full bg-[#E8A35D] hover:bg-[#D89550] text-white font-medium py-6"
        >
          <Plus className="h-5 w-5 mr-2" />
          新規
        </Button>

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
          {user && filteredEntries.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <Checkbox
                  id="select-all"
                  checked={selectedDiaries.length === filteredEntries.length && filteredEntries.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium cursor-pointer"
                >
                  すべて選択 ({selectedDiaries.length}/{filteredEntries.length})
                </label>
              </div>
              
              {selectedDiaries.length > 0 && (
                <Button 
                  onClick={handleUploadToPublic}
                  disabled={isUploading}
                  className="w-full bg-[#2D5F3F] hover:bg-[#234A32] text-white font-medium py-6"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  {isUploading ? 'アップロード中...' : 'すべてアップロード'}
                </Button>
              )}
            </div>
          )}
          
          {isLoading ? (
            <Card className="gradient-card border-0 shadow-soft">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">読み込み中...</p>
              </CardContent>
            </Card>
          ) : filteredEntries.map((entry) => (
            <Card 
              key={entry.id} 
              className="gradient-card border-0 shadow-soft hover:shadow-elevated transition-smooth"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {user && (
                    <Checkbox
                      checked={selectedDiaries.includes(entry.id as number)}
                      onCheckedChange={() => handleSelectDiary(entry.id as number)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1"
                    />
                  )}
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => {
                      setSelectedEntry(entry);
                      setIsDetailOpen(true);
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base text-primary truncate mb-2">
                          {'match_card' in entry ? entry.match_card : entry.matchCard}
                        </h3>
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
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={`${categoryColors[entry.category as keyof typeof categoryColors]} font-medium shrink-0`}>
                          {entry.category}
                        </Badge>
                        {entry.id === 1 && (
                          <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300 shrink-0">
                            サンプル
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {'player_comments' in entry ? entry.player_comments : (entry as any).playerComments}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {!isLoading && filteredEntries.length === 0 && (
            <Card className="gradient-card border-0 shadow-soft">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">該当する観戦記録が見つかりません</p>
                <Button onClick={handleNewRecord} variant="outline" className="mt-4">
                    最初の観戦記録を作成
                  </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* About Section - SEO & AdSense対策（非ログイン時のみ表示） */}
        {!user && (
          <section className="bg-card/30 border border-border/30 rounded-lg p-6 space-y-4 mt-6">
            <h2 className="text-xl font-bold text-primary">観戦日記機能について</h2>
            
            <div className="space-y-3 text-sm text-foreground/90 leading-relaxed">
              <p>
                このページでは、野球の観戦記録を詳細に記録・管理できます。高校野球、大学野球、社会人野球、独立リーグなど、
                あらゆるカテゴリーの試合観戦を記録し、選手評価や試合の印象を後から振り返ることができます。
              </p>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-primary">主な機能：</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>試合情報の記録（対戦カード、日時、会場、スコア）</li>
                  <li>カテゴリー別の分類（高校・大学・社会人・独立リーグ・その他）</li>
                  <li>選手別のコメント記録</li>
                  <li>全体的な試合の印象メモ</li>
                  <li>年月・カテゴリーによる絞り込み検索</li>
                  <li>対戦カード・会場名での検索</li>
                  <li>観戦記録の編集・削除機能</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-primary">こんな方におすすめ：</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>球場に足を運んで野球観戦を楽しむ方</li>
                  <li>注目選手の成長過程を記録したい方</li>
                  <li>複数の試合を見比べて評価したい方</li>
                  <li>自分だけの観戦ノートを作りたい方</li>
                  <li>後から観戦記録を振り返りたい方</li>
                </ul>
              </div>
              
              <p className="text-xs text-muted-foreground pt-2 border-t">
                現在お試しモードでご利用中です。アカウント登録すると、すべての観戦記録がクラウドに保存され、
                スマートフォンやタブレットからもアクセスできるようになります。
              </p>
            </div>
          </section>
        )}
      </div>

      <Footer />

      <DiaryDetailDialog 
        entry={selectedEntry as any}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}