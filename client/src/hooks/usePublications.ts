import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import { DEFAULT_PUBLICATIONS } from "@/data/defaults";

export interface PublicationItem {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: number;
  url?: string;
  abstract?: string;
  published: boolean;
}

export function usePublications(all = false) {
  const [data, setData] = useState<PublicationItem[]>(DEFAULT_PUBLICATIONS.filter(p => all || p.published));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPublications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<PublicationItem[]>("/publications");
      setData(all ? res : res.filter(p => p.published));
      setError(null);
    } catch (err) {
      // Keep default data on failure — the site still renders.
      setError(err instanceof Error ? err : new Error("Failed to fetch publications"));
    } finally {
      setLoading(false);
    }
  }, [all]);

  useEffect(() => {
    fetchPublications();
  }, [fetchPublications]);

  return { data, loading, error, refetch: fetchPublications };
}
