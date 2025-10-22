-- public_playersテーブルのRLSポリシーを更新

-- 既存のユーザー自身のみ更新できるポリシーを削除
DROP POLICY IF EXISTS "Users can update their own public players" ON public.public_players;

-- 既存のユーザー自身のみ削除できるポリシーを削除
DROP POLICY IF EXISTS "Users can delete their own public players" ON public.public_players;

-- 認証済みユーザーなら誰でも更新できるポリシーを作成
CREATE POLICY "Authenticated users can update public players"
ON public.public_players
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 管理者のみ削除できるポリシーを作成（既存の管理者ポリシーがあるが、明示的に削除用を追加）
CREATE POLICY "Admins can delete public players"
ON public.public_players
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));