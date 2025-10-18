import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import lotteryBoxImage from "@/assets/lottery-box.png";

// 抽選順序（セ・リーグ優先）
const lotteryOrder = [8, 4, 12, 3, 10, 2, 7, 5, 9, 1, 11, 6]; // ヤクルト→ロッテ→広島→西武→中日→楽天→巨人→オリックス→DeNA→日本ハム→阪神→ソフトバンク

interface LotteryAnimationProps {
  lotteryData: Array<{
    playerName: string;
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

    // Phase 1: 選手情報表示（2秒）
    timers.push(setTimeout(() => setPhase("drawing"), 2000));
    
    // Phase 2: 抽選箱から紙を引く演出（2秒）
    timers.push(setTimeout(() => setPhase("papers"), 4000));
    
    // Phase 3: 紙が閉じた状態で表示（1秒）
    timers.push(setTimeout(() => setPhase("open"), 5000));
    
    // Phase 4: 一斉に紙を開く（2秒）
    timers.push(setTimeout(() => setPhase("winner"), 7000));
    
    // Phase 5: 勝者をアップで表示（4秒）
    timers.push(setTimeout(() => setPhase("fadeout"), 11000));
    
    // Phase 6: フェードアウト（1秒後）
    timers.push(setTimeout(() => {
      if (currentPlayerIndex < lotteryData.length - 1) {
        setCurrentPlayerIndex(prev => prev + 1);
        setPhase("info");
      } else {
        onComplete();
      }
    }, 12000));

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [currentPlayerIndex, lotteryData.length, onComplete]);

  const getTeamName = (teamId: number) => {
    return teams.find(t => t.id === teamId)?.shortName || "";
  };

  // 円形配置の角度を計算
  const getCirclePosition = (index: number, total: number) => {
    const angle = (index * 360) / total - 90; // -90で12時の位置からスタート
    const radius = 280;
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius;
    return { x, y };
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
                <div className="text-2xl text-white/80 mb-6">所属チーム・ポジション</div>
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
                  {/* 上から紙が引かれる演出 */}
                  {sortedCompetingTeams.map((teamId, index) => (
                    <div
                      key={teamId}
                      className="absolute left-1/2 -translate-x-1/2 w-16 h-24 bg-white rounded shadow-xl animate-[pullPaper_2s_ease-out]"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        top: '-120px',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Phase 3-4: 紙が閉じた状態 → 開く */}
            {(phase === "papers" || phase === "open") && (
              <div className="text-center">
                <h3 className="text-4xl font-bold text-white mb-12">{currentData.playerName}</h3>
                <div className="relative w-[600px] h-[600px] mx-auto">
                  {sortedCompetingTeams.map((teamId, index) => {
                    const isWinner = teamId === currentData.winnerId;
                    const position = getCirclePosition(index, sortedCompetingTeams.length);
                    const showOpen = phase === "open";

                    return (
                      <div
                        key={teamId}
                        className="absolute animate-fade-in"
                        style={{
                          left: `calc(50% + ${position.x}px)`,
                          top: `calc(50% + ${position.y}px)`,
                          transform: 'translate(-50%, -50%)',
                          animationDelay: `${index * 50}ms`,
                        }}
                      >
                        {/* 球団名 */}
                        <div className="text-white text-xl font-bold mb-3 text-center whitespace-nowrap">
                          {getTeamName(teamId)}
                        </div>
                        
                        {/* 紙 */}
                        <div className="relative">
                          {!showOpen ? (
                            // 閉じた状態
                            <div className="w-20 h-32 bg-white rounded shadow-xl border-2 border-gray-300">
                              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-400" />
                            </div>
                          ) : (
                            // 開いた状態
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
            top: 50%;
            opacity: 1;
          }
          100% {
            top: -120px;
            opacity: 0;
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
