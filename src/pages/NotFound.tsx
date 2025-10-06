import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Search } from "lucide-react";
import { SEO } from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <SEO 
        title="404 - ページが見つかりません"
        description="お探しのページは見つかりませんでした。URLが間違っているか、ページが移動・削除された可能性があります。"
      />
      <Card className="gradient-card border-0 shadow-soft max-w-md w-full">
        <CardContent className="p-8 text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-primary">404</h1>
            <h2 className="text-2xl font-semibold text-foreground">ページが見つかりません</h2>
            <p className="text-muted-foreground">
              お探しのページは存在しないか、移動した可能性があります
            </p>
          </div>
          
          <div className="flex flex-col space-y-3 pt-4">
            <Link to="/">
              <Button className="w-full gradient-accent text-white border-0 shadow-soft hover:shadow-glow transition-smooth">
                <Home className="h-4 w-4 mr-2" />
                ホームに戻る
              </Button>
            </Link>
            <Link to="/players">
              <Button variant="outline" className="w-full">
                <Search className="h-4 w-4 mr-2" />
                選手リストを見る
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
