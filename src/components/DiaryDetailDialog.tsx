import { Calendar, MapPin, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { DiaryEntry, deleteDiaryEntry as deleteLocalDiaryEntry } from "@/lib/diaryStorage";
import { deleteDiaryEntry, DiaryEntry as SupabaseDiaryEntry } from "@/lib/supabase-storage";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface DiaryDetailDialogProps {
  entry: DiaryEntry | SupabaseDiaryEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (entry: DiaryEntry | SupabaseDiaryEntry) => void;
  onDelete?: () => void;
}


const categoryColors = {
  "高校": "bg-blue-500 text-white",
  "大学": "bg-green-500 text-white",
  "社会人": "bg-orange-500 text-white",
  "独立リーグ": "bg-purple-500 text-white",
  "その他": "bg-gray-500 text-white",
};

export default function DiaryDetailDialog({ entry, isOpen, onClose, onEdit, onDelete }: DiaryDetailDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (!entry) return null;

  const handleDelete = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    if (!entry) return;
    
    try {
      let success = false;
      if (user) {
        success = await deleteDiaryEntry(entry.id);
      } else {
        success = deleteLocalDiaryEntry(entry.id);
      }
      
      if (success) {
        toast({
          title: "削除完了",
          description: "観戦記録を削除しました。",
        });
        onDelete?.();
        onClose();
      } else {
        toast({
          title: "エラー",
          description: "削除に失敗しました。",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: "削除に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const handleEdit = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (onEdit && entry) {
      onEdit(entry);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-3">
          <div className="flex flex-col gap-2 pr-8">
            <DialogTitle className="text-lg sm:text-xl font-semibold leading-tight">
              {'match_card' in entry ? entry.match_card : (entry as any).matchCard}
            </DialogTitle>
            <Badge className={`${categoryColors[entry.category as keyof typeof categoryColors]} text-xs font-medium self-start`}>
              {entry.category}
            </Badge>
          </div>
          {(onEdit || onDelete) && (
            <div className="flex justify-end gap-2">
              {onEdit && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleEdit}
                  className="h-8 px-3 text-xs"
                >
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  編集
                </Button>
              )}
              {onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="h-8 px-3 text-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      削除
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>観戦記録を削除しますか？</AlertDialogTitle>
                      <AlertDialogDescription>
                        「{'match_card' in entry ? entry.match_card : (entry as any).matchCard}」の観戦記録を削除します。この操作は取り消せません。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>キャンセル</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        削除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 gap-2.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>{entry.date}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>{entry.venue}</span>
            </div>
          </div>

          {entry.score && (
            <div>
              <h3 className="text-sm font-semibold mb-2">スコア</h3>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xl font-bold text-primary">{entry.score}</p>
              </div>
            </div>
          )}

          {/* Player Comments */}
          <div>
            <h3 className="text-sm font-semibold mb-2">注目選手・コメント</h3>
            <div className="p-3 bg-muted/50 rounded-lg min-h-[80px]">
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {'player_comments' in entry ? entry.player_comments : (entry as any).playerComments}
              </p>
            </div>
          </div>

          {/* Overall Impression */}
          {('overall_impression' in entry ? entry.overall_impression : (entry as any).overallImpression) && (
            <div>
              <h3 className="text-sm font-semibold mb-2">全体的な感想</h3>
              <div className="p-3 bg-muted/50 rounded-lg min-h-[80px]">
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {'overall_impression' in entry ? entry.overall_impression : (entry as any).overallImpression}
                </p>
              </div>
            </div>
          )}

          {/* Videos */}
          {entry.videos && entry.videos.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2">動画</h3>
              <div className="space-y-3">
                {entry.videos.map((video, index) => (
                  <div key={index} className="bg-muted/50 rounded-lg p-2">
                    <video 
                      controls 
                      className="w-full max-h-64 rounded"
                      src={video}
                    >
                      お使いのブラウザは動画の再生に対応していません。
                    </video>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}