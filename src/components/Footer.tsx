import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="border-t border-border/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="font-semibold text-lg mb-3">BaaS 野球スカウトノート</h3>
            <p className="text-sm text-muted-foreground">
              プロ野球ドラフトのスカウティングを支援する総合管理ツール
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-3">リンク</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  BaaSについて
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-muted-foreground hover:text-primary transition-colors">
                  ヘルプ・使い方
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-lg mb-3">法的情報</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  利用規約
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  プライバシーポリシー
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border/30 mt-8 pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 BaaS Baseball. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
