import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Player {
  id: string;
  updated_at: string;
}

interface DiaryEntry {
  id: string;
  updated_at: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 静的ページ
    const staticPages = [
      { url: "/", priority: 1.0, changefreq: "daily" },
      { url: "/players", priority: 0.9, changefreq: "daily" },
      { url: "/public-players", priority: 0.9, changefreq: "daily" },
      { url: "/public-players/users", priority: 0.8, changefreq: "weekly" },
      { url: "/draft", priority: 0.9, changefreq: "weekly" },
      { url: "/virtual-draft", priority: 0.8, changefreq: "weekly" },
      { url: "/diary", priority: 0.8, changefreq: "daily" },
      { url: "/blog", priority: 0.8, changefreq: "weekly" },
      { url: "/blog/draft-history-and-evaluation", priority: 0.7, changefreq: "monthly" },
      { url: "/blog/how-to-use-baas", priority: 0.7, changefreq: "monthly" },
      { url: "/blog/high-school-college-corporate-baseball-differences", priority: 0.7, changefreq: "monthly" },
      { url: "/blog/draft-strategy-and-mechanics", priority: 0.7, changefreq: "monthly" },
      { url: "/faq", priority: 0.7, changefreq: "monthly" },
      { url: "/about", priority: 0.7, changefreq: "monthly" },
      { url: "/help", priority: 0.7, changefreq: "monthly" },
      { url: "/contact", priority: 0.6, changefreq: "monthly" },
      { url: "/settings", priority: 0.5, changefreq: "monthly" },
      { url: "/terms", priority: 0.4, changefreq: "yearly" },
      { url: "/privacy", priority: 0.4, changefreq: "yearly" },
    ];

    // 選手データを取得（公開データのみ）
    const { data: players } = await supabase
      .from("players")
      .select("id, updated_at")
      .order("updated_at", { ascending: false })
      .limit(1000);

    // 観戦日記データを取得（公開データのみ）
    const { data: diaryEntries } = await supabase
      .from("diary_entries")
      .select("id, updated_at")
      .order("updated_at", { ascending: false })
      .limit(1000);

    const baseUrl = "https://baas-baseball.com";
    const now = new Date().toISOString();

    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // 静的ページを追加
    staticPages.forEach((page) => {
      sitemap += "  <url>\n";
      sitemap += `    <loc>${baseUrl}${page.url}</loc>\n`;
      sitemap += `    <lastmod>${now}</lastmod>\n`;
      sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${page.priority}</priority>\n`;
      sitemap += "  </url>\n";
    });

    // 動的ページ（将来的な拡張用）
    // 選手詳細ページ（実装時に有効化）
    /*
    if (players) {
      players.forEach((player: Player) => {
        sitemap += "  <url>\n";
        sitemap += `    <loc>${baseUrl}/players/${player.id}</loc>\n`;
        sitemap += `    <lastmod>${player.updated_at}</lastmod>\n`;
        sitemap += "    <changefreq>weekly</changefreq>\n";
        sitemap += "    <priority>0.7</priority>\n";
        sitemap += "  </url>\n";
      });
    }
    */

    sitemap += "</urlset>";

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml",
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});