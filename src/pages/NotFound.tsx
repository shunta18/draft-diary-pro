import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Users, Trophy, HelpCircle } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <SEO 
        title="404 - ページが見つかりません"
        description="お探しのページは見つかりませんでした。URLが間違っているか、ページが移動・削除された可能性があります。"
      />
      <Navigation />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="text-6xl font-bold text-primary mb-2">404</div>
            <CardTitle className="text-3xl">ページが見つかりません</CardTitle>
            <CardDescription className="text-base">
              お探しのページは存在しないか、移動した可能性があります
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground text-center">
              URLが正しいかご確認いただくか、以下のリンクから目的のページをお探しください。
            </p>
            
            <div className="grid sm:grid-cols-2 gap-3">
              <Button asChild className="w-full">
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  ホームに戻る
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/players">
                  <Users className="mr-2 h-4 w-4" />
                  選手リスト
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/draft">
                  <Trophy className="mr-2 h-4 w-4" />
                  ドラフト構想
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/help">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  ヘルプ
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
