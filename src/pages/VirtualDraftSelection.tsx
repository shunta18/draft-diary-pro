import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { Users, Sparkles } from "lucide-react";

export default function VirtualDraftSelection() {
  const navigate = useNavigate();

  const virtualDraftStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "BaaS 仮想ドラフト",
    "applicationCategory": "SportsApplication",
    "description": "プロ野球ドラフト会議を体験できる仮想ドラフトシミュレーター。手動指名とAI自動シミュレーションの2つのモードを選択可能",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "JPY"
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <SEO 
        title="仮想ドラフト選択 - プロ野球ドラフト会議シミュレーター"
        description="プロ野球ドラフト会議を本格的に体験できる仮想ドラフトシミュレーター。手動で12球団すべてを操作する従来モードと、AI自動シミュレーションモードから選択。抽選方式やウェーバー方式を完全再現し、リアルなドラフト戦略を体験できます。"
        keywords={[
          "仮想ドラフト", "プロ野球 ドラフト", "ドラフト会議", "ドラフト シミュレーション",
          "手動ドラフト", "AIドラフト", "抽選方式", "ウェーバー方式", 
          "ドラフト体験", "野球シミュレーター", "ドラフト予想"
        ]}
        structuredData={virtualDraftStructuredData}
      />
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="w-full max-w-4xl space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">仮想ドラフト</h1>
            <p className="text-lg text-muted-foreground">
              シミュレーション方法を選択してください
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* 従来の仮想ドラフト */}
            <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">手動ドラフト</CardTitle>
                <CardDescription className="text-base">
                  従来の仮想ドラフト方式。12球団すべてのチームを操作して、各チームの指名選手を手動で選択します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>1位指名は抽選方式</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>2位以降はウェーバー方式</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>自由に選手を選択可能</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>育成ドラフトにも対応</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => navigate("/virtual-draft/manual")}
                  className="w-full"
                  size="lg"
                >
                  手動ドラフトを開始
                </Button>
              </CardContent>
            </Card>

            {/* AIドラフト */}
            <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                NEW
              </div>
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl">AIドラフト</CardTitle>
                <CardDescription className="text-base">
                  多層スコアリングシステムによる自動シミュレーション。好きな球団だけ操作して、残りはAIが自動で指名します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>投票データを反映</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>チームニーズを分析</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>選手評価を数値化</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>スコアの重みを調整可能</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => navigate("/virtual-draft/ai")}
                  className="w-full"
                  size="lg"
                  variant="default"
                >
                  AIドラフトを開始
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
