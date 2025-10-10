import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, CalendarDays, Shuffle, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <SEO
        title="BaaSについて"
        description="BaaS 野球スカウトノートは、プロ野球ドラフトのスカウティング活動を支援する総合管理ツールです。選手データ管理、ドラフト構想立案、観戦日記、仮想ドラフトなど充実の機能を提供します。"
        keywords={["BaaS", "野球スカウト", "ドラフト管理", "選手データベース", "スカウティングツール"]}
        url="https://baas-baseball.com/about"
      />
      <Navigation />
      
      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">BaaS 野球スカウトノートについて</h1>
            <p className="text-muted-foreground text-lg">
              プロ野球ドラフトのスカウティング活動を支援する総合管理ツール
            </p>
          </div>

          {/* サービス概要 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">サービス概要</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                BaaS（Baseball as a Service）野球スカウトノートは、プロ野球のスカウト活動やドラフト戦略の立案を効率化するための総合管理ツールです。
              </p>
              <p className="text-muted-foreground leading-relaxed">
                選手データの一元管理から、ドラフト構想の立案、観戦記録の保存、仮想ドラフトシミュレーションまで、スカウティング活動に必要な機能を包括的に提供します。
              </p>
              <p className="text-muted-foreground leading-relaxed">
                プロのスカウトマンはもちろん、野球ファンやアマチュアスカウト愛好家の方々にもご利用いただける直感的で使いやすいインターフェースを目指しています。
              </p>
            </CardContent>
          </Card>

          {/* 主な機能 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">主な機能</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    選手管理
                  </CardTitle>
                  <CardDescription>
                    詳細な選手データベース
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    高校・大学・社会人の注目選手を登録・管理。基本情報、身体能力、評価ランク、推薦球団、メモ、動画リンクなど詳細なデータを一元管理できます。
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    ドラフト構想
                  </CardTitle>
                  <CardDescription>
                    戦略的なドラフト計画
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    1位指名候補から育成枠まで、各指名順位での候補選手をリストアップ。チーム戦略に基づいたドラフト構想を立案できます。
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    観戦日記
                  </CardTitle>
                  <CardDescription>
                    試合観戦記録の保存
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    試合観戦の詳細記録を日記形式で保存。対戦カード、会場、日付、スコア、総評、選手別コメントなどを記録し、後から振り返ることができます。
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shuffle className="h-5 w-5 text-primary" />
                    仮想ドラフト
                  </CardTitle>
                  <CardDescription>
                    ドラフトシミュレーション
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    12球団参加の仮想ドラフトを実施。指名順位や競合状況をシミュレートし、戦略の検証や予行演習が可能です。
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ご利用方法 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">ご利用方法</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. アカウント登録</h3>
                <p className="text-sm text-muted-foreground">
                  メールアドレスまたはGoogleアカウントで簡単に登録できます。
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">2. 選手データの登録</h3>
                <p className="text-sm text-muted-foreground">
                  注目している選手の情報を登録。カテゴリー分けや評価ランク付けが可能です。
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">3. ドラフト構想の作成</h3>
                <p className="text-sm text-muted-foreground">
                  登録した選手から、各指名順位の候補を選択してドラフト構想を立案します。
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">4. 観戦記録の保存</h3>
                <p className="text-sm text-muted-foreground">
                  試合観戦後、選手のパフォーマンスや印象を記録として残せます。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* よくある質問 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">よくある質問（FAQ）</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Q. 利用料金はかかりますか？</h3>
                <p className="text-sm text-muted-foreground">
                  A. 基本機能は無料でご利用いただけます。
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Q. データはどこに保存されますか？</h3>
                <p className="text-sm text-muted-foreground">
                  A. すべてのデータは安全なクラウドサーバー（Supabase）に暗号化されて保存されます。
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Q. スマートフォンでも使えますか？</h3>
                <p className="text-sm text-muted-foreground">
                  A. はい、レスポンシブデザインでスマートフォン、タブレット、PCすべてに対応しています。
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Q. データのエクスポートは可能ですか？</h3>
                <p className="text-sm text-muted-foreground">
                  A. 現在、CSV形式でのエクスポート機能を準備中です。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 運営者情報 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">運営者情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">サービス名</h3>
                <p className="text-sm text-muted-foreground">
                  BaaS 野球スカウトノート（Baseball as a Service）
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">運営者</h3>
                <p className="text-sm text-muted-foreground">
                  BaaS Baseball
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">お問い合わせ</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  サービスに関するご質問、ご要望、不具合報告などは、お問い合わせページよりご連絡ください。
                </p>
                <Link to="/contact">
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    お問い合わせページへ
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
