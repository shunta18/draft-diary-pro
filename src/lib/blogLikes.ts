import { supabase } from "@/integrations/supabase/client";

export async function getBlogLikes(slug: string): Promise<number> {
  const { data, error } = await supabase
    .from("blog_likes")
    .select("likes_count")
    .eq("blog_slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Error fetching blog likes:", error);
    return 0;
  }

  return data?.likes_count ?? 0;
}

export async function incrementBlogLikes(slug: string): Promise<number> {
  // First, get current likes
  const { data: existing } = await supabase
    .from("blog_likes")
    .select("likes_count")
    .eq("blog_slug", slug)
    .maybeSingle();

  const newCount = (existing?.likes_count ?? 0) + 1;

  // Upsert the new count
  const { error } = await supabase
    .from("blog_likes")
    .upsert(
      {
        blog_slug: slug,
        likes_count: newCount,
      },
      {
        onConflict: "blog_slug",
      }
    );

  if (error) {
    console.error("Error incrementing blog likes:", error);
    return existing?.likes_count ?? 0;
  }

  return newCount;
}

export async function getAllBlogLikes(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("blog_likes")
    .select("blog_slug, likes_count");

  if (error) {
    console.error("Error fetching all blog likes:", error);
    return {};
  }

  const likesMap: Record<string, number> = {};
  data?.forEach((item) => {
    likesMap[item.blog_slug] = item.likes_count;
  });

  return likesMap;
}
