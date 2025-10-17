import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addPlayer } from "@/lib/supabase-storage";
import { useToast } from "@/hooks/use-toast";
import { Save, X } from "lucide-react";

const positions = ["投手", "捕手", "一塁手", "二塁手", "三塁手", "遊撃手", "外野手", "指名打者"];
const categories = ["高校", "大学", "社会人", "独立リーグ", "その他"];
const battingThrowingOptions = [
  "右投右打", "右投左打", "右投両打", 
  "左投右打", "左投左打", "左投両打"
];
const evaluations = [
  "1位競合", "1位一本釣り", "外れ1位", "2位", "3位", 
  "4位", "5位", "6位以下", "育成"
];
const teams = [
  "読売ジャイアンツ", "阪神タイガース", "中日ドラゴンズ", 
  "広島東洋カープ", "東京ヤクルトスワローズ", "横浜DeNAベイスターズ",
  "福岡ソフトバンクホークス", "北海道日本ハムファイターズ", "千葉ロッテマリーンズ",
  "埼玉西武ライオンズ", "東北楽天ゴールデンイーグルス", "オリックス・バファローズ"
];

const sortPositions = (positionsArray: string[]) => {
  return [...positionsArray].sort((a, b) => {
    const indexA = positions.indexOf(a);
    const indexB = positions.indexOf(b);
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
};

interface PlayerFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function PlayerFormDialog({ isOpen, onOpenChange, onSuccess }: PlayerFormDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    draftYear: "2025",
    category: "",
    team: "",
    positions: [] as string[],
    mainPosition: "",
    battingThrowing: "",
    hometown: "",
    age: undefined as number | undefined,
    careerPath: {
      middle_school: "",
      high_school: "",
      university: "",
      corporate: "",
    },
    usage: "",
    evaluations: [] as string[],
    recommended_teams: [] as string[],
    memo: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      draftYear: "2025",
      category: "",
      team: "",
      positions: [],
      mainPosition: "",
      battingThrowing: "",
      hometown: "",
      age: undefined,
      careerPath: {
        middle_school: "",
        high_school: "",
        university: "",
        corporate: "",
      },
      usage: "",
      evaluations: [],
      recommended_teams: [],
      memo: "",
    });
  };

  const toggleEvaluation = (evaluation: string) => {
    setFormData(prev => ({
      ...prev,
      evaluations: prev.evaluations.includes(evaluation)
        ? prev.evaluations.filter(e => e !== evaluation)
        : [...prev.evaluations, evaluation]
    }));
  };

  const toggleTeam = (team: string) => {
    setFormData(prev => ({
      ...prev,
      recommended_teams: prev.recommended_teams.includes(team)
        ? prev.recommended_teams.filter(t => t !== team)
        : [...prev.recommended_teams, team]
    }));
  };

  const togglePosition = (position: string) => {
    setFormData(prev => ({
      ...prev,
      positions: prev.positions.includes(position)
        ? prev.positions.filter(p => p !== position)
        : [...prev.positions, position]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const playerData = {
        name: formData.name,
        year: parseInt(formData.draftYear),
        category: formData.category,
        team: formData.team,
        position: sortPositions(formData.positions).join("、"),
        main_position: formData.mainPosition,
        batting_hand: formData.battingThrowing.includes("右打") ? "右" : formData.battingThrowing.includes("左打") ? "左" : undefined,
        throwing_hand: formData.battingThrowing.includes("右投") ? "右" : formData.battingThrowing.includes("左投") ? "左" : undefined,
        hometown: formData.hometown,
        age: formData.age,
        career_path: formData.careerPath,
        usage: formData.usage,
        evaluations: formData.evaluations,
        recommended_teams: formData.recommended_teams,
        memo: formData.memo,
        videos: [],
      };

      if (!formData.name || !formData.category || !formData.team || formData.positions.length === 0 || formData.evaluations.length === 0) {
        toast({
          title: "入力エラー",
          description: "必須項目を全て入力してください。",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const result = await addPlayer(playerData);
      
      if (result) {
        toast({
          title: "選手を追加しました",
          description: `${formData.name}が正常に登録されました。`,
        });
        resetForm();
        onOpenChange(false);
        onSuccess?.();
      } else {
        throw new Error("Failed to add player");
      }
    } catch (error) {
      console.error("Failed to save player:", error);
      const errorMessage = error instanceof Error ? error.message : "不明なエラーが発生しました";
      
      toast({
        title: "エラーが発生しました",
        description: `選手の保存に失敗しました: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新規選手追加</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本情報 */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">選手名 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="選手名を入力"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="draftYear">ドラフト年度 *</Label>
                  <Select value={formData.draftYear} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, draftYear: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025">2025年</SelectItem>
                      <SelectItem value="2026">2026年</SelectItem>
                      <SelectItem value="2027">2027年</SelectItem>
                      <SelectItem value="2028">2028年</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">カテゴリ *</Label>
                  <Select value={formData.category} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, category: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="カテゴリを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="team">所属 *</Label>
                  <Input
                    id="team"
                    value={formData.team}
                    onChange={(e) => setFormData(prev => ({ ...prev, team: e.target.value }))}
                    placeholder="所属チームを入力"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>ポジション * (複数選択可)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {positions.map(position => (
                    <Badge
                      key={position}
                      variant={formData.positions.includes(position) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => togglePosition(position)}
                    >
                      {position}
                    </Badge>
                  ))}
                </div>
              </div>

              {formData.positions.length > 0 && (
                <div>
                  <Label htmlFor="mainPosition">メインポジション</Label>
                  <Select value={formData.mainPosition} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, mainPosition: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="メインポジションを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.positions.map(pos => (
                        <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="battingThrowing">投打</Label>
                <Select value={formData.battingThrowing} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, battingThrowing: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="投打を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {battingThrowingOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>評価 * (複数選択可)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {evaluations.map(evaluation => (
                    <Badge
                      key={evaluation}
                      variant={formData.evaluations.includes(evaluation) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleEvaluation(evaluation)}
                    >
                      {evaluation}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="memo">メモ</Label>
                <Textarea
                  id="memo"
                  value={formData.memo}
                  onChange={(e) => setFormData(prev => ({ ...prev, memo: e.target.value }))}
                  placeholder="選手に関するメモを入力"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              キャンセル
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "保存中..." : "保存"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
