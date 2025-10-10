import { Menu, Home, Users, Trophy, Calendar, Settings, Shuffle, HelpCircle, Mail, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logoIcon from "@/assets/logo.png";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: "ホーム", path: "/" },
  { icon: Users, label: "選手リスト", path: "/players" },
  { icon: Trophy, label: "ドラフト構想", path: "/draft" },
  { icon: Shuffle, label: "仮想ドラフト", path: "/virtual-draft" },
  { icon: Calendar, label: "観戦日記", path: "/diary" },
  { icon: Settings, label: "設定", path: "/settings" },
];

const secondaryNavItems: NavItem[] = [
  { icon: HelpCircle, label: "ヘルプ", path: "/help" },
  { icon: Mail, label: "お問い合わせ", path: "/contact" },
  { icon: Info, label: "BaaSについて", path: "/about" },
];

export const Navigation = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="bg-card border-b shadow-soft">
      <div className="flex items-center justify-between p-4">
        <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <img src={logoIcon} alt="ロゴ" className="h-8 w-8" />
          <h1 className="text-xl font-bold text-primary">
            BaaS 野球スカウトノート
          </h1>
        </Link>
        
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <nav className="flex flex-col space-y-2 mt-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-smooth ${
                      isActive(item.path)
                        ? "bg-primary text-primary-foreground shadow-glow"
                        : "hover:bg-secondary text-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-border/30 mt-4 pt-4">
              <nav className="flex flex-col space-y-2">
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-smooth ${
                        isActive(item.path)
                          ? "bg-primary text-primary-foreground shadow-glow"
                          : "hover:bg-secondary text-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  className={`flex items-center space-x-2 transition-smooth ${
                    isActive(item.path) ? "shadow-glow" : ""
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};