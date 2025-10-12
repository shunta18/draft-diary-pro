import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { blogPosts } from "@/lib/blogData";
import { Calendar, Tag, User } from "lucide-react";

export default function Blog() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "BaaS 野球スカウトノート ブログ",
    "description": "プロ野球ドラフトとスカウティングに関する情報を発信するブログ",
    "url": "https://baas-baseball.com/blog",
    "blogPost": blogPosts.map((post) => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.description,
      "datePublished": post.publishedAt,
      "author": {
        "@type": "Organization",
        "name": post.author,
      },
      "url": `https://baas-baseball.com/blog/${post.slug}`,
    })),
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <SEO
        title="ブログ - プロ野球ドラフトとスカウティングの情報"
        description="プロ野球ドラフト会議、スカウティング技術、選手評価方法など、野球ファンとスカウトのための情報を発信しています。"
        keywords={[
          "プロ野球",
          "ドラフト",
          "スカウティング",
          "選手評価",
          "野球ブログ",
          "ドラフト戦略",
          "高校野球",
          "大学野球",
          "社会人野球",
        ]}
        url="https://baas-baseball.com/blog"
        structuredData={structuredData}
      />
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">ブログ</h1>
          <p className="text-lg text-muted-foreground">
            プロ野球ドラフトとスカウティングに関する情報を発信しています
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {blogPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="group">
              <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{post.category}</Badge>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {post.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{post.publishedAt}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-12 bg-primary/5 rounded-lg p-6 border border-primary/20">
          <h2 className="text-xl font-semibold mb-3">BaaS 野球スカウトノートを始めよう</h2>
          <p className="text-muted-foreground mb-4">
            ブログで学んだスカウティング知識を、実際のアプリで活用してみませんか？
            選手管理、ドラフト構想、観戦日記など、充実した機能をご用意しています。
          </p>
          <Link
            to="/players"
            className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            今すぐ始める
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
