import { supabase } from "@/integrations/supabase/client";

// Generate or get session ID for guest users
function getSessionId(): string {
  let sessionId = localStorage.getItem("blog_session_id");
  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    localStorage.setItem("blog_session_id", sessionId);
  }
  return sessionId;
}

export async function getBlogLikes(slug: string): Promise<number> {
  const { count, error } = await supabase
    .from("blog_user_likes")
    .select("*", { count: "exact", head: true })
    .eq("blog_slug", slug);

  if (error) {
    console.error("Error fetching blog likes:", error);
    return 0;
  }

  return count ?? 0;
}

export async function hasUserLiked(slug: string, userId: string | null): Promise<boolean> {
  if (userId) {
    // Check for authenticated user
    const { data, error } = await supabase
      .from("blog_user_likes")
      .select("id")
      .eq("blog_slug", slug)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error checking user like:", error);
      return false;
    }

    return !!data;
  } else {
    // Check for guest user
    const sessionId = getSessionId();
    const { data, error } = await supabase
      .from("blog_user_likes")
      .select("id")
      .eq("blog_slug", slug)
      .eq("session_id", sessionId)
      .maybeSingle();

    if (error) {
      console.error("Error checking guest like:", error);
      return false;
    }

    return !!data;
  }
}

export async function incrementBlogLikes(slug: string, userId: string | null): Promise<{ success: boolean; count: number }> {
  // Check if user already liked
  const alreadyLiked = await hasUserLiked(slug, userId);
  if (alreadyLiked) {
    const count = await getBlogLikes(slug);
    return { success: false, count };
  }

  // Insert new like
  const insertData = userId
    ? { blog_slug: slug, user_id: userId, session_id: null }
    : { blog_slug: slug, user_id: null, session_id: getSessionId() };

  const { error } = await supabase
    .from("blog_user_likes")
    .insert(insertData);

  if (error) {
    console.error("Error incrementing blog likes:", error);
    const count = await getBlogLikes(slug);
    return { success: false, count };
  }

  // Update the blog_likes count
  const newCount = await getBlogLikes(slug);
  
  const { error: updateError } = await supabase
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

  if (updateError) {
    console.error("Error updating blog likes count:", updateError);
  }

  return { success: true, count: newCount };
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
