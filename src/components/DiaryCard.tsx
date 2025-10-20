import { memo } from "react";
import { Eye, Download, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicDiaryEntry } from "@/lib/supabase-storage";

interface DiaryCardProps {
  diary: PublicDiaryEntry;
  onDiaryClick: (diary: PublicDiaryEntry) => void;
}

export const DiaryCard = memo(function DiaryCard({
  diary,
  onDiaryClick,
}: DiaryCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-4" onClick={() => onDiaryClick(diary)}>
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-lg">{diary.match_card}</h3>
              <p className="text-sm text-muted-foreground">{diary.date}</p>
            </div>
            <Badge variant="outline">{diary.category}</Badge>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{diary.venue}</p>
            <p className="text-sm font-medium">{diary.score}</p>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{diary.view_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              <span>{diary.import_count}</span>
            </div>
            <div className="flex items-center gap-1 ml-auto">
              <User className="h-3 w-3" />
              <span>{diary.profile?.display_name || "名無し"}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
