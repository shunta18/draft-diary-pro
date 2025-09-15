import { Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DiaryEntry {
  id: number;
  date: string;
  venue: string;
  category: string;
  matchCard: string;
  score: string;
  playerComments: string;
  overallImpression: string;
}

interface DiaryDetailDialogProps {
  entry: DiaryEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

const categoryColors = {
  "高校": "bg-blue-500 text-white",
  "大学": "bg-green-500 text-white",
  "社会人": "bg-orange-500 text-white",
  "独立リーグ": "bg-purple-500 text-white",
  "その他": "bg-gray-500 text-white",
};

export default function DiaryDetailDialog({ entry, isOpen, onClose }: DiaryDetailDialogProps) {
  if (!entry) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{entry.matchCard}</DialogTitle>
            <Badge className={`${categoryColors[entry.category as keyof typeof categoryColors]} font-medium`}>
              {entry.category}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{entry.date}</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{entry.venue}</span>
            </div>
          </div>

          {entry.score && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">スコア</h3>
              <p className="text-2xl font-bold text-primary">{entry.score}</p>
            </div>
          )}

          {/* Player Comments */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">注目選手・コメント</h3>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-foreground whitespace-pre-wrap">{entry.playerComments}</p>
            </div>
          </div>

          {/* Overall Impression */}
          {entry.overallImpression && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">全体的な感想</h3>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-foreground whitespace-pre-wrap">{entry.overallImpression}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}