import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';

import { clearToken, getToken, setToken } from '@/lib/api';
import {
  loginRequest,
  logoutRequest,
  meRequest,
  registerRequest,
} from '@/services/authService';
import type { Profile, User } from '@/types/user';

interface AuthContextData {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  applyToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setProfile(null);
      return;
    }

    try {
      const data = await meRequest();
      setUser(data.user);
      setProfile(data.profile);
    } catch {
      clearToken();
      setUser(null);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const applyToken = useCallback(
    async (token: string) => {
      setToken(token);
      const data = await meRequest();
      setUser(data.user);
      setProfile(data.profile);
    },
    [],
  );

  const login = useCallback(async (email: string, password: string) => {
    const data = await loginRequest(email, password);
    setToken(data.token);
    setUser(data.user);

    try {
      const session = await meRequest();
      setUser(session.user);
      setProfile(session.profile);
    } catch {
      setProfile(null);
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const data = await registerRequest(name, email, password);
      setToken(data.token);
      setUser(data.user);
      setProfile(null);
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // Sessão stateless: mesmo se a chamada falhar, o token local é removido.
    }
    clearToken();
    setUser(null);
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      login,
      register,
      logout,
      refreshUser,
      applyToken,
    }),
    [user, profile, loading, login, register, logout, refreshUser, applyToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
