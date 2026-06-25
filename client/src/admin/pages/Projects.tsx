import { useProjects, type Project } from "@/hooks/useProjects";
import JsonEditor from "../components/JsonEditor";
import { api } from "@/lib/api";

export default function ProjectsAdmin() {
  const { data, loading, refetch } = useProjects();

  const handleSave = async (newData: Project[]) => {
    await api.put("/projects", newData);
    await refetch();
  };

  return (
    <JsonEditor<Project[]>
      title="Projects"
      description="Manage your software projects portfolio."
      data={data || []}
      loading={loading}
      onSave={handleSave}
    />
  );
}
