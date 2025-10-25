import { memo } from "react";
import { Upload, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfileWithStats } from "@/lib/supabase-storage";

interface UserProfileCardProps {
  userProfile: UserProfileWithStats;
  currentUserId?: string;
  onNavigate: () => void;
}

export const UserProfileCard = memo(function UserProfileCard({
  userProfile,
  currentUserId,
  onNavigate,
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

          <div className="grid grid-cols-1 gap-2 pt-2 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Upload className="h-3 w-3" />
              </div>
              <p className="text-lg font-bold">{userProfile.upload_count}</p>
              <p className="text-xs text-muted-foreground">アップロード</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
