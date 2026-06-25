import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import { DEFAULT_PROFILE } from "@/data/defaults";

export interface Profile {
  name: string;
  role: string;
  affiliation: string;
  location: string;
  email: string;
  headline: string;
  tagline: string;
  bio: string[];
  interests: string[];
  avatar: string;
}

export function useProfile() {
  const [data, setData] = useState<Profile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<Profile>("/profile");
      setData(res);
      setError(null);
    } catch (err) {
      // Keep default data on failure — the site still renders.
      setError(err instanceof Error ? err : new Error("Failed to fetch profile"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { data, loading, error, refetch: fetchProfile };
}
