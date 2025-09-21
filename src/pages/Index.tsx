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
    // 選手数を取得
    const players = getPlayers();
    setTotalPlayers(players.length);

    // 観戦記録数を取得（今年の分のみ）
    const diaryEntries = getDiaryEntries();
    const currentYear = new Date().getFullYear();
    const thisYearEntries = diaryEntries.filter(entry => 
      entry.date.includes(currentYear.toString())
    );
    setTotalWatching(thisYearEntries.length);

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
        {/* Hero Section */}
        <div className="text-center py-8 space-y-4">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-accent/10 rounded-full">
            <Trophy className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium text-accent">野球ファンのための管理ツール</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-primary leading-tight">
            ドラフト候補選手を
            <br />
            <span className="gradient-field bg-clip-text text-transparent">徹底管理</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            選手情報の管理から観戦記録まで、野球ファンのすべてを一つのアプリで
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="総登録選手"
            value={totalPlayers.toString()}
            icon={<Users className="h-5 w-5" />}
            description={`${currentDraftYear}年ドラフト候補`}
          />
          <StatCard
            title="構想完成"
            value={completedDrafts.toString()}
            icon={<Trophy className="h-5 w-5" />}
            description="球団構想"
          />
          <StatCard
            title="今年の観戦"
            value={totalWatching.toString()}
            icon={<Calendar className="h-5 w-5" />}
            description="観戦回数"
          />
        </div>

        {/* Main Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/players">
            <Card className="gradient-card border-0 shadow-soft hover:shadow-elevated transition-smooth cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-smooth">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-primary">選手リスト</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground text-sm">
                  ドラフト候補選手の情報を管理・評価
                </p>
                <div className="mt-4 text-xs text-accent font-medium">
                  {totalPlayers}名登録済み →
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/draft">
            <Card className="gradient-card border-0 shadow-soft hover:shadow-elevated transition-smooth cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center group-hover:bg-accent/20 transition-smooth">
                  <Trophy className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="text-primary">ドラフト構想</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground text-sm">
                  各球団のドラフト戦略を練る
                </p>
                <div className="mt-4 text-xs text-accent font-medium">
                  {completedDrafts}球団構想済み →
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/diary">
            <Card className="gradient-card border-0 shadow-soft hover:shadow-elevated transition-smooth cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-secondary/30 rounded-full flex items-center justify-center group-hover:bg-secondary/40 transition-smooth">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-primary">観戦日記</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground text-sm">
                  試合観戦の記録と感想を残す
                </p>
                <div className="mt-4 text-xs text-accent font-medium">
                  今年{totalWatching}回観戦 →
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
