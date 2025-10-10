import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Footer } from "@/components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <SEO 
        title="プライバシーポリシー"
        description="BaaS野球スカウトノートのプライバシーポリシー。個人情報の収集・利用目的、Cookie、広告配信、データ保護について詳しく説明。"
        keywords={[
          "プライバシーポリシー", "個人情報保護", "Cookie", "Google AdSense", 
          "データ保護", "セキュリティ", "利用規約"
        ]}
      />
      {/* Header */}
      <header className="bg-card border-b shadow-soft">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="icon" aria-label="ホームに戻る">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-primary">プライバシーポリシー</h1>
          </div>
        </div>
      </header>

      <div className="p-4 max-w-4xl mx-auto">
        <Card className="gradient-card border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="text-2xl text-primary text-center">
              BaaS プロ野球ドラフト管理ツール プライバシーポリシー
            </CardTitle>
            <p className="text-center text-muted-foreground">
              最終更新：2025年9月
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">1. 収集する情報</h2>
              
              <h3 className="text-base font-medium text-primary mb-2">1.1 ユーザーが提供する情報</h3>
              <ul className="text-muted-foreground leading-relaxed space-y-1 mb-4">
                <li>• GoogleまたはTwitterアカウントによる認証情報（メールアドレス、ユーザー名）</li>
                <li>• 選手データ（選手名、所属、ポジション等、ユーザーが入力した情報）</li>
                <li>• ドラフト構想データ</li>
                <li>• 観戦記録データ</li>
              </ul>

              <h3 className="text-base font-medium text-primary mb-2">1.2 自動的に収集される情報</h3>
              <ul className="text-muted-foreground leading-relaxed space-y-1">
                <li>• アクセスログ（IPアドレス、アクセス日時、ページ情報）</li>
                <li>• Cookie情報</li>
                <li>• ブラウザ情報、デバイス情報</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">2. 情報の利用目的</h2>
              <ul className="text-muted-foreground leading-relaxed space-y-1">
                <li>• サービスの提供および運営</li>
                <li>• ユーザーサポート</li>
                <li>• サービスの改善・分析</li>
                <li>• セキュリティの確保</li>
                <li>• 広告の配信</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">3. 第三者への情報提供</h2>
              
              <h3 className="text-base font-medium text-primary mb-2">3.1 以下の場合に情報を提供することがあります</h3>
              <ul className="text-muted-foreground leading-relaxed space-y-1 mb-4">
                <li>• Google LLC（Google AdSense広告配信のため）</li>
                <li>• 法令に基づく開示要求がある場合</li>
                <li>• ユーザーの同意がある場合</li>
              </ul>

              <h3 className="text-base font-medium text-primary mb-2">3.2 Google AdSenseについて</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                当サイトでは広告配信のためGoogle AdSenseを使用しています。Google AdSenseは、ユーザーの過去のアクセス情報に基づいて広告を配信するためにCookieを使用します。
              </p>
              <p className="text-muted-foreground leading-relaxed mb-2 font-medium">Cookieを無効にする方法：</p>
              <ul className="text-muted-foreground leading-relaxed space-y-1">
                <li>• ブラウザの設定でCookieを無効にできます</li>
                <li>• Googleの広告設定（https://www.google.com/settings/ads）で個人に基づく広告を無効にできます</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">4. 情報の保護</h2>
              <p className="text-muted-foreground leading-relaxed">
                収集した個人情報は、適切なセキュリティ対策を講じて保護しています。ただし、インターネット上の完全なセキュリティは保証できません。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">5. ユーザーの権利</h2>
              <p className="text-muted-foreground mb-2">ユーザーは以下の権利を有します：</p>
              <ul className="text-muted-foreground leading-relaxed space-y-1">
                <li>• 個人情報の開示請求</li>
                <li>• 個人情報の訂正・削除請求</li>
                <li>• 個人情報の利用停止請求</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">6. Cookie について</h2>
              <p className="text-muted-foreground leading-relaxed">
                当サイトでは、サービス向上のためCookieを使用しています。Cookieはブラウザの設定で無効にできますが、一部機能が制限される場合があります。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">7. 外部リンク</h2>
              <p className="text-muted-foreground leading-relaxed">
                当サイトには外部サイトへのリンクが含まれている場合があります。外部サイトでの個人情報の取り扱いについては、各サイトのプライバシーポリシーをご確認ください。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">8. 未成年者の個人情報</h2>
              <p className="text-muted-foreground leading-relaxed">
                13歳未満の方は、保護者の同意なく個人情報を提供しないでください。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">9. プライバシーポリシーの変更</h2>
              <p className="text-muted-foreground leading-relaxed">
                本ポリシーは予告なく変更される場合があります。重要な変更がある場合は、サイト上で通知します。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">10. お問い合わせ</h2>
              <p className="text-muted-foreground leading-relaxed">
                プライバシーに関するご質問は、サイト内のお問い合わせフォームよりご連絡ください。
              </p>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-center text-muted-foreground font-medium">
                本サイトを利用することで、本プライバシーポリシーに同意したものとみなします。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}