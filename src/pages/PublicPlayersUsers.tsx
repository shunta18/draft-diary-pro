import { useState, useEffect } from "react";
import { User, Eye, Download, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { getUserProfiles, type UserProfileWithStats } from "@/lib/supabase-storage";
import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export default function PublicPlayersUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfileWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"uploads" | "views" | "imports">("uploads");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUserProfiles();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
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
            </CardContent>
          </Card>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">読み込み中...</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedUsers.map((user) => (
                <Card 
                  key={user.user_id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/public-players/users/${user.user_id}`)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback><User className="h-8 w-8" /></AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{user.display_name || "名無し"}</h3>
                          {user.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{user.bio}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-muted-foreground">
                            <Upload className="h-3 w-3" />
                          </div>
                          <p className="text-lg font-bold">{user.upload_count}</p>
                          <p className="text-xs text-muted-foreground">アップロード</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-muted-foreground">
                            <Eye className="h-3 w-3" />
                          </div>
                          <p className="text-lg font-bold">{user.total_views}</p>
                          <p className="text-xs text-muted-foreground">総閲覧数</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-muted-foreground">
                            <Download className="h-3 w-3" />
                          </div>
                          <p className="text-lg font-bold">{user.total_imports}</p>
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
