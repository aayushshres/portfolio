import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";

export interface Social {
  id: string;
  label: string;
  href: string;
  visible: boolean;
}

export function useSocials(all = false) {
  const [data, setData] = useState<Social[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSocials = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<Social[]>("/socials");
      setData(all ? res : res.filter(s => s.visible));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch socials"));
    } finally {
      setLoading(false);
    }
  }, [all]);

  useEffect(() => {
    fetchSocials();
  }, [fetchSocials]);

  return { data, loading, error, refetch: fetchSocials };
}
