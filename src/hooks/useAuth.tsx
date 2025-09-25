import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  lastLoginAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user in localStorage
    try {
      const storedUser = localStorage.getItem(STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Mock authentication for demo purposes
    if (email && password) {
      // Check if user exists in localStorage to preserve registration date
      const existingUser = localStorage.getItem(STORAGE_KEY);
      let user: User;
      
      if (existingUser) {
        // Existing user - update last login
        const parsedUser = JSON.parse(existingUser);
        user = {
          ...parsedUser,
          lastLoginAt: new Date().toISOString()
        };
      } else {
        // New user
        user = {
          id: Date.now().toString(),
          email,
          name: email.split('@')[0],
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };
      }
      
      setUser(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      throw new Error('メールアドレスとパスワードを入力してください');
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    // Mock registration for demo purposes
    if (email && password) {
      const user: User = {
        id: Date.now().toString(),
        email,
        name: name || email.split('@')[0],
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      setUser(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      throw new Error('メールアドレスとパスワードを入力してください');
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const deleteAccount = async () => {
    if (!user) throw new Error('ユーザーがログインしていません');
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{
      user,
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