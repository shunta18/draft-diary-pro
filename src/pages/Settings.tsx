import { ArrowLeft, User, Database, Share, HelpCircle, Info, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

const settingSections = [
  {
    title: "アカウント",
    items: [
      { icon: User, label: "ユーザー情報", description: "プロフィール、メールアドレス、パスワード" },
      { icon: LogOut, label: "ログアウト", description: "アカウントからログアウト", danger: true },
    ]
  },
  {
    title: "データ管理",
    items: [
      { icon: Database, label: "データバックアップ", description: "手動バックアップ実行・履歴確認" },
    ]
  },
  {
    title: "SNS連携",
    items: [
      { icon: Share, label: "X（Twitter）連携設定", description: "アカウント連携・投稿設定" },
      { icon: Share, label: "Instagram連携設定", description: "アカウント連携・投稿設定" },
      { icon: Share, label: "Facebook連携設定", description: "アカウント連携・投稿設定" },
    ]
  },
  {
    title: "その他",
    items: [
      { icon: HelpCircle, label: "利用規約", description: "サービス利用規約の確認" },
      { icon: HelpCircle, label: "プライバシーポリシー", description: "個人情報の取り扱いについて" },
      { icon: HelpCircle, label: "お問い合わせ", description: "サポートへのお問い合わせ" },
      { icon: Info, label: "アプリについて", description: "アプリ概要・開発者情報" },
      { icon: Info, label: "バージョン情報", description: "現在のバージョン・更新履歴" },
    ]
  }
];

export default function Settings() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <div className="bg-card border-b shadow-soft">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-primary">設定</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {settingSections.map((section, sectionIndex) => (
          <Card key={section.title} className="gradient-card border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-primary">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <div key={item.label}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start h-auto p-4 transition-smooth hover:bg-secondary/50 ${
                        item.danger ? "text-destructive hover:text-destructive" : ""
                      }`}
                    >
                      <div className="flex items-start space-x-3 w-full">
                        <Icon className={`h-5 w-5 mt-0.5 ${item.danger ? "text-destructive" : "text-muted-foreground"}`} />
                        <div className="flex-1 text-left">
                          <div className={`font-medium ${item.danger ? "text-destructive" : ""}`}>
                            {item.label}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {item.description}
                          </div>
                        </div>
                        <span className="text-muted-foreground">→</span>
                      </div>
                    </Button>
                    {itemIndex < section.items.length - 1 && (
                      <Separator className="my-1" />
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}

        {/* Version Info */}
        <Card className="gradient-card border-0 shadow-soft">
          <CardContent className="p-4 text-center">
            <div className="text-sm text-muted-foreground space-y-1">
              <p>BaaS 野球管理ツール</p>
              <p>バージョン 1.0.0</p>
              <p>© 2025 BaaS Baseball</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}