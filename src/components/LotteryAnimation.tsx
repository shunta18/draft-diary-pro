import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

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

type Phase = "info" | "boxes" | "papers" | "result" | "fadeout";

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
    timers.push(setTimeout(() => setPhase("boxes"), 2000));
    
    // Phase 2: 箱の表示（1秒後）
    timers.push(setTimeout(() => setPhase("papers"), 3000));
    
    // Phase 3: 紙が出てくる（3秒後）
    timers.push(setTimeout(() => setPhase("result"), 6000));
    
    // Phase 4: 結果表示（3秒後）
    timers.push(setTimeout(() => setPhase("fadeout"), 9000));
    
    // Phase 5: フェードアウト（1秒後）
    timers.push(setTimeout(() => {
      if (currentPlayerIndex < lotteryData.length - 1) {
        setCurrentPlayerIndex(prev => prev + 1);
        setPhase("info");
      } else {
        onComplete();
      }
    }, 10000));

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [currentPlayerIndex, lotteryData.length, onComplete]);

  const getTeamName = (teamId: number) => {
    return teams.find(t => t.id === teamId)?.shortName || "";
  };

  // 球団数に応じてレイアウトクラスを動的に決定
  const getLayoutClass = (teamCount: number) => {
    if (teamCount <= 4) {
      return "flex items-end justify-center gap-20";
    } else if (teamCount <= 6) {
      return "flex items-end justify-center gap-12";
    } else {
      return "grid grid-cols-6 gap-8 justify-items-center";
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
                <h2 className="text-6xl font-bold text-white mb-6">{currentData.playerName}</h2>
                <Badge variant="outline" className="text-3xl px-8 py-3 bg-white/10 text-white border-white/30">
                  {currentData.competingTeamIds.length}球団競合
                </Badge>
              </div>
            )}

            {/* Phase 2-4: 箱と紙のアニメーション */}
            {(phase === "boxes" || phase === "papers" || phase === "result") && (
              <div className="space-y-8">
                <div className="text-center mb-12">
                  <h2 className="text-5xl font-bold text-white mb-4">{currentData.playerName}</h2>
                  <Badge variant="outline" className="text-2xl px-6 py-2 bg-white/10 text-white border-white/30">
                    {currentData.competingTeamIds.length}球団競合
                  </Badge>
                </div>

                <div className={`${getLayoutClass(sortedCompetingTeams.length)} px-8`}>
                  {sortedCompetingTeams.map((teamId, index) => {
                    const isWinner = teamId === currentData.winnerId;
                    const showPaper = phase === "papers" || phase === "result";
                    const showResult = phase === "result";

                    return (
                      <div
                        key={teamId}
                        className={`
                          relative flex flex-col items-center
                          ${phase === "boxes" ? "animate-scale-in" : ""}
                          ${showResult && isWinner ? "animate-[highlight_2s_ease-in-out]" : ""}
                        `}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* 球団名 */}
                        <div className="mb-4 text-white text-xl font-bold whitespace-nowrap">
                          {getTeamName(teamId)}
                        </div>

                        {/* 箱 */}
                        <div
                          className={`
                            w-32 h-40 bg-gradient-to-b from-gray-600 to-gray-800
                            border-4 border-gray-700 rounded-lg shadow-2xl
                            relative overflow-visible
                            ${showResult && isWinner ? "ring-4 ring-yellow-400 scale-110" : ""}
                            transition-all duration-500
                          `}
                        >
                          {/* 紙 */}
                          {showPaper && (
                            <div
                              className={`
                                absolute left-1/2 -translate-x-1/2 w-20
                                transition-all duration-[3000ms] ease-out
                                ${phase === "papers" ? "-bottom-2" : "-bottom-48"}
                              `}
                            >
                              {/* 折りたたまれた紙（開く前） */}
                              <div
                                className={`
                                  relative bg-white rounded shadow-xl
                                  transition-all duration-1500
                                  ${!showResult ? "h-48" : "h-56 w-32 -translate-x-6"}
                                  ${!showResult ? "perspective-1000" : ""}
                                `}
                                style={{
                                  transformStyle: "preserve-3d",
                                }}
                              >
                                {!showResult ? (
                                  // 折りたたまれた状態
                                  <div className="absolute inset-0 bg-white rounded border-2 border-gray-300 shadow-lg">
                                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-400" />
                                  </div>
                                ) : (
                                  // 開いた状態
                                  <div className="flex h-full">
                                    {/* 左側（白紙） */}
                                    <div
                                      className="w-1/2 bg-white border-r-2 border-gray-300 rounded-l shadow-lg animate-[unfoldLeft_1.5s_ease-out]"
                                    />
                                    {/* 右側（結果） */}
                                    <div
                                      className="w-1/2 bg-white flex items-center justify-center rounded-r shadow-lg animate-[unfoldRight_1.5s_ease-out]"
                                    >
                                      {isWinner && (
                                        <div className="text-center px-2">
                                          <div className="text-red-600 font-bold text-lg leading-tight whitespace-nowrap">
                                            交渉権<br />確定
                                          </div>
                                        </div>
                                      )}
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
          </div>
        </div>
      </DialogContent>

      <style>{`
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

        @keyframes highlight {
          0%, 100% {
            transform: scale(1.1);
          }
          50% {
            transform: scale(1.15);
            box-shadow: 0 0 30px gold;
          }
        }
      `}</style>
    </Dialog>
  );
};
