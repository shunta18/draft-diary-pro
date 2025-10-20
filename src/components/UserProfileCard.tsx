import { memo } from "react";
import { Eye, Upload, UserPlus, UserMinus, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfileWithStats } from "@/lib/supabase-storage";

interface UserProfileCardProps {
  userProfile: UserProfileWithStats;
  isFollowing: boolean;
  currentUserId?: string;
  loading: boolean;
  onNavigate: () => void;
  onFollow: (userId: string, e: React.MouseEvent) => void;
}

export const UserProfileCard = memo(function UserProfileCard({
  userProfile,
  isFollowing,
  currentUserId,
  loading,
  onNavigate,
  onFollow,
}: UserProfileCardProps) {
  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onNavigate}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-16 w-16">
              <AvatarImage src={userProfile.avatar_url} />
              <AvatarFallback><User className="h-8 w-8" /></AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-bold text-lg">{userProfile.display_name || "名無し"}</h3>
              {userProfile.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2">{userProfile.bio}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Upload className="h-3 w-3" />
              </div>
              <p className="text-lg font-bold">{userProfile.upload_count}</p>
              <p className="text-xs text-muted-foreground">アップロード</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Eye className="h-3 w-3" />
              </div>
              <p className="text-lg font-bold">{userProfile.total_views}</p>
              <p className="text-xs text-muted-foreground">総閲覧数</p>
            </div>
          </div>

          {currentUserId && currentUserId !== userProfile.user_id && (
            <Button
              variant={isFollowing ? "secondary" : "outline"}
              size="sm"
              className="w-full"
              onClick={(e) => onFollow(userProfile.user_id, e)}
            >
              {isFollowing ? (
                <>
                  <UserMinus className="w-4 h-4 mr-1" />
                  フォロー中
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-1" />
                  フォロー
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
