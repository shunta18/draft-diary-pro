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
  playerId: string, // UUID
  isVoting: boolean,
  draftYear: string = "2025"
): Promise<{ error: Error | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const sessionId = getOrCreateSessionId();

    if (isVoting) {
      // 投票を追加（複数投票可能）
      const { error } = await supabase
        .from("draft_team_player_votes")
        .insert({
          user_id: user?.id || null,
          session_id: user ? null : sessionId,
          team_id: teamId,
          public_player_id: playerId,
          draft_year: draftYear,
        });

      if (error) throw error;
    } else {
      // 投票を全て削除
      let query = supabase
        .from("draft_team_player_votes")
        .delete()
        .eq("team_id", teamId)
        .eq("public_player_id", playerId)
        .eq("draft_year", draftYear);

      if (user) {
        query = query.eq("user_id", user.id);
      } else {
        query = query.eq("session_id", sessionId);
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
      // 投票を追加（複数投票可能）
      const { error } = await supabase
        .from("draft_team_position_votes")
        .insert({
          user_id: user?.id || null,
          session_id: user ? null : sessionId,
          team_id: teamId,
          position: position,
          draft_round: draftRound,
          draft_year: draftYear,
        });

      if (error) throw error;
    } else {
      // 投票を全て削除（positionがnullの場合）
      let query = supabase
        .from("draft_team_position_votes")
        .delete()
        .eq("team_id", teamId)
        .eq("draft_round", draftRound)
        .eq("draft_year", draftYear);

      if (user) {
        query = query.eq("user_id", user.id);
      } else {
        query = query.eq("session_id", sessionId);
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
  playerVotes: Map<string, { count: number; teamId: number; playerName: string; playerTeam: string; playerCategory: string }[]>; // playerId (UUID) -> [{teamId, count, playerName, playerTeam, playerCategory}]
  positionVotes: Map<string, { count: number; teamId: number; draftRound: number }[]>; // position -> [{teamId, count, draftRound}]
}

// 投票結果を集計
export const fetchDraftPredictions = async (draftYear: string = "2025"): Promise<DraftPredictions> => {
  try {
    // 選手投票の集計（public_player_idごとにteam_idをカウント）
    const { data: playerVotesData, error: playerError } = await supabase
      .from("draft_team_player_votes")
      .select("team_id, public_player_id")
      .eq("draft_year", draftYear);

    if (playerError) throw playerError;

    // 重複なしのpublic_player_idリストを取得
    const publicPlayerIds = [...new Set((playerVotesData || []).map(v => v.public_player_id))];
    
    // public_players情報を一括取得（必要な列のみ）
    const { data: playersData, error: playersError } = await supabase
      .from("public_players")
      .select("id, name, team, category")
      .in("id", publicPlayerIds);

    if (playersError) throw playersError;

    // public_players.idをキーにしたMapを作成
    const playersMap = new Map(
      (playersData || []).map(p => [p.id, p])
    );

    // ポジション投票の集計（必要な列のみ）
    const { data: positionVotesData, error: positionError } = await supabase
      .from("draft_team_position_votes")
      .select("team_id, position, draft_round")
      .eq("draft_year", draftYear);

    if (positionError) throw positionError;

    // 選手投票をMap形式に変換（public_player_id -> [{teamId, count, playerName, playerTeam, playerCategory}]）
    const playerVotesMap = new Map<string, { count: number; teamId: number; playerName: string; playerTeam: string; playerCategory: string }[]>();
    (playerVotesData || []).forEach((vote: any) => {
      const playerInfo = playersMap.get(vote.public_player_id);
      if (!playerInfo) return; // 選手情報が見つからない場合はスキップ
      
      const existing = playerVotesMap.get(vote.public_player_id) || [];
      const teamVote = existing.find(v => v.teamId === vote.team_id);
      if (teamVote) {
        teamVote.count++;
      } else {
        existing.push({ 
          teamId: vote.team_id, 
          count: 1,
          playerName: playerInfo.name,
          playerTeam: playerInfo.team,
          playerCategory: playerInfo.category
        });
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
// RPCを使用してデータベース側で集計を実行
export const getPlayerVoteCounts = async (draftYear: string = "2025", teamId?: number) => {
  try {
    // RPCを呼び出してデータベース側で集計
    const { data, error } = await supabase.rpc("get_player_vote_counts_by_team", {
      p_draft_year: draftYear,
      p_team_id: teamId || null,
    });

    if (error) throw error;

    // RPCの結果をRecord<string, number>形式に変換
    const voteCounts: Record<string, number> = {};
    (data || []).forEach((row: any) => {
      const key = `${row.team_id}_${row.public_player_id}`;
      voteCounts[key] = parseInt(row.vote_count, 10);
    });

    return { voteCounts, error: null };
  } catch (error) {
    console.error("Error fetching player vote counts:", error);
    return { voteCounts: {}, error: error as Error };
  }
};

// 全ポジションの投票数を取得（投票ページ表示用、ドラフト順位ごと）
export const getPositionVoteCounts = async (draftYear: string = "2025", teamId?: number) => {
  try {
    // RPCを呼び出してデータベース側で集計
    const { data, error } = await supabase.rpc("get_position_vote_counts_by_team", {
      p_draft_year: draftYear,
      p_team_id: teamId || null,
    });

    if (error) throw error;

    // RPCの結果をRecord<string, number>形式に変換
    const voteCounts: Record<string, number> = {};
    (data || []).forEach((row: any) => {
      const key = `${row.team_id}_${row.draft_round}_${row.position}`;
      voteCounts[key] = parseInt(row.vote_count, 10);
    });

    return { voteCounts, error: null };
  } catch (error) {
    console.error("Error fetching position vote counts:", error);
    return { voteCounts: {}, error: error as Error };
  }
};
