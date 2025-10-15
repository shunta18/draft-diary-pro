import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!email || !password) {
      return { error: new Error('メールアドレスとパスワードを入力してください') };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signUp = async (email: string, password: string, name?: string) => {
    if (!email || !password) {
      return { error: new Error('メールアドレスとパスワードを入力してください') };
    }

    if (!name || name.trim().length === 0) {
      return { error: new Error('ユーザーネームを入力してください') };
    }

    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: name.trim()
        }
      }
    });

    return { error };
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      // Clear local storage data
      localStorage.removeItem('baseball_scout_players');
      localStorage.removeItem('baseball_scout_diary');
      localStorage.removeItem('draftData');
      
      // Clear local state regardless of server response
      setSession(null);
      setUser(null);
      
      // Don't throw error for "session not found" as it means user is already logged out
      if (error && !error.message?.includes('session not found')) {
        console.error('Logout error:', error);
        throw error;
      }
    } catch (error: any) {
      // Clear local storage data even if there's an error
      localStorage.removeItem('baseball_scout_players');
      localStorage.removeItem('baseball_scout_diary');
      localStorage.removeItem('draftData');
      
      // Clear local state even if there's an error
      setSession(null);
      setUser(null);
      
      // Don't throw error for session-related issues
      if (error.message?.includes('session not found') || error.message?.includes('session_not_found')) {
        return; // User is already logged out
      }
      
      console.error('SignOut failed:', error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    if (!user) throw new Error('ユーザーがログインしていません');
    
    try {
      // Call the delete-user edge function to remove all user data and auth account
      const { data, error } = await supabase.functions.invoke('delete-user', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      
      if (error) {
        console.error('Account deletion error:', error);
        throw new Error(`アカウント削除に失敗しました: ${error.message}`);
      }
      
      // アカウント削除後に自動ログアウト
      await signOut();
      
      console.log('Account successfully deleted');
    } catch (error: any) {
      console.error('Delete account failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      deleteAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}