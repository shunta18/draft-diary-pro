import { useState, useEffect } from "react";
import { ArrowLeft, Star, Edit, Plus, Share2, Twitter, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { getPlayers as getLocalPlayers } from "@/lib/playerStorage";
import { getPlayers as getSupabasePlayers } from "@/lib/supabase-storage";
import { PlayerSelectionDialog } from "@/components/PlayerSelectionDialog";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getDraftData as getSupabaseDraftData, saveDraftData as saveSupabaseDraftData } from "@/lib/supabase-storage";
import { Footer } from "@/components/Footer";

// Helper function to normalize position data
const normalizePosition = (position: string | string[]): string[] => {
  return Array.isArray(position) ? position : [position];
};

// Helper function to get position as string for display
const getPositionDisplay = (position: string | string[]): string => {
  return Array.isArray(position) ? position.join(', ') : position;
};

// 球団データ
const teams = [
  { name: "読売ジャイアンツ", colors: { primary: "16 85% 50%", secondary: "0 0% 0%" } },
  { name: "阪神タイガース", colors: { primary: "45 100% 50%", secondary: "0 0% 0%" } },
  { name: "中日ドラゴンズ", colors: { primary: "220 100% 50%", secondary: "220 100% 50%" } },
  { name: "横浜DeNAベイスターズ", colors: { primary: "220 100% 50%", secondary: "0 0% 100%" } },
  { name: "広島東洋カープ", colors: { primary: "0 85% 55%", secondary: "0 85% 55%" } },
  { name: "東京ヤクルトスワローズ", colors: { primary: "220 100% 50%", secondary: "0 0% 10%" } },
  { name: "福岡ソフトバンクホークス", colors: { primary: "45 100% 50%", secondary: "0 0% 0%" } },
  { name: "千葉ロッテマリーンズ", colors: { primary: "0 0% 0%", secondary: "0 0% 100%" } },
  { name: "埼玉西武ライオンズ", colors: { primary: "220 100% 50%", secondary: "220 100% 30%" } },
  { name: "東北楽天ゴールデンイーグルス", colors: { primary: "350 70% 35%", secondary: "0 0% 100%" } },
  { name: "北海道日本ハムファイターズ", colors: { primary: "220 100% 50%", secondary: "0 0% 100%" } },
  { name: "オリックスバファローズ", colors: { primary: "220 100% 20%", secondary: "45 100% 50%" } },
];

// Draft data structure
interface DraftSelection {
  本命?: number;
  候補1?: number;
  候補2?: number;
  候補3?: number;
  memo: string;
}

interface DraftData {
  [teamName: string]: {
    plans: { [planKey: string]: string };
    strategyMemos: { [planKey: string]: string };
    draftPositions: { [planKey: string]: { [position: string]: DraftSelection } };
    devPositions: { [planKey: string]: { [position: string]: DraftSelection } };
    positionRequirements: { [planKey: string]: { [position: string]: string } };
  };
}

// Storage functions
const getDraftData = async (): Promise<DraftData> => {
  try {
    const data = await getSupabaseDraftData();
    return data || {};
  } catch {
    return {};
  }
};

const saveDraftData = async (data: DraftData): Promise<boolean> => {
  try {
    return await saveSupabaseDraftData(data);
  } catch {
    return false;
  }
};

