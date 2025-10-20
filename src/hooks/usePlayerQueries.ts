import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getPublicPlayers, 
  getPublicDiaryEntries, 
  getUserProfiles,
  getPlayers,
  getFollowedUsers,
  type PublicPlayer,
  type UserProfileWithStats,
  type Player
} from "@/lib/supabase-storage";

// キャッシュキーの定義
export const queryKeys = {
  publicPlayers: ['publicPlayers'] as const,
  publicDiaries: ['publicDiaries'] as const,
  userProfiles: ['userProfiles'] as const,
  players: ['players'] as const,
  followedUsers: ['followedUsers'] as const,
};

// 共通のキャッシュ設定
const cacheConfig = {
  staleTime: 5 * 60 * 1000, // 5分間はキャッシュを新鮮とみなす
  gcTime: 10 * 60 * 1000, // 10分間キャッシュを保持（旧cacheTime）
  refetchOnWindowFocus: false, // フォーカス時の自動再フェッチを無効化
  retry: 1, // エラー時は1回だけリトライ
};

// 公開選手データのフック
export function usePublicPlayers(enabled = true) {
  return useQuery<PublicPlayer[], Error>({
    queryKey: queryKeys.publicPlayers,
    queryFn: getPublicPlayers,
    enabled,
    ...cacheConfig,
  });
}

// 公開日記データのフック
export function usePublicDiaryEntries(enabled = true) {
  return useQuery({
    queryKey: queryKeys.publicDiaries,
    queryFn: getPublicDiaryEntries,
    enabled,
    ...cacheConfig,
  });
}

// ユーザープロファイルデータのフック
export function useUserProfiles(enabled = true) {
  return useQuery<UserProfileWithStats[], Error>({
    queryKey: queryKeys.userProfiles,
    queryFn: getUserProfiles,
    enabled,
    ...cacheConfig,
  });
}

// 個人の選手データのフック
export function usePlayers(enabled = true) {
  return useQuery<Player[], Error>({
    queryKey: queryKeys.players,
    queryFn: getPlayers,
    enabled,
    ...cacheConfig,
  });
}

// フォロー中のユーザーのフック
export function useFollowedUsers(enabled = true) {
  return useQuery<string[], Error>({
    queryKey: queryKeys.followedUsers,
    queryFn: getFollowedUsers,
    enabled,
    ...cacheConfig,
  });
}

// キャッシュ無効化用のヘルパーフック
export function useInvalidateQueries() {
  const queryClient = useQueryClient();

  return {
    invalidatePlayers: () => queryClient.invalidateQueries({ queryKey: queryKeys.players }),
    invalidatePublicPlayers: () => queryClient.invalidateQueries({ queryKey: queryKeys.publicPlayers }),
    invalidatePublicDiaries: () => queryClient.invalidateQueries({ queryKey: queryKeys.publicDiaries }),
    invalidateUserProfiles: () => queryClient.invalidateQueries({ queryKey: queryKeys.userProfiles }),
    invalidateFollowedUsers: () => queryClient.invalidateQueries({ queryKey: queryKeys.followedUsers }),
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.players });
      queryClient.invalidateQueries({ queryKey: queryKeys.publicPlayers });
      queryClient.invalidateQueries({ queryKey: queryKeys.publicDiaries });
      queryClient.invalidateQueries({ queryKey: queryKeys.userProfiles });
      queryClient.invalidateQueries({ queryKey: queryKeys.followedUsers });
    },
  };
}
