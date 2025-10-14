import { useState, useEffect } from "react";
import { User, Eye, Download, Upload, UserPlus, UserMinus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { getUserProfiles, followUser, unfollowUser, getFollowedUsers, type UserProfileWithStats } from "@/lib/supabase-storage";
import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function PublicPlayersUsers() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfileWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"uploads" | "views" | "imports">("uploads");
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});
  const [showFollowedOnly, setShowFollowedOnly] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [user]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUserProfiles();
      setUsers(data);
      
      if (user) {
        const followed = await getFollowedUsers();
        setFollowedUsers(followed);
        
        const states: Record<string, boolean> = {};
        for (const profile of data) {
          states[profile.user_id] = followed.includes(profile.user_id);
        }
        setFollowingStates(states);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "ログインが必要です",
        description: "フォローするにはログインしてください",
        variant: "destructive",
      });
      return;
    }

    try {
      const isCurrentlyFollowing = followingStates[userId];
      
      if (isCurrentlyFollowing) {
        await unfollowUser(userId);
        setFollowingStates(prev => ({ ...prev, [userId]: false }));
        setFollowedUsers(prev => prev.filter(id => id !== userId));
        toast({
          title: "フォロー解除しました",
        });
      } else {
        await followUser(userId);
        setFollowingStates(prev => ({ ...prev, [userId]: true }));
        setFollowedUsers(prev => [...prev, userId]);
        toast({
          title: "フォローしました",
        });
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast({
        title: "エラーが発生しました",
        description: "もう一度お試しください",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = showFollowedOnly 
    ? users.filter(u => followedUsers.includes(u.user_id))
    : users;

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === "uploads") {
      return b.upload_count - a.upload_count;
    } else if (sortBy === "views") {
      return b.total_views - a.total_views;
    } else {
      return b.total_imports - a.total_imports;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Navigation />
      <SEO
        title="投稿者から探す"
        description="選手を公開しているユーザーを探して、その選手一覧を閲覧できます。"
        keywords={["投稿者", "ユーザー", "スカウト"]}
      />
      
      <div className="bg-card border-b shadow-soft">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-primary">投稿者から探す</h1>
          <p className="text-muted-foreground mt-1">選手を公開しているユーザー一覧</p>
        </div>
      </div>

      <Tabs defaultValue="users" className="p-4">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="players" onClick={() => navigate('/public-players')}>選手を探す</TabsTrigger>
          <TabsTrigger value="users">投稿者から探す</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant={showFollowedOnly ? "default" : "outline"}
                    onClick={() => setShowFollowedOnly(!showFollowedOnly)}
                    disabled={!user}
                  >
                    フォロー中のみ表示
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">並び替え:</Label>
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-auto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uploads">アップロード数順</SelectItem>
                      <SelectItem value="views">総閲覧数順</SelectItem>
                      <SelectItem value="imports">総インポート数順</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">読み込み中...</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedUsers.map((userProfile) => (
                <Card 
                  key={userProfile.user_id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/public-players/users/${userProfile.user_id}`)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={userProfile.avatar_url} />
                          <AvatarFallback><User className="h-8 w-8" /></AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-bold text-lg">{userProfile.display_name || "名無し"}</h3>
                            {user && user.id !== userProfile.user_id && (
                              <Button
                                variant={followingStates[userProfile.user_id] ? "secondary" : "outline"}
                                size="sm"
                                onClick={(e) => handleFollow(userProfile.user_id, e)}
                              >
                                {followingStates[userProfile.user_id] ? (
                                  <UserMinus className="w-4 h-4" />
                                ) : (
                                  <UserPlus className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                          </div>
                          {userProfile.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{userProfile.bio}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-muted-foreground">
                            <Upload className="h-3 w-3" />
                          </div>
                          <p className="text-lg font-bold">{userProfile.upload_count}</p>
                          <p className="text-xs text-muted-foreground">アップロード</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-muted-foreground">
                            <Eye className="h-3 w-3" />
                          </div>
                          <p className="text-lg font-bold">{userProfile.total_views}</p>
                          <p className="text-xs text-muted-foreground">総閲覧数</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-muted-foreground">
                            <Download className="h-3 w-3" />
                          </div>
                          <p className="text-lg font-bold">{userProfile.total_imports}</p>
                          <p className="text-xs text-muted-foreground">総インポート</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Footer />
    </div>
  );
}
