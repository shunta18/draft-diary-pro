import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import lotteryBoxImage from "@/assets/lottery-box.png";

// 抽選順序（セ・リーグ優先）
const lotteryOrder = [8, 4, 12, 3, 10, 2, 7, 5, 9, 1, 11, 6]; // ヤクルト→ロッテ→広島→西武→中日→楽天→巨人→オリックス→DeNA→日本ハム→阪神→ソフトバンク

interface LotteryAnimationProps {
  lotteryData: Array<{
    playerName: string;
    team: string;
    position: string;
    competingTeamIds: number[];
    winnerId: number;
  }>;
  teams: Array<{ id: number; name: string; shortName: string; color: string }>;
  onComplete: () => void;
}

type Phase = "info" | "drawing" | "papers" | "open" | "winner" | "fadeout";

export const LotteryAnimation = ({ lotteryData, teams, onComplete }: LotteryAnimationProps) => {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("info");

  const currentData = lotteryData[currentPlayerIndex];
  
  // 抽選順序に従って競合球団をソート
  const sortedCompetingTeams = [...currentData.competingTeamIds].sort((a, b) => {
    return lotteryOrder.indexOf(a) - lotteryOrder.indexOf(b);
  });

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Phase 1: 選手情報表示（3秒）
    timers.push(setTimeout(() => setPhase("drawing"), 3000));
    
    // Phase 2: 抽選箱から紙を引く演出（3秒）
    timers.push(setTimeout(() => setPhase("papers"), 6000));
    
    // Phase 3: 紙が閉じた状態で表示（2秒）
    timers.push(setTimeout(() => setPhase("open"), 8000));
    
    // Phase 4: 一斉に紙を開く（3秒）
    timers.push(setTimeout(() => setPhase("winner"), 11000));
    
    // Phase 5: 勝者をアップで表示（5秒）
    timers.push(setTimeout(() => setPhase("fadeout"), 16000));
    
    // Phase 6: フェードアウト（1秒後）
    timers.push(setTimeout(() => {
      if (currentPlayerIndex < lotteryData.length - 1) {
        setCurrentPlayerIndex(prev => prev + 1);
        setPhase("info");
      } else {
        onComplete();
      }
    }, 17000));

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [currentPlayerIndex, lotteryData.length, onComplete]);

  const getTeamName = (teamId: number) => {
    return teams.find(t => t.id === teamId)?.shortName || "";
  };

  // 球団数に応じてレイアウトクラスを動的に決定
  const getLayoutClass = (teamCount: number) => {
    if (teamCount <= 4) {
      return "flex items-center justify-center gap-20";
    } else if (teamCount <= 6) {
      return "flex items-center justify-center gap-12";
    } else {
      return "flex items-center justify-center gap-8 flex-wrap max-w-6xl mx-auto";
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent 
        className="max-w-full h-screen w-screen p-0 bg-black/95"
        hideCloseButton
      >
        <div className="flex items-center justify-center h-full w-full">
          <div 
            className={`
              transition-opacity duration-1000
              ${phase === "fadeout" ? "opacity-0" : "opacity-100"}
            `}
          >
            {/* Phase 1: 選手情報 */}
            {phase === "info" && (
              <div className="text-center animate-fade-in">
                <h2 className="text-6xl font-bold text-white mb-4">{currentData.playerName}</h2>
                <div className="text-3xl text-white/90 mb-2">{currentData.team}</div>
                <div className="text-2xl text-white/80 mb-6">{currentData.position}</div>
                <Badge variant="outline" className="text-3xl px-8 py-3 bg-white/10 text-white border-white/30">
                  {currentData.competingTeamIds.length}球団競合
                </Badge>
              </div>
            )}

            {/* Phase 2: 抽選箱から紙を引く演出 */}
            {phase === "drawing" && (
              <div className="text-center">
                <h3 className="text-4xl font-bold text-white mb-12">{currentData.playerName}</h3>
                <div className="relative w-64 h-64 mx-auto">
                  <img 
                    src={lotteryBoxImage} 
                    alt="抽選箱" 
                    className="w-full h-full object-contain"
                  />
                  {/* 上から厚紙が引かれる演出 */}
                  {sortedCompetingTeams.map((teamId, index) => (
                    <div
                      key={teamId}
                      className="absolute left-1/2 -translate-x-1/2 animate-[pullPaper_3s_ease-out]"
                      style={{
                        animationDelay: `${index * 150}ms`,
                        top: '40%',
                      }}
                    >
                      {/* 厚紙の本体 */}
                      <div className="relative w-20 h-32">
                        {/* 紙の表面 */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded border-2 border-gray-300 shadow-lg">
                          {/* 折り目の線 */}
                          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-400/50 -translate-x-1/2" />
                          {/* 紙の厚み表現 */}
                          <div className="absolute -right-0.5 top-1 bottom-1 w-1 bg-gradient-to-r from-gray-200 to-gray-300 rounded-r" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Phase 3-4: 紙が閉じた状態 → 開く */}
            {(phase === "papers" || phase === "open") && (
              <div className="text-center">
                <h3 className="text-4xl font-bold text-white mb-12">{currentData.playerName}</h3>
                <div className={`${getLayoutClass(sortedCompetingTeams.length)} px-8`}>
                  {sortedCompetingTeams.map((teamId, index) => {
                    const isWinner = teamId === currentData.winnerId;
                    const showOpen = phase === "open";

                    return (
                      <div
                        key={teamId}
                        className="flex flex-col items-center animate-fade-in"
                        style={{
                          animationDelay: `${index * 50}ms`,
                        }}
                      >
                        {/* 球団名 - 紙が閉じている時は上、開いた時は中央 */}
                        {!showOpen && (
                          <div className="text-white text-xl font-bold mb-3 text-center whitespace-nowrap">
                            {getTeamName(teamId)}
                          </div>
                        )}
                        
                        {/* 紙 */}
                        <div className="relative">
                          {!showOpen ? (
                            // 閉じた状態
                            <div className="w-20 h-32 bg-white rounded shadow-xl border-2 border-gray-300">
                              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-400" />
                            </div>
                          ) : (
                            // 開いた状態
                            <div className="relative">
                              {/* 球団名を紙の中央に配置 */}
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-white text-xl font-bold text-center whitespace-nowrap z-10">
                                {getTeamName(teamId)}
                              </div>
                              <div className="flex h-40 w-32 -translate-x-6">
                                <div className="w-1/2 bg-white border-r-2 border-gray-300 rounded-l shadow-lg animate-[unfoldLeft_1s_ease-out]" />
                                <div className="w-1/2 bg-white flex items-center justify-center rounded-r shadow-lg animate-[unfoldRight_1s_ease-out]">
                                  {isWinner && (
                                    <div className="text-center px-2">
                                      <div className="text-red-600 font-bold text-sm leading-tight whitespace-nowrap">
                                        交渉権<br />獲得
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Phase 5: 勝者をアップで表示 */}
            {phase === "winner" && (
              <div className="text-center animate-scale-in">
                <div className="text-6xl font-bold text-white mb-6">
                  {getTeamName(currentData.winnerId)}
                </div>
                <div className="text-5xl font-bold text-white mb-8">
                  {currentData.playerName}
                </div>
                <Badge variant="outline" className="text-4xl px-12 py-4 bg-yellow-400/20 text-yellow-400 border-yellow-400">
                  交渉権獲得
                </Badge>
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      <style>{`
        @keyframes pullPaper {
          0% {
            top: 40%;
            opacity: 1;
            transform: translateX(-50%) translateY(0) rotateX(0deg);
          }
          50% {
            top: 10%;
            opacity: 1;
            transform: translateX(-50%) translateY(0) rotateX(-5deg);
          }
          100% {
            top: -150px;
            opacity: 0;
            transform: translateX(-50%) translateY(0) rotateX(-10deg);
          }
        }

        @keyframes unfoldLeft {
          from {
            transform: perspective(1000px) rotateY(90deg);
            transform-origin: right center;
          }
          to {
            transform: perspective(1000px) rotateY(0deg);
            transform-origin: right center;
          }
        }

        @keyframes unfoldRight {
          from {
            transform: perspective(1000px) rotateY(-90deg);
            transform-origin: left center;
          }
          to {
            transform: perspective(1000px) rotateY(0deg);
            transform-origin: left center;
          }
        }
      `}</style>
    </Dialog>
  );
};
