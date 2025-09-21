import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <div className="bg-card border-b shadow-soft">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Link to="/settings">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-primary">利用規約</h1>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        <Card className="gradient-card border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="text-2xl text-primary text-center">
              BaaS 野球管理ツール 利用規約
            </CardTitle>
            <p className="text-center text-muted-foreground">
              最終更新：2025年9月
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">1. サービス概要</h2>
              <p className="text-muted-foreground leading-relaxed">
                BaaS 野球管理ツール（以下「本サービス」）は、野球のドラフト候補選手管理、ドラフト構想作成、試合観戦記録などの機能を無料で提供します。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">2. 利用条件</h2>
              <ul className="text-muted-foreground leading-relaxed space-y-2">
                <li>• 本サービスは個人の趣味目的での利用を前提としています</li>
                <li>• 商用利用や営利目的での使用は禁止します</li>
                <li>• 正確な情報の入力にご協力ください</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">3. 禁止事項</h2>
              <p className="text-muted-foreground mb-2">以下の行為を禁止します：</p>
              <ul className="text-muted-foreground leading-relaxed space-y-2">
                <li>• 法令に違反する行為</li>
                <li>• 他の利用者や第三者に迷惑をかける行為</li>
                <li>• サービスの運営を妨害する行為</li>
                <li>• 不正アクセスや改ざん行為</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">4. データの取り扱い</h2>
              <ul className="text-muted-foreground leading-relaxed space-y-2">
                <li>• 利用者が入力したデータの管理責任は利用者にあります</li>
                <li>• サービス停止やデータ消失について、運営者は責任を負いません</li>
                <li>• データのバックアップは利用者の責任で行ってください</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">5. サービスの変更・停止</h2>
              <p className="text-muted-foreground leading-relaxed">
                運営者は事前通知なく、サービス内容の変更や停止を行う場合があります。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">6. 免責事項</h2>
              <p className="text-muted-foreground leading-relaxed">
                本サービスの利用により生じた損害について、運営者は一切の責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">7. 準拠法</h2>
              <p className="text-muted-foreground leading-relaxed">
                本規約は日本法に準拠します。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">8. 規約の変更</h2>
              <p className="text-muted-foreground leading-relaxed">
                本規約は予告なく変更される場合があります。変更後の継続利用により、新しい規約に同意したものとみなします。
              </p>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-center text-muted-foreground font-medium">
                本サービスを利用することで、本規約に同意したものとみなします。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}