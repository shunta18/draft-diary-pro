import { useState, useEffect } from "react";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { DiaryEntry, addDiaryEntry as addLocalDiaryEntry, updateDiaryEntry as updateLocalDiaryEntry, getDiaryEntryById as getLocalDiaryEntryById } from "@/lib/diaryStorage";
import { addDiaryEntry, updateDiaryEntry, getDiaryEntryById, DiaryEntry as SupabaseDiaryEntry } from "@/lib/supabase-storage";
import { useAuth } from "@/hooks/useAuth";

export default function DiaryForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  
  const editingEntryId = location.state?.editingEntryId;
  const isEditing = !!editingEntryId;
  
  const [formData, setFormData] = useState({
    date: "",
    venue: "",
    category: "",
    matchCard: "",
    score: "",
    playerComments: "",
    overallImpression: "",
    videos: [] as string[],
  });

  const [videoFiles, setVideoFiles] = useState<FileList | null>(null);

  useEffect(() => {
    const loadEntry = async () => {
      if (isEditing && !loading) {
        try {
          let entry: DiaryEntry | SupabaseDiaryEntry | null = null;
          
          if (user) {
            entry = await getDiaryEntryById(editingEntryId);
          } else {
            entry = getLocalDiaryEntryById(editingEntryId);
          }
          
          if (entry) {
            const matchCard = 'match_card' in entry ? entry.match_card : entry.matchCard;
            const playerComments = 'player_comments' in entry ? entry.player_comments : (entry as any).playerComments;
            const overallImpression = 'overall_impression' in entry ? entry.overall_impression : (entry as any).overallImpression;
            
            setFormData({
              date: entry.date.replace(/\//g, '-'),
              venue: entry.venue,
              category: entry.category,
              matchCard: matchCard,
              score: entry.score,
              playerComments: playerComments || "",
              overallImpression: overallImpression || "",
              videos: entry.videos || [],
            });
          }
        } catch (error) {
          console.error('Failed to load diary entry:', error);
          toast({
            title: "エラーが発生しました",
            description: "記録の読み込みに失敗しました。",
            variant: "destructive",
          });
        }
      }
    };

    loadEntry();
  }, [isEditing, editingEntryId, user, loading, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Handle video file uploads
    const videoUrls: string[] = [...formData.videos];
    if (videoFiles) {
      for (let i = 0; i < videoFiles.length; i++) {
        const file = videoFiles[i];
        const videoUrl = URL.createObjectURL(file);
        videoUrls.push(videoUrl);
      }
    }
    
    const entryData = {
      date: formData.date.replace(/-/g, '/'),
      venue: formData.venue,
      category: formData.category,
      match_card: formData.matchCard,
      score: formData.score,
      player_comments: formData.playerComments,
      overall_impression: formData.overallImpression,
      videos: videoUrls,
    };
    
    try {
      if (user) {
        // ログイン済みユーザーはSupabaseに保存
        if (isEditing) {
          await updateDiaryEntry(editingEntryId, entryData);
          toast({
            title: "観戦記録を更新しました",
            description: "記録が正常に更新されました。",
          });
        } else {
          await addDiaryEntry(entryData);
          toast({
            title: "観戦記録を保存しました",
            description: "記録が正常に保存されました。",
          });
        }
      } else {
        // 未ログインユーザーはローカルストレージに保存
        const localEntryData = {
          ...entryData,
          matchCard: formData.matchCard,
          playerComments: formData.playerComments,
          overallImpression: formData.overallImpression,
        };
        
        if (isEditing) {
          updateLocalDiaryEntry(editingEntryId, localEntryData);
          toast({
            title: "観戦記録を更新しました",
            description: "記録がローカルに更新されました。",
          });
        } else {
          addLocalDiaryEntry(localEntryData);
          toast({
            title: "観戦記録を保存しました",
            description: "記録がローカルに保存されました。",
          });
        }
      }
      
      navigate("/diary");
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "エラーが発生しました",
        description: "記録の保存に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoFiles(e.target.files);
  };

  const removeVideo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <div className="bg-card border-b shadow-soft">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Link to="/diary">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-primary">
              {isEditing ? "観戦記録編集" : "新規観戦記録"}
            </h1>
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

      <div className="p-4">
        <Card className="gradient-card border-0 shadow-soft">
          <CardHeader>
            <CardTitle>{isEditing ? "観戦記録編集" : "観戦記録"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">観戦日</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => updateFormData("date", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue">会場</Label>
                  <Input
                    id="venue"
                    placeholder="甲子園、東京ドームなど"
                    value={formData.venue}
                    onChange={(e) => updateFormData("venue", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>カテゴリ</Label>
                  <Select value={formData.category} onValueChange={(value) => updateFormData("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="カテゴリを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="高校">高校</SelectItem>
                      <SelectItem value="大学">大学</SelectItem>
                      <SelectItem value="社会人">社会人</SelectItem>
                      <SelectItem value="独立リーグ">独立リーグ</SelectItem>
                      <SelectItem value="その他">その他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="score">スコア（任意）</Label>
                  <Input
                    id="score"
                    placeholder="7-3"
                    value={formData.score}
                    onChange={(e) => updateFormData("score", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="matchCard">対戦カード</Label>
                <Input
                  id="matchCard"
                  placeholder="○○高校 vs △△高校"
                  value={formData.matchCard}
                  onChange={(e) => updateFormData("matchCard", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="playerComments">注目選手・コメント（任意）</Label>
                <Textarea
                  id="playerComments"
                  placeholder="田中太郎の投球が素晴らしかった。球速150km/h台を連発し..."
                  value={formData.playerComments}
                  onChange={(e) => updateFormData("playerComments", e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="overallImpression">全体的な感想（任意）</Label>
                <Textarea
                  id="overallImpression"
                  placeholder="両チームとも好ゲームだった。特に..."
                  value={formData.overallImpression}
                  onChange={(e) => updateFormData("overallImpression", e.target.value)}
                  rows={3}
                />
              </div>

              {/* Videos */}
              <div className="space-y-2">
                <Label>動画（任意）</Label>
                <div className="space-y-2">
                  {formData.videos.map((video, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="flex-1 p-2 bg-muted/50 rounded">
                        <video controls className="w-full max-h-32 rounded" src={video}>
                          動画を再生できません
                        </video>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeVideo(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={handleVideoUpload}
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button 
                  type="submit" 
                  variant="secondary"
                  className="flex-1 gradient-accent text-white border-0 shadow-soft hover:shadow-glow transition-smooth"
                >
                  {isEditing ? "更新" : "保存"}
                </Button>
                <Link to="/diary">
                  <Button type="button" variant="outline" className="px-6">
                    キャンセル
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}