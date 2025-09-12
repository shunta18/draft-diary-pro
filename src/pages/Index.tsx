import { Users, Trophy, Calendar, BarChart3 } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="総登録選手"
            value="127"
            icon={<Users className="h-5 w-5" />}
            description="2025年ドラフト候補"
          />
          <StatCard
            title="今年の観戦"
            value="23"
            icon={<Calendar className="h-5 w-5" />}
            description="観戦回数"
          />
          <StatCard
            title="構想完成"
            value="8"
            icon={<Trophy className="h-5 w-5" />}
            description="球団構想"
          />
          <StatCard
            title="評価済み"
            value="89"
            icon={<BarChart3 className="h-5 w-5" />}
            description="選手評価"
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
                  127名登録済み →
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
                  8球団構想済み →
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
                  今年23回観戦 →
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <Card className="gradient-card border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="text-primary">最近の活動</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span className="text-muted-foreground">今日</span>
              <span className="text-foreground">田中太郎選手の評価を更新</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-muted-foreground">2日前</span>
              <span className="text-foreground">甲子園での観戦記録を追加</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              <span className="text-muted-foreground">1週間前</span>
              <span className="text-foreground">読売ジャイアンツのドラフト構想を更新</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
