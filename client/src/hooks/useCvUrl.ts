import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";

export function useCvUrl() {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUrl = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<string | null>("/cv/url");
      if (res) {
        setUrl(import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace('/api', '')}${res}` : `http://localhost:8787${res}`);
      } else {
        setUrl(null);
      }
    } catch (err) {
      console.error("Failed to fetch CV url", err);
      setUrl(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUrl();
  }, [fetchUrl]);

  return { url, loading, refetch: fetchUrl };
}
