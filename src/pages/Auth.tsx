import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Auth() {
  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast({
        title: "ログイン成功",
        description: "正常にログインしました",
      });
    } catch (error: any) {
      toast({
        title: "ログインエラー",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(email, password, name);
      toast({
        title: "アカウント作成成功",
        description: "アカウントが作成されました",
      });
    } catch (error: any) {
      toast({
        title: "アカウント作成エラー",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-xl font-bold text-primary">ログイン・新規登録</h1>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-4 mt-8">
        <Card className="w-full max-w-md gradient-card border-0 shadow-soft">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-primary">BaaS プロ野球ドラフト管理ツール</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">ログイン</TabsTrigger>
                <TabsTrigger value="signup">新規登録</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">パスワード</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="パスワードを入力"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "ログイン中..." : "ログイン"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">名前 (任意)</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="お名前"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">メールアドレス</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">パスワード</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="パスワードを入力"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "アカウント作成中..." : "アカウント作成"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
            {/* Footer Links */}
            <div className="mt-6 pt-4 border-t border-border/50">
              <div className="flex flex-col space-y-2 text-center">
                <p className="text-xs text-muted-foreground mb-2">
                  サイトのご利用について
                </p>
                <div className="flex justify-center space-x-4 text-xs">
                  <Link 
                    to="/terms" 
                    className="text-primary hover:text-primary/80 underline transition-colors"
                  >
                    利用規約
                  </Link>
                  <Link 
                    to="/privacy" 
                    className="text-primary hover:text-primary/80 underline transition-colors"
                  >
                    プライバシーポリシー
                  </Link>
                  <a 
                    href="mailto:17j1230@gmail.com" 
                    className="text-primary hover:text-primary/80 underline transition-colors"
                  >
                    お問い合わせ
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}