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

interface AuthContextValue {
  isLoggedIn: boolean;
  login: (password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Track whether the token was freshly obtained via login() in this session.
  // If so, skip verification — the server just issued it, so it's valid.
  const justLoggedIn = useRef(false);

  useEffect(() => {
    async function verify() {
      // Skip verification for tokens we just obtained from login().
      if (justLoggedIn.current) {
        justLoggedIn.current = false;
        setLoading(false);
        return;
      }

      try {
        await api.get("/auth/verify");
        setIsLoggedIn(true);
      } catch (err) {
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, []); // Run once on mount

  const login = useCallback(async (password: string) => {
    await api.post("/auth/login", { password });
    justLoggedIn.current = true;
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout", {});
    } finally {
      setIsLoggedIn(false);
    }
  }, []);

  const value = useMemo(
    () => ({ isLoggedIn, login, logout, loading }),
    [isLoggedIn, login, logout, loading]
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

