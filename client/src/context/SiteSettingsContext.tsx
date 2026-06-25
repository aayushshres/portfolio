// DEPRECATED: Replaced by SettingsContext.tsx using API data.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "site-settings";

/** Toggleable public sections. Keys match nav/section flags. */
export type SectionKey = "research" | "projects" | "publications";

export interface SiteSettings {
  sections: Record<SectionKey, boolean>;
}

// Defaults: early-career researcher with a strong software background — projects
// and research on, publications off until there's something to show.
export const DEFAULT_SETTINGS: SiteSettings = {
  sections: {
    research: true,
    projects: true,
    publications: false,
  },
};

function loadSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<SiteSettings>;
    return {
      sections: { ...DEFAULT_SETTINGS.sections, ...parsed.sections },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

interface SiteSettingsValue {
  settings: SiteSettings;
  toggleSection: (key: SectionKey) => void;
  setSection: (key: SectionKey, value: boolean) => void;
}

const SiteSettingsContext = createContext<SiteSettingsValue | null>(null);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(loadSettings);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Keep multiple tabs (e.g. admin in one, public in another) in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setSettings(loadSettings());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setSection = useCallback((key: SectionKey, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      sections: { ...prev.sections, [key]: value },
    }));
  }, []);

  const toggleSection = useCallback((key: SectionKey) => {
    setSettings((prev) => ({
      ...prev,
      sections: { ...prev.sections, [key]: !prev.sections[key] },
    }));
  }, []);

  const value = useMemo(
    () => ({ settings, toggleSection, setSection }),
    [settings, toggleSection, setSection],
  );

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): SiteSettingsValue {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) {
    throw new Error("useSiteSettings must be used within a SiteSettingsProvider");
  }
  return ctx;
}
