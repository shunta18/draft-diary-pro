import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useParams, Link } from "react-router-dom";
import { blogPosts } from "@/lib/blogData";
import { Calendar, User, ArrowLeft, Tag, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBlogLikes, incrementBlogLikes } from "@/lib/blogLikes";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);
  const [likes, setLikes] = useState<number>(0);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    if (slug) {
      getBlogLikes(slug).then(setLikes);
    }
  }, [slug]);

  const handleLike = async () => {
    if (!slug || isLiking) return;
    
    setIsLiking(true);
    try {
      const newLikes = await incrementBlogLikes(slug);
      setLikes(newLikes);
      toast({
        title: "いいねしました！",
        description: "この記事を気に入っていただきありがとうございます。",
      });
    } catch (error) {
      console.error("Error liking post:", error);
      toast({
        title: "エラー",
        description: "いいねに失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
    } finally {
      setIsLiking(false);
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8">
          <p>記事が見つかりません</p>
        </main>
        <Footer />
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.description,
    "datePublished": post.publishedAt,
    "author": {
      "@type": "Organization",
      "name": post.author,
    },
    "publisher": {
      "@type": "Organization",
      "name": "BaaS 野球スカウトノート",
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <SEO
        title={post.title}
        description={post.description}
        keywords={post.tags}
        url={`https://baas-baseball.com/blog/${post.slug}`}
        structuredData={structuredData}
      />
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/blog">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            ブログ一覧に戻る
          </Button>
        </Link>

        <article className="bg-card rounded-lg shadow-sm border border-border/50 p-8">
          <header className="mb-8">
            <Badge className="mb-4">{post.category}</Badge>
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            <p className="text-lg text-muted-foreground mb-6">{post.description}</p>
            
            <div className="flex items-center justify-between border-t border-b py-4">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{post.publishedAt}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{post.author}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLike}
                disabled={isLiking}
                className="gap-2"
              >
                <Heart className={`w-4 h-4 ${likes > 0 ? 'fill-current text-red-500' : ''}`} />
                <span>{likes}</span>
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </header>

          <div className="prose prose-lg max-w-none">
            {post.content.split('\n').map((line, index) => {
              if (line.startsWith('# ')) {
                return <h1 key={index} className="text-3xl font-bold mt-8 mb-4">{line.slice(2)}</h1>;
              } else if (line.startsWith('## ')) {
                return <h2 key={index} className="text-2xl font-bold mt-6 mb-3">{line.slice(3)}</h2>;
              } else if (line.startsWith('### ')) {
                return <h3 key={index} className="text-xl font-semibold mt-4 mb-2">{line.slice(4)}</h3>;
              } else if (line.startsWith('- ')) {
                return <li key={index} className="ml-6 mb-1">{line.slice(2)}</li>;
              } else if (line.trim() === '') {
                return <br key={index} />;
              } else if (line.startsWith('**') && line.endsWith('**')) {
                return <p key={index} className="font-bold mb-2">{line.slice(2, -2)}</p>;
              } else {
                return <p key={index} className="mb-4 text-foreground">{line}</p>;
              }
            })}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
