import { supabase } from "@/integrations/supabase/client";

const SESSION_ID_KEY = "draft_prediction_session_id";

// セッションIDの取得または生成
export const getOrCreateSessionId = (): string => {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
};

// 選手投票の追加/削除
export const upsertPlayerVote = async (
  teamId: number,
  playerId: number,
  isVoting: boolean,
  draftYear: string = "2025"
): Promise<{ error: Error | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const sessionId = getOrCreateSessionId();

    if (isVoting) {
      // 投票を追加（既存がある場合は更新）
      const { error } = await supabase
        .from("draft_team_player_votes")
        .upsert({
          user_id: user?.id || null,
          session_id: user ? null : sessionId,
          team_id: teamId,
          public_player_id: playerId,
          draft_year: draftYear,
        }, {
          onConflict: user ? 'user_id,team_id,public_player_id,draft_year' : 'session_id,team_id,public_player_id,draft_year'
        });

      if (error) throw error;
    } else {
      // 投票を削除
      const query = supabase
        .from("draft_team_player_votes")
        .delete()
        .eq("team_id", teamId)
        .eq("public_player_id", playerId)
        .eq("draft_year", draftYear);

      if (user) {
        query.eq("user_id", user.id);
      } else {
        query.eq("session_id", sessionId);
      }

      const { error } = await query;
      if (error) throw error;
    }

    return { error: null };
  } catch (error) {
    console.error("Error upserting player vote:", error);
    return { error: error as Error };
  }
};

// ポジション投票の追加/削除（ドラフト順位ごと）
export const upsertPositionVote = async (
  teamId: number,
  draftRound: number,
  position: string | null,
  draftYear: string = "2025"
): Promise<{ error: Error | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const sessionId = getOrCreateSessionId();

    if (position) {
      // 投票を追加（既存がある場合は更新）
      const { error } = await supabase
        .from("draft_team_position_votes")
        .upsert(
          {
            user_id: user?.id || null,
            session_id: user ? null : sessionId,
            team_id: teamId,
            position: position,
            draft_round: draftRound,
            draft_year: draftYear,
          },
          {
            onConflict: user 
              ? 'user_id,team_id,draft_round,draft_year'
              : 'session_id,team_id,draft_round,draft_year',
          }
        );

      if (error) throw error;
    } else {
      // 投票を削除（positionがnullの場合）
      const query = supabase
        .from("draft_team_position_votes")
        .delete()
        .eq("team_id", teamId)
        .eq("draft_round", draftRound)
        .eq("draft_year", draftYear);

      if (user) {
        query.eq("user_id", user.id);
      } else {
        query.eq("session_id", sessionId);
      }

      const { error } = await query;
      if (error) throw error;
    }

    return { error: null };
  } catch (error) {
    console.error("Error upserting position vote:", error);
    return { error: error as Error };
  }
};

// ユーザーの投票状態を取得
export const getUserVotes = async (draftYear: string = "2025") => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const sessionId = getOrCreateSessionId();

    // 選手投票を取得
    const playerQuery = supabase
      .from("draft_team_player_votes")
      .select("team_id, public_player_id")
      .eq("draft_year", draftYear);

    if (user) {
      playerQuery.eq("user_id", user.id);
    } else {
      playerQuery.eq("session_id", sessionId);
    }

    const { data: playerVotes, error: playerError } = await playerQuery;
    if (playerError) throw playerError;

    // ポジション投票を取得（ドラフト順位も含む）
    const positionQuery = supabase
      .from("draft_team_position_votes")
      .select("team_id, position, draft_round")
      .eq("draft_year", draftYear);

    if (user) {
      positionQuery.eq("user_id", user.id);
    } else {
      positionQuery.eq("session_id", sessionId);
    }

    const { data: positionVotes, error: positionError } = await positionQuery;
    if (positionError) throw positionError;

    return {
      playerVotes: playerVotes || [],
      positionVotes: positionVotes || [],
      error: null,
    };
  } catch (error) {
    console.error("Error fetching user votes:", error);
    return {
      playerVotes: [],
      positionVotes: [],
      error: error as Error,
    };
  }
};

