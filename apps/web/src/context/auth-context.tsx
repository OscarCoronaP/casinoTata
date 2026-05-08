"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiFetch } from "@/lib/api";

export type AuthUser = {
  id: string;
  phone: string;
  name: string;
  nickname: string | null;
  role: string;
  avatarUrl: string | null;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  /** false hasta terminar la primera lectura de sesión + /users/me si hay token */
  authReady: boolean;
  setSession: (token: string, user: AuthUser) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

const STORAGE_KEY = "ligamx_quiniela_token";

const AuthContext = createContext<AuthState | undefined>(undefined);

function parseMe(
  me: AuthUser & { stats?: unknown; globalRank?: number },
): AuthUser {
  return {
    id: me.id,
    phone: me.phone,
    name: me.name,
    nickname: me.nickname,
    role: me.role,
    avatarUrl: me.avatarUrl,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const refreshProfile = useCallback(async () => {
    const t = token ?? localStorage.getItem(STORAGE_KEY);
    if (!t) {
      setUser(null);
      setToken(null);
      return;
    }
    try {
      const me = await apiFetch<
        AuthUser & { stats?: unknown; globalRank?: number }
      >("/api/v1/users/me", { token: t });
      setToken(t);
      setUser(parseMe(me));
    } catch {
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
      setToken(null);
    }
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setToken(null);
        setUser(null);
        if (!cancelled) setAuthReady(true);
        return;
      }

      setToken(stored);
      try {
        const me = await apiFetch<
          AuthUser & { stats?: unknown; globalRank?: number }
        >("/api/v1/users/me", { token: stored });
        if (!cancelled) setUser(parseMe(me));
      } catch {
        if (!cancelled) {
          localStorage.removeItem(STORAGE_KEY);
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const setSession = useCallback((t: string, u: AuthUser) => {
    localStorage.setItem(STORAGE_KEY, t);
    setToken(t);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      authReady,
      setSession,
      logout,
      refreshProfile,
    }),
    [token, user, authReady, setSession, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
