import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import { DEFAULT_CONTACT } from "@/data/defaults";

export interface ContactInfo {
  contactHeading: string;
  contactDescription: string;
}

export function useContact() {
  const [data, setData] = useState<ContactInfo>(DEFAULT_CONTACT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchContact = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<ContactInfo>("/contact");
      setData(res);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch contact info"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContact();
  }, [fetchContact]);

  return { data, loading, error, refetch: fetchContact };
}
