import { Users, Trophy, Calendar, Settings, UserPlus, Shuffle, BookOpen, ArrowRight, Heart, Database, Vote } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { StatCard } from "@/components/StatCard";
import { SEO } from "@/components/SEO";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { getPlayers, getDiaryEntries, getDraftData } from "@/lib/supabase-storage";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { blogPosts } from "@/lib/blogData";
import { getAllBlogLikes } from "@/lib/blogLikes";

const Index = () => {
  const { user } = useAuth();
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [totalWatching, setTotalWatching] = useState(0);
  const [completedDrafts, setCompletedDrafts] = useState(0);
  const [dataKey, setDataKey] = useState(0); // データの再読み込みトリガー
  const [blogLikes, setBlogLikes] = useState<Record<string, number>>({});

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
    getAllBlogLikes().then(setBlogLikes);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      console.log('Loading data on Index page');
      console.log('User:', user);
      
      if (!user) {
        // ゲストユーザーの場合はデフォルトサンプルデータを使用
        const { getDefaultPlayers } = await import('@/lib/playerStorage');
        const defaultPlayers = getDefaultPlayers();
        setTotalPlayers(defaultPlayers.length); // サンプル選手数（24名）
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

  // Get top 1 post by likes
  const topPosts = [...blogPosts]
    .sort((a, b) => (blogLikes[b.slug] || 0) - (blogLikes[a.slug] || 0))
    .slice(0, 1);

  const homeStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "BaaS プロ野球ドラフト管理ツール",
    "description": "野球ファンのためのドラフト候補選手管理・評価・観戦記録アプリ",
    "url": "https://baas-baseball.com",
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

          <Link to="/public-players">
            <Card className="gradient-card border-0 shadow-soft hover:shadow-elevated transition-smooth cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center group-hover:bg-blue-500/20 transition-smooth">
                    <Database className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-primary">ドラフト候補データベース</h3>
                    <p className="text-sm text-muted-foreground">みんなの選手情報を共有・閲覧</p>
                    <p className="text-xs text-blue-600 mt-1 font-medium">データベースを見る →</p>
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

          <Link to="/draft-predictions">
            <Card className="gradient-card border-0 shadow-soft hover:shadow-elevated transition-smooth cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center group-hover:bg-green-500/20 transition-smooth">
                    <Vote className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-primary">ドラフトアンケート</h3>
                    <p className="text-sm text-muted-foreground">各球団の注目選手を予測<br />仮想ドラフトのAI学習に活用されます</p>
                    <p className="text-xs text-green-600 mt-1 font-medium">みんなの予想を見る →</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/virtual-draft">
            <Card className="gradient-card border-0 shadow-soft hover:shadow-elevated transition-smooth cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center group-hover:bg-purple-500/20 transition-smooth">
                    <Shuffle className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-primary">仮想ドラフト</h3>
                    <p className="text-sm text-muted-foreground">ドラフト会議をシミュレート</p>
                    <p className="text-xs text-purple-600 mt-1 font-medium">抽選を体験 →</p>
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

        {/* Blog Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-primary">ブログ</h2>
            </div>
            <Link to="/blog">
              <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                <span className="text-sm">もっと見る</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid gap-3">
            {topPosts.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                <Card className="gradient-card border-0 shadow-soft hover:shadow-elevated transition-smooth h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="w-fit">{post.category}</Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Heart className={`w-3 h-3 ${(blogLikes[post.slug] || 0) > 0 ? 'fill-current text-red-500' : ''}`} />
                        <span>{blogLikes[post.slug] || 0}</span>
                      </div>
                    </div>
                    <CardTitle className="text-base group-hover:text-accent transition-colors line-clamp-2">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {post.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground">{post.publishedAt}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* About Section - SEO & AdSense対策（常時表示） */}
        <section className="bg-card/30 border border-border/30 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-bold text-primary">BaaS 野球スカウトノートについて</h2>
          
          <div className="space-y-3 text-sm text-foreground/90 leading-relaxed">
            <p>
              BaaS 野球スカウトノートは、プロ野球ドラフト会議に向けて候補選手を徹底的に管理・評価できる野球ファン専用のウェブアプリケーションです。
              高校野球、大学野球、社会人野球、独立リーグなど、あらゆるカテゴリーのドラフト候補選手情報を一元管理し、
              自分だけのスカウティングデータベースを構築できます。
            </p>
            
            <h3 className="text-base font-semibold text-primary pt-2">主な機能</h3>
            
            <div className="space-y-2 pl-4">
              <div>
                <h4 className="font-medium text-primary">1. 選手情報の詳細管理</h4>
                <p className="text-muted-foreground">
                  ドラフト候補選手の基本情報（氏名、所属、ポジション、投打、身長体重、出身地など）を一元管理できます。
                  選手ごとに特徴やスカウティングメモを記録し、自分だけの選手データベースを構築。
                  気になる選手をいつでも確認でき、ドラフト会議までの情報整理に役立ちます。
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-primary">2. ドラフト構想の作成</h4>
                <p className="text-muted-foreground">
                  プロ野球12球団それぞれの視点に立ったドラフト構想を作成できます。
                  1位指名から育成枠まで、各球団のチーム事情や補強ポイントを考慮した指名候補をリストアップ。
                  本命、対抗、候補という優先順位付けで、ドラフト会議当日のシミュレーションが可能です。
                  戦略メモ機能により、なぜその選手を指名候補としたのか、理由や背景も記録できます。
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-primary">3. ドラフトアンケート（予想投票）</h4>
                <p className="text-muted-foreground">
                  各球団がどの選手を指名するか、どのポジションの選手を獲得するかを予想して投票できる機能です。
                  全国の野球ファンによる集合知を可視化し、注目選手や各球団の補強ポイントが一目で分かります。
                  投票データは仮想ドラフトのAI学習にも活用され、よりリアルなドラフトシミュレーションを実現。
                  自分の予想と他のファンの予想を比較することで、新たな視点や気づきが得られます。
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-primary">4. 観戦日記・スカウティングレポート</h4>
                <p className="text-muted-foreground">
                  実際に野球の試合を観戦した際の記録を日記形式で保存できます。
                  試合日時、対戦カード、球場、天候、観戦した選手、試合結果、スコア、そして詳細な観戦メモまで、
                  現地でしか得られない生の情報を蓄積。後から振り返ることで、選手の成長過程や
                  コンディション変化を追跡できます。写真の添付にも対応し、ビジュアルな記録も可能です。
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-primary">5. ドラフト候補データベース</h4>
                <p className="text-muted-foreground">
                  他のユーザーが公開した選手情報を閲覧・参考にできる共有データベース機能です。
                  全国の野球ファンが注目する選手情報を確認でき、自分では観戦できなかった選手の情報も入手可能。
                  ユーザーごとの評価やコメントを参考にすることで、より多角的な視点でドラフト候補を分析できます。
                  自分の選手情報を公開することで、他のファンとの情報交換も楽しめます。
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-primary">6. 仮想ドラフト会議</h4>
                <p className="text-muted-foreground">
                  実際のプロ野球ドラフト会議をシミュレーションできる機能です。
                  抽選による指名順決定から、各球団の指名まで、本番さながらの緊張感を体験。
                  あなたが作成したドラフト構想をもとに、どの球団がどの選手を指名するか、
                  競合や外れ1位の流れをシミュレートできます。スクリーンショット機能で結果を保存・共有も可能です。
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-primary">7. データの永続的な保存</h4>
                <p className="text-muted-foreground">
                  アカウント登録により、入力したすべてのデータがクラウド上に安全に保存されます。
                  複数のデバイスからアクセス可能で、パソコン、スマートフォン、タブレットなど、
                  どこからでも自分のスカウティングデータベースを確認・編集できます。
                  お試し利用では端末のローカルストレージに保存されるため、ブラウザのデータ削除で消失する可能性がありますが、
                  アカウント登録後は安心して長期的にデータを蓄積できます。
                </p>
              </div>
            </div>
            
            <h3 className="text-base font-semibold text-primary pt-2">こんな方におすすめ</h3>
            
            <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-4">
              <li>プロ野球ドラフト会議を毎年楽しみにしている野球ファンの方</li>
              <li>高校野球や大学野球の試合を頻繁に観戦される方</li>
              <li>アマチュア野球選手の情報を体系的に管理したい方</li>
              <li>自分なりのドラフト予想や分析を行いたい方</li>
              <li>将来有望な選手の成長を長期的に追いかけたい方</li>
              <li>野球チームの編成や戦略に興味がある方</li>
            </ul>
            
            <p className="pt-2">
              BaaS 野球スカウトノートを使えば、単なる野球観戦がより深く、より楽しいものになります。
              あなただけのスカウティング視点を磨き、プロ野球ドラフト会議をより一層楽しみましょう。
              まずはお試し利用で機能をご体験いただき、気に入ったらアカウント登録で本格的にご活用ください。
            </p>
          </div>
        </section>

      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
