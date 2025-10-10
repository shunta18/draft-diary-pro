import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Users, FileText, CalendarDays, Shuffle, HelpCircle } from "lucide-react";

const Help = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <SEO
        title="ヘルプ・使い方"
        description="BaaS 野球スカウトノートの使い方ガイド。選手管理、ドラフト構想、観戦日記、仮想ドラフトなど各機能の詳しい使用方法とよくある質問をご紹介します。"
        keywords={["ヘルプ", "使い方", "ガイド", "マニュアル", "FAQ", "野球スカウト"]}
        url="https://baas-baseball.com/help"
      />
      <Navigation />
      
      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">ヘルプ・使い方</h1>
            <p className="text-muted-foreground text-lg">
              BaaS 野球スカウトノートの各機能の使い方をご紹介します
            </p>
          </div>

          {/* 機能別ガイド */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">機能別ガイド</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    選手管理
                  </CardTitle>
                  <CardDescription>
                    選手データベースの使い方
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">選手の登録</h4>
                    <p className="text-sm text-muted-foreground">
                      「選手一覧」ページから「新規登録」ボタンをクリック。名前、チーム、ポジション、カテゴリー（高校・大学・社会人）などの基本情報を入力します。
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">評価ランクの設定</h4>
                    <p className="text-sm text-muted-foreground">
                      1位競合、1位一本釣り、外れ1位、2位〜6位以下、育成など、評価に応じたランクを複数選択できます。
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">詳細情報の入力</h4>
                    <p className="text-sm text-muted-foreground">
                      身長・体重、投打、年齢、出身地、用途、メモ、動画URLなど詳細な情報を記録できます。
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    ドラフト構想
                  </CardTitle>
                  <CardDescription>
                    ドラフト戦略の立て方
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">構想の作成</h4>
                    <p className="text-sm text-muted-foreground">
                      「ドラフト構想」ページで、各指名順位（1位〜育成）ごとに候補選手を選択します。
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">選手の選択</h4>
                    <p className="text-sm text-muted-foreground">
                      登録済みの選手から、評価ランクやポジションを考慮して候補を選びます。複数候補の登録も可能です。
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">戦略の保存</h4>
                    <p className="text-sm text-muted-foreground">
                      作成した構想は自動的に保存され、いつでも見直し・修正が可能です。
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    観戦日記
                  </CardTitle>
                  <CardDescription>
                    試合観戦記録の付け方
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">日記の作成</h4>
                    <p className="text-sm text-muted-foreground">
                      「観戦日記」ページから「新規作成」をクリック。対戦カード、会場、日付、スコアなど試合情報を入力します。
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">総評の記入</h4>
                    <p className="text-sm text-muted-foreground">
                      試合全体の印象や注目ポイントを総評として記録できます。
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">選手別コメント</h4>
                    <p className="text-sm text-muted-foreground">
                      個別選手のパフォーマンスや評価を詳細にメモできます。動画URLの添付も可能です。
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shuffle className="h-5 w-5 text-primary" />
                    仮想ドラフト
                  </CardTitle>
                  <CardDescription>
                    シミュレーションの実施方法
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">ドラフトの開始</h4>
                    <p className="text-sm text-muted-foreground">
                      「仮想ドラフト」ページで、12球団それぞれの指名選手を入力していきます。
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">競合の設定</h4>
                    <p className="text-sm text-muted-foreground">
                      1位指名で複数球団が同じ選手を指名した場合、抽選結果を設定できます。
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">結果の確認</h4>
                    <p className="text-sm text-muted-foreground">
                      各球団の指名状況を一覧で確認し、戦略の検証に活用できます。
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* よくある質問 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <HelpCircle className="h-6 w-6" />
                よくある質問（FAQ）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>アカウントはどのように作成しますか？</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      トップページの「ログイン/新規登録」ボタンから、メールアドレスまたはGoogleアカウントで簡単に登録できます。メールアドレスで登録する場合は、確認メールが送信されますので、メール内のリンクをクリックして認証を完了してください。
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>登録できる選手数に制限はありますか？</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      現在、選手登録数に制限はありません。必要な選手を自由に登録していただけます。
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>データのバックアップは必要ですか？</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      すべてのデータは安全なクラウドサーバー（Supabase）に自動的に保存されます。定期的なバックアップも実施されているため、ユーザー側でのバックアップは不要です。
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>複数のデバイスで利用できますか？</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      はい。同じアカウントでログインすれば、スマートフォン、タブレット、PCなど複数のデバイスから同じデータにアクセスできます。
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>動画はどのように添付しますか？</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      YouTubeやその他の動画サイトのURLを「動画URL」欄に入力してください。複数のURLを改行で区切って入力することで、複数の動画を登録できます。
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger>アカウントを削除したい場合は？</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      「設定」ページから「アカウント削除」を選択できます。削除すると、すべてのデータが完全に削除され、復元できませんのでご注意ください。
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7">
                  <AccordionTrigger>不具合を見つけた場合は？</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      お問い合わせページより、不具合の詳細（発生した操作、エラーメッセージ、使用環境など）をご報告ください。できるだけ早く対応いたします。
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8">
                  <AccordionTrigger>機能の追加リクエストはできますか？</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      はい、大歓迎です！お問い合わせページより、ご要望の機能を詳しくお聞かせください。開発ロードマップの参考にさせていただきます。
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* トラブルシューティング */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">トラブルシューティング</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">ログインできない場合</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>メールアドレスとパスワードが正しいか確認してください</li>
                  <li>登録時の確認メールで認証が完了しているか確認してください</li>
                  <li>パスワードを忘れた場合は、ログイン画面の「パスワードをお忘れの方」からリセットできます</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">データが表示されない場合</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>ページを再読み込み（リロード）してみてください</li>
                  <li>ブラウザのキャッシュをクリアしてみてください</li>
                  <li>別のブラウザやデバイスでアクセスしてみてください</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">保存ができない場合</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>インターネット接続が安定しているか確認してください</li>
                  <li>必須項目（*マーク）がすべて入力されているか確認してください</li>
                  <li>入力文字数が制限を超えていないか確認してください</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Help;
