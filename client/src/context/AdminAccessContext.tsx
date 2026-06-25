// DEPRECATED: Replaced by AuthContext.tsx using JWT.
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "admin-access-unlocked";

interface AdminAccessValue {
  /** Whether the hidden admin area has been unlocked this session. */
  unlocked: boolean;
  /** Unlock the admin area (called after the secret logo sequence). */
  unlock: () => void;
  /** Re-lock the admin area (e.g. on logout). */
  lock: () => void;
}

const AdminAccessContext = createContext<AdminAccessValue | null>(null);

export function AdminAccessProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState<boolean>(
    () => sessionStorage.getItem(STORAGE_KEY) === "true",
  );

  const unlock = useCallback(() => {
    sessionStorage.setItem(STORAGE_KEY, "true");
    setUnlocked(true);
  }, []);

  const lock = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setUnlocked(false);
  }, []);

  const value = useMemo(
    () => ({ unlocked, unlock, lock }),
    [unlocked, unlock, lock],
  );

  return (
    <AdminAccessContext.Provider value={value}>
      {children}
    </AdminAccessContext.Provider>
  );
}

export function useAdminAccess(): AdminAccessValue {
  const ctx = useContext(AdminAccessContext);
  if (!ctx) {
    throw new Error("useAdminAccess must be used within an AdminAccessProvider");
  }
  return ctx;
}