// 投票集計データの型
export interface DraftPredictions {
  playerVotes: Map<number, { count: number; teamId: number }[]>; // playerId -> [{teamId, count}]
  positionVotes: Map<string, { count: number; teamId: number; draftRound: number }[]>; // position -> [{teamId, count, draftRound}]
}

// 投票結果を集計
export const fetchDraftPredictions = async (draftYear: string = "2025"): Promise<DraftPredictions> => {
  try {
    // 選手投票の集計
    const { data: playerVotesData, error: playerError } = await supabase
      .from("draft_team_player_votes")
      .select("team_id, public_player_id")
      .eq("draft_year", draftYear);

    if (playerError) throw playerError;

    // ポジション投票の集計（ドラフト順位も含む）
    const { data: positionVotesData, error: positionError } = await supabase
      .from("draft_team_position_votes")
      .select("team_id, position, draft_round")
      .eq("draft_year", draftYear);

    if (positionError) throw positionError;

    // 選手投票をMap形式に変換（public_player_id -> [{teamId, count}]）
    const playerVotesMap = new Map<number, { count: number; teamId: number }[]>();
    (playerVotesData || []).forEach((vote) => {
      const existing = playerVotesMap.get(vote.public_player_id) || [];
      const teamVote = existing.find(v => v.teamId === vote.team_id);
      if (teamVote) {
        teamVote.count++;
      } else {
        existing.push({ teamId: vote.team_id, count: 1 });
      }
      playerVotesMap.set(vote.public_player_id, existing);
    });

    // ポジション投票をMap形式に変換（position -> [{teamId, count, draftRound}]）
    const positionVotesMap = new Map<string, { count: number; teamId: number; draftRound: number }[]>();
    (positionVotesData || []).forEach((vote) => {
      const existing = positionVotesMap.get(vote.position) || [];
      const teamVote = existing.find(v => v.teamId === vote.team_id && v.draftRound === vote.draft_round);
      if (teamVote) {
        teamVote.count++;
      } else {
        existing.push({ teamId: vote.team_id, count: 1, draftRound: vote.draft_round });
      }
      positionVotesMap.set(vote.position, existing);
    });

    return {
      playerVotes: playerVotesMap,
      positionVotes: positionVotesMap,
    };
  } catch (error) {
    console.error("Error fetching draft predictions:", error);
    return {
      playerVotes: new Map(),
      positionVotes: new Map(),
    };
  }
};

// 全選手の投票数を取得（投票ページ表示用）
export const getPlayerVoteCounts = async (draftYear: string = "2025") => {
  try {
    const { data, error } = await supabase
      .from("draft_team_player_votes")
      .select("team_id, public_player_id")
      .eq("draft_year", draftYear);

    if (error) throw error;

    // team_id, public_player_id ごとに集計
    const voteCounts: Record<string, number> = {};
    (data || []).forEach((vote) => {
      const key = `${vote.team_id}_${vote.public_player_id}`;
      voteCounts[key] = (voteCounts[key] || 0) + 1;
    });

    return { voteCounts, error: null };
  } catch (error) {
    console.error("Error fetching player vote counts:", error);
    return { voteCounts: {}, error: error as Error };
  }
};

// 全ポジションの投票数を取得（投票ページ表示用、ドラフト順位ごと）
export const getPositionVoteCounts = async (draftYear: string = "2025") => {
  try {
    const { data, error } = await supabase
      .from("draft_team_position_votes")
      .select("team_id, position, draft_round")
      .eq("draft_year", draftYear);

    if (error) throw error;

    // team_id, position, draft_round ごとに集計
    const voteCounts: Record<string, number> = {};
    (data || []).forEach((vote) => {
      const key = `${vote.team_id}_${vote.draft_round}_${vote.position}`;
      voteCounts[key] = (voteCounts[key] || 0) + 1;
    });

    return { voteCounts, error: null };
  } catch (error) {
    console.error("Error fetching position vote counts:", error);
    return { voteCounts: {}, error: error as Error };
  }
};
