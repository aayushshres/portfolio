import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { api } from "../lib/api";

const STORAGE_KEY = "admin-token";

// ⚠️ SECURITY NOTE: localStorage is XSS-accessible. For higher security,
// migrate to httpOnly cookies set by the Worker. For now, ensure no
// third-party scripts are loaded that could exfiltrate this token.
const getStorageItem = (key: string) => {
  try { return localStorage.getItem(key); } catch { return null; }
};
const setStorageItem = (key: string, value: string) => {
  try { localStorage.setItem(key, value); } catch {}
};
const removeStorageItem = (key: string) => {
  try { localStorage.removeItem(key); } catch {}
};

interface AuthContextValue {
  token: string | null;
  isLoggedIn: boolean;
  login: (password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStorageItem(STORAGE_KEY));
  const [loading, setLoading] = useState(true);

  // Track whether the token was freshly obtained via login() in this session.
  // If so, skip verification — the server just issued it, so it's valid.
  const justLoggedIn = useRef(false);

  const isLoggedIn = !!token;

  useEffect(() => {
    async function verify() {
      if (!token) {
        setLoading(false);
        return;
      }

      // Skip verification for tokens we just obtained from login().
      if (justLoggedIn.current) {
        justLoggedIn.current = false;
        setLoading(false);
        return;
      }

      try {
        await api.get("/auth/verify", token);
      } catch (err) {
        console.error("Token verification failed", err);
        setToken(null);
        removeStorageItem(STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [token]);

  const login = useCallback(async (password: string) => {
    const res = await api.post<{ token: string }>("/auth/login", { password });
    justLoggedIn.current = true;
    setToken(res.token);
    setStorageItem(STORAGE_KEY, res.token);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    removeStorageItem(STORAGE_KEY);
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
