import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Navigation />
      <SEO
        title="プライバシーポリシー"
        description="BaaS野球スカウトノートのプライバシーポリシー。個人情報の収集・利用目的、Cookie、広告配信、データ保護について詳しく説明。"
        keywords={[
          "プライバシーポリシー", "個人情報保護", "Cookie", "Google AdSense", 
          "データ保護", "セキュリティ", "利用規約"
        ]}
        url="https://baas-baseball.com/privacy"
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
              BaaS 野球スカウトノート プライバシーポリシー
            </CardTitle>
            <p className="text-center text-muted-foreground">
              最終更新：2025年10月
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <p className="text-muted-foreground leading-relaxed mb-6">
                BaaS 野球スカウトノート（以下「当サービス」といいます）は、利用者（以下「ユーザー」といいます）の個人情報およびプライバシーの保護を重要視しており、
                本プライバシーポリシーに従って、収集した情報を適切かつ安全に取り扱います。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">1. 収集する情報</h2>
              
              <h3 className="text-base font-medium text-primary mb-2">1.1 ユーザーが提供する情報</h3>
              <ul className="text-muted-foreground leading-relaxed space-y-1 mb-4">
                <li>• メールアドレス（アカウント登録時）</li>
                <li>• ユーザー名（任意）</li>
                <li>• 選手データ（選手名、所属、ポジション等、ユーザーが入力した情報）</li>
                <li>• ドラフト構想データ</li>
                <li>• 観戦記録データ</li>
              </ul>

              <h3 className="text-base font-medium text-primary mb-2">1.2 自動的に収集される情報</h3>
              <ul className="text-muted-foreground leading-relaxed space-y-1">
                <li>• アクセスログ（IPアドレス、アクセス日時、ページ情報、リファラー）</li>
                <li>• Cookie情報</li>
                <li>• ブラウザ情報、デバイス情報、OS情報</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">2. 情報の利用目的</h2>
              <p className="text-muted-foreground mb-3">収集した情報は、以下の目的で利用します：</p>
              <ul className="text-muted-foreground leading-relaxed space-y-1">
                <li>• 当サービスの提供、運営、維持、および改善</li>
                <li>• ユーザーアカウントの管理および認証</li>
                <li>• ユーザーからのお問い合わせへの対応およびサポートの提供</li>
                <li>• サービスの利用状況の分析および統計データの作成</li>
                <li>• 新機能、更新情報、キャンペーンなどのご案内</li>
                <li>• 不正利用、セキュリティ侵害の検出および防止</li>
                <li>• 法令遵守および利用規約の執行</li>
                <li>• 広告の配信および最適化</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">3. 第三者への情報提供・共有</h2>
              <p className="text-muted-foreground mb-3 leading-relaxed">
                当サービスは、法令で許可されている場合またはユーザーの同意を得た場合を除き、
                個人情報を第三者に提供または共有することはありません。
              </p>
              
              <h3 className="text-base font-medium text-primary mb-2">3.1 第三者提供が認められる場合</h3>
              <ul className="text-muted-foreground leading-relaxed space-y-1 mb-4">
                <li>• 法令に基づく場合</li>
                <li>• 人の生命、身体または財産の保護のために必要があり、本人の同意を得ることが困難である場合</li>
                <li>• 公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合</li>
                <li>• 国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合</li>
              </ul>

              <h3 className="text-base font-medium text-primary mb-2">3.2 広告配信サービス（Google AdSense）</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                当サービスでは、第三者配信の広告サービス「Google AdSense（グーグルアドセンス）」を利用しています。
              </p>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Google AdSenseは、当サイトや他サイトへのアクセス情報に基づき、適切な広告を表示します。
                その際、Cookieが使用される場合があります。Cookieにより収集される情報は、個人を特定するものではありません。
              </p>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Cookieを無効にする方法および詳細については、
                <a 
                  href="https://policies.google.com/technologies/ads?hl=ja" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline mx-1"
                >
                  Googleポリシーと規約
                </a>
                をご確認ください。
              </p>

              <h3 className="text-base font-medium text-primary mb-2 mt-4">3.3 データ保存基盤（Supabase）</h3>
              <p className="text-muted-foreground leading-relaxed">
                当サービスは、データの保存および管理のためにSupabase（データベースサービス）を利用しています。
                ユーザーデータは暗号化された状態で安全に管理されています。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">4. 情報の保護・セキュリティ</h2>
              <p className="text-muted-foreground mb-3 leading-relaxed">
                当サービスは、個人情報の漏洩、滅失、毀損、不正アクセスを防止するため、
                以下のセキュリティ対策を講じています：
              </p>
              <ul className="text-muted-foreground leading-relaxed space-y-1">
                <li>• SSL/TLS暗号化通信によるデータ送信の保護</li>
                <li>• データベースへのアクセス制限および暗号化</li>
                <li>• 定期的なセキュリティアップデートの実施</li>
                <li>• 不正アクセス監視システムの導入</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                ただし、インターネット上の完全なセキュリティを保証することはできません。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">5. ユーザーの権利</h2>
              <p className="text-muted-foreground mb-3 leading-relaxed">ユーザーは、自身の個人情報について以下の権利を有します：</p>
              <ul className="text-muted-foreground leading-relaxed space-y-1">
                <li>• <strong>開示請求</strong>：当サービスが保有する個人情報の開示を請求できます</li>
                <li>• <strong>訂正・追加・削除請求</strong>：個人情報の内容が事実でない場合、訂正、追加または削除を請求できます</li>
                <li>• <strong>利用停止・消去請求</strong>：個人情報の利用停止または消去を請求できます</li>
                <li>• <strong>アカウント削除</strong>：設定ページからアカウントおよび関連データを削除できます</li>
              </ul>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                これらの権利行使に関するお問い合わせは、下記「お問い合わせ先」までご連絡ください。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">6. Cookie（クッキー）について</h2>
              <p className="text-muted-foreground mb-2 leading-relaxed">
                当サービスでは、サービスの利便性向上および機能提供のためにCookieを使用しています。
              </p>
              <p className="text-muted-foreground mb-2 leading-relaxed">
                Cookieは、ユーザーのブラウザに保存される小さなテキストファイルで、
                ログイン状態の保持、ユーザー設定の記憶、アクセス解析などに使用されます。
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Cookieの使用を希望しない場合は、ブラウザの設定で無効にすることができますが、
                一部の機能が正常に動作しない可能性があります。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">7. 外部リンクについて</h2>
              <p className="text-muted-foreground leading-relaxed">
                当サービスには、外部のウェブサイトへのリンクが含まれる場合があります。
                リンク先の外部サイトにおける個人情報の取り扱いやプライバシーポリシーについて、
                当サービスは一切の責任を負いません。外部サイトをご利用の際は、
                それぞれのサイトのプライバシーポリシーをご確認ください。
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
                本ポリシーは、必要に応じて予告なく変更される場合があります。
                重要な変更がある場合は、サイト上で通知いたします。
                変更後のプライバシーポリシーは、本ページに掲載した時点から効力を生じるものとします。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">10. 運営者情報</h2>
              <div className="text-muted-foreground space-y-2">
                <p><strong>サービス名：</strong>BaaS 野球スカウトノート</p>
                <p><strong>運営者：</strong>なかむら</p>
                <p><strong>所在地：</strong>神奈川県</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">11. お問い合わせ先</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                プライバシーポリシーに関するご質問、個人情報の取り扱いに関するお問い合わせは、
                以下のお問い合わせページよりご連絡ください。
              </p>
              <Link to="/contact">
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  お問い合わせページへ
                </Button>
              </Link>
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