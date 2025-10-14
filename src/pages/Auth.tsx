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
import logoIcon from "@/assets/logo.png";
import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export default function Auth() {
  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          title: "ログインエラー",
          description: error.message || "ログインに失敗しました。",
          variant: "destructive",
        });
      } else {
        toast({
          title: "ログイン成功",
          description: "アカウントにログインしました。",
        });
      }
    } catch (error: any) {
      toast({
        title: "ログインエラー",
        description: error.message || "ログインに失敗しました。",
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
      // バリデーション
      if (!username.trim()) {
        toast({
          title: "入力エラー",
          description: "ユーザーネームを入力してください。",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (username.trim().length < 2) {
        toast({
          title: "入力エラー",
          description: "ユーザーネームは2文字以上で入力してください。",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (username.trim().length > 50) {
        toast({
          title: "入力エラー",
          description: "ユーザーネームは50文字以内で入力してください。",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { error } = await signUp(email, password, username.trim());
      if (error) {
        toast({
          title: "アカウント作成エラー",
          description: error.message || "アカウント作成に失敗しました。",
          variant: "destructive",
        });
      } else {
        toast({
          title: "アカウント作成成功",
          description: "アカウントが作成されました。",
        });
        // フォームをリセット
        setEmail("");
        setPassword("");
        setUsername("");
      }
    } catch (error: any) {
      toast({
        title: "アカウント作成エラー",
        description: error.message || "アカウント作成に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Navigation />
      <SEO
        title="ログイン・新規登録"
        description="BaaS野球スカウトノートへのログイン・新規アカウント作成ページ。メールアドレスで簡単登録、データをクラウド保存。"
        keywords={[
          "ログイン", "新規登録", "アカウント作成", "会員登録", 
          "野球アプリ", "ドラフト管理", "サインアップ"
        ]}
      />
      {/* Header */}
      <header className="bg-card border-b shadow-soft">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="icon" aria-label="ホームに戻る">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-primary">ログイン・新規登録</h1>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center p-4 mt-8">
        <Card className="w-full max-w-md gradient-card border-0 shadow-soft">
           <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <img src={logoIcon} alt="ロゴ" className="h-8 w-8" />
              <CardTitle className="text-2xl text-primary">BaaS 野球スカウトノート</CardTitle>
            </div>
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
                {/* セキュリティ・プライバシー保護のメッセージ */}
                <div className="bg-muted/30 border border-border/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm font-medium text-foreground">安全なデータ管理</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    お客様の個人情報は最新のセキュリティ技術で暗号化され、厳格なデータ保護基準に従って管理されています。メールアドレスは認証目的のみに使用し、第三者への提供や不要な配信は一切行いません。
                  </p>
                </div>
                
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">ユーザーネーム <span className="text-destructive">*</span></Label>
                    <Input
                      id="signup-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="ユーザーネームを入力"
                      required
                      minLength={2}
                      maxLength={50}
                    />
                    <p className="text-xs text-muted-foreground">2〜50文字で入力してください（ユーザーネームは公開されます）</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">メールアドレス <span className="text-destructive">*</span></Label>
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
                    <Label htmlFor="signup-password">パスワード <span className="text-destructive">*</span></Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="パスワードを入力"
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-muted-foreground">6文字以上で入力してください</p>
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
      
      <Footer />
    </div>
  );
}