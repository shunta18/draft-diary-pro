import { Users, Trophy, Calendar, Settings } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getPlayers } from "@/lib/playerStorage";
import { getDiaryEntries } from "@/lib/diaryStorage";
import { useState, useEffect } from "react";

const Index = () => {
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [totalWatching, setTotalWatching] = useState(0);
  const [completedDrafts, setCompletedDrafts] = useState(0);

  useEffect(() => {
    // 一度だけデフォルトデータをクリア（既存ユーザー向け）
    const hasBeenCleared = localStorage.getItem('diary_default_cleared');
    if (!hasBeenCleared) {
      // デフォルトデータが混在している可能性があるのでクリア
      const currentEntries = JSON.parse(localStorage.getItem('baseball_scout_diary') || '[]');
      const userEntries = currentEntries.filter((entry: any) => 
        entry.id !== 1 && entry.id !== 2 && entry.id !== 3 // デフォルトデータのIDを除外
      );
      localStorage.setItem('baseball_scout_diary', JSON.stringify(userEntries));
      localStorage.setItem('diary_default_cleared', 'true');
    }

    // 選手数を取得
    const players = getPlayers();
    setTotalPlayers(players.length);

    // 観戦記録数を取得（今年の分のみ）
    const storedEntries = localStorage.getItem('baseball_scout_diary');
    console.log('Stored entries in Index:', storedEntries);
    
    if (storedEntries) {
      // ローカルストレージにデータがある場合のみカウント
      const diaryEntries = getDiaryEntries();
      console.log('All diary entries in Index:', diaryEntries);
      const currentYear = new Date().getFullYear();
      const thisYearEntries = diaryEntries.filter(entry => 
        entry.date.includes(currentYear.toString())
      );
      console.log('This year entries in Index:', thisYearEntries);
      setTotalWatching(thisYearEntries.length);
    } else {
      // まだ観戦記録を作成していない場合は0
      console.log('No stored entries, setting to 0');
      setTotalWatching(0);
    }

    // ドラフト構想数を取得
    try {
      const draftData = localStorage.getItem('draftData');
      if (draftData) {
        const parsedData = JSON.parse(draftData);
        const teamCount = Object.keys(parsedData).length;
        setCompletedDrafts(teamCount);
      }
    } catch {
      setCompletedDrafts(0);
    }
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">
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

        {/* Quick Action Buttons - 上部に配置 */}
        <div className="grid grid-cols-3 gap-3">
          <Link to="/players">
            <Button className="w-full h-12 flex flex-col items-center justify-center space-y-1 text-xs">
              <Users className="h-4 w-4" />
              <span>選手リスト</span>
            </Button>
          </Link>
          <Link to="/draft">
            <Button variant="secondary" className="w-full h-12 flex flex-col items-center justify-center space-y-1 text-xs">
              <Trophy className="h-4 w-4" />
              <span>ドラフト構想</span>
            </Button>
          </Link>
          <Link to="/diary">
            <Button variant="outline" className="w-full h-12 flex flex-col items-center justify-center space-y-1 text-xs">
              <Calendar className="h-4 w-4" />
              <span>観戦日記</span>
            </Button>
          </Link>
        </div>

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

        {/* Detailed Feature Cards - より小さく */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-primary text-center">機能詳細</h2>
          
          <div className="grid grid-cols-1 gap-3">
            <Link to="/players">
              <Card className="border-border/40 bg-card/30 hover:bg-card/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-primary">選手リスト</h3>
                      <p className="text-sm text-muted-foreground">ドラフト候補選手の情報を管理・評価</p>
                      <p className="text-xs text-accent mt-1">{totalPlayers}名登録済み</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/draft">
              <Card className="border-border/40 bg-card/30 hover:bg-card/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-primary">ドラフト構想</h3>
                      <p className="text-sm text-muted-foreground">各球団のドラフト戦略を練る</p>
                      <p className="text-xs text-accent mt-1">{completedDrafts}球団構想済み</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/diary">
              <Card className="border-border/40 bg-card/30 hover:bg-card/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-secondary/30 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-primary">観戦日記</h3>
                      <p className="text-sm text-muted-foreground">試合観戦の記録と感想を残す</p>
                      <p className="text-xs text-accent mt-1">今年{totalWatching}回観戦</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
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
