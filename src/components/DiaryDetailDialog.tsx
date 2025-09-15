import { Calendar, MapPin, Edit, Share2, Copy, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { DiaryEntry } from "@/lib/diaryStorage";

interface DiaryDetailDialogProps {
  entry: DiaryEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (entry: DiaryEntry) => void;
}


const categoryColors = {
  "高校": "bg-blue-500 text-white",
  "大学": "bg-green-500 text-white",
  "社会人": "bg-orange-500 text-white",
  "独立リーグ": "bg-purple-500 text-white",
  "その他": "bg-gray-500 text-white",
};

export default function DiaryDetailDialog({ entry, isOpen, onClose, onEdit }: DiaryDetailDialogProps) {
  const { toast } = useToast();
  
  if (!entry) return null;

  const handleShare = (platform: 'twitter' | 'line' | 'copy') => {
    const text = `観戦記録: ${entry.matchCard}\n会場: ${entry.venue}\n日付: ${entry.date}\n${entry.score ? `スコア: ${entry.score}\n` : ''}${entry.playerComments}`;
    
    switch (platform) {
      case 'twitter':
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(twitterUrl, '_blank');
        break;
      case 'line':
        const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
        window.open(lineUrl, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(text).then(() => {
          toast({
            title: "コピーしました",
            description: "観戦記録をクリップボードにコピーしました。",
          });
        });
        break;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{entry.matchCard}</DialogTitle>
            <div className="flex items-center space-x-2">
              <Badge className={`${categoryColors[entry.category as keyof typeof categoryColors]} font-medium`}>
                {entry.category}
              </Badge>
              <div className="flex space-x-1">
                {onEdit && (
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => onEdit(entry)}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleShare('twitter')}
                  className="h-8 w-8"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleShare('copy')}
                  className="h-8 w-8"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
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

          {/* Video Links */}
          {entry.videoLinks && entry.videoLinks.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">動画</h3>
              <div className="space-y-2">
                {entry.videoLinks.map((link, index) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg">
                    <a 
                      href={link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>動画 {index + 1}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SNS Share Section */}
          <div className="space-y-2 pt-4 border-t">
            <h3 className="text-lg font-semibold">共有</h3>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => handleShare('twitter')}
                className="flex-1"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleShare('line')}
                className="flex-1"
              >
                <Share2 className="h-4 w-4 mr-2" />
                LINE
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleShare('copy')}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                コピー
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}