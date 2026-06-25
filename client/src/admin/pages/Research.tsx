import { useResearch, type ResearchItem } from "@/hooks/useResearch";
import JsonEditor from "../components/JsonEditor";
import { api } from "@/lib/api";

export default function ResearchAdmin() {
  const { data, loading, refetch } = useResearch();

  const handleSave = async (newData: ResearchItem[]) => {
    await api.put("/research", newData);
    await refetch();
  };

  return (
    <JsonEditor<ResearchItem[]>
      title="Research"
      description="Manage your research themes and focus areas."
      data={data || []}
      loading={loading}
      onSave={handleSave}
    />
  );
}