const getFavorites = (): string[] => {
  try {
    const stored = localStorage.getItem('favoriteTeams');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveFavorites = (favorites: string[]) => {
  localStorage.setItem('favoriteTeams', JSON.stringify(favorites));
};

export default function Draft() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [favorites, setFavorites] = useState<string[]>(getFavorites());
  const [currentPlan, setCurrentPlan] = useState<string>("プランA");
  const [draftData, setDraftData] = useState<DraftData>({});
  const [editingPlan, setEditingPlan] = useState<string>("");
  const [draftRounds, setDraftRounds] = useState<number[]>([1, 2, 3, 4, 5]);
  const [devRounds, setDevRounds] = useState<number[]>([1, 2, 3]);
  const [isLoading, setIsLoading] = useState(true);
  const [players, setPlayers] = useState<any[]>([]);

  // Load draft data from Supabase or localStorage
  useEffect(() => {
    if (loading) return; // Wait for auth state to be determined
    
    const loadDraftData = async () => {
      try {
        if (user) {
          // Logged in: load from Supabase
          const data = await getDraftData();
          setDraftData(data);
        } else {
          // Not logged in: load from localStorage
          const stored = localStorage.getItem('draftData');
          setDraftData(stored ? JSON.parse(stored) : {});
        }
      } catch (error) {
        console.error('Failed to load draft data:', error);
        // Fallback to localStorage if Supabase fails
        const stored = localStorage.getItem('draftData');
        setDraftData(stored ? JSON.parse(stored) : {});
      } finally {
        setIsLoading(false);
      }
    };

    loadDraftData();
  }, [user, loading]);

  // Get current team data
  const currentTeamData = selectedTeam ? draftData[selectedTeam] : null;
  const plans = currentTeamData?.plans || { "プランA": "プランA", "プランB": "プランB", "プランC": "プランC" };
  const strategyMemos = currentTeamData?.strategyMemos || {};
  const draftPositions = currentTeamData?.draftPositions?.[currentPlan] || {};
  const devPositions = currentTeamData?.devPositions?.[currentPlan] || {};
  const positionRequirements = currentTeamData?.positionRequirements?.[currentPlan] || {};

  // Update team data
  const updateTeamData = async (teamName: string, updates: Partial<DraftData[string]>) => {
    const newData = {
      ...draftData,
      [teamName]: {
        plans: { "プランA": "プランA", "プランB": "プランB", "プランC": "プランC" },
        strategyMemos: {},
        draftPositions: {},
        devPositions: {},
        positionRequirements: {},
        ...draftData[teamName],
        ...updates
      }
    };
    setDraftData(newData);
    
    if (user) {
      // Logged in: save to Supabase
      try {
        await saveDraftData(newData);
      } catch (error) {
        console.error('Failed to save draft data:', error);
        toast({
          title: "エラー",
          description: "ドラフト構想データの保存に失敗しました",
          variant: "destructive",
        });
      }
    } else {
      // Not logged in: save to localStorage
      localStorage.setItem('draftData', JSON.stringify(newData));
    }
  };

  // Toggle favorite
  const toggleFavorite = (teamName: string) => {
    const newFavorites = favorites.includes(teamName)
      ? favorites.filter(f => f !== teamName)
      : [...favorites, teamName];
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  };

  // Update plan name
  const updatePlanName = (planKey: string, newName: string) => {
    if (!selectedTeam) return;
    const newPlans = { ...plans, [planKey]: newName };
    updateTeamData(selectedTeam, { plans: newPlans });
  };

  // Update strategy memo
  const updateStrategyMemo = (planKey: string, memo: string) => {
    if (!selectedTeam) return;
    const newMemos = { ...strategyMemos, [planKey]: memo };
    updateTeamData(selectedTeam, { strategyMemos: newMemos });
  };

  // SNS sharing functions
  const shareToPlatform = (platform: string, planKey: string) => {
    const teamName = selectedTeam;
    const planName = plans[planKey];
    const memo = strategyMemos[planKey];
    
    let shareText = `${teamName}の${planName}構想`;
    if (memo) {
      shareText += `\n${memo}`;
    }
    
    switch (platform) {
      case 'twitter':
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        window.open(twitterUrl, '_blank');
        break;
      case 'line':
        const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(shareText)}`;
        window.open(lineUrl, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(shareText).then(() => {
          alert('テキストをクリップボードにコピーしました！');
        }).catch(() => {
          alert('コピーに失敗しました');
        });
        break;
    }
  };

  // Update position requirement
  const updatePositionRequirement = (position: string, requirement: string) => {
    if (!selectedTeam) return;
    const newRequirements = { ...positionRequirements, [position]: requirement };
    updateTeamData(selectedTeam, {
      positionRequirements: {
        ...currentTeamData?.positionRequirements,
        [currentPlan]: newRequirements
      }
    });
  };

  // Update draft selection
  const updateDraftSelection = (position: string, field: keyof DraftSelection, value: number | string) => {
    if (!selectedTeam) return;
    const newDraftPositions = {
      ...draftPositions,
      [position]: {
        本命: undefined,
        候補1: undefined,
        候補2: undefined,
        候補3: undefined,
        memo: "",
        ...draftPositions[position],
        [field]: value
      }
    };
    updateTeamData(selectedTeam, {
      draftPositions: {
        ...currentTeamData?.draftPositions,
        [currentPlan]: newDraftPositions
      }
    });
  };

  // Update dev selection
  const updateDevSelection = (position: string, field: keyof DraftSelection, value: number | string) => {
    if (!selectedTeam) return;
    const newDevPositions = {
      ...devPositions,
      [position]: {
        本命: undefined,
        候補1: undefined,
        候補2: undefined,
        候補3: undefined,
        memo: "",
        ...devPositions[position],
        [field]: value
      }
    };
    updateTeamData(selectedTeam, {
      devPositions: {
        ...currentTeamData?.devPositions,
        [currentPlan]: newDevPositions
      }
    });
  };

  // Load players data
  useEffect(() => {
    const loadPlayers = async () => {
      try {
        if (user) {
          // Logged in: load from Supabase
          const supabasePlayers = await getSupabasePlayers();
          setPlayers(supabasePlayers);
        } else {
          // Not logged in: load from localStorage (sample data)
          setPlayers(getLocalPlayers());
        }
      } catch (error) {
        console.error('Failed to load players:', error);
        // Fallback to localStorage if Supabase fails
        setPlayers(getLocalPlayers());
      }
    };

    if (!loading) {
      loadPlayers();
    }
  }, [user, loading]);

  // Filter favorite teams based on user login status
  const favoriteTeams = teams.filter(team => {
    if (!user) {
      // Non-logged in users can only see 横浜DeNAベイスターズ
      return favorites.includes(team.name) && team.name === "横浜DeNAベイスターズ";
    }
    return favorites.includes(team.name);
  });
  const otherTeams = teams.filter(team => !favorites.includes(team.name));

  if (selectedTeam) {
    const team = teams.find(t => t.name === selectedTeam);
    if (!team) return null;

    return (
      <div 
        className="min-h-screen"
        style={{
          background: `linear-gradient(135deg, hsl(${team.colors.primary} / 0.1), hsl(${team.colors.secondary} / 0.05))`
        }}
      >
        {/* Header with team colors */}
        <div 
          className="border-b shadow-soft"
          style={{
            background: `linear-gradient(135deg, hsl(${team.colors.primary}), hsl(${team.colors.secondary}))`
          }}
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedTeam("")}
                className="text-white hover:bg-white/20 shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-base md:text-xl font-bold text-white truncate">{team.name}</h1>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/20 shrink-0"
              onClick={() => toggleFavorite(team.name)}
            >
              <Star className={`h-5 w-5 ${favorites.includes(team.name) ? 'fill-yellow-300 text-yellow-300' : 'fill-transparent text-yellow-300'}`} strokeWidth={1.5} />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={async () => {
                if (!user) {
                  // Not logged in: redirect to login page
                  navigate('/auth');
                  return;
                }
                
                console.log('Save button clicked');
                console.log('User:', user);
                console.log('Selected team:', selectedTeam);
                console.log('Draft data to save:', draftData);
                
                if (user && selectedTeam) {
                  try {
                    const success = await saveDraftData(draftData);
                    console.log('Supabase save result:', success);
                    
                    if (success) {
                      toast({
                        title: "保存完了",
                        description: `${selectedTeam}のドラフト構想を保存しました`,
                      });
                    } else {
                      throw new Error('Save failed');
                    }
                  } catch (error) {
                    console.error('Save error:', error);
                    toast({
                      title: "エラー",
                      description: "保存に失敗しました",
                      variant: "destructive",
                    });
                  }
                }
              }}
              className="flex items-center space-x-2"
            >
              <span>構想を保存</span>
            </Button>
          </div>
          
          {/* Login Notice for Guest Users */}
          {!user && (
            <Card className="bg-yellow-50 border-yellow-200 shadow-soft">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-yellow-800">ゲストモードでご利用中</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      構想の作成・編集は可能ですが、データは一時的に保存されます。<br />
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-yellow-800 underline"
                        onClick={() => navigate('/auth')}
                      >
                        ログイン
                      </Button>
                      すると、すべてのデータが永続的に保存されます。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Pattern Management */}
          <Card className="gradient-card border-0 shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-primary">構想パターン</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.keys(plans).map((planKey) => (
                  <div key={planKey} className="flex items-center space-x-2">
                    {editingPlan === planKey ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={plans[planKey]}
                          onChange={(e) => updatePlanName(planKey, e.target.value)}
                          className="px-2 py-1 text-sm border rounded"
                          onBlur={() => setEditingPlan("")}
                          onKeyDown={(e) => e.key === 'Enter' && setEditingPlan("")}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <>
                        <Button 
                          variant={currentPlan === planKey ? "default" : "outline"} 
                          size="sm"
                          onClick={() => setCurrentPlan(planKey)}
                          onDoubleClick={() => setEditingPlan(planKey)}
                        >
                          {plans[planKey]}
                        </Button>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => shareToPlatform('twitter', planKey)}
                            title="Twitterでシェア"
                          >
                            <Twitter className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => shareToPlatform('line', planKey)}
                            title="LINEでシェア"
                          >
                            <MessageSquare className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => shareToPlatform('copy', planKey)}
                            title="URLをコピー"
                          >
                            <Share2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                 ))}
               </div>
               
               {/* Strategy Memo */}
               <div className="mt-4">
                 <label className="text-sm font-medium text-muted-foreground">
                   {plans[currentPlan]}の戦略メモ
                 </label>
                 <textarea
                   className="w-full mt-2 p-3 text-sm border rounded-lg bg-background/50 min-h-[100px]"
                   placeholder="このプランの戦略や狙いを記録してください..."
                   value={strategyMemos[currentPlan] || ""}
                   onChange={(e) => updateStrategyMemo(currentPlan, e.target.value)}
                 />
               </div>
             </CardContent>
           </Card>

          {/* Draft Positions */}
          <Card className="gradient-card border-0 shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-primary">ドラフト枠</CardTitle>
                {draftRounds.length > 5 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setDraftRounds(draftRounds.slice(0, -1))}
                  >
                    削除
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {draftRounds.map((round) => (
                 <div key={round} className="border rounded-lg p-4 bg-card/50">
                   <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center space-x-4">
                       <h4 className="font-semibold">{round}位</h4>
                       <div className="flex items-center space-x-2">
                         <label className="text-xs text-muted-foreground">希望ポジション:</label>
                         <input
                           type="text"
                           className="px-2 py-1 text-xs border rounded w-24"
                           placeholder="投手, 内野手等"
                           value={positionRequirements[`${round}位`] || ""}
                           onChange={(e) => updatePositionRequirement(`${round}位`, e.target.value)}
                         />
                       </div>
                     </div>
                     {round > 5 && (
                       <Button 
                         variant="outline" 
                         size="sm"
                         onClick={() => setDraftRounds(draftRounds.filter(r => r !== round))}
                       >
                         削除
                       </Button>
                     )}
                   </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                    {['本命', '候補1', '候補2', '候補3'].map((type) => {
                      const currentSelection = draftPositions[`${round}位`]?.[type as keyof DraftSelection];
                      const selectedPlayer = typeof currentSelection === 'number' ? players.find(p => p.id === currentSelection) : null;
                      
                       return (
                         <div key={type} className="space-y-1">
                           <label className="text-xs text-muted-foreground">{type}</label>
                           <PlayerSelectionDialog
                             players={players}
                             selectedPlayerId={typeof currentSelection === 'number' ? currentSelection : undefined}
                             onSelect={(playerId) => updateDraftSelection(`${round}位`, type as keyof DraftSelection, playerId)}
                           >
                             <Button variant="outline" className="w-full h-8 text-xs justify-start">
                               {selectedPlayer ? selectedPlayer.name : "選手を選択"}
                             </Button>
                           </PlayerSelectionDialog>
                            {selectedPlayer && (
                              <div className="text-xs text-muted-foreground">
                                {getPositionDisplay(selectedPlayer.position)} - {selectedPlayer.team}
                              </div>
                            )}
                         </div>
                       );
                    })}
                  </div>
                  
                  <div>
                    <label className="text-sm text-muted-foreground">メモ:</label>
                    <input 
                      className="w-full mt-1 p-2 text-sm border rounded bg-background/50"
                      placeholder="戦略や狙いを記録"
                      value={draftPositions[`${round}位`]?.memo || ""}
                      onChange={(e) => updateDraftSelection(`${round}位`, 'memo', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setDraftRounds([...draftRounds, Math.max(...draftRounds) + 1])}
              >
                <Plus className="h-4 w-4 mr-2" />
                ドラフト枠を追加
              </Button>
            </CardContent>
          </Card>

          {/* Development Draft */}
          <Card className="gradient-card border-0 shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-primary">育成枠</CardTitle>
                {devRounds.length > 3 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setDevRounds(devRounds.slice(0, -1))}
                  >
                    削除
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {devRounds.map((round) => (
                 <div key={round} className="border rounded-lg p-4 bg-card/50">
                   <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center space-x-4">
                       <h4 className="font-semibold">育成{round}位</h4>
                       <div className="flex items-center space-x-2">
                         <label className="text-xs text-muted-foreground">希望ポジション:</label>
                         <input
                           type="text"
                           className="px-2 py-1 text-xs border rounded w-24"
                           placeholder="投手, 内野手等"
                           value={positionRequirements[`育成${round}位`] || ""}
                           onChange={(e) => updatePositionRequirement(`育成${round}位`, e.target.value)}
                         />
                       </div>
                     </div>
                     {round > 3 && (
                       <Button 
                         variant="outline" 
                         size="sm"
                         onClick={() => setDevRounds(devRounds.filter(r => r !== round))}
                       >
                         削除
                       </Button>
                     )}
                   </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                    {['本命', '候補1', '候補2', '候補3'].map((type) => {
                      const currentSelection = devPositions[`育成${round}位`]?.[type as keyof DraftSelection];
                      const selectedPlayer = typeof currentSelection === 'number' ? players.find(p => p.id === currentSelection) : null;
                      
                       return (
                         <div key={type} className="space-y-1">
                           <label className="text-xs text-muted-foreground">{type}</label>
                           <PlayerSelectionDialog
                             players={players}
                             selectedPlayerId={typeof currentSelection === 'number' ? currentSelection : undefined}
                             onSelect={(playerId) => updateDevSelection(`育成${round}位`, type as keyof DraftSelection, playerId)}
                           >
                             <Button variant="outline" className="w-full h-8 text-xs justify-start">
                               {selectedPlayer ? selectedPlayer.name : "選手を選択"}
                             </Button>
                           </PlayerSelectionDialog>
                            {selectedPlayer && (
                              <div className="text-xs text-muted-foreground">
                                {getPositionDisplay(selectedPlayer.position)} - {selectedPlayer.team}
                              </div>
                            )}
                         </div>
                       );
                    })}
                  </div>
                  
                  <div>
                    <label className="text-sm text-muted-foreground">メモ:</label>
                    <input 
                      className="w-full mt-1 p-2 text-sm border rounded bg-background/50"
                      placeholder="戦略や狙いを記録"
                      value={devPositions[`育成${round}位`]?.memo || ""}
                      onChange={(e) => updateDevSelection(`育成${round}位`, 'memo', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setDevRounds([...devRounds, Math.max(...devRounds) + 1])}
              >
                <Plus className="h-4 w-4 mr-2" />
                育成枠を追加
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const draftStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "プロ野球12球団ドラフト構想",
    "description": "プロ野球12球団のドラフト指名予想・構想作成ツール",
    "memberOf": teams.map(team => ({
      "@type": "SportsTeam",
      "name": team.name,
      "sport": "Baseball"
    }))
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  if (!selectedTeam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <SEO 
          title="ドラフト構想"
          description="プロ野球12球団のドラフト指名予想を作成。球団別の戦略的ドラフト構想をシミュレーション。育成ドラフトにも対応。"
          keywords={[
            "ドラフト構想", "ドラフト予想", "プロ野球12球団", "指名予想", 
            "育成ドラフト", "球団戦略", "ドラフト会議"
          ]}
          structuredData={draftStructuredData}
        />
        {/* Header */}
        <div className="bg-card border-b shadow-soft">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
            <h1 className="text-xl font-bold text-primary">ドラフト構想</h1>
          </div>
          <div className="flex items-center space-x-2">
            {!user && (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => navigate('/auth')}
              >
                ログイン
              </Button>
            )}
          </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Login Notice for Guest Users */}
          {!user && (
            <Card className="bg-yellow-50 border-yellow-200 shadow-soft">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-yellow-800">お試しモードでご利用中</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      お試しモードでは横浜DeNAベイスターズのみご利用いただけます。<br />
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-yellow-800 underline"
                        onClick={() => navigate('/auth')}
                      >
                        ログイン
                      </Button>
                      すると、全12球団のドラフト構想を作成できます。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="gradient-card border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-primary">球団を選択してください</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-full shadow-soft">
                  <SelectValue placeholder="ドラフト構想球団を選択" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem 
                      key={team.name} 
                      value={team.name}
                      disabled={!user && team.name !== "横浜DeNAベイスターズ"}
                    >
                      {team.name}{!user && team.name !== "横浜DeNAベイスターズ" ? " (ログインが必要)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Favorite Teams */}
          <Card className="gradient-card border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                お気に入り球団
              </CardTitle>
            </CardHeader>
            <CardContent>
               {favorites.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {favorites.map((teamName) => {
                    const team = teams.find(t => t.name === teamName);
                    return team ? (
                      <Button
                        key={teamName}
                        variant="outline"
                        className="text-sm h-auto px-4 py-3 text-white border-0 hover:opacity-90 transition-opacity"
                        style={{
                          background: `linear-gradient(135deg, hsl(${team.colors.primary}), hsl(${team.colors.secondary}))`
                        }}
                        onClick={() => setSelectedTeam(teamName)}
                      >
                        {teamName}
                      </Button>
                    ) : null;
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground text-sm">
                    球団を選択して右上の★マークから<br />
                    お気に入りすると表示されます
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* About Section */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-primary">ドラフト構想について</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  このアプリは、プロ野球12球団のドラフト指名構想を自由に作成・管理できるツールです。各球団のフロント担当者になったつもりで、戦略的なドラフト会議のシミュレーションをお楽しみいただけます。
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">主な機能</h3>
                <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                  <li>• <strong>複数の構想管理：</strong>球団ごとに複数のドラフト構想を作成・保存できます</li>
                  <li>• <strong>詳細な戦略メモ：</strong>各球団の補強ポイントや方針を記録できます</li>
                  <li>• <strong>育成ドラフト対応：</strong>支配下選手だけでなく、育成ドラフトの構想も管理可能</li>
                  <li>• <strong>SNSシェア機能：</strong>作成した構想をX（旧Twitter）で共有して、他のファンと議論できます</li>
                  <li>• <strong>お気に入り機能：</strong>よく使う球団を登録して、素早くアクセスできます</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">使い方</h3>
                <ol className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                  <li>1. 上部のドロップダウンメニューから対象球団を選択します</li>
                  <li>2. 「戦略メモ」欄に球団の補強方針や重視するポジションを記入します</li>
                  <li>3. 各巡目の指名候補選手を「選手を選択」ボタンから設定します</li>
                  <li>4. 必要に応じて育成ドラフトの候補も選択します</li>
                  <li>5. 「構想を保存」ボタンで作成した構想を保存・管理します</li>
                </ol>
              </div>
              <div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  ドラフト会議当日まで何度でも編集できるので、最新の情報をもとに理想のドラフト構想を練り上げましょう。プロ野球ファン同士で構想を共有し、ドラフトをもっと楽しみましょう。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-8">
      <SEO 
        title="ドラフト構想"
        description="プロ野球12球団のドラフト指名予想を作成。球団別の戦略的ドラフト構想をシミュレーション。育成ドラフトにも対応。"
        keywords={[
          "ドラフト構想", "ドラフト予想", "プロ野球12球団", "指名予想", 
          "育成ドラフト", "球団戦略", "ドラフト会議"
        ]}
        structuredData={draftStructuredData}
      />
      {/* Header */}
      <div className="bg-card border-b shadow-soft">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-primary">ドラフト構想</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Login Notice for Guest Users */}
        {!user && (
          <Card className="bg-yellow-50 border-yellow-200 shadow-soft">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 p-2 rounded-full">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-800">お試しモードでご利用中</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    お試しモードでは横浜DeNAベイスターズのみご利用いただけます。<br />
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-yellow-800 underline"
                      onClick={() => navigate('/auth')}
                    >
                      ログイン
                    </Button>
                    すると、全12球団のドラフト構想を作成できます。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Favorite Teams */}
        <Card className="gradient-card border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="text-primary flex items-center space-x-2">
              <Star className="h-5 w-5 text-accent" />
              <span>お気に入り球団</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {favoriteTeams.length > 0 ? (
              favoriteTeams.map((team) => (
                <div
                  key={team.name}
                  className="relative overflow-hidden rounded-lg cursor-pointer transition-smooth hover:shadow-soft"
                  style={{
                    background: `linear-gradient(135deg, hsl(${team.colors.primary} / 0.8), hsl(${team.colors.secondary} / 0.6))`
                  }}
                  onClick={() => setSelectedTeam(team.name)}
                >
                  <div className="p-4 flex items-center justify-between text-white">
                    <div className="flex items-center space-x-3">
                      <Star className="h-4 w-4" />
                      <span className="font-medium">{team.name}</span>
                    </div>
                    <span>→</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  球団を選択して右上の★マークから<br />
                  お気に入りすると表示されます
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* About Section - moved above favorite teams for better visibility */}
        {!user && (
          <Card className="gradient-card border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-primary">ドラフト構想機能について</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm text-foreground/90 leading-relaxed">
                <p>
                  このページでは、プロ野球12球団のドラフト戦略を自由に構想できます。複数のプランを作成し、
                  各球団の戦力分析や獲得候補選手の優先順位を詳細に管理できる本格的なドラフトシミュレーションツールです。
                </p>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-primary">主な機能：</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>12球団それぞれの独立したドラフト構想管理</li>
                    <li>プランA・B・Cの複数パターン作成（名称変更可能）</li>
                    <li>戦略方針メモの保存（各プラン別）</li>
                    <li>ポジション別の獲得目標設定</li>
                    <li>ドラフト指名候補の本命・候補1〜3の登録</li>
                    <li>育成ドラフト候補の管理</li>
                    <li>各ポジションへのメモ機能</li>
                    <li>Twitter・LINEでの構想シェア機能</li>
                    <li>お気に入り球団の登録</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-primary">こんな方におすすめ：</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>ドラフト会議が毎年の楽しみな野球ファン</li>
                    <li>各球団の戦力分析が好きな方</li>
                    <li>自分なりのドラフト戦略を練りたい方</li>
                    <li>複数シナリオを比較検討したい方</li>
                    <li>SNSでドラフト予想を共有したい方</li>
                  </ul>
                </div>
                
                <p className="text-xs text-muted-foreground pt-2 border-t">
                  現在お試しモードでご利用中です。アカウント登録すると、全12球団の構想データがクラウドに保存され、
                  いつでもどこでも編集・閲覧が可能になります。
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <Footer />
    </div>
  );
}