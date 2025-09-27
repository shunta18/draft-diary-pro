import { useState, useEffect } from "react";
import { ArrowLeft, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useParams, useNavigate } from "react-router-dom";
import { addPlayer, updatePlayer, getPlayerById } from "@/lib/supabase-storage";

const positions = ["投手", "捕手", "一塁手", "二塁手", "三塁手", "遊撃手", "外野手", "指名打者"];
const categories = ["高校", "大学", "社会人", "独立リーグ", "その他"];
const battingThrowingOptions = [
  "右投右打", "右投左打", "右投両打", 
  "左投右打", "左投左打", "左投両打"
];
const careerPaths = ["プロ志望", "大学進学", "社会人", "未定"];
const evaluations = [
  "1位競合確実", "一本釣り〜外れ1位", "2-3位", 
  "4-5位", "6位以下", "育成"
];

export default function PlayerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    name: "",
    draftYear: "2025",
    category: "",
    team: "",
    positions: [] as string[],
    battingThrowing: "",
    hometown: "",
    careerPath: "",
    usage: "",
    evaluation: "",
    memo: "",
  });

  const [videoLinks, setVideoLinks] = useState([""]);

  useEffect(() => {
    if (isEditing && id) {
      const loadPlayer = async () => {
        const player = await getPlayerById(parseInt(id));
        if (player) {
          setFormData({
            name: player.name,
            draftYear: player.year?.toString() || "2025",
            category: player.category,
            team: player.team,
            positions: Array.isArray(player.position) ? player.position : [player.position],
            battingThrowing: `${player.throwing_hand || ""}投${player.batting_hand || ""}打`,
            hometown: player.hometown || "",
            careerPath: player.career_path || "",
            usage: player.usage || "",
            evaluation: player.evaluation || "",
            memo: player.memo || "",
          });
          setVideoLinks([""]);
        }
      };
      loadPlayer();
    }
  }, [isEditing, id]);

  const togglePosition = (position: string) => {
    setFormData(prev => ({
      ...prev,
      positions: prev.positions.includes(position)
        ? prev.positions.filter(p => p !== position)
        : [...prev.positions, position]
    }));
  };

  const addVideoLink = () => {
    setVideoLinks(prev => [...prev, ""]);
  };

  const removeVideoLink = (index: number) => {
    setVideoLinks(prev => prev.filter((_, i) => i !== index));
  };

  const updateVideoLink = (index: number, value: string) => {
    setVideoLinks(prev => prev.map((link, i) => i === index ? value : link));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const playerData = {
      name: formData.name,
      year: parseInt(formData.draftYear),
      category: formData.category,
      team: formData.team,
      position: formData.positions.join(", "),
      batting_hand: formData.battingThrowing.includes("右打") ? "右" : formData.battingThrowing.includes("左打") ? "左" : undefined,
      throwing_hand: formData.battingThrowing.includes("右投") ? "右" : formData.battingThrowing.includes("左投") ? "左" : undefined,
      hometown: formData.hometown,
      career_path: formData.careerPath,
      usage: formData.usage,
      evaluation: formData.evaluation,
      memo: formData.memo,
    };

    try {
      if (isEditing && id) {
        await updatePlayer(parseInt(id), playerData);
      } else {
        await addPlayer(playerData);
      }
      navigate("/players");
    } catch (error) {
      console.error("Failed to save player:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <div className="bg-card border-b shadow-soft">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Link to="/players">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-primary">
              {isEditing ? "選手情報編集" : "新規選手追加"}
            </h1>
          </div>
          
          <div className="flex space-x-2">
            <Link to="/players">
              <Button variant="outline" size="sm">
                キャンセル
              </Button>
            </Link>
            <Button 
              type="submit" 
              form="player-form"
              className="gradient-accent border-0 shadow-soft hover:shadow-glow transition-smooth"
            >
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <form id="player-form" onSubmit={handleSubmit} className="space-y-6">
          {/* 基本情報 */}
          <Card className="gradient-card border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-primary">基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="required">選手名 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="選手名を入力"
                    required
                    className="shadow-soft"
                  />
                </div>
                
                <div>
                  <Label htmlFor="draftYear">ドラフト年度 *</Label>
                  <Select value={formData.draftYear} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, draftYear: value }))
                  }>
                    <SelectTrigger className="shadow-soft">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025">2025年</SelectItem>
                      <SelectItem value="2026">2026年</SelectItem>
                      <SelectItem value="2027">2027年</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>カテゴリ *</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {categories.map(category => (
                      <Button
                        key={category}
                        type="button"
                        variant={formData.category === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, category }))}
                        className="transition-smooth"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="team">所属チーム *</Label>
                  <Input
                    id="team"
                    value={formData.team}
                    onChange={(e) => setFormData(prev => ({ ...prev, team: e.target.value }))}
                    placeholder="所属チーム名を入力"
                    required
                    className="shadow-soft"
                  />
                </div>
              </div>

              <div>
                <Label>ポジション *</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {positions.map(position => (
                    <Badge
                      key={position}
                      variant={formData.positions.includes(position) ? "default" : "outline"}
                      className={`cursor-pointer transition-smooth ${
                        formData.positions.includes(position) 
                          ? "bg-primary text-primary-foreground hover:bg-primary/80" 
                          : "hover:bg-secondary"
                      }`}
                      onClick={() => togglePosition(position)}
                    >
                      {position}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>投打</Label>
                  <Select value={formData.battingThrowing} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, battingThrowing: value }))
                  }>
                    <SelectTrigger className="shadow-soft">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {battingThrowingOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="hometown">出身地</Label>
                  <Input
                    id="hometown"
                    value={formData.hometown}
                    onChange={(e) => setFormData(prev => ({ ...prev, hometown: e.target.value }))}
                    placeholder="出身地を入力"
                    className="shadow-soft"
                  />
                </div>

                <div>
                  <Label>進路先 *</Label>
                  <Select value={formData.careerPath} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, careerPath: value }))
                  }>
                    <SelectTrigger className="shadow-soft">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {careerPaths.map(path => (
                        <SelectItem key={path} value={path}>{path}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="usage">起用法</Label>
                <Input
                  id="usage"
                  value={formData.usage}
                  onChange={(e) => setFormData(prev => ({ ...prev, usage: e.target.value }))}
                  placeholder="先発、中継ぎ、抑え、代打、代走など"
                  className="shadow-soft"
                />
              </div>
            </CardContent>
          </Card>

          {/* 評価情報 */}
          <Card className="gradient-card border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-primary">評価情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>ドラフト評価 *</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {evaluations.map(evaluation => (
                    <Button
                      key={evaluation}
                      type="button"
                      variant={formData.evaluation === evaluation ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, evaluation }))}
                      className="transition-smooth"
                    >
                      {evaluation}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="memo">メモ</Label>
                <Textarea
                  id="memo"
                  value={formData.memo}
                  onChange={(e) => setFormData(prev => ({ ...prev, memo: e.target.value }))}
                  placeholder="選手の特徴やメモを入力"
                  rows={4}
                  className="shadow-soft"
                />
              </div>
            </CardContent>
          </Card>

          {/* 動画情報 */}
          <Card className="gradient-card border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-primary">動画情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>動画リンク</Label>
                <div className="space-y-2 mt-2">
                  {videoLinks.map((link, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        value={link}
                        onChange={(e) => updateVideoLink(index, e.target.value)}
                        placeholder="YouTube、Twitter等のURLを入力"
                        className="shadow-soft"
                      />
                      {videoLinks.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeVideoLink(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addVideoLink}
                    className="transition-smooth"
                  >
                    + 動画リンクを追加
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
