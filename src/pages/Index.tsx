import { Users, Trophy, Calendar, Settings, UserPlus } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { StatCard } from "@/components/StatCard";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { getPlayers, getDiaryEntries, getDraftData } from "@/lib/supabase-storage";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [totalWatching, setTotalWatching] = useState(0);
  const [completedDrafts, setCompletedDrafts] = useState(0);
  const [dataKey, setDataKey] = useState(0); // データの再読み込みトリガー

  // ページ表示時にデータを再読み込みする
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setDataKey(prev => prev + 1); // データ再読み込みをトリガー
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // ページがフォーカスを得た時も再読み込み
    const handleFocus = () => {
      setDataKey(prev => prev + 1);
    };
    
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      console.log('Loading data on Index page');
      console.log('User:', user);
      
      if (!user) {
        // ゲストユーザーの場合はローカルストレージからドラフトデータを読み込み
        setTotalPlayers(1); // サンプル選手1名
        setTotalWatching(0);
        
        try {
          const stored = localStorage.getItem('draftData');
          console.log('Raw localStorage data:', stored);
          const localDraftData = stored ? JSON.parse(stored) : {};
          console.log('Parsed localStorage data:', localDraftData);
          const draftsCount = Object.keys(localDraftData).length;
          console.log('Completed drafts count:', draftsCount);
          setCompletedDrafts(draftsCount);
        } catch (error) {
          console.error('Error loading localStorage data:', error);
          setCompletedDrafts(0);
        }
        return;
      }

      // 認証済みユーザーの場合はSupabaseデータを使用
      try {
        const players = await getPlayers();
        setTotalPlayers(players.length);

        const diaryEntries = await getDiaryEntries();
        const currentYear = new Date().getFullYear();
        const thisYearEntries = diaryEntries.filter(entry => 
          entry.date.includes(currentYear.toString())
        );
        setTotalWatching(thisYearEntries.length);

        const draftData = await getDraftData();
        console.log('Supabase draft data:', draftData);
        setCompletedDrafts(Object.keys(draftData).length);
      } catch (error) {
        console.error('Failed to load data:', error);
        setTotalPlayers(0);
        setTotalWatching(0);
        setCompletedDrafts(0);
      }
    };

    loadData();
  }, [user, dataKey]); // dataKeyを依存配列に追加

  // 現在の年度を計算（10月20日以降は次年度）
  const getCurrentDraftYear = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const month = now.getMonth() + 1; // 0-based なので +1
    const day = now.getDate();
    
    // 10月20日以降は次年度のドラフト
    if (month > 10 || (month === 10 && day >= 20)) {
      return currentYear + 1;
    }
    return currentYear;
  };

  const currentDraftYear = getCurrentDraftYear();

  const homeStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "BaaS プロ野球ドラフト管理ツール",
    "description": "野球ファンのためのドラフト候補選手管理・評価・観戦記録アプリ",
    "url": "https://draft-diary-pro.vercel.app",
    "applicationCategory": "SportsApplication",
    "operatingSystem": "All",
    "author": {
      "@type": "Organization",
      "name": "BaaS Baseball"
    },
    "featureList": [
      "ドラフト候補選手管理",
      "選手評価・スカウティング",
      "観戦記録・日記",
      "ドラフト構想作成"
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">
      <SEO 
        title="ホーム"
        description="プロ野球ドラフト候補選手の管理、評価、観戦記録を効率的に行える野球ファン向けツール。スカウティングデータの蓄積からドラフト構想の作成まで完全サポート。"
        keywords={[
          "プロ野球", "ドラフト", "選手管理", "スカウティング", "野球", 
          "観戦記録", "日記", "評価", "候補選手", "BaaS"
        ]}
        structuredData={homeStructuredData}
      />
      <Navigation />
      
      <div className="p-4 space-y-6">
        {/* Hero Section - コンパクト化 */}
        <div className="text-center py-4 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-accent/10 rounded-full">
            <Trophy className="h-4 w-4 text-accent" />
            <span className="text-xs font-medium text-accent">野球ファンのための管理ツール</span>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-primary leading-tight">
            ドラフト候補選手を
            <br />
            <span className="gradient-field bg-clip-text text-transparent">徹底管理</span>
          </h1>
          
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            選手情報の管理から観戦記録まで、野球ファンのすべてを一つのアプリで
          </p>
        </div>

        {/* Guest User Notice */}
        {!user && (
          <Alert className="bg-accent/5 border-accent/20">
            <UserPlus className="h-4 w-4 text-accent" />
            <AlertDescription className="text-sm">
              <span className="font-medium text-accent">お試し利用中：</span>
              <Link to="/auth" className="text-accent hover:underline ml-1">
                アカウント登録
              </Link>
              すると、選手情報や観戦記録を永続的に保存できます。
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards - 小さくして3列配置 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card/50 border border-border/40 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-accent" />
            </div>
            <div className="text-lg font-bold text-primary">{totalPlayers}</div>
            <div className="text-xs text-muted-foreground">登録選手</div>
          </div>
          <div className="bg-card/50 border border-border/40 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <Trophy className="h-4 w-4 text-accent" />
            </div>
            <div className="text-lg font-bold text-primary">{completedDrafts}</div>
            <div className="text-xs text-muted-foreground">構想完成</div>
          </div>
          <div className="bg-card/50 border border-border/40 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <Calendar className="h-4 w-4 text-accent" />
            </div>
            <div className="text-lg font-bold text-primary">{totalWatching}</div>
            <div className="text-xs text-muted-foreground">今年の観戦</div>
          </div>
        </div>

        {/* Main Navigation Cards */}
        <div className="grid grid-cols-1 gap-3">
          <Link to="/players">
            <Card className="gradient-card border-0 shadow-soft hover:shadow-elevated transition-smooth cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-smooth">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-primary">選手リスト</h3>
                    <p className="text-sm text-muted-foreground">ドラフト候補選手の情報を管理・評価</p>
                    <p className="text-xs text-accent mt-1 font-medium">{totalPlayers}名登録済み →</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/draft">
            <Card className="gradient-card border-0 shadow-soft hover:shadow-elevated transition-smooth cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center group-hover:bg-accent/20 transition-smooth">
                    <Trophy className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-primary">ドラフト構想</h3>
                    <p className="text-sm text-muted-foreground">各球団のドラフト戦略を練る</p>
                    <p className="text-xs text-accent mt-1 font-medium">{completedDrafts}球団構想済み →</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/diary">
            <Card className="gradient-card border-0 shadow-soft hover:shadow-elevated transition-smooth cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-secondary/30 rounded-full flex items-center justify-center group-hover:bg-secondary/40 transition-smooth">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-primary">観戦日記</h3>
                    <p className="text-sm text-muted-foreground">試合観戦の記録と感想を残す</p>
                    <p className="text-xs text-accent mt-1 font-medium">今年{totalWatching}回観戦 →</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Settings Section */}
        <div className="flex justify-center">
          <Link to="/settings">
            <Button variant="outline" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>設定</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
