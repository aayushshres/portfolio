import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import { api } from "../lib/api";

export type SectionKey = "research" | "projects" | "publications";

export interface SiteSettings {
  sections: Record<SectionKey, boolean>;
  cv: { visible: boolean };
}

export const DEFAULT_SETTINGS: SiteSettings = {
  sections: { research: true, projects: true, publications: false },
  cv: { visible: false },
};

interface SettingsContextValue {
  settings: SiteSettings;
  loading: boolean;
  setSettings: (newSettings: SiteSettings) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await api.get<SiteSettings>("/settings");
      setSettingsState(data);
    } catch (err) {
      console.error("Failed to fetch settings", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Poll for updates from the server every 30s so other tabs stay in sync
  useEffect(() => {
    const interval = setInterval(fetchSettings, 30000);
    return () => clearInterval(interval);
  }, [fetchSettings]);

  const value = useMemo(
    () => ({
      settings,
      loading,
      setSettings: setSettingsState,
    }),
    [settings, loading]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSiteSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSiteSettings must be used within a SettingsProvider");
  }
  return ctx;
}
