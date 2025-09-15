import { useState, useEffect } from "react";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { DiaryEntry, addDiaryEntry, updateDiaryEntry, getDiaryEntryById } from "@/lib/diaryStorage";

export default function DiaryForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
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
    videoLinks: [] as string[],
  });

  const [newVideoLink, setNewVideoLink] = useState("");

  useEffect(() => {
    if (isEditing) {
      const entry = getDiaryEntryById(editingEntryId);
      if (entry) {
        setFormData({
          date: entry.date.replace(/\//g, '-'),
          venue: entry.venue,
          category: entry.category,
          matchCard: entry.matchCard,
          score: entry.score,
          playerComments: entry.playerComments,
          overallImpression: entry.overallImpression,
          videoLinks: entry.videoLinks || [],
        });
      }
    }
  }, [isEditing, editingEntryId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entryData = {
      ...formData,
      date: formData.date.replace(/-/g, '/'),
    };
    
    try {
      if (isEditing) {
        updateDiaryEntry(editingEntryId, entryData);
        toast({
          title: "観戦記録を更新しました",
          description: "記録が正常に更新されました。",
        });
      } else {
        addDiaryEntry(entryData);
        toast({
          title: "観戦記録を保存しました",
          description: "記録が正常に保存されました。",
        });
      }
      
      navigate("/diary");
    } catch (error) {
      toast({
        title: "エラーが発生しました",
        description: "記録の保存に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const addVideoLink = () => {
    if (newVideoLink.trim()) {
      setFormData(prev => ({
        ...prev,
        videoLinks: [...prev.videoLinks, newVideoLink.trim()]
      }));
      setNewVideoLink("");
    }
  };

  const removeVideoLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videoLinks: prev.videoLinks.filter((_, i) => i !== index)
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
                <Label htmlFor="playerComments">注目選手・コメント</Label>
                <Textarea
                  id="playerComments"
                  placeholder="田中太郎の投球が素晴らしかった。球速150km/h台を連発し..."
                  value={formData.playerComments}
                  onChange={(e) => updateFormData("playerComments", e.target.value)}
                  rows={4}
                  required
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

              {/* Video Links */}
              <div className="space-y-2">
                <Label>動画リンク（任意）</Label>
                <div className="space-y-2">
                  {formData.videoLinks.map((link, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input value={link} readOnly />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeVideoLink(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <Input
                      placeholder="YouTube、ニコニコ動画などのURL"
                      value={newVideoLink}
                      onChange={(e) => setNewVideoLink(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addVideoLink}
                      disabled={!newVideoLink.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button type="submit" className="flex-1 gradient-accent border-0 shadow-soft hover:shadow-glow transition-smooth">
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