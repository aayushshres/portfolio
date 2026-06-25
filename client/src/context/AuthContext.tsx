import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { api } from "../lib/api";

const STORAGE_KEY = "admin-token";

interface AuthContextValue {
  token: string | null;
  isLoggedIn: boolean;
  login: (password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [loading, setLoading] = useState(true);

  const isLoggedIn = !!token;

  useEffect(() => {
    async function verify() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        await api.get("/auth/verify", token);
      } catch (err) {
        console.error("Token verification failed", err);
        setToken(null);
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [token]);

  const login = useCallback(async (password: string) => {
    const res = await api.post<{ token: string }>("/auth/login", { password });
    setToken(res.token);
    localStorage.setItem(STORAGE_KEY, res.token);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
    // Optional: await api.post("/auth/logout", {}, token)
  }, []);

  const value = useMemo(
    () => ({ token, isLoggedIn, login, logout, loading }),
    [token, isLoggedIn, login, logout, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
