import { useState, useEffect } from "react";
import { ArrowLeft, Download, Eye, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useParams, useNavigate } from "react-router-dom";
import { 
  getPublicPlayersByUserId, 
  getUserProfileById, 
  importPlayerFromPublic,
  incrementPublicPlayerViewCount,
  type PublicPlayer,
  type Profile 
} from "@/lib/supabase-storage";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const evaluationColors = {
  "1位競合": "bg-red-500 text-white",
  "1位一本釣り": "bg-red-400 text-white",
  "外れ1位": "bg-orange-500 text-white",
  "2位": "bg-yellow-500 text-white",
  "3位": "bg-green-500 text-white",
  "4位": "bg-blue-500 text-white",
  "5位": "bg-indigo-500 text-white",
  "6位以下": "bg-gray-500 text-white",
  "育成": "bg-purple-500 text-white",
};

const evaluationOrder = [
  "1位競合", "1位一本釣り", "外れ1位", "2位", "3位", 
  "4位", "5位", "6位以下", "育成"
];

const sortEvaluations = (evaluations: string[]) => {
  return [...evaluations].sort((a, b) => {
    const indexA = evaluationOrder.indexOf(a);
    const indexB = evaluationOrder.indexOf(b);
    return indexA - indexB;
  });
};

const positionOrder = [
  "投手", "捕手", "一塁手", "二塁手", "三塁手", "遊撃手", "外野手", "指名打者"
];

const sortPositions = (positionsStr: string) => {
  const positions = positionsStr.split(/[,、]/).map(p => p.trim()).filter(p => p);
  return positions.sort((a, b) => {
    const indexA = positionOrder.indexOf(a);
    const indexB = positionOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  }).join("、");
};

export default function UserPublicPlayers() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [players, setPlayers] = useState<PublicPlayer[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<PublicPlayer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  const loadData = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const [profileData, playersData] = await Promise.all([
        getUserProfileById(userId),
        getPublicPlayersByUserId(userId)
      ]);
      setProfile(profileData);
      // イチオシの選手を上位に表示
      const sortedPlayers = [...playersData].sort((a, b) => {
        if (a.is_favorite && !b.is_favorite) return -1;
        if (!a.is_favorite && b.is_favorite) return 1;
        return 0;
      });
      setPlayers(sortedPlayers);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerClick = async (player: PublicPlayer) => {
    setSelectedPlayer(player);
    await incrementPublicPlayerViewCount(player.id);
    loadData();
  };

  const handleImport = async (player: PublicPlayer) => {
    if (!user) {
      toast({
        title: "ログインが必要です",
        description: "選手をインポートするにはログインしてください。",
        variant: "destructive",
      });
      return;
    }

    const result = await importPlayerFromPublic(player.id);
    if (result) {
      toast({
        title: "選手をインポートしました",
        description: `${player.name}を自分の選手リストに追加しました。`,
      });
      loadData();
    } else {
      toast({
        title: "エラー",
        description: "選手のインポートに失敗しました。",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Navigation />
      <SEO
        title={`${profile?.display_name || "ユーザー"}の公開選手`}
        description={`${profile?.display_name || "ユーザー"}が公開している選手一覧`}
      />
      
      <div className="bg-card border-b shadow-soft">
        <div className="p-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/public-players')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            投稿者一覧に戻る
          </Button>
          <h1 className="text-2xl font-bold text-primary">公開選手一覧</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* User Profile Card */}
        {profile && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback><User className="h-10 w-10" /></AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{profile.display_name || "名無し"}</h2>
                  {profile.bio && (
                    <p className="text-muted-foreground mt-1">{profile.bio}</p>
                  )}
                  {profile.social_links && profile.social_links.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.social_links.map((link: any, index: number) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          {link.type === 'twitter' && '𝕏'}
                          {link.type === 'instagram' && '📷'}
                          {link.type === 'youtube' && '▶️'}
                          {link.type === 'other' && '🔗'}
                          {link.label || link.type}
                        </a>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>{players.length} 選手を公開</span>
                    <span>総閲覧数: {players.reduce((sum, p) => sum + p.view_count, 0)}</span>
                    <span>総インポート数: {players.reduce((sum, p) => sum + p.import_count, 0)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Player Cards */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">読み込み中...</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {players.map((player) => (
              <Card key={player.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4" onClick={() => handlePlayerClick(player)}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div>
                          <h3 className="font-bold text-lg">{player.name}</h3>
                          <p className="text-sm text-muted-foreground">{player.team}</p>
                        </div>
                        {player.is_favorite && (
                          <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-white">
                            ⭐ イチオシ
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline">{player.category}</Badge>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {sortPositions(player.position)}
                      </p>
                      {player.evaluations && player.evaluations.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {sortEvaluations(player.evaluations).map((evaluation, index) => (
                            <Badge key={index} className={evaluationColors[evaluation as keyof typeof evaluationColors]}>
                              {evaluation}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{player.view_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        <span>{player.import_count}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Player Detail Dialog */}
      <Dialog open={!!selectedPlayer} onOpenChange={() => setSelectedPlayer(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPlayer?.name}</DialogTitle>
          </DialogHeader>
          {selectedPlayer && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <div>
                  <Label>所属</Label>
                  <p>{selectedPlayer.team}</p>
                </div>
                <div>
                  <Label>ポジション</Label>
                  <p>{sortPositions(selectedPlayer.position)}</p>
                </div>
                {selectedPlayer.evaluations && selectedPlayer.evaluations.length > 0 && (
                  <div>
                    <Label>評価</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {sortEvaluations(selectedPlayer.evaluations).map((evaluation, index) => (
                        <Badge key={index} className={evaluationColors[evaluation as keyof typeof evaluationColors]}>
                          {evaluation}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedPlayer.memo && (
                  <div>
                    <Label>メモ</Label>
                    <p className="text-sm whitespace-pre-wrap">{selectedPlayer.memo}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleImport(selectedPlayer)} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  インポート
                </Button>
                <Button variant="outline" onClick={() => setSelectedPlayer(null)}>
                  閉じる
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
