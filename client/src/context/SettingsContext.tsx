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
  siteContent: Record<string, string>;
  theme: {
    accentColor: string;
  };
}

export const DEFAULT_SETTINGS: SiteSettings = {
  sections: { research: true, projects: true, publications: false },
  cv: { visible: false },
  siteContent: {
    aboutTitle: "About",
    aboutHeading: "Hello, I’m Aayush.",
    projectsTitle: "Selected Projects",
    projectsHeading: "Things I’ve built.",
    projectsDescription: "A selection of web and mobile projects from my software engineering work — the foundation I’m building my research on.",
    researchTitle: "Research",
    researchHeading: "What I am working on.",
    researchDescription: "Threads of work that share one goal: machine learning that stays reliable once it leaves the lab and reaches the field.",
    publicationsTitle: "Publications",
    publicationsHeading: "Selected publications.",
    publicationsDescription: "A selection of peer-reviewed and preprint work. See my Google Scholar for the full list.",
    contactTitle: "Contact",
    footerText: "© 2026 Aayush Shrestha. All rights reserved.",
  },
  theme: {
    accentColor: "#2d33a8",
  },
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

  // Inject theme variables
  useEffect(() => {
    if (settings.theme?.accentColor && settings.theme.accentColor !== "#2d33a8") {
      const color = settings.theme.accentColor;
      
      const styleId = "dynamic-theme-vars";
      let styleEl = document.getElementById(styleId);
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }
      
      styleEl.textContent = `
        :root {
          --color-brand-base: ${color};
          --color-brand-50: color-mix(in oklab, var(--color-brand-base) 10%, #fbfbf7);
          --color-brand-100: color-mix(in oklab, var(--color-brand-base) 20%, #fbfbf7);
          --color-brand-200: color-mix(in oklab, var(--color-brand-base) 30%, #fbfbf7);
          --color-brand-300: color-mix(in oklab, var(--color-brand-base) 50%, #fbfbf7);
          --color-brand-400: color-mix(in oklab, var(--color-brand-base) 70%, #fbfbf7);
          --color-brand-500: color-mix(in oklab, var(--color-brand-base) 85%, #fbfbf7);
          --color-brand-600: var(--color-brand-base);
          --color-brand-700: color-mix(in oklab, var(--color-brand-base) 85%, black);
          --color-brand-800: color-mix(in oklab, var(--color-brand-base) 70%, black);
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --color-brand-50: color-mix(in oklab, var(--color-brand-base) 15%, #0f0f0d);
            --color-brand-100: color-mix(in oklab, var(--color-brand-base) 25%, #0f0f0d);
            --color-brand-200: color-mix(in oklab, var(--color-brand-base) 40%, #0f0f0d);
            --color-brand-300: color-mix(in oklab, var(--color-brand-base) 60%, #0f0f0d);
            --color-brand-400: color-mix(in oklab, var(--color-brand-base) 80%, white);
            --color-brand-500: color-mix(in oklab, var(--color-brand-base) 65%, white);
            --color-brand-600: color-mix(in oklab, var(--color-brand-base) 50%, white);
            --color-brand-700: color-mix(in oklab, var(--color-brand-base) 40%, white);
            --color-brand-800: color-mix(in oklab, var(--color-brand-base) 30%, white);
          }
        }
      `;
    } else {
      const styleEl = document.getElementById("dynamic-theme-vars");
      if (styleEl) styleEl.remove();
      document.documentElement.style.removeProperty('--color-brand-base');
    }
  }, [settings.theme?.accentColor]);

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
