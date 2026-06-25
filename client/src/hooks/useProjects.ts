import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";

export interface Project {
  id: string;
  title: string;
  description: string;
  imgSrc: string;
  tags: string[];
  projectLink: string;
  repoLink?: string;
  order: number;
  published: boolean;
}

export function useProjects(all = false) {
  const [data, setData] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<Project[]>("/projects");
      setData(all ? res : res.filter(p => p.published));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch projects"));
    } finally {
      setLoading(false);
    }
  }, [all]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { data, loading, error, refetch: fetchProjects };
}
