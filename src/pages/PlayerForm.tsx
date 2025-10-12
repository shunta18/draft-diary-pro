import { useState, useEffect } from "react";
import { ArrowLeft, Save, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useParams, useNavigate } from "react-router-dom";
import { addPlayer, updatePlayer, getPlayerById } from "@/lib/supabase-storage";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const positions = ["投手", "捕手", "一塁手", "二塁手", "三塁手", "遊撃手", "外野手", "指名打者"];

// ポジションをソートする関数
const sortPositions = (positionsArray: string[]) => {
  return [...positionsArray].sort((a, b) => {
    const indexA = positions.indexOf(a);
    const indexB = positions.indexOf(b);
    // 未定義の場合は最後に配置
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
};
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

export default function PlayerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const isEditing = !!id;

  // All useState hooks must be declared before any early returns
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
    videos: [] as string[],
  });

  const [videoFiles, setVideoFiles] = useState<FileList | null>(null);
  const [videoUrl, setVideoUrl] = useState("");

  // 未認証の場合は認証ページにリダイレクト
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (isEditing && id) {
      const loadPlayer = async () => {
        const player = await getPlayerById(parseInt(id));
        if (player) {
          const careerPath = player.career_path && typeof player.career_path === 'object' 
            ? player.career_path as { middle_school?: string; high_school?: string; university?: string; corporate?: string }
            : { middle_school: "", high_school: "", university: "", corporate: "" };
          
          setFormData({
            name: player.name,
            draftYear: player.year?.toString() || "2025",
            category: player.category,
            team: player.team,
            positions: sortPositions(Array.isArray(player.position) ? player.position : player.position.split(/[,、]/).map(p => p.trim()).filter(p => p)),
            mainPosition: player.main_position || "",
            battingThrowing: `${player.throwing_hand || ""}投${player.batting_hand || ""}打`,
            hometown: player.hometown || "",
            age: player.age,
            careerPath: {
              middle_school: careerPath.middle_school || "",
              high_school: careerPath.high_school || "",
              university: careerPath.university || "",
              corporate: careerPath.corporate || "",
            },
            usage: player.usage || "",
            evaluations: player.evaluations || [],
            recommended_teams: player.recommended_teams || [],
            memo: player.memo || "",
            videos: player.videos || [],
          });
        }
      };
      loadPlayer();
    }
  }, [isEditing, id]);

  // 認証状態を確認中はローディング表示
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 未認証の場合は何も表示しない（リダイレクト処理中）
  if (!user) {
    return null;
  }

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

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoFiles(e.target.files);
  };

  const addVideoUrl = () => {
    if (videoUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        videos: [...prev.videos, videoUrl.trim()]
      }));
      setVideoUrl("");
    }
  };

  const removeVideo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
  };

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
      videos: videoUrls,
    };

    try {
      // フォームバリデーション
      if (!formData.name || !formData.category || !formData.team || formData.positions.length === 0 || formData.evaluations.length === 0) {
        toast({
          title: "入力エラー",
          description: "必須項目を全て入力してください。",
          variant: "destructive",
        });
        return;
      }

      if (isEditing && id) {
        const result = await updatePlayer(parseInt(id), playerData);
        if (result) {
          toast({
            title: "選手情報を更新しました",
            description: `${formData.name}の情報が正常に更新されました。`,
          });
          navigate("/players");
        } else {
          throw new Error("Failed to update player");
        }
      } else {
        const result = await addPlayer(playerData);
        if (result) {
          toast({
            title: "選手を追加しました",
            description: `${formData.name}が正常に登録されました。`,
          });
          navigate("/players");
        } else {
          throw new Error("Failed to add player");
        }
      }
    } catch (error) {
      console.error("Failed to save player:", error);
      const errorMessage = error instanceof Error ? error.message : "不明なエラーが発生しました";
      
      if (errorMessage.includes("not authenticated")) {
        toast({
          title: "認証エラー",
          description: "ログインが必要です。ログインページに移動します。",
          variant: "destructive",
        });
        navigate("/auth");
      } else {
        toast({
          title: "エラーが発生しました",
          description: `選手の保存に失敗しました: ${errorMessage}`,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Navigation />
      {/* Header */}
      <div className="bg-card border-b shadow-soft">
        <div className="flex flex-col gap-4 p-4">
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
          
          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/players" className="flex-1 sm:flex-none">
              <Button variant="outline" className="h-10 w-full">
                キャンセル
              </Button>
            </Link>
            <Button 
              type="submit" 
              form="player-form"
              variant="secondary"
              className="gradient-accent text-white border-0 shadow-soft hover:shadow-glow transition-smooth h-10 flex-1 sm:flex-none"
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
                      <SelectItem value="2028">2028年</SelectItem>
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
                  <Label htmlFor="team">現在の所属チーム *</Label>
                  <Input
                    id="team"
                    value={formData.team}
                    onChange={(e) => setFormData(prev => ({ ...prev, team: e.target.value }))}
                    placeholder="現在の所属チーム名を入力"
                    required
                    className="shadow-soft"
                  />
                </div>
              </div>

              {/* 経歴 */}
              {formData.category && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">経歴</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="middle_school" className="text-sm text-muted-foreground">中学チーム</Label>
                      <Input
                        id="middle_school"
                        value={formData.careerPath.middle_school}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          careerPath: { ...prev.careerPath, middle_school: e.target.value }
                        }))}
                        placeholder="中学時代のチーム名"
                        className="shadow-soft"
                      />
                    </div>

                    {["大学", "社会人", "独立リーグ"].includes(formData.category) && (
                      <div>
                        <Label htmlFor="high_school" className="text-sm text-muted-foreground">高校</Label>
                        <Input
                          id="high_school"
                          value={formData.careerPath.high_school}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            careerPath: { ...prev.careerPath, high_school: e.target.value }
                          }))}
                          placeholder="高校名"
                          className="shadow-soft"
                        />
                      </div>
                    )}

                    {["社会人", "独立リーグ"].includes(formData.category) && (
                      <div>
                        <Label htmlFor="university" className="text-sm text-muted-foreground">大学</Label>
                        <Input
                          id="university"
                          value={formData.careerPath.university}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            careerPath: { ...prev.careerPath, university: e.target.value }
                          }))}
                          placeholder="大学名"
                          className="shadow-soft"
                        />
                      </div>
                    )}

                    {formData.category === "独立リーグ" && (
                      <div>
                        <Label htmlFor="corporate" className="text-sm text-muted-foreground">社会人</Label>
                        <Input
                          id="corporate"
                          value={formData.careerPath.corporate}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            careerPath: { ...prev.careerPath, corporate: e.target.value }
                          }))}
                          placeholder="社会人チーム名"
                          className="shadow-soft"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <Label>ポジション（複数選択可）*</Label>
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

              <div>
                <Label>メインポジション *</Label>
                <Select 
                  value={formData.mainPosition} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, mainPosition: value }))}
                  disabled={formData.positions.length === 0}
                >
                  <SelectTrigger className="shadow-soft">
                    <SelectValue placeholder={formData.positions.length > 0 ? "メインポジションを選択" : "先にポジションを選択してください"} />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.positions.map(position => (
                      <SelectItem key={position} value={position}>{position}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="age">年齢</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value ? parseInt(e.target.value) : undefined }))}
                    placeholder="例：18"
                    className="shadow-soft"
                  />
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
                    <Badge
                      key={evaluation}
                      variant={formData.evaluations.includes(evaluation) ? "default" : "outline"}
                      className={`cursor-pointer transition-smooth ${
                        formData.evaluations.includes(evaluation) 
                          ? "bg-primary text-primary-foreground hover:bg-primary/80" 
                          : "hover:bg-secondary"
                      }`}
                      onClick={() => toggleEvaluation(evaluation)}
                    >
                      {evaluation}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* おすすめ球団 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">おすすめ球団</Label>
                <div className="flex flex-wrap gap-2">
                  {teams.map((team) => (
                    <Badge
                      key={team}
                      variant={formData.recommended_teams.includes(team) ? "default" : "outline"}
                      className="cursor-pointer transition-colors"
                      onClick={() => toggleTeam(team)}
                    >
                      {team === "オリックス・バファローズ" ? "オリックス" : 
                       team.replace(/ジャイアンツ|タイガース|ドラゴンズ|カープ|スワローズ|ベイスターズ|ホークス|ファイターズ|マリーンズ|ライオンズ|ゴールデンイーグルス/, '').replace(/読売|阪神|中日|広島東洋|東京ヤクルト|横浜DeNA|福岡ソフトバンク|北海道日本ハム|千葉ロッテ|埼玉西武|東北楽天/, (match) => {
                        const teamMap: { [key: string]: string } = {
                          '読売': '巨人',
                          '阪神': '阪神',
                          '中日': '中日',
                          '広島東洋': '広島',
                          '東京ヤクルト': 'ヤクルト',
                          '横浜DeNA': 'DeNA',
                          '福岡ソフトバンク': 'ソフトバンク',
                          '北海道日本ハム': '日本ハム',
                          '千葉ロッテ': 'ロッテ',
                          '埼玉西武': '西武',
                          '東北楽天': '楽天',
                          'オリックス': 'オリックス'
                        };
                        return teamMap[match] || match;
                      })}
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
                <Label>動画（任意）</Label>
                <div className="space-y-4 mt-2">
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
                  
                  {/* URL入力 */}
                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">動画URL</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="videoUrl"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://example.com/video.mp4"
                        className="shadow-soft"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addVideoUrl}
                        disabled={!videoUrl.trim()}
                      >
                        追加
                      </Button>
                    </div>
                  </div>

                  {/* ファイルアップロード */}
                  <div className="space-y-2">
                    <Label>動画ファイル</Label>
                    <Input
                      type="file"
                      accept="video/*"
                      multiple
                      onChange={handleVideoUpload}
                      className="shadow-soft"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
      
      <Footer />
    </div>
  );
}
