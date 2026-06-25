import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import { DEFAULT_RESEARCH } from "@/data/defaults";

export interface ResearchItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  published: boolean;
}

export function useResearch(all = false) {
  const [data, setData] = useState<ResearchItem[]>(DEFAULT_RESEARCH.filter(r => all || r.published));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchResearch = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<ResearchItem[]>("/research");
      setData(all ? res : res.filter(r => r.published));
      setError(null);
    } catch (err) {
      // Keep default data on failure — the site still renders.
      setError(err instanceof Error ? err : new Error("Failed to fetch research"));
    } finally {
      setLoading(false);
    }
  }, [all]);

  useEffect(() => {
    fetchResearch();
  }, [fetchResearch]);

  return { data, loading, error, refetch: fetchResearch };
}
