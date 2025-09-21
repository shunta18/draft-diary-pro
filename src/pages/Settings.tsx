import { ArrowLeft, User, Database, HelpCircle, Info, LogOut, Shield, Settings as SettingsIcon, Trash2, ExternalLink, FileText, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";


export default function Settings() {
  const { user, loading, signOut, deleteAccount } = useAuth();
  const { toast } = useToast();

  // Redirect to auth page if not logged in
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "ログアウト完了",
        description: "アカウントからログアウトしました。",
      });
    } catch (error: any) {
      toast({
        title: "エラー",
        description: "ログアウトに失敗しました。",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      toast({
        title: "アカウント削除完了",
        description: "アカウントが正常に削除されました。",
      });
    } catch (error: any) {
      toast({
        title: "エラー",
        description: "アカウント削除に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'google':
        return 'Google';
      case 'twitter':
        return 'X (Twitter)';
      default:
        return 'メール';
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        );
      case 'twitter':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
          </svg>
        );
      default:
        return <User className="w-4 h-4" />;
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
            <h1 className="text-xl font-bold text-primary">設定</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* User Profile Card */}
        <Card className="gradient-card border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="text-primary flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>アカウント情報</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {user?.name || user?.email?.split('@')[0] || 'ユーザー'}
                </h3>
                <p className="text-muted-foreground text-sm">{user?.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  {getProviderIcon('email')}
                  <Badge variant="secondary" className="text-xs">
                    {getProviderName('email')}で認証済み
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">登録日:</span>
                <p className="font-medium">
                  {new Date().toLocaleDateString('ja-JP')}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">最終ログイン:</span>
                <p className="font-medium">
                  {new Date().toLocaleDateString('ja-JP')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="gradient-card border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="text-primary flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>データ管理</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-4 transition-smooth hover:bg-secondary/50"
            >
              <div className="flex items-start space-x-3 w-full">
                <Database className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div className="flex-1 text-left">
                  <div className="font-medium">データエクスポート</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    選手データや観戦記録をダウンロード
                  </div>
                </div>
                <span className="text-muted-foreground">→</span>
              </div>
            </Button>
            <Separator className="my-1" />
            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-4 transition-smooth hover:bg-secondary/50"
            >
              <div className="flex items-start space-x-3 w-full">
                <Shield className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div className="flex-1 text-left">
                  <div className="font-medium">データバックアップ</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    自動バックアップの設定と履歴
                  </div>
                </div>
                <span className="text-muted-foreground">→</span>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card className="gradient-card border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="text-primary flex items-center space-x-2">
              <SettingsIcon className="h-5 w-5" />
              <span>アプリ設定</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-4 transition-smooth hover:bg-secondary/50"
            >
              <div className="flex items-start space-x-3 w-full">
                <HelpCircle className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div className="flex-1 text-left">
                  <div className="font-medium">通知設定</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    プッシュ通知やメール通知の設定
                  </div>
                </div>
                <span className="text-muted-foreground">→</span>
              </div>
            </Button>
            <Separator className="my-1" />
            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-4 transition-smooth hover:bg-secondary/50"
            >
              <div className="flex items-start space-x-3 w-full">
                <Info className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div className="flex-1 text-left">
                  <div className="font-medium">プライバシー設定</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    データの共有設定と可視性
                  </div>
                </div>
                <span className="text-muted-foreground">→</span>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Legal & Support */}
        <Card className="gradient-card border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="text-primary flex items-center space-x-2">
              <HelpCircle className="h-5 w-5" />
              <span>サポート・利用規約</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-4 transition-smooth hover:bg-secondary/50"
              asChild
            >
              <a href="/terms" target="_blank" rel="noopener noreferrer">
                <div className="flex items-start space-x-3 w-full">
                  <FileText className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">利用規約</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      サービス利用規約の確認
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              </a>
            </Button>
            <Separator className="my-1" />
            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-4 transition-smooth hover:bg-secondary/50"
              asChild
            >
              <a href="/privacy" target="_blank" rel="noopener noreferrer">
                <div className="flex items-start space-x-3 w-full">
                  <Shield className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">プライバシーポリシー</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      個人情報の取り扱いについて
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              </a>
            </Button>
            <Separator className="my-1" />
            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-4 transition-smooth hover:bg-secondary/50"
              asChild
            >
              <a href="mailto:support@example.com">
                <div className="flex items-start space-x-3 w-full">
                  <Mail className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">お問い合わせ</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      サポートチームに連絡
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="gradient-card border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="text-primary flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>アカウント操作</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="w-full justify-start h-auto p-4 transition-smooth hover:bg-secondary/50"
            >
              <div className="flex items-start space-x-3 w-full">
                <LogOut className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div className="flex-1 text-left">
                  <div className="font-medium">ログアウト</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    アカウントからログアウトします
                  </div>
                </div>
              </div>
            </Button>
            <Separator className="my-1" />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto p-4 transition-smooth hover:bg-destructive/10 text-destructive hover:text-destructive"
                >
                  <div className="flex items-start space-x-3 w-full">
                    <Trash2 className="h-5 w-5 mt-0.5 text-destructive" />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-destructive">アカウント削除</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        アカウントとすべてのデータを完全に削除
                      </div>
                    </div>
                  </div>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>アカウントを削除しますか？</AlertDialogTitle>
                  <AlertDialogDescription>
                    この操作は取り消せません。アカウントとすべての関連データ（選手データ、観戦記録、ドラフト構想）が完全に削除されます。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    削除する
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* Version Info */}
        <Card className="gradient-card border-0 shadow-soft">
          <CardContent className="p-4 text-center">
            <div className="text-sm text-muted-foreground space-y-1">
              <p>BaaS 野球管理ツール</p>
              <p>バージョン 1.0.0</p>
              <p>© 2025 BaaS Baseball</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}