import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqData = [
  {
    question: "BaaS 野球スカウトノートとは何ですか？",
    answer: "BaaS（Baseball as a Service）野球スカウトノートは、プロ野球ドラフト候補選手の管理・評価・観戦記録を行うための総合的なアプリです。選手データの管理、ドラフト構想の作成、仮想ドラフトのシミュレーション、観戦日記の記録など、スカウティング活動を包括的にサポートします。",
  },
  {
    question: "無料で使えますか？",
    answer: "はい、基本機能は完全無料でご利用いただけます。アカウント登録なしでも一部機能をお試しいただけますが、データの永続的な保存や全機能を利用するには無料のアカウント登録をお勧めします。",
  },
  {
    question: "選手データはどのように管理できますか？",
    answer: "選手リストページから、ドラフト候補選手の詳細情報を登録・管理できます。名前、所属、ポジション、評価、指名予想、動画リンクなど、豊富な項目を記録可能です。カテゴリー別（大学・社会人・高校）やドラフト年度でフィルタリングして管理できます。",
  },
  {
    question: "ドラフト構想機能の使い方を教えてください",
    answer: "ドラフト構想ページでは、各巡目（1位～10位）の指名候補選手を登録できます。登録した選手リストから簡単に追加でき、志望球団やポジション別に整理が可能です。リアルなドラフト戦略の立案に役立ちます。",
  },
  {
    question: "仮想ドラフトとは何ですか？",
    answer: "仮想ドラフトは、実際のプロ野球ドラフト会議をシミュレーションできる機能です。12球団の指名順位に従って選手を指名し、競合ドラフトも再現できます。各球団は最大10名まで指名でき、全体で120名が上限です。ドラフト戦略の検証や友人とのドラフト予想に最適です。",
  },
  {
    question: "観戦日記機能について教えてください",
    answer: "観戦日記では、試合観戦の記録を日付・対戦カード・試合結果とともに保存できます。注目選手の活躍やスカウティングメモを詳細に記録し、後から振り返ることができます。画像の添付も可能です。",
  },
  {
    question: "データは安全に保存されますか？",
    answer: "はい、登録ユーザーのデータはSupabaseの安全なクラウドデータベースに保存されます。データは暗号化され、適切なセキュリティ対策が施されています。また、アカウントを削除すると、関連するすべてのデータも削除されます。",
  },
  {
    question: "複数のデバイスで利用できますか？",
    answer: "はい、アカウントにログインすることで、パソコン、スマートフォン、タブレットなど、複数のデバイスから同じデータにアクセスできます。どのデバイスからでもデータの追加・編集が可能です。",
  },
  {
    question: "選手の動画リンクはどのように登録しますか？",
    answer: "選手編集画面で、YouTubeなどの動画URLを入力できます。複数の動画を登録可能で、プレー映像の確認に便利です。",
  },
  {
    question: "ドラフト会議後のデータはどうなりますか？",
    answer: "ドラフト会議終了後も、過去の候補選手データや観戦日記は保存され続けます。次年度のドラフト候補を管理する際にも、過去のデータを参照できます。年度フィルター機能を使って、年度ごとに管理することをお勧めします。",
  },
  {
    question: "スマートフォンでも使いやすいですか？",
    answer: "はい、レスポンシブデザインを採用しており、スマートフォンやタブレットでも快適に操作できます。試合会場での観戦中にもスムーズにメモを取ることができます。",
  },
  {
    question: "他のユーザーとデータを共有できますか？",
    answer: "現在のところ、データは個人のアカウント内でのみ管理されます。他のユーザーとの共有機能は今後のアップデートで検討しています。",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqData.map((faq) => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer,
    },
  })),
};

export default function FAQ() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <SEO
        title="よくある質問（FAQ）"
        description="BaaS 野球スカウトノートに関するよくある質問と回答。ドラフト候補選手管理アプリの使い方、機能、料金などについて詳しく解説します。"
        keywords={[
          "FAQ",
          "よくある質問",
          "使い方",
          "ドラフト候補",
          "選手管理アプリ",
          "プロ野球",
          "スカウティング",
          "ヘルプ",
          "サポート",
        ]}
        url="https://baas-baseball.com/faq"
        structuredData={structuredData}
      />
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">よくある質問（FAQ）</h1>
          <p className="text-lg text-muted-foreground">
            BaaS 野球スカウトノートに関するよくある質問と回答をまとめました。
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-sm border border-border/50 p-6">
          <Accordion type="single" collapsible className="w-full">
            {faqData.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-8 bg-primary/5 rounded-lg p-6 border border-primary/20">
          <h2 className="text-xl font-semibold mb-3">お困りですか？</h2>
          <p className="text-muted-foreground mb-4">
            上記で解決しない場合は、お気軽にお問い合わせください。
          </p>
          <a
            href="/contact"
            className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            お問い合わせ
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}