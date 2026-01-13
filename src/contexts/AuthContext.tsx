import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, User, UserWithStats } from '../api/client';

interface AuthContextData {
  user: UserWithStats | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserWithStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      await api.init();

      if (api.getToken()) {
        const userData = await api.getMe();
        setUser(userData);
      }
    } catch (error) {
      console.log('[Auth] Erro ao carregar usuário:', error);
      await api.setToken(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    const { user: userData } = await api.login(email, password);
    const fullUser = await api.getMe();
    setUser(fullUser);
  }

  async function signUp(email: string, username: string, password: string) {
    const { user: userData } = await api.register(email, username, password);
    const fullUser = await api.getMe();
    setUser(fullUser);
  }

  async function signOut() {
    await api.logout();
    setUser(null);
  }

  async function refreshUser() {
    if (api.getToken()) {
      const userData = await api.getMe();
      setUser(userData);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
}
